const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const campaignId = 'cmo8el5fk002kzgiktu4eo7eb';
    
    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
            recipients: true
        }
    });

    console.log('Campaign:', {
        id: campaign?.id,
        name: campaign?.name,
        status: campaign?.status,
        recipientCount: campaign?.recipients?.length,
        recipientsSample: campaign?.recipients?.slice(0, 5)
    });

    const workspaceId = campaign?.workspaceId || 'cmo6yh3np0004m4ik6l8fimrz';
    const contactsCount = await prisma.contact.count({
        where: { workspaceId }
    });
    console.log(`Total contacts in workspace ${workspaceId}: ${contactsCount}`);

    process.exit(0);
}

check();
