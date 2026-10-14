'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

/**
 * Get all Jobs for a workspace
 */
export async function getJobsAction(workspaceId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const jobs = await prisma.job.findMany({
            where: { workspaceId },
            include: {
                category: true,
                _count: {
                    select: { applications: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, data: jobs };
    } catch (error) {
        console.error("[GET_JOBS_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch jobs" };
    }
}

/**
 * Get single Job by ID
 */
export async function getJobByIdAction(workspaceId, jobId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: {
                applications: {
                    include: { candidate: true }
                },
                category: true
            }
        });

        if (!job) return { success: false, error: "Job not found" };

        return { success: true, data: job };
    } catch (error) {
        console.error("[GET_JOB_BY_ID_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch job" };
    }
}

/**
 * Create a new Job
 */
export async function createJobAction(workspaceId, data) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const { title, description, department, categoryId, location, type, salaryRange, status } = data;

        const job = await prisma.job.create({
            data: {
                title,
                description,
                department: department || null,
                categoryId: categoryId || null,
                location: location || null,
                type: type || "FULL_TIME",
                salaryRange: salaryRange || null,
                status: status || "OPEN",
                workspaceId,
                userId
            }
        });

        return { success: true, data: job };
    } catch (error) {
        console.error("[CREATE_JOB_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to create job" };
    }
}

/**
 * Update an existing Job
 */
export async function updateJobAction(workspaceId, jobId, data) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const { title, description, department, categoryId, location, type, salaryRange, status } = data;

        const job = await prisma.job.update({
            where: { id: jobId },
            data: {
                title: title !== undefined ? title : undefined,
                description: description !== undefined ? description : undefined,
                department: department !== undefined ? department : undefined,
                categoryId: categoryId !== undefined ? categoryId : undefined,
                location: location !== undefined ? location : undefined,
                type: type !== undefined ? type : undefined,
                salaryRange: salaryRange !== undefined ? salaryRange : undefined,
                status: status !== undefined ? status : undefined
            }
        });

        return { success: true, data: job };
    } catch (error) {
        console.error("[UPDATE_JOB_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to update job" };
    }
}

/**
 * Delete a Job
 */
export async function deleteJobAction(workspaceId, jobId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        await prisma.job.delete({
            where: { id: jobId }
        });

        return { success: true, message: "Job deleted successfully" };
    } catch (error) {
        console.error("[DELETE_JOB_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete job" };
    }
}

/**
 * AI Job Requisition & Evaluation Rubric Generator powered by FlowGenix
 */
export async function generateAiJobRequisitionAction(workspaceId, { title, department, level, notes }) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const { executeHireFlowAiPrompt } = await import("../_lib/flowgenix-client");

        const systemPrompt = `You are a Principal Talent Acquisition Architect and Head of People.
Create a modern, high-converting job requisition and structured scorecard rubric based on the provided role parameters.
Return valid JSON strictly following the requested schema without markdown backticks.`;

        const userPrompt = `
Role Details:
- Target Job Title: ${title || 'Software Engineer'}
- Department / Team: ${department || 'Engineering'}
- Seniority Level: ${level || 'Mid / Senior'}
- Notes / Tech Stack / Culture: ${notes || 'Fast-paced high-growth technology company'}

Generate valid JSON matching this schema:
{
    "description": "Engaging 3-4 paragraph overview of the role, team impact, and why top talent should join.",
    "responsibilities": [
        "Key responsibility 1",
        "Key responsibility 2",
        "Key responsibility 3",
        "Key responsibility 4"
    ],
    "requirements": [
        "Core requirement 1 (e.g. 4+ years in modern distributed backend)",
        "Core requirement 2",
        "Core requirement 3",
        "Core requirement 4"
    ],
    "niceToHave": [
        "Bonus skill 1",
        "Bonus skill 2"
    ],
    "scorecardRubric": [
        { "competency": "Technical Competency", "weight": 35, "criteria": "Demonstrates mastery of core tech stack and system design" },
        { "competency": "Problem Solving & Execution", "weight": 25, "criteria": "Breaks down ambiguity, writes clean, maintainable code" },
        { "competency": "Communication & Collaboration", "weight": 20, "criteria": "Clear cross-functional communicator, gives constructive feedback" },
        { "competency": "Culture & Leadership", "weight": 20, "criteria": "Owner mindset, high curiosity, proactive accountability" }
    ],
    "knockoutQuestions": [
        "Knockout application question 1 (e.g. Do you have at least 3 years of hands-on experience with TypeScript?)",
        "Knockout application question 2"
    ]
}
`;

        const res = await executeHireFlowAiPrompt({
            workspaceId,
            systemPrompt,
            userPrompt,
            model: "auto/smart",
            temperature: 0.3,
            responseFormat: "json"
        });

        if (!res.success || !res.data) {
            throw new Error(res.error || "Failed to generate job specification via FlowGenix");
        }

        return {
            success: true,
            data: res.data,
            aiMeta: {
                resolvedModel: res.resolvedModel,
                resolvedProvider: res.resolvedProvider,
                latencyMs: res.latencyMs
            }
        };
    } catch (error) {
        console.error("[GENERATE_AI_JOB_REQUISITION_ERROR]", error);
        return { success: false, error: error.message || "Failed to generate requisition" };
    }
}

