const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function run() {
    const defaultCred = await db.credentials.findFirst({ where: { isDefault: true, platform: 'WHATSAPP_CLOUD' }});
    if (defaultCred) {
        const res = await db.campaign.updateMany({
            where: { credentialId: null },
            data: { credentialId: defaultCred.id }
        });
        console.log(`Backfilled ${res.count} existing campaigns with default credential ID:`, defaultCred.id);
    } else {
        console.log('No default credential found to backfill.');
    }
}

run().catch(console.error).finally(() => db.$disconnect());
