import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function PATCH(req, { params }) {
    try {
        const { workspaceId, postId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId;
        const body = await req.json();
        const { title, content, mediaUrls, scheduledAt, platforms, status, categoryId, tags } = body;

        // Dynamic raw SQL update to bypass stale Prisma client issues
        let queryParts = [];
        let queryValues = [];
        let paramIndex = 1;

        const addField = (name, value) => {
            if (value !== undefined) {
                queryParts.push(`"${name}" = $${paramIndex}`);
                queryValues.push(value);
                paramIndex++;
            }
        };

        addField('title', title);
        addField('content', content);
        addField('mediaUrls', mediaUrls);
        addField('scheduledAt', scheduledAt ? new Date(scheduledAt) : (scheduledAt === null ? null : undefined));
        addField('platforms', platforms);
        addField('status', status);
        addField('categoryId', categoryId === 'none' ? null : categoryId);
        addField('tags', tags);
        
        // Add updatedAt
        queryParts.push(`"updatedAt" = $${paramIndex}`);
        queryValues.push(new Date());
        paramIndex++;

        if (queryParts.length > 0) {
            queryValues.push(postId, workspaceId, userId);
            const query = `
                UPDATE "Post" 
                SET ${queryParts.join(', ')}
                WHERE id = $${paramIndex} AND "workspaceId" = $${paramIndex + 1} AND "userId" = $${paramIndex + 2}
            `;
            await db.$executeRawUnsafe(query, ...queryValues);
        }

        const updatedPost = await db.$queryRawUnsafe(
            'SELECT * FROM "Post" WHERE id = $1', 
            postId
        );

        return NextResponse.json(updatedPost[0]);
    } catch (error) {
        console.error("[SOCIAL_POST_PATCH]", error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { workspaceId, postId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId;

        const post = await db.post.findUnique({
            where: { id: postId, workspaceId, userId }
        });

        if (!post) {
            return NextResponse.json({ message: "Post not found" }, { status: 404 });
        }

        await db.post.delete({
            where: { id: postId }
        });

        return NextResponse.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("[SOCIAL_POST_DELETE]", error);
        return NextResponse.json({ 
            message: "Failed to delete post", 
            error: error.message 
        }, { status: 500 });
    }
}
