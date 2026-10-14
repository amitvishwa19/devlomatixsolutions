'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { getWhatsappDefault } from "@/lib/whatsapp-default";
import * as cloudApi from '../../konnectx/_lib/whatsapp-cloud-api';
import { symmetricDecrypt } from "@/lib/encryption";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { executeHireFlowAiPrompt, executeCandidateCopilotChat, generateInterviewKitAI } from "../_lib/flowgenix-client";

/**
 * Get all Candidates for a workspace
 */
export async function getCandidatesAction(workspaceId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const candidates = await prisma.candidate.findMany({
            where: {
                OR: [
                    { workspaceId },
                    { applications: { some: { workspaceId } } }
                ]
            },
            include: {
                applications: {
                    where: { workspaceId },
                    include: { 
                        job: {
                            include: { category: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, data: candidates };
    } catch (error) {
        console.error("[GET_CANDIDATES_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch candidates" };
    }
}

/**
 * Get single Candidate by ID
 */
export async function getCandidateByIdAction(workspaceId, candidateId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId },
            include: {
                applications: {
                    where: { workspaceId },
                    include: { 
                        job: {
                            include: { category: true }
                        },
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

        if (!candidate) return { success: false, error: "Candidate not found" };

        const parsed = candidate.parsedData || {};
        const normalizedCandidate = {
            ...candidate,
            role: candidate.applications?.[0]?.job?.title || candidate.summary || "Applicant",
            aiInsights: {
                matchingScore: candidate.aiMatchScore || parsed.aiMatchScore || 0,
                summary: candidate.aiSummary || parsed.summary || candidate.summary || "Deep analysis pending...",
                pros: Array.isArray(parsed.pros) ? parsed.pros : [],
                cons: Array.isArray(parsed.cons) ? parsed.cons : [],
                skills: Array.isArray(parsed.skills) && parsed.skills.length ? parsed.skills : candidate.skills,
                matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
                missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
                seniorityLevel: parsed.seniorityLevel || "Mid-Level",
                recommendedAction: parsed.recommendedAction || "Under Evaluation",
                suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions : [],
                aiProvider: parsed.aiProvider || "FlowGenix",
                aiModel: parsed.aiModel || "auto",
                aiLatencyMs: parsed.aiLatencyMs || null
            }
        };

        return { success: true, data: normalizedCandidate };
    } catch (error) {
        console.error("[GET_CANDIDATE_BY_ID_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch candidate" };
    }
}

/**
 * Create a new Candidate
 */
export async function createCandidateAction(workspaceId, data) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const { name, email, phone, location, summary, skills } = data;

        const candidate = await prisma.candidate.create({
            data: {
                name,
                email,
                phone,
                location,
                summary,
                skills: Array.isArray(skills) ? skills : (skills ? [skills] : []),
                workspaceId,
                userId
            }
        });

        return { success: true, data: candidate };
    } catch (error) {
        console.error("[CREATE_CANDIDATE_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to create candidate" };
    }
}

/**
 * Update Candidate Details
 */
export async function updateCandidateAction(workspaceId, candidateId, data) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const { name, email, phone, location, summary, skills, aiSummary, aiMatchScore, parsedData } = data;

        const candidate = await prisma.candidate.update({
            where: { id: candidateId },
            data: {
                name: name !== undefined ? name : undefined,
                email: email !== undefined ? email : undefined,
                phone: phone !== undefined ? phone : undefined,
                location: location !== undefined ? location : undefined,
                summary: summary !== undefined ? summary : undefined,
                skills: skills !== undefined ? skills : undefined,
                aiSummary: aiSummary !== undefined ? aiSummary : undefined,
                aiMatchScore: aiMatchScore !== undefined ? aiMatchScore : undefined,
                parsedData: parsedData !== undefined ? parsedData : undefined
            }
        });

        return { success: true, data: candidate };
    } catch (error) {
        console.error("[UPDATE_CANDIDATE_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to update candidate" };
    }
}

/**
 * Delete Candidate
 */
export async function deleteCandidateAction(workspaceId, candidateId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        await prisma.candidate.delete({
            where: { id: candidateId }
        });

        return { success: true, message: "Candidate deleted successfully" };
    } catch (error) {
        console.error("[DELETE_CANDIDATE_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete candidate" };
    }
}

/**
 * Create a candidate note
 */
export async function createCandidateNoteAction(workspaceId, data) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const { candidateId, applicationId, text, isPrivate } = data;

        const note = await prisma.atsNote.create({
            data: {
                candidateId,
                applicationId,
                text,
                isPrivate: isPrivate || false,
                userId
            },
            include: { user: true }
        });

        return { success: true, data: note };
    } catch (error) {
        console.error("[CREATE_CANDIDATE_NOTE_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to create note" };
    }
}

