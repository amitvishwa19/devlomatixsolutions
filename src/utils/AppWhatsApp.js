import { db } from '@/lib/db';
import { symmetricDecrypt } from '@/lib/encryption';
import { sendTemplateMessage } from '@/app/workspace/[workspaceId]/konnectx/_lib/whatsapp-cloud-api';

/**
 * Safely decrypts a stored credential string or object
 */
function safelyDecryptCredentials(stored) {
    if (!stored) return null;
    let parsed = null;

    if (typeof stored === 'string') {
        if (stored.includes(':')) {
            try {
                parsed = JSON.parse(symmetricDecrypt(stored));
            } catch (e) {
                console.warn('[AppWhatsApp] Failed to decrypt ciphertext string:', e.message);
            }
        } else {
            try {
                parsed = JSON.parse(stored);
            } catch (e) { }
        }
    } else if (typeof stored === 'object') {
        parsed = { ...stored };
    }

    if (parsed?.enc && typeof parsed.enc === 'string' && parsed.enc.includes(':')) {
        try {
            parsed = JSON.parse(symmetricDecrypt(parsed.enc));
        } catch (e) {
            console.warn('[AppWhatsApp] Failed to decrypt .enc payload:', e.message);
        }
    }

    if (!parsed) return null;

    let accessToken = parsed.accessToken || parsed.system_access_token || parsed.token || '';
    if (typeof accessToken === 'string' && accessToken.includes(':')) {
        try {
            accessToken = symmetricDecrypt(accessToken);
        } catch (e) {
            console.warn('[AppWhatsApp] Failed to decrypt nested accessToken:', e.message);
        }
    }

    const phoneNumberId = parsed.phoneNumberId || parsed.phone_number_id || '';
    const wabaId = parsed.wabaId || parsed.waba_id || '';
    const apiVersion = parsed.apiVersion || parsed.version || 'v22.0';

    return {
        ...parsed,
        accessToken: typeof accessToken === 'string' ? accessToken.trim() : accessToken,
        phoneNumberId: typeof phoneNumberId === 'string' ? phoneNumberId.trim() : String(phoneNumberId || ''),
        wabaId: typeof wabaId === 'string' ? wabaId.trim() : String(wabaId || ''),
        version: apiVersion
    };
}

