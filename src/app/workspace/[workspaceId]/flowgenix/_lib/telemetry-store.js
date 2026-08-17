/**
 * FlowGenix Real-Time Telemetry & Cost Analytics Engine
 * Maintains live request metrics, cost estimations, provider distribution, and timeline aggregations.
 */

// Global buffer across hot-reloads
if (!globalThis._flowgenixTelemetry) {
    globalThis._flowgenixTelemetry = new Map();
}

const MAX_LOGS_PER_WORKSPACE = 200;

// Standard market pricing per 1M tokens ($ in / $ out)
export const PROVIDER_PRICING = {
    "freemodel": { in: 0.00, out: 0.00, name: "FreeModel.dev (Free Tier)" },
    "groq": { in: 0.05, out: 0.08, name: "Groq Cloud" },
    "google": { in: 0.075, out: 0.30, name: "Google AI Studio" },
    "deepseek": { in: 0.14, out: 0.28, name: "DeepSeek API" },
    "openrouter": { in: 0.20, out: 0.40, name: "OpenRouter" },
    "openai": { in: 0.15, out: 0.60, name: "OpenAI" },
    "anthropic": { in: 0.80, out: 4.00, name: "Anthropic Claude" },
    "nvidia": { in: 0.00, out: 0.00, name: "NVIDIA NIM" },
    "ollama": { in: 0.00, out: 0.00, name: "Ollama Local GPU" }
};

/**
 * Calculate estimated dollar cost for a request
 */
export function calculateRequestCost(provider = "", tokensIn = 0, tokensOut = 0) {
    const provKey = provider.toLowerCase();
    const rate = PROVIDER_PRICING[provKey] || { in: 0.15, out: 0.50 };
    const costIn = (Number(tokensIn) / 1_000_000) * rate.in;
    const costOut = (Number(tokensOut) / 1_000_000) * rate.out;
    return Number((costIn + costOut).toFixed(6));
}

/**
 * Record a live request in the telemetry buffer
 */
export function recordTelemetry({
    workspaceId = "default",
    requestModel,
    resolvedProvider,
    resolvedModel,
    tokensIn = 0,
    tokensOut = 0,
    compressionSavings = "0%",
    latencyMs = 0,
    status = 200,
    error = null,
    hasAttachments = false
}) {
    if (!globalThis._flowgenixTelemetry.has(workspaceId)) {
        globalThis._flowgenixTelemetry.set(workspaceId, []);
    }

    const logs = globalThis._flowgenixTelemetry.get(workspaceId);

    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0]; // HH:MM:SS
    const cost = calculateRequestCost(resolvedProvider, tokensIn, tokensOut);
    
    // Estimate savings: if compressed 30%, cost before was cost / 0.7
    const savingsPercentNum = parseFloat(compressionSavings) || 0;
    const costSaved = savingsPercentNum > 0 ? (cost * (savingsPercentNum / 100)) : 0;

    const entry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: now.toISOString(),
        time: timeString,
        hour: `${now.getHours().toString().padStart(2, '0')}:00`,
        requestModel: requestModel || "auto",
        resolvedProvider: resolvedProvider || "Unknown Provider",
        resolvedModel: resolvedModel || "unknown-model",
        tokens: Number(tokensIn) + Number(tokensOut),
        tokensIn: Number(tokensIn),
        tokensOut: Number(tokensOut),
        latency: `${latencyMs}ms`,
        latencyMs: Number(latencyMs),
        status: Number(status),
        compressed: compressionSavings || "0%",
        savingsPercent: savingsPercentNum,
        cost: Number(cost.toFixed(6)),
        costSaved: Number(costSaved.toFixed(6)),
        hasAttachments: Boolean(hasAttachments),
        error: error || null
    };

    logs.unshift(entry);

    if (logs.length > MAX_LOGS_PER_WORKSPACE) {
        logs.pop();
    }

    return entry;
}

export function getTelemetryLogs(workspaceId = "default") {
    return globalThis._flowgenixTelemetry.get(workspaceId) || [];
}

export function clearTelemetryLogs(workspaceId = "default") {
    if (globalThis._flowgenixTelemetry.has(workspaceId)) {
        globalThis._flowgenixTelemetry.set(workspaceId, []);
    }
    return true;
}

export function getTelemetryStats(workspaceId = "default") {
    const logs = getTelemetryLogs(workspaceId);
    if (!logs || logs.length === 0) {
        return {
            totalRequests: 0,
            avgLatencyMs: 0,
            totalTokensSaved: 0,
            successRate: 100
        };
    }

    const totalRequests = logs.length;
    const totalLatency = logs.reduce((sum, l) => sum + (l.latencyMs || 0), 0);
    const avgLatencyMs = Math.round(totalLatency / totalRequests);
    const successCount = logs.filter(l => l.status >= 200 && l.status < 400).length;
    const successRate = Math.round((successCount / totalRequests) * 100);

    return {
        totalRequests,
        avgLatencyMs,
        successRate
    };
}

/**
 * Generate comprehensive Analytics and Cost Breakdown
 */
