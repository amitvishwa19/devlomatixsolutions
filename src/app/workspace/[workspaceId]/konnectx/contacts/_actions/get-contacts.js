'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const GetContactsSchema = z.object({
    userId: z.string(),
});

const handler = async (data) => {
    const { userId } = data;
    try {
        console.log('[GET_CONTACTS] userId:', userId);
        const shareCount = await db.contactShare.count({ where: { sharedWithUserId: userId } });
        const allShareCount = await db.contactShare.count();
        const contactCount = await db.contact.count();
        console.log('[GET_CONTACTS] shareCount for user:', shareCount, 'total shares:', allShareCount, 'total contacts:', contactCount);
        const allShares = await db.contactShare.findMany({ take: 3, include: { contact: { select: { name: true } } } });
        console.log('[GET_CONTACTS] sample shares:', JSON.stringify(allShares));
        const contacts = await db.contact.findMany({
            where: {
                sharedWith: { some: { sharedWithUserId: userId } }
            },
            include: {
                groups: true,
                sharedWith: {
                    include: {
                        sharedWith: {
                            select: { id: true, displayName: true, email: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        const total = await db.contact.count();
        return { data: contacts };
    } catch (error) {
        return { error: "Failed to fetch contacts" };
    }
};

export const getContacts = createSafeAction(GetContactsSchema, handler);
