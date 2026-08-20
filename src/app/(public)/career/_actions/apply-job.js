'use server';

import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import JobApplyConfirmationEmail from '@/emails/JobApplyConfirmation';
import { NewJobApplicationNotificationEmail } from '@/emails/NewJobApplicationNotification';
import React from 'react';

export async function applyForJob({ jobId, name, email, phone, resumeUrl, portfolioUrl }) {
    try {
        if (!jobId || !name || !email) {
            return { success: false, error: "Name, email, and job ID are required" };
        }

        // 1. Fetch the Job context
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: {
                category: true,
            }
        });

        if (!job) {
            return { success: false, error: "Selected job opening not found" };
        }

        // 2. Upsert Candidate
        const candidate = await prisma.candidate.upsert({
            where: { email },
            update: {
                name,
                phone: phone || undefined,
                resumeUrl: resumeUrl || undefined,
                location: 'Public Applicant',
                updatedAt: new Date(),
            },
            create: {
                name,
                email,
                phone: phone || '',
                resumeUrl: resumeUrl || '',
                workspaceId: job.workspaceId,
                userId: job.userId,
            }
        });

        // 3. Check for existing active application for this job
        const existingApplication = await prisma.jobApplication.findFirst({
            where: {
                jobId,
                candidateId: candidate.id
            }
        });

        if (existingApplication) {
            return {
                success: true,
                message: "You have already applied for this position. We have updated your profile with the latest details.",
                application: existingApplication
            };
        }

        // 4. Create Job Application
        const application = await prisma.jobApplication.create({
            data: {
                jobId,
                candidateId: candidate.id,
                stage: 'APPLIED',
                status: 'ACTIVE',
                workspaceId: job.workspaceId,
                resumeUrl: resumeUrl || '',
            }
        });

        // 5. Send Acknowledgment & Notification Emails via Resend
        try {
            const defaultSender = process.env.RESEND_FROM_EMAIL || 'careers@devlomatix.com';
            const fromEmail = defaultSender.includes('<')
                ? defaultSender
                : `Devlomatix Careers <${defaultSender}>`;
            const adminEmail = process.env.JOB_APPLICATION_MAIL || process.env.ADMIN_EMAIL;

            // Fetch Global App Branding (Brand Logo, App Name) and Workspace Info
            const globalSettings = await prisma.appSettings.findUnique({
                where: { key: 'APP_GENERAL' }
            }).catch(() => null);

            const globalSocial = (typeof globalSettings?.social === 'object' && globalSettings?.social) ? globalSettings.social : {};
            const globalGeneral = (typeof globalSettings?.general === 'object' && globalSettings?.general) ? globalSettings.general : {};

            let workspaceServer = null;
            let workspaceLogoUrl = null;
            if (job.workspaceId) {
                workspaceServer = await prisma.server.findUnique({
                    where: { id: job.workspaceId },
                    select: { name: true, imageUrl: true }
                }).catch(() => null);

                const workspaceSettings = await prisma.appSettings.findUnique({
                    where: { key: job.workspaceId }
                }).catch(() => null);

                if (workspaceSettings?.general?.imageUrl || workspaceSettings?.general?.logoUrl) {
                    workspaceLogoUrl = workspaceSettings.general.imageUrl || workspaceSettings.general.logoUrl;
                }
            }

            const logoUrl = 
                globalSocial.logoUrl || 
                globalGeneral.logoUrl || 
                globalGeneral.imageUrl || 
                workspaceLogoUrl || 
                workspaceServer?.imageUrl || 
                process.env.APP_LOGO_URL || 
                process.env.NEXT_PUBLIC_APP_LOGO || 
                '';

            const companyName = 
                workspaceServer?.name || 
                globalSocial.appName || 
                globalGeneral.appName || 
                process.env.NEXT_PUBLIC_APP_NAME || 
                'Devlomatix';

            const deptName = job.category?.name || job.department || 'General';

            // A. Send Confirmation Email to Candidate
            const candidateMailPromise = resend.emails.send({
                from: fromEmail,
                to: email,
                reply_to: adminEmail || 'careers@devlomatix.com',
                subject: `Application Received: ${job.title} - ${companyName}`,
                react: React.createElement(JobApplyConfirmationEmail, {
                    name,
                    jobTitle: job.title,
                    department: deptName,
                    location: job.location || 'Remote',
                    type: job.type || 'Full-time',
                    applicationId: application.id.slice(-8).toUpperCase(),
                    appliedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    companyName,
                    logoUrl
                })
            });

            // B. Send Alert Email to Hiring Team
            let adminMailPromise = Promise.resolve();
            if (adminEmail) {
                adminMailPromise = resend.emails.send({
                    from: fromEmail,
                    to: adminEmail,
                    subject: `New Candidate Applied: ${name} (${job.title})`,
                    react: React.createElement(NewJobApplicationNotificationEmail, {
                        name,
                        email,
                        phone: phone || 'Not provided',
                        jobTitle: job.title,
                        resumeUrl: resumeUrl || '#',
                        portfolioUrl: portfolioUrl || '',
                        appliedAt: new Date().toLocaleString()
                    })
                });
            }

            // Await both email sends safely
            await Promise.allSettled([candidateMailPromise, adminMailPromise]);

        } catch (emailErr) {
            console.error("[CAREER_APPLY_EMAIL_ERROR]", emailErr);
            // Non-blocking for candidate experience: application is still safely stored in DB
        }

        return {
            success: true,
            message: "Application submitted successfully! Please check your email for confirmation.",
            application
        };

    } catch (error) {
        console.error("[APPLY_FOR_JOB_ERROR]", error);
        return { success: false, error: error.message || "Failed to submit application" };
    }
}
