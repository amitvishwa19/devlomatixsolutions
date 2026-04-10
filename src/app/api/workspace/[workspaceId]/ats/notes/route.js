import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const candidateId = searchParams.get("candidateId");

        const notes = await prisma.atsNote.findMany({
            where: {
                candidateId: candidateId || undefined,
            },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(notes);
    } catch (error) {
        console.error("[ATS_NOTES_GET]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { candidateId, applicationId, text, isPrivate } = body;

        const note = await prisma.atsNote.create({
            data: {
                candidateId,
                applicationId,
                text,
                isPrivate: isPrivate || false,
                userId: session.user.userId
            }
        });

        return NextResponse.json(note);
    } catch (error) {
        console.error("[ATS_NOTES_POST]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
