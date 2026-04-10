import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const logs = await prisma.systemLog.findMany({
            where: {
                workspaceId,
                type: "WEBHOOK"
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.error("Webhook Logs Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
