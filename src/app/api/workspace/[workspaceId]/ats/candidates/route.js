import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const candidates = await prisma.candidate.findMany({
            where: { workspaceId },
            include: {
                applications: {
                    include: { job: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(candidates);
    } catch (error) {
        console.error("[ATS_CANDIDATES_GET]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { name, email, phone, location, summary, skills } = body;

        const candidate = await prisma.candidate.create({
            data: {
                name,
                email,
                phone,
                location,
                summary,
                skills,
                workspaceId,
                userId: session.user.userId
            }
        });

        return NextResponse.json(candidate);
    } catch (error) {
        console.error("[ATS_CANDIDATES_POST]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
