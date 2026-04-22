const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function deepCheck() {
    try {
        const id = 'cmo8usoam0001b8ik3z2p9iy0';
        console.log(`Checking campaign: ${id}`);
        
        const campaign = await prisma.campaign.findUnique({
            where: { id },
            include: { _count: { select: { recipients: true } } }
        });

        if (!campaign) {
            console.log("Campaign not found!");
            return;
        }

        console.log('Campaign Name:', campaign.name);
        console.log('Status:', campaign.status);
        console.log('Total Recipients:', campaign._count.recipients);

        const recStatuses = await prisma.campaignRecipient.groupBy({
            by: ['status'],
            where: { campaignId: id },
            _count: true
        });

        console.log('\nRecipient Status Distribution:');
        console.table(recStatuses);

        const failedRecs = await prisma.campaignRecipient.findMany({
            where: { campaignId: id, status: 'FAILED' },
            take: 5
        });

        if (failedRecs.length > 0) {
            console.log('\nSample Failed Recipients Errors:');
            failedRecs.forEach(r => console.log(`- ${r.phone}: ${r.errorLog}`));
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

deepCheck();
