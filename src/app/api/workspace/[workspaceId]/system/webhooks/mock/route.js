import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const body = await req.json();

        // Log the incoming webhook
        await prisma.systemLog.create({
            data: {
                workspaceId,
                level: "SUCCESS",
                type: "WEBHOOK",
                message: `Mock Received: ${body.event || 'test'}`,
                details: body
            }
        });

        return NextResponse.json({
            message: "Webhook received successfully",
            echo: body
        });
    } catch (error) {
        console.error("Mock Webhook Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
