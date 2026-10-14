'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const DEFAULT_PIPELINE_STAGES = [
    { id: 'APPLIED', title: 'Applied', color: 'bg-blue-500', accent: 'border-blue-500/30', type: 'APPLIED' },
    { id: 'SCREENING', title: 'Screening', color: 'bg-amber-500', accent: 'border-amber-500/30', type: 'SCREENING' },
    { id: 'INTERVIEW', title: 'Interview', color: 'bg-indigo-500', accent: 'border-indigo-500/30', type: 'INTERVIEW' },
    { id: 'OFFERED', title: 'Offered', color: 'bg-emerald-500', accent: 'border-emerald-500/30', type: 'OFFERED' },
    { id: 'HIRED', title: 'Hired', color: 'bg-violet-500', accent: 'border-violet-500/30', type: 'HIRED' },
    { id: 'REJECTED', title: 'Archived / Rejected', color: 'bg-rose-500', accent: 'border-rose-500/30', type: 'REJECTED' }
];

export async function getDefaultPipelineStagesAction() {
    return DEFAULT_PIPELINE_STAGES;
}

/**
 * Get Applications for a workspace / specific job
 */
export async function getApplicationsAction(workspaceId, jobId = null) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const applications = await prisma.jobApplication.findMany({
            where: {
                workspaceId,
                jobId: jobId || undefined
            },
            include: {
                job: true,
                candidate: true,
            },
            orderBy: { appliedAt: 'desc' }
        });

        return { success: true, data: applications };
    } catch (error) {
        console.error("[GET_APPLICATIONS_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch applications" };
    }
}

/**
 * Get dynamic pipeline stages for workspace / job
 */
export async function getPipelineStagesAction(workspaceId, jobId = null) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const settingsKey = jobId ? `hireflow_pipeline_${jobId}` : `hireflow_pipeline_${workspaceId}`;
        const row = await prisma.appSettings.findUnique({
            where: { key: settingsKey }
        }).catch(() => null);

        if (row?.general && Array.isArray(row.general.stages) && row.general.stages.length > 0) {
            return { success: true, data: row.general.stages };
        }

        // Fallback to workspace-level pipeline if job-specific wasn't customized
        if (jobId) {
            const wsRow = await prisma.appSettings.findUnique({
                where: { key: `hireflow_pipeline_${workspaceId}` }
            }).catch(() => null);

            if (wsRow?.general && Array.isArray(wsRow.general.stages) && wsRow.general.stages.length > 0) {
                return { success: true, data: wsRow.general.stages };
            }
        }

        return { success: true, data: DEFAULT_PIPELINE_STAGES };
    } catch (error) {
        console.error("[GET_PIPELINE_STAGES_ERROR]", error);
        return { success: true, data: DEFAULT_PIPELINE_STAGES };
    }
}

/**
 * Save custom pipeline stages
 */
export async function savePipelineStagesAction(workspaceId, { jobId = null, stages }) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        if (!Array.isArray(stages) || stages.length === 0) {
            return { success: false, error: "Stages must be a non-empty array" };
        }

        const settingsKey = jobId ? `hireflow_pipeline_${jobId}` : `hireflow_pipeline_${workspaceId}`;

        await prisma.appSettings.upsert({
            where: { key: settingsKey },
            update: {
                general: { stages, updatedAt: new Date().toISOString() }
            },
            create: {
                key: settingsKey,
                general: { stages, updatedAt: new Date().toISOString() }
            }
        });

        return { success: true, message: "Pipeline stages updated successfully", data: stages };
    } catch (error) {
        console.error("[SAVE_PIPELINE_STAGES_ERROR]", error);
        return { success: false, error: error.message || "Failed to save pipeline stages" };
    }
}

/**
 * Create a new Job Application
 */
export async function createApplicationAction(workspaceId, data) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const { jobId, candidateId, stage } = data;

        const application = await prisma.jobApplication.create({
            data: {
                jobId,
                candidateId,
                workspaceId,
                stage: stage || "APPLIED"
            }
        });

        return { success: true, data: application };
    } catch (error) {
        console.error("[CREATE_APPLICATION_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to create application" };
    }
}

/**
 * Update Application Stage / Status (Kanban drag-and-drop) with FlowGenix Intelligence Triggers
 */
