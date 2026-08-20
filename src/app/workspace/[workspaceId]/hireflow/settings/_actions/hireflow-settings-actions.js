'use server';

import { db } from "@/lib/db";
import { ensureWorkspaceAccess, checkIsSuperAdmin } from "@/lib/auth-utils";
import { symmetricDecrypt } from "@/lib/encryption";
import { sendJobApplicationWhatsApp } from "@/utils/AppWhatsApp";
import { setDefaultWhatsAppCloudAction } from "@/app/workspace/[workspaceId]/system/_actions/whatsapp-cloud-actions";
import { revalidatePath } from "next/cache";

/**
 * Helper to decrypt credential payload for display
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
        return {};
    }
}

/**
 * Fetch HireFlow settings, available WhatsApp senders, and templates
 */
export async function getHireflowSettingsAction(workspaceId) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session?.user?.userId || session?.user?.id;

        // 1. Fetch Key: 'hireflow' AppSettings (Primary Source)
        const hireflowSettingsRow = await db.appSettings.findUnique({
            where: { key: 'hireflow' }
        }).catch(() => null);

        // 2. Fetch Workspace & Global AppSettings (Fallback Source)
        const wsSettings = await db.appSettings.findUnique({
            where: { key: workspaceId }
        }).catch(() => null);

        const globalSettings = await db.appSettings.findUnique({
            where: { key: 'global' }
        }).catch(() => null);

        // 3. Fetch Workspace Server
        const workspaceServer = await db.server.findUnique({
            where: { id: workspaceId },
            select: { id: true, name: true, imageUrl: true }
        }).catch(() => null);

        // 4. Fetch all WHATSAPP_CLOUD credentials
        const credentialsList = await db.credentials.findMany({
            where: {
                platform: 'WHATSAPP_CLOUD',
                OR: [
                    { workspaceId },
                    { isDefault: true },
                    { userId }
                ]
            },
            orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }]
        }).catch(() => []);

        const accounts = credentialsList.map(cred => {
            const dec = decryptCredentials(cred.credentials);
            return {
                id: cred.id,
                profileName: cred.profile || dec.profileName || 'WhatsApp Account',
                phoneNumberId: dec.phoneNumberId || dec.phone_number_id || '',
                wabaId: dec.wabaId || dec.waba_id || '',
                isDefault: !!cred.isDefault,
                status: cred.status || 'connected'
            };
        });

        // 5. Fetch Message Templates for WhatsApp
        const templates = await db.messageTemplate.findMany({
            where: {
                status: 'APPROVED'
            },
            select: {
                id: true,
                name: true,
                templateName: true,
                language: true,
                category: true,
                type: true,
                body: true
            }
        }).catch(() => []);

        // 6. Resolve Merged Settings
        const hfGeneral = (typeof hireflowSettingsRow?.general === 'object' && hireflowSettingsRow?.general) ? hireflowSettingsRow.general : {};
        const hfIntegrations = (typeof hireflowSettingsRow?.integrations === 'object' && hireflowSettingsRow?.integrations) ? hireflowSettingsRow.integrations : {};
        const hfNotifications = (typeof hireflowSettingsRow?.notifications === 'object' && hireflowSettingsRow?.notifications) ? hireflowSettingsRow.notifications : {};
        const hfTechnical = (typeof hireflowSettingsRow?.technical === 'object' && hireflowSettingsRow?.technical) ? hireflowSettingsRow.technical : {};

        const glHireflow = (typeof globalSettings?.hireflow === 'object' && globalSettings?.hireflow)
            ? globalSettings.hireflow
            : (typeof globalSettings?.integrations?.hireflow === 'object' ? globalSettings.integrations.hireflow : {});

        const wsHireflow = (typeof wsSettings?.hireflow === 'object' && wsSettings?.hireflow)
            ? wsSettings.hireflow
            : (typeof wsSettings?.integrations?.hireflow === 'object' ? wsSettings.integrations.hireflow : {});

        const globalWaDefault = globalSettings?.integrations?.whatsappDefault;
        const wsWaDefault = wsSettings?.integrations?.whatsappDefault;

        const activeCredentialId =
            hfIntegrations?.whatsapp?.credentialId ||
            hfIntegrations?.whatsappDefault?.credentialId ||
            wsHireflow?.whatsapp?.credentialId ||
            glHireflow?.whatsapp?.credentialId ||
            wsWaDefault?.credentialId ||
            globalWaDefault?.credentialId ||
            accounts.find(a => a.isDefault)?.id ||
            accounts[0]?.id ||
            '';

        const mergedSettings = {
            whatsapp: {
                enabled: hfIntegrations?.whatsapp?.enabled ?? true,
                credentialId: activeCredentialId,
                templateName: hfIntegrations?.whatsapp?.templateName || wsHireflow?.whatsapp?.templateName || glHireflow?.whatsapp?.templateName || 'new_job_application',
                autoSendOnApplication: hfIntegrations?.whatsapp?.autoSendOnApplication ?? hfNotifications?.autoSendOnApplication ?? wsHireflow?.whatsapp?.autoSendOnApplication ?? glHireflow?.whatsapp?.autoSendOnApplication ?? true,
                autoSendOnInterview: hfIntegrations?.whatsapp?.autoSendOnInterview ?? hfNotifications?.autoSendOnInterview ?? wsHireflow?.whatsapp?.autoSendOnInterview ?? glHireflow?.whatsapp?.autoSendOnInterview ?? true,
                autoSendOnOffer: hfIntegrations?.whatsapp?.autoSendOnOffer ?? hfNotifications?.autoSendOnOffer ?? wsHireflow?.whatsapp?.autoSendOnOffer ?? glHireflow?.whatsapp?.autoSendOnOffer ?? false,
            },
            email: {
                enabled: hfIntegrations?.email?.enabled ?? true,
                senderName: hfIntegrations?.email?.senderName || wsHireflow?.email?.senderName || glHireflow?.email?.senderName || 'Devlomatix Careers',
                senderEmail: hfIntegrations?.email?.senderEmail || wsHireflow?.email?.senderEmail || glHireflow?.email?.senderEmail || process.env.RESEND_FROM_EMAIL || 'careers@devlomatix.com',
                adminNotificationEmail: hfIntegrations?.email?.adminNotificationEmail || wsHireflow?.email?.adminNotificationEmail || glHireflow?.email?.adminNotificationEmail || process.env.JOB_APPLICATION_MAIL || process.env.ADMIN_EMAIL || 'careers@devlomatix.com',
                candidateConfirmation: hfIntegrations?.email?.candidateConfirmation ?? hfNotifications?.candidateConfirmation ?? wsHireflow?.email?.candidateConfirmation ?? glHireflow?.email?.candidateConfirmation ?? true,
                adminAlert: hfIntegrations?.email?.adminAlert ?? hfNotifications?.adminAlert ?? wsHireflow?.email?.adminAlert ?? glHireflow?.email?.adminAlert ?? true,
            },
            careerPortal: {
                companyName: hfGeneral?.companyName || wsHireflow?.careerPortal?.companyName || workspaceServer?.name || globalSettings?.social?.appName || 'Devlomatix',
                portalTitle: hfGeneral?.portalTitle || wsHireflow?.careerPortal?.portalTitle || `Careers at ${workspaceServer?.name || 'Devlomatix'}`,
                portalSubtitle: hfGeneral?.portalSubtitle || wsHireflow?.careerPortal?.portalSubtitle || 'Join our high-performing team and build the future with us.',
                publicApplyUrl: hfGeneral?.publicApplyUrl || '/career',
                allowPublicApply: hfGeneral?.allowPublicApply ?? wsHireflow?.careerPortal?.allowPublicApply ?? true,
                requireResume: hfGeneral?.requireResume ?? wsHireflow?.careerPortal?.requireResume ?? true,
                autoPublishJobs: hfGeneral?.autoPublishJobs ?? wsHireflow?.careerPortal?.autoPublishJobs ?? true,
            },
            pipeline: {
                defaultStage: hfTechnical?.pipeline?.defaultStage || wsHireflow?.pipeline?.defaultStage || 'APPLIED',
                autoAdvanceOnInterview: hfTechnical?.pipeline?.autoAdvanceOnInterview ?? wsHireflow?.pipeline?.autoAdvanceOnInterview ?? true,
                scoringScale: hfTechnical?.pipeline?.scoringScale || wsHireflow?.pipeline?.scoringScale || '100',
                stages: hfTechnical?.pipeline?.stages || [
                    { id: 'APPLIED', label: 'Applied', color: 'blue' },
                    { id: 'SCREENING', label: 'Screening', color: 'purple' },
                    { id: 'INTERVIEW', label: 'Interview', color: 'amber' },
                    { id: 'OFFER', label: 'Offer Sent', color: 'emerald' },
                    { id: 'HIRED', label: 'Hired', color: 'green' },
                    { id: 'REJECTED', label: 'Rejected', color: 'rose' },
                ]
            },
            interview: {
                defaultDuration: hfTechnical?.interview?.defaultDuration || wsHireflow?.interview?.defaultDuration || 45,
                defaultPlatform: hfTechnical?.interview?.defaultPlatform || wsHireflow?.interview?.defaultPlatform || 'Google Meet',
                timezone: hfTechnical?.interview?.timezone || wsHireflow?.interview?.timezone || 'Asia/Kolkata',
                reminderHoursBefore: hfTechnical?.interview?.reminderHoursBefore || wsHireflow?.interview?.reminderHoursBefore || 24,
            }
        };

        return {
            success: true,
            data: {
                settings: mergedSettings,
                accounts,
                templates,
                workspace: workspaceServer,
                globalDefault: globalWaDefault
            }
        };
    } catch (error) {
        console.error("[GET_HIREFLOW_SETTINGS_ERROR]", error);
        return { success: false, error: error.message || "Failed to load HireFlow settings" };
    }
}

