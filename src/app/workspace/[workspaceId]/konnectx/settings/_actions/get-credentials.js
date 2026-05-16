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
            let accessToken = '';
            let googlePlaceId = '';
            let defaultTemplateId = '';
            
            const stored = cred.credentials;
            if (stored) {
                let decrypted = null;
                if (typeof stored === 'string' && stored.includes(':')) {
                    try {
                        decrypted = JSON.parse(symmetricDecrypt(stored));
                    } catch (e) { }
                } else if (typeof stored === 'object' && stored.enc && typeof stored.enc === 'string' && stored.enc.includes(':')) {
                    try {
                        decrypted = JSON.parse(symmetricDecrypt(stored.enc));
                    } catch (e) { }
                }

                if (decrypted) {
                    phoneNumberId = decrypted.phoneNumberId || decrypted.phone_number_id;
                    wabaId = decrypted.wabaId || decrypted.waba_id;
                    accessToken = decrypted.accessToken || decrypted.system_access_token || decrypted.token;
                    googlePlaceId = decrypted.googlePlaceId || '';
                    defaultTemplateId = decrypted.defaultTemplateId || '';
                }
            }

            return {
                ...JSON.parse(JSON.stringify(cred)),
                phoneNumberId,
                wabaId,
                accessToken,
                googlePlaceId,
                defaultTemplateId
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
