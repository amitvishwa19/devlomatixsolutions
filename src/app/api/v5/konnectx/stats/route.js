import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");

    const defaultCredential = await db.credentials.findFirst({
      where: { ...(userId && { userId }), platform: 'WHATSAPP_CLOUD', isDefault: true }
    });

    if (!defaultCredential) {
      return NextResponse.json({ data: { stats: null } });
    }

    let cloudCreds = null;
    const stored = defaultCredential.credentials;
    if (typeof stored === 'string' && stored.includes(':')) {
      try {
        const { symmetricDecrypt } = await import("@/lib/encryption");
        cloudCreds = JSON.parse(symmetricDecrypt(stored));
      } catch (e) {}
    } else if (typeof stored === 'string') {
      try { cloudCreds = JSON.parse(stored); } catch (e) {}
    } else { cloudCreds = stored; }

    if (cloudCreds?.enc) {
      try {
        const { symmetricDecrypt } = await import("@/lib/encryption");
        cloudCreds = JSON.parse(symmetricDecrypt(cloudCreds.enc));
      } catch (e) {}
    }
    const activePhoneId = String(cloudCreds?.phoneNumberId || cloudCreds?.phone_number_id || "");

    const totalCampaigns = await db.campaign.count({
      where: { ...(userId && { userId }), credentialId: defaultCredential.id }
    });
    const activeCampaigns = await db.campaign.count({
      where: { ...(userId && { userId }), credentialId: defaultCredential.id, status: 'active' }
    });

    const msgWhere = {
      ...(userId && { userId }),
      fromMe: true,
      metadata: { path: ['phone_number_id'], equals: activePhoneId }
    };

    const sentMessages = await db.whatsAppMessage.count({ where: msgWhere });
    const readMessages = await db.whatsAppMessage.count({ where: { ...msgWhere, status: 'READ' } });
    const failedMessages = await db.whatsAppMessage.count({ where: { ...msgWhere, status: 'FAILED' } });
    const deliveredMessages = await db.whatsAppMessage.count({ where: { ...msgWhere, status: 'DELIVERED' } });
    const totalContacts = await db.contact.count({ where: { ...(userId && { userId }) } });
    const approvedTemplates = await db.messageTemplate.count({ where: { ...(userId && { userId }), status: 'APPROVED', phoneNumberId: activePhoneId } });
    const pendingTemplates = await db.messageTemplate.count({ where: { ...(userId && { userId }), status: 'PENDING_APPROVAL', phoneNumberId: activePhoneId } });

    const latestJob = await db.whatsAppJob.findFirst({
      where: { ...(userId && { userId }) },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { logs: true } } }
    });

    const successRate = sentMessages > 0 ? (((sentMessages - failedMessages) / sentMessages) * 100).toFixed(1) : 0;
    const readRate = sentMessages > 0 ? ((readMessages / sentMessages) * 100).toFixed(1) : 0;

    const recentCampaigns = await db.campaign.findMany({
      where: { ...(userId && { userId }), credentialId: defaultCredential.id },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      select: { id: true, name: true, status: true, messageType: true, recipients: { select: { status: true } } }
    });

    const campaignDeliveries = recentCampaigns.map((c) => {
      const counts = { total: c.recipients.length, delivered: 0, read: 0, failed: 0, pending: 0 };
      for (const r of c.recipients) {
        const st = (r.status || 'PENDING').toUpperCase();
        if (st === 'DELIVERED') counts.delivered += 1;
        else if (st === 'READ') counts.read += 1;
        else if (st === 'FAILED') counts.failed += 1;
        else counts.pending += 1;
      }
      return { id: c.id, name: c.name, status: c.status, messageType: c.messageType, ...counts };
    });

    return NextResponse.json({
      data: {
        stats: {
          campaigns: { total: Number(totalCampaigns), active: Number(activeCampaigns) },
          messages: { sent: Number(sentMessages), read: Number(readMessages), delivered: Number(deliveredMessages), failed: Number(failedMessages), successRate: String(successRate), readRate: String(readRate) },
          contacts: { total: Number(totalContacts) },
          templates: { approved: Number(approvedTemplates), pending: Number(pendingTemplates) },
          latestJob: latestJob ? { id: latestJob.id, status: latestJob.status, total: Number(latestJob._count.logs), completedAt: latestJob.completedAt ? new Date(latestJob.completedAt).toISOString() : null } : null,
          campaignDeliveries
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch stats" }, { status: 500 });
  }
}
