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

        const groups = await db.contactGroup.findMany({
            where: { workspaceId },
            include: {
                _count: {
                    select: { contacts: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(groups);
    } catch (error) {
        console.error("[CONTACT_GROUPS_GET]", error.message);
        return NextResponse.json({ message: "Failed to fetch groups" }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId;
        const body = await req.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json({ message: "Name is required" }, { status: 400 });
        }

        const group = await db.contactGroup.create({
            data: {
                name,
                description,
                workspaceId,
                userId
            }
        });

        return NextResponse.json(group);
    } catch (error) {
        console.error("[CONTACT_GROUPS_POST]", error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
