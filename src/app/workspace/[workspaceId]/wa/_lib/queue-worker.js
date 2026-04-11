import { db } from '@/lib/db';
import { waManager } from './whatsapp-v2';

/**
 * WhatsAppQueueWorker: Enterprise-grade background job processor.
 */
export class WhatsAppQueueWorker {
    static instance;
    isProcessing = false;
    interval = null;
    pollInterval = 10000; // 10 seconds

    constructor() {
        if (typeof window === 'undefined') {
            this.init();
        }
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

                    const jid = recipient.phone.includes('@') ? recipient.phone : `${recipient.phone.replace(/\D/g, '')}@s.whatsapp.net`;
                    const result = await waManager.sendMessage(jid, payload);

                    await db.whatsAppDeliveryLog.create({
                        data: {
                            jobId: job.id,
                            userId: userId,
                            jid: jid,
                            waId: result?.key?.id,
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
        const { jid, payload, userId } = job.payload;
        try {
            const result = await waManager.sendMessage(jid, payload);
            await db.whatsAppJob.update({
                where: { id: job.id },
                data: { status: 'COMPLETED', completedAt: new Date() }
            });
            
            await db.whatsAppDeliveryLog.create({
                data: {
                    jobId: job.id,
                    userId,
                    jid,
                    waId: result?.key?.id,
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
