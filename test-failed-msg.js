import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log("Fetching recent WhatsAppMessage logs...");
    const messages = await prisma.whatsAppMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log(`Found ${messages.length} messages.`);
    messages.forEach(msg => {
      console.log("-----------------------------------------");
      console.log(`ID: ${msg.id}`);
      console.log(`To JID: ${msg.jid}`);
      console.log(`Text: ${msg.text}`);
      console.log(`Status: ${msg.status}`);
      console.log(`FromMe: ${msg.fromMe}`);
      console.log(`Metadata:`, JSON.stringify(msg.metadata));
      console.log(`CreatedAt: ${msg.createdAt}`);
    });

    console.log("\nFetching recent connection/delivery logs...");
    const deliveryLogs = await prisma.whatsAppDeliveryLog?.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    }) || [];
    console.log(`Found ${deliveryLogs.length} delivery logs.`);
    deliveryLogs.forEach(log => {
      console.log(log);
    });

  } catch (err) {
    console.error("Query failed:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
