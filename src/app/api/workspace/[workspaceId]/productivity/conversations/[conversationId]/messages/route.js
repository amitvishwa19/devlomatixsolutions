import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const { workspaceId, conversationId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const messages = await db.directMessage.findMany({
            where: {
                conversationId,
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
        console.error("[DIRECT_MESSAGES_GET]", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { workspaceId, conversationId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { content, fileUrl } = body;

        if (!content && !fileUrl) {
            return new NextResponse("Content or file is required", { status: 400 });
        }

        // Find all member records for this user across all workspaces
        const allMembers = await db.member.findMany({
            where: {
                userId: session.user.userId,
            },
            select: { id: true }
        });

        const memberIds = allMembers.map(m => m.id);

        if (memberIds.length === 0) {
            return new NextResponse("Member not found", { status: 404 });
        }

        // Find the conversation and verify this user is part of it
        const conversation = await db.conversation.findFirst({
            where: {
                id: conversationId,
                OR: [
                    { memberOneId: { in: memberIds } },
                    { memberTwoId: { in: memberIds } }
                ]
            }
        });

        if (!conversation) {
            return new NextResponse("Conversation not found", { status: 404 });
        }

        // Determine which member ID belongs to current user in this conversation
        const senderMemberId = memberIds.includes(conversation.memberOneId)
            ? conversation.memberOneId
            : conversation.memberTwoId;


        const message = await db.directMessage.create({
            data: {
                content,
                fileUrl,
                conversationId: conversationId,
                memberId: senderMemberId,
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
        console.error("[DIRECT_MESSAGES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
