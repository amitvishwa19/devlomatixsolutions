'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

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
 * Update Application Stage / Status (Kanban drag-and-drop)
 */
export async function updateApplicationStageAction(workspaceId, applicationId, stage, status) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const application = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: {
                stage: stage !== undefined ? stage : undefined,
                status: status !== undefined ? status : undefined
            }
        });

        return { success: true, data: application };
    } catch (error) {
        console.error("[UPDATE_APPLICATION_STAGE_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to update stage" };
    }
}
