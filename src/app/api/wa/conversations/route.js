import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { symmetricDecrypt } from "@/lib/encryption";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.userId || session.user.id;
        console.log(`🔍 [Conversations API] Fetching for UserID: ${userId}`);

        // 1. Fetch user's credentials to identify their phone IDs
        const userCredentials = await db.credentials.findMany({
            where: { userId, platform: 'WHATSAPP_CLOUD' }
        });

        const myPhoneIDs = userCredentials.map(c => {
            let cloudCreds = null;
            const stored = c.credentials;

            if (typeof stored === 'string' && stored.includes(':')) {
                try {
                    const decryptedStr = symmetricDecrypt(stored);
                    cloudCreds = JSON.parse(decryptedStr);
                } catch (e) {
                    console.error(`[Conversations API] Decryption failed!`, e);
                }
            } else if (typeof stored === 'string') {
                try {
                    cloudCreds = JSON.parse(stored);
                } catch (e) {
                    console.error(`[Conversations API] JSON Parse failed!`, e);
                }
            } else {
                cloudCreds = stored;
            }

            // Handle Legacy Object Wrapping
            if (cloudCreds?.enc) {
                try {
                    const decryptedStr = symmetricDecrypt(cloudCreds.enc);
                    cloudCreds = JSON.parse(decryptedStr);
                } catch (e) {
                    console.error(`[Conversations API] legacy Decryption failed!`, e);
                }
            }

            return String(cloudCreds?.phoneNumberId || cloudCreds?.phone_number_id || "");
        }).filter(id => id);

        console.log(`📡 [Conversations API] User manages PhoneIDs:`, myPhoneIDs);

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

        console.log(`📊 [Conversations API] Found ${messages.length} total messages and ${contacts.length} contacts for user.`);

        // Create a contact lookup map for faster name resolution
        const contactMap = {};
        contacts.forEach(c => {
            // Clean phone number (strip + and non-digits) to ensure a match with JID
            const cleanPhone = c.phone.replace(/\D/g, '');
            contactMap[cleanPhone] = c.name;
        });

        // 2. Group by JID to create conversation list
        const conversationsMap = {};
        messages.forEach(msg => {
            if (!conversationsMap[msg.jid]) {
                conversationsMap[msg.jid] = {
                    jid: msg.jid,
                    name: contactMap[msg.jid] || null, // Resolve name if contact exists
                    lastMessage: msg.text,
                    timestamp: Number(msg.timestamp),
                    fromMe: msg.fromMe,
                    unreadCount: 0,
                    messages: []
                };
            }
            // Add message to conversation (we'll only return a few for the sidebar preview)
            conversationsMap[msg.jid].messages.push({
                ...msg,
                timestamp: Number(msg.timestamp)
            });
        });

        const conversations = Object.values(conversationsMap).sort((a, b) => b.timestamp - a.timestamp);

        return NextResponse.json({ success: true, conversations });
    } catch (error) {
        console.error("[CONVERSATIONS_API_ERROR]", error);
        return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
    }
}
