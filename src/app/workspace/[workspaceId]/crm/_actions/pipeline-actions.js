'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess, getAuthSession } from "@/lib/auth-utils";
import { getValidUserId } from "./auth-helper";

/**
 * Default stages for auto-provisioned pipelines
 */
const DEFAULT_STAGES = [
    { name: "Lead In", order: 0, probability: 10, color: "#94a3b8", isWon: false, isLost: false },
    { name: "Contact Made", order: 1, probability: 25, color: "#38bdf8", isWon: false, isLost: false },
    { name: "Needs Discovery", order: 2, probability: 40, color: "#818cf8", isWon: false, isLost: false },
    { name: "Proposal Sent", order: 3, probability: 60, color: "#f59e0b", isWon: false, isLost: false },
    { name: "Negotiation", order: 4, probability: 80, color: "#ec4899", isWon: false, isLost: false },
    { name: "Closed Won", order: 5, probability: 100, color: "#10b981", isWon: true, isLost: false },
    { name: "Closed Lost", order: 6, probability: 0, color: "#ef4444", isWon: false, isLost: true },
];

/**
 * Helper to ensure at least one default pipeline exists
 */
export async function ensureDefaultPipeline(workspaceId, userId = null) {
    let pipeline = await prisma.pipeline.findFirst({
        where: { workspaceId },
        include: { stages: { orderBy: { order: 'asc' } } }
    });

    if (!pipeline) {
        const validUserId = userId || (await getValidUserId(workspaceId));
        pipeline = await prisma.pipeline.create({
            data: {
                workspaceId,
                userId: validUserId,
                name: "Standard Sales Pipeline",
                isDefault: true,
                color: "#3b82f6",
                stages: {
                    create: DEFAULT_STAGES
                }
            },
            include: { stages: { orderBy: { order: 'asc' } } }
        });
    }

    return pipeline;
}

/**
 * Get all pipelines for a workspace
 */
export async function getPipelinesAction(workspaceId) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        // Auto-provision default pipeline if none exists
        await ensureDefaultPipeline(workspaceId, userId);

        const pipelines = await prisma.pipeline.findMany({
            where: { workspaceId },
            include: {
                stages: { orderBy: { order: 'asc' } },
                _count: { select: { deals: true } }
            },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }]
        });

        return { success: true, data: pipelines };
    } catch (error) {
        console.error("[GET_PIPELINES_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch pipelines" };
    }
}

/**
 * Get a specific pipeline with its stages and deals
 */
export async function getPipelineWithStagesAction(workspaceId, pipelineId = null) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session?.user?.id || "anonymous";

        let pipeline;
        if (pipelineId) {
            pipeline = await prisma.pipeline.findFirst({
                where: { id: pipelineId, workspaceId },
                include: {
                    stages: {
                        orderBy: { order: 'asc' },
                        include: {
                            deals: {
                                include: {
                                    contact: true,
                                    account: true,
                                    owner: {
                                        select: { id: true, displayName: true, email: true, avatar: true }
                                    }
                                },
                                orderBy: { updatedAt: 'desc' }
                            }
                        }
                    }
                }
            });
        }

        if (!pipeline) {
            const defaultPipeline = await ensureDefaultPipeline(workspaceId, userId);
            pipeline = await prisma.pipeline.findUnique({
                where: { id: defaultPipeline.id },
                include: {
                    stages: {
                        orderBy: { order: 'asc' },
                        include: {
                            deals: {
                                include: {
                                    contact: true,
                                    account: true,
                                    owner: {
                                        select: { id: true, displayName: true, email: true, avatar: true }
                                    }
                                },
                                orderBy: { updatedAt: 'desc' }
                            }
                        }
                    }
                }
            });
        }

        return { success: true, data: pipeline };
    } catch (error) {
        console.error("[GET_PIPELINE_STAGES_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch pipeline stages" };
    }
}

/**
 * Create a new pipeline with customizable stages
 */
