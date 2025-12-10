'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { CreateFlowNode } from "../lib/tasks/CreateFlowNode";


const CreateWorkflow = z.object({
    userId: z.string(),
    orgId: z.optional(z.string()),
    name: z.string(),
    description: z.string().optional(),
});

const handler = async (data) => {


    const { userId, orgId, name, description } = data;
    let workflow



    try {

        const initialFlow = { nodes: [], edges: [] }
        initialFlow.nodes.push(CreateFlowNode('LAUNCH_BROWSER', { x: 0, y: 0 }))



        workflow = await db.workflow.create({
            data: {
                userId, name,
                description,
                status: 'DRAFT',
                defination: JSON.stringify(initialFlow)
            }
        })


    } catch (error) {
        console.log(error)
        return {
            error: "Failed to create workflow"
        }
    }

    //revalidatePath(`/org//${server.id}`)
    return { data: workflow };

}


export const createWorkflow = createSafeAction(CreateWorkflow, handler);