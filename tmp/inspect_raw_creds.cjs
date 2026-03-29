const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const creds = await prisma.credentials.findFirst({
        where: { platform: 'FACEBOOK' },
        orderBy: { createdAt: 'desc' }
    });

    if (!creds) {
        console.log("No Facebook credentials found");
        return;
    }

    console.log("RAW CREDENTIALS FROM DB:");
    console.log(JSON.stringify(creds, null, 2));
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
