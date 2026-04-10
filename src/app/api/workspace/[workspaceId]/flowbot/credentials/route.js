import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse("Unauthorized", { status: 401 });

        const { workspaceId } = params;
        const { searchParams } = new URL(req.url);
        const platform = searchParams.get('platform');

        // Note: Credentials in this schema are linked to User, but for a workspace 
        // we might want to allow sharing or just fetch user's own for now.
        // In this project, 'workspaceId' is often used to group resources.

        const credentials = await db.credentials.findMany({
            where: {
                userId: session.user.id,
                ...(platform && { platform: { contains: platform, mode: 'insensitive' } })
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json(credentials);
    } catch (error) {
        console.error("[FLOWBOT_CREDENTIALS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
