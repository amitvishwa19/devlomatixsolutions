'use server';

import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { konnectLegacyManager } from "../_lib/baileys-manager";

/**
 * Get distinct active conversations from isolated KonnectLegacyMessage and KonnectLegacyContact
 */
export async function getChatsAction(workspaceId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        // Ensure background socket is alive if credentials exist
        if (typeof konnectLegacyManager?.ensureActiveSocket === 'function') {
            await konnectLegacyManager.ensureActiveSocket(workspaceId);
        } else if (typeof konnectLegacyManager?.connect === 'function') {
            await konnectLegacyManager.connect(workspaceId);
        }

        // Fetch messages exclusively from isolated KonnectLegacyMessage table
        const recentMessages = await db.konnectLegacyMessage.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' },
            take: 400
        });

        // Fetch contacts for names/avatars
        const contacts = await db.konnectLegacyContact.findMany({
            where: { workspaceId },
            orderBy: { lastInteraction: 'desc' },
            take: 200
        });

        const contactMap = new Map();
        for (const c of contacts) {
            contactMap.set(c.phone, c.name);
        }

        // Group by JID to find last message for each conversation
        const conversationMap = new Map();

        // 1. First add conversations from recent messages
        for (const msg of recentMessages) {
            if (!conversationMap.has(msg.jid)) {
                const cleanPhone = msg.phoneNumber || msg.jid.replace('@s.whatsapp.net', '').replace('@g.us', '').replace('@lid', '');
                const isGroup = msg.jid.includes('@g.us');
                const displayName = contactMap.get(cleanPhone) || msg.pushName || `+${cleanPhone}`;

                conversationMap.set(msg.jid, {
                    jid: msg.jid,
                    phone: cleanPhone,
                    name: displayName,
                    isGroup,
                    lastMessage: msg.text,
                    timestamp: Number(msg.timestamp) * 1000,
                    status: msg.status,
                    unread: 0,
                    createdAt: msg.createdAt
                });
            }
        }

        // 2. Also populate conversations from synced contacts so user can immediately chat with any contact
        for (const c of contacts) {
            const jid = `${c.phone}@s.whatsapp.net`;
            if (!conversationMap.has(jid)) {
                conversationMap.set(jid, {
                    jid,
                    phone: c.phone,
                    name: c.name || `+${c.phone}`,
                    isGroup: false,
                    lastMessage: c.lastMessage || 'Synced phone contact',
                    timestamp: c.lastInteraction ? new Date(c.lastInteraction).getTime() : new Date(c.createdAt).getTime(),
                    status: 'DELIVERED',
                    unread: 0,
                    createdAt: c.createdAt
                });
            }
        }

        // Sort by most recent interaction
        const conversations = Array.from(conversationMap.values()).sort((a, b) => b.timestamp - a.timestamp);
        return { success: true, conversations };
    } catch (error) {
        console.error("[GET_CHATS_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to load chats", conversations: [] };
    }
}

/**
 * Get message history for a specific contact JID from isolated KonnectLegacyMessage
 */
export async function getChatMessagesAction(workspaceId, jid) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        if (!jid) {
            return { success: false, error: "JID is required", messages: [] };
        }

        const messages = await db.konnectLegacyMessage.findMany({
            where: {
                workspaceId,
                jid
            },
            orderBy: { createdAt: 'asc' },
            take: 200
        });

        const formatted = messages.map(m => ({
            id: m.id || m.waId,
            waId: m.waId,
            jid: m.jid,
            text: m.text,
            fromMe: m.fromMe,
            status: m.status,
            timestamp: Number(m.timestamp) * 1000,
            metadata: m.metadata
        }));

        return { success: true, messages: formatted };
    } catch (error) {
        console.error("[GET_CHAT_MESSAGES_ERROR]", error);
        return { success: false, error: error.message || "Failed to load messages", messages: [] };
    }
}

/**
 * Force trigger connection and sync history
 */
