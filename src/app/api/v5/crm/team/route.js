import { prisma } from "@/lib/prisma";
import { validateCrmUserToken } from "../_lib/auth";
import { apiSuccess, apiError } from "../_lib/response";

/**
 * GET /api/v5/crm/team
 * Returns all sales team members & operators in the CRM workspace
 */
export async function GET(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        // 1. Fetch Org Builder Structure (Universal Global or Workspace-specific)
        const globalRecord = await prisma.appSettings.findUnique({
            where: { key: 'org_structure_global' }
        }).catch(() => null);

        let structure = null;
        if (globalRecord?.general && typeof globalRecord.general === 'object') {
            structure = globalRecord.general;
        } else if (auth.workspaceId && auth.workspaceId !== 'global') {
            const wsRecord = await prisma.appSettings.findUnique({
                where: { key: `org_structure_${auth.workspaceId}` }
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
            return apiSuccess([], {
                total: 0,
                orgConfigured: !!structure,
                message: 'No organization members assigned in Org Builder'
            });
        }

        // 3. Query only users assigned to Org Builder nodes
        const users = await prisma.user.findMany({
            where: { id: { in: assignedUserIds } },
            select: {
                id: true,
                displayName: true,
                username: true,
                email: true,
                phone: true,
                avatar: true,
                role: true,
                roles: {
                    select: { id: true, title: true, color: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        const teamList = users.map((u) => {
            const orgMeta = userOrgMap[u.id];
            const roleTitle =
                orgMeta?.title ||
                (Array.isArray(u.roles) && u.roles.length > 0
                    ? u.roles.map((r) => r.title).filter(Boolean).join(', ')
                    : null) ||
                u.role ||
                'Sales Member';

            return {
                id: u.id,
                name: u.displayName || u.username || u.email?.split('@')[0] || 'Team Member',
                email: u.email || '',
                phone: u.phone || '',
                avatar: u.avatar || null,
                role: roleTitle,
                department: orgMeta?.department || 'General',
                nodeColor: orgMeta?.color || '#8b5cf6',
                isCurrent: u.id === auth.userId,
            };
        });

        return apiSuccess(teamList, { total: teamList.length, orgConfigured: true });
    } catch (error) {
        console.error('[API_CRM_GET_TEAM_ERROR]', error);
        return apiError(error.message || 'Failed to fetch sales team', 500);
    }
}
