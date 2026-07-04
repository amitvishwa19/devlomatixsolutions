'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const formatPhoneNumber = (phone) => {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If 10 digits, add 91 prefix
    if (cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }
    
    return cleaned;
};

const SaveContactSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    phone: z.string().refine((val) => {
        const formatted = formatPhoneNumber(val);
        return formatted.length === 12;
    }, {
        message: "Phone must be a valid 10-digit mobile number (which will be prefixed with 91) or a full 12-digit number."
    }),
    email: z.string().email().optional().or(z.literal('')),
    userId: z.string(),
    workspaceId: z.string(),
    category: z.string().optional().or(z.literal('')),
    tags: z.array(z.string()).optional(),
    info: z.any().optional(),
    type: z.string().optional(),
    groupIds: z.array(z.string()).optional(),
});

const handler = async (data) => {
    const { workspaceId } = data;
    console.log('[SAVE_CONTACT] Starting...', { name: data.name, phone: data.phone });
    
    try {
        await ensureWorkspaceAccess(workspaceId);
    } catch (e) {
        console.error('[SAVE_CONTACT] Auth Error:', e.message);
        return { error: "Unauthorized access to workspace" };
    }
    
    const { id, name, phone, email, userId, category, tags, info, type, groupIds } = data;

    try {
        // Strict Phone Formatting
        const cleanPhone = formatPhoneNumber(phone);
        console.log('[SAVE_CONTACT] Cleaned Phone:', cleanPhone);

        // Final safety check
        if (cleanPhone.length !== 12) {
            return { error: "Phone number must be 12 digits (Country Code + Mobile)" };
        }

        if (id) {
            console.log('[SAVE_CONTACT] Updating existing contact:', id);
            // Update
            const updated = await db.contact.update({
                where: { id },
                data: {
                    name,
                    phone: cleanPhone,
                    email: email || null,
                    userId,
                    workspaceId,
                    category: category || null,
                    tags: tags || [],
                    info: info || undefined,
                    type: type || 'CONTACT',
                    groups: {
                        set: groupIds?.map(id => ({ id })) || []
                    }
                },
                include: { groups: true }
            });
            console.log('[SAVE_CONTACT] Update successful');
            return { data: updated };
        } else {
            console.log('[SAVE_CONTACT] Upserting contact...');
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
                    category: category || null,
                    tags: tags || [],
                    info: info || undefined,
                    type: type || 'CONTACT',
                    groups: {
                        set: groupIds?.map(id => ({ id })) || []
                    }
                },
                create: {
                    name,
                    phone: cleanPhone,
                    email: email || null,
                    userId,
                    workspaceId,
                    category: category || null,
                    tags: tags || [],
                    type: type || 'CONTACT',
                    groups: {
                        connect: groupIds?.map(id => ({ id })) || []
                    }
                },
                include: { groups: true }
            });

            await db.contactShare.upsert({
                where: {
                    contactId_sharedWithUserId: {
                        contactId: contact.id,
                        sharedWithUserId: userId
                    }
                },
                update: {},
                create: {
                    contactId: contact.id,
                    sharedWithUserId: userId
                }
            });

            console.log('[SAVE_CONTACT] Upsert successful');
            return { data: contact };
        }
    } catch (error) {
        console.error('[SAVE_CONTACT] Database Error:', error);
        return { error: error.message || 'Internal Server Error' };
    }
};

export const saveContact = createSafeAction(SaveContactSchema, handler);
