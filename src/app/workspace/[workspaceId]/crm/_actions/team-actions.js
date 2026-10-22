'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

/**
 * Fetch all workspace users for CRM Sales Team communications
 */
export async function getCrmTeamMembersAction(workspaceId) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const currentUserId = session?.user?.userId || session?.user?.id;
        const currentUserEmail = session?.user?.email;

        // 1. Fetch Org Builder Structure (Universal Global or Workspace-specific)
        const globalRecord = await prisma.appSettings.findUnique({
            where: { key: 'org_structure_global' }
        }).catch(() => null);

        let structure = null;
        if (globalRecord?.general && typeof globalRecord.general === 'object') {
            structure = globalRecord.general;
        } else if (workspaceId && workspaceId !== 'global') {
            const wsRecord = await prisma.appSettings.findUnique({
                where: { key: `org_structure_${workspaceId}` }
            }).catch(() => null);
            if (wsRecord?.general && typeof wsRecord.general === 'object') {
                structure = wsRecord.general;
            }
        }

        // 2. Extract assigned user IDs and role metadata from Org Builder nodes
        const nodes = structure?.nodes || {};
        const userOrgMap = {};
        const assignedUserIdsSet = new Set();

        Object.values(nodes).forEach((node) => {
            if (Array.isArray(node.assignedUserIds)) {
                node.assignedUserIds.forEach((uid) => {
                    if (uid) {
                        const cleanUid = String(uid);
                        assignedUserIdsSet.add(cleanUid);
                        if (!userOrgMap[cleanUid]) {
                            userOrgMap[cleanUid] = {
                                title: node.title || 'Team Member',
                                department: node.department || 'General',
                                color: node.color || '#8b5cf6',
                                order: node.order || 0
                            };
                        } else {
                            if (node.title && !userOrgMap[cleanUid].title.includes(node.title)) {
                                userOrgMap[cleanUid].title += `, ${node.title}`;
                            }
                        }
                    }
                });
            }
        });

        const assignedUserIds = Array.from(assignedUserIdsSet);

        // If no members are assigned in Org Builder, return empty list
        if (assignedUserIds.length === 0) {
            return {
                success: true,
                data: [],
                orgConfigured: !!structure,
                message: 'No organization members assigned in Org Builder'
            };
        }

        // 3. Query only the users that are assigned to Org Builder nodes
        const users = await prisma.user.findMany({
            where: {
                id: { in: assignedUserIds },
                ...(currentUserId ? { id: { not: currentUserId } } : {}),
                ...(currentUserEmail ? { email: { not: currentUserEmail } } : {})
            },
            select: {
                id: true,
                displayName: true,
                username: true,
                email: true,
                phone: true,
                avatar: true,
                role: true,
                isActive: true,
                roles: {
                    select: {
                        id: true,
                        title: true,
                        color: true
                    }
                },
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        const formattedMembers = users.map((u) => {
            const orgMeta = userOrgMap[u.id];
            const roleTitle = orgMeta?.title ||
                (u.roles && u.roles.length > 0
                    ? u.roles.map((r) => r.title).join(', ')
                    : (u.role ? (u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase()) : 'Sales Team'));

            const name = u.displayName || u.username || (u.email ? u.email.split('@')[0] : 'Team Member');

            return {
                id: u.id,
                name,
                email: u.email,
                phone: u.phone || '',
                avatar: u.avatar || null,
                title: roleTitle,
                department: orgMeta?.department || 'General',
                color: orgMeta?.color || '#8b5cf6',
                isActive: u.isActive,
                type: 'team'
            };
        });

        return { success: true, data: formattedMembers, orgConfigured: true };
    } catch (error) {
        console.error('Error in getCrmTeamMembersAction:', error);
        return { success: false, error: error.message || 'Failed to fetch team members' };
    }
}
