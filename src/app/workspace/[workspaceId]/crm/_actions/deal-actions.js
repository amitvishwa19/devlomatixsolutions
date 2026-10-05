'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess, getAuthSession } from "@/lib/auth-utils";
import { getValidUserId } from "./auth-helper";
import { triggerCrmWorkflowAction } from "./crm-automation-actions";

/**
 * Get Deals with optional filters (pipeline, stage, owner, contact, account)
 */
export async function getDealsAction(workspaceId, filters = {}) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const { pipelineId, stageId, ownerId, contactId, accountId, priority, search } = filters;

        const where = {
            workspaceId,
            pipelineId: pipelineId || undefined,
            stageId: stageId || undefined,
            ownerId: ownerId || undefined,
            contactId: contactId || undefined,
            accountId: accountId || undefined,
            priority: priority || undefined,
            ...(search ? {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { contact: { name: { contains: search, mode: 'insensitive' } } },
                    { account: { name: { contains: search, mode: 'insensitive' } } }
                ]
            } : {})
        };

        const deals = await prisma.deal.findMany({
            where,
            include: {
                stage: true,
                pipeline: true,
                contact: true,
                account: true,
                owner: {
                    select: { id: true, displayName: true, email: true, avatar: true }
                },
                _count: { select: { activities: true } }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return { success: true, data: deals };
    } catch (error) {
        console.error("[GET_DEALS_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch deals" };
    }
}

/**
 * Get Deal details with complete activity timeline & linked records
 */
export async function getDealByIdAction(workspaceId, dealId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const deal = await prisma.deal.findFirst({
            where: { id: dealId, workspaceId },
            include: {
                stage: true,
                pipeline: {
                    include: { stages: { orderBy: { order: 'asc' } } }
                },
                contact: true,
                account: true,
                owner: {
                    select: { id: true, displayName: true, email: true, avatar: true }
                },
                activities: {
                    include: {
                        user: { select: { id: true, displayName: true, avatar: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!deal) {
            return { success: false, error: "Deal not found" };
        }

        return { success: true, data: deal };
    } catch (error) {
        console.error("[GET_DEAL_BY_ID_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch deal details" };
    }
}

/**
 * Create a new Deal & record initial creation activity
 */
export async function createDealAction(workspaceId, data) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        const {
            title,
            value = 0,
            currency = "INR",
            pipelineId,
            stageId,
            contactId,
            accountId,
            ownerId,
            expectedClose,
            priority = "MEDIUM",
            tags = [],
            customFields = {}
        } = data;

        if (!title?.trim()) {
            return { success: false, error: "Deal title is required" };
        }

        // Validate or resolve Pipeline & Stage
        let targetPipelineId = pipelineId;
        let targetStageId = stageId;

        if (!targetPipelineId || !targetStageId) {
            const defaultPipeline = await prisma.pipeline.findFirst({
                where: { workspaceId },
                include: { stages: { orderBy: { order: 'asc' } } }
            });

            if (!defaultPipeline || defaultPipeline.stages.length === 0) {
                return { success: false, error: "No active pipeline found for this workspace." };
            }

            targetPipelineId = defaultPipeline.id;
            targetStageId = defaultPipeline.stages[0].id;
        }

        const deal = await prisma.deal.create({
            data: {
                workspaceId,
                userId,
                title: title.trim(),
                value: parseFloat(value) || 0,
                currency,
                pipelineId: targetPipelineId,
                stageId: targetStageId,
                contactId: contactId || null,
                accountId: accountId || null,
                ownerId: ownerId || userId,
                expectedClose: expectedClose ? new Date(expectedClose) : null,
                priority,
                tags,
                customFields
            },
            include: {
                stage: true,
                pipeline: true,
                contact: true,
                account: true,
                owner: {
                    select: { id: true, displayName: true, email: true, avatar: true }
                }
            }
        });

        // Record Initial Activity Log
        await prisma.crmActivity.create({
            data: {
                workspaceId,
                userId,
                dealId: deal.id,
                contactId: deal.contactId || null,
                accountId: deal.accountId || null,
                type: "DEAL_STAGE_CHANGE",
                title: "Deal Created",
                description: `Deal "${deal.title}" created with value ${deal.currency} ${deal.value.toLocaleString()} in stage "${deal.stage.name}".`
            }
        });

        return { success: true, data: deal };
    } catch (error) {
        console.error("[CREATE_DEAL_ERROR]", error);
        return { success: false, error: error.message || "Failed to create deal" };
    }
}

/**
 * Update Deal stage (Kanban drag-and-drop) & log stage transition
 */
export async function updateDealStageAction(workspaceId, dealId, stageId) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        const currentDeal = await prisma.deal.findUnique({
            where: { id: dealId },
            include: { stage: true }
        });

        if (!currentDeal) {
            return { success: false, error: "Deal not found" };
        }

        const targetStage = await prisma.dealStage.findUnique({
            where: { id: stageId }
        });

        if (!targetStage) {
            return { success: false, error: "Target stage not found" };
        }

        const isNowClosed = targetStage.isWon || targetStage.isLost;

        const updatedDeal = await prisma.deal.update({
            where: { id: dealId },
            data: {
                stageId,
                closedAt: isNowClosed ? new Date() : null
            },
            include: {
                stage: true,
                contact: true,
                account: true,
                owner: {
                    select: { id: true, displayName: true, email: true, avatar: true }
                }
            }
        });

        // Log stage change activity if stage actually changed
        if (currentDeal.stageId !== stageId) {
            await prisma.crmActivity.create({
                data: {
                    workspaceId,
                    userId,
                    dealId,
                    contactId: updatedDeal.contactId || null,
                    accountId: updatedDeal.accountId || null,
                    type: "DEAL_STAGE_CHANGE",
                    title: `Stage Changed: ${targetStage.name}`,
                    description: `Moved deal from "${currentDeal.stage.name}" to "${targetStage.name}".`,
                    metadata: {
                        previousStageId: currentDeal.stageId,
                        newStageId: stageId,
                        isWon: targetStage.isWon,
                        isLost: targetStage.isLost
                    }
                }
            });

            // FlowForge Bridge: Trigger Cross-Module Workflow Automations
            try {
                if (targetStage.isWon) {
                    await triggerCrmWorkflowAction(workspaceId, {
                        triggerEvent: 'DEAL_WON',
                        deal: updatedDeal,
                        contact: updatedDeal.contact,
                        account: updatedDeal.account,
                        stage: targetStage
                    });
                } else {
                    await triggerCrmWorkflowAction(workspaceId, {
                        triggerEvent: 'DEAL_STAGE_CHANGED',
                        deal: updatedDeal,
                        contact: updatedDeal.contact,
                        account: updatedDeal.account,
                        stage: targetStage
                    });
                }
            } catch (wfErr) {
                console.warn("[CRM_WORKFLOW_TRIGGER_WARN]", wfErr);
            }
        }

        return { success: true, data: updatedDeal };
    } catch (error) {
        console.error("[UPDATE_DEAL_STAGE_ERROR]", error);
        return { success: false, error: error.message || "Failed to update deal stage" };
    }
}

/**
 * Update Deal general fields
 */
export async function updateDealAction(workspaceId, dealId, data) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        const {
            title,
            value,
            currency,
            stageId,
            contactId,
            accountId,
            ownerId,
            expectedClose,
            lossReason,
            priority,
            tags,
            customFields
        } = data;

        const updatedDeal = await prisma.deal.update({
            where: { id: dealId },
            data: {
                title: title ? title.trim() : undefined,
                value: value !== undefined ? parseFloat(value) : undefined,
                currency,
                stageId,
                contactId: contactId !== undefined ? contactId : undefined,
                accountId: accountId !== undefined ? accountId : undefined,
                ownerId: ownerId !== undefined ? ownerId : undefined,
                expectedClose: expectedClose !== undefined ? (expectedClose ? new Date(expectedClose) : null) : undefined,
                lossReason,
                priority,
                tags,
                customFields
            },
            include: {
                stage: true,
                contact: true,
                account: true,
                owner: {
                    select: { id: true, displayName: true, email: true, avatar: true }
                }
            }
        });

        return { success: true, data: updatedDeal };
    } catch (error) {
        console.error("[UPDATE_DEAL_ERROR]", error);
        return { success: false, error: error.message || "Failed to update deal" };
    }
}

