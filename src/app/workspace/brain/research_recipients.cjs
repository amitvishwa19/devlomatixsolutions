const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
    try {
        console.log('--- RECIPIENTS DEBUG ---');
        const recipients = await prisma.campaignRecipient.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        
        recipients.forEach(r => {
            console.log(`[${r.status}] Phone: ${r.phone} | CampaignId: ${r.campaignId} | Created: ${r.createdAt.toISOString()}`);
            if (r.errorLog) console.log(`  !! Error: ${r.errorLog}`);
        });

        console.log('\n--- SESSION STATUS ---');
        const sessions = await prisma.whatsAppAuth.findMany();
        sessions.forEach(s => {
            console.log(`- Session ${s.sessionId}: status=${s.status}, lastConnected=${s.lastConnectedAt}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

check();
