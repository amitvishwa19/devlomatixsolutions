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
                            data: updateData
                        });
                    } catch (e) {
                        // Silent catch: message might not be in our local database
                    }
                }
            }

            if (messages && messages.length > 0) {
                // 1. Fetch all cloud credentials once to identify the user
                const allCloudCreds = await db.credentials.findMany({
                    where: { platform: 'WHATSAPP_CLOUD' }
                });

                const targetCred = allCloudCreds.find(c => {
                    try {
                        let creds = typeof c.credentials === 'string' ? JSON.parse(c.credentials) : c.credentials;

                        // Handle Encrypted Credentials
                        if (creds?.enc) {
                            const decryptedStr = symmetricDecrypt(creds.enc);
                            creds = JSON.parse(decryptedStr);
                        }

                        const storedId = String(creds?.phoneNumberId || creds?.phone_number_id || "");
                        return storedId === String(phoneNumberId);
                    } catch (e) {
                        return false;
                    }
                });

                if (!targetCred) {
                    console.error(`🔴 [Webhook] NO MATCH: Could not find user for PhoneID: ${phoneNumberId}`);
                    console.log(`[Webhook] Diagnostic - Database Content:`, allCloudCreds.map(c => {
                        try {
                            let creds = typeof c.credentials === 'string' ? JSON.parse(c.credentials) : c.credentials;
                            const isEnc = !!creds?.enc;
                            return { id: c.id, encrypted: isEnc, keys: Object.keys(creds || {}) };
                        } catch (e) { return "PARSE_ERROR"; }
                    }));
                    return NextResponse.json({ success: true, message: "Ignored: No matching user" });
                }

                const userId = targetCred.userId;

                // 2. Loop through all messages in the payload
                for (const message of messages) {
                    const from = message.from;
                    const msgId = message.id;
                    const timestamp = message.timestamp;

                    let textBody = "";
                    switch (message.type) {
                        case "text":
                            textBody = message.text.body;
                            break;
                        case "interactive":
                            const interactive = message.interactive;
                            if (interactive.type === "button_reply") textBody = interactive.button_reply.title;
                            else if (interactive.type === "list_reply") textBody = interactive.list_reply.title;
                            break;
                        case "image": textBody = "[Image received]"; break;
                        case "video": textBody = "[Video received]"; break;
                        case "audio": textBody = "[Audio received]"; break;
                        case "document": textBody = `[Document: ${message.document?.filename || "received"}]`; break;
                        case "location": textBody = "[Location shared]"; break;
                        case "sticker": textBody = "[Sticker received]"; break;
                        case "button": textBody = message.button.text; break;
                        default:
                            textBody = `[Message type: ${message.type}]`;
                    }

                    //console.log(`[Webhook] Processing ${message.type} from ${from}: ${textBody}`);

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
                                phone_number_id: phoneNumberId // Tag with Business ID for cross-user visibility
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
