'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const SearchUsersSchema = z.object({
    workspaceId: z.string(),
    query: z.string().optional().default(''),
});

const handler = async (data) => {
    const { workspaceId, query } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        if (!session) {
            throw new Error("No active session found");
        }

        const where = query
            ? {
                OR: [
                    { email: { contains: query, mode: 'insensitive' } },
                    { displayName: { contains: query, mode: 'insensitive' } },
                ]
            }
            : {};

        const users = await db.user.findMany({
            where,
            select: {
                id: true,
                displayName: true,
                email: true,
            },
            orderBy: { displayName: 'asc' },
            take: query ? 10 : undefined,
        });

        return { data: users };
    } catch (error) {
        console.error("[searchUsers] Error:", error);
        return { error: error.message || "Failed to search users" };
    }
};

export const searchUsers = createSafeAction(SearchUsersSchema, handler);
