import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import JobApplyConfirmationEmail from '@/emails/JobApplyConfirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req, { params }) {
    try {
        const { jobId } = await params;
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

        // 4. Send Confirmation Email via Resend
        try {
            console.log("[EMAIL_SEND_ATTEMPT]", { to: email, from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev' });
            const { data, error } = await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
                to: email,
                subject: `Application Received: ${job.title}`,
                react: (
                    <JobApplyConfirmationEmail 
                        name={name}
                        jobTitle={job.title}
                        location={job.location || 'Remote'}
                        companyName={process.env.NEXT_PUBLIC_APP_NAME || 'Devlomatix'}
                    />
                )
            });

            if (error) {
                console.error("[RESEND_ERROR]", error);
            } else {
                console.log("[RESEND_SUCCESS]", data);
            }
        } catch (emailError) {
            // We don't want to fail the whole application if email fails, but we log it
            console.error("[EMAIL_SEND_EXCEPTION]", emailError);
        }

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
