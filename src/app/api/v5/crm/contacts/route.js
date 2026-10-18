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
        const scope = searchParams.get("scope") || "ALL";

        // Auto-heal missing ContactShare relational entries for contacts previously shared via moduleAccess
        try {
            const unhealedContacts = await prisma.contact.findMany({
                where: {
                    moduleAccess: { not: null },
                    sharedWith: { none: {} }
                },
                select: { id: true, moduleAccess: true },
                take: 25
            });

            for (const c of unhealedContacts) {
                let ma = c.moduleAccess;
                if (typeof ma === 'string') {
                    try { ma = JSON.parse(ma); } catch (e) {}
                }
                if (Array.isArray(ma?.sharedWith) && ma.sharedWith.length > 0) {
                    for (const target of ma.sharedWith) {
                        let uid = target;
                        if (typeof target === 'string' && target.includes('@')) {
                            const u = await prisma.user.findFirst({
                                where: { email: { equals: target.trim(), mode: 'insensitive' } },
                                select: { id: true }
                            });
                            uid = u?.id;
                        }
                        if (uid) {
                            await prisma.contactShare.upsert({
                                where: { contactId_sharedWithUserId: { contactId: c.id, sharedWithUserId: uid } },
                                create: { contactId: c.id, sharedWithUserId: uid },
                                update: {}
                            }).catch(() => {});
                        }
                    }
                }
            }
        } catch (healErr) {
            // Silently continue
        }

        // Definition of a CRM Contact (excludes raw non-CRM data like GOOGLE_PLACE scrapes)
        const crmDefinition = {
            type: { not: 'GOOGLE_PLACE' },
            OR: [
                { type: { in: ['LEAD', 'CLIENT'] } },
                { accountId: { not: null } },
                { deals: { some: {} } },
                { crmActivities: { some: {} } },
                { candidateId: { not: null } }
            ]
        };

        let accessCondition;
        if (scope === 'OWNED') {
            accessCondition = {
                workspaceId: auth.workspaceId,
                userId: auth.userId,
                ...crmDefinition
            };
        } else if (scope === 'SHARED') {
            accessCondition = {
                sharedWith: {
                    some: {
                        OR: [
                            { sharedWithUserId: auth.userId },
                            { sharedWith: { email: auth.user.email } }
                        ]
                    }
                }
            };
        } else {
            accessCondition = {
                OR: [
                    {
                        workspaceId: auth.workspaceId,
                        ...(auth.user?.role === 'ADMIN' || auth.user?.role === 'SUPER_ADMIN' ? {} : { userId: auth.userId }),
                        ...crmDefinition
                    },
                    {
                        sharedWith: {
                            some: {
                                OR: [
                                    { sharedWithUserId: auth.userId },
                                    { sharedWith: { email: auth.user.email } }
                                ]
                            }
                        }
                    }
                ]
            };
        }

        const andConditions = [accessCondition];

        if (type && type !== 'ALL') andConditions.push({ type });
        if (tag && tag !== 'ALL') andConditions.push({ tags: { has: tag } });
        if (hasAtsCandidate) andConditions.push({ candidateId: { not: null } });
        if (search) {
            andConditions.push({
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search } },
                    { email: { contains: search, mode: 'insensitive' } }
                ]
            });
        }

        const where = { AND: andConditions };

        const [contacts, total] = await Promise.all([
            prisma.contact.findMany({
                where,
                include: {
                    user: { select: { id: true, displayName: true, email: true, avatar: true } },
                    sharedWith: {
                        include: {
                            sharedWith: { select: { id: true, displayName: true, email: true, avatar: true } }
                        }
                    },
                    account: true,
                    deals: { select: { id: true, title: true, value: true, stageId: true } },
                    _count: {
                        select: {
                            deals: true,
                            crmActivities: true,
                            sharedWith: true
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
 * Body: { name, phone, email, title, type, accountId, address, tags, autoTriggerWorkflow, moduleAccess, sharedWith }
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
            autoTriggerWorkflow = true,
            moduleAccess,
            sharedWith
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

        let normalizedModuleAccess = moduleAccess;
        if (typeof normalizedModuleAccess === 'string') {
            try { normalizedModuleAccess = JSON.parse(normalizedModuleAccess); } catch (e) {}
        }
        if (!normalizedModuleAccess || typeof normalizedModuleAccess !== 'object') {
            normalizedModuleAccess = { modules: ['crm'], sharedWith: [] };
        }

        const sharedList = Array.isArray(sharedWith)
            ? sharedWith
            : Array.isArray(normalizedModuleAccess.sharedWith)
                ? normalizedModuleAccess.sharedWith
                : [];

        normalizedModuleAccess.sharedWith = sharedList;

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
                tags: Array.isArray(tags) ? tags : [],
                moduleAccess: normalizedModuleAccess
            },
            include: { account: true }
        });

        // Sync initial sharedWith users
        if (sharedList.length > 0) {
            for (const item of sharedList) {
                if (!item || typeof item !== 'string') continue;
                let uid = item;
                if (item.includes('@')) {
                    const u = await prisma.user.findFirst({
                        where: { email: { equals: item.trim(), mode: 'insensitive' } },
                        select: { id: true }
                    });
                    uid = u?.id;
                }
                if (uid) {
                    await prisma.contactShare.upsert({
                        where: {
                            contactId_sharedWithUserId: {
                                contactId: contact.id,
                                sharedWithUserId: uid
                            }
                        },
                        update: {},
                        create: {
                            contactId: contact.id,
                            sharedWithUserId: uid
                        }
                    }).catch(() => {});
                }
            }
        }

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
