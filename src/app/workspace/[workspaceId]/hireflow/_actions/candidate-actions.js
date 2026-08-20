'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { getWhatsappDefault } from "@/lib/whatsapp-default";
import * as cloudApi from '../../konnectx/_lib/whatsapp-cloud-api';
import { symmetricDecrypt } from "@/lib/encryption";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
                    include: { job: true }
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
                        job: true,
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

        return { success: true, data: candidate };
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
 * Create a scorecard
 */
export async function createCandidateScorecardAction(workspaceId, data) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const { candidateId, applicationId, interviewId, scores, feedback, overallScore, recommendation } = data;

        const scorecard = await prisma.scorecard.create({
            data: {
                candidateId,
                applicationId,
                attributes: scores,
                feedback,
                score: Number(overallScore) || 0,
                recommendation,
                interviewerId: userId
            },
            include: { interviewer: true }
        });

        return { success: true, data: scorecard };
    } catch (error) {
        console.error("[CREATE_CANDIDATE_SCORECARD_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to create scorecard" };
    }
}

/**
 * AI Parse Resume
 */
export async function aiParseResumeAction(workspaceId, { candidateId, resumeText }) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId }
        });

        if (!candidate) return { success: false, error: "Candidate not found" };

        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMENI_API_KEY;
        if (!apiKey) return { success: false, error: "Gemini API key is missing" };

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
            You are an expert recruitment AI. Analyze the following candidate and resume context to extract structured information.
            Candidate Name: ${candidate.name}
            Candidate Email: ${candidate.email}
            Candidate Phone: ${candidate.phone}
            Resume Text: ${resumeText || candidate.summary || 'Senior engineer with proven experience.'}

            Return JSON strictly with:
            {
                "summary": "Short professional summary",
                "skills": ["Array of skills"],
                "pros": ["Key strength 1", "Key strength 2"],
                "cons": ["Potential gap 1", "Potential gap 2"],
                "aiMatchScore": 85
            }
        `;

        const result = await model.generateContent(prompt);
        const parsed = JSON.parse(result.response.text());

        const updated = await prisma.candidate.update({
            where: { id: candidateId },
            data: {
                summary: parsed.summary || candidate.summary,
                skills: parsed.skills?.length ? parsed.skills : candidate.skills,
                aiMatchScore: parsed.aiMatchScore || 85,
                aiSummary: parsed.summary || candidate.aiSummary,
                parsedData: parsed
            }
        });

        return { success: true, data: updated };
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
 * AI-Powered Tailored Interview Questions Generator
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

        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMENI_API_KEY;
        if (!apiKey) {
            return { success: false, error: "Gemini API key is not configured" };
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
            You are a Principal Hiring Manager and Technical Recruiter.
            Generate 5 tailored, high-signal interview questions for this specific candidate applying for this job opening.

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

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);

        return { success: true, questions: parsed.questions || [] };
    } catch (error) {
        console.error("[GENERATE_AI_INTERVIEW_QUESTIONS_ERROR]", error);
        return { success: false, error: error.message || "Failed to generate interview questions" };
    }
}
