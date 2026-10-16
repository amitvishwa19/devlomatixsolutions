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

        const users = await prisma.user.findMany({
            where: {
                ...(currentUserId ? { id: { not: currentUserId } } : {}),
                ...(currentUserEmail ? { email: { not: currentUserEmail } } : {})
            },
            select: {
                id: true,
                displayName: true,
                username: true,
                email: true,
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
            const roleTitle = u.roles && u.roles.length > 0
                ? u.roles.map((r) => r.title).join(', ')
                : (u.role ? (u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase()) : 'Sales Team');

            const name = u.displayName || u.username || (u.email ? u.email.split('@')[0] : 'Team Member');

            return {
                id: u.id,
                name,
                email: u.email,
                avatar: u.avatar || null,
                title: roleTitle,
                isActive: u.isActive,
                type: 'team'
            };
        });

        return { success: true, data: formattedMembers };
    } catch (error) {
        console.error('Error in getCrmTeamMembersAction:', error);
        return { success: false, error: error.message || 'Failed to fetch team members' };
    }
}
