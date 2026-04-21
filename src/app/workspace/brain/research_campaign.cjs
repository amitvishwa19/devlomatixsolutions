const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
    try {
        console.log('--- CHECKING WHATSAPP BUSINESS CAMPAIGN STATUS ---');
        
        const jobs = await prisma.whatsAppJob.findMany({
            where: { platform: 'WHATSAPP_BUSINESS' },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        console.log('\n[JOBS]');
        if (jobs.length === 0) console.log('No jobs found.');
        jobs.forEach(j => {
            console.log(`- Job ${j.id}: status=${j.status}, type=${j.type}, scheduledAt=${j.scheduledAt}`);
            if (j.errorLog) console.log(`  Error: ${j.errorLog}`);
        });

        const campaigns = await prisma.campaign.findMany({
            where: { platform: 'WHATSAPP_BUSINESS' },
            orderBy: { updatedAt: 'desc' },
            take: 2
        });
        console.log('\n[CAMPAIGNS]');
        campaigns.forEach(c => {
            console.log(`- Campaign ${c.id}: name=${c.name}, status=${c.status}, updatedAt=${c.updatedAt}`);
        });

        if (campaigns.length > 0) {
            const latestCampaign = campaigns[0];
            const recipients = await prisma.campaignRecipient.findMany({
                where: { campaignId: latestCampaign.id },
                take: 10
            });
            console.log(`\n[RECIPIENTS FOR LATEST CAMPAIGN: ${latestCampaign.name}]`);
            recipients.forEach(r => {
                console.log(`- ${r.phone}: status=${r.status} ${r.errorLog ? `(Error: ${r.errorLog})` : ''}`);
            });

            // LOGS specifically for this campaign
            const campaignLogs = await prisma.systemLog.findMany({
                where: {
                    OR: [
                        { message: { contains: latestCampaign.id } },
                        { details: { path: ['jid'], string_contains: latestCampaign.id } }
                    ]
                },
                take: 5
            });
            console.log('\n[CAMPAIGN RELATED LOGS]');
            campaignLogs.forEach(l => {
                console.log(`- ${l.createdAt.toISOString()} [${l.type}] ${l.message}`);
            });
        }

        const logs = await prisma.systemLog.findMany({
            where: { provider: 'wa-business-api' },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        console.log('\n[GENERAL BUSINESS API LOGS]');
        logs.forEach(l => {
            console.log(`- ${l.createdAt.toISOString()} [${l.type}] ${l.message}`);
        });

    } catch (e) {
        console.error('Check failed:', e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

check();
