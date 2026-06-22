import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const messages = await prisma.whatsAppMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      waId: true,
      text: true,
      status: true,
      metadata: true,
      error: true,
      createdAt: true
    }
  });

  console.log(JSON.stringify(messages, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