/**
 * Create a candidate scorecard
 */
export async function createCandidateScorecardAction(workspaceId, data) {
    return submitScorecardAction(workspaceId, {
        candidateId: data.candidateId,
        applicationId: data.applicationId,
        stage: data.stage,
        score: data.overallScore !== undefined ? data.overallScore : data.score,
        feedback: data.feedback,
        recommendation: data.recommendation,
        attributes: data.scores || data.attributes
    });
}

/**
 * AI Parse Resume
 */
export async function aiParseResumeAction(workspaceId, { candidateId, resumeText }) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId },
            include: {
                applications: {
                    include: {
                        job: true
                    }
                }
            }
        });

        if (!candidate) return { success: false, error: "Candidate not found" };

        const targetJob = candidate.applications?.[0]?.job;
        const jobRequirements = (targetJob?.requirements || []).join(', ');

        const systemPrompt = `You are an elite Principal Technical Recruiter and ATS AI Evaluator.
Perform a thorough, multi-dimensional semantic analysis of this candidate against the target requisition.
Return valid JSON strictly following the requested schema without markdown code blocks.`;

        const userPrompt = `
Candidate Profile:
- Name: ${candidate.name}
- Email: ${candidate.email}
- Phone: ${candidate.phone || 'N/A'}
- Current Target Role: ${targetJob?.title || candidate.summary || 'Applicant'}
- Job Requirements to Compare Against: ${jobRequirements || 'Standard role competencies'}
- Job Description Context: ${targetJob?.description || 'N/A'}
${resumeText ? `Additional Resume Text: ${resumeText}` : ''}

Analyze the resume and return valid JSON strictly following this schema:
{
    "summary": "High-impact 2-3 sentence executive summary of the candidate's career trajectory, key achievements, and primary strengths.",
    "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
    "matchedSkills": ["Skills present in resume that match the job requisition"],
    "missingSkills": ["Key skills or requirements from the job description that seem weak or missing from the candidate's background"],
    "pros": ["Key strength 1 (e.g. 5+ yrs in distributed systems)", "Key strength 2", "Key strength 3"],
    "cons": ["Potential risk / gap 1 (e.g. limited cloud infrastructure experience)", "Potential gap 2"],
    "aiMatchScore": 88,
    "experienceYears": "Estimated years of professional experience (e.g. 5+ years)",
    "seniorityLevel": "Junior" | "Mid-Level" | "Senior" | "Lead / Staff" | "Executive",
    "recommendedAction": "Strong Match - Advance to Interview" | "Qualified - Conduct Recruiter Screen" | "Borderline - Review Gaps" | "Weak Fit - Archive",
    "suggestedQuestions": [
        "Tailored interview question 1 probing their resume gaps or past project scale",
        "Tailored interview question 2",
        "Tailored interview question 3"
    ]
}
`;

        const aiRes = await executeHireFlowAiPrompt({
            workspaceId,
            systemPrompt,
            userPrompt,
            model: "auto",
            temperature: 0.2,
            responseFormat: "json"
        });

        if (!aiRes.success || !aiRes.data) {
            throw new Error(aiRes.error || "FlowGenix returned empty evaluation data");
        }

        const parsed = aiRes.data;

        const updated = await prisma.candidate.update({
            where: { id: candidateId },
            data: {
                summary: parsed.summary || candidate.summary,
                skills: Array.isArray(parsed.skills) && parsed.skills.length ? parsed.skills : candidate.skills,
                aiMatchScore: Number(parsed.aiMatchScore) || candidate.aiMatchScore || 85,
                aiSummary: parsed.summary || candidate.aiSummary,
                parsedData: {
                    ...parsed,
                    aiProvider: aiRes.resolvedProvider,
                    aiModel: aiRes.resolvedModel,
                    aiLatencyMs: aiRes.latencyMs,
                    aiSource: aiRes.source,
                    parsedAt: new Date().toISOString()
                }
            }
        });

        const normalizedUpdated = {
            ...updated,
            aiInsights: {
                matchingScore: updated.aiMatchScore || parsed.aiMatchScore || 0,
                summary: updated.aiSummary || parsed.summary || updated.summary,
                pros: Array.isArray(parsed.pros) ? parsed.pros : [],
                cons: Array.isArray(parsed.cons) ? parsed.cons : [],
                skills: Array.isArray(parsed.skills) ? parsed.skills : updated.skills,
                matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
                missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
                seniorityLevel: parsed.seniorityLevel || "Mid-Level",
                recommendedAction: parsed.recommendedAction || "Under Evaluation",
                suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions : [],
                aiProvider: aiRes.resolvedProvider,
                aiModel: aiRes.resolvedModel,
                aiLatencyMs: aiRes.latencyMs
            }
        };

        return { 
            success: true, 
            data: normalizedUpdated,
            aiMeta: {
                resolvedModel: aiRes.resolvedModel,
                resolvedProvider: aiRes.resolvedProvider,
                latencyMs: aiRes.latencyMs,
                source: aiRes.source
            }
        };
    } catch (error) {
        console.error("[AI_PARSE_RESUME_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to parse resume" };
    }
}

