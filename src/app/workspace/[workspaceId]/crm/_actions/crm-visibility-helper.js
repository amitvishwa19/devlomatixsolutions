'use server';

import { db as prisma } from "@/lib/db";
import { getAuthSession, checkIsSuperAdmin, ensureWorkspaceAccess } from "@/lib/auth-utils";
import { getValidUserId } from "./auth-helper";
import { DEFAULT_ORG_TEMPLATES } from "../../system/_lib/org-templates";

/**
 * Resolves the hierarchical data visibility scope for the current CRM user.
 * 
 * Rules:
 * 1. Super Admin: Full visibility across the workspace/company (visibleUserIds: null).
 * 2. User in Org Hierarchy: Can view their own data PLUS all data of users on lower rungs
 *    (descendant nodes) of the organizational ladder.
 * 3. User with no subordinates or not in hierarchy: Individual visibility only (visibleUserIds: [currentUserId]).
 */
export async function getCrmVisibilityScope(workspaceId, session = null) {
    try {
        if (!session) {
            session = await getAuthSession();
        }

        const currentUserId = await getValidUserId(workspaceId, session);

        // 1. Super Admin check -> Unrestricted access
        const isSuper = await checkIsSuperAdmin(session, currentUserId);
        if (isSuper) {
            return {
                isSuperAdmin: true,
                visibleUserIds: null, // null indicates unrestricted (all users visible)
                currentUserId,
                assignedRoles: ['Super Admin']
            };
        }

        // 2. Fetch the Universal Global Org Hierarchy
        const globalRecord = await prisma.appSettings.findUnique({
            where: { key: 'org_structure_global' }
        }).catch(() => null);

        let structure = null;
        if (globalRecord?.general && typeof globalRecord.general === 'object') {
            structure = globalRecord.general;
        } else if (workspaceId && workspaceId !== 'global' && workspaceId !== 'default') {
            // Check legacy fallback if present
            const legacyRecord = await prisma.appSettings.findUnique({
                where: { key: `org_structure_${workspaceId}` }
            }).catch(() => null);

            if (legacyRecord?.general && typeof legacyRecord.general === 'object') {
                structure = legacyRecord.general;
            }
        }

        // Default template fallback if no structure has been saved yet
        if (!structure || !structure.nodes) {
            structure = DEFAULT_ORG_TEMPLATES.tech_startup;
        }

        const nodes = structure.nodes || {};

        // 3. Find which node(s) the current user is assigned to
        const userNodeIds = Object.keys(nodes).filter(nodeId => {
            const assigned = nodes[nodeId]?.assignedUserIds;
            return Array.isArray(assigned) && assigned.includes(currentUserId);
        });

        // If user is not assigned to any node in the org tree, they only see their own records
        if (userNodeIds.length === 0) {
            return {
                isSuperAdmin: false,
                visibleUserIds: [currentUserId],
                currentUserId,
                assignedRoles: []
            };
        }

        // 4. Recursive Traversal: Collect the user's nodes and all descendant nodes down the ladder
        const visibleUserIdsSet = new Set([currentUserId]);
        const visitedNodes = new Set();
        const queue = [...userNodeIds];
        const assignedRoleTitles = [];

        userNodeIds.forEach(id => {
            if (nodes[id]?.title) assignedRoleTitles.push(nodes[id].title);
        });

        while (queue.length > 0) {
            const currentNodeId = queue.shift();
            if (visitedNodes.has(currentNodeId)) continue;
            visitedNodes.add(currentNodeId);

            const currentNode = nodes[currentNodeId];
            if (currentNode?.assignedUserIds && Array.isArray(currentNode.assignedUserIds)) {
                currentNode.assignedUserIds.forEach(uid => {
                    if (uid) visibleUserIdsSet.add(uid);
                });
            }

            // Find all direct children (nodes with parentId === currentNodeId)
            Object.values(nodes).forEach(candidateNode => {
                if (candidateNode.parentId === currentNodeId && !visitedNodes.has(candidateNode.id)) {
                    queue.push(candidateNode.id);
                }
            });
        }

        return {
            isSuperAdmin: false,
            visibleUserIds: Array.from(visibleUserIdsSet),
            currentUserId,
            assignedRoles: assignedRoleTitles
        };
    } catch (error) {
        console.error("[getCrmVisibilityScope] Error:", error);
        // Fallback: Safe individual access
        const fallbackUserId = session?.user?.userId || session?.user?.id || 'default';
        return {
            isSuperAdmin: false,
            visibleUserIds: [fallbackUserId],
            currentUserId: fallbackUserId,
            assignedRoles: []
        };
    }
}

/**
 * Server Action: Returns all team members that the current user has visibility over.
 * Used by UI dropdowns (Owner filter, Sales Rep filter, DCR rep filter, etc.)
 */
export async function getVisibleTeamMembersAction(workspaceId) {
    try {
        await ensureWorkspaceAccess(workspaceId);
        const scope = await getCrmVisibilityScope(workspaceId);

        let users = [];
        if (scope.isSuperAdmin) {
            // Super Admin can select from all active users in the company
            users = await prisma.user.findMany({
                select: {
                    id: true,
                    displayName: true,
                    email: true,
                    avatar: true,
                    role: true
                },
                orderBy: { displayName: 'asc' }
            });
        } else {
            // Managers can select from themselves + all users below them on the ladder
            users = await prisma.user.findMany({
                where: {
                    id: { in: scope.visibleUserIds }
                },
                select: {
                    id: true,
                    displayName: true,
                    email: true,
                    avatar: true,
                    role: true
                },
                orderBy: { displayName: 'asc' }
            });
        }

        return {
            success: true,
            data: {
                isSuperAdmin: scope.isSuperAdmin,
                currentUserId: scope.currentUserId,
                assignedRoles: scope.assignedRoles,
                members: users
            }
        };
    } catch (error) {
        console.error("[getVisibleTeamMembersAction] Error:", error);
        return {
            success: false,
            error: error.message || "Failed to load team members"
        };
    }
}
