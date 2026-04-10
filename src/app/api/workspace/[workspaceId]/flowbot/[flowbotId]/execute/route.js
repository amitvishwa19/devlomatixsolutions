import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { runWorkflow } from "@/lib/workflow-engine";

export async function POST(req, { params }) {
    try {
        const { workspaceId, flowbotId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const workflow = await db.workflow.findUnique({
            where: { id: flowbotId, workspaceId }
        });

        if (!workflow) {
            return NextResponse.json({ message: "Flowbot not found" }, { status: 404 });
        }

        const { nodes, edges, payload } = await req.json().catch(() => ({}));
        
        // 1. Save Current Canvas State (Save-on-Run)
        if (nodes && edges) {
            await db.workflow.update({
                where: { id: flowbotId },
                data: { nodes, edges }
            });
        }

        // 2. Fetch the latest workflow state (now including potential updates)
        const updatedWorkflow = await db.workflow.findUnique({
            where: { id: flowbotId }
        });

        if (!updatedWorkflow) {
            return NextResponse.json({ message: "Flowbot not found" }, { status: 404 });
        }

        const workflowNodes = updatedWorkflow.nodes || [];
        
        // Smarter Trigger Detection
        let triggerNode;
        if (payload?.source === 'chat-preview') {
            triggerNode = workflowNodes.find(n => n.data.subType === 'chat');
        }
        
        if (!triggerNode) {
            triggerNode = workflowNodes.find(n => n.data.subType === 'webhook') || 
                          workflowNodes.find(n => n.data.subType === 'manual') ||
                          workflowNodes.find(n => n.type === 'triggerNode');
        }
        
        if (!triggerNode) {
            return NextResponse.json({ message: "No suitable Trigger Node found in the workflow to start from." }, { status: 400 });
        }

        // 3. Create Execution Record with Snapshots
        const execution = await db.workflowExecution.create({
            data: {
                workflowId: updatedWorkflow.id,
                status: "RUNNING",
                nodes: updatedWorkflow.nodes,
                edges: updatedWorkflow.edges,
                logs: []
            }
        });

        const result = await runWorkflow(updatedWorkflow.id, execution.id, triggerNode.id, payload || { test: "data" });

        return NextResponse.json({ success: true, executionId: execution.id, status: result.status, logs: result.logs });
        
    } catch (error) {
        console.error("[FLOWBOT_EXECUTE_ERROR]", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
