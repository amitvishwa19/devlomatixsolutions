import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// Helper: decrypt credentials
function decryptCredentials(storedCredentials) {
    if (!storedCredentials?.enc) return storedCredentials;
    const key = process.env.ENCRYPTION_KEY;
    if (!key) return storedCredentials;
    try {
        const crypto = require('crypto');
        const parts = storedCredentials.enc.split(':');
        const ivBuffer = Buffer.from(parts[0], 'hex');
        const encText = Buffer.from(parts.slice(1).join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), ivBuffer);
        let decrypted = decipher.update(encText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return JSON.parse(decrypted.toString());
    } catch (e) {
        return storedCredentials;
    }
}

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId;

        // Fetch all published posts with external IDs
        const posts = await db.post.findMany({
            where: { workspaceId, userId, status: 'PUBLISHED' },
            orderBy: { publishedAt: 'desc' },
            take: 50
        });

        // Fetch credentials to get tokens
        const credentials = await db.credentials.findMany({
            where: { userId, status: 'connected' }
        });

        const tokensByPlatform = {};
        credentials.forEach(c => {
            const dec = decryptCredentials(c.credentials);
            tokensByPlatform[c.platform.toUpperCase()] = dec.accessToken || dec.access_token || dec.token;
        });

        let totalLikes = 0;
        let totalComments = 0;
        let totalShares = 0;

        // Fetch stats for each post (LinkedIn example)
        for (const post of posts) {
            const extIds = post.externalIds || {};
            
            // LinkedIn Analytics
            if (extIds.LINKEDIN && tokensByPlatform.LINKEDIN) {
                try {
                    const res = await fetch(`https://api.linkedin.com/v2/socialActions/${encodeURIComponent(extIds.LINKEDIN)}/counts`, {
                        headers: { 
                            'Authorization': `Bearer ${tokensByPlatform.LINKEDIN}`,
                            'X-Restli-Protocol-Version': '2.0.0'
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        totalLikes += data.likesSummary?.totalLikes || 0;
                        totalComments += data.commentsSummary?.totalComments || 0;
                        // totalShares is harder in ugcPosts counts
                    }
                } catch (e) {
                    console.error("[LINKEDIN_ANALYTICS_ERROR]", e.message);
                }
            }

            // Add other platforms (Facebook, Twitter) logic here as needed
        }

        return NextResponse.json({
            summary: {
                totalLikes,
                totalComments,
                totalShares,
                engagement: totalLikes + totalComments + totalShares,
                postCount: posts.length
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("[SOCIAL_ANALYTICS_ERROR]", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
