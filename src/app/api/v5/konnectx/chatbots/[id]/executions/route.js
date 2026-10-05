import { db } from "@/lib/db";
import { paged, fail, requireUserId } from "../../../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/v5/konnectx/chatbots/[id]/executions
 *
 * Execution log for one bot. Query: status, phone, search, page, limit.
 *
 * Ownership is verified against the parent bot first, so a valid id belonging
 * to another tenant reports 404 rather than leaking run history.
 */
export async function GET(request, { params }) {
    try {
        const userId = await requireUserId(request);
        const { id } = await params;

        if (!id) return fail("Bot id is required", 400);

        const bot = await db.botFlow.findFirst({
            where: { id, userId },
            select: { id: true }
        });
        if (!bot) return fail("Bot not found", 404);

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const phone = searchParams.get("phone");
        const search = (searchParams.get("search") || "").trim();
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(
            100,
            Math.max(1, parseInt(searchParams.get("limit") || "25", 10))
        );

        const where = {
            botFlowId: id,
            ...(status && status !== "ALL" ? { status } : {}),
            ...(phone ? { phone: { contains: phone } } : {}),
            ...(search
                ? {
                    OR: [
                        { phone: { contains: search } },
                        { message: { contains: search, mode: "insensitive" } }
                    ]
                }
                : {})
        };

        const [executions, total] = await Promise.all([
            db.botExecution.findMany({
                where,
                orderBy: { triggeredAt: "desc" },
                skip: (page - 1) * limit,
                take: limit
            }),
            db.botExecution.count({ where })
        ]);

        return paged(executions, { page, limit, total });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/chatbots/[id]/executions] GET failed:", error);
        return fail(error.message || "Failed to fetch executions", 500);
    }
}