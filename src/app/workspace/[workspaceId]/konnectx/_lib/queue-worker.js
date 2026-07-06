import { db } from '@/lib/db';
import { symmetricDecrypt } from '@/lib/encryption';
import * as cloudApi from './whatsapp-cloud-api';

/**
 * WhatsAppQueueWorker: Enterprise-grade background job processor.
 */
export class WhatsAppQueueWorker {
    static instance;
    isProcessing = false;
    interval = null;
    pollInterval = 10000; // 10 seconds

    constructor() {
        // No automatic initialization here to avoid build-time issues
    }

    static getInstance() {
        if (!WhatsAppQueueWorker.instance) {
            WhatsAppQueueWorker.instance = new WhatsAppQueueWorker();
        }
        return WhatsAppQueueWorker.instance;
    }

    init() {
        if (this.interval) return;
        console.log('[WA_QUEUE] Initializing Background Worker...');
        this.interval = setInterval(() => this.processJobs(), this.pollInterval);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    async processJobs() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            const job = await db.whatsAppJob.findFirst({
                where: {
                    status: 'PENDING',
                    platform: 'WHATSAPP_CLOUD',
                    scheduledAt: { lte: new Date() }
                },
                orderBy: [
                    { priority: 'desc' },
                    { createdAt: 'asc' }
                ]
            });

            if (!job) {
                this.isProcessing = false;
                return;
            }

            console.log(`[WA_QUEUE] Processing Job ${job.id} (${job.type})`);

            await db.whatsAppJob.update({
                where: { id: job.id },
                data: { status: 'PROCESSING', startedAt: new Date() }
            });

            if (job.type === 'CAMPAIGN') {
                await this.handleCampaignJob(job);
            } else if (job.type === 'SINGLE') {
                await this.handleSingleMessage(job);
            }

        } catch (error) {
            console.error('[WA_QUEUE] Error processing jobs:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    async resolveCredential(workspaceId) {
        const cred = await db.credentials.findFirst({
            where: { workspaceId, platform: 'WHATSAPP_CLOUD', isDefault: true }
        });
        if (!cred?.credentials) return null;
        const stored = cred.credentials;
        let parsed;
        if (typeof stored === 'string' && stored.includes(':')) {
            parsed = JSON.parse(symmetricDecrypt(stored));
        } else if (typeof stored === 'string') {
            parsed = JSON.parse(stored);
        } else {
            parsed = stored;
        }
        if (parsed?.enc) {
            parsed = JSON.parse(symmetricDecrypt(parsed.enc));
        }
        return parsed;
    }

    async buildTemplateComponents(template, messageTemplate, templateId, workspaceId) {
        const components = [];
        let resolved = template;

        if (!resolved?.metadata && templateId) {
            const fresh = await db.messageTemplate.findUnique({ where: { id: templateId } });
            if (fresh) resolved = fresh;
        }

        if (!resolved?.metadata && templateId) {
            const fresh = await db.messageTemplate.findFirst({
                where: { OR: [{ id: templateId }, { templateName: templateId }] }
            });
            if (fresh) resolved = fresh;
        }

        // Third fallback: try fetching by actual template name stored in campaign
        if (!resolved?.metadata && messageTemplate?.name) {
            const fresh = await db.messageTemplate.findFirst({
                where: { templateName: messageTemplate.name, workspaceId }
            });
            if (fresh) resolved = fresh;
        }

        const tType = (resolved?.type || '').toUpperCase();
        const mediaUrl = resolved?.metadata?.mediaUrl || messageTemplate?.image?.url || messageTemplate?.video?.url || '';

        console.log(`[WA_QUEUE] buildTemplateComponents: type=${tType}, hasMetadata=${!!resolved?.metadata}, mediaUrl=${mediaUrl?.slice(0, 50)}, templateId=${templateId}`);

        if (tType === 'IMAGE' || tType === 'VIDEO') {
            if (mediaUrl) {
                const mediaType = tType === 'IMAGE' ? 'image' : 'video';
                components.push({
                    type: 'header',
                    parameters: [{ type: mediaType, [mediaType]: { link: mediaUrl } }]
                });
            }
            return components;
        }

        if (tType === 'CAROUSEL') {
            let meta = resolved?.metadata;
            if (typeof meta === 'string') { try { meta = JSON.parse(meta); } catch { meta = null; } }
            let cards = meta?.cards || [];

            if (cards.length === 0 && mediaUrl) {
                cards = [{ mediaUrl, body: resolved?.body || messageTemplate?.text || '' }];
            }

            if (cards.length > 0) {
                const carouselCards = cards.map((card, idx) => {
                    const cardComponents = [];
                    if (card.mediaUrl) {
                        cardComponents.push({
                            type: 'header',
                            parameters: [{ type: 'image', image: { link: card.mediaUrl } }]
                        });
                    }
                    if (card.body) {
                        cardComponents.push({
                            type: 'body',
                            parameters: [{ type: 'text', text: card.body }]
                        });
                    }
                    return { card_index: idx, components: cardComponents };
                });
                components.push({ type: 'carousel', cards: carouselCards });
                return components;
            }
        }

        return components;
    }

    async handleCampaignJob(job) {
        const { campaignId, userId } = job.payload;

        try {
            const campaign = await db.campaign.findUnique({
                where: { id: campaignId },
                include: {
                    recipients: { where: { status: 'PENDING' } },
                    template: true
                }
            });

            if (!campaign) throw new Error('Campaign not found');

            for (const recipient of campaign.recipients) {
                const currentJob = await db.whatsAppJob.findUnique({ 
                    where: { id: job.id }, 
                    select: { status: true } 
                });
                
                if (currentJob?.status !== 'PROCESSING') {
                    console.log(`[WA_QUEUE] Job ${job.id} state changed to ${currentJob?.status}. Stopping campaign.`);
                    return;
                }

                try {
                    let messageText = campaign.template?.body || campaign.messageTemplate['text'] || '';
                    const variables = recipient.variables || {};
                    Object.keys(variables).forEach(key => {
                        messageText = messageText.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
                    });

                    const payload = { text: messageText };
                    if (campaign.messageTemplate?.image) payload.image = campaign.messageTemplate['image'];
                    if (campaign.messageTemplate?.video) payload.video = campaign.messageTemplate['video'];

                    const phone = recipient.phone.replace(/\D/g, '');
                    
                    // Get Credential (assuming one per workspace for simplicity here, or store in job)
                    const credential = await this.resolveCredential(job.workspaceId || campaign.workspaceId);

                    if (!credential) throw new Error("No active Cloud API credential");

                    let result;
                    if (campaign.templateId) {
                        const components = await this.buildTemplateComponents(campaign.template, campaign.messageTemplate, campaign.templateId, job.workspaceId);

                        // Upload media links to IDs (same as send-message.js)
                        const processParameters = async (parameters) => {
                            for (const param of parameters) {
                                if (['image', 'video', 'document'].includes(param.type) && param[param.type]?.link) {
                                    const mediaUrl = param[param.type].link;
                                    const mediaId = await cloudApi.uploadMetaMedia(credential, mediaUrl);
                                    if (mediaId) {
                                        delete param[param.type].link;
                                        param[param.type].id = mediaId;
                                    }
                                }
                            }
                        };
                        for (const comp of components) {
                            if (comp.type === 'header' && comp.parameters) {
                                await processParameters(comp.parameters);
                            } else if (comp.type === 'carousel' && comp.cards) {
                                for (const card of comp.cards) {
                                    if (card.components) {
                                        for (const cardComp of card.components) {
                                            if (cardComp.type === 'header' && cardComp.parameters) {
                                                await processParameters(cardComp.parameters);
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        result = await cloudApi.sendTemplateMessage(credential, phone, campaign.template.templateName, 'en_US', components);
                    } else {
                        result = await cloudApi.sendTextMessage(credential, phone, messageText);
                    }

                    if (!result.success) throw new Error(result.error);

                    await db.whatsAppDeliveryLog.create({
                        data: {
                            jobId: job.id,
                            userId: userId,
                            jid: phone,
                            waId: result.data?.messages?.[0]?.id,
                            status: 'SENT',
                            sentAt: new Date()
                        }
                    });

                    await db.campaignRecipient.update({
                        where: { id: recipient.id },
                        data: { status: 'SENT', sentAt: new Date() }
                    });

                } catch (err) {
                    console.error(`[WA_QUEUE] Failed to send to ${recipient.phone}:`, err);
                    await db.campaignRecipient.update({
                        where: { id: recipient.id },
                        data: { status: 'FAILED', errorLog: err.message }
                    });
                }

                await new Promise(r => setTimeout(r, 1500));
            }

            await db.whatsAppJob.update({
                where: { id: job.id },
                data: { status: 'COMPLETED', completedAt: new Date() }
            });

            await db.campaign.update({
                where: { id: campaignId },
                data: { status: 'COMPLETED' }
            });

        } catch (error) {
            console.error(`[WA_QUEUE] Campaign Error:`, error);
            await db.whatsAppJob.update({
                where: { id: job.id },
                data: { status: 'FAILED', errorLog: error.message }
            });
        }
    }

    async handleSingleMessage(job) {
        const { phone, payload, userId, workspaceId } = job.payload;
        try {
            const credential = await this.resolveCredential(workspaceId);

            if (!credential) throw new Error("No active Cloud API credential");

            const result = await cloudApi.sendTextMessage(credential, phone.replace(/\D/g, ''), payload.text);
            if (!result.success) throw new Error(result.error);
            
            await db.whatsAppJob.update({
                where: { id: job.id },
                data: { status: 'COMPLETED', completedAt: new Date() }
            });
            
            await db.whatsAppDeliveryLog.create({
                data: {
                    jobId: job.id,
                    userId,
                    jid: phone,
                    waId: result.data?.messages?.[0]?.id,
                    status: 'SENT',
                    sentAt: new Date()
                }
            });
        } catch (error) {
             await db.whatsAppJob.update({
                where: { id: job.id },
                data: { status: 'FAILED', errorLog: error.message }
            });
        }
    }

    async enqueue(userId, type, payload, scheduledAt) {
        return await db.whatsAppJob.create({
            data: {
                userId,
                type,
                payload,
                scheduledAt: scheduledAt || new Date(),
                status: 'PENDING'
            }
        });
    }
}

export const waQueueWorker = WhatsAppQueueWorker.getInstance();
