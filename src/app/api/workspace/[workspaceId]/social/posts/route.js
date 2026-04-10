import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { symmetricDecrypt } from "@/lib/encryption";
import { logger } from "@/lib/logger";

// GET all social posts for a workspace
export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId;

        // Fetch posts using Raw SQL to bypass possible stale Prisma client issues
        let posts = await db.$queryRawUnsafe(
            `
            SELECT p.*, 
            c.id as cat_id, c.name as cat_name, c.color as cat_color
            FROM "Post" p
            LEFT JOIN "Category" c ON p."categoryId" = c.id
            WHERE p."workspaceId" = $1 AND p."userId" = $2
            ORDER BY p."createdAt" DESC
            `,
            workspaceId,
            userId
        );

        // Fetch all credentials for the user to resolve account info
        const credentials = await db.credentials.findMany({
            where: { userId }
        });

        const formattedPosts = posts.map(post => {
            const platformsArray = post.platforms || [];

            const accounts = platformsArray.map(item => {
                // 1. Try to find by exact ID (best case)
                const credById = credentials.find(c => c.id === item);
                if (credById) {
                    return {
                        id: credById.id,
                        platform: credById.platform,
                        profileName: credById.profile || `${credById.platform} Account`,
                        status: credById.status,
                    };
                }
                
                // 2. Fallback: If ID not found, it might be an orphaned ID or a platform name
                // Try to resolve by platform name
                const platformName = item.includes('_') ? null : item.toUpperCase(); // simple check to see if it's an ID
                
                // If we can't determine platform from 'item', or if it is an ID that's gone,
                // we should check if there's ONLY ONE account for that platform and use it.
                // For now, let's see if 'item' matches any known platform names
                const knownPlatforms = ['FACEBOOK', 'LINKEDIN', 'TWITTER', 'X', 'WHATSAPP', 'INSTAGRAM'];
                const targetPlatform = knownPlatforms.find(p => p === item.toUpperCase()) || 
                                     (item.startsWith('cred_') ? null : item.toUpperCase()); // naive check

                const credByPlatform = credentials.find(c => c.platform === targetPlatform);
                
                if (credByPlatform) {
                    return {
                        id: credByPlatform.id,
                        platform: credByPlatform.platform,
                        profileName: credByPlatform.profile || `${credByPlatform.platform} Account`,
                        status: credByPlatform.status,
                    };
                }

                return {
                    id: null,
                    platform: targetPlatform || item,
                    profileName: `Unlinked Account`,
                    status: 'disconnected',
                };
            });

            return {
                ...post,
                accounts,
                // Manually structure the category object from joined columns
                category: post.cat_id ? {
                    id: post.cat_id,
                    name: post.cat_name,
                    color: post.cat_color
                } : null
            };
        });

        return NextResponse.json(formattedPosts);
    } catch (error) {
        console.error("[SOCIAL_POSTS_GET]", error);
        return NextResponse.json({ 
            message: "Failed to fetch posts", 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        }, { status: 500 });
    }
}

// POST create a new social post
export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId;
        const body = await req.json();
        const { title, content, platforms, accountIds, scheduledAt, mediaUrls, status, categoryId, tags } = body;

        if (!content) {
            return NextResponse.json({ message: "Content is required" }, { status: 400 });
        }

        let finalStatus = status || (scheduledAt ? "SCHEDULED" : "PUBLISHED");

        // platforms now contains a mix of account IDs (for connected) and platform names (for unlinked)
        const platformsToStore = platforms || [];

        // Use raw SQL for creation to bypass stale Prisma client issues
        const id = `post_${Math.random().toString(36).substring(2, 11)}`;
        const now = new Date();
        const sched = scheduledAt ? new Date(scheduledAt) : null;

        await db.$executeRawUnsafe(
            `INSERT INTO "Post" (id, title, content, platforms, "scheduledAt", "mediaUrls", "workspaceId", "userId", status, "categoryId", tags, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            id,
            title || null,
            content,
            platformsToStore,
            sched,
            mediaUrls || [],
            workspaceId,
            userId,
            finalStatus,
            categoryId || null,
            tags || [],
            now,
            now
        );

        await logger.info(`New post created: ${title || 'Untitled'}`, {
            workspaceId,
            userId,
            type: 'SYSTEM',
            details: { id, status: finalStatus, platforms: platformsToStore }
        });

        return NextResponse.json({ id, title, content, platforms: platformsToStore, status: finalStatus, createdAt: now });
    } catch (error) {
        console.error("[SOCIAL_POSTS_POST]", error);
        return NextResponse.json({ 
            message: "Failed to create post", 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        }, { status: 500 });
    }
}
