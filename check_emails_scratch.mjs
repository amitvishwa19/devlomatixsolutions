import { prisma } from './src/lib/prisma.js';

async function checkWorkspace() {
  const server = await prisma.server.findMany({
    select: { id: true, name: true, userId: true }
  });
  console.log('Servers / Workspaces:', server);

  const threads = await prisma.crmEmailThread.findMany({
    select: { id: true, workspaceId: true, subject: true }
  });
  console.log('Threads workspaceId:', threads);
}

checkWorkspace().catch(console.error).finally(() => process.exit(0));
