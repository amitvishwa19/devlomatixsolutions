'use server';

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { ensureWorkspaceAccess, checkIsSuperAdmin } from "@/lib/auth-utils";
import { symmetricEncrypt, symmetricDecrypt } from "@/lib/encryption";
import { revalidatePath } from "next/cache";

/**
 * Helper to get current authenticated user
 */
async function getAuthenticatedUser(workspaceId) {
    const session = await ensureWorkspaceAccess(workspaceId);
    const userId = session?.user?.userId || session?.user?.id;
    if (!userId) {
        throw new Error("Unauthorized");
    }
    return { session, userId };
}

/**
 * Helper to encrypt credential payload
 */
function encryptCredentials(data) {
    try {
        const encrypted = symmetricEncrypt(JSON.stringify(data));
        return { enc: encrypted };
    } catch (e) {
        return data;
    }
}

/**
 * Helper to decrypt credential payload
 */
function decryptCredentials(stored) {
    try {
        if (!stored) return {};
        if (typeof stored === 'string') {
            if (stored.includes(':')) {
                return JSON.parse(symmetricDecrypt(stored));
            }
            return JSON.parse(stored);
        }
        if (typeof stored === 'object') {
            if (stored.enc && typeof stored.enc === 'string' && stored.enc.includes(':')) {
                return JSON.parse(symmetricDecrypt(stored.enc));
            }
            return stored;
        }
        return {};
    } catch (e) {
        console.error("[decryptCredentials] Error:", e);
        return {};
    }
}

/**
 * Fetch all WhatsApp Cloud API accounts and current default settings
 */
