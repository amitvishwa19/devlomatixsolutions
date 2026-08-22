import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";
import { getMediaUrl } from "@/app/workspace/[workspaceId]/konnectx/_lib/whatsapp-cloud-api";
import { sendAndroidNotification } from "@/utils/fcm-notification";

// The VERIFY_TOKEN is now strictly tied to the ENCRYPTION_KEY environment variable
const VERIFY_TOKEN = process.env.ENCRYPTION_KEY;

/**
 * GET Handler: Handshake for Meta Webhook Verification
 */
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const mode = searchParams.get("hub.mode");
        const token = searchParams.get("hub.verify_token");
        const challenge = searchParams.get("hub.challenge");

        console.log(`🔍 [Webhook] Handshake Request:`, { mode, token });

        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            console.log("✅ [Webhook] Token verified! Responding with challenge.");
            return new Response(challenge, {
                status: 200,
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        console.error("❌ [Webhook] Token Mismatch or Invalid Mode:", { mode, token });
        return new Response("Forbidden", { status: 403 });
    } catch (error) {
        console.error("🔥 [Webhook] Handshake Error:", error);
        return new Response("Internal Error", { status: 500 });
    }
}

/**
 * POST Handler: Processing Incoming WhatsApp Messages
 */
export async function POST(req) {
    try {
        console.log('WHatsapp cloud webhook route')
        const body = await req.json();
        console.log('🚀 [Webhook] Incoming Payload:', JSON.stringify(body, null, 2));

        // Check if it's a WhatsApp message event
        if (body.object === "whatsapp_business_account" && body.entry?.[0]?.changes?.[0]?.value) {
            const value = body.entry[0].changes[0].value;
            const phoneNumberId = value.metadata?.phone_number_id;
            const messages = value.messages;
            const statuses = value.statuses;

            // 1. Handle Status Updates (Delivered, Read, Failed)
            if (statuses && statuses.length > 0) {
                for (const statusObj of statuses) {
                    const status = statusObj.status;
                    const waId = statusObj.id;

                    try {
                        let updateData = { status: status.toUpperCase() };

                        // Capture failure reasons if available
                        if (status === 'failed' && statusObj.errors) {
                            const existingMsg = await db.whatsAppMessage.findUnique({ where: { waId } });
                            if (existingMsg) {
                                const metadata = existingMsg.metadata || {};
                                updateData.metadata = {
                                    ...metadata,
                                    error: statusObj.errors[0]
                                };
                            }
                        }

                        await db.whatsAppMessage.update({
                            where: { waId },
                            data: { ...updateData, updatedAt: new Date() }
                        });

                        // Phase 1: Update Delivery Log for Analytics
                        await db.whatsAppDeliveryLog.updateMany({
                            where: { waId },
                            data: {
                                status: status.toUpperCase(),
                                deliveredAt: status === 'delivered' ? new Date() : undefined,
                                readAt: status === 'read' ? new Date() : undefined,
                                error: status === 'failed' ? JSON.stringify(statusObj.errors?.[0]) : undefined
                            }
                        });
                    } catch (e) {
                        // Silent catch: message might not be in our local database
                    }
                }
            }

            if (messages && messages.length > 0) {
                // 1. Identify the user/credential associated with this phone number ID
                const credentials = await db.credentials.findMany({
                    where: { platform: 'WHATSAPP_CLOUD' }
                });

                let targetCred = null;
                for (const c of credentials) {
                    let cloudCreds = null;
                    const stored = c.credentials;
                    if (typeof stored === 'string' && stored.includes(':')) {
                        try {
                            const decryptedStr = symmetricDecrypt(stored);
                            cloudCreds = JSON.parse(decryptedStr);
                        } catch (e) { }
                    } else if (typeof stored === 'string') {
                        try { cloudCreds = JSON.parse(stored); } catch (e) { }
                    } else { cloudCreds = stored; }

                    if (cloudCreds?.enc) {
                        try {
                            const decryptedStr = symmetricDecrypt(cloudCreds.enc);
                            cloudCreds = JSON.parse(decryptedStr);
                        } catch (e) { }
                    }

                    const credPhoneId = String(cloudCreds?.phoneNumberId || cloudCreds?.phone_number_id || "");
                    if (credPhoneId === String(phoneNumberId)) {
                        targetCred = c;
                        break;
                    }
                }

                if (!targetCred) {
                    console.error(`[Webhook] No credential found matching PhoneID: ${phoneNumberId}`);
                    return NextResponse.json({ success: true });
                }

                const userId = targetCred.userId;

                // 2. Loop through all messages in the payload
                for (const message of messages) {
                    const from = message.from;
                    // Normalize JID: Ensure no '+' or spaces, and append @s.whatsapp.net
                    const cleanPhone = from.replace(/\D/g, '');
                    const contactJid = `${cleanPhone}@s.whatsapp.net`;

                    const msgId = message.id;
                    const timestamp = message.timestamp;

                    // Skip if message already exists
                    const existing = await db.whatsAppMessage.findUnique({ where: { waId: msgId } });
                    if (existing) continue;

                    let textBody = "";

                    // Determine content based on message type
                    switch (message.type) {
                        case "text":
                            textBody = message.text?.body || "";
                            break;
                        case "image":
                        case "video":
                        case "audio":
                        case "document":
                        case "sticker":
                            textBody = `[${message.type.toUpperCase()}] ${message[message.type]?.caption || ""}`;
                            // Try to get actual media URL from Meta
                            try {
                                const mediaId = message[message.type]?.id;
                                if (mediaId) {
                                    // Extract credentials from targetCred for getMediaUrl
                                    let cloudCreds = null;
                                    const stored = targetCred.credentials;
                                    if (typeof stored === 'string' && stored.includes(':')) {
                                        cloudCreds = JSON.parse(symmetricDecrypt(stored));
                                    } else if (typeof stored === 'string') {
                                        cloudCreds = JSON.parse(stored);
                                    } else { cloudCreds = stored; }

                                    if (cloudCreds?.enc) {
                                        cloudCreds = JSON.parse(symmetricDecrypt(cloudCreds.enc));
                                    }

                                    const urlRes = await getMediaUrl(cloudCreds, mediaId);
                                    if (urlRes.success) {
                                        message[message.type].url = urlRes.data;
                                    }
                                }
                            } catch (e) {
                                console.error('[Webhook] Media URL fetch error:', e);
                            }
                            break;
                        case "location":
                            const loc = message.location || {};
                            textBody = `📍 Location: ${loc.name || loc.address || "Shared Location"} (${loc.latitude}, ${loc.longitude})`;
                            break;
                        case "order": {
                            const order = message.order || {};
                            const items = order.product_items || [];
                            const itemsSummary = items.map(it => `${it.quantity || 1}x ${it.product_retailer_id || 'Product'} (${it.currency || 'INR'} ${it.item_price || 0})`).join(', ');
                            textBody = `🛒 Order received: ${itemsSummary || 'Catalog Items'}${order.text ? ` — "${order.text}"` : ''}`;
                            message.order_data = order;
                            break;
                        }
                        case "interactive": {
                            const interactive = message.interactive || {};
                            const iType = interactive?.type;

                            if (iType === "button_reply") {
                                textBody = interactive.button_reply?.title || "[Button Selection]";
                            } else if (iType === "list_reply") {
                                textBody = `${interactive.list_reply?.title || "[Menu Selection]"}${interactive.list_reply?.description ? ` — ${interactive.list_reply.description}` : ''}`;
                            } else if (iType === "nfm_reply") {
                                // Flow completion
                                const nfmReply = interactive.nfm_reply || {};
                                let flowData = {};
                                try {
                                    flowData = JSON.parse(nfmReply.response_json || "{}");
                                } catch (_) {}
                                textBody = `[Flow: ${nfmReply.name || 'Form'}] Submitted`;

                                console.log("✅ [Webhook] Flow Response Received:", {
                                    flowName: nfmReply.name,
                                    data: flowData
                                });

                                message.flow_data = flowData;
                                message.flow_name = nfmReply.name;
                            } else if (iType === "product_inquiry") {
                                const prodId = interactive.product_inquiry?.product_retailer_id || '';
                                textBody = `🛍️ Inquiry for product: ${prodId}`;
                            } else if (iType === "order_details") {
                                textBody = `🛒 WhatsApp Order Details`;
                            } else if (iType === "catalog_message") {
                                textBody = `🛍️ WhatsApp Catalog Selected`;
                            } else {
                                textBody = interactive.body?.text || interactive.header?.text || "[Interactive Message]";
                            }
                            break;
                        }
                        case "button":
                            textBody = message.button?.text || "[Button Click]";
                            break;
                        case "reaction":
                            const react = message.reaction || {};
                            textBody = `[Reaction: ${react.emoji || "removed"}]`;
                            break;
                        case "contacts":
                            const contact = message.contacts?.[0] || {};
                            textBody = `👤 Contact: ${contact.name?.formatted_name || "Shared Contact"}`;
                            break;
                        case "poll":
                            const poll = message.poll || {};
                            textBody = `📊 Poll: ${poll.name || "New Poll"}`;
                            break;
                        case "unsupported":
                            textBody = "[WhatsApp System/Unsupported Message]";
                            break;
                        default:
                            textBody = `[${message.type.toUpperCase()}]`;
                    }

                    console.log(`[Webhook] Processing ${message.type} from ${from}: ${textBody}`);

                    // Phase 3: Auto-Sync Contact
                    try {
                        const phone = from.replace(/\D/g, '');
                        let contact = await db.contact.findFirst({
                            where: { userId, phone: { contains: phone } }
                        });

                        if (!contact) {
                            contact = await db.contact.create({
                                data: {
                                    userId,
                                    name: value.contacts?.[0]?.profile?.name || `WA User (${phone})`,
                                    phone,
                                    type: 'LEAD',
                                    tags: ['WHATSAPP_LEAD'],
                                    lastInteraction: new Date(),
                                    lastMessage: JSON.stringify({
                                        text: textBody,
                                        type: message.type,
                                        url: message[message.type]?.url || null,
                                        caption: message[message.type]?.caption || null,
                                        timestamp: timestamp
                                    })
                                }
                            });
                        } else {
                            // Update last interaction
                            await db.contact.update({
                                where: { id: contact.id },
                                data: {
                                    lastInteraction: new Date(),
                                    lastMessage: JSON.stringify({
                                        text: textBody,
                                        type: message.type,
                                        url: message[message.type]?.url || null,
                                        caption: message[message.type]?.caption || null,
                                        timestamp: timestamp
                                    })
                                }
                            });
                        }
                    } catch (contactErr) {
                        console.error('[Webhook] Contact Sync Error:', contactErr);
                    }

                    // Phase 2: Trigger Bot Engine
                    try {
                        const workspaceId = targetCred.workspaceId;
                        if (workspaceId) {
                            const { waBotEngine } = await import("@/app/workspace/[workspaceId]/konnectx/_lib/bot-engine");
                            waBotEngine.processIncomingMessage(userId, workspaceId, from, textBody).catch(e => console.error('[Webhook] Bot Error:', e));
                        }
                    } catch (botErr) {
                        console.error('[Webhook] Bot Engine Trigger Error:', botErr);
                    }

                    // 3. Save Message to Database
                    await db.whatsAppMessage.create({
                        data: {
                            userId,
                            waId: msgId,
                            jid: contactJid,
                            text: textBody,
                            fromMe: false,
                            timestamp: BigInt(timestamp),
                            status: "RECEIVED",
                            metadata: {
                                type: message.type,
                                interactiveType: message.interactive?.type || null,
                                interactive: message.interactive || null,
                                order: message.order_data || message.order || null,
                                context: message.context || null,
                                referred_product: message.context?.referred_product || null,
                                mediaUrl: message[message.type]?.url,
                                caption: message[message.type]?.caption,
                                fileName: message[message.type]?.filename,
                                mimetype: message[message.type]?.mime_type,
                                raw: message,
                                phone_number_id: phoneNumberId,
                                flow_name: message.flow_name,
                                flow_data: message.flow_data
                            }
                        }
                    });

                    // 4. Send Push Notification
                    try {
                        console.log("targetCred.workspaceId", targetCred.workspaceId)
                        const workspaceId = targetCred.workspaceId;
                        if (workspaceId) {
                            // Find all users in this workspace to notify
                            const workspaceUsers = await db.user.findMany({
                                where: { members: { some: { serverId: workspaceId } } },
                                select: { id: true, deviceToken: true, expoPushToken: true }
                            });

                            const pushPromises = [];
                            for (const wsUser of workspaceUsers) {
                                const pushToken = wsUser.deviceToken || wsUser.expoPushToken;
                                if (pushToken) {
                                    pushPromises.push(
                                        sendAndroidNotification({
                                            token: pushToken,
                                            title: `WhatsApp from ${from}`,
                                            body: textBody,
                                            data: {
                                                type: 'whatsapp_message',
                                                sender: from,
                                                workspaceId: workspaceId
                                            }
                                        }).catch(err => console.error('[Webhook] Push Notification Error:', err))
                                    );
                                }
                            }
                            await Promise.allSettled(pushPromises);
                        }
                    } catch (pushErr) {
                        console.error('[Webhook] Failed to dispatch push notifications:', pushErr);
                    }
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Webhook Error]", error);
        return NextResponse.json({ error: "Webhook Processing Failed" }, { status: 500 });
    }
}