/**
 * Send a WhatsApp Message to a Candidate
 */
export async function sendCandidateWhatsAppAction({ workspaceId, candidateId, text }) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        if (!text || !text.trim()) {
            return { success: false, error: "Message text is required" };
        }

        const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId }
        });

        if (!candidate || !candidate.phone) {
            return { success: false, error: "Candidate phone number not found" };
        }

        const cleanPhone = candidate.phone.replace(/[^\d]/g, '');
        if (cleanPhone.length < 10) {
            return { success: false, error: "Invalid candidate phone number" };
        }

        // 1. Resolve WhatsApp Credentials
        const defaultInfo = await getWhatsappDefault(workspaceId).catch(() => null);
        let credential = null;
        if (defaultInfo?.credentialId) {
            credential = await prisma.credentials.findUnique({ where: { id: defaultInfo.credentialId } }).catch(() => null);
        }

        if (!credential) {
            credential = await prisma.credentials.findFirst({
                where: {
                    OR: [
                        { workspaceId, platform: 'WHATSAPP_CLOUD', isDefault: true },
                        { userId, platform: 'WHATSAPP_CLOUD', isDefault: true },
                        { workspaceId, platform: 'WHATSAPP_CLOUD' },
                        { userId, platform: 'WHATSAPP_CLOUD' },
                    ]
                },
                orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }]
            });
        }

        if (!credential?.credentials) {
            return { success: false, error: "No active WhatsApp account configured in KonnectX" };
        }

        const creds = typeof credential.credentials === 'string'
            ? JSON.parse(credential.credentials)
            : credential.credentials;

        const accessToken = creds.accessToken
            ? (creds.accessToken.includes(':') ? symmetricDecrypt(creds.accessToken) : creds.accessToken)
            : null;
        const phoneNumberId = creds.phoneNumberId;

        if (!accessToken || !phoneNumberId) {
            return { success: false, error: "WhatsApp credentials incomplete" };
        }

        // 2. Dispatch message via Cloud API
        const sendRes = await cloudApi.sendTextMessage({
            phoneNumberId,
            accessToken,
            to: cleanPhone,
            text: text.trim()
        });

        const wamid = sendRes?.messages?.[0]?.id || `wamid_${Date.now()}`;

        // 3. Save message record in WhatsAppMessage table
        const savedMsg = await prisma.whatsAppMessage.create({
            data: {
                wamId: wamid,
                userId: credential.userId || userId,
                from: phoneNumberId,
                to: cleanPhone,
                type: 'text',
                body: text.trim(),
                status: 'SENT',
                direction: 'OUTBOUND',
                timestamp: new Date()
            }
        });

        return { success: true, message: "WhatsApp message sent successfully", data: savedMsg };
    } catch (error) {
        console.error("[SEND_CANDIDATE_WHATSAPP_ERROR]", error);
        return { success: false, error: error.message || "Failed to send WhatsApp message" };
    }
}

