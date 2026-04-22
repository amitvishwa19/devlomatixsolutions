const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function compare() {
    try {
        console.log("Fetching recent campaigns to compare working vs non-working...");
        const campaigns = await prisma.campaign.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: { 
                id: true, 
                name: true, 
                status: true, 
                messageTemplate: true, 
                messageType: true, 
                createdAt: true,
                platform: true
            }
        });
        
        console.log("\nRecent Campaigns Summary:");
        campaigns.forEach(c => {
            console.log(`- [${c.id}] ${c.name} | Status: ${c.status} | Type: ${c.messageType} | Created: ${c.createdAt}`);
        });

        console.log("\nDeep Dive on Template Structures:");
        campaigns.forEach(c => {
            console.log(`\n--- ${c.name} ---`);
            console.log(JSON.stringify(c.messageTemplate, null, 2));
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

compare();
