import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, status, messageTemplate, templateId, messageType, scheduledAt, recipients, groupIds } = body;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const credential = await db.credentials.findFirst({
      where: { ...(userId && { userId }), platform: 'WHATSAPP_CLOUD', isDefault: true }
    });

    const campaign = await db.campaign.create({
      data: {
        ...(userId && { userId }),
        name,
        status: status || (scheduledAt ? 'SCHEDULED' : 'RUNNING'),
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
      include: { recipients: true },
    });

    if (groupIds?.length) {
      const groupContacts = await db.contact.findMany({
        where: { groups: { some: { id: { in: groupIds } } } },
        select: { phone: true },
      });

      for (const gc of groupContacts) {
        const exists = recipients?.some(r => r.phone === gc.phone);
        if (!exists) {
          await db.campaignRecipient.create({
            data: { campaignId: campaign.id, phone: gc.phone, status: 'PENDING' },
          });
        }
      }
    }

    return NextResponse.json({ success: true, data: { campaign } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to send broadcast" }, { status: 500 });
  }
}