/**
 * Fetch All Communications (WhatsApp & Email) for a candidate
 */
export async function getCandidateCommunicationsAction({ workspaceId, candidateId }) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId }
        });

        if (!candidate) return { success: false, error: "Candidate not found", communications: [] };

        const cleanPhone = candidate.phone ? candidate.phone.replace(/[^\d]/g, '') : null;

        let whatsappMessages = [];
        if (cleanPhone) {
            whatsappMessages = await prisma.whatsAppMessage.findMany({
                where: {
                    OR: [
                        { to: { contains: cleanPhone.slice(-10) } },
                        { from: { contains: cleanPhone.slice(-10) } }
                    ]
                },
                orderBy: { timestamp: 'desc' },
                take: 50
            });
        }

        const communications = whatsappMessages.map(msg => ({
            id: msg.id,
            channel: 'WHATSAPP',
            direction: msg.direction,
            body: msg.body,
            status: msg.status,
            date: new Date(msg.timestamp).toLocaleString(),
            rawDate: msg.timestamp
        }));

        return { success: true, communications };
    } catch (error) {
        console.error("[GET_CANDIDATE_COMMUNICATIONS_ERROR]", error);
        return { success: false, error: error.message, communications: [] };
    }
}

/**
 * AI-Powered Tailored Interview Questions Generator via FlowGenix
 */
export async function generateAiInterviewQuestionsAction({ workspaceId, candidateId, jobId }) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId },
            include: { applications: { include: { job: true } } }
        });

        if (!candidate) return { success: false, error: "Candidate not found" };

        const job = jobId
            ? await prisma.job.findUnique({ where: { id: jobId } })
            : candidate.applications?.[0]?.job;

        const systemPrompt = `You are a Principal Hiring Manager and Technical Recruiter.
Generate 5 tailored, high-signal interview questions for this specific candidate applying for this job opening.
Return JSON strictly following the requested schema without markdown backticks.`;

        const userPrompt = `
Candidate Information:
- Name: ${candidate.name}
- Skills: ${(candidate.skills || []).join(', ')}
- Summary: ${candidate.summary || candidate.aiSummary || 'Not provided'}
- Parsed Data: ${JSON.stringify(candidate.parsedData || {})}

Target Job Requisition:
- Title: ${job?.title || 'Open Position'}
- Description: ${job?.description || 'Standard technical role'}
- Requirements: ${(job?.requirements || []).join(', ')}

Return JSON strictly following this schema:
{
    "questions": [
        {
            "category": "Technical Skill" | "System Design" | "Behavioral / Leadership" | "Problem Solving" | "Resume Gap / Verification",
            "question": "Clear and detailed question text",
            "objective": "What specific competency or signal this question probes",
            "expectedSignals": "What a strong answer vs weak answer sounds like",
            "difficulty": "Easy" | "Medium" | "Hard"
        }
    ]
}
`;

        const aiRes = await executeHireFlowAiPrompt({
            workspaceId,
            systemPrompt,
            userPrompt,
            model: "auto/smart",
            temperature: 0.3,
            responseFormat: "json"
        });

        if (!aiRes.success || !aiRes.data) {
            throw new Error(aiRes.error || "Failed to generate questions via FlowGenix");
        }

        return { 
            success: true, 
            questions: aiRes.data.questions || [],
            aiMeta: {
                resolvedModel: aiRes.resolvedModel,
                resolvedProvider: aiRes.resolvedProvider,
                latencyMs: aiRes.latencyMs
            }
        };
    } catch (error) {
        console.error("[GENERATE_AI_INTERVIEW_QUESTIONS_ERROR]", error);
        return { success: false, error: error.message || "Failed to generate interview questions" };
    }
}

/**
 * Interactive Candidate Copilot Chat Action powered by FlowGenix
 */
