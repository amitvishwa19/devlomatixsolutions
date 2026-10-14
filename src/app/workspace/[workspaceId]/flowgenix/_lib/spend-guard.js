/**
 * FlowGenix Spend Guard & FinOps Engine
 * Enforces monthly budget caps, tracks token expenditure, and manages zero-downtime auto-downgrades.
 */

import { db } from "@/lib/db";
import { calculateTokenCost } from "./finops-pricing";

// In-memory runtime cache for high-throughput gateway lookups
if (!globalThis._flowgenixSpendGuard) {
    globalThis._flowgenixSpendGuard = new Map();
}

function getCurrentBillingMonth() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const DEFAULT_CONFIG = {
    monthlyBudgetUsd: 10.00,
    actionOnBudgetExceeded: "auto_downgrade", // "auto_downgrade" | "block_requests"
    alertThresholdPercent: 80,
    autoDowngradeProviders: ["freemodel", "groq", "google", "ollama"]
};

class SpendGuardEngine {
    constructor() {
        this.store = globalThis._flowgenixSpendGuard;
    }

    _getWorkspaceState(workspaceId) {
        const currentMonth = getCurrentBillingMonth();
        let state = this.store.get(workspaceId);

        if (!state || state.billingMonth !== currentMonth) {
            state = {
                workspaceId,
                billingMonth: currentMonth,
                config: { ...DEFAULT_CONFIG },
                currentMonthSpendUsd: 0,
                totalTokensProcessed: 0,
                totalCostSavedUsd: 0,
                modelBreakdown: {},
                keyBreakdown: {},
                lastLoadedFromDb: 0
            };
            this.store.set(workspaceId, state);
        }
        return state;
    }

    /**
     * Load persisted FinOps state from database
     */
    async loadState(workspaceId) {
        const state = this._getWorkspaceState(workspaceId);
        const now = Date.now();

        // Throttle DB re-fetches to every 15 seconds
        if (now - state.lastLoadedFromDb < 15000) {
            return state;
        }

        try {
            const row = await db.agentConfig.findFirst({
                where: { workspaceId, name: "workspace_spend_guard_manifest" }
            });

            if (row && row.systemPrompt) {
                const parsed = JSON.parse(row.systemPrompt);
                if (parsed.billingMonth === state.billingMonth) {
                    state.currentMonthSpendUsd = Number(parsed.currentMonthSpendUsd || 0);
                    state.totalTokensProcessed = Number(parsed.totalTokensProcessed || 0);
                    state.totalCostSavedUsd = Number(parsed.totalCostSavedUsd || 0);
                    state.modelBreakdown = parsed.modelBreakdown || {};
                    state.keyBreakdown = parsed.keyBreakdown || {};
                }
                if (parsed.config) {
                    state.config = { ...state.config, ...parsed.config };
                }
            }
            state.lastLoadedFromDb = now;
        } catch (err) {
            console.error("[SpendGuard] Error loading state from DB:", err.message);
        }

        return state;
    }

    /**
     * Persist FinOps state to database
     */
    async persistState(workspaceId) {
        const state = this._getWorkspaceState(workspaceId);
        try {
            const payload = JSON.stringify({
                billingMonth: state.billingMonth,
                config: state.config,
                currentMonthSpendUsd: state.currentMonthSpendUsd,
                totalTokensProcessed: state.totalTokensProcessed,
                totalCostSavedUsd: state.totalCostSavedUsd,
                modelBreakdown: state.modelBreakdown,
                keyBreakdown: state.keyBreakdown,
                updatedAt: new Date().toISOString()
            });

            const existing = await db.agentConfig.findFirst({
                where: { workspaceId, name: "workspace_spend_guard_manifest" }
            });

            if (existing) {
                await db.agentConfig.update({
                    where: { id: existing.id },
                    data: { systemPrompt: payload }
                });
            } else {
                await db.agentConfig.create({
                    data: {
                        workspaceId,
                        name: "workspace_spend_guard_manifest",
                        type: "spend_guard",
                        systemPrompt: payload
                    }
                });
            }
        } catch (err) {
            console.error("[SpendGuard] Error persisting state to DB:", err.message);
        }
    }

    /**
     * Pre-Flight Check: Verify whether a request can execute, must be downgraded, or blocked
     */
    async checkBudget(workspaceId, keyId = null) {
        await this.loadState(workspaceId);
        const state = this._getWorkspaceState(workspaceId);
        const budget = state.config.monthlyBudgetUsd;
        const current = state.currentMonthSpendUsd;

        // Key-level spend cap check (if keyId provided)
        if (keyId && state.keyBreakdown[keyId]) {
            const keySpend = state.keyBreakdown[keyId].spendUsd || 0;
            const keyCap = state.keyBreakdown[keyId].spendCap;
            if (typeof keyCap === 'number' && keySpend >= keyCap) {
                if (state.config.actionOnBudgetExceeded === "block_requests") {
                    return {
                        allowed: false,
                        shouldDowngradeToFree: false,
                        reason: `API Key spend cap of $${keyCap.toFixed(2)} exceeded (Current spend: $${keySpend.toFixed(2)}).`
                    };
                } else {
                    return {
                        allowed: true,
                        shouldDowngradeToFree: true,
                        reason: `API Key spend cap exceeded ($${keySpend.toFixed(2)} / $${keyCap.toFixed(2)}). Auto-downgrading to Free Tier.`
                    };
                }
            }
        }

        // Workspace-level budget check
        if (budget > 0 && current >= budget) {
            if (state.config.actionOnBudgetExceeded === "block_requests") {
                return {
                    allowed: false,
                    shouldDowngradeToFree: false,
                    reason: `Workspace monthly budget of $${budget.toFixed(2)} USD exceeded (Current spend: $${current.toFixed(2)}).`
                };
            } else {
                return {
                    allowed: true,
                    shouldDowngradeToFree: true,
                    reason: `Workspace budget exceeded ($${current.toFixed(2)} / $${budget.toFixed(2)}). Zero-downtime routing via Free Tier.`
                };
            }
        }

        return {
            allowed: true,
            shouldDowngradeToFree: false,
            reason: null
        };
    }

