'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const SaveContactSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Phone is required"),
    email: z.string().email().optional().or(z.literal('')),
    userId: z.string(),
    workspaceId: z.string(),
    categoryId: z.string().optional().or(z.literal('')),
    tags: z.array(z.string()).optional(),
    info: z.any().optional(),
    type: z.string().optional(),
});

const handler = async (data) => {
    const { workspaceId } = data;
    await ensureWorkspaceAccess(workspaceId);
    
    const { id, name, phone, email, userId, categoryId, tags, info, type } = data;

    try {
        // Clean phone number
        const cleanPhone = phone.replace(/[^\d+]/g, '');

        if (id) {
            // Update
            const updated = await db.contact.update({
                where: { id },
                data: {
                    name,
                    phone: cleanPhone,
                    email: email || null,
                    userId,
                    workspaceId,
                    category: categoryId || null,
                    tags: tags || [],
                    info: info || undefined,
                    type: type || 'CONTACT'
                },
                include: { groups: true }
            });
            return { data: updated };
        } else {
            // Create or Upsert based on workspace/phone unique constraint
            const contact = await db.contact.upsert({
                where: {
                    workspaceId_phone: { 
                        workspaceId, 
                        phone: cleanPhone 
                    }
                },
                update: {
                    name,
                    email: email || null,
                    category: categoryId || null,
                    tags: tags || [],
                    info: info || undefined,
                    type: type || 'CONTACT'
                },
                create: {
                    name,
                    phone: cleanPhone,
                    email: email || null,
                    userId,
                    workspaceId,
                    category: categoryId || null,
                    tags: tags || [],
                    type: type || 'CONTACT'
                },
                include: { groups: true }
            });
            return { data: contact };
        }
    } catch (error) {
        console.error('Action Error (saveContact):', error);
        return { error: error.message || 'Internal Server Error' };
    }
};

export const saveContact = createSafeAction(SaveContactSchema, handler);
