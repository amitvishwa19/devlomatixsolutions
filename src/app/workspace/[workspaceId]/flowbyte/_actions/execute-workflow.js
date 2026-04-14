'use server'
import { runWorkflow } from "@/lib/workflow-engine";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function executeWorkflowAction({ workflowId, nodes, edges, chatInput }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId;

  if (!userId) {
    return { error: "Unauthorized" };
  }

  // If it's a new unsaved workflow, we can't create an execution record in DB yet
  if (!workflowId || workflowId === "new") {
    // Simulation fallback for unsaved flows
    return {
        results: nodes.map(n => ({
            nodeId: n.id,
            nodeType: n.data.type,
            label: n.data.label,
            status: "success",
            input: {},
            output: { simulated: true },
            duration: Math.floor(Math.random() * 500) + 100,
            startTime: new Date().toISOString()
        }))
    };
  }

  try {
    // Ensure user owns the workflow
    const workflow = await db.workflow.findUnique({
        where: { id: workflowId, userId }
    });

    if (!workflow) {
        return { error: "Workflow not found or access denied" };
    }

    // Ensure execution record exists
    const execution = await db.workflowExecution.create({
        data: {
          workflowId,
          status: "RUNNING",
          logs: []
        }
    });

    const triggerNode = nodes.find(n => n.data.type === 'trigger' || n.data.type === 'webhook' || n.data.type === 'chat-trigger');
    
    // Call the internal engine
    const result = await runWorkflow(workflowId, execution.id, triggerNode?.id || nodes[0].id, { message: chatInput });

    return {
        results: nodes.map(n => {
            const log = result.logs?.find(l => l.message?.includes(n.data.label));
            return {
                nodeId: n.id,
                nodeType: n.data.type,
                label: n.data.label,
                status: result.success ? "success" : "error",
                input: {},
                output: log ? { log: log.message } : {},
                duration: 200, 
                startTime: new Date().toISOString()
            }
        })
    };
  } catch (error) {
    console.error("[executeWorkflowAction] Error:", error);
    return { error: error.message };
  }
}
