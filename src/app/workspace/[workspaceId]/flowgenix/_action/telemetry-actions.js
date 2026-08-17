'use server';

import { getTelemetryLogs, getTelemetryStats, clearTelemetryLogs } from "../_lib/telemetry-store";

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

export async function clearTelemetryLogsAction(workspaceId = "default") {
    try {
        clearTelemetryLogs(workspaceId);
        return { success: true };
    } catch (error) {
        console.error("clearTelemetryLogsAction Error:", error);
        return { success: false, error: error.message };
    }
}
