import { db } from "@/lib/db";
import * as cloudApi from "./whatsapp-cloud-api";
import { waAIService } from "./ai-service";
import { symmetricDecrypt } from "@/lib/encryption";

/**
 * WhatsAppBotEngine: Executes node-based chatbot flows for Cloud API.
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
     * Helper to get Cloud Credentials
     */
    async getCredentials(workspaceId) {
        const credential = await db.credentials.findFirst({
            where: { 
                workspaceId, 
                platform: 'WHATSAPP_CLOUD',
                isDefault: true 
            }
        });

        if (!credential) return null;

        let cloudCreds = null;
        const stored = credential.credentials;
        if (typeof stored === 'string' && stored.includes(':')) {
            cloudCreds = JSON.parse(symmetricDecrypt(stored));
        } else if (typeof stored === 'string') {
            cloudCreds = JSON.parse(stored);
        } else {
            cloudCreds = stored;
        }
        return cloudCreds;
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
        const creds = await this.getCredentials(workspaceId);

        try {
            switch (node.type) {
                case 'message':
                    const text = this.interpolate(node.data?.text || node.data?.message || "", context);
                    if (creds) await cloudApi.sendTextMessage(creds, from, text);
                    break;

                case 'aiAssistant':
                    const aiResponse = await waAIService.generateRAGResponse(workspaceId, messageText, node.data?.category || 'GENERAL');
                    if (creds) await cloudApi.sendTextMessage(creds, from, aiResponse);
                    break;

                case 'interactive':
                    if (creds) await cloudApi.sendInteractiveMessage(creds, from, node.data?.payload || node.data);
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
