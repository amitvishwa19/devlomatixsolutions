import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId || session.user.id;

        const botFlows = await db.botFlow.findMany({
            where: { userId },
            include: {
                steps: true
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json({ success: true, data: botFlows });
    } catch (error) {
        console.error("[WA_BOT_FLOW_GET_ERROR]", error);
        return NextResponse.json({ error: "Failed to fetch bot flows" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId || session.user.id;
        const body = await req.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const newBotFlow = await db.botFlow.create({
            data: {
                name,
                description,
                userId,
                // Create a default start step
                steps: {
                    create: {
                        type: 'trigger',
                        config: { keyword: name.toLowerCase().replace(/\s+/g, '_'), type: 'keyword' },
                        positionX: 100,
                        positionY: 100,
                        order: 0
                    }
                }
            }
        });

        return NextResponse.json({ success: true, data: newBotFlow });
    } catch (error) {
        console.error("[WA_BOT_FLOW_POST_ERROR]", error);
        return NextResponse.json({ error: "Failed to create bot flow" }, { status: 500 });
    }
}