/**
 * Delete a Deal
 */
export async function deleteDealAction(workspaceId, dealId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        await prisma.deal.delete({
            where: { id: dealId }
        });

        return { success: true };
    } catch (error) {
        console.error("[DELETE_DEAL_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete deal" };
    }
}

/**
 * Get Deal Analytics & Pipeline Telemetry
 */
export async function getDealStatsAction(workspaceId, pipelineId = null) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const where = {
            workspaceId,
            pipelineId: pipelineId || undefined
        };

        const deals = await prisma.deal.findMany({
            where,
            include: { stage: true }
        });

        const totalDeals = deals.length;
        const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);

        // Weighted Pipeline Value (Sum of Value * Probability / 100)
        const weightedValue = deals.reduce((sum, d) => {
            const prob = d.stage?.probability ?? 50;
            return sum + (d.value || 0) * (prob / 100);
        }, 0);

        const wonDeals = deals.filter(d => d.stage?.isWon);
        const lostDeals = deals.filter(d => d.stage?.isLost);
        const openDeals = deals.filter(d => !d.stage?.isWon && !d.stage?.isLost);

        const wonValue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
        const winRate = (wonDeals.length + lostDeals.length) > 0
            ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100)
            : 0;

        return {
            success: true,
            data: {
                totalDeals,
                totalValue,
                weightedValue,
                openDealsCount: openDeals.length,
                wonDealsCount: wonDeals.length,
                lostDealsCount: lostDeals.length,
                wonValue,
                winRate
            }
        };
    } catch (error) {
        console.error("[GET_DEAL_STATS_ERROR]", error);
        return { success: false, error: error.message || "Failed to calculate deal statistics" };
    }
}
