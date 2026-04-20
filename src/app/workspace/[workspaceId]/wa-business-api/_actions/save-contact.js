'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { logActivity } from "./log-activity";

const SaveContactSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    phone: z.string(),
    email: z.string().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    tags: z.array(z.string()).optional(),
    color: z.string().optional().nullable(),
    info: z.string().optional().nullable(),
    userId: z.string().optional(),
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { id, name, phone, email, categoryId, category, tags, color, info, userId, workspaceId } = data;

    try {
        if (id) {
            // Update
            const contact = await db.contact.update({
                where: { id },
                data: {
                    name,
                    phone: phone.replace(/[^\d+]/g, ''),
                    email,
                    categoryId,
                    category,
                    tags: tags || [],
                    color,
                    info,
                }
            });

            await logActivity({
                workspaceId,
                userId,
                message: `Updated contact: ${name}`,
                type: "CONTACT_UPDATE",
                level: "info",
                details: { contactId: contact.id }
            });

            return { data: contact };
        } else {
            // Create
            const contact = await db.contact.create({
                data: {
                    name,
                    phone: phone.replace(/[^\d+]/g, ''),
                    email,
                    categoryId,
                    category,
                    tags: tags || [],
                    color,
                    info,
                    userId,
                    workspaceId,
                }
            });

            await logActivity({
                workspaceId,
                userId,
                message: `Created new contact: ${name}`,
                type: "CONTACT_CREATE",
                level: "info",
                details: { contactId: contact.id }
            });

            return { data: contact };
        }
    } catch (error) {
        console.error('[WA_BUSINESS_SAVE_CONTACT]', error);
        return { error: "Failed to save contact" };
    }
};

export const saveContact = createSafeAction(SaveContactSchema, handler);
