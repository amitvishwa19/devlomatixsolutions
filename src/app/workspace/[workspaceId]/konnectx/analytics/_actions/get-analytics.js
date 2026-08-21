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

        // Get all workspace users
        const workspaceUsers = await db.workspaceUser.findMany({
            where: { workspaceId },
            select: { userId: true }
        });
        const workspaceUserIds = Array.from(new Set([userId, ...workspaceUsers.map(u => u.userId)]));

        // Find Default Credential
        const defaultCredential = await db.credentials.findFirst({
            where: { 
                userId: { in: workspaceUserIds },
                platform: 'WHATSAPP_CLOUD',
                isDefault: true 
            }
        });

        let activePhoneId = "";
        if (defaultCredential) {
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
            activePhoneId = String(cloudCreds?.phoneNumberId || cloudCreds?.phone_number_id || "");
        }

        const daysToSub = parseInt(range || '30') - 1;
        const endDate = new Date();
        const startDate = startOfDay(subDays(endDate, Math.max(0, daysToSub)));

        // 1. Fetch Data
        const [rawMessages, templates] = await Promise.all([
            db.whatsAppMessage.findMany({
                where: { 
                    userId: { in: workspaceUserIds }, 
                    createdAt: { gte: startDate }
                },
                select: { status: true, fromMe: true, createdAt: true, metadata: true, text: true }
            }),
            db.messageTemplate.findMany({
                where: { 
                    userId: { in: workspaceUserIds },
                    ...(activePhoneId ? { phoneNumberId: activePhoneId } : {})
                }
            })
        ]);

        // Filter messages by activePhoneId if available and present in metadata
        const messages = activePhoneId 
            ? rawMessages.filter(m => {
                const msgPhoneId = m.metadata?.phone_number_id || m.metadata?.phoneNumberId;
                return !msgPhoneId || String(msgPhoneId) === activePhoneId;
            })
            : rawMessages;

        // 2. Prepare Time-Series Buckets
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const timeSeriesData = days.map(day => {
            const dateStr = format(day, 'MMM d');
            const dayStr = format(day, 'yyyy-MM-dd');
            
            const dayMessages = messages.filter(m => format(new Date(m.createdAt), 'yyyy-MM-dd') === dayStr);
            const sentCount = dayMessages.filter(m => m.fromMe).length;
            const recvCount = dayMessages.filter(m => !m.fromMe).length;
            const readCount = dayMessages.filter(m => m.status === 'READ').length;
            const failedCount = dayMessages.filter(m => m.status === 'FAILED').length;
            
            return {
                date: dateStr,
                sent: sentCount,
                received: recvCount,
                delivered: dayMessages.filter(m => m.status === 'DELIVERED' || m.status === 'READ').length,
                read: readCount,
                failed: failedCount,
                total: dayMessages.length
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
                rate: totalSent > 0 ? ((totalRead / totalSent) * 100).toFixed(1) : "0.0"
            };
        }).sort((a, b) => b.sent - a.sent).slice(0, 5);

        // 4. Distribution Metrics
        const readTotal = messages.filter(m => m.status === 'READ').length;
        const delivTotal = messages.filter(m => m.status === 'DELIVERED').length;
        const sentTotal = messages.filter(m => m.status === 'SENT').length;
        const failedTotal = messages.filter(m => m.status === 'FAILED').length;

        const statusDistribution = [
            { name: 'Read', value: readTotal, color: '#10b981' },
            { name: 'Delivered', value: delivTotal, color: '#3b82f6' },
            { name: 'Sent', value: sentTotal, color: '#94a3b8' },
            { name: 'Failed', value: failedTotal, color: '#ef4444' }
        ];

        const sentMessagesCount = messages.filter(m => m.fromMe).length;
        const overallReadRate = sentMessagesCount > 0 
            ? ((readTotal / sentMessagesCount) * 100).toFixed(1) 
            : "0.0";

        return {
            data: {
                success: true,
                timeSeries: timeSeriesData,
                templatePerformance,
                distribution: statusDistribution,
                totalMessages: messages.length,
                overallReadRate
            }
        };
    } catch (error) {
        return { error: error.message || "Failed to fetch analytics" };
    }
};

export const getAnalytics = createSafeAction(GetAnalyticsSchema, handler);
