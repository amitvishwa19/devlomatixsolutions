'use server'

import { db } from "@/lib/db"
import { WORKFLOWSTATUS } from "@prisma/client"
import { FlowToExecutionPlan } from "./executionPlan"
import { CalculateWOrkflowCost } from "../_lib/helpers"
import { revalidatePath } from "next/cache"

export async function UnpublishWorkflow({ userId, workflowId, orgId }) {



    if (!workflowId) {
        throw new Error('Workflow id not defined')
    }

    const workflow = await db.workflow.findUnique({
        where: { id: workflowId }
    })

    console.log('@@workflow', workflow)

    if (!workflow) {
        throw new Error('Workflow not found')
    }

    if (workflow.status === WORKFLOWSTATUS.DRAFT) {
        throw new Error('Workflow status not published')
    }


    await db.workflow.update({
        where: { id: workflowId, userId },
        data: {
            executionPlan: null,
            status: WORKFLOWSTATUS.DRAFT,
            creditCost: 0
        }
    })

    revalidatePath(`/workspace/${orgId}/workflow/${workflowId}`)
}