export async function getWhatsAppCloudSettingsAction(workspaceId) {
    try {
        await getAuthenticatedUser(workspaceId);

        // 1. Fetch all WHATSAPP_CLOUD credentials for this workspace or global
        const credentialsList = await db.credentials.findMany({
            where: {
                workspaceId,
                platform: 'WHATSAPP_CLOUD'
            },
            orderBy: [
                { isDefault: 'desc' },
                { updatedAt: 'desc' }
            ]
        });

        // 2. Format and safely decrypt credentials
        const accounts = credentialsList.map(cred => {
            const decrypted = decryptCredentials(cred.credentials);
            const token = decrypted.accessToken || '';
            const maskedToken = token.length > 8 
                ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` 
                : (token ? '••••••••' : '');

            return {
                id: cred.id,
                profileName: cred.profile || decrypted.profileName || 'WhatsApp Cloud Account',
                phoneNumberId: decrypted.phoneNumberId || decrypted.phone_number_id || '',
                wabaId: decrypted.wabaId || decrypted.waba_id || '',
                apiVersion: decrypted.apiVersion || 'v22.0',
                maskedToken,
                hasToken: !!token,
                status: cred.status || 'connected',
                isDefault: !!cred.isDefault,
                createdAt: cred.createdAt,
                updatedAt: cred.updatedAt,
                userInfo: cred.userInfo || null
            };
        });

        // 3. Fetch workspace settings default
        const wsSettings = await db.appSettings.findUnique({
            where: { key: workspaceId },
            select: { integrations: true }
        }).catch(() => null);

        // 4. Fetch global settings default
        const globalSettings = await db.appSettings.findUnique({
            where: { key: 'global' },
            select: { integrations: true }
        }).catch(() => null);

        const wsDefault = wsSettings?.integrations?.whatsappDefault || null;
        const globalDefault = globalSettings?.integrations?.whatsappDefault || null;

        return {
            success: true,
            data: {
                accounts,
                workspaceDefault: wsDefault,
                globalDefault: globalDefault,
                webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || process.env.META_WEBHOOK_VERIFY_TOKEN || 'devlomatix_whatsapp_verify_token'
            }
        };
    } catch (error) {
        console.error("[GET_WHATSAPP_CLOUD_SETTINGS_ERROR]", error);
        return { success: false, error: error.message || "Failed to load WhatsApp Cloud settings" };
    }
}

/**
 * Save / Update WhatsApp Cloud Account
 */
export async function saveWhatsAppCloudAccountAction(workspaceId, accountData) {
    try {
        const { session, userId } = await getAuthenticatedUser(workspaceId);
        const { id, profileName, phoneNumberId, wabaId, accessToken, apiVersion, setAsDefault, makeGlobalDefault } = accountData;

        if (!phoneNumberId || !wabaId) {
            return { success: false, error: "Phone Number ID and WABA ID are required" };
        }

        // If updating without a new token, preserve the old decrypted token
        let tokenToSave = accessToken;
        if (id && (!tokenToSave || tokenToSave.includes('•'))) {
            const existing = await db.credentials.findUnique({ where: { id } });
            if (existing) {
                const oldDecrypted = decryptCredentials(existing.credentials);
                tokenToSave = oldDecrypted.accessToken || '';
            }
        }

        if (!tokenToSave) {
            return { success: false, error: "Permanent Access Token is required" };
        }

        const credPayload = {
            profileName: profileName || 'WhatsApp Cloud Account',
            phoneNumberId: phoneNumberId.trim(),
            wabaId: wabaId.trim(),
            accessToken: tokenToSave.trim(),
            apiVersion: apiVersion || 'v22.0'
        };

        const encrypted = encryptCredentials(credPayload);

        let credential;
        if (id && id !== 'new') {
            credential = await db.credentials.update({
                where: { id },
                data: {
                    profile: profileName || 'WhatsApp Cloud Account',
                    credentials: encrypted,
                    status: 'connected',
                    updatedAt: new Date()
                }
            });
        } else {
            // If it's the first account or setAsDefault is true
            const existingCount = await db.credentials.count({
                where: { workspaceId, platform: 'WHATSAPP_CLOUD' }
            });

            const shouldBeDefault = setAsDefault || existingCount === 0;

            if (shouldBeDefault) {
                await db.credentials.updateMany({
                    where: { workspaceId, platform: 'WHATSAPP_CLOUD' },
                    data: { isDefault: false }
                });
            }

            credential = await db.credentials.create({
                data: {
                    platform: 'WHATSAPP_CLOUD',
                    userId,
                    workspaceId,
                    profile: profileName || 'WhatsApp Cloud Account',
                    type: 'other',
                    status: 'connected',
                    isDefault: shouldBeDefault,
                    credentials: encrypted
                }
            });
        }

        // If marked as default, sync to AppSettings
        if (setAsDefault || credential.isDefault) {
            await syncDefaultToAppSettings(workspaceId, credential.id, credPayload, makeGlobalDefault, session, userId);
        }

        revalidatePath(`/workspace/${workspaceId}/system`);
        return { success: true, data: credential };
    } catch (error) {
        console.error("[SAVE_WHATSAPP_CLOUD_ACCOUNT_ERROR]", error);
        return { success: false, error: error.message || "Failed to save WhatsApp Cloud account" };
    }
}

/**
 * Set an account as the Workspace & Global Default
 */
export async function setDefaultWhatsAppCloudAction(workspaceId, credentialId, makeGlobalDefault = true) {
    try {
        const { session, userId } = await getAuthenticatedUser(workspaceId);

        // 1. Unset all defaults for this workspace
        await db.credentials.updateMany({
            where: { workspaceId, platform: 'WHATSAPP_CLOUD' },
            data: { isDefault: false }
        });

        // 2. Set this one as default
        const credential = await db.credentials.update({
            where: { id: credentialId },
            data: { isDefault: true }
        });

        const decrypted = decryptCredentials(credential.credentials);
        const payload = {
            profileName: credential.profile || decrypted.profileName || '',
            phoneNumberId: decrypted.phoneNumberId || '',
            wabaId: decrypted.wabaId || ''
        };

        // 3. Sync to AppSettings
        await syncDefaultToAppSettings(workspaceId, credential.id, payload, makeGlobalDefault, session, userId);

        revalidatePath(`/workspace/${workspaceId}/system`);
        return { success: true, message: "Default WhatsApp Cloud account updated successfully" };
    } catch (error) {
        console.error("[SET_DEFAULT_WHATSAPP_CLOUD_ERROR]", error);
        return { success: false, error: error.message || "Failed to set default WhatsApp account" };
    }
}

/**
 * Helper to sync default to AppSettings
 */
async function syncDefaultToAppSettings(workspaceId, credentialId, credPayload, makeGlobal, session, userId) {
    const defaultInfo = {
        credentialId,
        profile: credPayload.profileName || '',
        phoneNumberId: credPayload.phoneNumberId || '',
        wabaId: credPayload.wabaId || '',
        updatedAt: new Date().toISOString()
    };

    // 1. Workspace AppSettings
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
                whatsappDefault: defaultInfo
            }
        },
        update: {
            integrations: {
                ...wsIntegrations,
                whatsappDefault: defaultInfo
            }
        }
    });

    // 2. Global AppSettings
    const isSuperAdmin = await checkIsSuperAdmin(session, userId);
    if (makeGlobal || isSuperAdmin) {
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
                    whatsappDefault: defaultInfo
                }
            },
            update: {
                integrations: {
                    ...glIntegrations,
                    whatsappDefault: defaultInfo
                }
            }
        });
    }
}

/**
 * Delete WhatsApp Cloud Account
 */
export async function deleteWhatsAppCloudAccountAction(workspaceId, credentialId) {
    try {
        await getAuthenticatedUser(workspaceId);

        const target = await db.credentials.findUnique({ where: { id: credentialId } });
        if (!target) {
            return { success: false, error: "Credential not found" };
        }

        const wasDefault = target.isDefault;

        await db.credentials.delete({
            where: { id: credentialId }
        });

        // If it was default, promote another account if available
        if (wasDefault) {
            const nextAccount = await db.credentials.findFirst({
                where: { workspaceId, platform: 'WHATSAPP_CLOUD' },
                orderBy: { updatedAt: 'desc' }
            });

            if (nextAccount) {
                await db.credentials.update({
                    where: { id: nextAccount.id },
                    data: { isDefault: true }
                });
            }
        }

        revalidatePath(`/workspace/${workspaceId}/system`);
        return { success: true, message: "Account removed successfully" };
    } catch (error) {
        console.error("[DELETE_WHATSAPP_CLOUD_ACCOUNT_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete WhatsApp account" };
    }
}

/**
 * Test WhatsApp Cloud Connection directly with Meta Graph API
 */
export async function testWhatsAppCloudConnectionAction(workspaceId, { phoneNumberId, accessToken, wabaId, apiVersion = 'v22.0' }) {
    try {
        await getAuthenticatedUser(workspaceId);

        if (!phoneNumberId || !accessToken) {
            return { success: false, error: "Phone Number ID and Access Token are required" };
        }

        const cleanPhoneId = phoneNumberId.trim();
        const cleanToken = accessToken.trim();
        const version = apiVersion.trim() || 'v22.0';

        // 1. Fetch Phone Number details from Meta
        const phoneUrl = `https://graph.facebook.com/${version}/${cleanPhoneId}?fields=verified_name,code_verification_status,display_phone_number,quality_rating,name_status,messaging_limit_tier`;
        
        const response = await fetch(phoneUrl, {
            headers: {
                'Authorization': `Bearer ${cleanToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.error) {
            return {
                success: false,
                error: data.error.message || "Meta API authentication failed",
                details: data.error
            };
        }

        return {
            success: true,
            data: {
                verifiedName: data.verified_name || 'N/A',
                displayPhoneNumber: data.display_phone_number || 'N/A',
                qualityRating: data.quality_rating || 'UNKNOWN',
                verificationStatus: data.code_verification_status || 'VERIFIED',
                messagingLimitTier: data.messaging_limit_tier || 'TIER_STANDARD'
            }
        };
    } catch (error) {
        console.error("[TEST_WHATSAPP_CLOUD_CONNECTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to test WhatsApp connection" };
    }
}

/**
 * Send a Live Test WhatsApp message
 */
export async function sendTestWhatsAppMessageAction(workspaceId, { phoneNumberId, accessToken, recipientPhone, message, apiVersion = 'v22.0' }) {
    try {
        await getAuthenticatedUser(workspaceId);

        if (!phoneNumberId || !accessToken || !recipientPhone) {
            return { success: false, error: "Phone Number ID, Access Token, and Recipient Phone are required" };
        }

        const cleanRecipient = recipientPhone.replace(/[^\d]/g, '');
        const version = apiVersion.trim() || 'v22.0';

        const sendUrl = `https://graph.facebook.com/${version}/${phoneNumberId.trim()}/messages`;

        const body = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: cleanRecipient,
            type: "text",
            text: {
                preview_url: false,
                body: message || "🔔 This is a live test message from your Devlomatix WhatsApp Cloud API integration."
            }
        };

        const res = await fetch(sendUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.trim()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const resData = await res.json();

        if (resData.error) {
            return {
                success: false,
                error: resData.error.message || "Failed to deliver WhatsApp message",
                details: resData.error
            };
        }

        return {
            success: true,
            data: {
                messageId: resData.messages?.[0]?.id,
                status: 'SENT'
            }
        };
    } catch (error) {
        console.error("[SEND_TEST_WHATSAPP_MESSAGE_ERROR]", error);
        return { success: false, error: error.message || "Failed to send test message" };
    }
}
