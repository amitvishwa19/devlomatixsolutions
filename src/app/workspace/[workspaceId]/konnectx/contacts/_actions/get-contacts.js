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
        console.log('[GET_CONTACTS] querying with userId:', userId);

        const contacts = await db.contact.findMany({
            where: { userId },
            include: { 
                groups: true
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log('[GET_CONTACTS] found', contacts.length, 'contacts for user');
        if (contacts.length > 0) {
            console.log('[GET_CONTACTS] first contact:', JSON.stringify(contacts[0]));
        }

        const total = await db.contact.count();
        console.log('[GET_CONTACTS] total contacts in DB:', total);

        return { data: contacts };
    } catch (error) {
        console.error('[GET_CONTACTS]', error);
        return { error: "Failed to fetch contacts" };
    }
};

export const getContacts = createSafeAction(GetContactsSchema, handler);