export function getComprehensiveAnalytics(workspaceId = "default") {
    const logs = getTelemetryLogs(workspaceId);

    // Initial default state if fresh
    if (!logs || logs.length === 0) {
        return {
            summary: {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                successRate: 100,
                totalTokensIn: 0,
                totalTokensOut: 0,
                totalTokens: 0,
                avgLatencyMs: 0,
                totalCostUsd: "0.0000",
                totalCostSavedUsd: "0.0000",
                avgCompressionRate: "0%"
            },
            providerBreakdown: [],
            modelBreakdown: [],
            timeline: [],
            latencyDistribution: [
                { range: "< 200ms", count: 0 },
                { range: "200-500ms", count: 0 },
                { range: "500ms-1s", count: 0 },
                { range: "1s - 2s", count: 0 },
                { range: "> 2s", count: 0 }
            ]
        };
    }

    const totalRequests = logs.length;
    const successfulRequests = logs.filter(l => l.status >= 200 && l.status < 400).length;
    const failedRequests = totalRequests - successfulRequests;
    const successRate = Math.round((successfulRequests / totalRequests) * 100);

    const totalTokensIn = logs.reduce((sum, l) => sum + (l.tokensIn || 0), 0);
    const totalTokensOut = logs.reduce((sum, l) => sum + (l.tokensOut || 0), 0);
    const totalTokens = totalTokensIn + totalTokensOut;

    const totalLatency = logs.reduce((sum, l) => sum + (l.latencyMs || 0), 0);
    const avgLatencyMs = Math.round(totalLatency / totalRequests);

    const totalCost = logs.reduce((sum, l) => sum + (l.cost || 0), 0);
    const totalCostSaved = logs.reduce((sum, l) => sum + (l.costSaved || 0), 0);

    const totalSavingsSum = logs.reduce((sum, l) => sum + (l.savingsPercent || 0), 0);
    const avgCompressionRate = `${Math.round(totalSavingsSum / totalRequests)}%`;

    // Group by Provider
    const providerMap = new Map();
    logs.forEach(l => {
        const prov = l.resolvedProvider || "Other";
        if (!providerMap.has(prov)) {
            providerMap.set(prov, { provider: prov, count: 0, tokens: 0, cost: 0, latencySum: 0 });
        }
        const p = providerMap.get(prov);
        p.count += 1;
        p.tokens += (l.tokens || 0);
        p.cost += (l.cost || 0);
        p.latencySum += (l.latencyMs || 0);
    });

    const providerBreakdown = Array.from(providerMap.values()).map(p => ({
        provider: p.provider,
        count: p.count,
        percentage: Math.round((p.count / totalRequests) * 100),
        tokens: p.tokens,
        cost: p.cost.toFixed(4),
        avgLatency: Math.round(p.latencySum / p.count)
    })).sort((a, b) => b.count - a.count);

    // Group by Model
    const modelMap = new Map();
    logs.forEach(l => {
        const mod = l.resolvedModel || "unknown";
        if (!modelMap.has(mod)) {
            modelMap.set(mod, { model: mod, provider: l.resolvedProvider, count: 0, tokens: 0, cost: 0, latencySum: 0 });
        }
        const m = modelMap.get(mod);
        m.count += 1;
        m.tokens += (l.tokens || 0);
        m.cost += (l.cost || 0);
        m.latencySum += (l.latencyMs || 0);
    });

    const modelBreakdown = Array.from(modelMap.values()).map(m => ({
        model: m.model,
        provider: m.provider,
        count: m.count,
        tokens: m.tokens,
        cost: m.cost.toFixed(4),
        avgLatency: Math.round(m.latencySum / m.count)
    })).sort((a, b) => b.count - a.count);

    // Timeline Aggregation (Chronological)
    const timelineMap = new Map();
    [...logs].reverse().forEach(l => {
        const hour = l.hour || "Recent";
        if (!timelineMap.has(hour)) {
            timelineMap.set(hour, { hour, requests: 0, tokensIn: 0, tokensOut: 0, cost: 0, avgLatency: 0, latencySum: 0 });
        }
        const t = timelineMap.get(hour);
        t.requests += 1;
        t.tokensIn += (l.tokensIn || 0);
        t.tokensOut += (l.tokensOut || 0);
        t.cost += (l.cost || 0);
        t.latencySum += (l.latencyMs || 0);
        t.avgLatency = Math.round(t.latencySum / t.requests);
    });

    const timeline = Array.from(timelineMap.values()).map(t => ({
        ...t,
        cost: Number(t.cost.toFixed(4))
    }));

    // Latency Distribution
    const latencyDistribution = [
        { range: "< 200ms", count: logs.filter(l => l.latencyMs < 200).length },
        { range: "200-500ms", count: logs.filter(l => l.latencyMs >= 200 && l.latencyMs < 500).length },
        { range: "500ms-1s", count: logs.filter(l => l.latencyMs >= 500 && l.latencyMs < 1000).length },
        { range: "1s - 2s", count: logs.filter(l => l.latencyMs >= 1000 && l.latencyMs < 2000).length },
        { range: "> 2s", count: logs.filter(l => l.latencyMs >= 2000).length }
    ];

    return {
        summary: {
            totalRequests,
            successfulRequests,
            failedRequests,
            successRate,
            totalTokensIn,
            totalTokensOut,
            totalTokens,
            avgLatencyMs,
            totalCostUsd: totalCost.toFixed(4),
            totalCostSavedUsd: totalCostSaved.toFixed(4),
            avgCompressionRate
        },
        providerBreakdown,
        modelBreakdown,
        timeline,
        latencyDistribution
    };
}
