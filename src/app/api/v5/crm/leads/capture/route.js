import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

/**
 * Public & Webhook Inbound Lead Capture API Endpoint
 * Accepts new inbound leads from web forms, landing pages, Meta Ads, Zapier, Make, etc.
 * 
 * Endpoint: POST /api/v5/crm/leads/capture
 */
export async function POST(req) {
    try {
        const body = await req.json();

        const {
            workspaceId,
            name,
            email,
            phone,
            company,
            dealTitle,
            dealValue = 0,
            currency = 'INR',
            source = 'Website Inbound Form',
            message,
            tags = []
        } = body;

        if (!workspaceId) {
            return NextResponse.json(
                { success: false, error: "Missing required parameter: workspaceId" },
                { status: 400 }
            );
        }

        if (!name?.trim() && !company?.trim()) {
            return NextResponse.json(
                { success: false, error: "At least contact 'name' or 'company' is required." },
                { status: 400 }
            );
        }

        // Find a default system or admin user for this workspace to own new leads
        const workspaceMember = await prisma.member.findFirst({
            where: { workspaceId },
            include: { user: true }
        });

        const ownerId = workspaceMember?.userId || "system";

        // 1. Auto-match or create Account
        let resolvedAccountId = null;
        if (company?.trim()) {
            let existingAccount = await prisma.account.findFirst({
                where: {
                    workspaceId,
                    name: { equals: company.trim(), mode: 'insensitive' }
                }
            });

            if (!existingAccount) {
                existingAccount = await prisma.account.create({
                    data: {
                        workspaceId,
                        userId: ownerId,
                        name: company.trim(),
                        phone: phone?.trim() || null,
                        email: email?.trim() || null,
                        rating: 'WARM'
                    }
                });
            }
            resolvedAccountId = existingAccount.id;
        }

        // 2. Auto-match or create Contact
        let resolvedContactId = null;
        const contactName = name?.trim() || company?.trim() || 'Inbound Prospect';
        const safePhone = phone?.trim() || `+91000${Math.floor(1000000 + Math.random() * 9000000)}`;

        let existingContact = null;
        if (phone?.trim()) {
            existingContact = await prisma.contact.findFirst({
                where: { workspaceId, phone: phone.trim() }
            });
        }

        if (!existingContact && email?.trim()) {
            existingContact = await prisma.contact.findFirst({
                where: { workspaceId, email: email.trim().toLowerCase() }
            });
        }

        if (!existingContact) {
            existingContact = await prisma.contact.create({
                data: {
                    workspaceId,
                    userId: ownerId,
                    name: contactName,
                    phone: safePhone,
                    email: email?.trim() ? email.trim().toLowerCase() : null,
                    type: 'LEAD',
                    accountId: resolvedAccountId,
                    tags: ['Inbound-Lead', ...(Array.isArray(tags) ? tags : [])]
                }
            });
        }
        resolvedContactId = existingContact.id;

        // 3. Find default Pipeline & first Stage
        let pipeline = await prisma.pipeline.findFirst({
            where: { workspaceId, isDefault: true },
            include: { stages: { orderBy: { order: 'asc' } } }
        });

        if (!pipeline) {
            pipeline = await prisma.pipeline.findFirst({
                where: { workspaceId },
                include: { stages: { orderBy: { order: 'asc' } } }
            });
        }

        let stageId = pipeline?.stages?.[0]?.id || null;

        // 4. Create new Deal
        let deal = null;
        if (pipeline && stageId) {
            const title = dealTitle?.trim() || `New Lead: ${contactName}${company ? ` (${company})` : ''}`;
            deal = await prisma.deal.create({
                data: {
                    workspaceId,
                    userId: ownerId,
                    title,
                    value: parseFloat(dealValue) || 0,
                    currency,
                    pipelineId: pipeline.id,
                    stageId,
                    contactId: resolvedContactId,
                    accountId: resolvedAccountId,
                    ownerId,
                    tags: ['Inbound', source]
                }
            });
        }

        // 5. Log CRM Activity for Inbound Touchpoint
        const activity = await prisma.crmActivity.create({
            data: {
                workspaceId,
                userId: ownerId,
                contactId: resolvedContactId,
                accountId: resolvedAccountId,
                dealId: deal?.id || null,
                type: 'INBOUND_LEAD',
                title: `⚡ Inbound Lead Captured via ${source}`,
                description: message?.trim() || `Inbound lead received from ${contactName} (${phone || email || 'No direct phone'}).`,
                metadata: {
                    source,
                    message: message?.trim() || '',
                    rawPayload: body
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                dealId: deal?.id || null,
                contactId: resolvedContactId,
                accountId: resolvedAccountId,
                activityId: activity.id,
                message: "Lead successfully ingested into CRM Pipeline"
            }
        });
    } catch (error) {
        console.error("[INBOUND_LEAD_CAPTURE_ERROR]", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to capture lead" },
            { status: 500 }
        );
    }
}
