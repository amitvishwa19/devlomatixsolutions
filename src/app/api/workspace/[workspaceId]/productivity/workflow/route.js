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

        // For the MVP Editor, we just fetch a single default workflow per workspace.
        let workflow = await db.workflow.findFirst({
            where: { workspaceId, userId }
        });

        if (!workflow) {
            // Create an empty default one if it doesn't exist
            workflow = await db.workflow.create({
                data: {
                    name: "Main Flow",
                    workspaceId,
                    userId,
                    nodes: [],
                    edges: []
                }
            });
        }

        return NextResponse.json({ success: true, data: workflow });
    } catch (error) {
        console.error("[WORKFLOW_GET_ERROR]", error.message);
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
        const { nodes, edges } = await req.json();

        // Update the default workflow
        let workflow = await db.workflow.findFirst({
            where: { workspaceId, userId }
        });

        if (!workflow) {
            workflow = await db.workflow.create({
                data: {
                    name: "Main Flow",
                    workspaceId,
                    userId,
                    nodes: nodes || [],
                    edges: edges || []
                }
            });
        } else {
            workflow = await db.workflow.update({
                where: { id: workflow.id },
                data: {
                    nodes: nodes || [],
                    edges: edges || []
                }
            });
        }

        return NextResponse.json({ success: true, data: workflow });
    } catch (error) {
        console.error("[WORKFLOW_SAVE_ERROR]", error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
