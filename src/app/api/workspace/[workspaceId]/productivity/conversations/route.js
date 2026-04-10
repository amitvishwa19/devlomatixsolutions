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

        // Find ALL member records for this user (across all workspaces)
        const allMembers = await db.member.findMany({
            where: {
                userId: session.user.userId,
            },
            select: { id: true }
        });

        const memberIds = allMembers.map(m => m.id);

        if (memberIds.length === 0) {
            return NextResponse.json([]);
        }

        // Fetch conversations where current user's ANY member record is involved
        const conversations = await db.conversation.findMany({
            where: {
                OR: [
                    { memberOneId: { in: memberIds } },
                    { memberTwoId: { in: memberIds } },
                ]
            },
            include: {
                memberOne: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                displayName: true,
                                avatar: true,
                            }
                        }
                    }
                },
                memberTwo: {
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

        // Format to easily identify the "other" person in the conversation
        const formatted = conversations.map(c => {
            const isMemberOne = memberIds.includes(c.memberOneId);
            const otherMember = isMemberOne ? c.memberTwo : c.memberOne;
            return {
                id: c.id,
                workspaceId,
                otherMember
            };
        });

        return NextResponse.json(formatted);

    } catch (error) {
        console.error("[CONVERSATIONS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}


export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { otherUserId } = body;

        if (!otherUserId) {
            return new NextResponse("Other user ID is required", { status: 400 });
        }

        if (otherUserId === session.user.userId) {
            return new NextResponse("Cannot start a conversation with yourself", { status: 400 });
        }

        // Find or create member for current user
        let currentMember = await db.member.findFirst({
            where: { serverId: workspaceId, userId: session.user.userId }
        });

        if (!currentMember) {
            currentMember = await db.member.create({
                data: { serverId: workspaceId, userId: session.user.userId, role: 'STAFF' }
            });
        }

        // Find or create member for the other user
        let otherMember = await db.member.findFirst({
            where: { serverId: workspaceId, userId: otherUserId }
        });

        if (!otherMember) {
            otherMember = await db.member.create({
                data: { serverId: workspaceId, userId: otherUserId, role: 'STAFF' }
            });
        }

        // Check if conversation already exists
        let conversation = await db.conversation.findFirst({
            where: {
                OR: [
                    { AND: [{ memberOneId: currentMember.id }, { memberTwoId: otherMember.id }] },
                    { AND: [{ memberOneId: otherMember.id }, { memberTwoId: currentMember.id }] }
                ]
            },
            include: {
                memberOne: { include: { user: { select: { id: true, displayName: true, avatar: true } } } },
                memberTwo: { include: { user: { select: { id: true, displayName: true, avatar: true } } } }
            }
        });

        if (!conversation) {
            conversation = await db.conversation.create({
                data: {
                    memberOneId: currentMember.id,
                    memberTwoId: otherMember.id
                },
                include: {
                    memberOne: { include: { user: { select: { id: true, displayName: true, avatar: true } } } },
                    memberTwo: { include: { user: { select: { id: true, displayName: true, avatar: true } } } }
                }
            });
        }

        const isMemberOne = conversation.memberOneId === currentMember.id;
        const otherMemberData = isMemberOne ? conversation.memberTwo : conversation.memberOne;
        
        return NextResponse.json({
            id: conversation.id,
            workspaceId,
            otherMember: otherMemberData
        });

    } catch (error) {
        console.error("[CONVERSATIONS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

