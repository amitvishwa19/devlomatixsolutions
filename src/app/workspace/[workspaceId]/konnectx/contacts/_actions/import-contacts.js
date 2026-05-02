'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const formatPhoneNumber = (phone) => {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If 10 digits, add 91 prefix
    if (cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }
    
    return cleaned;
};

const ImportContactsSchema = z.object({
    contactsData: z.array(z.any()),
    workspaceId: z.string(),
    userId: z.string(),
});

const handler = async (data) => {
    const { contactsData, workspaceId, userId } = data;

    try {
        let successCount = 0;
        let errorCount = 0;

        for (const record of contactsData) {
            try {
                const name = record.name || 'Unnamed Contact';
                const rawPhone = (record.phone || record.number || '');
                const cleanPhone = formatPhoneNumber(rawPhone);

                // Validation: Only import if it's a valid 12-digit number
                if (cleanPhone.length !== 12) {
                    errorCount++;
                    continue;
                }

                const email = record.email || null;
                const category = record.category || record.group || null;
                const tagsRaw = record.tags || '';
                const tags = Array.isArray(tagsRaw) ? tagsRaw : (tagsRaw ? String(tagsRaw).split('|').map(t => t.trim()).filter(Boolean) : []);

                await db.contact.upsert({
                    where: {
                        workspaceId_phone: { workspaceId, phone: cleanPhone }
                    },
                    update: {
                        name,
                        email,
                        category,
                        tags: { set: tags }
                    },
                    create: {
                        name,
                        phone: cleanPhone,
                        email,
                        userId,
                        workspaceId,
                        category,
                        tags
                    }
                });

                successCount++;
            } catch (rowError) {
                console.error('Action Row Import Error:', rowError);
                errorCount++;
            }
        }

        return {
            data: {
                message: 'Import complete',
                stats: { total: contactsData.length, success: successCount, errors: errorCount }
            }
        };

    } catch (error) {
        console.error('Action Error (importContacts):', error);
        return { error: error.message || 'Internal Server Error' };
    }
};

export const importContacts = createSafeAction(ImportContactsSchema, handler);
