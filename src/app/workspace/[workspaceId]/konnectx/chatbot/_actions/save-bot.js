'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const SaveBotSchema = z.object({
    workspaceId: z.string(),
    id: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    active: z.boolean().optional(),
    nodes: z.any().optional(),
    edges: z.any().optional(),
    triggerKeywords: z.string().optional(),
    responseText: z.string().optional(),
    fallbackText: z.string().optional(),
});

const handler = async (data) => {
    const { workspaceId, id, name, description, active, nodes, edges, triggerKeywords, responseText, fallbackText } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;
        const shouldBuildSimpleFlow = triggerKeywords !== undefined || responseText !== undefined || fallbackText !== undefined;
        const simpleNodes = shouldBuildSimpleFlow ? [
            {
                id: 'start_node',
                type: 'triggerNode',
                position: { x: 100, y: 100 },
                data: {
                    label: 'Keyword Trigger',
                    subType: 'keyword',
                    type: 'keyword',
                    keywords: triggerKeywords || 'hello, hi, start',
                    configured: true
                }
            },
            {
                id: 'auto_reply',
                type: 'messageNode',
                position: { x: 430, y: 100 },
                data: {
                    label: 'Auto Reply',
                    subType: 'textMessage',
                    text: responseText || 'Hello! Thanks for messaging us. How can we help you today?',
                    configured: true
                }
            },
            {
                id: 'fallback_reply',
                type: 'messageNode',
                position: { x: 430, y: 280 },
                data: {
                    label: 'Fallback Reply',
                    subType: 'textMessage',
                    text: fallbackText || '',
                    isFallback: true,
                    configured: Boolean(fallbackText)
                }
            }
        ] : undefined;
        const simpleEdges = shouldBuildSimpleFlow ? [
            {
                id: 'start_node-auto_reply',
                source: 'start_node',
                target: 'auto_reply',
                animated: true,
                style: { stroke: '#10b981', strokeWidth: 2 }
            }
        ] : undefined;

        if (id) {
            // Update
            const updated = await db.botFlow.update({
                where: { id, userId },
                data: {
                    name: name !== undefined ? name : undefined,
                    description: description !== undefined ? description : undefined,
                    active: active !== undefined ? active : undefined,
                    nodes: nodes !== undefined ? nodes : simpleNodes,
                    edges: edges !== undefined ? edges : simpleEdges,
                }
            });
            return { success: true, bot: updated };
        } else {
            // Create
            if (!name) return { error: "Name is required for new bots" };
            const defaultNodes = simpleNodes || [
                {
                    id: 'start_node',
                    type: 'triggerNode',
                    position: { x: 100, y: 100 },
                    data: {
                        label: 'Keyword Trigger',
                        subType: 'keyword',
                        type: 'keyword',
                        keywords: 'hello, hi, start',
                        configured: true
                    }
                },
                {
                    id: 'auto_reply',
                    type: 'messageNode',
                    position: { x: 430, y: 100 },
                    data: {
                        label: 'Auto Reply',
                        subType: 'textMessage',
                        text: 'Hello! Thanks for messaging us. How can we help you today?',
                        configured: true
                    }
                }
            ];
            const defaultEdges = simpleEdges || [
                {
                    id: 'start_node-auto_reply',
                    source: 'start_node',
                    target: 'auto_reply',
                    animated: true,
                    style: { stroke: '#10b981', strokeWidth: 2 }
                }
            ];
            const newBotFlow = await db.botFlow.create({
                data: {
                    name,
                    description,
                    userId,
                    active: active !== undefined ? active : true,
                    nodes: defaultNodes,
                    edges: defaultEdges,
                    // Create a default start step
                    steps: {
                        create: {
                            type: 'trigger',
                            config: { keyword: name.toLowerCase().replace(/\s+/g, '_'), type: 'keyword' },
                            positionX: 100,
                            positionY: 100,
                            order: 0
                        }
                    }
                }
            });
            return { success: true, bot: newBotFlow };
        }
    } catch (error) {
        return { error: error.message || "Failed to save bot" };
    }
};

export const saveBot = createSafeAction(SaveBotSchema, handler);
