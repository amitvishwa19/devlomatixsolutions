import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { workspaceId } = await params;
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";
        const documentId = searchParams.get("documentId");

        // Fetch workspace members matching query
        const memberWhere = {
            serverId: workspaceId,
        };

        if (query.trim()) {
            memberWhere.user = {
                OR: [
                    { displayName: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } },
                    { username: { contains: query, mode: "insensitive" } },
                ]
            };
        }

        const members = await db.member.findMany({
            where: memberWhere,
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        email: true,
                        avatar: true,
                        role: true,
                    }
                }
            },
            take: 30,
        });

        const usersMap = new Map();

        members.forEach(m => {
            if (m.user) {
                usersMap.set(m.user.id, {
                    id: m.user.id,
                    displayName: m.user.displayName || m.user.email?.split("@")[0] || "User",
                    email: m.user.email,
                    avatar: m.user.avatar,
                    role: m.role || "MEMBER",
                    isWorkspaceMember: true,
                });
            }
        });

        // Also search general users if query is provided and we have fewer than 10 results
        if (query.trim().length >= 2) {
            const allUsers = await db.user.findMany({
                where: {
                    OR: [
                        { displayName: { contains: query, mode: "insensitive" } },
                        { email: { contains: query, mode: "insensitive" } },
                        { username: { contains: query, mode: "insensitive" } },
                    ]
                },
                select: {
                    id: true,
                    displayName: true,
                    email: true,
                    avatar: true,
                    role: true,
                },
                take: 20,
            });

            allUsers.forEach(u => {
                if (!usersMap.has(u.id)) {
                    usersMap.set(u.id, {
                        id: u.id,
                        displayName: u.displayName || u.email?.split("@")[0] || "User",
                        email: u.email,
                        avatar: u.avatar,
                        role: u.role,
                        isWorkspaceMember: false,
                    });
                }
            });
        }

        let results = Array.from(usersMap.values());

        // If documentId is provided, annotate existing access role if any
        if (documentId) {
            const existingAccess = await db.documentAccess.findMany({
                where: { documentId },
                select: { userId: true, role: true }
            });
            const accessMap = new Map(existingAccess.map(a => [a.userId, a.role]));

            results = results.map(u => ({
                ...u,
                currentRole: accessMap.get(u.id) || null
            }));
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error("[DOCUMENT_SHARE_USERS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
