import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authOptions } from '../../../../auth/[...nextauth]/options';
import { getServerSession } from "next-auth/next";
import { campaignEngine } from '@/lib/campaign-engine';

export async function POST(request, { params }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        const userId = session?.user?.userId || session?.user?.id;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const campaign = await db.campaign.findUnique({
            where: { id, userId }
        });

        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        // Trigger engine (non-blocking)
        campaignEngine.startCampaign(id, userId).catch(err => {
            console.error(`[StartAPI] Background error for campaign ${id}:`, err);
        });

        return NextResponse.json({ success: true, message: 'Campaign started' });
    } catch (error) {
        console.error('Failed to start campaign:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
