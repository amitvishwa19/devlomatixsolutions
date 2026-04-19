'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { symmetricDecrypt } from "@/lib/encryption";

const GetConversationsSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 1. Fetch user's credentials to identify their phone IDs
        const userCredentials = await db.credentials.findMany({
            where: { userId, platform: 'WHATSAPP_CLOUD' }
        });

        const myPhoneIDs = userCredentials.map(c => {
            let cloudCreds = null;
            const stored = c.credentials;
            if (typeof stored === 'string' && stored.includes(':')) {
                try {
                    cloudCreds = JSON.parse(symmetricDecrypt(stored));
                } catch (e) {
                    console.error(`[Conversations Action] Decryption failed!`, e);
                }
            } else if (typeof stored === 'string') {
                try {
                    cloudCreds = JSON.parse(stored);
                } catch (e) {
                    console.error(`[Conversations Action] JSON Parse failed!`, e);
                }
            } else {
                cloudCreds = stored;
            }
            return String(cloudCreds?.phoneNumberId || cloudCreds?.phone_number_id || "");
        }).filter(id => id);

        // 2. Fetch all messages for this user OR associated with their phone IDs
        const [messages, contacts] = await Promise.all([
            db.whatsAppMessage.findMany({
                where: {
                    OR: [
                        { userId },
                        ...myPhoneIDs.map(id => ({
                            metadata: {
                                path: ['phone_number_id'],
                                string_contains: id
                            }
                        }))
                    ]
                },
                orderBy: { timestamp: 'desc' }
            }),
            db.contact.findMany({
                where: { userId }
            })
        ]);

        const contactMap = {};
        contacts.forEach(c => {
            const cleanPhone = c.phone.replace(/\D/g, '');
            contactMap[cleanPhone] = c.name;
        });

        const conversationsMap = {};
        messages.forEach(msg => {
            const normalizedJid = msg.jid.replace(/\D/g, '').split('@')[0] + "@s.whatsapp.net";
            if (!conversationsMap[normalizedJid]) {
                const cleanPhone = normalizedJid.split('@')[0];
                conversationsMap[normalizedJid] = {
                    jid: normalizedJid,
                    name: contactMap[cleanPhone] || null,
                    lastMessage: msg.text,
                    timestamp: Number(msg.timestamp),
                    fromMe: msg.fromMe,
                    unreadCount: 0,
                    messages: []
                };
            }
            conversationsMap[normalizedJid].messages.push({
                id: msg.id,
                jid: normalizedJid,
                text: msg.text,
                fromMe: msg.fromMe,
                timestamp: Number(msg.timestamp),
                status: msg.status,
                metadata: JSON.parse(JSON.stringify(msg.metadata || {})),
                createdAt: msg.createdAt.toISOString()
            });
        });

        const conversations = Object.values(conversationsMap).sort((a, b) => b.timestamp - a.timestamp);

        return { 
            data: {
                success: true, 
                conversations: JSON.parse(JSON.stringify(conversations))
            } 
        };
    } catch (error) {
        return { error: error.message || "Failed to fetch conversations" };
    }
};

export const getConversations = createSafeAction(GetConversationsSchema, handler);
