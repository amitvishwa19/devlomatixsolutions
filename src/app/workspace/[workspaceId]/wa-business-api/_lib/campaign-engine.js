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

            console.log(`[CampaignEngine] Processing campaign: ${campaignId}`);

            if (!campaign) {
                console.error(`[CampaignEngine] Campaign ${campaignId} not found`);
                return;
            }

            // Check session state
            if (waManager.getState() !== 'open') {
                console.error(`[CampaignEngine] WhatsApp session is NOT connected. State: ${waManager.getState()}`);
                await db.campaign.update({
                    where: { id: campaignId },
                    data: { status: 'ERROR', description: (campaign.description || '') + ' [System: WA session disconnected]' }
                });

                await db.systemLog.create({
                    data: {
                        workspaceId: campaign.workspaceId || null,
                        userId: campaign.userId,
                        message: `Campaign "${campaign.name}" failed: WhatsApp session is disconnected`,
                        type: 'CAMPAIGN_ERROR',
                        level: 'error',
                        provider: 'wa-business-api',
                        details: { campaignId, state: waManager.getState() }
                    }
                });
                return;
            }

            if (!campaign.recipients || campaign.recipients.length === 0) {
                console.log(`[CampaignEngine] No PENDING recipients found for campaign: ${campaignId}`);
                await db.campaign.update({
                    where: { id: campaignId },
                    data: { status: 'COMPLETED' }
                });
                return;
            }

            console.log(`[CampaignEngine] Found ${campaign.recipients.length} recipients to process`);

            // Combined template data (DB template + campaign overrides)
            const baseTemplate = campaign.template || campaign.messageTemplate || {};

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
                    const variables = recipient.variables || {};
                    const interpolate = (text) => {
                        if (!text || typeof text !== 'string') return text;
                        let res = text;
                        Object.keys(variables).forEach(key => {
                            const placeholder = `{{${key}}}`;
                            res = res.split(placeholder).join(variables[key]);
                        });
                        return res;
                    };

                    const phone = recipient.phone.replace(/\D/g, '');
                    const jid = `${phone}@s.whatsapp.net`;
                    
                    let messagePayload = {};

                    // Handle Interactive Messages (Buttons/Carousels)
                    if (baseTemplate.type === 'CAROUSEL' || baseTemplate.carouselMessage) {
                        messagePayload = {
                            carousel: true,
                            interactiveMessage: {
                                body: { text: interpolate(baseTemplate.body || baseTemplate.text || 'Check this out!') },
                                footer: { text: interpolate(baseTemplate.footer || 'Devlomatix Solutions') },
                                carouselMessage: {
                                    cards: (baseTemplate.buttons || baseTemplate.carouselMessage?.cards || []).map(card => ({
                                        header: {
                                            imageMessage: card.header?.imageMessage || { url: card.imageUrl || card.mediaUrl },
                                            hasMediaAttachment: true
                                        },
                                        body: { text: interpolate(card.title || card.body || '') },
                                        footer: { text: interpolate(card.description || card.footer || '') },
                                        nativeFlowMessage: {
                                            buttons: [{
                                                name: "quick_reply",
                                                buttonParamsJson: JSON.stringify({
                                                    display_text: interpolate(card.buttonText || "View Details"),
                                                    id: `card_${card.id || Math.random()}`
                                                })
                                            }]
                                        }
                                    }))
                                }
                            }
                        };
                    } else if (baseTemplate.buttons?.length > 0 || baseTemplate.type === 'BUTTON') {
                        messagePayload = {
                            interactive: true,
                            interactiveMessage: {
                                body: { text: interpolate(baseTemplate.body || baseTemplate.text || '') },
                                footer: { text: interpolate(baseTemplate.footer || '') },
                                nativeFlowMessage: {
                                    buttons: baseTemplate.buttons.map((btn, idx) => ({
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: interpolate(typeof btn === 'string' ? btn : (btn.text || btn.label)),
                                            id: `btn_${idx}`
                                        })
                                    }))
                                }
                            }
                        };
                    } else {
                        // Standard Text/Media Message
                        const body = interpolate(baseTemplate.body || baseTemplate.text || '');
                        if (baseTemplate.imageUrl || baseTemplate.mediaUrl) {
                            messagePayload = {
                                image: { url: baseTemplate.imageUrl || baseTemplate.mediaUrl },
                                caption: body
                            };
                        } else {
                            messagePayload = { text: body };
                        }
                    }

                    console.log(`[BusinessCampaign] Dispatching to ${jid}`);
                    await waManager.sendMessage(jid, messagePayload);
                    console.log(`[CampaignEngine] Message sent to ${recipient.phone}`);

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
