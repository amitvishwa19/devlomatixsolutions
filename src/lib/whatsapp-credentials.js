import { db } from '@/lib/db';
import { symmetricDecrypt } from '@/lib/encryption';
import { getWhatsappDefault } from '@/lib/whatsapp-default';

/**
 * Safely unpacks and decrypts stored WhatsApp Cloud credentials.
 * Handles encrypted strings, nested JSON, { enc: ... } wrappers, and token property variants.
 */
export function safelyDecryptCredentials(stored) {
    if (!stored) return null;
    let parsed = null;

    if (typeof stored === 'string') {
        if (stored.includes(':')) {
            try {
                parsed = JSON.parse(symmetricDecrypt(stored));
            } catch (e) {
                try {
                    parsed = JSON.parse(stored);
                } catch (_) {}
            }
        } else {
            try {
                parsed = JSON.parse(stored);
            } catch (_) {}
        }
    } else if (typeof stored === 'object') {
        parsed = { ...stored };
    }

    if (parsed?.enc && typeof parsed.enc === 'string' && parsed.enc.includes(':')) {
        try {
            const inner = JSON.parse(symmetricDecrypt(parsed.enc));
            parsed = { ...parsed, ...inner };
        } catch (e) {
            console.warn('[safelyDecryptCredentials] Failed to decrypt .enc payload:', e.message);
        }
    }

    if (!parsed || typeof parsed !== 'object') return null;

    let accessToken = parsed.accessToken || parsed.access_token || parsed.system_access_token || parsed.token || '';
    if (typeof accessToken === 'string' && accessToken.includes(':')) {
        try {
            accessToken = symmetricDecrypt(accessToken);
        } catch (e) {
            console.warn('[safelyDecryptCredentials] Failed to decrypt nested accessToken:', e.message);
        }
    }

    const phoneNumberId = parsed.phoneNumberId || parsed.phone_number_id || parsed.phoneId || parsed.phoneNumber || '';
    const wabaId = parsed.wabaId || parsed.waba_id || parsed.whatsapp_business_account_id || parsed.businessAccountId || '';
    const apiVersion = parsed.apiVersion || parsed.version || process.env.FACEBOOK_API_VERSION || 'v25.0';

    return {
        ...parsed,
        accessToken: typeof accessToken === 'string' ? accessToken.trim() : accessToken,
        phoneNumberId: typeof phoneNumberId === 'string' ? phoneNumberId.trim() : String(phoneNumberId || ''),
        wabaId: typeof wabaId === 'string' ? wabaId.trim() : String(wabaId || ''),
        version: apiVersion
    };
}

/**
 * Resolves active WhatsApp Cloud credentials for a workspace and user.
 * Tries user active default -> workspace default -> workspace settings -> member defaults -> latest fallback -> appSettings.
 */