/**
 * Update active WhatsApp Account and/or Template directly into AppSettings (key: 'hireflow')
 */
export async function updateHireflowWhatsAppAction(workspaceId, { credentialId, templateName, setAsGlobalDefault = false }) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session?.user?.userId || session?.user?.id;

        // 1. Fetch current hireflow row from AppSettings
        let hireflowRow = await db.appSettings.findUnique({
            where: { key: 'hireflow' }
        }).catch(() => null);

        let currentGeneral = (typeof hireflowRow?.general === 'object' && hireflowRow?.general) ? hireflowRow.general : {};
        let currentNotifications = (typeof hireflowRow?.notifications === 'object' && hireflowRow?.notifications) ? hireflowRow.notifications : {};
        let currentIntegrations = (typeof hireflowRow?.integrations === 'object' && hireflowRow?.integrations) ? hireflowRow.integrations : {};
        let currentTechnical = (typeof hireflowRow?.technical === 'object' && hireflowRow?.technical) ? hireflowRow.technical : {};

        let currentWa = (typeof currentIntegrations.whatsapp === 'object' && currentIntegrations.whatsapp) ? currentIntegrations.whatsapp : {};
        let currentEmail = (typeof currentIntegrations.email === 'object' && currentIntegrations.email) ? currentIntegrations.email : {};

        // 2. Resolve Credential info
        const targetCredId = credentialId || currentWa.credentialId || currentIntegrations.whatsappDefault?.credentialId;
        let selectedAcc = null;

        if (targetCredId) {
            const cred = await db.credentials.findUnique({
                where: { id: targetCredId }
            }).catch(() => null);

            if (cred) {
                const dec = decryptCredentials(cred.credentials);
                selectedAcc = {
                    credentialId: cred.id,
                    profile: cred.profile || dec.profileName || 'WhatsApp Account',
                    phoneNumberId: dec.phoneNumberId || dec.phone_number_id || '',
                    wabaId: dec.wabaId || dec.waba_id || '',
                    templateName: templateName || currentWa.templateName || 'new_job_application',
                    updatedAt: new Date().toISOString()
                };
            }
        }

        const effectiveTemplate = templateName || currentWa.templateName || 'new_job_application';

        const updatedWa = {
            ...currentWa,
            enabled: true,
            credentialId: targetCredId || '',
            profileName: selectedAcc?.profile || currentWa.profileName || '',
            phoneNumberId: selectedAcc?.phoneNumberId || currentWa.phoneNumberId || '',
            wabaId: selectedAcc?.wabaId || currentWa.wabaId || '',
            templateName: effectiveTemplate
        };

        const updatedWaDefault = selectedAcc ? {
            ...selectedAcc,
            templateName: effectiveTemplate
        } : (currentIntegrations.whatsappDefault ? {
            ...currentIntegrations.whatsappDefault,
            templateName: effectiveTemplate,
            updatedAt: new Date().toISOString()
        } : undefined);

        // 3. Upsert AppSettings (key: 'hireflow')
        await db.appSettings.upsert({
            where: { key: 'hireflow' },
            create: {
                key: 'hireflow',
                general: currentGeneral,
                notifications: currentNotifications,
                integrations: {
                    ...currentIntegrations,
                    whatsapp: updatedWa,
                    whatsappDefault: updatedWaDefault,
                    email: currentEmail
                },
                technical: currentTechnical
            },
            update: {
                integrations: {
                    ...currentIntegrations,
                    whatsapp: updatedWa,
                    whatsappDefault: updatedWaDefault,
                    email: currentEmail
                },
                updatedAt: new Date()
            }
        });

        // 4. If setAsGlobalDefault is true, also update global & workspace defaults
        if (setAsGlobalDefault && targetCredId) {
            await setDefaultWhatsAppCloudAction(workspaceId, targetCredId, true);
        }

        revalidatePath(`/workspace/${workspaceId}/hireflow/settings`);
        revalidatePath(`/workspace/${workspaceId}/hireflow`);
        revalidatePath(`/career`);

        return {
            success: true,
            message: `HireFlow WhatsApp configuration saved to AppSettings (${selectedAcc?.profile || 'Account'} - ${effectiveTemplate})`,
            data: {
                whatsapp: updatedWa,
                whatsappDefault: updatedWaDefault
            }
        };
    } catch (error) {
        console.error("[UPDATE_HIREFLOW_WHATSAPP_ERROR]", error);
        return { success: false, error: error.message || "Failed to update HireFlow WhatsApp settings" };
    }
}

