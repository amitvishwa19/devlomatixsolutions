import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";

/**
 * Extracts {{ Mustache }} type variables from a string using the current run context
 */
export function interpolateString(str, context) {
    if (typeof str !== 'string') return str;
    
    // Regex matches {{ nodeName.property }} or {{ webhookName.body.email }}
    return str.replace(/\{\{\s*([\w$.\[\]]+)\s*\}\}/g, (match, path) => {
        // Simple dot notation extractor
        const keys = path.split('.');
        let current = context;
        for (const key of keys) {
            if (current && current[key] !== undefined) {
                current = current[key];
            } else {
                return match; // return original if not found
            }
        }
        
        // If it's an object, stringify it
        if (typeof current === 'object') return JSON.stringify(current);
        return String(current);
    });
}

/**
 * Executes a single action node
 */
async function executeNode(node, context, workflow, logs) {
    const type = node.data?.subType;
    const nodeId = node.id;
    let outputData = {};

    // Helper to find "attachments" (Model, Memory) connected to this node
    const getAttachments = () => {
        const incomingEdges = (workflow.edges || []).filter(e => e.target === nodeId);
        const attachments = { model: null, memory: null };
        
        for (const edge of incomingEdges) {
            const sourceNode = (workflow.nodes || []).find(n => n.id === edge.source);
            if (!sourceNode) continue;
            
            if (sourceNode.type === 'modelNode') attachments.model = sourceNode;
            if (sourceNode.type === 'memoryNode') attachments.memory = sourceNode;
        }
        return attachments;
    };

    switch (type) {
        case 'agent':
            const { model: modelNode, memory: memoryNode } = getAttachments();
            
            if (!modelNode) throw new Error("Agent node requires a connected Model node");
            
            const provider = modelNode.data?.provider || 'gemini';
            const apiKey = modelNode.data?.apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
            
            if (!apiKey) throw new Error(`Missing API Key for ${provider}`);

            // 1. Handle Memory
            let history = [];
            const sessionId = context.trigger?.sessionId || context.payload?.sessionId || "default-session";
            
            if (memoryNode) {
                const memoryRecord = await db.workflowMemory.findUnique({
                    where: { workflowId_sessionId: { workflowId: workflow.id, sessionId } }
                });
                history = memoryRecord?.messages || [];
                // Limit to window size if configured
                const windowSize = memoryNode.data?.windowSize || 10;
                history = history.slice(-windowSize);
            }

            // 2. Prepare Prompt
            const systemPrompt = interpolateString(node.data?.systemPrompt || "You are a helpful AI assistant.", context);
            const userInput = context.payload?.message || context.lastOutput?.text || "Hello";
            
            // 3. Call LLM
            let aiResponse = "";
            if (provider === 'gemini') {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ 
                    model: "gemini-2.5-flash", // Defaulting to flash for speed
                    systemInstruction: systemPrompt 
                });
                
                const chat = model.startChat({ history: history.map(m => ({ role: m.role, parts: [{ text: m.text }] })) });
                const result = await chat.sendMessage(userInput);
                aiResponse = result.response.text();
            } else {
                // OpenAI Placeholder (would use openai package here)
                aiResponse = `[SIMULATED GPT-4o]: I received your message "${userInput}" and processed it with my system instructions.`;
            }

            // 4. Update Memory
            if (memoryNode) {
                const newMessages = [
                    ...history,
                    { role: 'user', text: userInput },
                    { role: 'model', text: aiResponse }
                ];
                
                await db.workflowMemory.upsert({
                    where: { workflowId_sessionId: { workflowId: workflow.id, sessionId } },
                    update: { messages: newMessages },
                    create: { workflowId: workflow.id, sessionId, messages: newMessages }
                });
            }

            outputData = { text: aiResponse, sessionId };
            break;

        case 'ai':
            const simpleApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
            if (!simpleApiKey) throw new Error("Missing Gemini API Key in environment");
            
            const genAI = new GoogleGenerativeAI(simpleApiKey);
            const simpleModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            
            let prompt = node.data?.prompt || "Say hello";
            prompt = interpolateString(prompt, context);
            
            const result = await simpleModel.generateContent(prompt);
            outputData = { text: result.response.text() };
            break;
            
        case 'http':
            const url = interpolateString(node.data?.url || "", context);
            const method = node.data?.method || "GET";
            const response = await fetch(url, { method });
            const responseData = await response.json().catch(() => ({}));
            outputData = { status: response.status, data: responseData };
            break;
            
        case 'email':
            const emailTo = interpolateString(node.data?.toAddress || "", context);
            outputData = { message: `Email simulated sent to ${emailTo}` };
            break;
            
        default:
            outputData = { completed: true };
            break;
    }

    return outputData;
}

/**
 * Main execution runner
 */
export async function runWorkflow(workflowId, executionId, triggerNodeId, initialPayload) {
    const workflow = await db.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow) throw new Error("Workflow not found");
    
    const nodesMap = new Map((workflow.nodes || []).map(n => [n.id, n]));
    const edgesMap = workflow.edges || [];
    
    // Global context for interpolation
    const context = {
        payload: initialPayload,
        trigger: initialPayload,
        lastOutput: null
    };

    const logs = [{ timestamp: new Date(), message: `Started execution at trigger ${triggerNodeId}` }];
    
    const updateExecution = async (status, finalLogs) => {
        await db.workflowExecution.update({
            where: { id: executionId },
            data: { status, logs: finalLogs, finishedAt: new Date() }
        });
    };

    try {
        const queue = [triggerNodeId];
        const visited = new Set();
        
        while (queue.length > 0) {
            const currentId = queue.shift();
            
            if (visited.has(currentId)) continue;
            visited.add(currentId);
            
            const currentNode = nodesMap.get(currentId);
            if (!currentNode) continue;
            
            // Skip non-sequence nodes (Models and Memory are fetched as attachments)
            if (['modelNode', 'memoryNode'].includes(currentNode.type)) continue;

            if (currentId !== triggerNodeId) {
                logs.push({ timestamp: new Date(), message: `Executing node ${currentNode.data?.label || currentNode.id}` });
                
                try {
                    const output = await executeNode(currentNode, context, workflow, logs);
                    context[currentId] = output; 
                    context.lastOutput = output;
                    logs.push({ timestamp: new Date(), message: `Node success: ${JSON.stringify(output)}` });
                } catch (e) {
                    logs.push({ timestamp: new Date(), message: `Node FAILED: ${e.message}`, error: true });
                    throw new Error(`Node ${currentId} failed: ${e.message}`);
                }
            }

            const outgoingEdges = edgesMap.filter(e => e.source === currentId);
            for (const edge of outgoingEdges) {
                queue.push(edge.target);
            }
        }
        
        await updateExecution('SUCCESS', logs);
        return { success: true, logs, finalContext: context };

    } catch (e) {
        logs.push({ timestamp: new Date(), message: `Workflow execution failed: ${e.message}` });
        await updateExecution('FAILED', logs);
        return { success: false, logs, error: e.message };
    }
}
