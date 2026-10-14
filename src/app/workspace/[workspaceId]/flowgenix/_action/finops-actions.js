'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { spendGuard } from "../_lib/spend-guard";
import { revalidatePath } from "next/cache";

/**
 * Fetch FinOps & Spend Guard metrics for a workspace
 */
export async function getFinOpsOverviewAction(workspaceId) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return { success: false, error: "Unauthorized" };
        }

        const summary = await spendGuard.getSummary(workspaceId);
        return { success: true, data: summary };
    } catch (error) {
        console.error("getFinOpsOverviewAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Update Spend Guard budget thresholds & downgrade actions
 */
export async function updateSpendGuardConfigAction({
    workspaceId,
    monthlyBudgetUsd,
    actionOnBudgetExceeded,
    alertThresholdPercent
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return { success: false, error: "Unauthorized" };
        }

        const budget = parseFloat(monthlyBudgetUsd);
        const threshold = parseInt(alertThresholdPercent, 10);

        const updated = await spendGuard.updateConfig(workspaceId, {
            monthlyBudgetUsd: !isNaN(budget) && budget >= 0 ? budget : 10.00,
            actionOnBudgetExceeded: actionOnBudgetExceeded === "block_requests" ? "block_requests" : "auto_downgrade",
            alertThresholdPercent: !isNaN(threshold) && threshold >= 10 && threshold <= 100 ? threshold : 80
        });

        revalidatePath(`/workspace/${workspaceId}/flowgenix`);
        return { success: true, config: updated };
    } catch (error) {
        console.error("updateSpendGuardConfigAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Reset spend counter for testing or new billing period
 */
export async function resetBillingCycleAction(workspaceId) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return { success: false, error: "Unauthorized" };
        }

        await spendGuard.resetMonthlySpend(workspaceId);
        revalidatePath(`/workspace/${workspaceId}/flowgenix`);
        return { success: true };
    } catch (error) {
        console.error("resetBillingCycleAction Error:", error);
        return { success: false, error: error.message };
    }
}
