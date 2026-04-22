import { db } from '@/lib/db';
import { waManager } from '../../wa-api_delete/_lib/whatsapp-v2';

/**
 * BusinessQueueWorker: Standalone worker for Session-based Business campaigns.
 */
export class BusinessQueueWorker {
    static instance;
    isProcessing = false;
    interval = null;
    pollInterval = 10000; // 10 seconds

    constructor() { }

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
        const { campaignId } = job.payload;

        try {
            // Dynamic import to avoid circular dependency
            const { campaignEngine } = await import('./campaign-engine');
            await campaignEngine.processCampaign(campaignId);

            await db.whatsAppJob.update({
                where: { id: job.id },
                data: { status: 'COMPLETED', completedAt: new Date() }
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
