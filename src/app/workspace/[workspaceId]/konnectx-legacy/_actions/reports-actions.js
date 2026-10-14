'use server';

import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

/**
 * Get delivery telemetry logs from isolated KonnectLegacyMessage table
 */
export async function getDeliveryReportsAction(workspaceId, filters = {}) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const where = {
            workspaceId,
            ...(filters.status && filters.status !== 'ALL' ? { status: filters.status } : {}),
            ...(filters.search ? {
                OR: [
                    { jid: { contains: filters.search, mode: 'insensitive' } },
                    { text: { contains: filters.search, mode: 'insensitive' } },
                    { phoneNumber: { contains: filters.search, mode: 'insensitive' } }
                ]
            } : {})
        };

        const take = filters.limit || 50;
        const skip = filters.offset || 0;

        const [messages, totalCount] = await Promise.all([
            db.konnectLegacyMessage.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take,
                skip
            }),
            db.konnectLegacyMessage.count({ where })
        ]);

        const formatted = messages.map(m => {
            const cleanPhone = m.phoneNumber || m.jid.replace('@s.whatsapp.net', '').replace('@g.us', '').replace('@lid', '');
            const isGroup = m.jid.includes('@g.us');
            const isOutbound = m.fromMe ?? true;

            return {
                id: m.id,
                msgId: m.waId || m.id,
                jid: m.jid,
                phone: cleanPhone,
                isGroup,
                isOutbound,
                text: m.text,
                type: m.mediaType || 'TEXT',
                status: m.status || 'SENT',
                timestamp: Number(m.timestamp) * 1000,
                createdAt: m.createdAt
            };
        });

        // Compute aggregate metrics from isolated table
        const [sentCount, deliveredCount, readCount] = await Promise.all([
            db.konnectLegacyMessage.count({ where: { workspaceId, status: 'SENT' } }),
            db.konnectLegacyMessage.count({ where: { workspaceId, status: 'DELIVERED' } }),
            db.konnectLegacyMessage.count({ where: { workspaceId, status: 'READ' } })
        ]);

        return {
            success: true,
            logs: formatted,
            totalCount,
            stats: {
                total: totalCount,
                sent: sentCount,
                delivered: deliveredCount,
                read: readCount
            }
        };
    } catch (error) {
        console.error("[GET_DELIVERY_REPORTS_ERROR]", error);
        return {
            success: false,
            error: error.message || "Failed to load telemetry reports",
            logs: [],
            totalCount: 0,
            stats: { total: 0, sent: 0, delivered: 0, read: 0 }
        };
    }
}
