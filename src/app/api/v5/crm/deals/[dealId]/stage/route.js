import { prisma } from "@/lib/prisma";
import { validateCrmUserToken } from "../../../_lib/auth";
import { apiSuccess, apiError } from "../../../_lib/response";
import { triggerCrmWorkflowAction } from "@/app/workspace/[workspaceId]/crm/_actions/crm-automation-actions";

/**
 * POST /api/v5/crm/deals/[dealId]/stage
 * Body: { stageId }
 * Transitions deal to target stage and dispatches FlowForge workflow automations
 */
export async function POST(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { dealId } = await params;
        const body = await request.json();
        const { stageId } = body;

        if (!stageId) return apiError("Target stageId is required", 400);

        const currentDeal = await prisma.deal.findFirst({
            where: { id: dealId, workspaceId: auth.workspaceId },
            include: { stage: true, contact: true, account: true }
        });

        if (!currentDeal) return apiError("Deal not found", 404);

        const targetStage = await prisma.dealStage.findUnique({
            where: { id: stageId }
        });

        if (!targetStage) return apiError("Target stage not found", 404);

        const isNowClosed = targetStage.isWon || targetStage.isLost;

        const updatedDeal = await prisma.deal.update({
            where: { id: dealId },
            data: {
                stageId,
                closedAt: isNowClosed ? new Date() : null
            },
            include: {
                stage: true,
                pipeline: true,
                contact: true,
                account: true,
                owner: true
            }
        });

        // Record Stage Change Activity
        await prisma.crmActivity.create({
            data: {
                workspaceId: auth.workspaceId,
                userId: auth.userId,
                dealId,
                contactId: updatedDeal.contactId || null,
                accountId: updatedDeal.accountId || null,
                type: "DEAL_STAGE_CHANGE",
                title: `Stage Changed via API: ${targetStage.name}`,
                description: `Moved deal from "${currentDeal.stage?.name || 'Previous'}" to "${targetStage.name}".`,
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
                await triggerCrmWorkflowAction(auth.workspaceId, {
                    triggerEvent: 'DEAL_WON',
                    deal: updatedDeal,
                    contact: updatedDeal.contact,
                    account: updatedDeal.account,
                    stage: targetStage
                });
            } else {
                await triggerCrmWorkflowAction(auth.workspaceId, {
                    triggerEvent: 'DEAL_STAGE_CHANGED',
                    deal: updatedDeal,
                    contact: updatedDeal.contact,
                    account: updatedDeal.account,
                    stage: targetStage
                });
            }
        } catch (wfErr) {
            console.warn("[CRM_API_WORKFLOW_WARN]", wfErr);
        }

        return apiSuccess(updatedDeal, {
            message: `Deal stage updated to "${targetStage.name}" successfully.`
        });
    } catch (error) {
        console.error("[API_CRM_UPDATE_STAGE_ERROR]", error);
        return apiError(error.message || "Failed to update deal stage", 500);
    }
}
