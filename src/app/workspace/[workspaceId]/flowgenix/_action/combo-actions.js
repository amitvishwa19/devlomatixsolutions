'use server';

import { db } from "@/lib/db";
import { ensureAdmin } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

const DEFAULT_WORKSPACE_COMBOS = [
    { id: "combo-1", name: "custom/coding-chain", strategy: "priority", targets: ["claude-3-7-sonnet", "deepseek-chat-v3", "gemini-2.0-flash"], desc: "Primary code generation with fallback to reasoning models." },
    { id: "combo-2", name: "custom/fast-summarizer", strategy: "round-robin", targets: ["llama-3.3-70b-versatile", "gemini-2.0-flash"], desc: "Ultra-fast latency optimized text extractor." },
    { id: "combo-3", name: "custom/budget-guard", strategy: "cost-optimized", targets: ["freemodel", "groq", "deepseek"], desc: "Free tier maximizer with pay-as-you-go fallback." }
];

/**
 * Fetch all configured custom routing combos for a workspace
 */
export async function getCombosAction(workspaceId) {
    try {
        if (!workspaceId) return { success: false, error: "Workspace ID required" };

        const config = await db.agentConfig.findFirst({
            where: { workspaceId, name: "workspace_combos_manifest" }
        });

        if (!config || !config.systemPrompt) {
            return { success: true, data: DEFAULT_WORKSPACE_COMBOS };
        }

        try {
            const parsed = JSON.parse(config.systemPrompt);
            return { success: true, data: Array.isArray(parsed) ? parsed : DEFAULT_WORKSPACE_COMBOS };
        } catch {
            return { success: true, data: DEFAULT_WORKSPACE_COMBOS };
        }
    } catch (error) {
        console.error("getCombosAction Error:", error);
        return { success: false, error: error.message || "Failed to fetch combos" };
    }
}

/**
 * Save / Upsert a custom routing combo
 */
export async function saveComboAction({ workspaceId, combo }) {
    try {
        if (!workspaceId || !combo?.name) {
            return { success: false, error: "Workspace ID and combo name are required" };
        }

        const session = await ensureAdmin();
        const userId = session?.user?.userId || "system";

        const currentRes = await getCombosAction(workspaceId);
        let list = currentRes.data || [];

        const comboId = combo.id || `combo-${Date.now()}`;
        const newCombo = {
            id: comboId,
            name: combo.name.startsWith("custom/") ? combo.name : `custom/${combo.name.replace(/\s+/g, '-').toLowerCase()}`,
            strategy: combo.strategy || "priority",
            targets: Array.isArray(combo.targets) ? combo.targets : [],
            desc: combo.desc || "Custom failover cascade rule"
        };

        const existingIndex = list.findIndex(c => c.id === comboId);
        if (existingIndex >= 0) {
            list[existingIndex] = newCombo;
        } else {
            list.unshift(newCombo);
        }

        const jsonString = JSON.stringify(list);

        const existingRecord = await db.agentConfig.findFirst({
            where: { workspaceId, name: "workspace_combos_manifest" }
        });

        if (existingRecord) {
            await db.agentConfig.update({
                where: { id: existingRecord.id },
                data: { systemPrompt: jsonString }
            });
        } else {
            await db.agentConfig.create({
                data: {
                    workspaceId,
                    userId,
                    name: "workspace_combos_manifest",
                    systemPrompt: jsonString
                }
            });
        }

        revalidatePath(`/workspace/${workspaceId}/flowgenix`);
        return { success: true, data: newCombo };
    } catch (error) {
        console.error("saveComboAction Error:", error);
        return { success: false, error: error.message || "Failed to save combo" };
    }
}

/**
 * Delete a custom routing combo
 */
export async function deleteComboAction({ workspaceId, id }) {
    try {
        if (!workspaceId || !id) return { success: false, error: "Missing ID" };
        await ensureAdmin();

        const currentRes = await getCombosAction(workspaceId);
        let list = (currentRes.data || []).filter(c => c.id !== id);

        const jsonString = JSON.stringify(list);

        const existingRecord = await db.agentConfig.findFirst({
            where: { workspaceId, name: "workspace_combos_manifest" }
        });

        if (existingRecord) {
            await db.agentConfig.update({
                where: { id: existingRecord.id },
                data: { systemPrompt: jsonString }
            });
        }

        revalidatePath(`/workspace/${workspaceId}/flowgenix`);
        return { success: true };
    } catch (error) {
        console.error("deleteComboAction Error:", error);
        return { success: false, error: error.message || "Failed to delete combo" };
    }
}
