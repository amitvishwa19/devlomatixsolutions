'use server';

import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

/**
 * Get AI chatbot and auto-responder configuration from isolated tables
 */
export async function getChatbotConfigAction(workspaceId) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // Fetch isolated settings
        let setting = await db.konnectLegacySetting.findUnique({
            where: { workspaceId }
        });

        if (!setting) {
            setting = await db.konnectLegacySetting.create({
                data: {
                    workspaceId,
                    userId,
                    aiEnabled: false,
                    aiModel: 'gemini-2.0-flash',
                    aiSystemPrompt: 'You are a helpful customer concierge for Devlomatix. Keep responses friendly, concise, and helpful. Use emojis appropriately.',
                    aiTemperature: 0.7
                }
            });
        }

        // Fetch isolated rules
        let rules = await db.konnectLegacyChatbotRule.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'asc' }
        });

        if (rules.length === 0) {
            // Seed starter rules
            const defaultRules = [
                { keyword: 'PRICE', matchType: 'contains', response: 'Hello! Our pricing plans start at $19/mo. Reply 1 to speak with an account executive.' },
                { keyword: 'HOURS', matchType: 'exact', response: 'Our operating hours are Monday through Saturday, 9:00 AM - 7:00 PM IST.' },
                { keyword: 'STOP', matchType: 'exact', response: 'You have been unsubscribed from notifications. Reply START anytime to re-enable.' }
            ];

            for (const r of defaultRules) {
                await db.konnectLegacyChatbotRule.create({
                    data: {
                        workspaceId,
                        userId,
                        keyword: r.keyword,
                        matchType: r.matchType,
                        response: r.response,
                        active: true
                    }
                });
            }

            rules = await db.konnectLegacyChatbotRule.findMany({
                where: { workspaceId },
                orderBy: { createdAt: 'asc' }
            });
        }

        return {
            success: true,
            config: {
                id: setting.id,
                active: setting.aiEnabled || rules.some(r => r.active),
                aiEnabled: setting.aiEnabled,
                model: setting.aiModel,
                systemPrompt: setting.aiSystemPrompt || '',
                temperature: setting.aiTemperature,
                rules: rules.map(r => ({
                    id: r.id,
                    keyword: r.keyword,
                    matchType: r.matchType,
                    response: r.response,
                    active: r.active
                }))
            }
        };
    } catch (error) {
        console.error("[GET_CHATBOT_CONFIG_ERROR]", error);
        return { success: false, error: error.message || "Failed to load chatbot config" };
    }
}

/**
 * Save AI chatbot and auto-responder configuration
 */
export async function saveChatbotConfigAction(workspaceId, config) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // Upsert isolated settings
        await db.konnectLegacySetting.upsert({
            where: { workspaceId },
            update: {
                aiEnabled: config.aiEnabled ?? false,
                aiModel: config.model || 'gemini-2.0-flash',
                aiSystemPrompt: config.systemPrompt || '',
                aiTemperature: config.temperature ?? 0.7
            },
            create: {
                workspaceId,
                userId,
                aiEnabled: config.aiEnabled ?? false,
                aiModel: config.model || 'gemini-2.0-flash',
                aiSystemPrompt: config.systemPrompt || '',
                aiTemperature: config.temperature ?? 0.7
            }
        });

        // Sync rules in isolated KonnectLegacyChatbotRule table
        if (Array.isArray(config.rules)) {
            for (const rule of config.rules) {
                if (rule.id && !rule.id.startsWith('rule-')) {
                    await db.konnectLegacyChatbotRule.update({
                        where: { id: rule.id },
                        data: {
                            keyword: rule.keyword,
                            matchType: rule.matchType || 'contains',
                            response: rule.response,
                            active: rule.active ?? true
                        }
                    }).catch(() => {});
                } else if (rule.keyword && rule.response) {
                    await db.konnectLegacyChatbotRule.create({
                        data: {
                            workspaceId,
                            userId,
                            keyword: rule.keyword,
                            matchType: rule.matchType || 'contains',
                            response: rule.response,
                            active: rule.active ?? true
                        }
                    }).catch(() => {});
                }
            }
        }

        return { success: true };
    } catch (error) {
        console.error("[SAVE_CHATBOT_CONFIG_ERROR]", error);
        return { success: false, error: error.message || "Failed to save chatbot config" };
    }
}
