const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const apps = await prisma.application.findMany({
        orderBy: { appliedAt: 'desc' },
        take: 5,
        include: { candidate: true, job: true }
    });
    console.log(JSON.stringify(apps, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
