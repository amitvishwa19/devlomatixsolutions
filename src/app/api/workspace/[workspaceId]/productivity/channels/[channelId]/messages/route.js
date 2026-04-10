import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const { workspaceId, channelId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const messages = await db.message.findMany({
            where: {
                channelId,
            },
            include: {
                member: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                displayName: true,
                                avatar: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'asc',
            }
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error("[MESSAGES_GET]", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { workspaceId, channelId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { content, fileUrl } = body;

        if (!content && !fileUrl) {
            return new NextResponse("Content or file is required", { status: 400 });
        }

        const member = await db.member.findFirst({
            where: {
                serverId: workspaceId,
                userId: session.user.userId,
            }
        });

        if (!member) {
            return new NextResponse("Member not found", { status: 404 });
        }

        const message = await db.message.create({
            data: {
                content,
                fileUrl,
                channelId,
                memberId: member.id,
            },
            include: {
                member: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                displayName: true,
                                avatar: true,
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error("[MESSAGES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
