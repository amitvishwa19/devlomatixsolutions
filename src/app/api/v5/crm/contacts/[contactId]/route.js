import { prisma } from "@/lib/prisma";
import { validateCrmUserToken } from "../../_lib/auth";
import { apiSuccess, apiError } from "../../_lib/response";

/**
 * GET /api/v5/crm/contacts/[contactId]
 */
export async function GET(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { contactId } = await params;

        const contact = await prisma.contact.findFirst({
            where: {
                id: contactId,
                OR: [
                    { userId: auth.userId },
                    { workspaceId: auth.workspaceId },
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
            },
            include: {
                user: { select: { id: true, displayName: true, email: true, avatar: true } },
                sharedWith: {
                    include: {
                        sharedWith: { select: { id: true, displayName: true, email: true, avatar: true } }
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

        if (!contact) return apiError("Contact not found or access denied", 404);

        return apiSuccess(contact);
    } catch (error) {
        console.error("[API_CRM_GET_CONTACT_ERROR]", error);
        return apiError(error.message || "Failed to fetch contact", 500);
    }
}

/**
 * PATCH /api/v5/crm/contacts/[contactId]
 */
export async function PATCH(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { contactId } = await params;
        const body = await request.json();

        const existing = await prisma.contact.findFirst({
            where: {
                id: contactId,
                OR: [
                    { userId: auth.userId },
                    { workspaceId: auth.workspaceId },
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
            },
            include: {
                sharedWith: true
            }
        });

        if (!existing) return apiError("Contact not found or access denied", 404);

        const updateData = {};
        if (body.name !== undefined) updateData.name = body.name.trim();
        if (body.phone !== undefined) updateData.phone = body.phone.replace(/[^0-9]/g, '');
        if (body.email !== undefined) updateData.email = body.email ? body.email.trim().toLowerCase() : null;
        if (body.title !== undefined) updateData.title = body.title ? body.title.trim() : null;
        if (body.type !== undefined) updateData.type = body.type;
        if (body.accountId !== undefined) updateData.accountId = body.accountId || null;
        if (body.address !== undefined) updateData.address = body.address || null;
        if (body.tags !== undefined) updateData.tags = Array.isArray(body.tags) ? body.tags : [];

        // Support moduleAccess and team sharing synchronization
        let targetSharedUsers = null;
        let existingMa = existing.moduleAccess;
        if (typeof existingMa === 'string') {
            try { existingMa = JSON.parse(existingMa); } catch (e) { existingMa = null; }
        }
        if (!existingMa || typeof existingMa !== 'object') {
            existingMa = { modules: ['crm'], sharedWith: [] };
        }

        if (body.moduleAccess !== undefined) {
            let ma = body.moduleAccess;
            if (typeof ma === 'string') {
                try { ma = JSON.parse(ma); } catch (e) {}
            }
            if (ma && typeof ma === 'object') {
                updateData.moduleAccess = {
                    modules: Array.isArray(ma.modules) && ma.modules.length > 0 ? ma.modules : (existingMa.modules || ['crm']),
                    sharedWith: Array.isArray(ma.sharedWith) ? ma.sharedWith : (existingMa.sharedWith || [])
                };
                if (Array.isArray(ma.sharedWith)) {
                    targetSharedUsers = ma.sharedWith;
                }
            }
        }

        if (Array.isArray(body.sharedWith)) {
            targetSharedUsers = body.sharedWith;
            const currentMods = updateData.moduleAccess?.modules || existingMa.modules || ['crm'];
            updateData.moduleAccess = {
                modules: currentMods,
                sharedWith: targetSharedUsers
            };
        }

        // Dual-write sync with relational ContactShare table
        if (targetSharedUsers !== null) {
            const resolvedUserIds = [];
            for (const item of targetSharedUsers) {
                if (!item || typeof item !== 'string') continue;
                if (item.includes('@')) {
                    const u = await prisma.user.findFirst({
                        where: { email: { equals: item.trim(), mode: 'insensitive' } },
                        select: { id: true }
                    });
                    if (u?.id) resolvedUserIds.push(u.id);
                } else {
                    resolvedUserIds.push(item);
                }
            }

            // Sync with ContactShare table
            const currentShares = await prisma.contactShare.findMany({
                where: { contactId },
                select: { id: true, sharedWithUserId: true }
            });
            const currentSharedIds = currentShares.map((s) => s.sharedWithUserId);

            // Obsolete shares to remove
            const toRemove = currentSharedIds.filter((id) => !resolvedUserIds.includes(id));
            if (toRemove.length > 0) {
                await prisma.contactShare.deleteMany({
                    where: {
                        contactId,
                        sharedWithUserId: { in: toRemove }
                    }
                });
            }

            // New shares to add
            const toAdd = resolvedUserIds.filter((id) => id && !currentSharedIds.includes(id));
            for (const targetUserId of toAdd) {
                const targetUser = await prisma.user.findUnique({
                    where: { id: targetUserId },
                    select: { id: true, displayName: true, email: true }
                });
                if (targetUser) {
                    await prisma.contactShare.upsert({
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
                        }
                    });

                    // Log activity
                    await prisma.crmActivity.create({
                        data: {
                            workspaceId: existing.workspaceId,
                            userId: auth.userId,
                            contactId,
                            type: "NOTE",
                            title: "Contact Shared",
                            description: `Shared contact "${existing.name}" with ${targetUser.displayName || targetUser.email}.`
                        }
                    }).catch((err) => console.warn("[SHARE_ACTIVITY_LOG_WARN]", err));
                }
            }
        }

        const updated = await prisma.contact.update({
            where: { id: contactId },
            data: updateData,
            include: {
                user: { select: { id: true, displayName: true, email: true, avatar: true } },
                account: true,
                sharedWith: {
                    include: {
                        sharedWith: { select: { id: true, displayName: true, email: true, avatar: true } }
                    }
                }
            }
        });

        return apiSuccess(updated, { message: "Contact updated successfully" });
    } catch (error) {
        console.error("[API_CRM_UPDATE_CONTACT_ERROR]", error);
        return apiError(error.message || "Failed to update contact", 500);
    }
}

/**
 * DELETE /api/v5/crm/contacts/[contactId]
 */
export async function DELETE(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { contactId } = await params;

        const existing = await prisma.contact.findFirst({
            where: { id: contactId, workspaceId: auth.workspaceId }
        });

        if (!existing) return apiError("Contact not found", 404);

        // Only owner or admin can permanently delete
        if (existing.userId !== auth.userId && auth.role !== 'ADMIN' && auth.role !== 'SUPER_ADMIN') {
            return apiError("Only the owner can delete this contact", 403);
        }

        await prisma.contact.delete({ where: { id: contactId } });

        return apiSuccess({ id: contactId }, { message: "Contact deleted successfully" });
    } catch (error) {
        console.error("[API_CRM_DELETE_CONTACT_ERROR]", error);
        return apiError(error.message || "Failed to delete contact", 500);
    }
}