export async function chatCandidateCopilotAction(workspaceId, { candidateId, messages, model = "auto/smart" }) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId },
            include: {
                applications: {
                    where: { workspaceId },
                    include: { job: { include: { department: true } } }
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

        if (!candidate) return { success: false, error: "Candidate not found" };

        const targetJob = candidate.applications?.[0]?.job;

        const copilotRes = await executeCandidateCopilotChat({
            workspaceId,
            candidate,
            job: targetJob,
            messages,
            model
        });

        if (!copilotRes.success) {
            throw new Error(copilotRes.error || "Failed to get copilot response");
        }

        return {
            success: true,
            message: {
                role: "assistant",
                content: copilotRes.content
            },
            aiMeta: {
                resolvedModel: copilotRes.resolvedModel,
                resolvedProvider: copilotRes.resolvedProvider,
                latencyMs: copilotRes.latencyMs,
                source: copilotRes.source
            }
        };
    } catch (error) {
        console.error("[CHAT_CANDIDATE_COPILOT_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to chat with candidate copilot" };
    }
}

/**
 * Submit structured candidate scorecard review
 */
export async function submitScorecardAction(workspaceId, { candidateId, applicationId, stage, score, feedback, recommendation, attributes }) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        if (!candidateId) {
            return { success: false, error: "Candidate ID is required" };
        }

        // Find active application if not passed
        let targetAppId = applicationId;
        if (!targetAppId) {
            const app = await prisma.jobApplication.findFirst({
                where: { candidateId, workspaceId }
            });
            targetAppId = app?.id || null;
        }

        const numericScore = typeof score === 'number' ? score : parseFloat(score) || 3.0;

        const scorecard = await prisma.scorecard.create({
            data: {
                candidateId,
                applicationId: targetAppId,
                interviewerId: userId,
                stage: stage || "INTERVIEW",
                score: numericScore,
                feedback: feedback || "",
                recommendation: recommendation || "maybe",
                attributes: attributes || {}
            },
            include: {
                interviewer: {
                    select: { id: true, displayName: true, username: true, email: true, avatar: true }
                }
            }
        });

        // Compute new average rating
        const allCards = await prisma.scorecard.findMany({
            where: { candidateId },
            select: { score: true }
        });
        if (allCards.length > 0) {
            const avg = allCards.reduce((acc, c) => acc + (c.score || 0), 0) / allCards.length;
            await prisma.candidate.update({
                where: { id: candidateId },
                data: { rating: parseFloat(avg.toFixed(1)) }
            }).catch(() => null);
        }

        // Add an ATS audit note
        await prisma.atsNote.create({
            data: {
                candidateId,
                applicationId: targetAppId,
                userId,
                text: `[SCORECARD SUBMITTED] Stage: ${stage || 'Interview'} | Rating: ${numericScore}/5 | Recommendation: ${recommendation?.toUpperCase() || 'EVALUATED'}\nFeedback: ${feedback ? feedback.substring(0, 180) + '...' : 'No written notes.'}`,
                isPrivate: false
            }
        }).catch(() => null);

        return { success: true, message: "Scorecard submitted successfully", data: scorecard };
    } catch (error) {
        console.error("[SUBMIT_SCORECARD_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to submit scorecard" };
    }
}

/**
 * Bulk Update or Auto-Evaluate Candidates AI Match Score (for unrated or selected candidates)
 */
export async function bulkUpdateCandidatesAiScoreAction(workspaceId, { candidateIds, mode, score }) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        // If candidateIds is not passed or empty, target all candidates in this workspace without an AI score
        let targetIds = Array.isArray(candidateIds) && candidateIds.length > 0 ? candidateIds : null;
        if (!targetIds) {
            const unscored = await prisma.candidate.findMany({
                where: {
                    workspaceId,
                    OR: [
                        { aiMatchScore: null },
                        { aiMatchScore: 0 }
                    ]
                },
                select: { id: true }
            });
            targetIds = unscored.map(c => c.id);
        }

        if (targetIds.length === 0) {
            return { success: true, count: 0, message: "No unrated candidates found" };
        }

        if (mode === 'manual') {
            const numericScore = Math.min(100, Math.max(0, Math.round(Number(score) || 75)));
            const result = await prisma.candidate.updateMany({
                where: {
                    id: { in: targetIds },
                    workspaceId
                },
                data: {
                    aiMatchScore: numericScore
                }
            });
            return { success: true, count: result.count, message: `Updated AI score to ${numericScore}% for ${result.count} candidate(s)` };
        }

        // If mode === 'ai', evaluate each candidate with FlowGenix AI
        let successful = 0;
        const errors = [];

        for (const cid of targetIds) {
            try {
                const evalRes = await aiParseResumeAction(workspaceId, { candidateId: cid });
                if (evalRes.success) {
                    successful++;
                } else {
                    errors.push({ candidateId: cid, error: evalRes.error });
                }
            } catch (err) {
                errors.push({ candidateId: cid, error: err.message });
            }
        }

        return {
            success: true,
            count: successful,
            total: targetIds.length,
            errors,
            message: `FlowGenix evaluated ${successful} of ${targetIds.length} candidate(s)`
        };
    } catch (error) {
        console.error("[BULK_UPDATE_AI_SCORE_ERROR]", error);
        return { success: false, error: error.message || "Failed to bulk update AI scores" };
    }
}

