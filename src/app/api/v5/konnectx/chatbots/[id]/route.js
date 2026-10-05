import { db } from "@/lib/db";
import { ok, fail, requireUserId } from "../../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/v5/konnectx/chatbots/[id]
 *
 * Single bot with its ordered steps and execution counts — everything the
 * mobile builder needs to open a flow for editing.
 */
export async function GET(request, { params }) {
    try {
        const userId = await requireUserId(request);
        const { id } = await params;

        if (!id) return fail("Bot id is required", 400);

        const bot = await db.botFlow.findFirst({
            where: { id, userId },
            include: {
                steps: { orderBy: { order: "asc" } },
                _count: { select: { executions: true } }
            }
        });

        if (!bot) return fail("Bot not found", 404);

        const [completed, failed, processing] = await Promise.all([
            db.botExecution.count({ where: { botFlowId: id, status: "COMPLETED" } }),
            db.botExecution.count({ where: { botFlowId: id, status: "FAILED" } }),
            db.botExecution.count({ where: { botFlowId: id, status: "PROCESSING" } })
        ]);

        return ok({
            bot: {
                ...bot,
                executionStats: {
                    total: bot._count.executions,
                    completed,
                    failed,
                    processing,
                    successRate:
                        bot._count.executions > 0
                            ? Math.round((completed / bot._count.executions) * 100)
                            : 0
                }
            }
        });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/chatbots/[id]] GET failed:", error);
        return fail(error.message || "Failed to fetch bot", 500);
    }
}

/**
 * PUT /api/v5/konnectx/chatbots/[id]
 *
 * Persists the node/edge graph plus its linear step projection in one go,
 * so the mobile step editor and the canvas editor stay interchangeable.
 */
export async function PUT(request, { params }) {
    try {
        const userId = await requireUserId(request);
        const { id } = await params;
        const body = await request.json().catch(() => ({}));

        if (!id) return fail("Bot id is required", 400);

        // Scoped lookup — guards against updating another tenant's bot by id.
        const existing = await db.botFlow.findFirst({
            where: { id, userId },
            select: { id: true }
        });
        if (!existing) return fail("Bot not found", 404);

        const bot = await db.botFlow.update({
            where: { id },
            data: {
                ...(body.name !== undefined && { name: body.name }),
                ...(body.description !== undefined && { description: body.description }),
                ...(body.active !== undefined && { active: !!body.active }),
                ...(body.nodes !== undefined && { nodes: body.nodes }),
                ...(body.edges !== undefined && { edges: body.edges })
            }
        });

        // Replace the step projection atomically with the graph.
        if (Array.isArray(body.steps)) {
            await db.$transaction([
                db.botFlowStep.deleteMany({ where: { botFlowId: id } }),
                ...(body.steps.length
                    ? [
                        db.botFlowStep.createMany({
                            data: body.steps.map((step, index) => ({
                                botFlowId: id,
                                type: step.type || "MESSAGE",
                                config: step.config ?? {},
                                positionX: Number(step.positionX) || 0,
                                positionY: Number(step.positionY) || index * 80,
                                order: Number.isFinite(step.order) ? step.order : index
                            }))
                        })
                    ]
                    : [])
            ]);
        }

        return ok({ bot });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/chatbots/[id]] PUT failed:", error);
        return fail(error.message || "Failed to update bot", 500);
    }
}

/** DELETE /api/v5/konnectx/chatbots/[id] */
export async function DELETE(request, { params }) {
    try {
        const userId = await requireUserId(request);
        const { id } = await params;

        if (!id) return fail("Bot id is required", 400);

        const existing = await db.botFlow.findFirst({
            where: { id, userId },
            select: { id: true }
        });
        if (!existing) return fail("Bot not found", 404);

        await db.botFlow.delete({ where: { id } });

        return ok({ id });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/chatbots/[id]] DELETE failed:", error);
        return fail(error.message || "Failed to delete bot", 500);
    }
}