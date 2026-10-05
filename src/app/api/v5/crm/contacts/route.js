import { prisma } from "@/lib/prisma";
import { validateCrmUserToken } from "../_lib/auth";
import { apiSuccess, apiError } from "../_lib/response";
import { triggerCrmWorkflowAction } from "@/app/workspace/[workspaceId]/crm/_actions/crm-automation-actions";

/**
 * GET /api/v5/crm/contacts
 * Query: search, type, tag, hasAtsCandidate, page, limit
 */
export async function GET(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const type = searchParams.get("type");
        const tag = searchParams.get("tag");
        const hasAtsCandidate = searchParams.get("hasAtsCandidate") === 'true';

        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "50", 10);
        const skip = (page - 1) * limit;

        const where = {
            workspaceId: auth.workspaceId,
            ...(type && type !== 'ALL' ? { type } : {}),
            ...(tag && tag !== 'ALL' ? { tags: { has: tag } } : {}),
            ...(hasAtsCandidate ? { candidateId: { not: null } } : {}),
            ...(search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search } },
                    { email: { contains: search, mode: 'insensitive' } }
                ]
            } : {})
        };

        const [contacts, total] = await Promise.all([
            prisma.contact.findMany({
                where,
                include: {
                    account: true,
                    deals: { select: { id: true, title: true, value: true, stageId: true } },
                    _count: {
                        select: {
                            deals: true,
                            crmActivities: true
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.contact.count({ where })
        ]);

        return apiSuccess(contacts, {
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error("[API_CRM_GET_CONTACTS_ERROR]", error);
        return apiError(error.message || "Failed to fetch contacts", 500);
    }
}

/**
 * POST /api/v5/crm/contacts
 * Body: { name, phone, email, title, type, accountId, address, tags, autoTriggerWorkflow }
 */
export async function POST(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const body = await request.json();
        const {
            name,
            phone,
            email,
            title,
            type = "LEAD",
            accountId,
            address,
            tags = [],
            autoTriggerWorkflow = true
        } = body;

        if (!name?.trim() || !phone?.trim()) {
            return apiError("Name and Phone number are required", 400);
        }

        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length < 8) {
            return apiError("Invalid phone number format", 400);
        }

        // Duplicate Check
        const existing = await prisma.contact.findFirst({
            where: { workspaceId: auth.workspaceId, phone: cleanPhone }
        });

        if (existing) {
            return apiError(`A contact with phone number ${cleanPhone} already exists (${existing.name}).`, 409, { existingContactId: existing.id });
        }

        const contact = await prisma.contact.create({
            data: {
                workspaceId: auth.workspaceId,
                userId: auth.userId,
                name: name.trim(),
                phone: cleanPhone,
                email: email ? email.trim().toLowerCase() : null,
                title: title ? title.trim() : null,
                type,
                accountId: accountId || null,
                address: address || null,
                tags: Array.isArray(tags) ? tags : []
            },
            include: { account: true }
        });

        // Record Activity Timeline
        await prisma.crmActivity.create({
            data: {
                workspaceId: auth.workspaceId,
                userId: auth.userId,
                contactId: contact.id,
                accountId: contact.accountId || null,
                type: "NOTE",
                title: "Contact Created via API",
                description: `Created new ${type.toLowerCase()} record for ${contact.name}.`
            }
        });

        // Trigger FlowForge Workflow Automations
        if (autoTriggerWorkflow) {
            try {
                await triggerCrmWorkflowAction(auth.workspaceId, {
                    triggerEvent: 'LEAD_CREATED',
                    contact,
                    account: contact.account
                });
            } catch (wfErr) {
                console.warn("[CRM_API_LEAD_WORKFLOW_WARN]", wfErr);
            }
        }

        return apiSuccess(contact, { message: "Contact created successfully" }, 201);
    } catch (error) {
        console.error("[API_CRM_CREATE_CONTACT_ERROR]", error);
        return apiError(error.message || "Failed to create contact", 500);
    }
}
