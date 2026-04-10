import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const { workspaceId, flowbotId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Use findFirst for multi-field lookups without a composite unique index
        const workflow = await db.workflow.findFirst({
            where: { id: flowbotId, workspaceId }
        });

        if (!workflow) {
            return NextResponse.json({ message: "Flowbot not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: workflow });
    } catch (error) {
        console.error("[FLOWBOT_GET_ERROR]", error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const { workspaceId, flowbotId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { nodes, edges, name, description, status } = await req.json();

        // First check if it exists and belongs to the workspace
        const existing = await db.workflow.findFirst({
            where: { id: flowbotId, workspaceId }
        });

        if (!existing) {
            return NextResponse.json({ message: "Flowbot not found or unauthorized" }, { status: 404 });
        }

        const workflow = await db.workflow.update({
            where: { id: flowbotId }, // Primary key only for findUnique/update
            data: {
                nodes: nodes !== undefined ? nodes : undefined,
                edges: edges !== undefined ? edges : undefined,
                name: name !== undefined ? name : undefined,
                description: description !== undefined ? description : undefined,
                status: status !== undefined ? status : undefined
            }
        });

        return NextResponse.json({ success: true, data: workflow });
    } catch (error) {
        console.error("[FLOWBOT_UPDATE_ERROR]", error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { workspaceId, flowbotId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await db.workflow.delete({
            where: { id: flowbotId, workspaceId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[FLOWBOT_DELETE_ERROR]", error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
