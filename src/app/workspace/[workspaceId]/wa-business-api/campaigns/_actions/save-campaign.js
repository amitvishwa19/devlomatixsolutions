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
            messageTemplate: {
                ...(messageTemplate || {}),
                metadata: {
                    groupIds: groupIds || [],
                    categoryIds: categoryIds || [],
                    tags: tags || [],
                    recipientsRaw: data.recipientsRaw || recipients?.map(r => `${r.phone}${r.name ? ',' + r.name : ''}`).join('\n') || ''
                }
            },
            templateId: templateId || null,
            userId: userId,
            platform: "WHATSAPP_BUSINESS" // Explicitly mark as Business API campaign
        };

        const normalizePhone = (p) => {
            if (!p) return '';
            let clean = String(p).replace(/\D/g, '');
            // Remove leading zero if present (e.g. 091... -> 91...)
            if (clean.startsWith('0')) {
                clean = clean.substring(1);
            }
            return clean;
        };

        let allRecipients = recipients && Array.isArray(recipients) ? [...recipients] : [];

        console.log(`[SAVE_CAMPAIGN] Debug Workspace ID: ${workspaceId} | Initial Recipients: ${allRecipients.length}`);

        // Fetch group contacts if groupIds provided
        if (groupIds && groupIds.length > 0) {
            const groupContacts = await db.contact.findMany({
                where: {
                    workspaceId,
                    groups: { some: { id: { in: groupIds } } }
                },
                select: { phone: true, name: true }
            });

            console.log(`[SAVE_CAMPAIGN] Found ${groupContacts.length} contacts for groups`);
            const existingPhones = new Set(allRecipients.map(r => normalizePhone(r.phone)));
            groupContacts.forEach(gc => {
                const cleanPhone = normalizePhone(gc.phone);
                if (!existingPhones.has(cleanPhone)) {
                    allRecipients.push({ phone: cleanPhone, name: gc.name });
                    existingPhones.add(cleanPhone);
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

            console.log(`[SAVE_CAMPAIGN] Found ${categoryContacts.length} contacts for categories`);
            const existingPhones = new Set(allRecipients.map(r => normalizePhone(r.phone)));
            categoryContacts.forEach(cc => {
                const cleanPhone = normalizePhone(cc.phone);
                if (!existingPhones.has(cleanPhone)) {
                    allRecipients.push({ phone: cleanPhone, name: cc.name });
                    existingPhones.add(cleanPhone);
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

            console.log(`[SAVE_CAMPAIGN] Found ${taggedContacts.length} contacts for tags`);
            const existingPhones = new Set(allRecipients.map(r => normalizePhone(r.phone)));
            taggedContacts.forEach(tc => {
                const cleanPhone = normalizePhone(tc.phone);
                if (!existingPhones.has(cleanPhone)) {
                    allRecipients.push({ phone: cleanPhone, name: tc.name });
                    existingPhones.add(cleanPhone);
                }
            });
        }

        // --- Fallback Audience Logic ---
        const filtersApplied = (groupIds?.length > 0) || (categoryIds?.length > 0) || (tags?.length > 0) || (recipients?.length > 0);
        
        if (!filtersApplied && allRecipients.length === 0) {
            console.log(`[SAVE_CAMPAIGN] No filters applied. Falling back to all contacts for workspace: ${workspaceId}`);
            const workspaceContacts = await db.contact.findMany({
                where: { workspaceId },
                select: { phone: true, name: true }
            });
            
            workspaceContacts.forEach(wc => {
                const cleanPhone = normalizePhone(wc.phone);
                allRecipients.push({ phone: cleanPhone, name: wc.name });
            });
        }

        // Final list cleanup & normalization
        allRecipients = allRecipients.map(r => ({
            ...r,
            phone: normalizePhone(r.phone)
        })).filter(r => r.phone.length >= 10);

        console.log(`[SAVE_CAMPAIGN] Total unique recipients to enqueue: ${allRecipients.length}`);

        if (id) {
            // Update existing
            const existing = await db.campaign.findFirst({
                where: { id, userId, platform: "WHATSAPP_BUSINESS" }
            });

            if (!existing) return { error: "Campaign not found" };

            const updateData = {
                ...campaignData,
                status: status || existing.status
            };

            if (allRecipients.length > 0) {
                await db.campaignRecipient.deleteMany({ where: { campaignId: id } });
                updateData.recipients = {
                    create: allRecipients.map(r => ({
                        phone: r.phone,
                        variables: r.variables || {}
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
                        phone: r.phone,
                        variables: r.variables || {}
                    }))
                };
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
