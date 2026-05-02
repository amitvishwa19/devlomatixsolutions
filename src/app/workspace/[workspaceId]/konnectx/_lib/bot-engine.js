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
    async getCredentials(workspaceId, userId) {
        let credential = await db.credentials.findFirst({
            where: {
                workspaceId,
                userId,
                platform: 'WHATSAPP_CLOUD',
                isDefault: true
            }
        });

        if (!credential) {
            credential = await db.credentials.findFirst({
                where: {
                    workspaceId,
                    userId,
                    platform: 'WHATSAPP_CLOUD'
                },
                orderBy: { updatedAt: 'desc' }
            });
        }

        if (!credential) {
            credential = await db.credentials.findFirst({
                where: {
                    userId,
                    platform: 'WHATSAPP_CLOUD',
                    isDefault: true
                }
            });
        }

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
        if (cloudCreds?.enc) {
            cloudCreds = JSON.parse(symmetricDecrypt(cloudCreds.enc));
        }
        return cloudCreds;
    }

    /**
     * Entry point: Process an incoming message through the active flow.
     */
    async processIncomingMessage(userId, workspaceId, from, messageText) {
        try {
            const flows = await db.botFlow.findMany({
                where: { userId, active: true },
                orderBy: { updatedAt: 'desc' }
            });

            if (!flows.length) return;

            const normalizedMessage = String(messageText || '').trim();
            const flow = this.pickMatchingFlow(flows, normalizedMessage);
            if (!flow) return;

            console.log(`[BotEngine] Triggering Flow: ${flow.name} for ${from}`);

            const nodes = Array.isArray(flow.nodes) ? flow.nodes : [];
            const edges = Array.isArray(flow.edges) ? flow.edges : [];

            const startNode = this.findMatchingTrigger(nodes, normalizedMessage) || this.findFallbackNode(nodes);
            if (!startNode) return;

            await this.executeNode(startNode.id, {
                userId,
                workspaceId,
                from,
                messageText: normalizedMessage,
                nodes,
                edges,
                visited: new Set()
            });

        } catch (error) {
            console.error("[BotEngine] Execution Error:", error);
        }
    }

    pickMatchingFlow(flows, messageText) {
        return flows.find(flow => this.findMatchingTrigger(Array.isArray(flow.nodes) ? flow.nodes : [], messageText))
            || flows.find(flow => this.findFallbackNode(Array.isArray(flow.nodes) ? flow.nodes : []));
    }

    findMatchingTrigger(nodes, messageText) {
        const triggers = nodes.filter(n => n.type === 'triggerNode' || n.type === 'trigger' || n.type === 'start');
        const lowerMessage = String(messageText || '').toLowerCase();

        return triggers.find(node => {
            const data = node.data || {};
            const triggerType = data.subType || data.type || node.type;
            if (triggerType === 'welcome') return lowerMessage.length > 0;

            const keywords = String(data.keywords || data.keyword || '')
                .split(',')
                .map(k => k.trim().toLowerCase())
                .filter(Boolean);

            if (keywords.length === 0) return false;
            return keywords.some(keyword => lowerMessage === keyword || lowerMessage.includes(keyword));
        });
    }

    findFallbackNode(nodes) {
        return nodes.find(n => n.data?.isFallback && (n.data?.text || n.data?.message));
    }

    async executeNode(nodeId, context) {
        const { nodes, edges, from, messageText, workspaceId, userId, visited } = context;
        if (visited.has(nodeId) || visited.size > 25) return;
        visited.add(nodeId);

        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        console.log(`[BotEngine] Executing Node: ${node.type} (${node.id})`);

        let nextNodeId = null;
        const creds = await this.getCredentials(workspaceId, userId);
        const nodeKind = node.type;
        const subType = node.data?.subType || node.data?.type || node.type;

        try {
            switch (nodeKind) {
                case 'triggerNode':
                case 'trigger':
                case 'start':
                    break;

                case 'message':
                case 'messageNode':
                case 'actionNode':
                    await this.executeActionNode(subType, node, context, creds);
                    break;

                case 'logicNode':
                    if (subType === 'delayNode' || subType === 'delay') {
                        const seconds = Number(node.data?.seconds || 1);
                        await new Promise(resolve => setTimeout(resolve, Math.min(seconds, 30) * 1000));
                        break;
                    }
                    if (subType === 'conditionNode' || subType === 'condition') {
                        nextNodeId = this.pickConditionTarget(node, context);
                    }
                    break;

                case 'condition':
                    nextNodeId = this.pickConditionTarget(node, context);
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

    async executeActionNode(subType, node, context, creds) {
        const { from, messageText, workspaceId, userId } = context;
        if (!creds) throw new Error("No WhatsApp Cloud API credentials found for bot reply");

        let result = null;
        let logText = "";

        switch (subType) {
            case 'textMessage':
            case 'message':
            case 'messageNode':
                logText = this.interpolate(node.data?.text || node.data?.message || "", context);
                if (!logText.trim()) return;
                result = await cloudApi.sendTextMessage(creds, from, logText);
                break;

            case 'imageMessage':
                logText = `[IMAGE] ${node.data?.caption || ""}`.trim();
                result = await cloudApi.sendMediaMessage(creds, from, 'image', node.data?.imageUrl, node.data?.caption || "");
                break;

            case 'templateMessage':
                logText = `[Template: ${node.data?.templateName || ""}]`;
                result = await cloudApi.sendTemplateMessage(creds, from, node.data?.templateName, node.data?.languageCode || 'en_US', []);
                break;

            case 'aiAssistant':
                logText = await waAIService.generateRAGResponse(workspaceId, messageText, node.data?.category || 'GENERAL');
                result = await cloudApi.sendTextMessage(creds, from, logText);
                break;

            case 'interactive':
                logText = "[Interactive Message]";
                result = await cloudApi.sendInteractiveMessage(creds, from, node.data?.payload || node.data);
                break;

            default:
                if (node.data?.text || node.data?.message) {
                    const text = this.interpolate(node.data?.text || node.data?.message || "", context);
                    logText = text;
                    result = await cloudApi.sendTextMessage(creds, from, text);
                }
        }

        if (!result?.success) {
            throw new Error(result?.error || "Bot reply failed");
        }

        await this.logBotReply({
            userId,
            from,
            text: logText,
            result,
            phoneNumberId: creds?.phoneNumberId || creds?.phone_number_id
        });
    }

    pickConditionTarget(node, context) {
        const branches = context.edges.filter(e => e.source === node.id);
        const operation = node.data?.operation || 'contains';
        const expected = String(node.data?.value || '').toLowerCase();
        const actual = String(context.messageText || '').toLowerCase();

        const matched = branches.find(edge => {
            const label = String(edge.label || edge.data?.label || '').toLowerCase();
            if (label && actual.includes(label)) return true;
            if (!expected) return false;
            if (operation === 'eq') return actual === expected;
            if (operation === 'exists') return actual.length > 0;
            return actual.includes(expected);
        });

        return matched?.target || branches[0]?.target || null;
    }

    async logBotReply({ userId, from, text, result, phoneNumberId }) {
        try {
            await db.whatsAppMessage.create({
                data: {
                    userId,
                    waId: result.data?.messages?.[0]?.id || `bot_${Date.now()}`,
                    jid: String(from || '').replace(/\D/g, '') + '@s.whatsapp.net',
                    text,
                    fromMe: true,
                    timestamp: BigInt(Math.floor(Date.now() / 1000)),
                    status: 'SENT',
                    metadata: {
                        type: 'bot_reply',
                        phone_number_id: String(phoneNumberId || '')
                    }
                }
            });
        } catch (error) {
            console.error('[BotEngine] Reply log failed:', error);
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
