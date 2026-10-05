import { prisma } from "@/lib/prisma";
import { validateCrmUserToken } from "../../_lib/auth";
import { apiSuccess, apiError } from "../../_lib/response";

/**
 * GET /api/v5/crm/accounts/[accountId]
 */
export async function GET(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { accountId } = await params;

        const account = await prisma.account.findFirst({
            where: { id: accountId, workspaceId: auth.workspaceId },
            include: {
                contacts: true,
                deals: {
                    include: { stage: true, pipeline: true },
                    orderBy: { updatedAt: 'desc' }
                },
                crmActivities: {
                    include: {
                        user: { select: { id: true, displayName: true, avatar: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!account) return apiError("Account not found", 404);

        return apiSuccess(account);
    } catch (error) {
        console.error("[API_CRM_GET_ACCOUNT_ERROR]", error);
        return apiError(error.message || "Failed to fetch account", 500);
    }
}

/**
 * PATCH /api/v5/crm/accounts/[accountId]
 */
export async function PATCH(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { accountId } = await params;
        const body = await request.json();

        const existing = await prisma.account.findFirst({
            where: { id: accountId, workspaceId: auth.workspaceId }
        });

        if (!existing) return apiError("Account not found", 404);

        const updateData = {};
        if (body.name !== undefined) updateData.name = body.name.trim();
        if (body.domain !== undefined) updateData.domain = body.domain ? body.domain.trim().toLowerCase() : null;
        if (body.industry !== undefined) updateData.industry = body.industry;
        if (body.size !== undefined) updateData.size = body.size;
        if (body.tier !== undefined) updateData.tier = body.tier;
        if (body.annualRevenue !== undefined) updateData.annualRevenue = parseFloat(body.annualRevenue) || 0;
        if (body.phone !== undefined) updateData.phone = body.phone ? body.phone.trim() : null;
        if (body.address !== undefined) updateData.address = body.address || null;

        const updated = await prisma.account.update({
            where: { id: accountId },
            data: updateData
        });

        return apiSuccess(updated, { message: "Account updated successfully" });
    } catch (error) {
        console.error("[API_CRM_UPDATE_ACCOUNT_ERROR]", error);
        return apiError(error.message || "Failed to update account", 500);
    }
}

/**
 * DELETE /api/v5/crm/accounts/[accountId]
 */
export async function DELETE(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { accountId } = await params;

        const existing = await prisma.account.findFirst({
            where: { id: accountId, workspaceId: auth.workspaceId }
        });

        if (!existing) return apiError("Account not found", 404);

        await prisma.account.delete({ where: { id: accountId } });

        return apiSuccess({ id: accountId }, { message: "Account deleted successfully" });
    } catch (error) {
        console.error("[API_CRM_DELETE_ACCOUNT_ERROR]", error);
        return apiError(error.message || "Failed to delete account", 500);
    }
}
