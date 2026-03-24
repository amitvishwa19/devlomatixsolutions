import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authOptions } from '../../../auth/[...nextauth]/options';
import { getServerSession } from "next-auth/next";

export const dynamic = 'force-dynamic';

async function getUserId() {
    const session = await getServerSession(authOptions);
    return session?.user?.userId || session?.user?.id;
}

// GET /api/wa/campaigns/[id]
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const campaign = await db.campaign.findUnique({
            where: { id, userId },
            include: {
                recipients: true,
                template: true,
            },
        });

        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        return NextResponse.json({ campaign });
    } catch (error) {
        console.error('Failed to fetch campaign:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/wa/campaigns/[id]
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await db.campaign.delete({
            where: { id, userId }
        });

        return NextResponse.json({ success: true, message: 'Campaign deleted successfully' });
    } catch (error) {
        console.error('Failed to delete campaign:', error);
        const status = error.code === 'P2025' ? 404 : 500;
        return NextResponse.json({ error: error.message }, { status });
    }
}

// PATCH /api/wa/campaigns/[id] - Update campaign details
export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { name, description, messageTemplate, templateId, recipients, status } = body;

        // Find existing campaign
        const existing = await db.campaign.findUnique({
            where: { id, userId },
            include: { recipients: true }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        // Lock content if not DRAFT (allow status changes)
        if ((name || description !== undefined || messageTemplate || templateId) && existing.status !== 'DRAFT') {
            return NextResponse.json({ error: 'Only DRAFT campaigns can be edited' }, { status: 400 });
        }

        // Prepare update data
        const updateData = {
            status: status || existing.status,
            name: name || existing.name,
            description: description !== undefined ? description : existing.description,
            messageTemplate: messageTemplate || existing.messageTemplate,
            templateId: templateId !== undefined ? templateId : existing.templateId,
        };

        // If recipients are provided, replace them
        if (recipients && Array.isArray(recipients)) {
            await db.campaignRecipient.deleteMany({
                where: { campaignId: id }
            });

            updateData.recipients = {
                create: recipients.map((r) => ({
                    phone: typeof r === 'string' ? r : r.phone,
                    variables: typeof r === 'string' ? {} : (r.variables || {})
                }))
            };
        }

        const updated = await db.campaign.update({
            where: { id, userId },
            data: updateData
        });

        return NextResponse.json({ success: true, campaign: updated });
    } catch (error) {
        console.error('Failed to update campaign:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
