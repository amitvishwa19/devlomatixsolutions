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

        const channels = await db.channel.findMany({
            where: {
                serverId: workspaceId,
            },
            orderBy: {
                createdAt: 'asc',
            }
        });

        return NextResponse.json(channels);
    } catch (error) {
        console.error("[CHANNELS_GET]", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
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
        const { name, type } = body;

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const channel = await db.channel.create({
            data: {
                serverId: workspaceId,
                userId: session.user.userId,
                name,
                type: type || "TEXT",
            }
        });

        return NextResponse.json(channel);
    } catch (error) {
        console.error("[CHANNELS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
