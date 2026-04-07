import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const { workspaceId, candidateId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId },
            include: {
                applications: {
                    where: { workspaceId },
                    include: { 
                        job: true,
                    }
                },
                scorecards: {
                    include: { interviewer: true },
                    orderBy: { createdAt: 'desc' }
                },
                notes: {
                    include: { user: true },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!candidate) return NextResponse.json({ message: "Candidate not found" }, { status: 404 });

        return NextResponse.json(candidate);
    } catch (error) {
        console.error("[ATS_CANDIDATE_GET]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const { workspaceId, candidateId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { name, email, phone, location, summary, skills, aiSummary, aiMatchScore, parsedData } = body;

        const candidate = await prisma.candidate.update({
            where: { id: candidateId },
            data: {
                name,
                email,
                phone,
                location,
                summary,
                skills,
                aiSummary,
                aiMatchScore,
                parsedData
            }
        });

        return NextResponse.json(candidate);
    } catch (error) {
        console.error("[ATS_CANDIDATE_PUT]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
