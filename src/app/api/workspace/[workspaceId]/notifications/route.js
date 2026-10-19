import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

let tableEnsured = false;

async function ensureTable() {
    if (tableEnsured) return;
    try {
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS workspace_notifications (
                id TEXT PRIMARY KEY,
                workspace_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                type TEXT NOT NULL DEFAULT 'SYSTEM',
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                link TEXT,
                read BOOLEAN NOT NULL DEFAULT FALSE,
                metadata JSONB,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_ws_notif_user ON workspace_notifications(user_id, workspace_id, read);
            CREATE INDEX IF NOT EXISTS idx_ws_notif_time ON workspace_notifications(created_at DESC);
        `);
        tableEnsured = true;
    } catch (err) {
        console.warn("[NOTIFICATIONS_DB_WARN] Could not auto-ensure table:", err?.message);
    }
}

// GET /api/workspace/[workspaceId]/notifications
export async function GET(req, { params }) {
    try {
        const resolvedParams = await params;
        const workspaceId = resolvedParams?.workspaceId;

        if (!workspaceId) {
            return NextResponse.json({ message: "Workspace ID is required" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        const userId = session?.user?.userId || session?.user?.id;

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await ensureTable();

        const rows = await prisma.$queryRawUnsafe(`
            SELECT id, workspace_id as "workspaceId", user_id as "userId",
                   type, title, message, link, read, metadata,
                   created_at as "createdAt"
            FROM workspace_notifications
            WHERE user_id = $1 AND workspace_id = $2
            ORDER BY created_at DESC
            LIMIT 50
        `, userId, workspaceId).catch(() => []);

        const notifications = (rows || []).map(r => ({
            id: r.id,
            workspaceId: r.workspaceId,
            userId: r.userId,
            type: r.type,
            title: r.title,
            message: r.message,
            link: r.link,
            read: Boolean(r.read),
            metadata: r.metadata || null,
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString()
        }));

        const unreadCount = notifications.filter(n => !n.read).length;

        return NextResponse.json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error("[NOTIFICATIONS_GET_ERROR]", error);
        return NextResponse.json({
            notifications: [],
            unreadCount: 0,
            error: error.message
        }, { status: 200 }); // Return empty array to keep UI resilient
    }
}

// POST /api/workspace/[workspaceId]/notifications
export async function POST(req, { params }) {
    try {
        const resolvedParams = await params;
        const workspaceId = resolvedParams?.workspaceId;
        const session = await getServerSession(authOptions);
        const currentUserId = session?.user?.userId || session?.user?.id;

        const body = await req.json().catch(() => ({}));
        const {
            id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            userId = currentUserId,
            type = 'SYSTEM',
            title,
            message,
            link = null,
            metadata = null
        } = body;

        if (!title || !message) {
            return NextResponse.json({ message: "Title and message are required" }, { status: 400 });
        }

        const targetUserId = userId || currentUserId;
        if (!targetUserId) {
            return NextResponse.json({ message: "Target user ID is required" }, { status: 400 });
        }

        await ensureTable();

        await prisma.$executeRawUnsafe(`
            INSERT INTO workspace_notifications (id, workspace_id, user_id, type, title, message, link, read, metadata, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8::jsonb, NOW())
            ON CONFLICT (id) DO NOTHING
        `, id, workspaceId, targetUserId, type, title, message, link, metadata ? JSON.stringify(metadata) : null);

        return NextResponse.json({
            success: true,
            notification: {
                id,
                workspaceId,
                userId: targetUserId,
                type,
                title,
                message,
                link,
                read: false,
                metadata,
                createdAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error("[NOTIFICATIONS_POST_ERROR]", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// PATCH /api/workspace/[workspaceId]/notifications (Mark as Read)
export async function PATCH(req, { params }) {
    try {
        const resolvedParams = await params;
        const workspaceId = resolvedParams?.workspaceId;
        const session = await getServerSession(authOptions);
        const userId = session?.user?.userId || session?.user?.id;

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const { id, all } = body;

        await ensureTable();

        if (all) {
            await prisma.$executeRawUnsafe(`
                UPDATE workspace_notifications
                SET read = true
                WHERE user_id = $1 AND workspace_id = $2 AND read = false
            `, userId, workspaceId);
        } else if (id) {
            await prisma.$executeRawUnsafe(`
                UPDATE workspace_notifications
                SET read = true
                WHERE id = $1 AND user_id = $2
            `, id, userId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[NOTIFICATIONS_PATCH_ERROR]", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// DELETE /api/workspace/[workspaceId]/notifications (Delete or Clear All)
export async function DELETE(req, { params }) {
    try {
        const resolvedParams = await params;
        const workspaceId = resolvedParams?.workspaceId;
        const session = await getServerSession(authOptions);
        const userId = session?.user?.userId || session?.user?.id;

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const idFromQuery = url.searchParams.get("id");
        const allFromQuery = url.searchParams.get("all") === "true";

        const body = await req.json().catch(() => ({}));
        const id = body.id || idFromQuery;
        const all = body.all ?? allFromQuery;

        await ensureTable();

        if (all) {
            await prisma.$executeRawUnsafe(`
                DELETE FROM workspace_notifications
                WHERE user_id = $1 AND workspace_id = $2
            `, userId, workspaceId);
        } else if (id) {
            await prisma.$executeRawUnsafe(`
                DELETE FROM workspace_notifications
                WHERE id = $1 AND user_id = $2
            `, id, userId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[NOTIFICATIONS_DELETE_ERROR]", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
