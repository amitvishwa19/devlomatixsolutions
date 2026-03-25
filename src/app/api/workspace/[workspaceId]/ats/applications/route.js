import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get("jobId");
        
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const applications = await prisma.application.findMany({
            where: {
                workspaceId,
                jobId: jobId || undefined
            },
            include: {
                job: true,
                candidate: true,
            },
            orderBy: { appliedDate: 'desc' }
        });

        return NextResponse.json(applications);
    } catch (error) {
        console.error("[ATS_APPLICATIONS_GET]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { jobId, candidateId, stage } = body;

        const application = await prisma.application.create({
            data: {
                jobId,
                candidateId,
                workspaceId,
                stage: stage || "APPLIED"
            }
        });

        return NextResponse.json(application);
    } catch (error) {
        console.error("[ATS_APPLICATIONS_POST]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { applicationId, stage, status } = body;

        const application = await prisma.application.update({
            where: { id: applicationId },
            data: {
                stage: stage !== undefined ? stage : undefined,
                status: status !== undefined ? status : undefined
            }
        });

        return NextResponse.json(application);
    } catch (error) {
        console.error("[ATS_APPLICATIONS_PUT]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
