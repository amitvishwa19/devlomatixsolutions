import { prisma } from "@/lib/prisma";
import { validateCrmUserToken } from "../_lib/auth";
import { apiSuccess, apiError } from "../_lib/response";
import { triggerCrmWorkflowAction } from "@/app/workspace/[workspaceId]/crm/_actions/crm-automation-actions";

/**
 * GET /api/v5/crm/deals
 * Query params: pipelineId, stageId, ownerId, contactId, accountId, priority, search, page, limit
 */
export async function GET(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) {
            return apiError(auth.error, auth.status);
        }

        const { searchParams } = new URL(request.url);
        const pipelineId = searchParams.get("pipelineId");
        const stageId = searchParams.get("stageId");
        const ownerId = searchParams.get("ownerId");
        const contactId = searchParams.get("contactId");
        const accountId = searchParams.get("accountId");
        const priority = searchParams.get("priority");
        const search = searchParams.get("search");

        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "50", 10);
        const skip = (page - 1) * limit;

        const where = {
            workspaceId: auth.workspaceId,
            ...(pipelineId && pipelineId !== 'ALL' ? { pipelineId } : {}),
            ...(stageId && stageId !== 'ALL' ? { stageId } : {}),
            ...(ownerId ? { ownerId } : {}),
            ...(contactId ? { contactId } : {}),
            ...(accountId ? { accountId } : {}),
            ...(priority ? { priority } : {}),
            ...(search ? {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { contact: { name: { contains: search, mode: 'insensitive' } } },
                    { account: { name: { contains: search, mode: 'insensitive' } } }
                ]
            } : {})
        };

        const [deals, total] = await Promise.all([
            prisma.deal.findMany({
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
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.deal.count({ where })
        ]);

        return apiSuccess(deals, {
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("[API_CRM_GET_DEALS_ERROR]", error);
        return apiError(error.message || "Failed to fetch deals", 500);
    }
}

/**
 * POST /api/v5/crm/deals
 * Body: { title, value, currency, pipelineId, stageId, contactId, accountId, priority, tags, expectedClose }
 */
export async function POST(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) {
            return apiError(auth.error, auth.status);
        }

        const body = await request.json();
        const {
            title,
            value = 0,
            currency = "INR",
            pipelineId,
            stageId,
            contactId,
            accountId,
            ownerId,
            priority = "MEDIUM",
            tags = [],
            expectedClose,
            customFields = {}
        } = body;

        if (!title?.trim()) {
            return apiError("Deal title is required", 400);
        }

        let targetPipelineId = pipelineId;
        let targetStageId = stageId;

        // Auto-resolve default pipeline if not passed
        if (!targetPipelineId || !targetStageId) {
            const defaultPipeline = await prisma.pipeline.findFirst({
                where: { workspaceId: auth.workspaceId },
                include: { stages: { orderBy: { order: 'asc' } } }
            });

            if (defaultPipeline) {
                targetPipelineId = targetPipelineId || defaultPipeline.id;
                targetStageId = targetStageId || defaultPipeline.stages[0]?.id;
            } else {
                // Provision default pipeline
                const newPipeline = await prisma.pipeline.create({
                    data: {
                        workspaceId: auth.workspaceId,
                        userId: auth.userId,
                        name: "Default Sales Pipeline",
                        isDefault: true,
                        stages: {
                            create: [
                                { workspaceId: auth.workspaceId, name: "Lead In", order: 0, probability: 10, color: "#3b82f6" },
                                { workspaceId: auth.workspaceId, name: "Discovery", order: 1, probability: 30, color: "#8b5cf6" },
                                { workspaceId: auth.workspaceId, name: "Proposal Sent", order: 2, probability: 60, color: "#eab308" },
                                { workspaceId: auth.workspaceId, name: "Closed Won", order: 3, probability: 100, isWon: true, color: "#22c55e" }
                            ]
                        }
                    },
                    include: { stages: { orderBy: { order: 'asc' } } }
                });
                targetPipelineId = newPipeline.id;
                targetStageId = newPipeline.stages[0]?.id;
            }
        }

        const deal = await prisma.deal.create({
            data: {
                workspaceId: auth.workspaceId,
                userId: auth.userId,
                title: title.trim(),
                value: parseFloat(value) || 0,
                currency,
                pipelineId: targetPipelineId,
                stageId: targetStageId,
                contactId: contactId || null,
                accountId: accountId || null,
                ownerId: ownerId || auth.userId,
                priority,
                tags: Array.isArray(tags) ? tags : [],
                expectedClose: expectedClose ? new Date(expectedClose) : null,
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

        // Record Initial Activity
        await prisma.crmActivity.create({
            data: {
                workspaceId: auth.workspaceId,
                userId: auth.userId,
                dealId: deal.id,
                contactId: deal.contactId || null,
                accountId: deal.accountId || null,
                type: "DEAL_STAGE_CHANGE",
                title: "Deal Created via API",
                description: `Deal "${deal.title}" created with value ${deal.currency} ${deal.value.toLocaleString()}.`
            }
        });

        return apiSuccess(deal, { message: "Deal created successfully" }, 201);
    } catch (error) {
        console.error("[API_CRM_CREATE_DEAL_ERROR]", error);
        return apiError(error.message || "Failed to create deal", 500);
    }
}
