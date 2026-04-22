const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkPlatforms() {
    try {
        console.log("Checking campaign platforms...");
        const campaigns = await prisma.campaign.findMany({
            select: { id: true, name: true, platform: true }
        });
        console.table(campaigns);

        const counts = await prisma.campaign.groupBy({
            by: ['platform'],
            _count: true
        });
        console.log("\nCounts by platform:");
        console.table(counts);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

checkPlatforms();
