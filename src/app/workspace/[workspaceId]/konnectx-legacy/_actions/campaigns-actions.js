'use server';

import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { konnectLegacyManager } from "../_lib/baileys-manager";

/**
 * Get all legacy broadcast campaigns from isolated KonnectLegacyCampaign table
 */
export async function getKonnectCampaignsAction(workspaceId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const campaigns = await db.konnectLegacyCampaign.findMany({
            where: { workspaceId },
            include: {
                recipients: {
                    select: {
                        id: true,
                        status: true,
                        phone: true,
                        sentAt: true,
                        error: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Compute summary metrics
        const formatted = campaigns.map(c => {
            const total = c.recipients.length;
            const sent = c.recipients.filter(r => r.status === 'SENT').length;
            const failed = c.recipients.filter(r => r.status === 'FAILED').length;
            const pending = c.recipients.filter(r => r.status === 'PENDING').length;
            const progress = total > 0 ? Math.round((sent / total) * 100) : 0;

            return {
                id: c.id,
                name: c.name,
                description: c.description,
                status: c.status,
                messageTemplate: c.messageText,
                createdAt: c.createdAt,
                stats: { total, sent, failed, pending, progress }
            };
        });

        return { success: true, campaigns: formatted };
    } catch (error) {
        console.error("[GET_KONNECT_CAMPAIGNS_ERROR]", error);
        return { success: false, error: error.message || "Failed to load campaigns", campaigns: [] };
    }
}

/**
 * Create a new Konnect Legacy broadcast campaign in isolated table
 */
export async function createKonnectCampaignAction(workspaceId, campaignData) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const { name, description, messageText, recipientPhones } = campaignData;

        if (!name || !messageText) {
            return { success: false, error: "Campaign name and message content are required" };
        }

        if (!recipientPhones || recipientPhones.length === 0) {
            return { success: false, error: "At least one recipient phone number is required" };
        }

        // Deduplicate and clean phone numbers
        const cleanPhones = Array.from(new Set(
            recipientPhones
                .map(p => String(p).replace(/[^0-9]/g, ''))
                .filter(p => p.length >= 6)
        ));

        if (cleanPhones.length === 0) {
            return { success: false, error: "No valid phone numbers found" };
        }

        const campaign = await db.konnectLegacyCampaign.create({
            data: {
                workspaceId,
                userId,
                name,
                description: description || `Konnect Legacy Broadcast to ${cleanPhones.length} contacts`,
                status: 'DRAFT',
                messageText,
                recipients: {
                    create: cleanPhones.map(phone => ({
                        phone,
                        status: 'PENDING'
                    }))
                }
            },
            include: {
                recipients: true
            }
        });

        return { success: true, campaign };
    } catch (error) {
        console.error("[CREATE_KONNECT_CAMPAIGN_ERROR]", error);
        return { success: false, error: error.message || "Failed to create campaign" };
    }
}

/**
 * Execute / Dispatch campaign messages via Baileys socket
 */
export async function triggerKonnectCampaignAction(workspaceId, campaignId, delayMs = 3500) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const campaign = await db.konnectLegacyCampaign.findUnique({
            where: { id: campaignId },
            include: {
                recipients: {
                    where: { status: 'PENDING' }
                }
            }
        });

        if (!campaign) {
            return { success: false, error: "Campaign not found" };
        }

        let status = { status: 'DISCONNECTED' };
        try {
            if (typeof konnectLegacyManager?.getStatus === 'function') {
                status = await konnectLegacyManager.getStatus(workspaceId);
            } else if (typeof konnectLegacyManager?.getSessionState === 'function') {
                status = konnectLegacyManager.getSessionState(workspaceId);
            }
        } catch (_) {}

        if (status?.status !== 'CONNECTED') {
            return {
                success: false,
                error: "Your WhatsApp phone is not connected. Please scan the QR code first."
            };
        }

        // Mark campaign in progress
        await db.konnectLegacyCampaign.update({
            where: { id: campaignId },
            data: { status: 'IN_PROGRESS' }
        });

        // Background dispatch loop
        (async () => {
            for (const recipient of campaign.recipients) {
                try {
                    // Random anti-ban jitter: delayMs +/- 1000ms
                    const jitter = Math.floor(Math.random() * 2000) - 1000;
                    const finalDelay = Math.max(2000, delayMs + jitter);
                    await new Promise(r => setTimeout(r, finalDelay));

                    const res = await konnectLegacyManager.sendMessage(
                        workspaceId,
                        recipient.phone,
                        campaign.messageText
                    );

                    if (res) {
                        await db.konnectLegacyCampaignRecipient.update({
                            where: { id: recipient.id },
                            data: {
                                status: 'SENT',
                                sentAt: new Date()
                            }
                        });
                    } else {
                        await db.konnectLegacyCampaignRecipient.update({
                            where: { id: recipient.id },
                            data: {
                                status: 'FAILED',
                                error: "Send failed"
                            }
                        });
                    }
                } catch (err) {
                    await db.konnectLegacyCampaignRecipient.update({
                        where: { id: recipient.id },
                        data: {
                            status: 'FAILED',
                            error: err.message
                        }
                    });
                }
            }

            // Update final campaign status
            const remaining = await db.konnectLegacyCampaignRecipient.count({
                where: { campaignId, status: 'PENDING' }
            });

            await db.konnectLegacyCampaign.update({
                where: { id: campaignId },
                data: { status: remaining === 0 ? 'COMPLETED' : 'PAUSED' }
            });
        })();

        return { success: true, message: "Campaign broadcast dispatched in background" };
    } catch (error) {
        console.error("[TRIGGER_KONNECT_CAMPAIGN_ERROR]", error);
        return { success: false, error: error.message || "Failed to trigger campaign" };
    }
}

/**
 * Delete a campaign
 */
export async function deleteKonnectCampaignAction(workspaceId, campaignId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        // Delete cascade handles recipients
        await db.konnectLegacyCampaign.delete({
            where: { id: campaignId }
        });

        return { success: true };
    } catch (error) {
        console.error("[DELETE_KONNECT_CAMPAIGN_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete campaign" };
    }
}
