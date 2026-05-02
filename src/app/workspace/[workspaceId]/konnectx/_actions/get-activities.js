'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetActivitiesSchema = z.object({
    workspaceId: z.string(),
    page: z.number().int().min(1).optional().default(1),
    pageSize: z.number().int().min(1).max(50).optional().default(5)
});

const handler = async (data) => {
    const { workspaceId, page, pageSize } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 0. Find Default Credential
        const defaultCredential = await db.credentials.findFirst({
            where: { userId, platform: 'WHATSAPP_CLOUD', isDefault: true }
        });

        if (!defaultCredential) {
            return { data: { success: true, activities: [], pagination: { currentPage: 1, pageSize, hasMore: false, totalOnPage: 0 } } };
        }

        // Extract Phone Number ID from credential
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

        // Calculate offset for buffer (we fetch enough to sort globally)
        const bufferSize = page * pageSize + 10; 

        // 1. Fetch Recent Activity from WhatsApp Messages for active account only
        const recentMessages = await db.whatsAppMessage.findMany({
            where: { 
                userId,
                metadata: {
                    path: ['phone_number_id'],
                    equals: activePhoneId
                }
            },
            orderBy: { createdAt: 'desc' },
            take: bufferSize,
            select: {
                id: true,
                jid: true,
                text: true,
                fromMe: true,
                status: true,
                createdAt: true,
                waId: true
            }
        });

        // 2. Fetch Recent Template Status Changes for active account only
        const templateActivities = await db.messageTemplate.findMany({
            where: { 
                userId,
                phoneNumberId: activePhoneId 
            },
            orderBy: { updatedAt: 'desc' },
            take: bufferSize
        });

        // 3. Map to Activity Format
        const allActivities = [];

        recentMessages.forEach(msg => {
            if (!msg.fromMe) {
                allActivities.push({
                    id: `msg-${msg.id}`,
                    type: "message",
                    title: `New reply from ${msg.jid}`,
                    description: msg.text.substring(0, 50),
                    time: msg.createdAt,
                    status: 'unread'
                });
            } else if (msg.status === 'FAILED') {
                allActivities.push({
                    id: `fail-${msg.id}`,
                    type: "alert",
                    title: `Message delivery failed to ${msg.jid}`,
                    description: "Meta API error or invalid number.",
                    time: msg.createdAt,
                    status: 'error'
                });
            }
        });

        templateActivities.forEach(tmpl => {
            if (tmpl.status === 'APPROVED') {
                allActivities.push({
                    id: `tmpl-app-${tmpl.id}`,
                    type: "success",
                    title: `Template Approved: ${tmpl.name}`,
                    description: `Ready to send in ${tmpl.language}.`,
                    time: tmpl.updatedAt,
                    status: 'done'
                });
            } else if (tmpl.status === 'REJECTED') {
                allActivities.push({
                    id: `tmpl-rej-${tmpl.id}`,
                    type: "alert",
                    title: `Template Rejected: ${tmpl.name}`,
                    description: "Check Meta for policy violations.",
                    time: tmpl.updatedAt,
                    status: 'error'
                });
            }
        });

        // Sort by time globally
        allActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        // Paginate the merged list
        const start = (page - 1) * pageSize;
        const paginatedActivities = allActivities.slice(start, start + pageSize);
        
        // Approximate total for "Recent" feed (Total possible activities found in buffer + buffer)
        // Since we don't count the entire DB for performance, we indicate if there's more.
        const hasMore = allActivities.length > start + pageSize;

        return {
            data: {
                success: true,
                activities: paginatedActivities.map(act => ({
                    ...act,
                    time: act.time ? new Date(act.time).toISOString() : null
                })),
                pagination: {
                    currentPage: page,
                    pageSize,
                    hasMore,
                    totalOnPage: paginatedActivities.length
                }
            }
        };

    } catch (error) {
        return { error: error.message || "Failed to fetch activities" };
    }
};

export const getActivities = createSafeAction(GetActivitiesSchema, handler);
