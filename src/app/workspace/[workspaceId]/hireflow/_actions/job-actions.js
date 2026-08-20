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