/**
 * Sends a job application confirmation WhatsApp message using the Global WhatsApp Account.
 *
 * @param {Object} params
 * @param {string} params.phone - Candidate's phone number
 * @param {string} params.name - Candidate's full name
 * @param {string} params.jobTitle - Applied job title
 * @param {string} [params.companyName] - Company or Brand name
 * @param {string} [params.templateName='new_job_application'] - Meta template name
 * @param {string} [params.workspaceId] - Optional workspace ID for fallback
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function sendJobApplicationWhatsApp({
    phone,
    name,
    jobTitle,
    companyName = 'Devlomatix',
    templateName = 'new_job_application',
    workspaceId = null
}) {
    try {
        if (!phone || String(phone).trim() === '') {
            console.warn('[sendJobApplicationWhatsApp] Missing phone number.');
            return { success: false, error: 'Phone number is required' };
        }

        // 1. Clean and normalize phone number
        let cleanPhone = String(phone).replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) {
            cleanPhone = cleanPhone.replace(/^0+/, '');
        }
        if (cleanPhone.length === 10) {
            cleanPhone = `91${cleanPhone}`;
        }

        if (cleanPhone.length < 10) {
            console.warn('[sendJobApplicationWhatsApp] Invalid normalized phone number:', cleanPhone);
            return { success: false, error: 'Invalid phone number' };
        }

        // 2. Fetch HireFlow App Settings (strictly key: 'hireflow') and Global App Settings (key: 'global')
        const hireflowSettings = await db.appSettings.findUnique({
            where: { key: 'hireflow' }
        }).catch(() => null);

        const hfIntegrations = (typeof hireflowSettings?.integrations === 'object' && hireflowSettings?.integrations !== null)
            ? hireflowSettings.integrations
            : {};

        const globalSettings = await db.appSettings.findUnique({
            where: { key: 'global' },
            select: { integrations: true, social: true, general: true }
        }).catch(() => null);

        const glIntegrations = (typeof globalSettings?.integrations === 'object' && globalSettings?.integrations !== null)
            ? globalSettings.integrations
            : {};

        const defaultCredentialId =
            hfIntegrations?.whatsapp?.credentialId ||
            hfIntegrations?.whatsappDefault?.credentialId ||
            glIntegrations?.whatsappDefault?.credentialId ||
            glIntegrations?.whatsappSettings?.credentialId ||
            glIntegrations?.whatsappSettings?.accountId ||
            glIntegrations?.whatsapp?.credentialId ||
            null;

        let credential = null;
        let cloudCredentials = null;

        // A. Resolve by linked credential ID from hireflow or global appSettings
        if (defaultCredentialId) {
            credential = await db.credentials.findUnique({
                where: { id: defaultCredentialId }
            }).catch(() => null);
        }

        // B. Resolve directly from inline integration config if present
        if (!credential && (hfIntegrations?.whatsapp?.accessToken || hfIntegrations?.whatsappDefault?.accessToken || glIntegrations?.whatsappDefault?.accessToken || glIntegrations?.whatsapp?.accessToken)) {
            const inlineObj = hfIntegrations?.whatsapp || hfIntegrations?.whatsappDefault || glIntegrations?.whatsappDefault || glIntegrations?.whatsapp;
            cloudCredentials = safelyDecryptCredentials(inlineObj);
        }

        // C. Fallback to workspace appSettings if provided
        if (!credential && !cloudCredentials && workspaceId) {
            const wsSettings = await db.appSettings.findUnique({
                where: { key: workspaceId },
                select: { integrations: true }
            }).catch(() => null);

            const wsDefaultId = wsSettings?.integrations?.whatsappDefault?.credentialId ||
                wsSettings?.integrations?.whatsappSettings?.credentialId ||
                wsSettings?.integrations?.whatsapp?.credentialId;

            if (wsDefaultId) {
                credential = await db.credentials.findUnique({
                    where: { id: wsDefaultId }
                }).catch(() => null);
            }
        }

        // D. Fallback to default WHATSAPP_CLOUD credential in database
        if (!credential && !cloudCredentials) {
            credential = await db.credentials.findFirst({
                where: { platform: 'WHATSAPP_CLOUD', isDefault: true }
            }).catch(() => null);
        }

        // E. Fallback to most recently updated WHATSAPP_CLOUD credential
        if (!credential && !cloudCredentials) {
            credential = await db.credentials.findFirst({
                where: { platform: 'WHATSAPP_CLOUD' },
                orderBy: { updatedAt: 'desc' }
            }).catch(() => null);
        }

        if (credential && !cloudCredentials) {
            cloudCredentials = safelyDecryptCredentials(credential.credentials);
        }

        if (!cloudCredentials || !cloudCredentials.accessToken || !cloudCredentials.phoneNumberId) {
            console.error('[sendJobApplicationWhatsApp] No active WhatsApp Cloud credential configured with accessToken and phoneNumberId.');
            return { success: false, error: 'No active WhatsApp Cloud credential configured' };
        }

        const metaApiCredentials = {
            accessToken: cloudCredentials.accessToken,
            phoneNumberId: cloudCredentials.phoneNumberId,
            wabaId: cloudCredentials.wabaId || undefined,
            version: cloudCredentials.version || 'v22.0'
        };

        // 3. Resolve Template & Parameters
        const appName = companyName || globalSettings?.social?.appName || globalSettings?.general?.appName || 'Devlomatix';
        const candidateName = (name && String(name).trim()) ? String(name).trim() : 'Applicant';

        const templateRecord = await db.messageTemplate.findFirst({
            where: {
                OR: [
                    { name: templateName },
                    { templateName: templateName }
                ]
            }
        }).catch(() => null);

        const languageCode = templateRecord?.language || 'en_US';
        const components = [
            {
                type: 'body',
                parameters: [
                    { type: 'text', text: candidateName }
                ]
            }
        ];

        console.log(`[sendJobApplicationWhatsApp] Dispatching template "${templateName}" (${languageCode}) to ${cleanPhone} via PhoneID ${metaApiCredentials.phoneNumberId}...`);

        let result = await sendTemplateMessage(
            metaApiCredentials,
            cleanPhone,
            templateName,
            languageCode,
            components
        );

        // Fallback 1: Retry with no parameters if parameter structure didn't match
        if (!result?.success && components.length > 0) {
            console.warn(`[sendJobApplicationWhatsApp] Retrying without body parameters due to error:`, result?.error);
            result = await sendTemplateMessage(
                metaApiCredentials,
                cleanPhone,
                templateName,
                languageCode,
                []
            );
        }

        // Fallback 2: Try alternate 'job_application' template if 'new_job_application' wasn't matched
        if (!result?.success && templateName === 'new_job_application') {
            console.warn(`[sendJobApplicationWhatsApp] Retrying with fallback template "job_application"...`);
            result = await sendTemplateMessage(
                metaApiCredentials,
                cleanPhone,
                'job_application',
                'en_US',
                []
            );
        }

        // 4. Log Message in Database
        try {
            let targetUserId = credential?.userId;
            if (!targetUserId) {
                const fallbackUser = await db.user.findFirst({
                    select: { id: true }
                }).catch(() => null);
                targetUserId = fallbackUser?.id;
            }

            if (targetUserId) {
                const waMessageId = result?.data?.messages?.[0]?.id || `wa_apply_${Date.now()}`;
                const formattedJid = `${cleanPhone}@s.whatsapp.net`;

                await db.whatsAppMessage.create({
                    data: {
                        userId: targetUserId,
                        waId: waMessageId,
                        jid: formattedJid,
                        text: `[Template: ${templateName}] Job application received for ${jobTitle}`,
                        fromMe: true,
                        timestamp: BigInt(Math.floor(Date.now() / 1000)),
                        status: result?.success ? 'SENT' : 'FAILED',
                        metadata: {
                            type: 'template',
                            templateName: templateName,
                            candidateName: candidateName || name,
                            jobTitle: jobTitle,
                            companyName: appName,
                            components: components,
                            originalPayload: {
                                template: {
                                    name: templateName,
                                    components: components
                                }
                            },
                            phone_number_id: String(metaApiCredentials.phoneNumberId),
                            apiResponse: result?.data || result?.error || null
                        }
                    }
                }).catch(err => console.error('[sendJobApplicationWhatsApp] DB logging error:', err?.message || err));
            }
        } catch (logErr) {
            console.error('[sendJobApplicationWhatsApp] Logging wrapper error:', logErr);
        }

        if (result?.success) {
            console.log(`[sendJobApplicationWhatsApp] Message sent successfully to ${cleanPhone}. Message ID:`, result?.data?.messages?.[0]?.id);
        } else {
            console.error(`[sendJobApplicationWhatsApp] Message delivery failed:`, result?.error);
        }

        return result;

    } catch (error) {
        console.error('[sendJobApplicationWhatsApp] Unexpected error:', error);
        return { success: false, error: error.message || 'Internal WhatsApp Error' };
    }
}
