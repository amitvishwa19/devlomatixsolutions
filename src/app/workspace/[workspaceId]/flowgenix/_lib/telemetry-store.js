/**
 * FlowGenix Live Telemetry Store
 * Maintains real-time request logs, provider resolutions, latencies, and token savings.
 */

// In-memory telemetry buffer attached to globalThis to persist across hot-reloads
if (!globalThis._flowgenixTelemetry) {
    globalThis._flowgenixTelemetry = new Map();
}

const MAX_LOGS_PER_WORKSPACE = 100;

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
    error = null
}) {
    if (!globalThis._flowgenixTelemetry.has(workspaceId)) {
        globalThis._flowgenixTelemetry.set(workspaceId, []);
    }

    const logs = globalThis._flowgenixTelemetry.get(workspaceId);

    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0]; // HH:MM:SS

    const entry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: now.toISOString(),
        time: timeString,
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
        error: error || null
    };

    logs.unshift(entry);

    if (logs.length > MAX_LOGS_PER_WORKSPACE) {
        logs.pop();
    }

    return entry;
}

export function getTelemetryLogs(workspaceId = "default") {
    const logs = globalThis._flowgenixTelemetry.get(workspaceId) || [];
    // If no real logs yet, return empty list (or fallback samples if completely fresh)
    return logs;
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
