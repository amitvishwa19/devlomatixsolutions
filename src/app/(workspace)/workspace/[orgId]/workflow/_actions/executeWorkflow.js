import { db } from '@/lib/db'
import { workflowexecutions } from 'googleapis/build/src/apis/workflowexecutions'
import { revalidatePath } from 'next/cache'
import 'server-only'
import { ExecutionPhaseStatus, TaskParamTypes, TaskType } from '../types/types'
import { TaskRegistry } from '../lib/tasks/registry'
import { WaitFor } from '../_lib/waitFor'
import { ExecutorRegistry } from '../lib/executors/registry'
import { createLogCollector } from '../_lib/log'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import { getServerSession } from 'next-auth'

export async function ExecuteWorkflow(executionId, userId, orgId, workflowId, nextRun) {

    const execution = await db.WorkflowExecution.findUnique({
        where: { id: executionId },
        include: { workflow: true, phases: true }
    })

    if (!execution) {
        throw new Error('Execution not found')
    }

    const edges = JSON.parse(execution.definition).edges

    const enviorment = { phases: {} }

    await initializeWorkflowExecution(executionId, execution.workflowId, nextRun)
    await initializePhaseStatuses(execution)


    let creditConsumed = 0
    let executionFailed = false

    for (const phase of execution.phases) {

        const logCollector = createLogCollector()
        const phaseExecution = await executeWorkflowPhase(
            phase,
            enviorment,
            edges,
            userId
        )

        creditConsumed += phaseExecution.creditConsumed

        if (!phaseExecution.success) {
            executionFailed = true
            break
        }


    }

    await finalizeWorkflowExecution(executionId, execution.workflowId, executionFailed, creditConsumed)
    await cleanupEnviorment(enviorment)

    revalidatePath(`/workspace/${orgId}/workflow/${workflowId}/run/${executionId}`)
}

async function initializeWorkflowExecution(executionId, workflowId, nextRun) {

    //console.log('@initializeWorkflowExecution')

    await db.WorkflowExecution.update({
        where: { id: executionId },
        data: {
            startedAt: new Date(),
            status: ExecutionPhaseStatus.RUNNING
        }
    })

    await db.workflow.update({
        where: { id: workflowId },
        data: {
            lastRunAt: new Date(),
            lastRunStatus: ExecutionPhaseStatus.RUNNING,
            lastRunId: executionId,
            ...(nextRun && { nextRun })
        }
    })
}

async function initializePhaseStatuses(execution) {

    //console.log('@initializePhaseStatuses', execution)


    await db.workflowExecutionPhase.updateMany({
        where: {
            id: {
                in: execution.phases.map((phase) => phase.id)
            }
        },
        data: {
            status: ExecutionPhaseStatus.PENDING
        }
    })
}

async function finalizeWorkflowExecution(executionId, workflowId, executionFailed, creditConsumed) {

    //console.log('@finalizeWorkflowExecution ---executionFailed', executionFailed)

    const finalStatus = executionFailed ? ExecutionPhaseStatus.FAILED : ExecutionPhaseStatus.COMPLETED

    await db.WorkflowExecution.update({
        where: {
            id: executionId
        },
        data: {
            status: finalStatus,
            completedAt: new Date(),
            creditConsumed
        }
    })

    await db.workflow.update({
        where: {
            id: workflowId,
            lastRunId: executionId
        },
        data: {
            lastRunStatus: finalStatus
        }
    }).catch((err) => {
        console.error('Error updating workflow status', err)
    })
}