export async function createPipelineAction(workspaceId, data) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        const { name, description, color, stages } = data;

        if (!name?.trim()) {
            return { success: false, error: "Pipeline name is required" };
        }

        const stageData = (stages && stages.length > 0)
            ? stages.map((s, idx) => ({
                name: s.name,
                order: idx,
                probability: typeof s.probability === 'number' ? s.probability : 50,
                color: s.color || "#3b82f6",
                isWon: !!s.isWon,
                isLost: !!s.isLost
            }))
            : DEFAULT_STAGES;

        const pipeline = await prisma.pipeline.create({
            data: {
                workspaceId,
                userId,
                name: name.trim(),
                description: description || null,
                color: color || "#3b82f6",
                stages: {
                    create: stageData
                }
            },
            include: { stages: { orderBy: { order: 'asc' } } }
        });

        return { success: true, data: pipeline };
    } catch (error) {
        console.error("[CREATE_PIPELINE_ERROR]", error);
        return { success: false, error: error.message || "Failed to create pipeline" };
    }
}

/**
 * Update a pipeline and its stage definitions
 */
export async function updatePipelineAction(workspaceId, pipelineId, data) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const { name, description, color, isDefault } = data;

        if (isDefault) {
            // Unset current default
            await prisma.pipeline.updateMany({
                where: { workspaceId, isDefault: true },
                data: { isDefault: false }
            });
        }

        const pipeline = await prisma.pipeline.update({
            where: { id: pipelineId },
            data: {
                name: name ? name.trim() : undefined,
                description,
                color,
                isDefault
            },
            include: { stages: { orderBy: { order: 'asc' } } }
        });

        return { success: true, data: pipeline };
    } catch (error) {
        console.error("[UPDATE_PIPELINE_ERROR]", error);
        return { success: false, error: error.message || "Failed to update pipeline" };
    }
}

/**
 * Delete a pipeline
 */
export async function deletePipelineAction(workspaceId, pipelineId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const count = await prisma.pipeline.count({ where: { workspaceId } });
        if (count <= 1) {
            return { success: false, error: "Cannot delete the only pipeline in the workspace." };
        }

        await prisma.pipeline.delete({
            where: { id: pipelineId }
        });

        return { success: true };
    } catch (error) {
        console.error("[DELETE_PIPELINE_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete pipeline" };
    }
}

/**
 * Add a new stage to a pipeline
 */
export async function createDealStageAction(workspaceId, pipelineId, data) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const { name, probability = 50, color = "#3b82f6", isWon = false, isLost = false } = data;

        if (!name?.trim()) {
            return { success: false, error: "Stage name is required" };
        }

        const stagesCount = await prisma.dealStage.count({ where: { pipelineId } });

        const stage = await prisma.dealStage.create({
            data: {
                pipelineId,
                name: name.trim(),
                order: stagesCount,
                probability: parseInt(probability) || 50,
                color,
                isWon,
                isLost
            }
        });

        return { success: true, data: stage };
    } catch (error) {
        console.error("[CREATE_DEAL_STAGE_ERROR]", error);
        return { success: false, error: error.message || "Failed to create deal stage" };
    }
}

/**
 * Update an existing deal stage
 */
export async function updateDealStageDetailsAction(workspaceId, stageId, data) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const { name, probability, color, isWon, isLost } = data;

        const stage = await prisma.dealStage.update({
            where: { id: stageId },
            data: {
                name: name ? name.trim() : undefined,
                probability: probability !== undefined ? parseInt(probability) : undefined,
                color,
                isWon,
                isLost
            }
        });

        return { success: true, data: stage };
    } catch (error) {
        console.error("[UPDATE_DEAL_STAGE_DETAILS_ERROR]", error);
        return { success: false, error: error.message || "Failed to update deal stage" };
    }
}

/**
 * Delete a deal stage
 */
export async function deleteDealStageAction(workspaceId, stageId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const dealsCount = await prisma.deal.count({ where: { stageId } });
        if (dealsCount > 0) {
            return {
                success: false,
                error: `Cannot delete stage with ${dealsCount} active deals. Move deals to another stage first.`
            };
        }

        await prisma.dealStage.delete({
            where: { id: stageId }
        });

        return { success: true };
    } catch (error) {
        console.error("[DELETE_DEAL_STAGE_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete stage" };
    }
}

