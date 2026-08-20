'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { symmetricDecrypt } from "@/lib/encryption";
import { getWhatsappDefault } from "@/lib/whatsapp-default";

const GetConversationsSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 1. Resolve all user IDs belonging to this workspace (owner + members + current user)
        const workspace = await db.server.findUnique({
            where: { id: workspaceId },
            include: { members: true }
        }).catch(() => null);

        const workspaceUserIds = [
            ...new Set([
                userId,
                workspace?.userId,
                ...((workspace?.members || []).map(m => m.userId))
            ].filter(Boolean))
        ];

        // 2. Resolve Active Default Credential
        const defaultInfo = await getWhatsappDefault(workspaceId).catch(() => null);
        let defaultCredential = null;
        if (defaultInfo?.credentialId) {
            defaultCredential = await db.credentials.findUnique({ where: { id: defaultInfo.credentialId } }).catch(() => null);
        }

        if (!defaultCredential) {
            defaultCredential = await db.credentials.findFirst({
                where: {
                    OR: [
                        { workspaceId, platform: 'WHATSAPP_CLOUD', isDefault: true },
                        { userId: { in: workspaceUserIds }, platform: 'WHATSAPP_CLOUD', isDefault: true },
                        { workspaceId, platform: 'WHATSAPP_CLOUD' },
                        { userId: { in: workspaceUserIds }, platform: 'WHATSAPP_CLOUD' },
                    ]
                },
                orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }]
            }).catch(() => null);
        }

        // Extract active Phone ID if available
        let activePhoneId = "";
        if (defaultCredential) {
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
            activePhoneId = String(cloudCreds?.phoneNumberId || cloudCreds?.phone_number_id || "");
        }

        // 3. Find conversations assigned to this user in this workspace
        const assignedShares = await db.conversationShare.findMany({
            where: { sharedWithUserId: userId, workspaceId }
        }).catch(() => []);
        const assignedJids = assignedShares.map(s => s.jid);

        // 4. Fetch messages: workspace user messages + assigned messages
        const ownMessages = db.whatsAppMessage.findMany({
            where: { userId: { in: workspaceUserIds } },
            orderBy: [{ timestamp: 'desc' }, { createdAt: 'desc' }]
        });

        const assignedMessages = assignedJids.length > 0
            ? db.whatsAppMessage.findMany({
                where: { jid: { in: assignedJids } },
                orderBy: [{ timestamp: 'desc' }, { createdAt: 'desc' }]
            })
            : Promise.resolve([]);

        const allContacts = db.contact.findMany({
            where: {
                OR: [
                    { workspaceId },
                    { userId: { in: workspaceUserIds } }
                ]
            }
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

        // Fetch contacts owned by assigning users for name resolution
        const assigningUserIds = [...new Set(assignedShares.map(s => s.sharedByUserId))];
        const assignorContacts = assigningUserIds.length > 0
            ? await db.contact.findMany({ where: { userId: { in: assigningUserIds } } })
            : [];

        const contactMap = {};
        contacts.forEach(c => {
            if (!c.phone) return;
            const cleanPhone = c.phone.replace(/\D/g, '');
            const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
            contactMap[last10] = c.name;
        });
        assignorContacts.forEach(c => {
            if (!c.phone) return;
            const cleanPhone = c.phone.replace(/\D/g, '');
            const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
            if (!contactMap[last10]) contactMap[last10] = c.name;
        });

        const sharesMap = {};
        shares.forEach(s => {
            if (!s.jid) return;
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
            if (!msg.jid) return;
            const cleanPhone = msg.jid.replace(/\D/g, '').split('@')[0];
            const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
            const fullJid = cleanPhone.length === 10 ? `91${cleanPhone}@s.whatsapp.net` : `${cleanPhone}@s.whatsapp.net`;
            const msgTimestamp = Number(msg.timestamp) || Math.floor(new Date(msg.createdAt).getTime() / 1000);

            const msgPreview = JSON.stringify({
                text: msg.text || '',
                type: msg.metadata?.type || 'text',
                url: msg.metadata?.mediaUrl || msg.metadata?.raw?.[msg.metadata?.type]?.url || null,
                caption: msg.metadata?.caption || msg.metadata?.raw?.[msg.metadata?.type]?.caption || null,
                timestamp: msgTimestamp
            });

            if (!conversationsMap[last10]) {
                conversationsMap[last10] = {
                    jid: fullJid,
                    name: contactMap[last10] || null,
                    lastMessage: msgPreview,
                    timestamp: msgTimestamp,
                    createdAt: msg.createdAt,
                    fromMe: msg.fromMe,
                    unreadCount: (!msg.fromMe && msg.status === 'RECEIVED') ? 1 : 0,
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
                if (msgTimestamp >= conversationsMap[last10].timestamp) {
                    conversationsMap[last10].timestamp = msgTimestamp;
                    conversationsMap[last10].createdAt = msg.createdAt;
                    conversationsMap[last10].fromMe = msg.fromMe;
                    conversationsMap[last10].lastMessage = msgPreview;
                }
            }

            if (!conversationsMap[last10].messages.find(m => m.id === msg.id)) {
                conversationsMap[last10].messages.push({
                    id: msg.id,
                    waId: msg.waId,
                    jid: conversationsMap[last10].jid,
                    text: msg.text,
                    fromMe: msg.fromMe,
                    timestamp: msgTimestamp,
                    status: msg.status,
                    metadata: JSON.parse(JSON.stringify(msg.metadata || {})),
                    createdAt: msg.createdAt ? new Date(msg.createdAt).toISOString() : new Date().toISOString()
                });
            }
        };

        messages.forEach(msg => processMsg(msg, false));
        assignedMsgs.forEach(msg => processMsg(msg, true));

        // Sort messages inside each conversation chronologically ascending
        Object.values(conversationsMap).forEach(conv => {
            conv.messages.sort((a, b) => {
                if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });
        });

        // Sort conversations descending by latest activity
        const conversations = Object.values(conversationsMap).sort((a, b) => {
            if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return { 
            data: {
                success: true, 
                conversations: JSON.parse(JSON.stringify(conversations))
            } 
        };
    } catch (error) {
        console.error("[getConversations] Error:", error);
        return { error: error.message || "Failed to fetch conversations" };
    }
};

export const getConversations = createSafeAction(GetConversationsSchema, handler);
