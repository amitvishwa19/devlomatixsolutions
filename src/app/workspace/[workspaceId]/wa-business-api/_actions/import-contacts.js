'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { logActivity } from "./log-activity";

const ImportContactsSchema = z.object({
    contacts: z.array(z.object({
        name: z.string(),
        phone: z.string(),
        email: z.string().optional(),
        category: z.string().optional(),
        tags: z.string().optional(),
    })).min(1),
    userId: z.string().optional(),
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { contacts, userId, workspaceId } = data;

    try {
        let importedCount = 0;
        let skippedCount = 0;

        for (const item of contacts) {
            const formattedPhone = item.phone.replace(/[^\d+]/g, '');
            
            if (!formattedPhone) {
                skippedCount++;
                continue;
            }

            // Simple check for duplicate in this workspace
            const existing = await db.contact.findFirst({
                where: {
                    phone: formattedPhone,
                    workspaceId
                }
            });

            if (existing) {
                skippedCount++;
                continue;
            }

            await db.contact.create({
                data: {
                    name: item.name || formattedPhone,
                    phone: formattedPhone,
                    email: item.email || null,
                    category: item.category || null,
                    tags: item.tags ? item.tags.split(',').map(t => t.trim()) : [],
                    userId,
                    workspaceId
                }
            });
            importedCount++;
        }

        if (importedCount > 0) {
            await logActivity({
                workspaceId,
                userId,
                message: `Imported ${importedCount} contacts into audience library`,
                type: "CONTACT_IMPORT",
                level: "info",
                details: { importedCount, skippedCount }
            });
        }

        return { data: { success: true, imported: importedCount, skipped: skippedCount } };
    } catch (error) {
        console.error('[WA_BUSINESS_IMPORT_CONTACTS]', error);
        return { error: "Failed to import contacts" };
    }
};

export const importContacts = createSafeAction(ImportContactsSchema, handler);
