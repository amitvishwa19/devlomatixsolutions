import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId || session.user.id;
        const botFlowId = params.id;

        const botFlow = await db.botFlow.findUnique({
            where: { id: botFlowId, userId },
            include: {
                steps: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!botFlow) {
            return NextResponse.json({ error: "Bot flow not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: botFlow });
    } catch (error) {
        console.error("[WA_BOT_FLOW_GET_BY_ID_ERROR]", error);
        return NextResponse.json({ error: "Failed to fetch bot flow" }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId || session.user.id;
        const botFlowId = params.id;
        const body = await req.json();
        const { name, description, active, nodes, edges } = body;

        const updatedBotFlow = await db.botFlow.update({
            where: { id: botFlowId, userId },
            data: {
                name: name !== undefined ? name : undefined,
                description: description !== undefined ? description : undefined,
                active: active !== undefined ? active : undefined,
                nodes: nodes !== undefined ? nodes : undefined,
                edges: edges !== undefined ? edges : undefined,
            }
        });

        return NextResponse.json({ success: true, data: updatedBotFlow });
    } catch (error) {
        console.error("[WA_BOT_FLOW_PATCH_ERROR]", error);
        return NextResponse.json({ error: "Failed to update bot flow" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId || session.user.id;
        const botFlowId = params.id;

        await db.botFlow.delete({
            where: { id: botFlowId, userId }
        });

        return NextResponse.json({ success: true, message: "Bot flow deleted" });
    } catch (error) {
        console.error("[WA_BOT_FLOW_DELETE_ERROR]", error);
        return NextResponse.json({ error: "Failed to delete bot flow" }, { status: 500 });
    }
}
