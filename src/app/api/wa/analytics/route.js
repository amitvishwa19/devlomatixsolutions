import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { startOfDay, subDays, format, eachDayOfInterval } from "date-fns";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId || session.user.id;
        
        // Default to last 30 days
        const endDate = new Date();
        const startDate = startOfDay(subDays(endDate, 29));

        // 1. Fetch Time-Series Data
        const messages = await db.whatsAppMessage.findMany({
            where: {
                userId,
                createdAt: { gte: startDate }
            },
            select: {
                status: true,
                fromMe: true,
                createdAt: true,
                metadata: true
            }
        });

        // 2. Prepare Time-Series Buckets
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const timeSeriesData = days.map(day => {
            const dateStr = format(day, 'MMM d');
            const dayMessages = messages.filter(m => format(new Date(m.createdAt), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
            
            return {
                date: dateStr,
                sent: dayMessages.filter(m => m.fromMe).length,
                received: dayMessages.filter(m => !m.fromMe).length,
                delivered: dayMessages.filter(m => m.status === 'DELIVERED').length,
                read: dayMessages.filter(m => m.status === 'READ').length,
                failed: dayMessages.filter(m => m.status === 'FAILED').length
            };
        });

        // 3. Top Templates Performance
        const templates = await db.messageTemplate.findMany({
            where: { userId },
            include: {
                campaigns: {
                    include: {
                        recipients: true
                    }
                }
            }
        });

        const templatePerformance = templates.map(t => {
            // This is a simplified calculation; in production, you might want a more direct link
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

        return NextResponse.json({
            success: true,
            timeSeries: timeSeriesData,
            templatePerformance,
            distribution: statusDistribution,
            totalMessages: messages.length,
            overallReadRate: messages.filter(m => m.fromMe).length > 0 
                ? ((messages.filter(m => m.fromMe && m.status === 'READ').length / messages.filter(m => m.fromMe).length) * 100).toFixed(1) 
                : 0
        });

    } catch (error) {
        console.error("[WA_ANALYTICS_ERROR]", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}
