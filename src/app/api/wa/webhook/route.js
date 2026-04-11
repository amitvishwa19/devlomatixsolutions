import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";

// This is the token you will enter in the Meta Developer Dashboard
const VERIFY_TOKEN = "HEALTHYFINE_WA_WEBHOOK_SECRET";

/**
 * GET Handler: Handshake for Meta Webhook Verification
 */
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const mode = searchParams.get("hub.mode");
        const token = searchParams.get("hub.verify_token");
        const challenge = searchParams.get("hub.challenge");

        console.log(`🔍 [Webhook] Verification Handshake:`, { mode, token, challenge });

        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            console.log("✅ [Webhook] Token Match! Responding with challenge...");
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
        const body = await req.json();
        //console.log('🚀 [Webhook] Incoming Payload:', JSON.stringify(body, null, 2));

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
                // ... (targetCred logic) ...
                const userId = targetCred.userId;

                // 2. Loop through all messages in the payload
                for (const message of messages) {
                    const from = message.from;
                    const msgId = message.id;
                    const timestamp = message.timestamp;

                    let textBody = "";
                    // ... (switch message.type logic) ...

                    // 145: //console.log(`[Webhook] Processing ${message.type} from ${from}: ${textBody}`);

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
                                    tags: ['WHATSAPP_LEAD']
                                }
                            });
                        } else {
                            // Update last interaction
                            await db.contact.update({
                                where: { id: contact.id },
                                data: { lastInteraction: new Date(), lastMessage: textBody }
                            });
                        }
                    } catch (contactErr) {
                        console.error('[Webhook] Contact Sync Error:', contactErr);
                    }

                    // Phase 2: Trigger Bot Engine
                    try {
                        const workspaceId = targetCred.workspaceId || "cmnbhifag000458ikwhv1zso2"; // Fallback to provided default
                        const { waBotEngine } = await import("@/app/workspace/[workspaceId]/wa/_lib/bot-engine");
                        waBotEngine.processIncomingMessage(userId, workspaceId, from, textBody).catch(e => console.error('[Webhook] Bot Error:', e));
                    } catch (botErr) {
                        console.error('[Webhook] Bot Engine Trigger Error:', botErr);
                    }

                    // 3. Save Message to Database
                    await db.whatsAppMessage.create({
                        data: {
                            userId,
                            waId: msgId,
                            jid: from,
                            text: textBody,
                            fromMe: false,
                            timestamp: BigInt(timestamp),
                            status: "RECEIVED",
                            metadata: {
                                raw: message,
                                phone_number_id: phoneNumberId
                            }
                        }
                    });
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Webhook Error]", error);
        return NextResponse.json({ error: "Webhook Processing Failed" }, { status: 500 });
    }
}
