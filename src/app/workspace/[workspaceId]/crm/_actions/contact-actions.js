'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess, getAuthSession } from "@/lib/auth-utils";
import { getValidUserId } from "./auth-helper";
import { triggerCrmWorkflowAction } from "./crm-automation-actions";

/**
 * Get all Contacts for CRM with search, filters, and relationship stats
 * RESTRICTION: Only contacts of CRM owned by current user AND contacts shared to that user are returned.
 */
export async function getCrmContactsAction(workspaceId, filters = {}) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const currentUserId = await getValidUserId(workspaceId, session);

        const { search, type, accountId, tag, hasAtsCandidate, scope = 'ALL', moduleFilter = 'ALL' } = filters;

        // In CRM, every contact MUST belong to the CRM module (or be a default LEAD/CLIENT)
        const crmModuleCondition = {
            type: { not: 'GOOGLE_PLACE' },
            OR: [
                { moduleAccess: { path: ['modules'], array_contains: 'crm' } },
                { type: { in: ['LEAD', 'CLIENT'] } }
            ]
        };

        // Access scope condition:
        // - OWNED: created/owned by user in this workspace
        // - SHARED: explicitly shared with user across workspaces
        // - ALL: owned by user in workspace OR shared with user across workspaces
        let accessCondition;
        if (scope === 'OWNED') {
            accessCondition = {
                workspaceId,
                userId: currentUserId
            };
        } else if (scope === 'SHARED') {
            accessCondition = {
                sharedWith: { some: { sharedWithUserId: currentUserId } },
                userId: { not: currentUserId }
            };
        } else {
            accessCondition = {
                OR: [
                    { workspaceId, userId: currentUserId },
                    { sharedWith: { some: { sharedWithUserId: currentUserId } } }
                ]
            };
        }

        const andConditions = [
            crmModuleCondition,
            accessCondition
        ];

        if (moduleFilter && moduleFilter !== 'ALL') {
            andConditions.push({
                moduleAccess: { path: ['modules'], array_contains: moduleFilter.toLowerCase() }
            });
        }
        if (type && type !== 'ALL') {
            andConditions.push({ type });
        }
        if (accountId) {
            andConditions.push({ accountId });
        }
        if (tag && tag !== 'ALL') {
            andConditions.push({ tags: { has: tag } });
        }
        if (hasAtsCandidate === 'true' || hasAtsCandidate === true) {
            andConditions.push({ candidateId: { not: null } });
        }
        if (search?.trim()) {
            const s = search.trim();
            andConditions.push({
                OR: [
                    { name: { contains: s, mode: 'insensitive' } },
                    { phone: { contains: s } },
                    { email: { contains: s, mode: 'insensitive' } },
                    { title: { contains: s, mode: 'insensitive' } },
                    { account: { name: { contains: s, mode: 'insensitive' } } }
                ]
            });
        }

        const contacts = await prisma.contact.findMany({
            where: {
                AND: andConditions
            },
            include: {
                user: {
                    select: { id: true, displayName: true, email: true, avatar: true }
                },
                sharedWith: {
                    include: {
                        sharedWith: {
                            select: { id: true, displayName: true, email: true, avatar: true }
                        }
                    }
                },
                account: {
                    select: { id: true, name: true, industry: true, domain: true }
                },
                deals: {
                    select: {
                        id: true,
                        title: true,
                        value: true,
                        currency: true,
                        stage: { select: { id: true, name: true, color: true, isWon: true, isLost: true } }
                    }
                },
                _count: {
                    select: {
                        crmActivities: true,
                        ecommerceOrders: true,
                        sharedWith: true,
                        deals: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return {
            success: true,
            data: contacts,
            currentUserId
        };
    } catch (error) {
        console.error("[GET_CRM_CONTACTS_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch CRM contacts" };
    }
}

/**
 * Get single contact by ID with ownership/shared access check
 */
export async function getCrmContactByIdAction(workspaceId, contactId) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const currentUserId = await getValidUserId(workspaceId, session);

        const contact = await prisma.contact.findFirst({
            where: {
                id: contactId,
                workspaceId,
                OR: [
                    { userId: currentUserId },
                    { moduleAccess: { path: ['sharedWith'], array_contains: currentUserId } },
                    { sharedWith: { some: { sharedWithUserId: currentUserId } } }
                ]
            },
            include: {
                user: {
                    select: { id: true, displayName: true, email: true, avatar: true }
                },
                sharedWith: {
                    include: {
                        sharedWith: {
                            select: { id: true, displayName: true, email: true, avatar: true }
                        }
                    }
                },
                account: true,
                deals: {
                    include: { stage: true, pipeline: true },
                    orderBy: { updatedAt: 'desc' }
                },
                crmActivities: {
                    include: {
                        user: { select: { id: true, displayName: true, avatar: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!contact) {
            return { success: false, error: "Contact not found or access denied" };
        }

        return { success: true, data: contact, currentUserId };
    } catch (error) {
        console.error("[GET_CRM_CONTACT_BY_ID_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch contact" };
    }
}

/**
 * Create a new Contact in CRM with moduleAccess support
 */
export async function createCrmContactAction(workspaceId, data) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        const {
            name,
            phone,
            email,
            title,
            type = "LEAD",
            accountId,
            address,
            tags = [],
            candidateId,
            modules = ['crm'],
            sharedWith = []
        } = data;

        if (!name?.trim() || !phone?.trim()) {
            return { success: false, error: "Name and Phone number are required." };
        }

        const cleanPhone = phone.replace(/[^0-9]/g, '');

        // Check for existing contact by phone in workspace
        const existing = await prisma.contact.findFirst({
            where: {
                workspaceId,
                phone: cleanPhone
            }
        });

        if (existing) {
            return {
                success: false,
                error: `A contact with phone number ${cleanPhone} already exists (${existing.name}).`
            };
        }

        const assignedModules = Array.isArray(modules) && modules.length > 0 ? modules : ['crm'];
        const assignedSharedWith = Array.isArray(sharedWith) ? sharedWith : [];

        const contact = await prisma.contact.create({
            data: {
                workspaceId,
                userId,
                name: name.trim(),
                phone: cleanPhone,
                email: email ? email.trim().toLowerCase() : null,
                title: title ? title.trim() : null,
                type,
                accountId: accountId || null,
                address: address || null,
                tags: Array.isArray(tags) ? tags : [],
                candidateId: candidateId || null,
                moduleAccess: {
                    modules: assignedModules
                }
            },
            include: {
                account: true
            }
        });

        // Insert initial shared users into ContactShare relational table
        if (assignedSharedWith.length > 0) {
            await prisma.contactShare.createMany({
                data: assignedSharedWith.map(sharedWithUserId => ({
                    contactId: contact.id,
                    sharedWithUserId
                })),
                skipDuplicates: true
            }).catch(e => console.warn('[CREATE_CONTACT_SHARE_WARN]', e));
        }

        // Log Activity
        await prisma.crmActivity.create({
            data: {
                workspaceId,
                userId,
                contactId: contact.id,
                accountId: contact.accountId || null,
                type: "NOTE",
                title: "Contact Created",
                description: `Created new ${type.toLowerCase()} record for ${contact.name}.`
            }
        });

        // FlowForge Bridge: Trigger Cross-Module Workflow Automation on New Lead
        try {
            await triggerCrmWorkflowAction(workspaceId, {
                triggerEvent: 'LEAD_CREATED',
                contact,
                account: contact.account
            });
        } catch (wfErr) {
            console.warn("[CRM_LEAD_WORKFLOW_WARN]", wfErr);
        }

        return { success: true, data: contact };
    } catch (error) {
        console.error("[CREATE_CRM_CONTACT_ERROR]", error);
        return { success: false, error: error.message || "Failed to create contact" };
    }
}

/**
 * Update a Contact
 */
export async function updateCrmContactAction(workspaceId, contactId, data) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session?.user?.id || "anonymous";

        const {
            name,
            phone,
            email,
            title,
            type,
            accountId,
            address,
            tags,
            candidateId
        } = data;

        const updatePayload = {};
        if (name) updatePayload.name = name.trim();
        if (phone) updatePayload.phone = phone.replace(/[^0-9]/g, '');
        if (email !== undefined) updatePayload.email = email ? email.trim().toLowerCase() : null;
        if (title !== undefined) updatePayload.title = title ? title.trim() : null;
        if (type) updatePayload.type = type;
        if (accountId !== undefined) updatePayload.accountId = accountId || null;
        if (address !== undefined) updatePayload.address = address || null;
        if (tags !== undefined) updatePayload.tags = Array.isArray(tags) ? tags : [];
        if (candidateId !== undefined) updatePayload.candidateId = candidateId || null;

        const updatedContact = await prisma.contact.update({
            where: { id: contactId },
            data: updatePayload,
            include: {
                account: true
            }
        });

        return { success: true, data: updatedContact };
    } catch (error) {
        console.error("[UPDATE_CRM_CONTACT_ERROR]", error);
        return { success: false, error: error.message || "Failed to update contact" };
    }
}

/**
 * Delete a Contact
 */
export async function deleteCrmContactAction(workspaceId, contactId) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const currentUserId = await getValidUserId(workspaceId, session);

        const contact = await prisma.contact.findFirst({
            where: { id: contactId, workspaceId }
        });

        if (!contact) {
            return { success: false, error: "Contact not found" };
        }

        // Only owner or admin can permanently delete
        if (contact.userId !== currentUserId && session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
            return { success: false, error: "Only the owner can delete this contact" };
        }

        await prisma.contact.delete({
            where: { id: contactId }
        });

        return { success: true };
    } catch (error) {
        console.error("[DELETE_CRM_CONTACT_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete contact" };
    }
}
