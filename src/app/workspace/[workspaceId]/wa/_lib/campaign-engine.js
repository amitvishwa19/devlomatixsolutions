import { db } from '@/lib/db';
import { waQueueWorker } from './queue-worker';
import { waManager } from './whatsapp-v2';

export class CampaignEngine {
    static instance;
    activeCampaigns = new Set();

    constructor() {}

    static getInstance() {
        if (!CampaignEngine.instance) {
            CampaignEngine.instance = new CampaignEngine();
        }
        return CampaignEngine.instance;
    }

    async startCampaign(campaignId, userId) {
        try {
            await db.campaign.update({
                where: { id: campaignId },
                data: { status: 'QUEUED' }
            });

            // Ensure worker is running
            waQueueWorker.init();
            await waQueueWorker.enqueue(userId, 'CAMPAIGN', { campaignId, userId });
            
            console.log(`[Campaign] Enqueued Campaign ${campaignId} for User ${userId}`);

        } catch (error) {
            console.error(`[Campaign] Fatal error in campaign ${campaignId}:`, error);
            await db.campaign.update({
                where: { id: campaignId },
                data: { status: 'ERROR' }
            });
        }
    }

    async processCampaign(campaignId) {
        if (this.activeCampaigns.has(campaignId)) {
            console.log(`[Campaign] Campaign ${campaignId} is already running.`);
            return;
        }

        this.activeCampaigns.add(campaignId);
        console.log(`[Campaign] Processing Campaign ${campaignId}`);

        try {
            await db.campaign.update({
                where: { id: campaignId },
                data: { status: 'RUNNING' }
            });

            const campaign = await db.campaign.findUnique({
                where: { id: campaignId },
                include: {
                    recipients: { where: { status: 'PENDING' } },
                    template: true
                }
            });

            if (!campaign) throw new Error('Campaign not found');

            for (const recipient of campaign.recipients) {
                const currentCampaign = await db.campaign.findUnique({ where: { id: campaignId }, select: { status: true } });
                if (currentCampaign?.status !== 'RUNNING') {
                    console.log(`[Campaign] Campaign ${campaignId} was ${currentCampaign?.status}. Stopping engine.`);
                    break;
                }

                try {
                    let messageText = campaign.template?.body || campaign.messageTemplate['text'] || '';
                    const variables = recipient.variables || {};
                    
                    Object.keys(variables).forEach(key => {
                        const placeholder = `{{${key}}}`;
                        messageText = messageText.replace(new RegExp(placeholder, 'g'), variables[key]);
                    });

                    const payload = { text: messageText };
                    if (campaign.messageTemplate?.image) payload.image = campaign.messageTemplate['image'];
                    if (campaign.messageTemplate?.video) payload.video = campaign.messageTemplate['video'];
                    if (campaign.messageTemplate?.interactive) {
                        payload.interactive = JSON.parse(JSON.stringify(campaign.messageTemplate['interactive']));
                        if (payload.interactive.body) {
                            Object.keys(variables).forEach(key => {
                                const placeholder = `{{${key}}}`;
                                payload.interactive.body.text = payload.interactive.body.text.replace(new RegExp(placeholder, 'g'), variables[key]);
                            });
                        }
                    }

                    const jid = recipient.phone.includes('@') ? recipient.phone : `${recipient.phone.replace(/\D/g, '')}@s.whatsapp.net`;
                    await waManager.sendMessage(jid, payload);

                    await db.campaignRecipient.update({
                        where: { id: recipient.id },
                        data: { status: 'SENT', sentAt: new Date() }
                    });

                } catch (err) {
                    console.error(`[Campaign] Error sending to ${recipient.phone}:`, err);
                    await db.campaignRecipient.update({
                        where: { id: recipient.id },
                        data: { status: 'FAILED', errorLog: err.message }
                    });
                }

                const delay = Math.floor(Math.random() * 2000) + 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }

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

    async stopCampaign(campaignId) {
        await db.campaign.update({
            where: { id: campaignId },
            data: { status: 'PAUSED' }
        });
    }
}

export const campaignEngine = CampaignEngine.getInstance();
