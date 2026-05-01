'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { startOfDay, subDays, format, eachDayOfInterval } from "date-fns";

const GetAnalyticsSchema = z.object({
    workspaceId: z.string(),
    range: z.string().optional().default('30'),
});

const handler = async (data) => {
    const { workspaceId, range } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 0. Find Default Credential
        const defaultCredential = await db.credentials.findFirst({
            where: { userId, platform: 'WHATSAPP_CLOUD', isDefault: true }
        });

        if (!defaultCredential) {
            return { data: { success: true, timeSeries: [], templatePerformance: [], distribution: [], totalMessages: 0, overallReadRate: 0 } };
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

        const daysToSub = parseInt(range) - 1;
        const endDate = new Date();
        const startDate = startOfDay(subDays(endDate, daysToSub));

        // 1. Fetch Time-Series Data for active account
        const [messages, deliveryLogs, templates] = await Promise.all([
            db.whatsAppMessage.findMany({
                where: { 
                    userId, 
                    createdAt: { gte: startDate },
                    metadata: {
                        path: ['phone_number_id'],
                        equals: activePhoneId
                    }
                },
                select: { status: true, fromMe: true, createdAt: true, metadata: true, text: true }
            }),
            db.whatsAppDeliveryLog.findMany({
                where: { 
                    userId, 
                    createdAt: { gte: startDate },
                    // Assuming delivery logs might be tied to jobId which is tied to credential, 
                    // but for direct messages we might need metadata filter if available.
                    // For now, filtering messages is most important.
                }
            }),
            db.messageTemplate.findMany({
                where: { userId, phoneNumberId: activePhoneId }
            })
        ]);

        // 2. Prepare Time-Series Buckets
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const timeSeriesData = days.map(day => {
            const dateStr = format(day, 'MMM d');
            const dayStr = format(day, 'yyyy-MM-dd');
            
            const dayMessages = messages.filter(m => format(new Date(m.createdAt), 'yyyy-MM-dd') === dayStr);
            const dayDeliveryLogs = deliveryLogs.filter(l => format(new Date(l.createdAt), 'yyyy-MM-dd') === dayStr);
            
            return {
                date: dateStr,
                sent: dayMessages.filter(m => m.fromMe).length,
                received: dayMessages.filter(m => !m.fromMe).length,
                delivered: dayDeliveryLogs.filter(l => l.status === 'DELIVERED').length,
                read: dayDeliveryLogs.filter(l => l.status === 'READ').length,
                failed: dayDeliveryLogs.filter(l => l.status === 'FAILED').length
            };
        });

        // 3. Top Templates Performance
        const templatePerformance = templates.map(t => {
            const totalSent = messages.filter(m => m.fromMe && (m.text === t.body || m.metadata?.templateName === t.templateName)).length;
            const totalRead = messages.filter(m => m.fromMe && m.status === 'READ' && (m.text === t.body || m.metadata?.templateName === t.templateName)).length;
            
            return {
                name: t.name,
                category: t.category,
                sent: totalSent,
                read: totalRead,
                rate: totalSent > 0 ? ((totalRead / totalSent) * 100).toFixed(1) : 0
            };
        }).sort((a, b) => b.sent - a.sent).slice(0, 5);

        // 4. Distribution Metrics
        const statusDistribution = [
            { name: 'Read', value: messages.filter(m => m.status === 'READ').length, color: '#10b981' },
            { name: 'Delivered', value: messages.filter(m => m.status === 'DELIVERED').length, color: '#3b82f6' },
            { name: 'Sent', value: messages.filter(m => m.status === 'SENT').length, color: '#94a3b8' },
            { name: 'Failed', value: messages.filter(m => m.status === 'FAILED').length, color: '#ef4444' }
        ];

        return {
            data: {
                success: true,
                timeSeries: timeSeriesData,
                templatePerformance,
                distribution: statusDistribution,
                totalMessages: messages.length,
                overallReadRate: messages.filter(m => m.fromMe).length > 0 
                    ? ((messages.filter(m => m.fromMe && m.status === 'READ').length / messages.filter(m => m.fromMe).length) * 100).toFixed(1) 
                    : 0
            }
        };
    } catch (error) {
        return { error: error.message || "Failed to fetch analytics" };
    }
};

export const getAnalytics = createSafeAction(GetAnalyticsSchema, handler);
