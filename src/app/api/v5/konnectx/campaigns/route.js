import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const mapApiCampaignToUI = (campaign) => {
  const total = campaign._count?.recipients ?? (Array.isArray(campaign.recipients) ? campaign.recipients.length : 0);
  const sent = Array.isArray(campaign.recipients) ? campaign.recipients.filter(r => r.status === 'SENT').length : 0;
  const successRate = total > 0 ? Math.round((sent / total) * 100) : 0;

  return {
    id: campaign.id,
    name: campaign.name,
    status: campaign.status?.toLowerCase ? campaign.status.toLowerCase() : campaign.status,
    template: typeof campaign.template === "string" ? campaign.template : JSON.stringify(campaign.template || ""),
    total,
    sent,
    successRate,
    createdAt: campaign.createdAt,
    scheduledAt: campaign.scheduledAt,
    messageType: campaign.messageType,
    messageTemplate: campaign.messageTemplate,
    templateId: campaign.templateId,
  };
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");

    const campaigns = await db.campaign.findMany({
      where: { ...(userId && { userId }) },
      orderBy: { createdAt: 'desc' },
      include: {
        template: true,
        _count: { select: { recipients: true } },
        recipients: { where: { status: 'SENT' } },
      },
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
        }
      }
    }

    const updatedCampaign = await db.campaign.findUnique({
      where: { id: campaign.id },
      include: {
        template: true,
        _count: { select: { recipients: true } },
        recipients: { where: { status: 'SENT' } }
      }
    });

    return NextResponse.json({ success: true, data: mapApiCampaignToUI(updatedCampaign || campaign) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to create campaign" }, { status: 500 });
  }
}