export async function updateApplicationStageAction(workspaceId, applicationId, stage, status) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const application = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: {
                stage: stage !== undefined ? stage : undefined,
                status: status !== undefined ? status : undefined
            },
            include: {
                candidate: true,
                job: true
            }
        });

        // FlowGenix Event-Driven Stage Intelligence: Auto-generate Interview Briefing Kit
        if (stage === 'INTERVIEW' && application.candidate) {
            import("../_lib/flowgenix-client").then(({ executeHireFlowAiPrompt }) => {
                executeHireFlowAiPrompt({
                    workspaceId,
                    systemPrompt: "You are an elite Hiring Committee Lead. Generate a concise, high-impact 1-page Interviewer Briefing Kit with 3 targeted probe questions.",
                    userPrompt: `Candidate: ${application.candidate.name}\nRole: ${application.job?.title || 'Engineer'}\nSkills: ${(application.candidate.skills || []).join(', ')}\nSummary: ${application.candidate.summary || 'N/A'}\n\nGenerate: 1) Executive Candidate Snapshot, 2) Key Strengths, 3) 3 Targeted Probe Questions for the Interview Loop. Format in clean markdown bullets.`,
                    model: "auto/smart",
                    responseFormat: "text"
                }).then(async (aiRes) => {
                    if (aiRes.success && aiRes.data) {
                        await prisma.atsNote.create({
                            data: {
                                candidateId: application.candidateId,
                                applicationId: application.id,
                                userId,
                                text: `🤖 **[FLOWGENIX INTERVIEWER BRIEFING KIT]**\n*Generated via FlowGenix Combo Gateway (${aiRes.resolvedModel || 'Auto/Smart'})*\n\n${aiRes.data}`,
                                isPrivate: false
                            }
                        }).catch(() => null);
                    }
                }).catch((err) => console.warn("[FLOWGENIX_STAGE_TRIGGER_WARN]", err.message));
            }).catch(() => null);
        }

        return { success: true, data: application };
    } catch (error) {
        console.error("[UPDATE_APPLICATION_STAGE_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to update stage" };
    }
}

/**
 * Reject / Archive Candidate with Reason Taxonomy
 */
export async function rejectCandidateAction(workspaceId, { applicationId, reason, feedback }) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const application = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: {
                stage: "REJECTED",
                status: "ARCHIVED"
            },
            include: { candidate: true, job: true }
        });

        // Add an audit note
        if (application.candidateId) {
            await prisma.atsNote.create({
                data: {
                    candidateId: application.candidateId,
                    applicationId: application.id,
                    userId,
                    text: `[CANDIDATE ARCHIVED/REJECTED]\nReason: ${reason || 'Not Specified'}\nNotes: ${feedback || 'No additional notes provided.'}`,
                    isPrivate: true
                }
            });
        }

        return { success: true, message: "Candidate marked as rejected and archived", data: application };
    } catch (error) {
        console.error("[REJECT_CANDIDATE_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to reject candidate" };
    }
}

/**
 * Schedule a Quick Interview
 */
export async function scheduleQuickInterviewAction(workspaceId, { applicationId, title, startTime, endTime, location, interviewers }) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const interview = await prisma.interview.create({
            data: {
                applicationId,
                title: title || "Candidate Interview",
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                location: location || "Google Meet",
                interviewers: Array.isArray(interviewers) ? interviewers : (interviewers ? [interviewers] : []),
                status: "SCHEDULED"
            }
        });

        // Advance stage to INTERVIEW if currently in APPLIED or SCREENING
        await prisma.jobApplication.update({
            where: { id: applicationId },
            data: { stage: "INTERVIEW" }
        }).catch(() => null);

        return { success: true, message: "Interview scheduled successfully", data: interview };
    } catch (error) {
        console.error("[SCHEDULE_QUICK_INTERVIEW_ERROR]", error);
        return { success: false, error: error.message || "Failed to schedule interview" };
    }
}

/**
 * Generate Self-Service Interview Booking Link (Ashby/Calendly style)
 */
