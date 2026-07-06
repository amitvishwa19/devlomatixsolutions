'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const GetContactsSchema = z.object({
    userId: z.string().optional(),
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { userId, workspaceId } = data;
    try {
        const contacts = await db.contact.findMany({
            where: {
                workspaceId,
                ...(userId ? {
                    OR: [
                        { userId },
                        { sharedWith: { some: { sharedWithUserId: userId } } }
                    ]
                } : {})
            },
            include: {
                groups: true,
                ...(userId ? {
                    sharedWith: {
                        include: {
                            sharedWith: {
                                select: { id: true, displayName: true, email: true }
                            }
                        }
                    }
                } : {})
            },
            orderBy: { createdAt: 'desc' }
        });
        return { data: contacts };
    } catch (error) {
        return { error: "Failed to fetch contacts" };
    }
};

export const getContacts = createSafeAction(GetContactsSchema, handler);
