const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkAuths() {
  try {
    const auths = await prisma.whatsAppAuth.findMany();
    console.table(auths.map(a => ({
        id: a.id,
        sessionId: a.sessionId,
        userId: a.userId,
        status: a.status,
        isActive: a.isActive
    })));

    const users = await prisma.user.findMany({
        take: 5,
        select: { id: true, name: true, email: true }
    });
    console.log('\nUsers:');
    console.table(users);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkAuths();
