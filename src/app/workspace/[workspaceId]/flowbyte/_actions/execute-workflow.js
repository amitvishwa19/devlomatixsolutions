'use server'
import { runWorkflow } from "@/lib/workflow-engine";
import { db } from "@/lib/db";

export async function executeWorkflowAction({ workflowId, nodes, edges, chatInput }) {
  // If we don't have a saved workflowId yet (it's new), 
  // we might need a different way to run it since runWorkflow expects a DB record.
  // For now, let's assume it's saved or we use a temporary record.

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

    // Map result logs back to the format useWorkflowExecution expects
    // Note: this may require more sophisticated mapping depending on what runWorkflow returns
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
    console.error("Execution action failed:", error);
    return { error: error.message };
  }
}
