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
        const { nodes, edges, workspaceId, userId, visited } = context;
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
                    if (subType === 'setVariable') {
                        context.variables = context.variables || {};
                        const varName = node.data?.variable || 'custom_var';
                        const varVal = this.interpolate(node.data?.value || '', context);
                        context.variables[varName] = varVal;
                        console.log(`[BotEngine] Set variable {{${varName}}} = "${varVal}"`);
                        break;
                    }
                    if (subType === 'waitForInput') {
                        context.variables = context.variables || {};
                        const varName = node.data?.variable || 'last_response';
                        const validation = node.data?.validation || 'any';
                        const incoming = String(context.messageText || '').trim();

                        let isValid = true;
                        if (validation === 'email') {
                            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(incoming);
                        } else if (validation === 'phone') {
                            isValid = /^\+?[\d\s-]{7,15}$/.test(incoming);
                        } else if (validation === 'number') {
                            isValid = /^\d+(\.\d+)?$/.test(incoming);
                        }

                        if (!isValid) {
                            const retryText = node.data?.retryPrompt || "Please provide a valid format to proceed.";
                            await cloudApi.sendTextMessage(creds, context.from, retryText);
                            return; // Stop execution until user provides valid input
                        }

                        context.variables[varName] = incoming;
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

            case 'aiAgent':
            case 'aiAssistant': {
                const category = node.data?.category || 'GENERAL';
                const fallbackText = node.data?.fallbackText || "I am not sure about that. Let me connect you with our team.";
                try {
                    logText = await waAIService.generateRAGResponse(workspaceId, messageText, category);
                    if (!logText || !logText.trim()) logText = fallbackText;
                } catch (e) {
                    console.error('[BotEngine] AI Agent generation error:', e);
                    logText = fallbackText;
                }
                result = await cloudApi.sendTextMessage(creds, from, logText);
                break;
            }

            case 'deskflowHandoff':
            case 'deskflow': {
                const dept = node.data?.department || 'Support';
                const handoffMsg = this.interpolate(node.data?.handoffMessage || `Connecting you with our ${dept} team...`, context);
                logText = `[Handoff: ${dept}] ${handoffMsg}`;
                result = await cloudApi.sendTextMessage(creds, from, handoffMsg);
                break;
            }

            case 'crmTag':
            case 'tag': {
                const tag = node.data?.tag || 'Lead';
                const action = node.data?.action || 'add';
                logText = `[CRM Tag ${action === 'remove' ? 'Removed' : 'Added'}: ${tag}]`;
                result = { success: true, data: { messages: [{ id: `tag_${Date.now()}` }] } };
                break;
            }

            case 'httpRequest':
            case 'http': {
                const url = this.interpolate(node.data?.url || '', context);
                if (url) {
                    try {
                        const res = await fetch(url, { method: node.data?.method || 'GET' });
                        const data = await res.json();
                        context.variables = context.variables || {};
                        context.variables['http_response'] = JSON.stringify(data);
                        logText = `[HTTP ${node.data?.method || 'GET'} 200 OK]`;
                    } catch (err) {
                        console.error('[BotEngine] HTTP Request Node failed:', err);
                        logText = `[HTTP Request Failed]`;
                    }
                }
                result = { success: true, data: { messages: [{ id: `http_${Date.now()}` }] } };
                break;
            }

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
        if (!branches.length) return null;

        const evaluateRule = (variable, operation, expectedVal) => {
            let rawActual = context.messageText;
            if (context.variables && context.variables[variable] !== undefined) {
                rawActual = context.variables[variable];
            } else if (variable === 'from') {
                rawActual = context.from;
            } else if (variable === 'order_total') {
                rawActual = context.orderTotal || '';
            }
            const actual = String(rawActual || '').toLowerCase().trim();
            const expected = String(expectedVal || '').toLowerCase().trim();

            if (operation === 'exists') return actual.length > 0;
            if (operation === 'eq' || operation === '==') return actual === expected;
            if (operation === 'starts_with') return actual.startsWith(expected);
            if (operation === 'ends_with') return actual.endsWith(expected);
            if (operation === 'gt') return !isNaN(Number(actual)) && !isNaN(Number(expected)) ? Number(actual) > Number(expected) : actual > expected;
            if (operation === 'gte') return !isNaN(Number(actual)) && !isNaN(Number(expected)) ? Number(actual) >= Number(expected) : actual >= expected;
            if (operation === 'lt') return !isNaN(Number(actual)) && !isNaN(Number(expected)) ? Number(actual) < Number(expected) : actual < expected;
            if (operation === 'lte') return !isNaN(Number(actual)) && !isNaN(Number(expected)) ? Number(actual) <= Number(expected) : actual <= expected;
            return actual.includes(expected);
        };

        const conditions = Array.isArray(node.data?.conditions) && node.data.conditions.length > 0
            ? node.data.conditions
            : null;

        if (conditions) {
            // Evaluate multiple conditions in sequential order (If ... Else If ... Else If ...)
            for (let i = 0; i < conditions.length; i++) {
                const cond = conditions[i];
                const condId = cond.id || `cond_${i}`;
                const varName = cond.variable || 'last_response';
                const op = cond.operation || 'contains';
                const val = cond.value || '';

                const isMatched = evaluateRule(varName, op, val);
                console.log(`[BotEngine] Multi-Condition #${i + 1} (${cond.label || condId}): IF "${varName}" ${op} "${val}" => ${isMatched}`);

                if (isMatched) {
                    // 1. Match by sourceHandle ID
                    const handleMatchedEdge = branches.find(e => 
                        e.sourceHandle === condId || 
                        e.sourceHandle === `cond_${i}` || 
                        (i === 0 && e.sourceHandle === 'true')
                    );
                    if (handleMatchedEdge) return handleMatchedEdge.target;

                    // 2. Match by edge label
                    const labelMatchedEdge = branches.find(e => {
                        const l = String(e.label || e.data?.label || '').toLowerCase().trim();
                        return l === String(cond.label || '').toLowerCase().trim() || l === `case ${i + 1}` || l === `branch ${i + 1}`;
                    });
                    if (labelMatchedEdge) return labelMatchedEdge.target;

                    // 3. Fallback by branch order
                    if (branches[i]) return branches[i].target;
                }
            }

            // No conditions matched -> Route to ELSE / Fallback handle
            const elseHandleEdge = branches.find(e => 
                e.sourceHandle === 'else' || 
                e.sourceHandle === 'default' || 
                e.sourceHandle === 'false'
            );
            if (elseHandleEdge) return elseHandleEdge.target;

            const elseLabelEdge = branches.find(e => {
                const l = String(e.label || e.data?.label || '').toLowerCase().trim();
                return l === 'else' || l === 'fallback' || l === 'default' || l === 'false' || l === 'no';
            });
            if (elseLabelEdge) return elseLabelEdge.target;

            return branches[branches.length - 1]?.target || null;
        }

        // Legacy 2-port condition evaluation
        const variable = node.data?.variable || 'last_response';
        const operation = node.data?.operation || 'contains';
        const expected = String(node.data?.value || '').toLowerCase().trim();
        const isTrue = evaluateRule(variable, operation, expected);

        console.log(`[BotEngine] Condition Evaluation: IF "${variable}" ${operation} "${expected}" => ${isTrue}`);

        // 1. Try matching by multi-port handle ID ('true' or 'false')
        const targetHandleId = isTrue ? 'true' : 'false';
        const handleMatchedEdge = branches.find(e => e.sourceHandle === targetHandleId);
        if (handleMatchedEdge) {
            return handleMatchedEdge.target;
        }

        // 2. Fallback: match by edge label
        const labelMatchedEdge = branches.find(edge => {
            const label = String(edge.label || edge.data?.label || '').toLowerCase().trim();
            if (isTrue && (label === 'true' || label === 'yes' || label === 'matched')) return true;
            if (!isTrue && (label === 'false' || label === 'no' || label === 'else' || label === 'default')) return true;
            return false;
        });
        if (labelMatchedEdge) return labelMatchedEdge.target;

        // 3. Positional fallback: 1st branch = true, 2nd branch = false
        return isTrue ? branches[0]?.target : (branches[1]?.target || null);
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
        return String(text || '').replace(/\{\{(.*?)\}\}/g, (match, key) => {
            const k = key.trim();
            if (k === 'message') return context.messageText || '';
            if (k === 'from') return context.from || '';
            if (k === 'now') return new Date().toLocaleTimeString();
            if (context.variables && context.variables[k] !== undefined) {
                return context.variables[k];
            }
            return match;
        });
    }
}

export const waBotEngine = WhatsAppBotEngine.getInstance();
