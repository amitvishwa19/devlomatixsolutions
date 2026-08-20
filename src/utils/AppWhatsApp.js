import { db } from '@/lib/db';
import { symmetricDecrypt } from '@/lib/encryption';
import { sendTemplateMessage } from '@/app/workspace/[workspaceId]/konnectx/_lib/whatsapp-cloud-api';

/**
 * Sends a job application confirmation WhatsApp message using the Global WhatsApp Account.
 * Completely independent of workspaceId.
 *
 * @param {Object} params
 * @param {string} params.phone - Candidate's phone number
 * @param {string} params.name - Candidate's full name
 * @param {string} params.jobTitle - Applied job title
 * @param {string} [params.companyName] - Company or Brand name
 * @param {string} [params.templateName='new_job_application'] - Meta template name
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function sendJobApplicationWhatsApp({
    phone,
    name,
    jobTitle,
    companyName = 'Devlomatix',
    templateName = 'new_job_application'
}) {
    try {
        if (!phone || String(phone).trim() === '') {
            return { success: false, error: 'Phone number is required' };
        }

        // Clean and normalize phone number
        let cleanPhone = String(phone).replace(/\D/g, '');
        if (cleanPhone.length === 10) {
            cleanPhone = `91${cleanPhone}`;
        }

        // 1. Fetch Global App Settings (strictly key: 'global')
        const globalSettings = await db.appSettings.findUnique({
            where: { key: 'global' },
            select: { integrations: true, social: true, general: true }
        }).catch(() => null);

        const defaultCredentialId = globalSettings?.integrations?.whatsappDefault?.credentialId;

        // 2. Fetch Active Credential
        let credential = null;
        if (defaultCredentialId) {
            credential = await db.credentials.findUnique({
                where: { id: defaultCredentialId }
            }).catch(() => null);
        }

        if (!credential) {
            credential = await db.credentials.findFirst({
                where: { platform: 'WHATSAPP_CLOUD', isDefault: true }
            }).catch(() => null);
        }

        if (!credential) {
            credential = await db.credentials.findFirst({
                where: { platform: 'WHATSAPP_CLOUD' },
                orderBy: { updatedAt: 'desc' }
            }).catch(() => null);
        }

        if (!credential || !credential.credentials) {
            console.error('[sendJobApplicationWhatsApp] No active WhatsApp Cloud credential configured.');
            return { success: false, error: 'WhatsApp credential not found' };
        }

        // 3. Decrypt credentials
        let cloudCredentials = null;
        const stored = credential.credentials;
        if (typeof stored === 'string' && stored.includes(':')) {
            try { cloudCredentials = JSON.parse(symmetricDecrypt(stored)); } catch (e) { }
        } else if (typeof stored === 'string') {
            try { cloudCredentials = JSON.parse(stored); } catch (e) { }
        } else {
            cloudCredentials = stored;
        }

        if (cloudCredentials?.enc) {
            try { cloudCredentials = JSON.parse(symmetricDecrypt(cloudCredentials.enc)); } catch (e) { }
        }

        if (!cloudCredentials?.accessToken || !cloudCredentials?.phoneNumberId) {
            console.error('[sendJobApplicationWhatsApp] Incomplete WhatsApp credentials.');
            return { success: false, error: 'Incomplete WhatsApp credentials' };
        }

        // 4. Resolve Template & Parameters
        const appName = companyName || globalSettings?.social?.appName || globalSettings?.general?.appName || 'Devlomatix';

        const templateRecord = await db.messageTemplate.findFirst({
            where: {
                OR: [
                    { name: templateName },
                    { templateName: templateName }
                ]
            }
        }).catch(() => null);

        const candidateName = (name && String(name).trim()) ? String(name).trim() : 'Applicant';

        const components = [
            {
                type: 'body',
                parameters: [
                    { type: 'text', text: candidateName }
                ]
            }
        ];

        const languageCode = templateRecord?.language || 'en_US';

        console.log(`[sendJobApplicationWhatsApp] Dispatching template "${templateName}" to ${cleanPhone}...`);

        let result = await sendTemplateMessage(
            cloudCredentials,
            cleanPhone,
            templateName,
            languageCode,
            components
        );

        // Fallback retry with no components if parameter count mismatch
        if (!result?.success && components.length > 0) {
            console.log(`[sendJobApplicationWhatsApp] Retrying without body parameters...`);
            result = await sendTemplateMessage(
                cloudCredentials,
                cleanPhone,
                templateName,
                languageCode,
                []
            );
        }

        // 5. Log Message in Database
        const waMessageId = result?.data?.messages?.[0]?.id || `wa_apply_${Date.now()}`;
        const formattedJid = `${cleanPhone}@s.whatsapp.net`;

        await db.whatsAppMessage.create({
            data: {
                userId: credential.userId,
                waId: waMessageId,
                jid: formattedJid,
                text: `[Template: ${templateName}] Job application received for ${jobTitle}`,
                fromMe: true,
                timestamp: BigInt(Math.floor(Date.now() / 1000)),
                status: result?.success ? 'SENT' : 'FAILED',
                metadata: {
                    type: 'template',
                    templateName: templateName,
                    candidateName: name,
                    jobTitle: jobTitle,
                    companyName: appName,
                    phone_number_id: String(cloudCredentials.phoneNumberId),
                    apiResponse: result?.data || result?.error || null
                }
            }
        }).catch(err => console.error('[sendJobApplicationWhatsApp] DB logging error:', err));

        return result;

    } catch (error) {
        console.error('[sendJobApplicationWhatsApp] Error:', error);
        return { success: false, error: error.message };
    }
}
