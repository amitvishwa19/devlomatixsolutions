"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { executeWorkflow } from "../../_lib/workflow-engine";

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
    if (!userId) throw new Error("userId is required to create a workflow");
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
export async function getOrCreateMainWorkflow(workspaceId, userId) {
    try {
        // Try to find an existing workflow for this workspace
        // We look for the oldest one or one named "Main Workflow"
        let workflow = await db.workflow.findFirst({
            where: { workspaceId, isTemplate: false },
            orderBy: { createdAt: 'asc' }
        });

        if (!workflow) {
            // Create a default main workflow if none exists
            workflow = await db.workflow.create({
                data: {
                    name: "Main Workflow",
                    description: "Primary workspace workflow",
                    workspaceId,
                    userId,
                    nodes: [],
                    edges: [],
                }
            });
            revalidatePath(`/workspace/${workspaceId}/flowgenix`);
        }

        return workflow;
    } catch (error) {
        console.error("getOrCreateMainWorkflow error:", error);
        throw error;
    }
}

export async function saveWorkflowAction({ id, name, nodes, edges, workspaceId, viewport }) {
    try {
        const workflow = await db.workflow.update({
            where: { id },
            data: {
                name,
                nodes,
                edges,
                viewport,
            }
        });
        revalidatePath(`/workspace/${workspaceId}/flowgenix`);
        return { data: workflow };
    } catch (error) {
        console.error("saveWorkflowAction error:", error);
        return { error: "Failed to save workflow" };
    }
}

export async function updateScheduleAction({ workflowId, cron, enabled }) {
    try {
        const workflow = await db.workflow.update({
            where: { id: workflowId },
            data: {
                cronExpression: cron,
                scheduleEnabled: enabled
            }
        });
        return { data: workflow };
    } catch (error) {
        console.error("updateScheduleAction error:", error);
        return { error: "Failed to update schedule" };
    }
}

export async function executeWorkflowAction({ workspaceId, userId, workflowId, chatInput }) {
    try {
        const executionId = await executeWorkflow(workspaceId, userId, workflowId, "manual", { prompt: chatInput });
        const logs = await db.workflowRunLog.findMany({
            where: { runId: executionId },
            orderBy: { createdAt: 'asc' }
        });

        return {
            executionId,
            results: logs.map(l => ({
                nodeId: l.nodeId,
                label: l.nodeLabel,
                status: l.status,
                output: l.data
            }))
        };
    } catch (error) {
        console.error("executeWorkflowAction error:", error);
        return { error: error.message || "Execution failed" };
    }
}
