import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { db } from "@/lib/db";

/**
 * Swarm Completion Engine
 * Executes a message against an agent persona using its prioritized model chain.
 */
export async function swarmCompletion({ agentId, message, history = [], workspaceId }) {
    // 1. Fetch Agent with prioritized model assignments
    const agent = await db.aIAgent.findUnique({
        where: { id: agentId },
        include: {
            models: {
                include: {
                    model: true
                },
                orderBy: {
                    priority: 'asc'
                }
            }
        }
    });

    if (!agent) throw new Error("Agent persona not found");

    const assignments = agent.models || [];
    if (assignments.length === 0) {
        throw new Error("No model infrastructure nodes assigned to this agent persona.");
    }

    // 2. Extract configuration
    const config = agent.config || {};
    const systemPrompt = config.systemPrompt || agent.role || "You are a specialized AI agent.";

    let lastError = null;

    // 3. Sequential Failover Loop
    for (const assignment of assignments) {
        const node = assignment.model;
        if (!node || !node.isActive) continue;

        try {
            console.log(`[SwarmEngine] Attempting execution on node: ${node.name} (${node.provider})`);
            
            const response = await callModelNode({
                node,
                systemPrompt,
                message,
                history,
                strategy: agent.strategy
            });

            // If success, update node health and return
            await updateNodeMetrics(node.id, true);
            return {
                text: response,
                node: {
                    id: node.id,
                    name: node.name,
                    provider: node.provider
                }
            };

        } catch (error) {
            console.error(`[SwarmEngine] Node ${node.name} failed:`, error.message);
            lastError = error;
            // Update node metric on failure
            await updateNodeMetrics(node.id, false);
            // Continue to next node in priority chain
            continue;
        }
    }

    throw new Error(`Master Swarm Orchestrator failed to reach a healthy node. Last error: ${lastError?.message || 'Unknown infrastructure failure'}`);
}

/**
 * Direct Model Provider Integration
 */
async function callModelNode({ node, systemPrompt, message, history }) {
    const provider = node.provider?.toLowerCase();
    const apiKey = node.apiKey;

    if (provider === 'google' || provider === 'gemini') {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: node.name,
            systemInstruction: systemPrompt
        });

        const chat = model.startChat({
            history: history.map(m => ({
                role: m.role === 'assistant' ? 'model' : m.role,
                parts: [{ text: m.content || m.text }]
            }))
        });

        const result = await chat.sendMessage(message);
        return result.response.text();

    } else if (provider === 'openai' || provider === 'openrouter' || provider === 'mistral' || provider === 'meta') {
        const openai = new OpenAI({
            apiKey,
            baseURL: node.baseUrl || undefined
        });

        const messages = [
            { role: "system", content: systemPrompt },
            ...history.map(m => ({ 
                role: m.role === 'model' ? 'assistant' : m.role, 
                content: m.content || m.text 
            })),
            { role: "user", content: message }
        ];

        const response = await openai.chat.completions.create({
            model: node.name,
            messages,
        });

        return response.choices[0].message.content;
    }

    throw new Error(`Provider ${node.provider} is not yet integrated into the Swarm Orchestrator`);
}

/**
 * Telemetry: Update node health based on execution success
 */
async function updateNodeMetrics(nodeId, success) {
    try {
        const current = await db.agentModel.findUnique({ where: { id: nodeId } });
        if (!current) return;

        // Simple health logic for now
        await db.agentModel.update({
            where: { id: nodeId },
            data: {
                healthStatus: success ? 'Excellent' : 'Critical',
                lastRunAt: new Date(),
                // In a real scenario, we'd calculate successRate and latency here
            }
        });
    } catch (e) {
        console.error("Failed to update node metrics:", e);
    }
}
