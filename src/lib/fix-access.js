import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("--- Access Verification Script ---");
    
    // 1. Find the test user
    const email = 'test@devlomatix.com';
    const user = await prisma.user.findUnique({
        where: { email },
        include: { servers: true }
    });

    if (!user) {
        console.error(`User ${email} not found!`);
        return;
    }

    console.log(`User ID: ${user.id}`);
    console.log(`Current Role: ${user.role}`);

    // 2. Ensure Admin role for middleware bypass
    if (user.role !== 'admin') {
        process.stdout.write(`Updating role to admin... `);
        await prisma.user.update({
            where: { id: user.id },
            data: { role: 'admin' }
        });
        console.log("DONE");
    }

    // 3. Ensure a default server exists
    const defaultServer = user.servers.find(s => s.default === true);
    if (!defaultServer) {
        console.log("No default server found. Checking first available...");
        const anyServer = user.servers[0];
        
        if (anyServer) {
            console.log(`Setting server ${anyServer.id} as default...`);
            await prisma.server.update({
                where: { id: anyServer.id },
                data: { default: true }
            });
        } else {
            console.log("No servers found. Creating a default test workspace...");
            const newServer = await prisma.server.create({
                data: {
                    name: 'Mission Control Alpha',
                    userId: user.id,
                    default: true,
                    description: 'Primary Swarm Orchestration Hub',
                    appSettings: { agents: [] }
                }
            });
            console.log(`New Server Created: ${newServer.id}`);
        }
    } else {
        console.log(`Default server found: ${defaultServer.id}`);
    }

    console.log("--- Verification Complete ---");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
