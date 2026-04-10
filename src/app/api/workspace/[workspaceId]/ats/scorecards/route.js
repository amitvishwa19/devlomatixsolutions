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
        const applicationId = searchParams.get("applicationId");
        const candidateId = searchParams.get("candidateId");

        const scorecards = await prisma.scorecard.findMany({
            where: {
                OR: [
                    { applicationId: applicationId || undefined },
                    { candidateId: candidateId || undefined }
                ]
            },
            include: { interviewer: true },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(scorecards);
    } catch (error) {
        console.error("[ATS_SCORECARDS_GET]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { candidateId, applicationId, interviewId, scores, feedback, overallScore, recommendation } = body;

        const scorecard = await prisma.scorecard.create({
            data: {
                candidateId,
                applicationId,
                attributes: scores,
                feedback,
                score: Number(overallScore) || 0,
                recommendation,
                interviewerId: session.user.userId
            }
        });

        return NextResponse.json(scorecard);
    } catch (error) {
        console.error("[ATS_SCORECARDS_POST]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
