'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const SaveCampaignSchema = z.object({
    workspaceId: z.string(),
    id: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
    messageTemplate: z.any(),
    templateId: z.string().optional().nullable(),
    recipients: z.array(z.any()).optional(),
    groupIds: z.array(z.string()).optional(),
    categoryIds: z.array(z.string()).optional(),
    tagIds: z.array(z.string()).optional(),
    contactCategoryNames: z.array(z.string()).optional(),
    contactTagNames: z.array(z.string()).optional(),
    status: z.string().optional(),
});

const handler = async (data) => {
    const { workspaceId, id, name, description, messageTemplate, templateId, recipients, groupIds, categoryIds, tagIds, contactCategoryNames, contactTagNames, status } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const defaultCredential = await db.credentials.findFirst({
            where: { userId, platform: 'WHATSAPP_CLOUD', isDefault: true }
        });

        const campaignData = {
            name,
            description,
            status: status || 'DRAFT',
            messageTemplate: messageTemplate || {},
            templateId: templateId || null,
            userId: userId,
            credentialId: defaultCredential?.id || null,
        };

        let allRecipients = recipients && Array.isArray(recipients) ? [...recipients] : [];

        const existingPhones = new Set(allRecipients.map(r => typeof r === 'string' ? r : r.phone));

        // Fetch group contacts if groupIds provided
        if (groupIds && groupIds.length > 0) {
            const groupContacts = await db.contact.findMany({
                where: {
                    userId,
                    groups: { some: { id: { in: groupIds } } }
                },
                select: { phone: true, name: true }
            });

            groupContacts.forEach(gc => {
                if (!existingPhones.has(gc.phone)) {
                    allRecipients.push({ phone: gc.phone, name: gc.name });
                    existingPhones.add(gc.phone);
                }
            });
        }

        // Fetch contacts by category
        if (categoryIds && categoryIds.length > 0) {
            const categories = await db.category.findMany({
                where: { id: { in: categoryIds } },
                select: { name: true }
            });
            const categoryNames = categories.map(c => c.name);

            if (categoryNames.length > 0) {
                const catContacts = await db.contact.findMany({
                    where: {
                        userId,
                        category: { in: categoryNames }
                    },
                    select: { phone: true, name: true }
                });

                catContacts.forEach(gc => {
                    if (!existingPhones.has(gc.phone)) {
                        allRecipients.push({ phone: gc.phone, name: gc.name });
                        existingPhones.add(gc.phone);
                    }
                });
            }
        }

        // Fetch contacts by contact category names (from Contact.category field)
        if (contactCategoryNames && contactCategoryNames.length > 0) {
            const catNameContacts = await db.contact.findMany({
                where: {
                    userId,
                    category: { in: contactCategoryNames }
                },
                select: { phone: true, name: true }
            });

            catNameContacts.forEach(gc => {
                if (!existingPhones.has(gc.phone)) {
                    allRecipients.push({ phone: gc.phone, name: gc.name });
                    existingPhones.add(gc.phone);
                }
            });
        }

        // Fetch contacts by contact tag names (from Contact.tags field)
        if (contactTagNames && contactTagNames.length > 0) {
            const tagNameContacts = await db.contact.findMany({
                where: {
                    userId,
                    tags: { hasSome: contactTagNames }
                },
                select: { phone: true, name: true }
            });

            tagNameContacts.forEach(gc => {
                if (!existingPhones.has(gc.phone)) {
                    allRecipients.push({ phone: gc.phone, name: gc.name });
                    existingPhones.add(gc.phone);
                }
            });
        }

        // Fetch contacts by tag
        if (tagIds && tagIds.length > 0) {
            const tagDefs = await db.category.findMany({
                where: { id: { in: tagIds } },
                select: { name: true }
            });
            const tagNames = tagDefs.map(t => t.name);

            if (tagNames.length > 0) {
                const tagContacts = await db.contact.findMany({
                    where: {
                        userId,
                        tags: { hasSome: tagNames }
                    },
                    select: { phone: true, name: true }
                });

                tagContacts.forEach(gc => {
                    if (!existingPhones.has(gc.phone)) {
                        allRecipients.push({ phone: gc.phone, name: gc.name });
                        existingPhones.add(gc.phone);
                    }
                });
            }
        }

        if (id) {
            // Update existing
            const existing = await db.campaign.findUnique({
                where: { id, userId }
            });

            if (!existing) return { error: "Campaign not found" };
            if (existing.status !== 'DRAFT' && (name || messageTemplate || templateId)) {
                return { error: "Only DRAFT campaigns can be edited" };
            }

            const updateData = {
                ...campaignData,
                status: status || existing.status
            };

            if (allRecipients.length > 0) {
                await db.campaignRecipient.deleteMany({ where: { campaignId: id } });
                updateData.recipients = {
                    create: allRecipients.map(r => ({
                        phone: typeof r === 'string' ? r : r.phone,
                        variables: typeof r === 'string' ? {} : (r.variables || {})
                    }))
                };
            }

            const updated = await db.campaign.update({
                where: { id, userId },
                data: updateData
            });
            return { success: true, campaign: updated };
        } else {
            // Create new
            if (allRecipients.length > 0) {
                campaignData.recipients = {
                    create: allRecipients.map(r => ({
                        phone: typeof r === 'string' ? r : r.phone,
                        variables: typeof r === 'string' ? {} : (r.variables || {})
                    }))
                };
            }

            const campaign = await db.campaign.create({
                data: campaignData
            });
            return { success: true, campaign };
        }
    } catch (error) {
        return { error: error.message || "Failed to save campaign" };
    }
};

export const saveCampaign = createSafeAction(SaveCampaignSchema, handler);
