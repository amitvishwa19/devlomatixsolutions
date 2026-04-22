import { db } from '../../../../../../src/lib/db.js';
import { waManager } from '../../wa-api_delete/_lib/whatsapp-v2.js';

export class CampaignEngine {
    static instance;
    activeCampaigns = new Set();

    constructor() { }

    static getInstance() {
        if (!CampaignEngine.instance) {
            CampaignEngine.instance = new CampaignEngine();
        }
        return CampaignEngine.instance;
    }

    async startCampaign(campaignId, userId) {
        try {
            console.log(`[CampaignEngine] Triggering direct processing for Campaign: ${campaignId}`);

            // Fire and forget background process
            this.processCampaign(campaignId, userId).catch(err => {
                console.error(`[CampaignEngine] Background process fatal error for ${campaignId}:`, err);
            });

            return { success: true };

        } catch (error) {
            console.error(`[CampaignEngine] Fatal error starting campaign ${campaignId}:`, error);
            await db.campaign.update({
                where: { id: campaignId },
                data: { status: 'ERROR' }
            });
            throw error;
        }
    }

    async processCampaign(campaignId, userId) {
        if (this.activeCampaigns.has(campaignId)) {
            console.log(`[CampaignEngine] Campaign ${campaignId} is already running. Skipping.`);
            return;
        }

        this.activeCampaigns.add(campaignId);
        console.log(`[CAMPAIGN_DISPATCH] >>> STARTING CAMPAIGN: ${campaignId}`);

        try {
            // Set status to RUNNING immediately
            await db.campaign.update({
                where: { id: campaignId },
                data: { status: 'RUNNING' }
            });

            const campaign = await db.campaign.findUnique({
                where: { id: campaignId },
                include: {
                    recipients: { where: { status: { in: ['PENDING', 'FAILED'] } } },
                    template: true
                }
            });

            if (!campaign) {
                console.error(`[CAMPAIGN_DISPATCH] ERROR: Campaign ${campaignId} not found in database.`);
                return;
            }

            const totalPending = campaign.recipients?.length || 0;
            console.log(`[CAMPAIGN_DISPATCH] Total PENDING recipients found in DB: ${totalPending}`);

            if (totalPending === 0) {
                console.log(`[CAMPAIGN_DISPATCH] FINISHED: No PENDING recipients found. Stopping.`);
                await db.campaign.update({
                    where: { id: campaignId },
                    data: { status: 'COMPLETED' }
                });
                return;
            }

            // Connection Check & Auto-Connect
            let waState = waManager.getState();

            if (waState !== 'open') {
                console.log(`[CAMPAIGN_DISPATCH] Session is ${waState}. Attempting auto-connect for user ${userId}...`);
                await waManager.connect(userId);

                // Wait up to 10 seconds for connection
                for (let i = 0; i < 10; i++) {
                    waState = waManager.getState();
                    if (waState === 'open') break;
                    await new Promise(r => setTimeout(r, 1000));
                }
            }

            if (waState !== 'open') {
                console.error(`[CAMPAIGN_DISPATCH] ABORTED: WhatsApp session remains in state: ${waState}`);
                await db.campaign.update({
                    where: { id: campaignId },
                    data: { status: 'ERROR', description: (campaign.description || '') + ` [System: WA connection failed - ${waState}]` }
                });
                return;
            }

            if (!campaign.recipients || campaign.recipients.length === 0) {
                console.log(`[CAMPAIGN_DISPATCH] FINISHED: No PENDING recipients found for campaign.`);
                await db.campaign.update({
                    where: { id: campaignId },
                    data: { status: 'COMPLETED' }
                });
                return;
            }

            console.log(`[CAMPAIGN_DISPATCH] FOUND ${campaign.recipients.length} recipients to process.`);

            const baseTemplate = campaign.template || campaign.messageTemplate || {};

            for (const recipient of campaign.recipients) {
                // Check if campaign was stopped/paused externally
                const currentCampaign = await db.campaign.findUnique({
                    where: { id: campaignId },
                    select: { status: true }
                });

                if (currentCampaign?.status !== 'RUNNING') {
                    console.log(`[CAMPAIGN_DISPATCH] STOPPED: Campaign status is ${currentCampaign?.status}.`);
                    break;
                }

                try {
                    const variables = recipient.variables || {};
                    const interpolate = (text) => {
                        if (!text || typeof text !== 'string') return text;
                        let res = text;
                        Object.keys(variables).forEach(key => {
                            const placeholder = `{{${key}}}`;
                            // Using split/join for safety against special regex characters in keys
                            res = res.split(placeholder).join(variables[key] || '');
                        });
                        return res;
                    };

                    let phone = recipient.phone.replace(/\D/g, '');
                    // Remove leading zero if present
                    if (phone.startsWith('0')) {
                        phone = phone.substring(1);
                    }

                    // Smart Formatting: If exactly 10 digits, assume India (91)
                    if (phone.length === 10) {
                        phone = '91' + phone;
                        console.log(`[CAMPAIGN_DISPATCH] Formatting 10-digit number to: ${phone}`);
                    }

                    const jid = `${phone}@s.whatsapp.net`;
                    console.log(`[CAMPAIGN_DISPATCH] [${recipient.phone}] -> State: ${waState} | JID: ${jid}`);

                    let messagePayload = {};

                    // Payload Construction Logic
                    if (baseTemplate.type === 'CAROUSEL' || baseTemplate.carouselMessage) {
                        messagePayload = {
                            interactive: true,
                            type: 'carousel',
                            interactiveMessage: {
                                header: { title: 'Carousel' },
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
                    } else if (campaign.messageType === 'button') {
                        // SMART FALLBACK: Convert buttons to emoji-numbered list because native buttons are restricted
                        const bodyExt = interpolate(baseTemplate.body || baseTemplate.text || '');
                        const footerExt = interpolate(baseTemplate.footer || '');
                        const buttonList = (baseTemplate.buttons || []).map((btn, i) => {
                            const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
                            const label = typeof btn === 'string' ? btn : (btn.text || btn.label || '');
                            return `${emojis[i] || (i + 1)} *${label}*`;
                        }).join('\n');

                        messagePayload = { 
                            text: `${bodyExt}\n\n*Reply with:*\n${buttonList}${footerExt ? `\n\n_${footerExt}_` : ''}` 
                        };
                    } else {
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

                    console.log(`[CAMPAIGN_DISPATCH] TO: ${jid} | PAYLOAD: ${JSON.stringify(messagePayload).slice(0, 50)}...`);

                    // Update campaign messageTemplate with active phone so UI can track progress
                    // Using messageTemplate instead of metadata to avoid Prisma client sync issues
                    await db.campaign.update({
                        where: { id: campaignId },
                        data: { 
                            messageTemplate: {
                                ...(baseTemplate || {}),
                                activePhone: recipient.phone,
                                lastUpdate: new Date().toISOString()
                            }
                        }
                    });

                    await waManager.sendMessage(jid, messagePayload);

                    console.log(`[CAMPAIGN_DISPATCH] SUCCESS: ${recipient.phone}`);

                    await db.campaignRecipient.update({
                        where: { id: recipient.id },
                        data: { status: 'SENT', sentAt: new Date() }
                    });

                } catch (err) {
                    console.error(`[CAMPAIGN_DISPATCH] FAILED: ${recipient.phone} | Error: ${err.message}`);
                    await db.campaignRecipient.update({
                        where: { id: recipient.id },
                        data: { status: 'FAILED', errorLog: err.message }
                    });
                }

                // Random delay between 1-3 seconds to avoid spam filters
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

            console.log(`[CAMPAIGN_DISPATCH] <<< CAMPAIGN FINISHED: ${campaignId} | Remaining: ${remaining}`);

        } catch (error) {
            console.error(`[CAMPAIGN_DISPATCH] FATAL: ${campaignId} | ${error.message}`);
            await db.campaign.update({
                where: { id: campaignId },
                data: { status: 'ERROR' }
            });
        } finally {
            this.activeCampaigns.delete(campaignId);
        }
    }

    async stopCampaign(campaignId) {
        console.log(`[CampaignEngine] Stopping Campaign: ${campaignId}`);
        await db.campaign.update({
            where: { id: campaignId },
            data: { status: 'PAUSED' }
        });
    }
}

export const campaignEngine = CampaignEngine.getInstance();
