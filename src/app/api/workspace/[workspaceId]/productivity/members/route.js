import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch all users except the logged-in user
        const users = await db.user.findMany({
            where: {
                NOT: {
                    id: session.user.userId
                }
            },
            select: {
                id: true,
                displayName: true,
                avatar: true,
                email: true,
            },
            orderBy: {
                displayName: 'asc',
            }
        });

        // Also fetch members for this workspace so we can map userId -> memberId
        const members = await db.member.findMany({
            where: { serverId: workspaceId },
            select: { id: true, userId: true, role: true }
        });

        const memberMap = {};
        members.forEach(m => { memberMap[m.userId] = m; });

        // Return users with their member info if they exist
        const result = users.map(u => ({
            id: memberMap[u.id]?.id || null, // memberId (null if not a workspace member yet)
            userId: u.id,
            role: memberMap[u.id]?.role || null,
            user: {
                id: u.id,
                displayName: u.displayName,
                avatar: u.avatar,
            }
        }));

        return NextResponse.json(result);

    } catch (error) {
        console.error("[MEMBERS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
