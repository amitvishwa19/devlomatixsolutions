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

        const allShares = db.conversationShare.findMany({
            where: { workspaceId },
            include: {
                sharedWith: {
                    select: { id: true, displayName: true, email: true }
                }
            }
        });

        const [messages, assignedMsgs, contacts, shares] = await Promise.all([
            ownMessages, 
            assignedMessages, 
            allContacts,
            allShares
        ]);

        // Also fetch contacts owned by assigning users for name resolution
        const assigningUserIds = [...new Set(assignedShares.map(s => s.sharedByUserId))];
        const assignorContacts = assigningUserIds.length > 0
            ? await db.contact.findMany({ where: { userId: { in: assigningUserIds } } })
            : [];

        const contactMap = {};
        contacts.forEach(c => {
            const cleanPhone = c.phone.replace(/\D/g, '');
            const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
            contactMap[last10] = c.name;
        });
        assignorContacts.forEach(c => {
            const cleanPhone = c.phone.replace(/\D/g, '');
            const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
            if (!contactMap[last10]) contactMap[last10] = c.name;
        });

        const sharesMap = {};
        shares.forEach(s => {
            const cleanPhone = s.jid.replace(/\D/g, '').split('@')[0];
            const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
            if (!sharesMap[last10]) {
                sharesMap[last10] = [];
            }
            sharesMap[last10].push({
                id: s.id,
                sharedWithUserId: s.sharedWithUserId,
                sharedByUserId: s.sharedByUserId,
                sharedWith: s.sharedWith
            });
        });

        const conversationsMap = {};
        const processMsg = (msg, isAssigned) => {
            const cleanPhone = msg.jid.replace(/\D/g, '').split('@')[0];
            const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
            const fullJid = cleanPhone.length === 10 ? `91${cleanPhone}@s.whatsapp.net` : `${cleanPhone}@s.whatsapp.net`;

            if (!conversationsMap[last10]) {
                conversationsMap[last10] = {
                    jid: fullJid,
                    name: contactMap[last10] || null,
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
                    assigned: isAssigned ? true : undefined,
                    sharedWith: sharesMap[last10] || []
                };
            } else {
                if (cleanPhone.length > 10) {
                    conversationsMap[last10].jid = fullJid;
                }
                if (contactMap[last10] && !conversationsMap[last10].name) {
                    conversationsMap[last10].name = contactMap[last10];
                }
                if (Number(msg.timestamp) > conversationsMap[last10].timestamp) {
                    conversationsMap[last10].timestamp = Number(msg.timestamp);
                    conversationsMap[last10].fromMe = msg.fromMe;
                    conversationsMap[last10].lastMessage = JSON.stringify({
                        text: msg.text,
                        type: msg.metadata?.type || 'text',
                        url: msg.metadata?.mediaUrl || msg.metadata?.raw?.[msg.metadata?.type]?.url || null,
                        caption: msg.metadata?.caption || msg.metadata?.raw?.[msg.metadata?.type]?.caption || null,
                        timestamp: Number(msg.timestamp)
                    });
                }
            }
            if (!conversationsMap[last10].messages.find(m => m.id === msg.id)) {
                conversationsMap[last10].messages.push({
                    id: msg.id,
                    jid: conversationsMap[last10].jid,
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

        Object.values(conversationsMap).forEach(conv => {
            conv.messages.sort((a, b) => a.timestamp - b.timestamp);
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
