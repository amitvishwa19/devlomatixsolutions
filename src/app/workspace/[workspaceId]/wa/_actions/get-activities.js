'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetActivitiesSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 1. Fetch Recent Activity from WhatsApp Messages
        const recentMessages = await db.whatsAppMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10,
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

        // 2. Fetch Recent Template Status Changes
        const templateActivities = await db.messageTemplate.findMany({
            where: { userId, updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
            orderBy: { updatedAt: 'desc' },
            take: 5
        });

        // 3. Merge and Map to Activity Format
        const activities = [];

        recentMessages.forEach(msg => {
            if (!msg.fromMe) {
                activities.push({
                    id: `msg-${msg.id}`,
                    type: "message",
                    title: `New reply from ${msg.jid}`,
                    description: msg.text.substring(0, 50),
                    time: msg.createdAt,
                    status: 'unread'
                });
            } else if (msg.status === 'FAILED') {
                activities.push({
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
                activities.push({
                    id: `tmpl-app-${tmpl.id}`,
                    type: "success",
                    title: `Template Approved: ${tmpl.name}`,
                    description: `Ready to send in ${tmpl.language}.`,
                    time: tmpl.updatedAt,
                    status: 'done'
                });
            } else if (tmpl.status === 'REJECTED') {
                activities.push({
                    id: `tmpl-rej-${tmpl.id}`,
                    type: "alert",
                    title: `Template Rejected: ${tmpl.name}`,
                    description: "Check Meta for policy violations.",
                    time: tmpl.updatedAt,
                    status: 'error'
                });
            }
        });

        // Sort by time
        activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        return {
            data: {
                success: true,
                activities: activities.slice(0, 10).map(act => ({
                    ...act,
                    time: act.time ? new Date(act.time).toISOString() : null
                }))
            }
        };

    } catch (error) {
        return { error: error.message || "Failed to fetch activities" };
    }
};

export const getActivities = createSafeAction(GetActivitiesSchema, handler);
