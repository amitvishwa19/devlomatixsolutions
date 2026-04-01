const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres.cpjjmcqftkgnmrghgsfq:Amitvishwa%401981@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
        },
    },
});

async function main() {
  const workflowId = 'cmnek00ql000158ikj6kaie1r';
  try {
    // 1. Fetch Latest Execution and its Logs
    const execution = await prisma.workflowExecution.findFirst({
        where: { workflowId: workflowId },
        orderBy: { startedAt: 'desc' },
        take: 1
    });
    
    if (!execution) {
      console.log("No execution history found for this workflow.");
    } else {
      console.log(`LATEST_EXECUTION_STATUS: ${execution.status}`);
      console.log("LOGS:");
      console.log(JSON.stringify(execution.logs, null, 2));
    }
  } catch (error) {
    console.error("Database connection failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
