import { db } from '@/lib/db';
import { waManager } from '../../wa-api/_lib/whatsapp-v2';

/**
 * BusinessQueueWorker: Standalone worker for Session-based Business campaigns.
 */
export class BusinessQueueWorker {
    static instance;
    isProcessing = false;
    interval = null;
    pollInterval = 10000; // 10 seconds

    constructor() {}

    static getInstance() {
        if (!BusinessQueueWorker.instance) {
            BusinessQueueWorker.instance = new BusinessQueueWorker();
        }
        return BusinessQueueWorker.instance;
    }

    init() {
        if (this.interval) return;
        console.log('[BUSINESS_QUEUE] Initializing Background Worker...');
        this.interval = setInterval(() => this.processJobs(), this.pollInterval);
    }

    async processJobs() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            const job = await db.whatsAppJob.findFirst({
                where: {
                    status: 'PENDING',
                    platform: 'WHATSAPP_BUSINESS',
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

            console.log(`[BUSINESS_QUEUE] Processing Job ${job.id} (${job.type})`);

            await db.whatsAppJob.update({
                where: { id: job.id },
                data: { status: 'PROCESSING', startedAt: new Date() }
            });

            if (job.type === 'BUSINESS_CAMPAIGN' || job.type === 'CAMPAIGN') {
                await this.handleCampaignJob(job);
            }

        } catch (error) {
            console.error('[BUSINESS_QUEUE] Error processing jobs:', error);
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
                    recipients: { where: { status: 'PENDING' } }
                }
            });

            if (!campaign) throw new Error('Campaign not found');

            for (const recipient of campaign.recipients) {
                const currentJob = await db.whatsAppJob.findUnique({ 
                    where: { id: job.id }, 
                    select: { status: true } 
                });
                
                if (currentJob?.status !== 'PROCESSING') {
                    console.log(`[BUSINESS_QUEUE] Job ${job.id} state changed to ${currentJob?.status}. Stopping campaign.`);
                    return;
                }

                try {
                    let messageText = campaign.messageTemplate['text'] || '';
                    const variables = recipient.variables || {};
                    Object.keys(variables).forEach(key => {
                        messageText = messageText.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
                    });

                    const phone = recipient.phone.replace(/\D/g, '');
                    const jid = `${phone}@s.whatsapp.net`;
                    
                    // Use the browser-based manager
                    await waManager.sendMessage(jid, messageText);

                    await db.campaignRecipient.update({
                        where: { id: recipient.id },
                        data: { status: 'SENT', sentAt: new Date() }
                    });

                } catch (err) {
                    console.error(`[BUSINESS_QUEUE] Failed to send to ${recipient.phone}:`, err);
                    await db.campaignRecipient.update({
                        where: { id: recipient.id },
                        data: { status: 'FAILED', errorLog: err.message }
                    });
                }

                await new Promise(r => setTimeout(r, 2000));
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
            console.error(`[BUSINESS_QUEUE] Campaign Error:`, error);
            await db.whatsAppJob.update({
                where: { id: job.id },
                data: { status: 'FAILED', errorLog: error.message }
            });
        }
    }

    async enqueue(userId, type, payload, scheduledAt, platform = 'WHATSAPP_BUSINESS') {
        return await db.whatsAppJob.create({
            data: {
                userId,
                type,
                payload,
                platform,
                scheduledAt: scheduledAt || new Date(),
                status: 'PENDING'
            }
        });
    }
}

export const businessQueueWorker = BusinessQueueWorker.getInstance();
