'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { put } from '@vercel/blob'

const PrivacyPolicy = z.object({
    userId: z.string(),
    serverId: z.string(),
    privacy: z.string().optional(),
    type: z.string()
});

const handler = async (data) => {
    const { serverId, privacy, type } = data;
    let privacypolicy

    try {

        privacypolicy = await db.server.update({
            where: {
                id: serverId
            },
            data: {
                privacy
            }
        })



    } catch (error) {
        console.log(error)
        return {
            error: "Failed to copy the list."
        }
    }

    //revalidatePath(`/org//${orgId}`)
    return { data: { privacypolicy } };

}

export const privacyPolicy = createSafeAction(PrivacyPolicy, handler);

