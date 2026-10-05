'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess, getAuthSession } from "@/lib/auth-utils";
import { getValidUserId } from "./auth-helper";
import { triggerCrmWorkflowAction } from "./crm-automation-actions";

/**
 * Get all Contacts for CRM with search, filters, and relationship stats
 */
export async function getCrmContactsAction(workspaceId, filters = {}) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const { search, type, accountId, tag, hasAtsCandidate } = filters;

        const where = {
            workspaceId,
            type: type && type !== 'ALL' ? type : undefined,
            accountId: accountId || undefined,
            ...(tag && tag !== 'ALL' ? { tags: { has: tag } } : {}),
            ...(hasAtsCandidate === 'true' || hasAtsCandidate === true ? { candidateId: { not: null } } : {}),
            ...(search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { title: { contains: search, mode: 'insensitive' } },
                    { account: { name: { contains: search, mode: 'insensitive' } } }
                ]
            } : {})
        };

        const contacts = await prisma.contact.findMany({
            where,
            include: {
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
                        ecommerceOrders: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return { success: true, data: contacts };
    } catch (error) {
        console.error("[GET_CRM_CONTACTS_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch CRM contacts" };
    }
}

/**
 * Get single contact by ID
 */
export async function getCrmContactByIdAction(workspaceId, contactId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const contact = await prisma.contact.findFirst({
            where: { id: contactId, workspaceId },
            include: {
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
            return { success: false, error: "Contact not found" };
        }

        return { success: true, data: contact };
    } catch (error) {
        console.error("[GET_CRM_CONTACT_BY_ID_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch contact" };
    }
}

/**
 * Create a new Contact in CRM
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
            candidateId
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
                candidateId: candidateId || null
            },
            include: {
                account: true
            }
        });

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
        await ensureWorkspaceAccess(workspaceId);

        await prisma.contact.delete({
            where: { id: contactId }
        });

        return { success: true };
    } catch (error) {
        console.error("[DELETE_CRM_CONTACT_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete contact" };
    }
}
