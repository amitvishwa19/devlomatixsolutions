import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import parser from "cron-parser";

// Helper for v5.5.0 ESM compatibility
const getCron = () => {
    const p = parser.default || parser;
    // v5.5.0 uses p.parse, previous versions use p.parseExpression
    const parseFn = p.parse || p.parseExpression;
    return { parseExpression: parseFn.bind(p) };
};
const cron = getCron();

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
        let { name, description, cronExpression, targetType, targetId } = await req.json();

        if (!name || !cronExpression || !targetId) {
            return NextResponse.json({ message: `Missing required fields: ${!name ? 'name ' : ''}${!cronExpression ? 'expression ' : ''}${!targetId ? 'target' : ''}` }, { status: 400 });
        }

        // Validate Schedule
        let nextRunAt;
        try {
            const trimmedExpression = cronExpression.trim();
            const interval = cron.parseExpression(trimmedExpression);
            nextRunAt = interval.next().toDate();
            cronExpression = trimmedExpression; 
        } catch (err) {
            return NextResponse.json({ message: `Invalid cron expression "${cronExpression}": ${err.message}` }, { status: 400 });
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
