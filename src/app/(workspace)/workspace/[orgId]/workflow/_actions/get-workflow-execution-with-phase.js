'use server'

import { db } from "@/lib/db"

export async function GetWorkflowExecutionWithPhase(executionId) {



    const workflowExecutionss = await db.workflowExecution.findUnique({
        where: {
            id: executionId
        },
        include: {
            phases: {
                orderBy: {
                    number: "asc"
                }
            }
        }
    })


    return workflowExecutionss
}