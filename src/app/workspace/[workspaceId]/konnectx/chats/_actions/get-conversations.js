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

        // Also include userIds from all credentials associated with this workspace
        const workspaceCreds = await db.credentials.findMany({
            where: {
                OR: [
                    { workspaceId },
                    { userId: { in: workspaceUserIds } }
                ]
            }
        }).catch(() => []);

        workspaceCreds.forEach(c => {
            if (c.userId && !workspaceUserIds.includes(c.userId)) {
                workspaceUserIds.push(c.userId);
            }
        });

        // 2. Resolve Active Default Credential (Prioritize user's switched default)
        let defaultCredential = await db.credentials.findFirst({
            where: { userId, platform: 'WHATSAPP_CLOUD', isDefault: true }
        }).catch(() => null);

        if (!defaultCredential) {
            defaultCredential = await db.credentials.findFirst({
                where: { workspaceId, platform: 'WHATSAPP_CLOUD', isDefault: true }
            }).catch(() => null);
        }

        if (!defaultCredential) {
            defaultCredential = await db.credentials.findFirst({
                where: { userId: { in: workspaceUserIds }, platform: 'WHATSAPP_CLOUD', isDefault: true }
            }).catch(() => null);
        }

        if (!defaultCredential) {
            const defaultInfo = await getWhatsappDefault(workspaceId).catch(() => null);
            if (defaultInfo?.credentialId) {
                defaultCredential = await db.credentials.findUnique({ where: { id: defaultInfo.credentialId } }).catch(() => null);
            }
        }

        if (!defaultCredential) {
            defaultCredential = await db.credentials.findFirst({
                where: {
                    OR: [
                        { workspaceId, platform: 'WHATSAPP_CLOUD' },
                        { userId: { in: workspaceUserIds }, platform: 'WHATSAPP_CLOUD' },
                    ]
                },
                orderBy: { updatedAt: 'desc' }
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

        const allProducts = db.eCommerceProduct.findMany({
            where: { userId: { in: workspaceUserIds } }
        }).catch(() => []);

        const allTemplates = db.messageTemplate.findMany({
            where: {
                OR: [
                    { workspaceId },
                    { userId: { in: workspaceUserIds } }
                ]
            },
            select: {
                id: true,
                name: true,
                templateName: true,
                type: true,
                header: true,
                body: true,
                footer: true,
                buttons: true,
                metadata: true
            }
        }).catch(() => []);

        const [contacts, shares, products, templates] = await Promise.all([
            allContacts,
            allShares,
            allProducts,
            allTemplates
        ]);

        const templateMap = new Map();
        (templates || []).forEach(t => {
            if (t.name) templateMap.set(t.name.toLowerCase().trim(), t);
            if (t.templateName) templateMap.set(t.templateName.toLowerCase().trim(), t);
        });

        // 4. Fetch messages: workspace user messages + assigned messages + contact-related messages
        const contactJidPatterns = contacts.map(c => {
            if (!c.phone) return null;
            return c.phone.replace(/\D/g, '');
        }).filter(Boolean);

        const ownMessages = await db.whatsAppMessage.findMany({
            where: {
                OR: [
                    { userId: { in: workspaceUserIds } },
                    ...(contactJidPatterns.length > 0 ? [
                        { jid: { in: contactJidPatterns.map(d => `${d}@s.whatsapp.net`) } },
                        { jid: { in: contactJidPatterns.map(d => (d.length === 10 ? `91${d}@s.whatsapp.net` : `${d}@s.whatsapp.net`)) } }
                    ] : [])
                ]
            },
            orderBy: [{ timestamp: 'desc' }, { createdAt: 'desc' }]
        }).catch(() => []);

        const assignedMessages = assignedJids.length > 0
            ? await db.whatsAppMessage.findMany({
                where: { jid: { in: assignedJids } },
                orderBy: [{ timestamp: 'desc' }, { createdAt: 'desc' }]
            }).catch(() => [])
            : [];

        const skuProductMap = new Map();
        const titleProductMap = new Map();
        (products || []).forEach(p => {
            if (p.sku) skuProductMap.set(String(p.sku).toLowerCase().trim(), p);
            if (p.title) titleProductMap.set(String(p.title).toLowerCase().trim(), p);
        });

        // Use all fetched messages for the workspace so all chats remain visible
        const messages = ownMessages;
        const assignedMsgs = assignedMessages;

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

            let meta = {};
            if (typeof msg.metadata === 'string') {
                try { meta = JSON.parse(msg.metadata); } catch (e) { meta = {}; }
            } else if (msg.metadata && typeof msg.metadata === 'object') {
                meta = JSON.parse(JSON.stringify(msg.metadata));
            }

            // Auto-enrich product image and info if not present
            if (!meta.productImageUrl && !meta.mediaUrl && !meta.imageUrl) {
                const rawText = msg.text || '';
                const skuMatch = meta.retailerId ||
                    rawText.match(/SKU_([A-Za-z0-9_-]+)/i)?.[0] ||
                    rawText.match(/SKU:\s*`?([A-Za-z0-9_-]+)`?/i)?.[1];
                const titleMatch = meta.productTitle ||
                    rawText.match(/\[Product:\s*([^\]]+)\]/i)?.[1] ||
                    rawText.match(/🛍️\s*\*([^*]+)\*/)?.[1];

                const matched = (skuMatch && skuProductMap.get(String(skuMatch).toLowerCase().trim())) ||
                                (titleMatch && titleProductMap.get(String(titleMatch).toLowerCase().trim()));

                if (matched) {
                    const img = (Array.isArray(matched.imageUrls) ? matched.imageUrls[0] : matched.imageUrl) || matched.image_url;
                    if (img) meta.productImageUrl = img;
                    meta.productTitle = meta.productTitle || matched.title;
                    meta.productPrice = meta.productPrice || matched.price;
                    meta.productCurrency = meta.productCurrency || matched.currency || 'INR';
                    meta.retailerId = meta.retailerId || matched.sku;
                    if (!meta.interactiveType && (meta.type === 'interactive' || rawText.includes('[Product:'))) {
                        meta.interactiveType = 'product';
                    }
                }
            }

            // Auto-enrich template message content if not already expanded
            const isTemplate =
                meta.type === 'template' ||
                meta.type === 'TEMPLATE' ||
                Boolean(meta.templateName) ||
                Boolean(meta.originalPayload?.template?.name) ||
                (typeof msg.text === 'string' && msg.text.startsWith('[Template:'));

            if (isTemplate) {
                const templateName =
                    meta.templateName ||
                    meta.originalPayload?.template?.name ||
                    meta.originalPayload?.name ||
                    (typeof msg.text === 'string' && msg.text.startsWith('[Template:')
                        ? msg.text.split('[Template:')[1]?.split(']')[0]?.trim()
                        : null);

                if (templateName) {
                    const tpl = templateMap.get(templateName.toLowerCase().trim());
                    if (tpl) {
                        meta.templateName = tpl.templateName || tpl.name;
                        meta.templateDefinition = tpl;

                        let bodyText = tpl.body || '';
                        const payloadComponents =
                            meta.originalPayload?.template?.components ||
                            meta.originalPayload?.components ||
                            meta.components ||
                            [];
                        const bodyComp = payloadComponents.find(
                            (c) => (c.type || '').toLowerCase() === 'body'
                        );
                        const params = bodyComp?.parameters || meta.parameters || meta.vars || [];

                        if (Array.isArray(params)) {
                            params.forEach((p, idx) => {
                                const val = typeof p === 'object' ? p.text || p.value || '' : String(p || '');
                                if (val) {
                                    bodyText = bodyText.replace(new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g'), val);
                                }
                            });
                        }

                        if (meta.candidateName) bodyText = bodyText.replace(/\{\{1\}\}/g, meta.candidateName).replace(/\{\{name\}\}/gi, meta.candidateName);
                        if (meta.jobTitle) bodyText = bodyText.replace(/\{\{2\}\}/g, meta.jobTitle).replace(/\{\{jobTitle\}\}/gi, meta.jobTitle);
                        if (meta.companyName) bodyText = bodyText.replace(/\{\{3\}\}/g, meta.companyName).replace(/\{\{companyName\}\}/gi, meta.companyName);

                        bodyText = bodyText.replace(/\{\{\d+\}\}/g, '').trim();

                        if (bodyText) {
                            msg.text = bodyText;
                        }
                    }
                }

                if ((!msg.text || msg.text.startsWith('[Template:')) && typeof msg.text === 'string') {
                    const clean = msg.text.replace(/^\[Template:[^\]]+\]\s*/, '').trim();
                    if (clean) msg.text = clean;
                }
            }

            const msgPreview = JSON.stringify({
                text: msg.text || '',
                type: isTemplate ? 'template' : (meta.type || 'text'),
                url: meta.productImageUrl || meta.mediaUrl || meta.raw?.[meta.type]?.url || null,
                caption: meta.caption || meta.raw?.[meta.type]?.caption || null,
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
                    metadata: meta,
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
                activePhoneId,
                conversations: JSON.parse(JSON.stringify(conversations))
            } 
        };
    } catch (error) {
        console.error("[getConversations] Error:", error);
        return { error: error.message || "Failed to fetch conversations" };
    }
};

export const getConversations = createSafeAction(GetConversationsSchema, handler);
