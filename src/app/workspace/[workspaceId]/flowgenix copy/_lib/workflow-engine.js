import { runAgent } from "./agent-runtime";
import { db } from "@/lib/db";

export async function executeWorkflow(workspaceId, userId, workflowId, trigger = "manual", input = {}) {
  const workflow = await db.workflow.findUnique({
    where: { id: workflowId }
  });

  if (!workflow) throw new Error("Workflow not found");

  const execution = await db.workflowExecution.create({
    data: {
      workflowId,
      status: "RUNNING",
      trigger,
      input,
      nodes: workflow.nodes,
      edges: workflow.edges
    }
  });

  const nodes = workflow.nodes || [];
  const edges = workflow.edges || [];
  const logs = [];

  const addLog = async (nodeId, label, status, message, data) => {
    const log = await db.workflowRunLog.create({
      data: {
        workspaceId,
        runId: execution.id,
        nodeId,
        nodeLabel: label,
        status,
        message,
        data
      }
    });
    logs.push(log);
  };

  try {
    // Basic linear execution for now (starting from 'start' nodes)
    let currentNodes = nodes.filter(n => n.type === "startNode" || !edges.some(e => e.target === n.id));
    const visited = new Set();

    while (currentNodes.length > 0) {
      const node = currentNodes.shift();
      if (visited.has(node.id)) continue;
      visited.add(node.id);

      await addLog(node.id, node.data?.label || node.type, "running", `Executing ${node.type}...`);

      let nodeOutput = {};

      try {
        if (node.type === "agentNode") {
          const agentConfig = await db.agentConfig.findFirst({ where: { workspaceId } });
          const res = await runAgent(agentConfig, [], node.data?.prompt || input.prompt || "Hello", [], () => {});
          nodeOutput = { response: res };
        } else if (node.type === "httpRequest") {
          const res = await fetch(node.data?.url, {
            method: node.data?.method || "GET",
            headers: node.data?.headers || {},
            body: node.data?.body ? JSON.stringify(node.data.body) : undefined
          });
          nodeOutput = await res.json();
        }
        
        await addLog(node.id, node.data?.label || node.type, "success", "Completed successfully", nodeOutput);
      } catch (err) {
        await addLog(node.id, node.data?.label || node.type, "error", err.message);
        throw err;
      }

      // Find next nodes
      const nextEdges = edges.filter(e => e.source === node.id);
      for (const edge of nextEdges) {
        const nextNode = nodes.find(n => n.id === edge.target);
        if (nextNode) currentNodes.push(nextNode);
      }
    }

    await db.workflowExecution.update({
      where: { id: execution.id },
      data: { status: "COMPLETED", finishedAt: new Date(), output: { message: "Workflow finished successfully" } }
    });

    return execution.id;
  } catch (error) {
    await db.workflowExecution.update({
      where: { id: execution.id },
      data: { status: "FAILED", finishedAt: new Date(), error: error.message }
    });
    throw error;
  }
}
