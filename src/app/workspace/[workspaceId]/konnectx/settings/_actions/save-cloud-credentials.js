'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess, checkIsSuperAdmin } from "@/lib/auth-utils";
import { symmetricEncrypt } from "@/lib/encryption";

const SaveCloudCredentialsSchema = z.object({
    workspaceId: z.string(),
    id: z.string().nullable().optional(),
    profile: z.string(),
    phoneNumberId: z.string(),
    wabaId: z.string(),
    accessToken: z.string().optional().nullable(),
    googlePlaceId: z.string().optional().nullable(),
    defaultTemplateId: z.string().optional().nullable(),
});

const handler = async (data) => {
    const { workspaceId, id, profile, phoneNumberId, wabaId, accessToken, googlePlaceId, defaultTemplateId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        let account;
        let finalEncrypted;

        if (id) {
            // Update existing record
            const oldAccount = await db.credentials.findUnique({ where: { id } });
            if (!oldAccount) return { error: "Account not found" };

            const oldCredsRaw = oldAccount.credentials;
            let oldDecrypted = null;

            if (typeof oldCredsRaw === 'string') {
                if (oldCredsRaw.includes(':')) {
                    try {
                        oldDecrypted = JSON.parse(symmetricDecrypt(oldCredsRaw));
                    } catch (e) {
                        console.error("[SaveCloudCredentials] Decryption failed:", e.message);
                    }
                } else {
                    try {
                        oldDecrypted = JSON.parse(oldCredsRaw);
                    } catch (e) { }
                }
            } else if (typeof oldCredsRaw === 'object' && oldCredsRaw !== null) {
                // Handle { enc: "..." } format or direct object format
                if (oldCredsRaw.enc && typeof oldCredsRaw.enc === 'string' && oldCredsRaw.enc.includes(':')) {
                    try {
                        oldDecrypted = JSON.parse(symmetricDecrypt(oldCredsRaw.enc));
                    } catch (e) {
                        console.error("[SaveCloudCredentials] Decryption of .enc failed:", e.message);
                    }
                } else {
                    oldDecrypted = oldCredsRaw;
                }
            }

            let finalAccessToken = accessToken;
            if (!finalAccessToken || String(finalAccessToken).trim() === '') {
                console.log("[SaveCloudCredentials] Access token is empty in request, attempting preservation...");
                if (oldDecrypted) {
                    console.log("[SaveCloudCredentials] Decrypted old credentials keys:", Object.keys(oldDecrypted));
                    // Try common keys for access tokens
                    const token = oldDecrypted.accessToken || oldDecrypted.system_access_token || oldDecrypted.token;
                    if (token) {
                        finalAccessToken = token;
                        console.log("[SaveCloudCredentials] Preserved existing token for account:", profile);
                    } else {
                        console.warn("[SaveCloudCredentials] No token found in old decrypted credentials!");
                    }
                } else {
                    console.error("[SaveCloudCredentials] oldDecrypted is null! Cannot preserve token.");
                }
            }

            const credObj = {
                accessToken: finalAccessToken,
                phoneNumberId: phoneNumberId || oldDecrypted?.phoneNumberId || oldDecrypted?.phone_number_id,
                wabaId: wabaId || oldDecrypted?.wabaId || oldDecrypted?.waba_id,
                googlePlaceId: googlePlaceId || oldDecrypted?.googlePlaceId,
                defaultTemplateId: defaultTemplateId || oldDecrypted?.defaultTemplateId
            };
            console.log("[SaveCloudCredentials] Final credential object prepared (has token:", !!credObj.accessToken, ")");
            finalEncrypted = symmetricEncrypt(JSON.stringify(credObj));

            account = await db.credentials.update({
                where: { id },
                data: {
                    profile,
                    credentials: { enc: finalEncrypted },
                    status: 'connected'
                }
            });
        } else {
            // Create new record
            const credObj = {
                accessToken,
                phoneNumberId,
                wabaId,
                googlePlaceId,
                defaultTemplateId
            };
            finalEncrypted = symmetricEncrypt(JSON.stringify(credObj));

            // Check if any other WHATSAPP_CLOUD credentials exist for this user
            const existingCreds = await db.credentials.findFirst({
                where: { userId, platform: 'WHATSAPP_CLOUD' }
            });

            account = await db.credentials.create({
                data: {
                    userId,
                    workspaceId,
                    platform: 'WHATSAPP_CLOUD',
                    profile,
                    credentials: { enc: finalEncrypted },
                    status: 'connected',
                    isDefault: !existingCreds // Set as default if it's the first one
                }
            });
        }

        // If this account is default, sync to AppSettings
        if (account.isDefault) {
            try {
                const defaultInfo = {
                    credentialId: account.id,
                    profile: profile || '',
                    phoneNumberId: phoneNumberId || '',
                    wabaId: wabaId || '',
                };

                // 1. Always save to workspace settings
                const existingWs = await db.appSettings.findUnique({ where: { key: workspaceId } }).catch(() => null);
                const wsIntegrations = (typeof existingWs?.integrations === 'object' && existingWs?.integrations !== null)
                    ? existingWs.integrations
                    : {};

                await db.appSettings.upsert({
                    where: { key: workspaceId },
                    create: {
                        key: workspaceId,
                        integrations: {
                            ...wsIntegrations,
                            whatsappDefault: defaultInfo,
                        },
                    },
                    update: {
                        integrations: {
                            ...wsIntegrations,
                            whatsappDefault: defaultInfo,
                        },
                    },
                });

                // 2. If super-admin, ALSO save to global settings
                const isSuperAdmin = await checkIsSuperAdmin(session, userId);
                if (isSuperAdmin) {
                    const existingGlobal = await db.appSettings.findUnique({ where: { key: 'global' } }).catch(() => null);
                    const glIntegrations = (typeof existingGlobal?.integrations === 'object' && existingGlobal?.integrations !== null)
                        ? existingGlobal.integrations
                        : {};

                    await db.appSettings.upsert({
                        where: { key: 'global' },
                        create: {
                            key: 'global',
                            integrations: {
                                ...glIntegrations,
                                whatsappDefault: defaultInfo,
                            },
                        },
                        update: {
                            integrations: {
                                ...glIntegrations,
                                whatsappDefault: defaultInfo,
                            },
                        },
                    });
                }
            } catch (syncErr) {
                console.error("[saveCloudCredentials] AppSettings sync error:", syncErr.message);
            }
        }

        return { success: true, accountId: account.id };
    } catch (error) {
        return { error: error.message || "Failed to save cloud credentials" };
    }
};

export const saveCloudCredentials = createSafeAction(SaveCloudCredentialsSchema, handler);
