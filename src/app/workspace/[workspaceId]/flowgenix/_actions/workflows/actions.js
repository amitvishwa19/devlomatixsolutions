"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function listWorkflows(workspaceId, { templates = false } = {}) {
    try {
        return await db.workflow.findMany({
            where: { 
                workspaceId,
                isTemplate: templates 
            },
            orderBy: { updatedAt: 'desc' }
        });
    } catch (error) {
        console.error("listWorkflows error:", error);
        return [];
    }
}

export async function createWorkflow(workspaceId, userId, data) {
    try {
        const workflow = await db.workflow.create({
            data: {
                ...data,
                workspaceId,
                userId
            }
        });
        revalidatePath(`/workspace/${workspaceId}/flowgenix`);
        return workflow;
    } catch (error) {
        console.error("createWorkflow error:", error);
        throw error;
    }
}

export async function deleteWorkflow(workspaceId, workflowId) {
    try {
        await db.workflow.delete({
            where: { id: workflowId }
        });
        revalidatePath(`/workspace/${workspaceId}/flowgenix`);
        return { success: true };
    } catch (error) {
        console.error("deleteWorkflow error:", error);
        throw error;
    }
}

export async function updateWorkflow(workspaceId, workflowId, data) {
    try {
        const workflow = await db.workflow.update({
            where: { id: workflowId },
            data
        });
        revalidatePath(`/workspace/${workspaceId}/flowgenix`);
        return workflow;
    } catch (error) {
        console.error("updateWorkflow error:", error);
        throw error;
    }
}