export async function resolveWhatsAppCredentials({ workspaceId, userId, credentialId } = {}) {
    let credential = null;
    let cloudCredentials = null;

    // 1. Explicit ID
    if (credentialId) {
        credential = await db.credentials.findUnique({
            where: { id: credentialId }
        }).catch(() => null);
        if (credential) {
            cloudCredentials = safelyDecryptCredentials(credential.credentials);
            if (cloudCredentials?.accessToken) {
                return { credential, credentials: cloudCredentials };
            }
        }
    }

    // Resolve workspace member IDs for shared workspace access
    let workspaceUserIds = [];
    if (workspaceId) {
        const workspace = await db.server.findUnique({
            where: { id: workspaceId },
            include: { members: true }
        }).catch(() => null);

        workspaceUserIds = [
            ...new Set([
                userId,
                workspace?.userId,
                ...((workspace?.members || []).map(m => m.userId))
            ].filter(Boolean))
        ];
    } else if (userId) {
        workspaceUserIds = [userId];
    }

    // 2. User explicit default
    if (userId) {
        credential = await db.credentials.findFirst({
            where: { userId, platform: 'WHATSAPP_CLOUD', isDefault: true }
        }).catch(() => null);
        if (credential) {
            cloudCredentials = safelyDecryptCredentials(credential.credentials);
            if (cloudCredentials?.accessToken) {
                return { credential, credentials: cloudCredentials };
            }
        }
    }

    // 3. Workspace explicit default
    if (workspaceId) {
        credential = await db.credentials.findFirst({
            where: { workspaceId, platform: 'WHATSAPP_CLOUD', isDefault: true }
        }).catch(() => null);
        if (credential) {
            cloudCredentials = safelyDecryptCredentials(credential.credentials);
            if (cloudCredentials?.accessToken) {
                return { credential, credentials: cloudCredentials };
            }
        }

        // 4. Default from workspace / global AppSettings
        const defaultInfo = await getWhatsappDefault(workspaceId).catch(() => null);
        if (defaultInfo?.credentialId) {
            credential = await db.credentials.findUnique({
                where: { id: defaultInfo.credentialId }
            }).catch(() => null);
            if (credential) {
                cloudCredentials = safelyDecryptCredentials(credential.credentials);
                if (cloudCredentials?.accessToken) {
                    return { credential, credentials: cloudCredentials };
                }
            }
        }
    }

    // 5. Any workspace member's default
    if (workspaceUserIds.length > 0) {
        credential = await db.credentials.findFirst({
            where: { userId: { in: workspaceUserIds }, platform: 'WHATSAPP_CLOUD', isDefault: true }
        }).catch(() => null);
        if (credential) {
            cloudCredentials = safelyDecryptCredentials(credential.credentials);
            if (cloudCredentials?.accessToken) {
                return { credential, credentials: cloudCredentials };
            }
        }
    }

    // 6. Most recently updated credential for workspace or members
    if (workspaceUserIds.length > 0 || workspaceId) {
        credential = await db.credentials.findFirst({
            where: {
                OR: [
                    ...(workspaceId ? [{ workspaceId, platform: 'WHATSAPP_CLOUD' }] : []),
                    ...(workspaceUserIds.length > 0 ? [{ userId: { in: workspaceUserIds }, platform: 'WHATSAPP_CLOUD' }] : [])
                ]
            },
            orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }]
        }).catch(() => null);
        if (credential) {
            cloudCredentials = safelyDecryptCredentials(credential.credentials);
            if (cloudCredentials?.accessToken) {
                return { credential, credentials: cloudCredentials };
            }
        }
    }

    // 7. Global fallback: Most recent WHATSAPP_CLOUD credential in DB
    credential = await db.credentials.findFirst({
        where: { platform: 'WHATSAPP_CLOUD' },
        orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }]
    }).catch(() => null);
    if (credential) {
        cloudCredentials = safelyDecryptCredentials(credential.credentials);
        if (cloudCredentials?.accessToken) {
            return { credential, credentials: cloudCredentials };
        }
    }

    // 8. Fallback to AppSettings inline integration config
    if (workspaceId) {
        const wsSettings = await db.appSettings.findUnique({
            where: { key: workspaceId },
            select: { integrations: true }
        }).catch(() => null);
        const inline = wsSettings?.integrations?.whatsappDefault || wsSettings?.integrations?.whatsapp;
        if (inline) {
            cloudCredentials = safelyDecryptCredentials(inline);
            if (cloudCredentials?.accessToken) {
                return { credential: null, credentials: cloudCredentials };
            }
        }
    }

    const glSettings = await db.appSettings.findUnique({
        where: { key: 'global' },
        select: { integrations: true }
    }).catch(() => null);
    const glInline = glSettings?.integrations?.whatsappDefault || glSettings?.integrations?.whatsapp;
    if (glInline) {
        cloudCredentials = safelyDecryptCredentials(glInline);
        if (cloudCredentials?.accessToken) {
            return { credential: null, credentials: cloudCredentials };
        }
    }

    return { credential: null, credentials: null };
}
