import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const { workspaceId, jobId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: {
                applications: {
                    include: { candidate: true }
                }
            }
        });

        if (!job) return NextResponse.json({ message: "Job not found" }, { status: 404 });

        return NextResponse.json(job);
    } catch (error) {
        console.error("[ATS_JOB_GET]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const { workspaceId, jobId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { title, description, department, location, type, salaryRange, status } = body;

        const job = await prisma.job.update({
            where: { id: jobId },
            data: {
                title,
                description,
                department,
                location,
                type,
                salaryRange,
                status
            }
        });

        return NextResponse.json(job);
    } catch (error) {
        console.error("[ATS_JOB_PUT]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
