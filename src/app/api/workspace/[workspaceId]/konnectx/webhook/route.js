import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { waBotEngine } from "@/app/workspace/[workspaceId]/konnectx/_lib/bot-engine";
import { sendAndroidNotification } from "@/utils/fcm-notification";

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const searchParams = new URL(req.url).searchParams;
        const mode = searchParams.get("hub.mode");
        const token = searchParams.get("hub.verify_token");
        const challenge = searchParams.get("hub.challenge");

        console.log(`[WhatsApp Webhook] Verification request for workspace: ${workspaceId}`);
        console.log(`[WhatsApp Webhook] Mode: ${mode}, Token: ${token}`);

        const settings = await prisma.workspaceSettings.findFirst({
            where: { workspaceId },
            select: { whatsappWebhookToken: true }
        });

        const verifyToken = settings?.whatsappWebhookToken || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'devlomatix_bot_verify';

        if (mode === "subscribe" && token === verifyToken) {
            console.log("[WhatsApp Webhook] Verification successful");
            return new NextResponse(challenge, { status: 200 });
        }

        console.log("[WhatsApp Webhook] Verification failed - invalid token");
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    } catch (error) {
        console.error("[WhatsApp Webhook] GET Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const payload = await req.json();

        console.log(`[WhatsApp Webhook] Received message for workspace: ${workspaceId}`);
        console.log("[WhatsApp Webhook] Payload:", JSON.stringify(payload, null, 2));

        const entry = payload?.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        if (value?.messages) {
            for (const message of value.messages) {
                const from = message.from;
                const text = message.text?.body || "";
                const messageId = message.id;
                const timestamp = message.timestamp;

                console.log(`[WhatsApp Webhook] Incoming from ${from}: ${text}`);

                await prisma.botExecution.create({
                    data: {
                        workspaceId,
                        botFlowId: null,
                        phone: String(from),
                        message,
                        status: 'PROCESSING',
                        triggeredAt: new Date(parseInt(timestamp) * 1000)
                    }
                });

                try {
                    const users = await prisma.user.findMany({
                        where: { members: { some: { serverId: workspaceId } } },
                        select: { id: true, deviceToken: true, expoPushToken: true }
                    });

                    const pushPromises = [];
                    for (const user of users) {
                        await waBotEngine.processIncomingMessage(
                            user.id,
                            workspaceId,
                            from,
                            text
                        );

                        const pushToken = user.deviceToken || user.expoPushToken;
                        if (pushToken) {
                            pushPromises.push(
                                sendAndroidNotification({
                                    token: pushToken,
                                    title: `WhatsApp from ${from}`,
                                    body: text,
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

                    await prisma.botExecution.updateMany({
                        where: {
                            workspaceId,
                            phone: String(from),
                            status: 'PROCESSING'
                        },
                        data: {
                            status: 'COMPLETED',
                            completedAt: new Date()
                        }
                    });

                } catch (execError) {
                    console.error("[WhatsApp Webhook] Execution error:", execError);

                    await prisma.botExecution.updateMany({
                        where: {
                            workspaceId,
                            phone: String(from),
                            status: 'PROCESSING'
                        },
                        data: {
                            status: 'FAILED',
                            error: execError.message
                        }
                    });
                }
            }
        }

        if (value?.statuses) {
            for (const status of value.statuses) {
                console.log(`[WhatsApp Webhook] Message status: ${status.status} for ${status.id}`);

                await prisma.systemLog.create({
                    data: {
                        workspaceId,
                        type: 'WHATSAPP_STATUS',
                        level: status.status === 'failed' ? 'ERROR' : 'INFO',
                        message: `Message ${status.status}: ${status.id}`,
                        details: {
                            messageId: status.id,
                            status: status.status,
                            recipient: status.recipient,
                            timestamp: status.timestamp
                        }
                    }
                });
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("[WhatsApp Webhook] POST Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}