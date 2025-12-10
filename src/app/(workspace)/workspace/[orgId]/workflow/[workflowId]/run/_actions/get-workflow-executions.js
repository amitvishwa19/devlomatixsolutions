'use server'

import { db } from "@/lib/db"
import { orderBy } from "lodash"

export async function GetWorkflowExecutions(workflowId) {

    if (!workflowId) {
        throw new Error('No workflowId defined')
    }

    const result = await db.workflowExecution.findMany({
        where: { workflowId },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return result
}