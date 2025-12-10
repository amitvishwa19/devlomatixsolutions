'use server'

import { db } from "@/lib/db"
import { WORKFLOWSTATUS } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { WaitFor } from "../_lib/waitFor"

export async function UpdateWorkflow({ userId, workflowId, defination, orgId }) {

    let workflow

    try {
        //WaitFor(3000)
        workflow = await db.workflow.findUnique({
            where: {
                id: workflowId
            }
        })

        if (!workflow) {
            throw new Error('Workflow not found')
        }

        if (workflow.status !== WORKFLOWSTATUS.DRAFT) {
            throw new Error('Workflow is not in draft mode')
        }

        workflow = await db.workflow.update({
            where: {
                id: workflowId, userId
            },
            data: {
                defination
            }
        })

        revalidatePath(`/workspace/${orgId}/workflow/${workflowId}`)
        return { workflow };

    } catch (error) {
        console.log(error)
        return {
            error: "Failed to save workflow"
        }
    }
}