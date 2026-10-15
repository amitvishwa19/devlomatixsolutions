'use server';

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetThreadMessagesSchema = z.object({
    workspaceId: z.string(),
    jid: z.string(),
    beforeTimestamp: z.number().optional(),
    beforeCreatedAt: z.string().optional(),
    limit: z.number().optional().default(50)
});

const handler = async (data) => {
    const { workspaceId, jid, beforeTimestamp, beforeCreatedAt, limit = 50 } = data;

    try {
        await ensureWorkspaceAccess(workspaceId);

        if (!jid) {
            return { error: "JID is required" };
        }

        const cleanPhone = jid.replace(/\D/g, '').split('@')[0];
        const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
        const jidVariants = [
            jid,
            `${cleanPhone}@s.whatsapp.net`,
            cleanPhone.length === 10 ? `91${cleanPhone}@s.whatsapp.net` : `${cleanPhone}@s.whatsapp.net`
        ];

        const where = {
            jid: { in: [...new Set(jidVariants)] }
        };

        if (beforeTimestamp) {
            where.timestamp = { lt: BigInt(beforeTimestamp) };
        } else if (beforeCreatedAt) {
            where.createdAt = { lt: new Date(beforeCreatedAt) };
        }

        const messages = await db.whatsAppMessage.findMany({
            where,
            orderBy: [{ timestamp: 'desc' }, { createdAt: 'desc' }],
            take: Math.min(limit, 100),
            select: {
                id: true,
                waId: true,
                jid: true,
                text: true,
                fromMe: true,
                timestamp: true,
                status: true,
                metadata: true,
                createdAt: true
            }
        });

        const formatted = messages.map(msg => {
            let meta = {};
            if (typeof msg.metadata === 'string') {
                try { meta = JSON.parse(msg.metadata); } catch (e) { meta = {}; }
            } else if (msg.metadata && typeof msg.metadata === 'object') {
                meta = JSON.parse(JSON.stringify(msg.metadata));
            }

            return {
                id: msg.id,
                waId: msg.waId,
                jid: msg.jid,
                text: msg.text,
                fromMe: msg.fromMe,
                timestamp: Number(msg.timestamp) || Math.floor(new Date(msg.createdAt).getTime() / 1000),
                status: msg.status,
                metadata: meta,
                createdAt: msg.createdAt ? new Date(msg.createdAt).toISOString() : new Date().toISOString()
            };
        }).reverse(); // Return in chronological order

        return {
            data: {
                success: true,
                messages: formatted,
                hasMore: messages.length >= limit
            }
        };
    } catch (error) {
        console.error("[getThreadMessages] Error:", error);
        return { error: error.message || "Failed to fetch thread messages" };
    }
};

export const getThreadMessages = createSafeAction(GetThreadMessagesSchema, handler);
