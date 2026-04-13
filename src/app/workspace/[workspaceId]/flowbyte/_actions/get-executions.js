'use server'
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function getExecutions({ workspaceId, workflowId } = {}) {
    const session = await getSession()
    const userId = session?.data?.id
    if (!userId) return []

    const where = {}
    if (workflowId) {
        where.workflowId = workflowId
    } else if (workspaceId) {
        where.workflow = {
            workspaceId
        }
    }

    const executions = await db.workflowExecution.findMany({
        where,
        include: {
            workflow: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            startedAt: 'desc'
        },
        take: 100
    })

    return executions.map(ex => ({
        id: ex.id,
        workflow: ex.workflow.name,
        status: ex.status.toLowerCase(),
        startedAt: ex.startedAt,
        finishedAt: ex.finishedAt,
        duration: ex.finishedAt ? `${Math.floor((new Date(ex.finishedAt).getTime() - new Date(ex.startedAt).getTime()) / 1000)}s` : '—',
        nodes: Array.isArray(ex.nodes) ? ex.nodes.length : 0,
        executedNodes: Array.isArray(ex.logs) ? ex.logs.length : 0, // Approximate
        errorMessage: ex.status === 'ERROR' ? 'Execution failed' : null,
        mode: 'manual',
        nodeExecutions: ex.logs || []
    }))
}
