import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId;

        const workflows = await db.workflow.findMany({
            where: { workspaceId, userId },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json({ success: true, data: workflows });
    } catch (error) {
        console.error("[WORKSPACE_FLOWBOTS_GET]", error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
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
        const body = await req.json().catch(() => ({}));
        
        const name = body.name || "Untitled Flowbot";
        const description = body.description || "A new automation workflow.";

        const workflow = await db.workflow.create({
            data: {
                name,
                description,
                workspaceId,
                userId,
                nodes: [],
                edges: [],
                status: "DRAFT"
            }
        });

        return NextResponse.json({ success: true, data: workflow });
    } catch (error) {
        console.error("[WORKSPACE_FLOWBOTS_POST]", error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
