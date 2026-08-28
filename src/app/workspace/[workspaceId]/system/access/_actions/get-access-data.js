'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const GetAccessDataSchema = z.object({
  workspaceId: z.string().optional(),
});

const handler = async (data) => {
  try {
    const [users, roles, permissions] = await Promise.all([
      db.user.findMany({
        select: {
          id: true,
          displayName: true,
          username: true,
          email: true,
          avatar: true,
          isActive: true,
          role: true,
          roles: {
            select: {
              id: true,
              title: true,
              color: true,
              permissions: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),

      db.role.findMany({
        include: {
          permissions: true,
          users: {
            select: {
              id: true,
              displayName: true,
              email: true,
              avatar: true,
            },
          },
          parent: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),

      db.permission.findMany({
        include: {
          roles: {
            include: {
              users: {
                select: {
                  id: true,
                  displayName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    const departments = [];

    return {
      data: {
        users: users || [],
        roles: roles || [],
        permissions: permissions || [],
        departments,
      },
    };
  } catch (error) {
    console.error("[getAccessData] Server Action Error:", error);
    return {
      message: error?.message || "Failed to load access data",
      error,
    };
  }
};

export const getAccessData = createSafeAction(GetAccessDataSchema, handler);

// Direct async callable export
export async function getAccessDataDirect(workspaceId) {
  const result = await handler({ workspaceId });
  return result?.data || { users: [], roles: [], permissions: [], departments: [] };
}
