const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Standard ESM -> CJS bridge for this test
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function debugCampaign() {
    try {
        console.log("[DIAGNOSTIC] Starting Campaign Engine diagnostic...");
        
        // Import campaign engine (we need to bypass ESM for this script)
        // Since the actual code is ESM, we'll try to replicate the logic or use a dynamic import if Node version allows
        // For simplicity, I'll check the DB first to see the results of previous campaign attempts
        
        const campaigns = await prisma.campaign.findMany({
            orderBy: { createdAt: 'desc' },
            take: 3,
            include: {
                recipients: { take: 5 }
            }
        });

        console.log("\n[DIAGNOSTIC] Recent Campaigns Status:");
        campaigns.forEach(c => {
            console.log(` - ID: ${c.id} | Name: ${c.name} | Status: ${c.status}`);
            c.recipients.forEach(r => {
                console.log(`    -> Recipient: ${r.phone} | Status: ${r.status} | Error: ${r.errorLog || 'None'}`);
            });
        });

        const logs = await prisma.systemLog.findMany({
            where: { provider: 'wa-business-api' },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        console.log("\n[DIAGNOSTIC] Recent System Logs:");
        logs.forEach(l => {
            console.log(`[${l.createdAt.toISOString()}] [${l.type}] ${l.message}`);
        });

    } catch (error) {
        console.error("[DIAGNOSTIC] Error:", error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

debugCampaign();
