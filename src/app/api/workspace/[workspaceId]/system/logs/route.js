import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { workspaceId } = await params;
        
        const { searchParams } = new URL(req.url);
        const level = searchParams.get('level');
        const type = searchParams.get('type');
        const limit = parseInt(searchParams.get('limit') || '50');
        const page = parseInt(searchParams.get('page') || '1');
        const offset = (page - 1) * limit;

        const where = {
            OR: [
                { workspaceId: workspaceId },
                { workspaceId: null } // Include global system logs if needed
            ]
        };

        if (level && level !== 'ALL') {
            where.level = level;
        }
        
        if (type && type !== 'ALL') {
            where.type = type;
        }

        // Using prisma for simple GET query
        const logs = await db.systemLog.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
            skip: offset,
            include: {
                // Optionally include user info if needed
            }
        });

        const total = await db.systemLog.count({ where });

        return NextResponse.json({
            logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("[SYSTEM_LOGS_GET_ERROR]", error);
        return NextResponse.json({ message: "Failed to fetch system logs" }, { status: 500 });
    }
}

// POST new log from client
export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { workspaceId } = await params;
        const { level, type, message, details } = await req.json();

        const log = await db.systemLog.create({
            data: {
                level: level || 'INFO',
                type: type || 'SYSTEM',
                message: message || 'Client log entry',
                workspaceId,
                userId: session.user.userId,
                details: details || null
            }
        });

        return NextResponse.json(log);
    } catch (error) {
        return NextResponse.json({ message: "Failed to save log" }, { status: 500 });
    }
}

// Optional: DELETE old logs (Housekeeping)
export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { workspaceId } = await params;
        
        // Delete logs older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await db.systemLog.deleteMany({
            where: {
                workspaceId,
                createdAt: {
                    lt: thirtyDaysAgo
                }
            }
        });

        return NextResponse.json({ message: `Cleared ${result.count} old logs` });

    } catch (error) {
        return NextResponse.json({ message: "Failed to clear logs" }, { status: 500 });
    }
}
