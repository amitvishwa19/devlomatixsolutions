import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaignEngine } from "../../../../../../workspace/[workspaceId]/konnectx/_lib/campaign-engine";

export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
        const { id } = await params;
    const { action } = body;

    const userId = searchParams.get("userId");

    const campaign = await db.campaign.findFirst({ where: { id, userId } });
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    if (action === 'stop') {
      await campaignEngine.stopCampaign(id);
      return NextResponse.json({ success: true, message: "Campaign stopped" });
    }

    if (campaign.total === 0) {
      return NextResponse.json({ error: "Cannot run campaign with no recipients" }, { status: 400 });
    }

    await campaignEngine.startCampaign(id, userId);

    return NextResponse.json({ success: true, message: "Campaign started" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to trigger campaign" }, { status: 500 });
  }
}
