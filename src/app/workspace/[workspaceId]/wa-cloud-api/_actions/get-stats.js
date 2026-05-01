'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetStatsSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 0. Find Default Credential
        const defaultCredential = await db.credentials.findFirst({
            where: { userId, platform: 'WHATSAPP_CLOUD', isDefault: true }
        });

        if (!defaultCredential) {
            return { data: { stats: null } };
        }

        // Extract Phone Number ID
        let cloudCreds = null;
        const stored = defaultCredential.credentials;
        if (typeof stored === 'string' && stored.includes(':')) {
            try {
                const { symmetricDecrypt } = await import("@/lib/encryption");
                cloudCreds = JSON.parse(symmetricDecrypt(stored));
            } catch (e) { }
        } else if (typeof stored === 'string') {
            try { cloudCreds = JSON.parse(stored); } catch (e) { }
        } else { cloudCreds = stored; }
        
        if (cloudCreds?.enc) {
            try {
                const { symmetricDecrypt } = await import("@/lib/encryption");
                cloudCreds = JSON.parse(symmetricDecrypt(cloudCreds.enc));
            } catch (e) { }
        }
        const activePhoneId = String(cloudCreds?.phoneNumberId || cloudCreds?.phone_number_id || "");

        // 1. Fetch Campaign Stats for active credential
        const totalCampaigns = await db.campaign.count({ 
            where: { userId, credentialId: defaultCredential.id } 
        });
        const activeCampaigns = await db.campaign.count({ 
            where: { userId, credentialId: defaultCredential.id, status: 'active' } 
        });

        // 2. Message Stats for active phone ID
        const msgWhere = { 
            userId, 
            fromMe: true,
            metadata: {
                path: ['phone_number_id'],
                equals: activePhoneId
            }
        };

        const sentMessages = await db.whatsAppMessage.count({ where: msgWhere });

        // 3. Status Breakdown
        const readMessages = await db.whatsAppMessage.count({
            where: { ...msgWhere, status: 'READ' }
        });

        const failedMessages = await db.whatsAppMessage.count({
            where: { ...msgWhere, status: 'FAILED' }
        });

        const deliveredMessages = await db.whatsAppMessage.count({
            where: { ...msgWhere, status: 'DELIVERED' }
        });

        // 4. Contact Stats (Shared for now, or could be filtered if linked to accounts)
        const totalContacts = await db.contact.count({ where: { userId } });

        // 5. Template Stats for active phone ID
        const approvedTemplates = await db.messageTemplate.count({
            where: { userId, status: 'APPROVED', phoneNumberId: activePhoneId }
        });

        const pendingTemplates = await db.messageTemplate.count({
            where: { userId, status: 'PENDING_APPROVAL', phoneNumberId: activePhoneId }
        });

        // 6. Job Stats (Latest Batch)
        const latestJob = await db.whatsAppJob.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { logs: true }
                }
            }
        });

        // Calculate rates
        const successRate = sentMessages > 0 ? (((sentMessages - failedMessages) / sentMessages) * 100).toFixed(1) : 0;
        const readRate = sentMessages > 0 ? ((readMessages / sentMessages) * 100).toFixed(1) : 0;

        return {
            data: {
                stats: {
                    campaigns: {
                        total: Number(totalCampaigns),
                        active: Number(activeCampaigns)
                    },
                    messages: {
                        sent: Number(sentMessages),
                        read: Number(readMessages),
                        delivered: Number(deliveredMessages),
                        failed: Number(failedMessages),
                        successRate: String(successRate),
                        readRate: String(readRate)
                    },
                    contacts: {
                        total: Number(totalContacts)
                    },
                    templates: {
                        approved: Number(approvedTemplates),
                        pending: Number(pendingTemplates)
                    },
                    latestJob: latestJob ? {
                        id: latestJob.id,
                        status: latestJob.status,
                        total: Number(latestJob._count.logs),
                        completedAt: latestJob.completedAt ? new Date(latestJob.completedAt).toISOString() : null
                    } : null
                }
            }
        };

    } catch (error) {
        return { error: error.message || "Failed to fetch stats" };
    }
};

export const getStats = createSafeAction(GetStatsSchema, handler);
