'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";


const DeleteWorkflow = z.object({
    userId: z.string(),
    orgId: z.optional(z.string()),
    workflowId: z.string(),
});

const handler = async (data) => {


    const { userId, orgId, workflowId } = data;
    let workflow

    //console.log('Delete workflow', data)

    try {

        workflow = await db.workflow.delete({
            where: {
                id: workflowId,
                userId
            }
        })

    } catch (error) {
        console.log(error)
        return {
            error: "Failed to delete workflow"
        }
    }

    revalidatePath(`/workspace/${orgId}/workflow`)
    return { data: workflow };

}


export const deleteWorkflow = createSafeAction(DeleteWorkflow, handler);