export async function syncChatHistoryAction(workspaceId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        // Trigger active socket connect
        await konnectLegacyManager.connect(workspaceId);

        // Wait brief delay for initial history packets
        await new Promise(r => setTimeout(r, 2000));

        const [msgCount, contactCount] = await Promise.all([
            db.konnectLegacyMessage.count({ where: { workspaceId } }),
            db.konnectLegacyContact.count({ where: { workspaceId } })
        ]);

        return {
            success: true,
            msgCount,
            contactCount,
            message: `Synced ${msgCount} messages and ${contactCount} contacts from connected phone.`
        };
    } catch (error) {
        console.error("[SYNC_CHAT_HISTORY_ERROR]", error);
        return { success: false, error: error.message || "Sync failed" };
    }
}

/**
 * Send outbound message from linked WhatsApp device via Baileys
 */
export async function sendChatMessageAction(workspaceId, { jid, text }) {
    try {
        await ensureWorkspaceAccess(workspaceId);
        const sessionId = workspaceId;

        if (!jid || !text?.trim()) {
            return { success: false, error: "Recipient and message text are required" };
        }

        const sent = await konnectLegacyManager.sendMessage(sessionId, jid, text.trim());

        return {
            success: true,
            message: {
                id: sent.key?.id || `out_${Date.now()}`,
                jid,
                text: text.trim(),
                fromMe: true,
                status: 'SENT',
                timestamp: Date.now()
            }
        };
    } catch (error) {
        console.error("[SEND_CHAT_MESSAGE_ERROR]", error);
        return { success: false, error: error.message || "Failed to send message via linked phone" };
    }
}

/**
 * Start a brand new conversation with any phone number from linked WhatsApp device
 */
export async function startNewChatAction(workspaceId, { phone, name, initialMessage }) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;
        const sessionId = workspaceId;

        if (!phone || !phone.trim()) {
            return { success: false, error: "Phone number is required" };
        }

        // Clean and normalize phone number
        let cleanPhone = phone.replace(/[^\d]/g, '');
        if (cleanPhone.length === 10) {
            cleanPhone = '91' + cleanPhone;
        }
        if (cleanPhone.length < 8) {
            return { success: false, error: "Please enter a valid phone number with country code" };
        }

        const jid = `${cleanPhone}@s.whatsapp.net`;
        const displayName = name?.trim() || `+${cleanPhone}`;
        const messageText = initialMessage?.trim() || "Hello!";

        // Ensure active socket before sending
        if (typeof konnectLegacyManager?.ensureActiveSocket === 'function') {
            await konnectLegacyManager.ensureActiveSocket(sessionId);
        } else if (typeof konnectLegacyManager?.connect === 'function') {
            await konnectLegacyManager.connect(sessionId);
        }

        // Send via linked phone
        const sent = await konnectLegacyManager.sendMessage(sessionId, jid, messageText);

        // Save contact in isolated table
        await db.konnectLegacyContact.upsert({
            where: {
                workspaceId_phone: {
                    workspaceId,
                    phone: cleanPhone
                }
            },
            update: {
                name: displayName,
                lastMessage: messageText,
                lastInteraction: new Date()
            },
            create: {
                workspaceId,
                userId,
                name: displayName,
                phone: cleanPhone,
                lastMessage: messageText,
                lastInteraction: new Date(),
                tags: ['Manual Chat']
            }
        }).catch(() => {});

        const conversation = {
            jid,
            phone: cleanPhone,
            name: displayName,
            isGroup: false,
            lastMessage: messageText,
            timestamp: Date.now(),
            status: 'SENT',
            unread: 0,
            createdAt: new Date()
        };

        return {
            success: true,
            conversation,
            message: {
                id: sent.key?.id || `out_${Date.now()}`,
                jid,
                text: messageText,
                fromMe: true,
                status: 'SENT',
                timestamp: Date.now()
            }
        };
    } catch (error) {
        console.error("[START_NEW_CHAT_ERROR]", error);
        return { success: false, error: error.message || "Failed to start chat" };
    }
}

