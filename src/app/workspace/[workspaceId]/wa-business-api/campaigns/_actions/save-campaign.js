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
    tags: z.array(z.string()).optional(),
    status: z.string().optional(),
});

const handler = async (data) => {
    const { workspaceId, id, name, description, messageTemplate, templateId, recipients, groupIds, categoryIds, tags, status } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        console.log(`[SAVE_CAMPAIGN] Processing campaign save for Workspace: ${workspaceId}, User: ${userId}`);

        const campaignData = {
            name,
            description,
            status: status || 'DRAFT',
            messageTemplate: messageTemplate || {},
            templateId: templateId || null,
            userId: userId,
            platform: "WHATSAPP_BUSINESS" // Explicitly mark as Business API campaign
        };

        let allRecipients = recipients && Array.isArray(recipients) ? [...recipients] : [];

        // Fetch group contacts if groupIds provided
        if (groupIds && groupIds.length > 0) {
            const groupContacts = await db.contact.findMany({
                where: {
                    workspaceId,
                    groups: { some: { id: { in: groupIds } } }
                },
                select: { phone: true, name: true }
            });

            console.log(`[SAVE_CAMPAIGN] Found ${groupContacts.length} contacts for groups ${groupIds.join(',')}`);
            const existingPhones = new Set(allRecipients.map(r => typeof r === 'string' ? r : r.phone));
            groupContacts.forEach(gc => {
                if (!existingPhones.has(gc.phone)) {
                    allRecipients.push({ phone: gc.phone, name: gc.name });
                    existingPhones.add(gc.phone);
                }
            });
        }

        // Fetch category contacts if categoryIds provided
        if (categoryIds && categoryIds.length > 0) {
            const categoryContacts = await db.contact.findMany({
                where: {
                    workspaceId,
                    category: { in: categoryIds }
                },
                select: { phone: true, name: true }
            });

            console.log(`[SAVE_CAMPAIGN] Found ${categoryContacts.length} contacts for categories ${categoryIds.join(',')}`);
            const existingPhones = new Set(allRecipients.map(r => typeof r === 'string' ? r : r.phone));
            categoryContacts.forEach(cc => {
                if (!existingPhones.has(cc.phone)) {
                    allRecipients.push({ phone: cc.phone, name: cc.name });
                    existingPhones.add(cc.phone);
                }
            });
        }

        // Fetch tagged contacts if tags provided
        if (tags && tags.length > 0) {
            const taggedContacts = await db.contact.findMany({
                where: {
                    workspaceId,
                    tags: { hasSome: tags }
                },
                select: { phone: true, name: true }
            });

            console.log(`[SAVE_CAMPAIGN] Found ${taggedContacts.length} contacts for tags ${tags.join(',')}`);
            const existingPhones = new Set(allRecipients.map(r => typeof r === 'string' ? r : r.phone));
            taggedContacts.forEach(tc => {
                if (!existingPhones.has(tc.phone)) {
                    allRecipients.push({ phone: tc.phone, name: tc.name });
                    existingPhones.add(tc.phone);
                }
            });
        }

        console.log(`[SAVE_CAMPAIGN] Total unique recipients to enqueue: ${allRecipients.length}`);

        if (id) {
            // Update existing
            const existing = await db.campaign.findFirst({
                where: { id, userId, platform: "WHATSAPP_BUSINESS" }
            });

            if (!existing) return { error: "Campaign not found" };
            
            // Allow editing only in DRAFT mode
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
                where: { id },
                data: updateData
            });
            return { data: { success: true, campaign: updated } };
        } else {
            // Create new
            if (allRecipients.length > 0) {
                console.log(`[SAVE_CAMPAIGN] Enqueuing ${allRecipients.length} recipients for new campaign`);
                campaignData.recipients = {
                    create: allRecipients.map(r => ({
                        phone: typeof r === 'string' ? r : r.phone,
                        variables: typeof r === 'string' ? {} : (r.variables || {})
                    }))
                };
            } else {
                console.warn(`[SAVE_CAMPAIGN] WARNING: Creating campaign with 0 recipients!`);
            }

            const campaign = await db.campaign.create({
                data: campaignData
            });
            return { data: { success: true, campaign } };
        }
    } catch (error) {
        console.error("[SAVE_BUSINESS_CAMPAIGN_ERROR]", error);
        return { error: error.message || "Failed to save campaign" };
    }
};

export const saveCampaign = createSafeAction(SaveCampaignSchema, handler);
