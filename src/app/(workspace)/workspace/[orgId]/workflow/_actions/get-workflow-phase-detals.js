'use server'

import { db } from "@/lib/db"

export async function GetWorkflowPhaseDetails(phaseId, userId) {

    //console.log('@phaseId', phaseId, '@userId', userId)

    const result = await db.workflowExecutionPhase.findUnique({
        where: {
            id: phaseId,
            execution: {
                userId
            }
        },
        include: {
            workflowExecutionLogs: {
                orderBy: {
                    createdAt: 'asc'
                }
            }
        }
    })

    //console.log('@result', result)

    return result
}