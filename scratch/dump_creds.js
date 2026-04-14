import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const creds = await prisma.credentials.findMany({
    where: { platform: 'WHATSAPP_CLOUD' }
  });
  console.log(JSON.stringify(creds, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
