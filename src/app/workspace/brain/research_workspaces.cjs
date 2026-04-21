const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
    try {
        console.log('--- WORKSPACE & CONTACT DEBUG ---');
        
        // 1. Get all unique workspaceIds from contacts
        const workspaces = await prisma.contact.groupBy({
            by: ['workspaceId'],
            _count: { _all: true }
        });
        console.log('\n[CONTACTS PER WORKSPACE]');
        workspaces.forEach(w => console.log(`- ${w.workspaceId}: ${w._count._all} contacts`));

        // 2. Get groups
        const groups = await prisma.contactGroup.findMany({ take: 5 });
        console.log('\n[RECENT GROUPS]');
        groups.forEach(g => console.log(`- ${g.name} (ID: ${g.id}) | Workspace: ${g.workspaceId}`));

        // 3. Check for specific Message Testing campaign
        const campaign = await prisma.campaign.findFirst({
            where: { name: 'Message Testing' },
            orderBy: { createdAt: 'desc' }
        });
        if (campaign) {
            console.log(`\n[CAMPAIGN: ${campaign.name}]`);
            console.log(`- ID: ${campaign.id}`);
            console.log(`- Template ID: ${campaign.templateId}`);
            console.log(`- MessageTemplate JSON keys: ${Object.keys(campaign.messageTemplate || {})}`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

check();
