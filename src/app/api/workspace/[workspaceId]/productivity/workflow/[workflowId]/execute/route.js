import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { runWorkflow } from "@/lib/workflow-engine";

export async function POST(req, { params }) {
    try {
        const { workspaceId, workflowId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const workflow = await db.workflow.findUnique({
            where: { id: workflowId }
        });

        if (!workflow) {
            return NextResponse.json({ message: "Workflow not found" }, { status: 404 });
        }

        // Find the trigger node to start execution. 
        // For MVP, just find the first node with type 'triggerNode'
        const nodes = workflow.nodes || [];
        const triggerNode = nodes.find(n => n.type === 'triggerNode');
        
        if (!triggerNode) {
            return NextResponse.json({ message: "No Trigger Node found in the workflow to start from." }, { status: 400 });
        }

        // Create the Execution Log record
        const execution = await db.workflowExecution.create({
            data: {
                workflowId: workflow.id,
                status: "RUNNING",
                logs: []
            }
        });

        // Parse mock payload from the Test Run request body
        const body = await req.json().catch(() => ({}));

        // Execute background workflow logically
        const result = await runWorkflow(workflow.id, execution.id, triggerNode.id, body.payload || { test: "data" });

        return NextResponse.json({ success: true, executionId: execution.id, status: result.status, logs: result.logs });
        
    } catch (error) {
        console.error("[WORKFLOW_EXECUTE_ERROR]", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
