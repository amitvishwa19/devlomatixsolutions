import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Fetch columns and tasks ordered by their 'order' field
        const columns = await db.kanbanColumn.findMany({
            where: { workspaceId },
            orderBy: { order: 'asc' },
            include: {
                tasks: {
                    where: {
                        OR: [
                            { userId: session.user.userId },
                            { assigneeId: session.user.userId }
                        ]
                    },
                    include: {
                        assignee: {
                            select: {
                                id: true,
                                displayName: true,
                                avatar: true,
                            }
                        },
                        checklists: {
                            orderBy: { order: 'asc' }
                        },
                        activities: {
                            orderBy: { createdAt: 'desc' },
                            take: 10,
                            include: {
                                user: {
                                    select: {
                                        displayName: true,
                                        avatar: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });

        // Transform into the format expected by the frontend if necessary
        // Or just return the raw data and let the frontend handle the mapping
        return NextResponse.json(columns);
    } catch (error) {
        console.error("[KANBAN_GET]", error);
        return NextResponse.json({ 
            message: "Failed to fetch kanban data", 
            error: error.message 
        }, { status: 500 });
    }
}
