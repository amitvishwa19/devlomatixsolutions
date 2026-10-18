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

        // Fetch all users and workspace members in parallel
        const [users, members] = await Promise.all([
            prisma.user.findMany({
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
                orderBy: { createdAt: 'desc' }
            }),
            prisma.member.findMany({
                where: { serverId: auth.workspaceId },
                select: { userId: true, role: true }
            })
        ]);

        const memberRoleMap = {};
        for (const m of members) {
            if (m.userId) memberRoleMap[m.userId] = m.role;
        }

        const teamList = users.map((u) => {
            const roleTitle =
                (Array.isArray(u.roles) && u.roles.length > 0
                    ? u.roles.map((r) => r.title).filter(Boolean).join(', ')
                    : null) ||
                memberRoleMap[u.id] ||
                u.role ||
                'Sales Executive';

            return {
                id: u.id,
                name: u.displayName || u.username || u.email?.split('@')[0] || 'Team Member',
                email: u.email || '',
                phone: u.phone || '',
                avatar: u.avatar || null,
                role: roleTitle,
                isCurrent: u.id === auth.userId,
            };
        });

        return apiSuccess(teamList, { total: teamList.length });
    } catch (error) {
        console.error('[API_CRM_GET_TEAM_ERROR]', error);
        return apiError(error.message || 'Failed to fetch sales team', 500);
    }
}
