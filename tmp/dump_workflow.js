import { PrismaClient } from '@prisma/client';
import { db } from '../src/lib/db.js';

async function main() {
  const workflowId = 'cmnek00ql000158ikj6kaie1r';
  try {
    const workflow = await db.workflow.findUnique({
      where: { id: workflowId }
    });
    
    if (!workflow) {
      console.log("Workflow not found");
      return;
    }
    
    console.log("WORKFLOW_DUMP_START");
    console.log(JSON.stringify({
        nodes: workflow.nodes,
        edges: workflow.edges
    }, null, 2));
    console.log("WORKFLOW_DUMP_END");
  } catch (error) {
    console.error("Error fetching workflow:", error);
  } finally {
    // Note: db is already global and might be difficult to close if it's the app's instance.
  }
}

main();