    /**
     * Record completed request spend and savings
     */
    recordSpend({
        workspaceId,
        keyId = null,
        keyLabel = "Default Key",
        keyCap = null,
        provider = "",
        model = "",
        tokensIn = 0,
        tokensOut = 0,
        isCached = false,
        compressionSavingsPercent = 0
    }) {
        const state = this._getWorkspaceState(workspaceId);
        const totalTokens = Number(tokensIn || 0) + Number(tokensOut || 0);

        const pricing = calculateTokenCost({ provider, model, tokensIn, tokensOut });
        let actualCost = isCached ? 0 : pricing.costUsd;

        // Calculate theoretical cost saved
        let costSaved = 0;
        if (isCached) {
            costSaved += pricing.costUsd; // saved entire inference cost
        }
        if (compressionSavingsPercent > 0 && !isCached) {
            // e.g. 30% compression means tokensIn was reduced by 30%
            const uncompressedCost = (pricing.costUsd / (1 - (compressionSavingsPercent / 100)));
            costSaved += Math.max(0, uncompressedCost - pricing.costUsd);
        }

        // Update state
        state.currentMonthSpendUsd = Number((state.currentMonthSpendUsd + actualCost).toFixed(6));
        state.totalTokensProcessed += totalTokens;
        state.totalCostSavedUsd = Number((state.totalCostSavedUsd + costSaved).toFixed(6));

        // Model breakdown
        const mKey = `${provider}/${model}`;
        if (!state.modelBreakdown[mKey]) {
            state.modelBreakdown[mKey] = {
                provider,
                model,
                requests: 0,
                tokens: 0,
                spendUsd: 0,
                tier: pricing.tier
            };
        }
        state.modelBreakdown[mKey].requests += 1;
        state.modelBreakdown[mKey].tokens += totalTokens;
        state.modelBreakdown[mKey].spendUsd = Number((state.modelBreakdown[mKey].spendUsd + actualCost).toFixed(6));

        // Key breakdown
        const kId = keyId || "gateway_default";
        if (!state.keyBreakdown[kId]) {
            state.keyBreakdown[kId] = {
                id: kId,
                label: keyLabel,
                spendCap: typeof keyCap === 'number' ? keyCap : null,
                requests: 0,
                tokens: 0,
                spendUsd: 0
            };
        }
        state.keyBreakdown[kId].requests += 1;
        state.keyBreakdown[kId].tokens += totalTokens;
        state.keyBreakdown[kId].spendUsd = Number((state.keyBreakdown[kId].spendUsd + actualCost).toFixed(6));

        // Fire-and-forget async persistence
        this.persistState(workspaceId).catch(() => {});

        return {
            actualCost,
            costSaved,
            currentMonthSpend: state.currentMonthSpendUsd
        };
    }

    /**
     * Get summary metrics for the UI
     */
    async getSummary(workspaceId) {
        await this.loadState(workspaceId);
        const state = this._getWorkspaceState(workspaceId);
        const budget = state.config.monthlyBudgetUsd;
        const current = state.currentMonthSpendUsd;

        const percentUsed = budget > 0 ? Math.min(100, Math.round((current / budget) * 100)) : 0;
        const isAlert = budget > 0 && percentUsed >= state.config.alertThresholdPercent;
        const isExceeded = budget > 0 && current >= budget;

        // Days elapsed in current month for run-rate projection
        const now = new Date();
        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const dailyRunRate = dayOfMonth > 0 ? (current / dayOfMonth) : 0;
        const projectedMonthSpendUsd = Number((dailyRunRate * daysInMonth).toFixed(2));

        const modelsList = Object.values(state.modelBreakdown).sort((a, b) => b.spendUsd - a.spendUsd);
        const keysList = Object.values(state.keyBreakdown).sort((a, b) => b.spendUsd - a.spendUsd);

        return {
            billingMonth: state.billingMonth,
            monthlyBudgetUsd: budget,
            currentMonthSpendUsd: Number(current.toFixed(4)),
            projectedMonthSpendUsd,
            percentUsed,
            isAlert,
            isExceeded,
            totalCostSavedUsd: Number(state.totalCostSavedUsd.toFixed(4)),
            totalTokensProcessed: state.totalTokensProcessed,
            config: state.config,
            modelsList,
            keysList
        };
    }

    /**
     * Update configuration
     */
    async updateConfig(workspaceId, newConfig) {
        await this.loadState(workspaceId);
        const state = this._getWorkspaceState(workspaceId);
        state.config = { ...state.config, ...newConfig };
        await this.persistState(workspaceId);
        return state.config;
    }

    /**
     * Reset current billing cycle metrics
     */
    async resetMonthlySpend(workspaceId) {
        const state = this._getWorkspaceState(workspaceId);
        state.currentMonthSpendUsd = 0;
        state.totalTokensProcessed = 0;
        state.totalCostSavedUsd = 0;
        state.modelBreakdown = {};
        state.keyBreakdown = {};
        await this.persistState(workspaceId);
        return true;
    }
}

export const spendGuard = new SpendGuardEngine();
