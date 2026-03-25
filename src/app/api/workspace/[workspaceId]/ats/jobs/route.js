import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const jobs = await prisma.job.findMany({
            where: { workspaceId },
            include: {
                _count: {
                    select: { applications: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(jobs);
    } catch (error) {
        console.error("[ATS_JOBS_GET]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        console.log("session", session);

        const body = await req.json();
        const { title, description, department, location, type, salaryRange } = body;

        const job = await prisma.job.create({
            data: {
                title,
                description,
                department,
                location,
                type,
                salaryRange,
                workspaceId,
                userId: session.user.userId
            }
        });

        return NextResponse.json(job);
    } catch (error) {
        console.error("[ATS_JOBS_POST]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
