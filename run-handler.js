import { db } from './src/lib/db.js';
import { symmetricDecrypt } from './src/lib/encryption.js';

BigInt.prototype.toJSON = function() { return this.toString(); };

async function run() {
    const userId = 'cmorc8b0q0002m0ik8o8as06s';
    const workspaceId = 'cmorc8bws0006m0ik2zrlvl3i';

    try {
        console.log("--- 1. Find Credential ---");
        let defaultCredential = await db.credentials.findFirst({
            where: { userId, platform: 'WHATSAPP_CLOUD', isDefault: true }
        });

        if (!defaultCredential) {
            defaultCredential = await db.credentials.findFirst({
                where: { userId, platform: 'WHATSAPP_CLOUD' },
                orderBy: { updatedAt: 'desc' }
            });
        }

        console.log("Found credential:", defaultCredential ? defaultCredential.id : "none");
        if (!defaultCredential) {
            console.log("No credential found.");
            return;
        }

        let cloudCreds = null;
        const stored = defaultCredential.credentials;
        if (typeof stored === 'string' && stored.includes(':')) {
            try { cloudCreds = JSON.parse(symmetricDecrypt(stored)); } catch (e) { console.error("Decryption error 1:", e); }
        } else if (typeof stored === 'string') {
            try { cloudCreds = JSON.parse(stored); } catch (e) { console.error("JSON error 1:", e); }
        } else { cloudCreds = stored; }
        
        if (cloudCreds?.enc) {
            try { cloudCreds = JSON.parse(symmetricDecrypt(cloudCreds.enc)); } catch (e) { console.error("Decryption error 2:", e); }
        }
        const activePhoneId = String(cloudCreds?.phoneNumberId || cloudCreds?.phone_number_id || "");
        console.log("Active Phone ID:", activePhoneId);

        console.log("--- 2. Find assigned shares ---");
        const assignedShares = await db.conversationShare.findMany({
            where: { sharedWithUserId: userId, workspaceId }
        });
        console.log("Assigned shares:", assignedShares);
        const assignedJids = assignedShares.map(s => s.jid);

        console.log("--- 3. Fetch messages ---");
        const ownMessages = await db.whatsAppMessage.findMany({
            where: {
                userId,
                metadata: {
                    path: ['phone_number_id'],
                    equals: activePhoneId
                }
            },
            orderBy: { timestamp: 'desc' }
        });
        console.log("Own messages count:", ownMessages.length);

        const assignedMessages = assignedJids.length > 0
            ? await db.whatsAppMessage.findMany({
                where: {
                    jid: { in: assignedJids },
                    metadata: {
                        path: ['phone_number_id'],
                        equals: activePhoneId
                    }
                },
                orderBy: { timestamp: 'desc' }
            })
            : [];
        console.log("Assigned messages count:", assignedMessages.length);

        const allContacts = await db.contact.findMany({
            where: { userId }
        });
        console.log("All contacts count:", allContacts.length);

        const assigningUserIds = [...new Set(assignedShares.map(s => s.sharedByUserId))];
        const assignorContacts = assigningUserIds.length > 0
            ? await db.contact.findMany({ where: { userId: { in: assigningUserIds } } })
            : [];
        console.log("Assignor contacts count:", assignorContacts.length);

        const contactMap = {};
        allContacts.forEach(c => {
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

        ownMessages.forEach(msg => processMsg(msg, false));
        assignedMessages.forEach(msg => processMsg(msg, true));

        const conversations = Object.values(conversationsMap).sort((a, b) => b.timestamp - a.timestamp);
        console.log("Conversations fetched count:", conversations.length);
        console.log("Serialization test...");
        JSON.stringify(conversations);
        console.log("Serialization success!");

    } catch (e) {
        console.error("CRITICAL ERROR:", e);
    } finally {
        await db.$disconnect();
    }
}

run();
