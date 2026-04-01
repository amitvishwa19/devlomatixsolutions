const { PrismaClient } = require('@prisma/client');
/* We need to use the actual db client from the project if possible to avoid issues with schema path */
const prisma = new (require('../src/lib/db').db.constructor)();

async function main() {
  const workflowId = 'cmnek00ql000158ikj6kaie1r';
  try {
    const workflow = await prisma.botFlow.findUnique({
      where: { id: workflowId },
      include: { steps: true }
    });
    
    if (!workflow) {
      console.log("Workflow not found");
      return;
    }
    
    // Check if it's the right table - FlowBot might use regular 'Workflow' or a custom JSON field
    // From my previous viewed schema, it was BotFlow for FlowBot.
    
    console.log(JSON.stringify(workflow, null, 2));
  } catch (error) {
    console.error("Error fetching workflow:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
