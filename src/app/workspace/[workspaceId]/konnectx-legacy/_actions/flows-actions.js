'use server';

import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

/**
 * Get all interactive WhatsApp decision tree flows from isolated KonnectLegacyFlow table
 */
export async function getKonnectFlowsAction(workspaceId) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        let flows = await db.konnectLegacyFlow.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' }
        });

        // If none exist, seed default sample flow
        if (flows.length === 0) {
            const defaultFlow = await db.konnectLegacyFlow.create({
                data: {
                    workspaceId,
                    userId,
                    name: 'Customer Welcome & Routing',
                    description: 'Interactive numbered WhatsApp tree routing to Sales, Support, or Pricing',
                    active: true,
                    triggerKeyword: 'HI',
                    welcomeMessage: '👋 Welcome to Devlomatix!\n\nPlease reply with an option number:\n1️⃣ Product Demo & Features\n2️⃣ Pricing & Plans\n3️⃣ Talk to Human Agent\n4️⃣ Operating Hours',
                    steps: [
                        { option: '1', response: '🚀 Our platform combines AI Omniroute, Konnect WhatsApp Automation, and HireFlow ATS. Visit https://devlomatix.com to view interactive demos!' },
                        { option: '2', response: '💳 Plans start at $19/mo for Starter, $49/mo for Growth, and custom Enterprise tiers. Reply 3 to speak with Sales.' },
                        { option: '3', response: '👤 An agent has been alerted and will join this WhatsApp chat shortly!' },
                        { option: '4', response: '⏰ We are active Mon-Sat from 9am - 7pm IST.' }
                    ]
                }
            });
            flows.push(defaultFlow);
        }

        const formatted = flows.map(f => ({
            id: f.id,
            name: f.name,
            description: f.description,
            active: f.active,
            triggerKeyword: f.triggerKeyword,
            welcomeMessage: f.welcomeMessage,
            steps: Array.isArray(f.steps) ? f.steps : [],
            createdAt: f.createdAt
        }));

        return { success: true, flows: formatted };
    } catch (error) {
        console.error("[GET_KONNECT_FLOWS_ERROR]", error);
        return { success: false, error: error.message || "Failed to load flows", flows: [] };
    }
}

/**
 * Save or update an interactive flow in KonnectLegacyFlow
 */
export async function saveKonnectFlowAction(workspaceId, flowData) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const { id, name, description, triggerKeyword, welcomeMessage, steps, active } = flowData;

        let flow;
        if (id) {
            flow = await db.konnectLegacyFlow.update({
                where: { id },
                data: {
                    name,
                    description: description || undefined,
                    triggerKeyword: triggerKeyword || 'HI',
                    welcomeMessage: welcomeMessage || '',
                    steps: steps || [],
                    active: active ?? true
                }
            });
        } else {
            flow = await db.konnectLegacyFlow.create({
                data: {
                    workspaceId,
                    userId,
                    name: name || 'New Workflow',
                    description: description || '',
                    triggerKeyword: triggerKeyword || 'HI',
                    welcomeMessage: welcomeMessage || '',
                    steps: steps || [],
                    active: active ?? true
                }
            });
        }

        return { success: true, flow };
    } catch (error) {
        console.error("[SAVE_KONNECT_FLOW_ERROR]", error);
        return { success: false, error: error.message || "Failed to save flow" };
    }
}

/**
 * Toggle flow active status
 */
export async function toggleKonnectFlowAction(workspaceId, flowId, active) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        await db.konnectLegacyFlow.update({
            where: { id: flowId },
            data: { active }
        });

        return { success: true };
    } catch (error) {
        console.error("[TOGGLE_KONNECT_FLOW_ERROR]", error);
        return { success: false, error: error.message || "Failed to toggle flow" };
    }
}

/**
 * Delete a flow
 */
export async function deleteKonnectFlowAction(workspaceId, flowId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        await db.konnectLegacyFlow.delete({
            where: { id: flowId }
        });

        return { success: true };
    } catch (error) {
        console.error("[DELETE_KONNECT_FLOW_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete flow" };
    }
}
