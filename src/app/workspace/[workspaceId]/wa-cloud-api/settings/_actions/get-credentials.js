'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

import { symmetricDecrypt } from "@/lib/encryption";

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

        const processedCredentials = credentials.map(cred => {
            let phoneNumberId = '';
            let wabaId = '';
            
            if (cred.credentials && typeof cred.credentials === 'string' && cred.credentials.includes(':')) {
                try {
                    const decrypted = JSON.parse(symmetricDecrypt(cred.credentials));
                    phoneNumberId = decrypted.phoneNumberId;
                    wabaId = decrypted.wabaId;
                } catch (e) {
                    console.error("Failed to decrypt credentials for", cred.id);
                }
            }

            return {
                ...JSON.parse(JSON.stringify(cred)),
                phoneNumberId,
                wabaId
            };
        });

        return { 
            data: {
                success: true, 
                credentials: processedCredentials
            } 
        };
    } catch (error) {
        return { error: error.message || "Failed to fetch credentials" };
    }
};

export const getCredentials = createSafeAction(GetCredentialsSchema, handler);
