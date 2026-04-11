import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up default templates...');
  const deleted = await prisma.messageTemplate.deleteMany({
    where: {
      isDefault: true
    }
  });
  console.log(`Deleted ${deleted.count} default templates.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
