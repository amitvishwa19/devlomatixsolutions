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

        // 1. Find Credential (with fallback to latest if no default is set)
        let defaultCredential = await db.credentials.findFirst({
            where: { userId, platform: 'WHATSAPP_CLOUD', isDefault: true }
        });

        if (!defaultCredential) {
            defaultCredential = await db.credentials.findFirst({
                where: { userId, platform: 'WHATSAPP_CLOUD' },
                orderBy: { updatedAt: 'desc' }
            });
        }

        if (!defaultCredential) {
            return { data: { success: true, conversations: [] } };
        }

        // Extract active Phone ID
        let cloudCreds = null;
        const stored = defaultCredential.credentials;
        if (typeof stored === 'string' && stored.includes(':')) {
            try { cloudCreds = JSON.parse(symmetricDecrypt(stored)); } catch (e) { }
        } else if (typeof stored === 'string') {
            try { cloudCreds = JSON.parse(stored); } catch (e) { }
        } else { cloudCreds = stored; }
        
        if (cloudCreds?.enc) {
            try { cloudCreds = JSON.parse(symmetricDecrypt(cloudCreds.enc)); } catch (e) { }
        }
        const activePhoneId = String(cloudCreds?.phoneNumberId || cloudCreds?.phone_number_id || "");
        console.log(`[getConversations] Fetching messages for PhoneID: ${activePhoneId} (User: ${userId})`);

        // 2. Find conversations assigned to this user
        const assignedShares = await db.conversationShare.findMany({
            where: { sharedWithUserId: userId, workspaceId }
        });
        const assignedJids = assignedShares.map(s => s.jid);

        // 3. Fetch messages: own messages + messages from assigned conversations
        const ownMessages = db.whatsAppMessage.findMany({
            where: {
                userId,
                metadata: {
                    path: ['phone_number_id'],
                    equals: activePhoneId
                }
            },
            orderBy: { timestamp: 'desc' }
        });

        const assignedMessages = assignedJids.length > 0
            ? db.whatsAppMessage.findMany({
                where: {
                    jid: { in: assignedJids },
                    metadata: {
                        path: ['phone_number_id'],
                        equals: activePhoneId
                    }
                },
                orderBy: { timestamp: 'desc' }
            })
            : Promise.resolve([]);

        const allContacts = db.contact.findMany({
            where: { userId }
        });

        const [messages, assignedMsgs, contacts] = await Promise.all([ownMessages, assignedMessages, allContacts]);

        // Also fetch contacts owned by assigning users for name resolution
        const assigningUserIds = [...new Set(assignedShares.map(s => s.sharedByUserId))];
        const assignorContacts = assigningUserIds.length > 0
            ? await db.contact.findMany({ where: { userId: { in: assigningUserIds } } })
            : [];

        const contactMap = {};
        contacts.forEach(c => {
            const cleanPhone = c.phone.replace(/\D/g, '');
            contactMap[cleanPhone] = c.name;
        });
        assignorContacts.forEach(c => {
            const cleanPhone = c.phone.replace(/\D/g, '');
            if (!contactMap[cleanPhone]) contactMap[cleanPhone] = c.name;
        });

        const conversationsMap = {};
        const processMsg = (msg, isAssigned) => {
            const normalizedJid = msg.jid.replace(/\D/g, '').split('@')[0] + "@s.whatsapp.net";
            if (!conversationsMap[normalizedJid]) {
                const cleanPhone = normalizedJid.split('@')[0];
                conversationsMap[normalizedJid] = {
                    jid: normalizedJid,
                    name: contactMap[cleanPhone] || null,
                    lastMessage: JSON.stringify({
                        text: msg.text,
                        type: msg.metadata?.type || 'text',
                        url: msg.metadata?.mediaUrl || msg.metadata?.raw?.[msg.metadata?.type]?.url || null,
                        caption: msg.metadata?.caption || msg.metadata?.raw?.[msg.metadata?.type]?.caption || null,
                        timestamp: Number(msg.timestamp)
                    }),
                    timestamp: Number(msg.timestamp),
                    fromMe: msg.fromMe,
                    unreadCount: 0,
                    messages: [],
                    assigned: isAssigned ? true : undefined
                };
            }
            if (!conversationsMap[normalizedJid].messages.find(m => m.id === msg.id)) {
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
            }
        };

        messages.forEach(msg => processMsg(msg, false));
        assignedMsgs.forEach(msg => processMsg(msg, true));

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
