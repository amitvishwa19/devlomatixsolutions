import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import JobApplyConfirmationEmail from '@/emails/JobApplyConfirmation';
import { NewJobApplicationNotificationEmail } from '@/emails/NewJobApplicationNotification';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req, { params }) {
    try {
        const { jobId } = await params;
        const body = await req.json();
        const { name, email, phone, resumeUrl, portfolioUrl } = body;

        console.log("[JOB_APPLY_START]", { jobId, name, email, resumeUrl });

        if (!name || !email || !jobId) {
            console.error("[JOB_APPLY_ERROR] Missing fields");
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Fetch the Job to get context (workspaceId, userId)
        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            console.error("[JOB_APPLY_ERROR] Job not found", jobId);
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        console.log("[JOB_APPLY_CONTEXT]", { workspaceId: job.workspaceId, userId: job.userId });

        // 2. Upsert Candidate
        const candidate = await prisma.candidate.upsert({
            where: { email },
            update: {
                name,
                phone,
                resumeUrl,
                location: 'Public Applicant',
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

        console.log("[JOB_APPLY_CANDIDATE_OK]", candidate.id);

        // 3. Create JobApplication
        const existingApplication = await prisma.jobApplication.findFirst({
            where: {
                jobId,
                candidateId: candidate.id
            }
        });

        if (existingApplication) {
            console.log("[JOB_APPLY_DUPLICATE]", existingApplication.id);
            return NextResponse.json({ 
                success: true, 
                message: "You have already applied for this position. We have updated your profile.",
                application: existingApplication 
            });
        }

        const application = await prisma.jobApplication.create({
            data: {
                jobId,
                candidateId: candidate.id,
                stage: 'APPLIED',
                status: 'ACTIVE',
                workspaceId: job.workspaceId,
                resumeUrl: resumeUrl,
            }
        });

        console.log("[JOB_APPLY_APPLICATION_OK]", application.id);

        // 4. Send Emails via Resend
        try {
            const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
            const adminEmail = process.env.JOB_APPLICATION_MAIL;

            console.log("[JOB_APPLY_EMAILS_START]", { fromEmail, adminEmail });

            // A. Send Confirmation Email to Candidate
            await resend.emails.send({
                from: fromEmail,
                to: email,
                subject: `Application submitted successfully for ${job.title}`,
                react: (
                    <JobApplyConfirmationEmail 
                        name={name}
                        jobTitle={job.title}
                        location={job.location || 'Remote'}
                        companyName={process.env.NEXT_PUBLIC_APP_NAME || 'Devlomatix'}
                    />
                )
            });

            console.log("[JOB_APPLY_CANDIDATE_EMAIL_SENT]");

            // B. Send Notification Email to Admin
            if (adminEmail) {
                await resend.emails.send({
                    from: fromEmail,
                    to: adminEmail,
                    subject: `New Application: ${name} - ${job.title}`,
                    react: (
                        <NewJobApplicationNotificationEmail 
                            name={name}
                            email={email}
                            phone={phone}
                            jobTitle={job.title}
                            resumeUrl={resumeUrl}
                            portfolioUrl={portfolioUrl}
                            appliedAt={new Date().toLocaleString()}
                        />
                    )
                });
                console.log("[JOB_APPLY_ADMIN_EMAIL_SENT]");
            }

        } catch (emailError) {
            console.error("[EMAIL_SEND_EXCEPTION]", emailError);
        }

        return NextResponse.json({ 
            success: true, 
            message: "Application submitted successfully!",
            application 
        });

    } catch (error) {
        console.error("[JOB_APPLY_FATAL_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
