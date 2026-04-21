import { db } from '@/lib/db';
import { businessQueueWorker } from './queue-worker';
import { waManager } from '../../wa-api/_lib/whatsapp-v2';

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
            businessQueueWorker.init();
            // Use a separate task type for Business Campaigns if needed, or handle it in the worker
            await businessQueueWorker.enqueue(userId, 'BUSINESS_CAMPAIGN', { campaignId, userId }, null, 'WHATSAPP_BUSINESS');
            
            console.log(`[BusinessCampaign] Enqueued Campaign ${campaignId} for User ${userId}`);

        } catch (error) {
            console.error(`[BusinessCampaign] Fatal error in campaign ${campaignId}:`, error);
            await db.campaign.update({
                where: { id: campaignId },
                data: { status: 'ERROR' }
            });
        }
    }

    async processCampaign(campaignId) {
        if (this.activeCampaigns.has(campaignId)) {
            console.log(`[BusinessCampaign] Campaign ${campaignId} is already running.`);
            return;
        }

        this.activeCampaigns.add(campaignId);
        console.log(`[BusinessCampaign] Processing Campaign ${campaignId}`);

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
                const currentCampaign = await db.campaign.findUnique({ 
                    where: { id: campaignId }, 
                    select: { status: true } 
                });
                
                if (currentCampaign?.status !== 'RUNNING') {
                    console.log(`[BusinessCampaign] Campaign ${campaignId} was ${currentCampaign?.status}. Stopping engine.`);
                    break;
                }

                try {
                    let messageBody = campaign.template?.body || campaign.messageTemplate['text'] || '';
                    const variables = recipient.variables || {};
                    
                    // Simple variable interpolation
                    Object.keys(variables).forEach(key => {
                        const placeholder = `{{${key}}}`;
                        messageBody = messageBody.replace(new RegExp(placeholder, 'g'), variables[key]);
                    });

                    const phone = recipient.phone.replace(/\D/g, '');
                    const jid = `${phone}@s.whatsapp.net`;
                    
                    console.log(`[BusinessCampaign] Sending to ${jid}`);

                    // Use the browser-based manager as per the wa-business-api pattern
                    await waManager.sendMessage(jid, messageBody);

                    await db.campaignRecipient.update({
                        where: { id: recipient.id },
                        data: { status: 'SENT', sentAt: new Date() }
                    });

                } catch (err) {
                    console.error(`[BusinessCampaign] Error sending to ${recipient.phone}:`, err);
                    await db.campaignRecipient.update({
                        where: { id: recipient.id },
                        data: { status: 'FAILED', errorLog: err.message }
                    });
                }

                // Random delay between 1-3 seconds
                const delay = Math.floor(Math.random() * 2000) + 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            const remaining = await db.campaignRecipient.count({ 
                where: { campaignId, status: 'PENDING' } 
            });
            
            await db.campaign.update({
                where: { id: campaignId },
                data: { status: remaining === 0 ? 'COMPLETED' : 'PAUSED' }
            });

        } catch (error) {
            console.error(`[BusinessCampaign] Fatal error in campaign ${campaignId}:`, error);
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
