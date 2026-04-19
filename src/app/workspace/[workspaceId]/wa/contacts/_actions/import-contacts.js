'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

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

        // Fetch existing categories
        const existingCategories = await db.category.findMany({
            where: { workspaceId, type: 'CONTACT' }
        });

        for (const record of contactsData) {
            try {
                const name = record.name || 'Unnamed Contact';
                const phone = (record.phone || record.number || '').replace(/[^\d+]/g, '');

                if (!phone) {
                    errorCount++;
                    continue;
                }

                const email = record.email || null;
                const categoryName = record.category || record.group || null;
                const tagsRaw = record.tags || '';
                const tags = Array.isArray(tagsRaw) ? tagsRaw : (tagsRaw ? tagsRaw.split('|').map(t => t.trim()).filter(Boolean) : []);

                let categoryId = null;
                if (categoryName) {
                    let cat = existingCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
                    if (!cat) {
                        const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
                        cat = await db.category.create({
                            data: { name: categoryName, slug, workspaceId, type: 'CONTACT' }
                        });
                        existingCategories.push(cat);
                    }
                    categoryId = cat.id;
                }

                await db.contact.upsert({
                    where: {
                        workspaceId_phone: { workspaceId, phone }
                    },
                    update: {
                        name,
                        email,
                        categoryId,
                        tags: { set: tags }
                    },
                    create: {
                        name,
                        phone,
                        email,
                        userId,
                        workspaceId,
                        categoryId,
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
