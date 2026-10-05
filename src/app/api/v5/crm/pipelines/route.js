import { prisma } from "@/lib/prisma";
import { validateCrmUserToken } from "../_lib/auth";
import { apiSuccess, apiError } from "../_lib/response";

/**
 * GET /api/v5/crm/pipelines
 */
export async function GET(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        let pipelines = await prisma.pipeline.findMany({
            where: { workspaceId: auth.workspaceId },
            include: {
                stages: {
                    orderBy: { order: 'asc' },
                    include: {
                        _count: { select: { deals: true } }
                    }
                },
                _count: { select: { deals: true } }
            },
            orderBy: { createdAt: 'asc' }
        });

        if (pipelines.length === 0) {
            // Provision default pipeline
            const defaultPipeline = await prisma.pipeline.create({
                data: {
                    workspaceId: auth.workspaceId,
                    userId: auth.userId,
                    name: "Sales Pipeline",
                    isDefault: true,
                    stages: {
                        create: [
                            { workspaceId: auth.workspaceId, name: "Lead In", order: 0, probability: 10, color: "#3b82f6" },
                            { workspaceId: auth.workspaceId, name: "Contact Made", order: 1, probability: 25, color: "#6366f1" },
                            { workspaceId: auth.workspaceId, name: "Needs Discovery", order: 2, probability: 50, color: "#8b5cf6" },
                            { workspaceId: auth.workspaceId, name: "Proposal Sent", order: 3, probability: 75, color: "#eab308" },
                            { workspaceId: auth.workspaceId, name: "Closed Won", order: 4, probability: 100, isWon: true, color: "#22c55e" },
                            { workspaceId: auth.workspaceId, name: "Closed Lost", order: 5, probability: 0, isLost: true, color: "#ef4444" }
                        ]
                    }
                },
                include: {
                    stages: { orderBy: { order: 'asc' } },
                    _count: { select: { deals: true } }
                }
            });
            pipelines = [defaultPipeline];
        }

        return apiSuccess(pipelines);
    } catch (error) {
        console.error("[API_CRM_GET_PIPELINES_ERROR]", error);
        return apiError(error.message || "Failed to fetch pipelines", 500);
    }
}

/**
 * POST /api/v5/crm/pipelines
 * Body: { name, stages: [{ name, probability, color, isWon, isLost }] }
 */
export async function POST(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const body = await request.json();
        const { name, color, stages } = body;

        if (!name?.trim()) return apiError("Pipeline name is required", 400);

        const stageList = Array.isArray(stages) && stages.length > 0 ? stages : [
            { name: "Lead In", probability: 10, color: "#3b82f6" },
            { name: "Discovery", probability: 30, color: "#6366f1" },
            { name: "Proposal Sent", probability: 60, color: "#eab308" },
            { name: "Closed Won", probability: 100, isWon: true, color: "#22c55e" },
            { name: "Closed Lost", probability: 0, isLost: true, color: "#ef4444" }
        ];

        const pipeline = await prisma.pipeline.create({
            data: {
                workspaceId: auth.workspaceId,
                userId: auth.userId,
                name: name.trim(),
                color: color || '#3b82f6',
                isDefault: false,
                stages: {
                    create: stageList.map((stg, index) => ({
                        workspaceId: auth.workspaceId,
                        name: stg.name,
                        order: index,
                        probability: typeof stg.probability === 'number' ? stg.probability : 50,
                        color: stg.color || '#3b82f6',
                        isWon: !!stg.isWon,
                        isLost: !!stg.isLost
                    }))
                }
            },
            include: {
                stages: { orderBy: { order: 'asc' } }
            }
        });

        return apiSuccess(pipeline, { message: "Pipeline created successfully" }, 201);
    } catch (error) {
        console.error("[API_CRM_CREATE_PIPELINE_ERROR]", error);
        return apiError(error.message || "Failed to create pipeline", 500);
    }
}
