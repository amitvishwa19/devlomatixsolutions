import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const { id } = await params;

    const campaign = await db.campaign.findUnique({
      where: { id },
      include: { template: true, recipients: true },
    });

    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    return NextResponse.json({ data: { campaign } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch campaign" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const { id } = await params;

    const userId = searchParams.get("userId");

    const campaign = await db.campaign.findFirst({ where: { id, userId } });
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.messageTemplate !== undefined) updateData.messageTemplate = body.messageTemplate;
    if (body.templateId !== undefined) updateData.templateId = body.templateId;
    if (body.messageType !== undefined) updateData.messageType = body.messageType;
    if (body.scheduledAt !== undefined) updateData.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;

    if (body.recipients) {
      await db.campaignRecipient.deleteMany({ where: { campaignId: id } });
      await db.campaignRecipient.createMany({
        data: body.recipients.map(r => ({ campaignId: id, phone: r.phone, variables: r.variables || {}, status: 'PENDING' })),
      });
    }

    const updated = await db.campaign.update({ where: { id }, data: updateData, include: { template: true, recipients: true } });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to update campaign" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const { id } = await params;

    const userId = searchParams.get("userId");

    const campaign = await db.campaign.findFirst({ where: { id, userId } });
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    await db.campaignRecipient.deleteMany({ where: { campaignId: id } });
    await db.campaign.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Campaign deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete campaign" }, { status: 500 });
  }
}
