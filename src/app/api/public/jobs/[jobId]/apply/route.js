import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma';

export async function POST(req, { params }) {
    try {
        const { jobId } = params;
        const { name, email, phone, resumeUrl, portfolioUrl } = await req.json();

        if (!name || !email || !jobId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Fetch the Job to get context (workspaceId, userId)
        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        // 2. Upsert Candidate
        // We use email as the unique identifier. We'll update the name, phone, and resumeUrl.
        const candidate = await prisma.candidate.upsert({
            where: { email },
            update: {
                name,
                phone,
                resumeUrl,
                location: 'Public Applicant', // Or handle if provided
                updatedAt: new Date(),
            },
            create: {
                name,
                email,
                phone,
                resumeUrl,
                workspaceId: job.workspaceId,
                userId: job.userId,
            }
        });

        // 3. Create Application
        // Check if an application already exists for this candidate and job
        const existingApplication = await prisma.application.findFirst({
            where: {
                jobId,
                candidateId: candidate.id
            }
        });

        if (existingApplication) {
            return NextResponse.json({ 
                success: true, 
                message: "You have already applied for this position. We have updated your profile.",
                application: existingApplication 
            });
        }

        const application = await prisma.application.create({
            data: {
                jobId,
                candidateId: candidate.id,
                stage: 'APPLIED',
                status: 'ACTIVE',
                workspaceId: job.workspaceId,
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: "Application submitted successfully!",
            application 
        });

    } catch (error) {
        console.error("[JOB_APPLY_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
