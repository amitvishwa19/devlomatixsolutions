'use server';

import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { z } from "zod";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const BulkFormatSchema = z.object({
    ids: z.array(z.string()).min(1, "Contact IDs are required"),
    workspaceId: z.string()
});

const handler = async (data) => {
    const { ids, workspaceId } = data;
    await ensureWorkspaceAccess(workspaceId);

    try {
        // Fetch contacts
        const contacts = await db.contact.findMany({
            where: { id: { in: ids } },
            select: { id: true, phone: true }
        });

        let formattedCount = 0;

        // Perform updates
        const updates = contacts.map(async (contact) => {
            // Remove ALL non-numeric characters (including +)
            let phone = contact.phone.replace(/\D/g, '');
            
            // If 10 digits, add 91 prefix
            if (phone.length === 10) {
                phone = '91' + phone;
            }

            // Only update if it becomes a valid 12-digit number and is different from original
            if (phone.length === 12 && phone !== contact.phone) {
                await db.contact.update({
                    where: { id: contact.id },
                    data: { phone: phone }
                });
                formattedCount++;
            }
        });

        await Promise.all(updates);

        return {
            data: {
                message: `Successfully formatted ${formattedCount} contacts to strict 12-digit format.`,
                count: formattedCount
            }
        };

    } catch (error) {
        console.error('[BULK_FORMAT_CONTACTS]', error);
        return {
            error: "Failed to format contacts. Please try again."
        };
    }
};

export const bulkFormatContacts = createSafeAction(BulkFormatSchema, handler);
