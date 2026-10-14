'use server';

import { 
    getTelemetryLogs, 
    getTelemetryStats, 
    getComprehensiveAnalytics, 
    clearTelemetryLogs 
} from "../_lib/telemetry-store";

import { circuitBreaker } from "../_lib/circuit-breaker";

export async function getTelemetryLogsAction(workspaceId = "default") {
    try {
        const logs = getTelemetryLogs(workspaceId);
        const stats = getTelemetryStats(workspaceId);
        return { success: true, logs, stats };
    } catch (error) {
        console.error("getTelemetryLogsAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getComprehensiveAnalyticsAction(workspaceId = "default") {
    try {
        const data = getComprehensiveAnalytics(workspaceId);
        return { success: true, data };
    } catch (error) {
        console.error("getComprehensiveAnalyticsAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function clearTelemetryLogsAction(workspaceId = "default") {
    try {
        clearTelemetryLogs(workspaceId);
        return { success: true };
    } catch (error) {
        console.error("clearTelemetryLogsAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getCircuitBreakerStatusesAction() {
    try {
        const statuses = circuitBreaker.getAllStatuses();
        return { success: true, statuses };
    } catch (error) {
        console.error("getCircuitBreakerStatusesAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function resetCircuitBreakerAction(keyId, provider, model) {
    try {
        circuitBreaker.reset(keyId, provider, model);
        return { success: true };
    } catch (error) {
        console.error("resetCircuitBreakerAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getCacheStatsAction() {
    try {
        const { gatewayCache } = await import("../_lib/gateway-cache");
        const stats = gatewayCache.getStats();
        return { success: true, stats };
    } catch (error) {
        console.error("getCacheStatsAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function clearCacheAction() {
    try {
        const { gatewayCache } = await import("../_lib/gateway-cache");
        gatewayCache.clear();
        return { success: true };
    } catch (error) {
        console.error("clearCacheAction Error:", error);
        return { success: false, error: error.message };
    }
}


