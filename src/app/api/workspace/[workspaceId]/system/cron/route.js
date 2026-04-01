import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import parser from "cron-parser";

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId;

        const crons = await db.systemCron.findMany({
            where: { workspaceId, userId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, data: crons });
    } catch (error) {
        console.error("[CRON_GET]", error);
        return NextResponse.json({ 
            success: false, 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId;
        const { name, description, cronExpression, targetType, targetId } = await req.json();

        if (!name || !cronExpression || !targetId) {
            return NextResponse.json({ message: "Name, cron expression, and target are required." }, { status: 400 });
        }

        // Validate Schedule
        let nextRunAt;
        try {
            const interval = parser.parseExpression(cronExpression);
            nextRunAt = interval.next().toDate();
        } catch (err) {
            return NextResponse.json({ message: "Invalid cron expression. Use format '* * * * *'" }, { status: 400 });
        }

        const cronJob = await db.systemCron.create({
            data: {
                name,
                description,
                cronExpression,
                status: "ACTIVE",
                targetType: targetType || "SYSTEM",
                targetId,
                nextRunAt,
                workspaceId,
                userId
            }
        });

        return NextResponse.json({ success: true, data: cronJob });
    } catch (error) {
        console.error("[CRON_POST]", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
