'use server';

import { db } from "@/lib/db";
import { getAuthUser } from "./auth-helper";

/**
 * Search Workspace Members for Document Sharing
 */
export async function getShareableWorkspaceUsers(workspaceId, query = "") {
    try {
        await getAuthUser();

        const memberWhere = {
            serverId: workspaceId,
        };

        if (query.trim()) {
            memberWhere.user = {
                OR: [
                    { displayName: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } },
                    { username: { contains: query, mode: "insensitive" } },
                ]
            };
        }

        const members = await db.member.findMany({
            where: memberWhere,
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        email: true,
                        avatar: true,
                        role: true,
                    }
                }
            },
            take: 30,
        });

        const users = members
            .filter(m => m.user)
            .map(m => ({
                id: m.user.id,
                displayName: m.user.displayName || m.user.email?.split("@")[0] || "User",
                email: m.user.email,
                avatar: m.user.avatar,
                role: m.role || "MEMBER",
                isWorkspaceMember: true,
            }));

        return { success: true, data: users };
    } catch (error) {
        console.error("[SERVER_ACTION_GET_SHAREABLE_USERS]", error);
        return { success: false, error: error.message || "Failed to fetch workspace users" };
    }
}
