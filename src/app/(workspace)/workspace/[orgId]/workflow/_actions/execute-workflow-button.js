'use server'

import { db } from "@/lib/db"
import { workflowexecutions } from "googleapis/build/src/apis/workflowexecutions"
import { TaskRegistry } from "../lib/tasks/registry"
import { ExecutionPhaseStatus, ExecutionStatus, ExecutionStatusTrigger } from "../types/types"
import { redirect } from "next/navigation"
import { ExecuteWorkflow } from "./executeWorkflow"
import { FlowToExecutionPlan } from "./executionPlan"
import { WORKFLOWSTATUS } from "@prisma/client"

export async function HandleExecuteWorkflow({ workflowId, userId, flowDefination, orgId }) {

    //console.log('@HandleExecuteWorkflow', 'execute-workflow-button')

    let workflow

    if (!userId) {
        throw new Error('Unauthorized')
    }

    if (!workflowId) {
        throw new Error('Workflow Id is required')
    }


    workflow = await db.workflow.findUnique({
        where: {
            userId,
            id: workflowId
        }
    })



    if (!workflow) {
        throw new Error('Workflow not found')
    }

    let executionPlan;
    let workflowDefination = flowDefination

    if (workflow.status === WORKFLOWSTATUS.PUBLISHED) {
        if (!workflow.executionPlan) {
            throw new Error('no execution plan found in published workflow')
        }

        executionPlan = JSON.parse(workflow.executionPlan)
        workflowDefination = workflow.flowDefination

    } else {
        if (!flowDefination) {
            throw new Error('Flowdefination is not defined')
        }

        const flow = JSON.parse(flowDefination)
        const result = FlowToExecutionPlan(flow.nodes, flow.edges)

        //console.log(result)

        if (result.error) {
            throw new Error('Invalid flow defination')
        }

        if (!result.executionPlan) {
            throw new Error('No execution plan generated')
        }

        executionPlan = result.executionPlan
    }

    //console.log('@Workflow mutation server action', { '@workflowId': workflowId }, { '@userId': userId }, { '@flowDefination': flowDefination }, { '@result': result })
    //console.log('@executionPlan', executionPlan)

    const execution = await db.workflowExecution.create({
        data: {
            workflowId,
            userId,
            status: ExecutionStatus.PENDING,
            startedAt: new Date(),
            trigger: ExecutionStatusTrigger.MANUAL,
            definition: workflowDefination,
            phases: {
                create: executionPlan.flatMap((phase) => {
                    return phase.nodes.flatMap((node) => {
                        return {
                            userId,
                            status: ExecutionPhaseStatus.CREATED,
                            number: phase.phase,
                            node: JSON.stringify(node),
                            name: TaskRegistry[node.data.type].label
                        }
                    })
                })
            }
        },
        select: {
            id: true,
            phases: true
        }
    })




    if (!execution) {
        throw new Error("Workflow execution not created")
    }

    ExecuteWorkflow(execution.id, userId, orgId, workflowId)

    redirect(`/workspace/${orgId}/workflow/${workflowId}/run/${execution.id}`)
    return ({ workflow, executionPlan })
}