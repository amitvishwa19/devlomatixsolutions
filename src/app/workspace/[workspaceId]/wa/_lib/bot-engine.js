import { db } from "@/lib/db";
import { waManager } from "./whatsapp-v2";
import { waAIService } from "./ai-service";

/**
 * WhatsAppBotEngine: Executes node-based chatbot flows.
 */
export class WhatsAppBotEngine {
    static instance;

    constructor() {}

    static getInstance() {
        if (!WhatsAppBotEngine.instance) {
            WhatsAppBotEngine.instance = new WhatsAppBotEngine();
        }
        return WhatsAppBotEngine.instance;
    }

    /**
     * Entry point: Process an incoming message through the active flow.
     */
    async processIncomingMessage(userId, workspaceId, from, messageText) {
        try {
            // 1. Find active bot flow for this user
            const flow = await db.botFlow.findFirst({
                where: { userId, active: true },
                orderBy: { updatedAt: 'desc' }
            });

            if (!flow) return; 

            console.log(`[BotEngine] Triggering Flow: ${flow.name} for ${from}`);

            const nodes = flow.nodes || [];
            const edges = flow.edges || [];
            
            const startNode = nodes.find(n => n.type === 'trigger' || n.type === 'start');
            if (!startNode) return;

            await this.executeNode(startNode.id, { userId, workspaceId, from, messageText, nodes, edges });

        } catch (error) {
            console.error("[BotEngine] Execution Error:", error);
        }
    }

    async executeNode(nodeId, context) {
        const { nodes, edges, from, messageText, workspaceId, userId } = context;
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        console.log(`[BotEngine] Executing Node: ${node.type} (${node.id})`);

        let nextNodeId = null;

        try {
            switch (node.type) {
                case 'message':
                    const text = this.interpolate(node.data?.text || node.data?.message || "", context);
                    await waManager.sendMessage(from, { text });
                    break;

                case 'aiAssistant':
                    const aiResponse = await waAIService.generateRAGResponse(workspaceId, messageText, node.data?.category || 'GENERAL');
                    await waManager.sendMessage(from, { text: aiResponse });
                    break;

                case 'interactive':
                    await waManager.sendMessage(from, node.data?.payload || node.data);
                    break;

                case 'condition':
                    const branches = edges.filter(e => e.source === nodeId);
                    const match = branches.find(e => {
                        const label = e.label?.toLowerCase() || "";
                        return messageText.toLowerCase().includes(label);
                    });
                    if (match) nextNodeId = match.target;
                    break;
            }

            if (!nextNodeId) {
                const outgoingEdge = edges.find(e => e.source === nodeId);
                if (outgoingEdge) nextNodeId = outgoingEdge.target;
            }

            if (nextNodeId) {
                await this.executeNode(nextNodeId, context);
            }

        } catch (err) {
            console.error(`[BotEngine] Error in node ${nodeId}:`, err);
        }
    }

    interpolate(text, context) {
        return text.replace(/\{\{(.*?)\}\}/g, (match, key) => {
            const k = key.trim();
            if (k === 'message') return context.messageText;
            if (k === 'from') return context.from;
            return match;
        });
    }
}

export const waBotEngine = WhatsAppBotEngine.getInstance();
