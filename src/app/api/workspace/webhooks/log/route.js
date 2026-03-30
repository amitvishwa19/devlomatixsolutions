import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        console.log("--------------------------------------------------");
        console.log("[WEBHOOK_LOG_START] NEW POST REQUEST RECEIVED");

        // Handle empty or non-JSON payloads gracefully
        let body = {};
        const contentType = req.headers.get("content-type") || "";

        try {
            if (contentType.includes("application/json")) {
                body = await req.json();
            } else {
                const text = await req.text();
                body = { rawText: text, info: "Content-Type was not application/json" };
            }
        } catch (e) {
            body = { error: "JSON_PARSE_FAILED", message: e.message };
        }

        console.log("[WEBHOOK_LOG_PAYLOAD]", JSON.stringify(body, null, 2));

        const { searchParams } = new URL(req.url);

        // Configuration: Use provided info or defaults
        const workspaceId = body.workspaceId || "cmnbhifag000458ikwhv1zso2";
        const level = (body.level || "INFO").toUpperCase();
        const type = (body.type || "WEBHOOK").toUpperCase();
        const message = body.message || "Incoming Webhook Capture";



        // Prepare detailed log entry
        const logData = {
            workspaceId,
            level,
            type,
            message,
            details: {
                payload: body,
                query: Object.fromEntries(searchParams.entries()),
                sourceIp: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
                receivedAt: new Date().toISOString()
            }
        };

        console.log("[WEBHOOK_LOG_SAVING]", JSON.stringify(logData, null, 2));

        // Save to database
        const newLog = await db.systemLog.create({
            data: logData
        });

        console.log("[WEBHOOK_LOG_SUCCESS] ID:", newLog.id);
        console.log("--------------------------------------------------");

        return NextResponse.json({
            success: true,
            message: "Log entry created successfully",
            recordedData: 'newLog'
        });


    } catch (error) {
        console.error("[WEBHOOK_LOG_ERROR]", error);
        console.log("--------------------------------------------------");

        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

// Allow GET for quick testing if needed, though request was for POST
export async function GET() {
    return NextResponse.json({
        message: "Webhook endpoint active. Please use POST to log data.",
        usage: "POST /api/workspace/webhooks/log { message, level, type, ...details }"
    });
}