/**
 * Save HireFlow settings into AppSettings row with key: 'hireflow'
 */
export async function saveHireflowSettingsAction(workspaceId, newSettings, makeGlobal = false) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session?.user?.userId || session?.user?.id;

        // 1. Resolve selected WhatsApp account details
        let selectedAcc = null;
        if (newSettings?.whatsapp?.credentialId) {
            const cred = await db.credentials.findUnique({
                where: { id: newSettings.whatsapp.credentialId }
            }).catch(() => null);

            if (cred) {
                const dec = decryptCredentials(cred.credentials);
                selectedAcc = {
                    credentialId: cred.id,
                    profile: cred.profile || dec.profileName || '',
                    phoneNumberId: dec.phoneNumberId || dec.phone_number_id || '',
                    wabaId: dec.wabaId || dec.waba_id || '',
                    templateName: newSettings.whatsapp.templateName || 'new_job_application',
                    updatedAt: new Date().toISOString()
                };
            }
        }

        const hireflowPayload = {
            general: newSettings.careerPortal,
            notifications: {
                email: newSettings.email.enabled,
                whatsapp: newSettings.whatsapp.enabled,
                candidateConfirmation: newSettings.email.candidateConfirmation,
                adminAlert: newSettings.email.adminAlert,
                autoSendOnApplication: newSettings.whatsapp.autoSendOnApplication,
                autoSendOnInterview: newSettings.whatsapp.autoSendOnInterview,
                autoSendOnOffer: newSettings.whatsapp.autoSendOnOffer
            },
            integrations: {
                whatsapp: {
                    ...newSettings.whatsapp,
                    phoneNumberId: selectedAcc?.phoneNumberId || '',
                    wabaId: selectedAcc?.wabaId || '',
                    profileName: selectedAcc?.profile || ''
                },
                whatsappDefault: selectedAcc || undefined,
                email: newSettings.email
            },
            technical: {
                pipeline: newSettings.pipeline,
                interview: newSettings.interview
            }
        };

        // 2. Upsert AppSettings row with key: 'hireflow'
        await db.appSettings.upsert({
            where: { key: 'hireflow' },
            create: {
                key: 'hireflow',
                ...hireflowPayload
            },
            update: {
                ...hireflowPayload,
                updatedAt: new Date()
            }
        });

        // 3. Also sync to workspace AppSettings row under hireflow
        const existingWs = await db.appSettings.findUnique({
            where: { key: workspaceId }
        }).catch(() => null);

        const currentWsIntegrations = (typeof existingWs?.integrations === 'object' && existingWs?.integrations !== null)
            ? existingWs.integrations
            : {};

        await db.appSettings.upsert({
            where: { key: workspaceId },
            create: {
                key: workspaceId,
                hireflow: newSettings,
                integrations: {
                    ...currentWsIntegrations,
                    hireflow: newSettings
                }
            },
            update: {
                hireflow: newSettings,
                integrations: {
                    ...currentWsIntegrations,
                    hireflow: newSettings
                }
            }
        });

        revalidatePath(`/workspace/${workspaceId}/hireflow`);
        revalidatePath(`/workspace/${workspaceId}/hireflow/settings`);
        revalidatePath(`/career`);

        return {
            success: true,
            message: "HireFlow settings saved successfully to AppSettings (key: hireflow)"
        };
    } catch (error) {
        console.error("[SAVE_HIREFLOW_SETTINGS_ERROR]", error);
        return { success: false, error: error.message || "Failed to save HireFlow settings" };
    }
}

/**
 * Send a test WhatsApp message from HireFlow configuration
 */
export async function testHireflowWhatsAppAction(workspaceId, phone, candidateName = 'Test Candidate', jobTitle = 'Software Engineer') {
    try {
        await ensureWorkspaceAccess(workspaceId);

        if (!phone || String(phone).trim() === '') {
            return { success: false, error: "Please provide a valid phone number" };
        }

        const result = await sendJobApplicationWhatsApp({
            phone,
            name: candidateName,
            jobTitle: jobTitle,
            companyName: 'Devlomatix',
            workspaceId
        });

        return result;
    } catch (error) {
        console.error("[TEST_HIREFLOW_WHATSAPP_ERROR]", error);
        return { success: false, error: error.message || "Failed to dispatch test WhatsApp message" };
    }
}