async function executeWorkflowPhase(phase, enviorment, edges, userId) {



    //console.log('@@executeWorkflowPhase', phase)
    const startedAt = new Date()
    const node = JSON.parse(phase.node)
    const logCollector = createLogCollector()

    setupEnviormentForPhase(node, enviorment, edges)

    await db.workflowExecutionPhase.update({
        where: {
            id: phase.id
        },
        data: {
            status: ExecutionPhaseStatus.RUNNING,
            startedAt,
            inputs: JSON.stringify(enviorment.phases[node.id].inputs)
        }
    })

    const creditRequired = TaskRegistry[node.data.type].credits
    //console.log(`Executing phase ${phase.name} with ${creditRequired} credit required`)

    let success = await decrementCredits(userId, creditRequired, logCollector)
    const creditConsumed = success ? creditRequired : 0

    if (success) {
        success = await executePhase(phase, node, enviorment, logCollector)
    }

    //console.log('@@---executeWorkflowPhase---success', success)
    //WaitFor(2000)
    //const success = Math.random() < 2
    //const success = await executePhase(phase, node, enviorment, logCollector)

    const outputs = enviorment.phases[node.id].outputs
    await fiinalizePhase(phase.id, success, outputs, logCollector, creditConsumed)
    return { success, creditConsumed }
}

async function fiinalizePhase(phaseId, success, outputs, logCollector, creditConsumed) {
    const finalStatus = success ? ExecutionPhaseStatus.COMPLETED : ExecutionPhaseStatus.FAILED
    //console.log('@logCollector.getAll()', logCollector.getAll())
    await db.workflowExecutionPhase.update({
        where: {
            id: phaseId
        },
        data: {
            status: finalStatus,
            completedAt: new Date(),
            outputs: JSON.stringify(outputs),
            creditConsumed,
            workflowExecutionLogs: {
                createMany: {
                    data: logCollector.getAll().map(log => (
                        {
                            message: log.message,
                            timestamp: log.timestamp,
                            logLevel: log.level
                        }
                    ))
                }
            }
        }
    })
}

async function executePhase(phase, node, enviorment, logCollector) {

    //await WaitFor(2000)
    const runFn = ExecutorRegistry[node.data.type]
    if (!runFn) {
        logCollector.error(`Executor not found for ${node.data.type}`)
        return false
    }

    const executionEnviorment = await createExecutionEnviorment(node, enviorment, logCollector)
    //console.log('@@createExecutionEnviorment', executionEnviorment)


    //return await runFn(enviorment.phases[node.id])

    return await runFn(executionEnviorment)
}

async function setupEnviormentForPhase(node, enviorment, edges) {

    enviorment.phases[node.id] = { inputs: {}, outputs: {} }

    const inputs = TaskRegistry[node.data.type].inputs

    for (const input of inputs) {

        if (inputs.type === TaskParamTypes.BROWSER_INSTANCE) continue

        const inputValue = node.data.inputs[input.name]
        if (inputValue) {
            enviorment.phases[node.id].inputs[input.name] = inputValue
            continue
        }

        const connectedEdge = edges.find((edge) => edge.target === node.id && edge.targetHandle === input.name)
        if (!connectedEdge) {
            console.error('Missing or no edge found for input', input.name, node.id)
        }

        const outputValue = enviorment.phases[connectedEdge.source].outputs[connectedEdge.sourceHandle]
        enviorment.phases[node.id].inputs[input.name] = outputValue
    }
}

async function createExecutionEnviorment(node, enviorment, logCollector) {

    return {
        getInput: (name) => enviorment.phases[node.id]?.inputs[name],
        setOutput: (name, value) => { enviorment.phases[node.id].outputs[name] = value },

        getBrowser: () => enviorment.browser,
        setBrowser: (browser) => (enviorment.browser = browser),

        getPage: () => enviorment.page,
        setPage: (page) => (enviorment.page = page),

        log: logCollector
    }
}

async function cleanupEnviorment(enviorment) {
    if (enviorment) {
        await enviorment.browser.close().catch(err => console.log('@@@Enviorment cleanup failed, browser not close'))
    }
}

async function decrementCredits(userId, amount, logCollector) {

    try {
        await db.userBalance.update({
            where: { userId, credits: { gte: amount } },
            data: { credits: { decrement: amount } },
        })
        return true
    } catch (error) {
        console.log('Error while calculating credits')
        logCollector.error('Insufficient Credit balance')
        return false
    }
}