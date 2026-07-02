import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const mapApiCampaignToUI = (campaign) => ({
  id: campaign.id,
  name: campaign.name,
  status: campaign.status?.toLowerCase ? campaign.status.toLowerCase() : campaign.status,
  template: typeof campaign.template === "string" ? campaign.template : JSON.stringify(campaign.template || ""),
  total: campaign.total,
  sent: campaign.sent,
  successRate: campaign.successRate,
  createdAt: campaign.createdAt,
  scheduledAt: campaign.scheduledAt,
  messageType: campaign.messageType,
  messageTemplate: campaign.messageTemplate,
  templateId: campaign.templateId,
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");

    const campaigns = await db.campaign.findMany({
      where: { ...(userId && { userId }) },
      orderBy: { createdAt: 'desc' },
      include: { template: true },
    });

    return NextResponse.json({ data: { campaigns: (campaigns || []).map(mapApiCampaignToUI) } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, status, messageTemplate, templateId, recipients, groupIds, messageType, scheduledAt } = body;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const credential = await db.credentials.findFirst({
      where: { ...(userId && { userId }), platform: 'WHATSAPP_CLOUD', isDefault: true }
    });

    const campaign = await db.campaign.create({
      data: {
...(userId && { userId }),
        name,
        status: status || 'DRAFT',
        messageTemplate: messageTemplate || {},
        templateId: templateId || null,
        messageType: messageType || 'text',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        credentialId: credential?.id || null,
        total: recipients?.length || 0,
        recipients: recipients?.length ? {
          create: recipients.map(r => ({
            phone: r.phone,
            variables: r.variables || {},
            status: 'PENDING',
          }))
        } : undefined,
      },
      include: { template: true, recipients: true },
    });

    if (groupIds?.length) {
      const groupContacts = await db.contact.findMany({
        where: { groups: { some: { id: { in: groupIds } } } },
        select: { phone: true, name: true },
      });

      for (const gc of groupContacts) {
        const exists = recipients?.some(r => r.phone === gc.phone);
        if (!exists) {
          await db.campaignRecipient.create({
            data: { campaignId: campaign.id, phone: gc.phone, variables: { name: gc.name }, status: 'PENDING' },
          });
          await db.campaign.update({ where: { id: campaign.id }, data: { total: { increment: 1 } } });
        }
      }
    }

    return NextResponse.json({ success: true, data: mapApiCampaignToUI(campaign) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to create campaign" }, { status: 500 });
  }
}
