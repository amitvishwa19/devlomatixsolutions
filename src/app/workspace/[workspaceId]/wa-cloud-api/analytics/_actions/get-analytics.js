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

        const daysToSub = parseInt(range) - 1;
        const endDate = new Date();
        const startDate = startOfDay(subDays(endDate, daysToSub));

        // 1. Fetch Time-Series Data
        const [messages, deliveryLogs, templates] = await Promise.all([
            db.whatsAppMessage.findMany({
                where: { userId, createdAt: { gte: startDate } },
                select: { status: true, fromMe: true, createdAt: true, metadata: true, text: true }
            }),
            db.whatsAppDeliveryLog.findMany({
                where: { userId, createdAt: { gte: startDate } }
            }),
            db.messageTemplate.findMany({
                where: { userId }
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
