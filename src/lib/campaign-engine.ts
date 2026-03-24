import { waManager } from './whatsapp';
import { db } from './db';

export class CampaignEngine {
    private static instance: CampaignEngine;
    private activeCampaigns: Set<string> = new Set();

    private constructor() {}

    public static getInstance(): CampaignEngine {
        if (!CampaignEngine.instance) {
            CampaignEngine.instance = new CampaignEngine();
        }
        return CampaignEngine.instance;
    }

    async startCampaign(campaignId: string, userId: string) {
        if (this.activeCampaigns.has(campaignId)) {
            console.log(`[Campaign] Campaign ${campaignId} is already running.`);
            return;
        }

        this.activeCampaigns.add(campaignId);
        console.log(`[Campaign] Starting Campaign ${campaignId} for User ${userId}`);

        try {
            // 1. Update Campaign Status
            await db.campaign.update({
                where: { id: campaignId },
                data: { status: 'RUNNING' }
            });

            // 2. Fetch Campaign with Recipients and Template
            const campaign = await db.campaign.findUnique({
                where: { id: campaignId },
                include: {
                    recipients: { where: { status: 'PENDING' } },
                    template: true
                }
            });

            if (!campaign) throw new Error('Campaign not found');

            // 3. Process Recipients
            for (const recipient of campaign.recipients) {
                // Check if campaign was stopped/paused externally
                const currentCampaign = await db.campaign.findUnique({ where: { id: campaignId }, select: { status: true } });
                if (currentCampaign?.status !== 'RUNNING') {
                    console.log(`[Campaign] Campaign ${campaignId} was ${currentCampaign?.status}. Stopping engine.`);
                    break;
                }

                try {
                    // Prepare payload and inject variables
                    let messageText = campaign.messageTemplate['text'] || '';
                    const variables = recipient.variables as any || {};
                    
                    // Replace {{v1}}, {{v2}}, etc.
                    Object.keys(variables).forEach(key => {
                        const placeholder = `{{${key}}}`;
                        messageText = messageText.replace(new RegExp(placeholder, 'g'), variables[key]);
                    });

                    const payload: any = { text: messageText };
                    if (campaign.messageTemplate['image']) payload.image = campaign.messageTemplate['image'];
                    if (campaign.messageTemplate['video']) payload.video = campaign.messageTemplate['video'];
                    if (campaign.messageTemplate['interactive']) {
                        payload.interactive = JSON.parse(JSON.stringify(campaign.messageTemplate['interactive']));
                        // Also inject variables into interactive body if present
                        if (payload.interactive.body) {
                            Object.keys(variables).forEach(key => {
                                const placeholder = `{{${key}}}`;
                                payload.interactive.body.text = payload.interactive.body.text.replace(new RegExp(placeholder, 'g'), variables[key]);
                            });
                        }
                    }

                    // Send Message
                    const jid = recipient.phone.includes('@') ? recipient.phone : `${recipient.phone.replace(/\D/g, '')}@s.whatsapp.net`;
                    await waManager.sendMessage(jid, payload);

                    // Update Recipient Status
                    await db.campaignRecipient.update({
                        where: { id: recipient.id },
                        data: { status: 'SENT', sentAt: new Date() }
                    });

                } catch (err: any) {
                    console.error(`[Campaign] Error sending to ${recipient.phone}:`, err);
                    await db.campaignRecipient.update({
                        where: { id: recipient.id },
                        data: { status: 'FAILED', errorLog: err.message }
                    });
                }

                // Random delay between 1-3 seconds to avoid detection
                const delay = Math.floor(Math.random() * 2000) + 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            // 4. Finalize Campaign
            const remaining = await db.campaignRecipient.count({ where: { campaignId, status: 'PENDING' } });
            await db.campaign.update({
                where: { id: campaignId },
                data: { status: remaining === 0 ? 'COMPLETED' : 'PAUSED' }
            });

        } catch (error) {
            console.error(`[Campaign] Fatal error in campaign ${campaignId}:`, error);
            await db.campaign.update({
                where: { id: campaignId },
                data: { status: 'ERROR' }
            });
        } finally {
            this.activeCampaigns.delete(campaignId);
        }
    }

    async stopCampaign(campaignId: string) {
        await db.campaign.update({
            where: { id: campaignId },
            data: { status: 'PAUSED' }
        });
        // The process loop in startCampaign will check this status and break
    }
}

export const campaignEngine = CampaignEngine.getInstance();
