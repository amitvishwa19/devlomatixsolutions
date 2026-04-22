'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { logActivity } from "./log-activity";
import { waManager } from "../../wa-api_delete/_lib/whatsapp-v2";

const SaveContactSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    phone: z.string(),
    email: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    tags: z.array(z.string()).optional(),
    color: z.string().optional().nullable(),
    info: z.string().optional().nullable(),
    userId: z.string().optional(),
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { id, name, phone, email, category, tags, color, info, userId, workspaceId } = data;
    const cleanPhone = phone.replace(/[^\d+]/g, '');

    try {
        // Auto-verify on save
        let isVerified = false;
        let whatsappName = null;
        try {
            const check = await waManager.checkNumber(cleanPhone);
            if (check.exists) {
                isVerified = true;
                whatsappName = check.name;
            }
        } catch (e) {
            console.error('[WA_BUSINESS_AUTO_VERIFY_ERROR]', e);
        }

        if (id) {
            // Update
            const contact = await db.contact.update({
                where: { id },
                data: {
                    name,
                    phone: cleanPhone,
                    email,
                    category,
                    tags: tags || [],
                    color,
                    info,
                    verified: isVerified,
                    whatsappName: whatsappName
                }
            });

            await logActivity({
                workspaceId,
                userId,
                message: `Updated contact: ${name} (Verified: ${isVerified})`,
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
                    phone: cleanPhone,
                    email,
                    category,
                    tags: tags || [],
                    color,
                    info,
                    userId,
                    workspaceId,
                    verified: isVerified,
                    whatsappName: whatsappName
                }
            });

            await logActivity({
                workspaceId,
                userId,
                message: `Created new contact: ${name} (Verified: ${isVerified})`,
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
