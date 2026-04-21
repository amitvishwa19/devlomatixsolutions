'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetCredentialsSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const credentials = await db.credentials.findMany({
            where: {
                userId,
                platform: {
                    in: ['WHATSAPP', 'WHATSAPP_CLOUD']
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return { 
            data: {
                success: true, 
                credentials: JSON.parse(JSON.stringify(credentials))
            } 
        };
    } catch (error) {
        return { error: error.message || "Failed to fetch credentials" };
    }
};

export const getCredentials = createSafeAction(GetCredentialsSchema, handler);
