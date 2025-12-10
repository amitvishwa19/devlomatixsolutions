'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { orderBy } from "lodash";


const GetWorkflow = z.object({
    userId: z.string(),
    orgId: z.optional(z.string()),
});

const handler = async (data) => {


    const { userId, orgId } = data;
    let workflows



    try {
        workflows = await db.workflow.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        })


        //console.log(workflows)


    } catch (error) {
        console.log(error)
        return {
            error: "Failed to create workflow"
        }
    }

    //revalidatePath(`/org//${server.id}`)
    return { data: workflows };

}


export const getWorkflow = createSafeAction(GetWorkflow, handler);