'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess, getAuthSession } from "@/lib/auth-utils";
import { getValidUserId } from "./auth-helper";

/**
 * Get unified activity timeline
 */
export async function getActivitiesAction(workspaceId, filters = {}) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const { contactId, accountId, dealId, type, limit = 50 } = filters;

        const where = {
            workspaceId,
            contactId: contactId || undefined,
            accountId: accountId || undefined,
            dealId: dealId || undefined,
            type: type || undefined
        };

        const activities = await prisma.crmActivity.findMany({
            where,
            include: {
                user: {
                    select: { id: true, displayName: true, email: true, avatar: true }
                },
                contact: {
                    select: { id: true, name: true, phone: true }
                },
                deal: {
                    select: { id: true, title: true, value: true, currency: true }
                },
                account: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit) || 50
        });

        return { success: true, data: activities };
    } catch (error) {
        console.error("[GET_ACTIVITIES_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch activities" };
    }
}

/**
 * Log a new Activity / Note / Meeting / Call
 */
export async function createActivityAction(workspaceId, data) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        const {
            type = "NOTE", // NOTE, CALL, MEETING, EMAIL, WHATSAPP_MSG, TASK
            title,
            description,
            contactId,
            accountId,
            dealId,
            metadata = {}
        } = data;

        if (!title?.trim()) {
            return { success: false, error: "Activity title or subject is required" };
        }

        const activity = await prisma.crmActivity.create({
            data: {
                workspaceId,
                userId,
                type,
                title: title.trim(),
                description: description || null,
                contactId: contactId || null,
                accountId: accountId || null,
                dealId: dealId || null,
                metadata
            },
            include: {
                user: {
                    select: { id: true, displayName: true, email: true, avatar: true }
                }
            }
        });

        return { success: true, data: activity };
    } catch (error) {
        console.error("[CREATE_ACTIVITY_ERROR]", error);
        return { success: false, error: error.message || "Failed to create activity" };
    }
}

/**
 * Delete an Activity
 */
export async function deleteActivityAction(workspaceId, activityId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        await prisma.crmActivity.delete({
            where: { id: activityId }
        });

        return { success: true };
    } catch (error) {
        console.error("[DELETE_ACTIVITY_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete activity" };
    }
}
