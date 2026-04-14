import { db } from './db';


/**
 * SocialEngine handles the asynchronous publishing of social media posts.
 * It supports multiple platforms and can be extended with adapters.
 */
export class SocialEngine {
    private static instance: SocialEngine;
    private runningPosts: Set<string> = new Set();
    private interval: NodeJS.Timeout | null = null;

    private constructor() {
        // No automatic start here to avoid build-time issues
    }

    public static getInstance(): SocialEngine {
        if (!SocialEngine.instance) {
            SocialEngine.instance = new SocialEngine();
        }
        return SocialEngine.instance;
    }

    private startScheduler() {
        if (this.interval) return;

        console.log("[SocialEngine] Starting scheduler (every 1 minute)...");
        this.interval = setInterval(() => {
            this.checkAndPublishScheduledPosts();
        }, 60000); // Check every minute
    }

    public stopScheduler() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    /**
     * Finds posts that are SCHEDULED and whose scheduledAt time has passed.
     */
    private async checkAndPublishScheduledPosts() {
        try {
            const now = new Date();
            const postsToPublish = await db.socialPost.findMany({
                where: {
                    status: 'SCHEDULED',
                    scheduledAt: { lte: now }
                },
                include: { accounts: true }
            });

            if (postsToPublish.length > 0) {
                console.log(`[SocialEngine] Found ${postsToPublish.length} posts to publish.`);
                for (const post of postsToPublish) {
                    this.publishPost(post.id);
                }
            }
        } catch (error) {
            console.error("[SocialEngine] Scheduler Error:", error);
        }
    }

    /**
     * Publishes a single post to all its target platforms.
     */
    async publishPost(postId: string) {
        if (this.runningPosts.has(postId)) return;
        this.runningPosts.add(postId);

        console.log(`[SocialEngine] Publishing post ${postId}...`);

        try {
            const post = await db.socialPost.findUnique({
                where: { id: postId },
                include: { accounts: true }
            });

            if (!post) throw new Error("Post not found");

            await db.socialPost.update({
                where: { id: postId },
                data: { status: 'PUBLISHED', publishedAt: new Date() } // Optimistic update, will revert if all fail
            });

            const results = [];

            // Process each platform/account
            for (const platform of post.platforms) {
                try {
                    if (platform === 'WHATSAPP') {
                        // WhatsApp uses the existing waManager
                        await this.publishToWhatsApp(post);
                        results.push({ platform, status: 'SUCCESS' });
                    } else {
                        // Placeholder for other platforms (Facebook, LinkedIn, etc.)
                        console.log(`[SocialEngine] Platform ${platform} is not yet fully implemented. Skipping.`);
                        results.push({ platform, status: 'SKIPPED', message: 'Adapter coming soon' });
                    }
                } catch (err: any) {
                    console.error(`[SocialEngine] Failed to publish to ${platform}:`, err.message);
                    results.push({ platform, status: 'FAILED', error: err.message });
                }
            }

            // If all platforms failed, mark as FAILED
            const allFailed = results.every(r => r.status === 'FAILED');
            if (allFailed) {
                await db.socialPost.update({
                    where: { id: postId },
                    data: {
                        status: 'FAILED',
                        errorLog: JSON.stringify(results)
                    }
                });
            }

        } catch (error: any) {
            console.error(`[SocialEngine] Fatal error publishing post ${postId}:`, error.message);
            await db.socialPost.update({
                where: { id: postId },
                data: { status: 'FAILED', errorLog: error.message }
            });
        } finally {
            this.runningPosts.delete(postId);
        }
    }

    private async publishToWhatsApp(post: any) {
        // For WhatsApp, we assume the user has a connected session
        // We might need to select a specific WhatsApp account if multiple exist
        const whatsappAccount = post.accounts.find((acc: any) => acc.platform === 'WHATSAPP');

        // If no specific account linked, try to use the first active session found in WAAuth
        // (Simplified for now)

        const payload = { text: post.content };
        if (post.mediaUrls && post.mediaUrls.length > 0) {
            // Support first image for now
            const url = post.mediaUrls[0];
            if (url.match(/\.(jpeg|jpg|gif|png)$/) != null) {
                (payload as any).image = { url };
            }
        }

        // Implementation would need to target specific JIDs (contacts/groups)
        // For 'Social Post', maybe we post to a "status" or specific primary group?
        // Let's assume there's a convention or setting for this.
        console.log("[SocialEngine] WhatsApp publishing logic would go here targeting specific JIDs.");
    }
}

export const socialEngine = SocialEngine.getInstance();
