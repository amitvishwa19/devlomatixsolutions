'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { WORKFLOWSTATUS } from "@prisma/client";


const SaveWorkflow = z.object({
    userId: z.string(),
    orgId: z.optional(z.string()),
    workflowId: z.string(),
    defination: z.string(),
});

const handler = async (data) => {

    //console.log('@@save workflow', data.defination)


    const { userId, orgId, workflowId, defination } = data;
    let workflow



    try {

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


    } catch (error) {
        console.log(error)
        return {
            error: "Failed to save workflow"
        }
    }

    revalidatePath(`/workspace/${orgId}/workflow/${workflowId}`)
    return { data: workflow };

}


export const saveWorkflow = createSafeAction(SaveWorkflow, handler);