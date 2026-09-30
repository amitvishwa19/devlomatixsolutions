'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetTemplateGroupsSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const currentUserId = session?.user?.userId || session?.user?.id;

        // Fetch categories designated for templates
        const groups = await db.category.findMany({
            where: {
                workspaceId,
                type: 'TEMPLATE'
            },
            orderBy: { name: 'asc' }
        });

        // Get workspace members & owner
        const workspace = await db.server.findUnique({
            where: { id: workspaceId },
            include: { members: true }
        }).catch(() => null);

        const workspaceUserIds = [
            ...new Set([
                currentUserId,
                workspace?.userId,
                ...((workspace?.members || []).map(m => m.userId))
            ].filter(Boolean))
        ];

        const whereClause = {
            OR: [
                ...(workspaceUserIds.length > 0 ? [{ userId: { in: workspaceUserIds } }] : []),
                ...(currentUserId ? [{ sharedWith: { some: { sharedWithUserId: currentUserId } } }] : []),
                { isDefault: true }
            ]
        };

        // Also calculate template counts for each group
        const templates = await db.messageTemplate.findMany({
            where: whereClause,
            select: {
                id: true,
                metadata: true
            }
        }).catch(() => []);

        const countsMap = {};
        templates.forEach(t => {
            let meta = t.metadata;
            if (typeof meta === 'string') {
                try { meta = JSON.parse(meta); } catch (e) { }
            }
            if (meta?.groupId) {
                countsMap[meta.groupId] = (countsMap[meta.groupId] || 0) + 1;
            }
        });

        const groupsWithCounts = groups.map(g => ({
            ...g,
            templateCount: countsMap[g.id] || 0
        }));

        return {
            data: {
                success: true,
                groups: JSON.parse(JSON.stringify(groupsWithCounts))
            }
        };
    } catch (error) {
        console.error('Action Error (getTemplateGroups):', error);
        return { error: error.message || 'Internal Server Error' };
    }
};

export const getTemplateGroups = createSafeAction(GetTemplateGroupsSchema, handler);
