import { prisma } from "@/lib/prisma";
import { validateCrmUserToken } from "../../_lib/auth";
import { apiSuccess, apiError } from "../../_lib/response";

/**
 * GET /api/v5/crm/deals/[dealId]
 */
export async function GET(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { dealId } = await params;

        const deal = await prisma.deal.findFirst({
            where: { id: dealId, workspaceId: auth.workspaceId },
            include: {
                stage: true,
                pipeline: true,
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

        if (!deal) return apiError("Deal not found", 404);

        return apiSuccess(deal);
    } catch (error) {
        console.error("[API_CRM_GET_DEAL_ERROR]", error);
        return apiError(error.message || "Failed to fetch deal", 500);
    }
}

/**
 * PATCH /api/v5/crm/deals/[dealId]
 */
export async function PATCH(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { dealId } = await params;
        const body = await request.json();

        const existing = await prisma.deal.findFirst({
            where: { id: dealId, workspaceId: auth.workspaceId }
        });

        if (!existing) return apiError("Deal not found", 404);

        const updateData = {};
        if (body.title !== undefined) updateData.title = body.title.trim();
        if (body.value !== undefined) updateData.value = parseFloat(body.value);
        if (body.currency !== undefined) updateData.currency = body.currency;
        if (body.stageId !== undefined) updateData.stageId = body.stageId;
        if (body.priority !== undefined) updateData.priority = body.priority;
        if (body.tags !== undefined) updateData.tags = Array.isArray(body.tags) ? body.tags : [];
        if (body.contactId !== undefined) updateData.contactId = body.contactId || null;
        if (body.accountId !== undefined) updateData.accountId = body.accountId || null;
        if (body.expectedClose !== undefined) updateData.expectedClose = body.expectedClose ? new Date(body.expectedClose) : null;
        if (body.lossReason !== undefined) updateData.lossReason = body.lossReason;

        const updated = await prisma.deal.update({
            where: { id: dealId },
            data: updateData,
            include: { stage: true, contact: true, account: true, owner: true }
        });

        return apiSuccess(updated, { message: "Deal updated successfully" });
    } catch (error) {
        console.error("[API_CRM_UPDATE_DEAL_ERROR]", error);
        return apiError(error.message || "Failed to update deal", 500);
    }
}

/**
 * DELETE /api/v5/crm/deals/[dealId]
 */
export async function DELETE(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { dealId } = await params;

        const existing = await prisma.deal.findFirst({
            where: { id: dealId, workspaceId: auth.workspaceId }
        });

        if (!existing) return apiError("Deal not found", 404);

        await prisma.deal.delete({ where: { id: dealId } });

        return apiSuccess({ id: dealId }, { message: "Deal deleted successfully" });
    } catch (error) {
        console.error("[API_CRM_DELETE_DEAL_ERROR]", error);
        return apiError(error.message || "Failed to delete deal", 500);
    }
}