/**
 * Generate AI-tailored interview kit addressing candidate gaps and resume background
 */
export async function generateCandidateInterviewKitAction(workspaceId, {
    candidateId,
    round = "Round 2: Competency & Objection Handling",
    difficulty = "In-Depth",
    focusAreas = [],
    customInstructions = ""
}) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        if (!candidateId) {
            return { success: false, error: "Candidate ID is required" };
        }

        const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId },
            include: {
                scorecards: {
                    include: {
                        interviewer: {
                            select: { id: true, displayName: true, username: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                applications: {
                    where: { workspaceId },
                    include: {
                        job: {
                            include: { category: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!candidate) {
            return { success: false, error: "Candidate not found" };
        }

        const targetJob = candidate.applications?.[0]?.job || null;

        // Auto-extract weaknesses from past scorecards
        const detectedWeaknesses = [];
        const seenWeaknessKeys = new Set();

        if (Array.isArray(candidate.scorecards)) {
            for (const sc of candidate.scorecards) {
                // If scorecard overall score is low (<= 3.0 / 5)
                if (sc.score != null && sc.score <= 3.0 && !seenWeaknessKeys.has('overall_' + sc.id)) {
                    detectedWeaknesses.push({
                        id: `sc_low_${sc.id}`,
                        label: `${sc.stage || 'Interview'} Overall Rating`,
                        score: sc.score,
                        feedback: sc.feedback ? sc.feedback.slice(0, 180) : "Underperformed relative to team benchmark"
                    });
                    seenWeaknessKeys.add('overall_' + sc.id);
                }

                // Check competency attributes (e.g., ratings in 7 criteria)
                if (sc.attributes && typeof sc.attributes === 'object') {
                    for (const [key, val] of Object.entries(sc.attributes)) {
                        const numVal = typeof val === 'number' ? val : parseFloat(val);
                        if (!isNaN(numVal) && numVal <= 3.0 && !seenWeaknessKeys.has(key)) {
                            seenWeaknessKeys.add(key);
                            const readableLabel = key
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, l => l.toUpperCase());
                            detectedWeaknesses.push({
                                id: key,
                                label: readableLabel,
                                score: numVal,
                                feedback: `Scored ${numVal}/5 in previous round`
                            });
                        }
                    }
                }
            }
        }

        // Call FlowGenix AI Interview Kit generator
        const genRes = await generateInterviewKitAI({
            workspaceId,
            candidate,
            job: targetJob,
            round,
            difficulty,
            weaknesses: detectedWeaknesses,
            focusAreas,
            customInstructions
        });

        if (!genRes.success || !genRes.data) {
            return {
                success: false,
                error: genRes.error || "Failed to generate interview kit. Please verify FlowGenix model availability."
            };
        }

        const kitData = genRes.data;
        const kitId = `kit_${Date.now()}`;
        const enrichedKit = {
            ...kitData,
            id: kitId,
            createdAt: new Date().toISOString(),
            createdBy: session.user.displayName || session.user.username || "Interviewer",
            round,
            difficulty,
            weaknessesAnalyzed: detectedWeaknesses
        };

        // Persist kit into candidate.parsedData
        const currentParsed = (candidate.parsedData && typeof candidate.parsedData === 'object' && !Array.isArray(candidate.parsedData))
            ? candidate.parsedData
            : {};
        const existingKits = Array.isArray(currentParsed.interviewKits) ? currentParsed.interviewKits : [];

        const updatedParsed = {
            ...currentParsed,
            latestInterviewKit: enrichedKit,
            interviewKits: [enrichedKit, ...existingKits.filter(k => k.id !== kitId)].slice(0, 10)
        };

        await prisma.candidate.update({
            where: { id: candidateId },
            data: { parsedData: updatedParsed }
        });

        // Add ATS Note for activity logging
        await prisma.atsNote.create({
            data: {
                candidateId,
                userId: session.user.userId || session.user.id,
                applicationId: candidate.applications?.[0]?.id || null,
                text: `Generated AI Interview Kit for "${round}" (${difficulty} rigor, ${kitData.questions?.length || 0} questions + practical role-play).`,
                isPrivate: false
            }
        }).catch(err => console.warn("[ATS_NOTE_LOG_WARN]", err.message));

        return {
            success: true,
            kit: enrichedKit,
            aiMeta: {
                resolvedModel: genRes.resolvedModel,
                resolvedProvider: genRes.resolvedProvider,
                latencyMs: genRes.latencyMs,
                source: genRes.source
            }
        };
    } catch (error) {
        console.error("[GENERATE_INTERVIEW_KIT_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to generate interview kit" };
    }
}

/**
 * Save evaluation results from an AI Interview Kit into an official Scorecard
 */
export async function saveInterviewKitScorecardAction(workspaceId, {
    candidateId,
    kitId,
    round = "Interview Round",
    questionRatings = {},
    rolePlayRating = null,
    overallScore = null,
    feedback = "",
    recommendation = "yes"
}) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        if (!candidateId) {
            return { success: false, error: "Candidate ID is required" };
        }

        // Calculate average score if not explicitly set
        let finalScore = overallScore;
        if (finalScore == null) {
            const numericScores = [];
            Object.values(questionRatings || {}).forEach(val => {
                const num = parseFloat(val);
                if (!isNaN(num) && num > 0) numericScores.push(num);
            });
            if (rolePlayRating != null && !isNaN(parseFloat(rolePlayRating))) {
                numericScores.push(parseFloat(rolePlayRating));
            }
            if (numericScores.length > 0) {
                finalScore = parseFloat((numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(1));
            } else {
                finalScore = 3.0;
            }
        }

        // Find active job application
        const app = await prisma.jobApplication.findFirst({
            where: { candidateId, workspaceId },
            orderBy: { createdAt: 'desc' }
        });

        const attributes = {
            source: "ai_interview_kit",
            kitId: kitId || null,
            round,
            questionRatings,
            rolePlayRating,
            evaluatedAt: new Date().toISOString()
        };

        const scorecard = await prisma.scorecard.create({
            data: {
                candidateId,
                applicationId: app?.id || null,
                interviewerId: userId,
                stage: round || "INTERVIEW",
                score: finalScore,
                feedback: feedback || `Evaluated via AI Interview Kit (${round}). Overall score: ${finalScore}/5.`,
                recommendation: recommendation || "yes",
                attributes
            },
            include: {
                interviewer: {
                    select: { id: true, displayName: true, username: true, email: true, avatar: true }
                }
            }
        });

        // Update overall candidate rating average
        const allCards = await prisma.scorecard.findMany({
            where: { candidateId },
            select: { score: true }
        });
        if (allCards.length > 0) {
            const avg = allCards.reduce((acc, c) => acc + (c.score || 0), 0) / allCards.length;
            await prisma.candidate.update({
                where: { id: candidateId },
                data: { rating: parseFloat(avg.toFixed(1)) }
            }).catch(() => null);
        }

        // Log note
        await prisma.atsNote.create({
            data: {
                candidateId,
                userId,
                applicationId: app?.id || null,
                text: `Submitted scorecard from AI Interview Kit (${round}) with rating ${finalScore}/5. Recommendation: ${recommendation.toUpperCase()}.`,
                isPrivate: false
            }
        }).catch(err => console.warn("[ATS_NOTE_LOG_WARN]", err.message));

        return {
            success: true,
            scorecard,
            message: `Scorecard saved successfully with rating ${finalScore}/5!`
        };
    } catch (error) {
        console.error("[SAVE_INTERVIEW_KIT_SCORECARD_ERROR]", error);
        return { success: false, error: error.message || "Failed to save interview kit scorecard" };
    }
}



