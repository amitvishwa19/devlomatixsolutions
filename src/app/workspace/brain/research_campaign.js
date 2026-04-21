const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('--- CHECKING WHATSAPP BUSINESS CAMPAIGN STATUS ---');
        
        const jobs = await prisma.whatsAppJob.findMany({
            where: { platform: 'WHATSAPP_BUSINESS' },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        console.log('\n[JOBS]');
        console.table(jobs.map(j => ({
            id: j.id,
            status: j.status,
            type: j.type,
            error: j.errorLog?.substring(0, 50),
            createdAt: j.createdAt.toISOString()
        })));

        const campaigns = await prisma.campaign.findMany({
            where: { platform: 'WHATSAPP_BUSINESS' },
            orderBy: { updatedAt: 'desc' },
            take: 2
        });
        console.log('\n[CAMPAIGNS]');
        console.table(campaigns.map(c => ({
            id: c.id,
            name: c.name,
            status: c.status,
            updatedAt: c.updatedAt.toISOString()
        })));

        if (campaigns.length > 0) {
            const recipients = await prisma.campaignRecipient.findMany({
                where: { campaignId: campaigns[0].id },
                take: 5
            });
            console.log(`\n[RECIPIENTS FOR CAMPAIGN ${campaigns[0].name}]`);
            console.table(recipients.map(r => ({
                id: r.id,
                phone: r.phone,
                status: r.status,
                error: r.errorLog?.substring(0, 50)
            })));
        }

        const logs = await prisma.systemLog.findMany({
            where: { provider: 'wa-business-api' },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        console.log('\n[SYSTEM LOGS]');
        console.table(logs.map(l => ({
            type: l.type,
            message: l.message,
            createdAt: l.createdAt.toISOString()
        })));

    } catch (e) {
        console.error('Check failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
