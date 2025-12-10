'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { put } from '@vercel/blob'

const TermsCondition = z.object({
    userId: z.string(),
    serverId: z.string(),
    terms: z.string().optional(),
    type: z.string()
});

const handler = async (data) => {
    const { serverId, terms, type } = data;
    let term

    try {

        term = await db.server.update({
            where: {
                id: serverId
            },
            data: {
                terms
            }
        })



    } catch (error) {
        console.log(error)
        return {
            error: "Failed to copy the list."
        }
    }

    //revalidatePath(`/org//${orgId}`)
    return { data: { term } };

}

export const termsCondition = createSafeAction(TermsCondition, handler);

