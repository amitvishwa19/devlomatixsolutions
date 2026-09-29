import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveActiveCredential } from "@/lib/konnectx-active-credential";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");

    const active = await resolveActiveCredential(request);

    if (!active.credential) {
      return NextResponse.json({ data: { stats: null } });
    }

    const activeCredentialId = active.credentialId;
    const activePhoneId = active.phoneNumberId;

    const totalCampaigns = await db.campaign.count({
      where: { ...(userId && { userId }), credentialId: activeCredentialId }
    });
    const activeCampaigns = await db.campaign.count({
      where: { ...(userId && { userId }), credentialId: activeCredentialId, status: 'active' }
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
      where: { ...(userId && { userId }), credentialId: activeCredentialId },
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
