'use server';

import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { konnectLegacyManager } from "../_lib/baileys-manager";

const DEFAULT_SETTINGS = {
    minDelaySeconds: 3,
    maxDelaySeconds: 8,
    simulateTyping: true,
    batchCooldownMinutes: 2,
    batchSize: 50,
    autoReadIncoming: false,
    dailySafetyLimit: 500,
    webhookUrl: ''
};

/**
 * Get Konnect Legacy settings and connected device profile from isolated table
 */
export async function getKonnectSettingsAction(workspaceId) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // Fetch connection status from Baileys manager
        let connectionStatus = { status: 'DISCONNECTED' };
        try {
            if (typeof konnectLegacyManager?.getStatus === 'function') {
                connectionStatus = await konnectLegacyManager.getStatus(workspaceId);
            } else if (typeof konnectLegacyManager?.getSessionState === 'function') {
                const mem = konnectLegacyManager.getSessionState(workspaceId);
                connectionStatus = { status: mem?.status || 'DISCONNECTED', phoneNumber: mem?.phoneNumber || null };
            }
        } catch (_) {}

        // Fetch isolated settings record
        let settingRecord = await db.konnectLegacySetting.findUnique({
            where: { workspaceId }
        });

        if (!settingRecord) {
            settingRecord = await db.konnectLegacySetting.create({
                data: {
                    workspaceId,
                    userId,
                    ...DEFAULT_SETTINGS
                }
            });
        }

        return {
            success: true,
            settings: {
                minDelaySeconds: settingRecord.minDelaySeconds,
                maxDelaySeconds: settingRecord.maxDelaySeconds,
                simulateTyping: settingRecord.simulateTyping,
                batchCooldownMinutes: settingRecord.batchCooldownMinutes,
                batchSize: settingRecord.batchSize,
                autoReadIncoming: settingRecord.autoReadIncoming,
                dailySafetyLimit: settingRecord.dailySafetyLimit,
                webhookUrl: settingRecord.webhookUrl || ''
            },
            connectionStatus
        };
    } catch (error) {
        console.error("[GET_KONNECT_SETTINGS_ERROR]", error);
        return {
            success: false,
            error: error.message || "Failed to load settings",
            settings: DEFAULT_SETTINGS,
            connectionStatus: { status: 'DISCONNECTED' }
        };
    }
}

/**
 * Save Konnect Legacy anti-ban settings into isolated table
 */
export async function saveKonnectSettingsAction(workspaceId, newSettings) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const merged = { ...DEFAULT_SETTINGS, ...newSettings };

        const updated = await db.konnectLegacySetting.upsert({
            where: { workspaceId },
            update: {
                minDelaySeconds: merged.minDelaySeconds,
                maxDelaySeconds: merged.maxDelaySeconds,
                simulateTyping: merged.simulateTyping,
                batchCooldownMinutes: merged.batchCooldownMinutes,
                batchSize: merged.batchSize,
                autoReadIncoming: merged.autoReadIncoming,
                dailySafetyLimit: merged.dailySafetyLimit,
                webhookUrl: merged.webhookUrl || null
            },
            create: {
                workspaceId,
                userId,
                minDelaySeconds: merged.minDelaySeconds,
                maxDelaySeconds: merged.maxDelaySeconds,
                simulateTyping: merged.simulateTyping,
                batchCooldownMinutes: merged.batchCooldownMinutes,
                batchSize: merged.batchSize,
                autoReadIncoming: merged.autoReadIncoming,
                dailySafetyLimit: merged.dailySafetyLimit,
                webhookUrl: merged.webhookUrl || null
            }
        });

        return { success: true, settings: updated };
    } catch (error) {
        console.error("[SAVE_KONNECT_SETTINGS_ERROR]", error);
        return { success: false, error: error.message || "Failed to save settings" };
    }
}
