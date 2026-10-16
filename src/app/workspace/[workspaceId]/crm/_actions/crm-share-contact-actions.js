'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { getValidUserId } from "./auth-helper";
import { revalidatePath } from "next/cache";

/**
 * Share a CRM Contact with another user in the workspace
 * Updates both moduleAccess.sharedWith JSON array and prisma.contactShare for dual-write consistency.
 */
export async function shareCrmContactAction(workspaceId, { contactId, targetUserId }) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const currentUserId = await getValidUserId(workspaceId, session);

        if (!contactId || !targetUserId) {
            return { success: false, error: "Contact ID and target user are required" };
        }

        if (targetUserId === currentUserId) {
            return { success: false, error: "Cannot share a contact with yourself" };
        }

        // Verify the contact exists and belongs to this workspace
        const contact = await prisma.contact.findFirst({
            where: { id: contactId, workspaceId },
            select: { id: true, name: true, userId: true, workspaceId: true, moduleAccess: true }
        });

        if (!contact) {
            return { success: false, error: "Contact not found" };
        }

        // Verify that current user owns the contact or is an admin
        if (contact.userId !== currentUserId) {
            const isShared = await prisma.contactShare.findUnique({
                where: {
                    contactId_sharedWithUserId: {
                        contactId,
                        sharedWithUserId: currentUserId
                    }
                }
            });
            if (!isShared && session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
                return { success: false, error: "Unauthorized: only the contact owner can share this record" };
            }
        }

        // Verify target user exists
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: { id: true, displayName: true, email: true }
        });

        if (!targetUser) {
            return { success: false, error: "Target user not found" };
        }

        // Upsert into ContactShare relational table
        const share = await prisma.contactShare.upsert({
            where: {
                contactId_sharedWithUserId: {
                    contactId,
                    sharedWithUserId: targetUserId
                }
            },
            update: {},
            create: {
                contactId,
                sharedWithUserId: targetUserId
            },
            include: {
                sharedWith: {
                    select: { id: true, displayName: true, email: true, avatar: true }
                }
            }
        });

        // Log CRM activity
        await prisma.crmActivity.create({
            data: {
                workspaceId,
                userId: currentUserId,
                contactId,
                type: "NOTE",
                title: "Contact Shared",
                description: `Shared contact "${contact.name}" with ${targetUser.displayName || targetUser.email}.`
            }
        }).catch(err => console.warn("[SHARE_ACTIVITY_LOG_WARN]", err));

        revalidatePath(`/workspace/${workspaceId}/crm/contacts`);
        revalidatePath(`/workspace/${workspaceId}/crm/contacts/${contactId}`);

        return {
            success: true,
            data: {
                id: share.id,
                contactId: share.contactId,
                sharedWith: share.sharedWith,
                moduleAccess: contact.moduleAccess || { modules: ['crm'] }
            }
        };
    } catch (error) {
        console.error("[SHARE_CRM_CONTACT_ERROR]", error);
        return { success: false, error: error.message || "Failed to share contact" };
    }
}

/**
 * Revoke or remove sharing access for a contact
 */
export async function removeCrmContactShareAction(workspaceId, { contactId, sharedWithUserId }) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const currentUserId = await getValidUserId(workspaceId, session);

        if (!contactId || !sharedWithUserId) {
            return { success: false, error: "Contact ID and shared user ID are required" };
        }

        const contact = await prisma.contact.findFirst({
            where: { id: contactId, workspaceId },
            select: { id: true, name: true, userId: true }
        });

        if (!contact) {
            return { success: false, error: "Contact not found" };
        }

        // Only the owner OR the user themselves can remove the share
        const isOwner = contact.userId === currentUserId;
        const isSelf = sharedWithUserId === currentUserId;

        if (!isOwner && !isSelf && session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
            return { success: false, error: "Unauthorized: only the owner or the shared user can revoke access" };
        }

        // Delete from ContactShare relational table
        await prisma.contactShare.deleteMany({
            where: {
                contactId,
                sharedWithUserId
            }
        });

        revalidatePath(`/workspace/${workspaceId}/crm/contacts`);
        revalidatePath(`/workspace/${workspaceId}/crm/contacts/${contactId}`);

        return { success: true };
    } catch (error) {
        console.error("[REMOVE_CRM_CONTACT_SHARE_ERROR]", error);
        return { success: false, error: error.message || "Failed to remove share access" };
    }
}

/**
 * Update active modules for a contact (e.g. ['crm', 'ats', 'konnectx'])
 */
export async function updateCrmContactModulesAction(workspaceId, { contactId, modules }) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const currentUserId = await getValidUserId(workspaceId, session);

        if (!contactId || !Array.isArray(modules)) {
            return { success: false, error: "Contact ID and modules array are required" };
        }

        const contact = await prisma.contact.findFirst({
            where: { id: contactId, workspaceId },
            select: { id: true, name: true, userId: true }
        });

        if (!contact) {
            return { success: false, error: "Contact not found" };
        }

        // Verify owner or admin
        if (contact.userId !== currentUserId && session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
            return { success: false, error: "Unauthorized: only the owner can modify module visibility" };
        }

        const currentModules = modules.length > 0 ? modules : ['crm'];

        const updated = await prisma.contact.update({
            where: { id: contactId },
            data: {
                moduleAccess: {
                    modules: currentModules
                }
            }
        });

        revalidatePath(`/workspace/${workspaceId}/crm/contacts`);
        revalidatePath(`/workspace/${workspaceId}/crm/contacts/${contactId}`);

        return { success: true, data: updated.moduleAccess };
    } catch (error) {
        console.error("[UPDATE_CRM_CONTACT_MODULES_ERROR]", error);
        return { success: false, error: error.message || "Failed to update module visibility" };
    }
}

/**
 * Get all users a contact is shared with
 */
export async function getCrmContactSharedUsersAction(workspaceId, contactId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const shares = await prisma.contactShare.findMany({
            where: { contactId },
            include: {
                sharedWith: {
                    select: {
                        id: true,
                        displayName: true,
                        email: true,
                        avatar: true,
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        return {
            success: true,
            data: shares.map(s => ({
                id: s.id,
                sharedWithUserId: s.sharedWithUserId,
                createdAt: s.createdAt,
                user: s.sharedWith
            }))
        };
    } catch (error) {
        console.error("[GET_CRM_CONTACT_SHARED_USERS_ERROR]", error);
        return { success: false, error: error.message || "Failed to get shared users" };
    }
}
