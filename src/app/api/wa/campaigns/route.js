import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../auth/[...nextauth]/options';

export const dynamic = 'force-dynamic';

async function getUserId() {
    const session = await getServerSession(authOptions);
    return session?.user?.userId || session?.user?.id;
}

export async function GET(request) {
    try {
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const campaigns = await db.campaign.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { recipients: true }
                },
                recipients: {
                    where: { status: 'SENT' }
                },
                template: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formatted = campaigns.map((campaign) => ({
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            templateName: campaign.template?.name || 'Custom',
            messageTemplate: campaign.messageTemplate,
            total: campaign._count.recipients,
            sent: campaign.recipients.length,
            scheduledAt: campaign.scheduledAt,
            createdAt: campaign.createdAt,
            successRate: campaign._count.recipients > 0 ? Math.round((campaign.recipients.length / campaign._count.recipients) * 100) : 0
        }));

        return NextResponse.json({ campaigns: formatted });
    } catch (error) {
        console.error('Failed to fetch campaigns:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, messageTemplate, templateId, recipients, groupIds, status } = body;

        if (!name || (!messageTemplate && !templateId)) {
            return NextResponse.json({ error: 'Missing required fields: name and (messageTemplate or templateId).' }, { status: 400 });
        }

        const createData = {
            name,
            description,
            status: status || 'DRAFT',
            messageTemplate: messageTemplate || {},
            templateId: templateId || null,
            userId: userId,
        };

        let allRecipients = recipients && Array.isArray(recipients) ? [...recipients] : [];

        // If groupIds are provided, fetch contacts from those groups
        if (groupIds && Array.isArray(groupIds) && groupIds.length > 0) {
            const groupContacts = await db.contact.findMany({
                where: {
                    userId,
                    groups: {
                        some: {
                            id: { in: groupIds }
                        }
                    }
                },
                select: { phone: true, name: true }
            });

            // Merge group contacts, avoiding duplicates by phone
            const existingPhones = new Set(allRecipients.map(r => typeof r === 'string' ? r : r.phone));
            groupContacts.forEach(gc => {
                if (!existingPhones.has(gc.phone)) {
                    allRecipients.push({ phone: gc.phone, name: gc.name });
                    existingPhones.add(gc.phone);
                }
            });
        }

        if (allRecipients.length > 0) {
            createData.recipients = {
                create: allRecipients.map((r) => ({
                    phone: typeof r === 'string' ? r : r.phone,
                    variables: typeof r === 'string' ? {} : (r.variables || {})
                }))
            };
        }

        const campaign = await db.campaign.create({
            data: createData
        });

        return NextResponse.json({ success: true, campaign });
    } catch (error) {
        console.error('Failed to create campaign:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
