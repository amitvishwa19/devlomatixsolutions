const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCampaigns() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        _count: {
          select: { recipients: true }
        }
      }
    });

    console.log('Recent Campaigns:');
    console.table(campaigns.map(c => ({
      id: c.id,
      name: c.name,
      status: c.status,
      recipients: c._count.recipients,
      createdAt: c.createdAt
    })));

    const recentRecipients = await prisma.campaignRecipient.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    console.log('\nRecent Recipients:');
    console.table(recentRecipients.map(r => ({
      id: r.id,
      campaignId: r.campaignId,
      phone: r.phone,
      status: r.status,
      errorLog: r.errorLog,
      sentAt: r.sentAt
    })));

    const systemLogs = await prisma.systemLog.findMany({
      where: { provider: 'wa-business-api' },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    console.log('\nRecent System Logs:');
    console.table(systemLogs.map(l => ({
        message: l.message,
        type: l.type,
        level: l.level,
        createdAt: l.createdAt
    })));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCampaigns();
