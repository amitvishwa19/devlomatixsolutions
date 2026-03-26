import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const payload = await req.json();
        const headers = Object.fromEntries(req.headers.entries());

        console.log(`[OpenClaw Webhook] Received event for workspace: ${workspaceId}`);
        console.log("Payload:", JSON.stringify(payload, null, 2));

        // Log the event in SystemLog for the Activity Feed
        await prisma.systemLog.create({
            data: {
                workspaceId,
                type: 'WEBHOOK_INBOUND',
                level: 'SUCCESS',
                message: `OpenClaw Trigger: ${payload.event || 'Unknown Event'}`,
                details: {
                    source: 'OpenClaw',
                    event: payload.event,
                    data: payload.data || payload,
                    timestamp: new Date().toISOString()
                }
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: "Webhook received and logged",
            receivedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error("OpenClaw Webhook Error:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Failed to process webhook" 
        }, { status: 500 });
    }
}
