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
            const postsToPublish = await db.post.findMany({
                where: {
                    status: 'SCHEDULED',
                    scheduledAt: { lte: now }
                }
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
            const post = await db.post.findUnique({
                where: { id: postId },
            });

            if (!post) throw new Error("Post not found");

            await db.post.update({
                where: { id: postId },
                data: { status: 'PUBLISHED', publishedAt: new Date() } // Optimistic update, will revert if all fail
            });

            // Fetch linked credentials for this user
            const credentials = await db.credentials.findMany({
                where: { userId: post.userId, status: 'connected' }
            });

            const results = [];

            // Process each platform/account
            for (const platform of post.platforms) {
                try {
                    const credential = credentials.find(c => c.platform?.toUpperCase() === platform.toUpperCase());
                    
                    if (platform === 'WHATSAPP') {
                        // WhatsApp uses the existing waManager
                        await this.publishToWhatsApp(post, credential);
                        results.push({ platform, status: 'SUCCESS' });
                    } else if (credential) {
                        // Placeholder for other platforms (Facebook, LinkedIn, etc.)
                        console.log(`[SocialEngine] Publishing to ${platform} via credential ${credential.id}...`);
                        // Actual publish logic would go here using the credential
                        results.push({ platform, status: 'SKIPPED', message: 'Adapter coming soon' });
                    } else {
                        console.log(`[SocialEngine] No connected credential found for ${platform}. Skipping.`);
                        results.push({ platform, status: 'FAILED', error: 'No connected account found' });
                    }
                } catch (err: any) {
                    console.error(`[SocialEngine] Failed to publish to ${platform}:`, err.message);
                    results.push({ platform, status: 'FAILED', error: err.message });
                }
            }

            // If all platforms failed, mark as FAILED
            const allFailed = results.every(r => r.status === 'FAILED');
            if (allFailed) {
                await db.post.update({
                    where: { id: postId },
                    data: {
                        status: 'FAILED',
                        errorLog: JSON.stringify(results)
                    }
                });
            }

        } catch (error: any) {
            console.error(`[SocialEngine] Fatal error publishing post ${postId}:`, error.message);
            await db.post.update({
                where: { id: postId },
                data: { status: 'FAILED', errorLog: error.message }
            });
        } finally {
            this.runningPosts.delete(postId);
        }
    }

    private async publishToWhatsApp(post: any, credential?: any) {
        // For WhatsApp, we assume the user has a connected session
        // If a credential was found, we can use it to target a specific session
        const whatsappAccount = credential;

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