export async function generateCandidateBookingLinkAction(workspaceId, { applicationId, title, durationMin = 45, interviewers = [], expirationDays = 7 }) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const application = await prisma.jobApplication.findUnique({
            where: { id: applicationId },
            include: { candidate: true, job: true }
        });

        if (!application) {
            return { success: false, error: "Application not found" };
        }

        // Generate token
        const bookingToken = `ats_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;

        const bookingData = {
            token: bookingToken,
            workspaceId,
            applicationId,
            candidateId: application.candidateId,
            candidateName: application.candidate?.name || "Candidate",
            candidateEmail: application.candidate?.email || "",
            candidatePhone: application.candidate?.phone || "",
            jobTitle: application.job?.title || "Open Position",
            title: title || `Interview: ${application.job?.title || 'Open Position'}`,
            durationMin: Number(durationMin) || 45,
            interviewers: interviewers.length > 0 ? interviewers : ["Devlomatix Hiring Team"],
            status: "PENDING",
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + expirationDays * 86400000).toISOString()
        };

        const settingsKey = `interview_booking_${bookingToken}`;
        await prisma.appSettings.upsert({
            where: { key: settingsKey },
            update: { general: bookingData },
            create: { key: settingsKey, general: bookingData }
        });

        // Add audit note
        if (application.candidateId) {
            await prisma.atsNote.create({
                data: {
                    candidateId: application.candidateId,
                    applicationId: application.id,
                    userId,
                    text: `[INTERVIEW BOOKING LINK GENERATED]\nTitle: ${bookingData.title}\nDuration: ${bookingData.durationMin} mins\nLink: /book-interview/${bookingToken}`,
                    isPrivate: true
                }
            }).catch(() => null);
        }

        return {
            success: true,
            token: bookingToken,
            bookingUrl: `/book-interview/${bookingToken}`,
            candidateName: application.candidate?.name,
            candidatePhone: application.candidate?.phone,
            jobTitle: application.job?.title
        };
    } catch (error) {
        console.error("[GENERATE_BOOKING_LINK_ERROR]", error);
        return { success: false, error: error.message || "Failed to generate interview booking link" };
    }
}

/**
 * Public action: Get booking session data by token
 */
export async function getInterviewBookingDataAction(bookingToken) {
    try {
        if (!bookingToken) return { success: false, error: "Booking token required" };

        const row = await prisma.appSettings.findUnique({
            where: { key: `interview_booking_${bookingToken}` }
        });

        if (!row?.general) {
            return { success: false, error: "Interview invitation not found or expired." };
        }

        const data = row.general;

        if (new Date(data.expiresAt) < new Date()) {
            return { success: false, error: "This interview booking invitation has expired. Please contact the recruiter for a fresh link." };
        }

        return {
            success: true,
            booking: {
                token: data.token,
                candidateName: data.candidateName,
                candidateEmail: data.candidateEmail,
                candidatePhone: data.candidatePhone,
                jobTitle: data.jobTitle,
                title: data.title,
                durationMin: data.durationMin,
                interviewers: data.interviewers,
                status: data.status,
                bookedSlot: data.bookedSlot || null
            }
        };
    } catch (error) {
        console.error("[GET_INTERVIEW_BOOKING_DATA_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch booking details" };
    }
}

/**
 * Public action: Confirm candidate interview slot
 */
export async function confirmInterviewBookingAction({ bookingToken, selectedDate, selectedTimeSlot, candidateNotes, candidatePhone }) {
    try {
        if (!bookingToken || !selectedDate || !selectedTimeSlot) {
            return { success: false, error: "Missing required booking details" };
        }

        const settingsKey = `interview_booking_${bookingToken}`;
        const row = await prisma.appSettings.findUnique({
            where: { key: settingsKey }
        });

        if (!row?.general) {
            return { success: false, error: "Invalid booking session" };
        }

        const data = row.general;

        if (data.status === "BOOKED") {
            return { success: false, error: "This interview has already been confirmed." };
        }

        // Calculate ISO start and end times
        const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
        const startTime = new Date(selectedDate);
        startTime.setHours(hours, minutes, 0, 0);

        const endTime = new Date(startTime.getTime() + (data.durationMin || 45) * 60000);

        // Create Interview record in Prisma
        const interview = await prisma.interview.create({
            data: {
                applicationId: data.applicationId,
                title: data.title || `Interview: ${data.jobTitle}`,
                startTime,
                endTime,
                location: "Google Meet",
                interviewers: Array.isArray(data.interviewers) ? data.interviewers : ["Devlomatix Hiring Team"],
                feedback: candidateNotes ? `Candidate Notes: ${candidateNotes}` : null,
                status: "SCHEDULED"
            }
        });

        // Update application stage to INTERVIEW
        await prisma.jobApplication.update({
            where: { id: data.applicationId },
            data: { stage: "INTERVIEW" }
        }).catch(() => null);

        // Log ATS note
        if (data.candidateId) {
            await prisma.atsNote.create({
                data: {
                    candidateId: data.candidateId,
                    applicationId: data.applicationId,
                    userId: "SYSTEM",
                    text: `[INTERVIEW CONFIRMED BY CANDIDATE]\nSlot: ${startTime.toLocaleString()}\nDuration: ${data.durationMin} mins\nCandidate Phone: ${candidatePhone || data.candidatePhone || 'N/A'}\nNotes: ${candidateNotes || 'None'}`,
                    isPrivate: false
                }
            }).catch(() => null);
        }

        // Mark booking session as booked
        const updatedBooking = {
            ...data,
            status: "BOOKED",
            bookedSlot: {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                location: "Google Meet"
            },
            interviewId: interview.id
        };

        await prisma.appSettings.update({
            where: { key: settingsKey },
            data: { general: updatedBooking }
        });

        return {
            success: true,
            message: "Interview successfully scheduled!",
            data: {
                interviewId: interview.id,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                title: data.title,
                jobTitle: data.jobTitle,
                location: "Google Meet"
            }
        };
    } catch (error) {
        console.error("[CONFIRM_INTERVIEW_BOOKING_ERROR]", error);
        return { success: false, error: error.message || "Failed to confirm interview booking" };
    }
}

