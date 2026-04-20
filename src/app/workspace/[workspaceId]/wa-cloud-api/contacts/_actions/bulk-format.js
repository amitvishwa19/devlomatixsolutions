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
            let phone = contact.phone.trim();
            
            // 1. Basic cleaning: remove spaces, hyphens, and everything except digits and '+'
            phone = phone.replace(/[^\d+]/g, '');

            // 2. Formatting Logic
            let newPhone = phone;

            if (phone.startsWith('+')) {
                // Already has a country code plus, assume it's valid
                return;
            } else if (phone.length === 10) {
                // Standard 10-digit Indian number
                newPhone = `+91${phone}`;
            } else if (phone.length === 12 && phone.startsWith('91')) {
                // 12-digit starting with 91, just missing the '+'
                newPhone = `+${phone}`;
            } else if (phone.length === 11 && phone.startsWith('0')) {
                // 11-digit starting with 0, replace 0 with +91
                newPhone = `+91${phone.substring(1)}`;
            } else {
                // Unknown format, skip
                return;
            }

            if (newPhone !== contact.phone) {
                await db.contact.update({
                    where: { id: contact.id },
                    data: { phone: newPhone }
                });
                formattedCount++;
            }
        });

        await Promise.all(updates);

        return {
            data: {
                message: `Successfully formatted ${formattedCount} contacts.`,
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
