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

export async function executeWorkflowAction({ workflowId, nodes, edges, chatInput }) {
    try {
        // simulation fallback
        return {
            results: nodes.map(n => ({
                nodeId: n.id,
                nodeType: n.data?.type || 'unknown',
                label: n.data?.label || 'Node',
                status: "success",
                input: chatInput ? { chatInput } : {},
                output: { 
                    message: `Processed by ${n.data?.label}`,
                    timestamp: new Date().toISOString(),
                    data: n.data?.config || {}
                },
                duration: Math.floor(Math.random() * 500) + 100,
                startTime: new Date().toISOString()
            }))
        };
    } catch (error) {
        console.error("executeWorkflowAction error:", error);
        return { error: "Execution failed" };
    }
}
