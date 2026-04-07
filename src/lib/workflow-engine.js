import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { db } from "@/lib/db";

/**
 * Extracts {{ Mustache }} type variables from a string using the current run context
 */
/**
 * Extracts {{ Mustache }} type variables from a string using the current run context.
 * n8n-style support: {{ $json.field }} or {{ $node["Node Name"].json.field }}
 */
export function interpolateString(str, context) {
    if (typeof str !== 'string') return str;
    
    return str.replace(/\{\{\s*([\w$.\[\]"-]+)\s*\}\}/g, (match, path) => {
        // Normalize path: replace $json with payload and handle $node
        let normalizedPath = path;
        if (path.startsWith('$json.')) {
            normalizedPath = `payload.${path.substring(6)}`;
        } else if (path.startsWith('$node.')) {
            // Support for {{ $node.nodeId.data.field }}
            normalizedPath = path.substring(6);
        }

        const keys = normalizedPath.split('.');
        let current = context;
        for (const key of keys) {
            // Support for bracket notation in path
            const cleanKey = key.replace(/["'\[\]]/g, '');
            if (current && (current[cleanKey] !== undefined || current[key] !== undefined)) {
                current = current[cleanKey] !== undefined ? current[cleanKey] : current[key];
            } else {
                return match; 
            }
        }
        if (typeof current === 'object') return JSON.stringify(current);
        return String(current);
    });
}

/**
 * Finds tools connected to an agent's tools-in handle
 */
function getAgentTools(agentNodeId, workflow) {
    const tools = [];
    const incomingEdges = (workflow.edges || []).filter(e => e.target === agentNodeId && e.targetHandle === 'tools-in');
    
    for (const edge of incomingEdges) {
        const toolNode = (workflow.nodes || []).find(n => n.id === edge.source);
        if (!toolNode) continue;

        // Create a tool definition based on node type
        const toolName = `execute_${toolNode.data?.label?.replace(/\s+/g, '_').toLowerCase() || toolNode.id.replace(/-/g, '_')}`;
        
        let toolDef = {
            name: toolName,
            description: toolNode.data?.aiDescription || toolNode.data?.description || `Executes the ${toolNode.data?.label || toolNode.type} node.`,
            nodeId: toolNode.id
        };

        // Add parameters based on node type
        if (toolNode.data?.subType === 'http') {
            toolDef.parameters = {
                type: "OBJECT",
                properties: {
                    url_override: { type: "STRING", description: "Optional URL to override the default" },
                    body_override: { type: "STRING", description: "Optional JSON body to override settings" }
                }
            };
        }

        tools.push(toolDef);
    }
    return tools;
}

/**
 * Executes a single action node
 */
async function executeNode(node, context, workflow, logs) {
    const type = node.data?.subType;
    const nodeId = node.id;
    let outputData = {};

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
            let apiKey = modelNode.data?.apiKey || (provider === 'gemini' ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY);
            let userSelectedModel = null;
            
            // 0. Resolve Managed Credential
            if (modelNode.data?.credentialId) {
                const cred = await db.credentials.findUnique({ where: { id: modelNode.data.credentialId } });
                if (cred && cred.credentials) {
                    const credData = cred.credentials;
                    apiKey = credData.apiKey || credData.api_key || credData.token || apiKey;
                    userSelectedModel = credData.model;
                }
            }
            
            if (!apiKey) throw new Error(`Missing API Key for ${provider}`);

            // 1. History & Tools
            let history = [];
            const sessionId = context.trigger?.sessionId || context.payload?.sessionId || "default-session";
            
            if (memoryNode) {
                const memoryRecord = await db.workflowMemory.findUnique({
                    where: { workflowId_sessionId: { workflowId: workflow.id, sessionId } }
                });
                history = memoryRecord?.messages || [];
                const windowSize = memoryNode.data?.windowSize || 10;
                history = history.slice(-windowSize);
            }

            const connectedTools = getAgentTools(nodeId, workflow);
            const systemPrompt = interpolateString(node.data?.systemPrompt || "You are a helpful AI assistant.", context);
            const userInput = context.payload?.message || context.lastOutput?.text || "Hello";

            if (provider === 'gemini') {
                const genAI = new GoogleGenerativeAI(apiKey);
                
                // Convert our tools to Gemini format
                const geminiTools = connectedTools.length > 0 ? [{
                    functionDeclarations: connectedTools.map(t => ({
                        name: t.name,
                        description: t.description,
                        parameters: t.parameters || { type: "OBJECT", properties: {} }
                    }))
                }] : [];

                const model = genAI.getGenerativeModel({ 
                    model: userSelectedModel || "gemini-2.0-flash", 
                    systemInstruction: systemPrompt,
                    tools: geminiTools
                });
                
                const chat = model.startChat({ 
                    history: history.map(m => ({ 
                        role: m.role, 
                        parts: [{ text: m.text }] 
                    })) 
                });

                let result = await chat.sendMessage(userInput);
                let response = result.response;
                
                // Tool-Calling Loop
                let iterations = 0;
                const maxIterations = node.data?.maxIterations || 5;

                while (response.candidates[0].content.parts.some(p => p.functionCall) && iterations < maxIterations) {
                    iterations++;
                    const functionCalls = response.candidates[0].content.parts.filter(p => p.functionCall);
                    const toolResults = [];

                    for (const call of functionCalls) {
                        const tool = connectedTools.find(t => t.name === call.functionCall.name);
                        if (tool) {
                            logs.push({ timestamp: new Date(), message: `Agent calling tool: ${tool.name}` });
                            const toolNode = (workflow.nodes || []).find(n => n.id === tool.nodeId);
                            // Execute the tool node
                            const toolOutput = await executeNode(toolNode, { ...context, payload: call.functionCall.args }, workflow, logs);
                            toolResults.push({
                                functionResponse: {
                                    name: tool.name,
                                    response: { content: toolOutput }
                                }
                            });
                        }
                    }

                    result = await chat.sendMessage(toolResults);
                    response = result.response;
                }

                outputData = { text: response.text(), sessionId };

            } else if (provider === 'openai') {
                const openai = new OpenAI({ apiKey });
                
                const messages = [
                    { role: "system", content: systemPrompt },
                    ...history.map(m => ({ role: m.role === 'model' ? 'assistant' : m.role, content: m.text })),
                    { role: "user", content: userInput }
                ];

                const apiTools = connectedTools.length > 0 ? connectedTools.map(t => ({
                    type: "function",
                    function: {
                        name: t.name,
                        description: t.description,
                        parameters: t.parameters ? {
                            type: "object",
                            properties: t.parameters.properties,
                            required: []
                        } : { type: "object", properties: {} }
                    }
                })) : undefined;

                let response = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages,
                    tools: apiTools,
                    tool_choice: "auto"
                });

                let iterations = 0;
                while (response.choices[0].message.tool_calls && iterations < 5) {
                    iterations++;
                    const toolCalls = response.choices[0].message.tool_calls;
                    messages.push(response.choices[0].message);

                    for (const toolCall of toolCalls) {
                        const tool = connectedTools.find(t => t.name === toolCall.function.name);
                        if (tool) {
                            logs.push({ timestamp: new Date(), message: `Agent calling tool: ${tool.name}` });
                            const toolNode = (workflow.nodes || []).find(n => n.id === tool.nodeId);
                            const toolOutput = await executeNode(toolNode, { ...context, payload: JSON.parse(toolCall.function.arguments) }, workflow, logs);
                            messages.push({
                                tool_call_id: toolCall.id,
                                role: "tool",
                                name: tool.name,
                                content: JSON.stringify(toolOutput)
                            });
                        }
                    }

                    response = await openai.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages,
                        tools: apiTools
                    });
                }

                outputData = { text: response.choices[0].message.content, sessionId };
            }

            // Update Memory
            if (memoryNode) {
                const newMessages = [
                    ...history,
                    { role: 'user', text: userInput },
                    { role: 'model', text: outputData.text }
                ];
                await db.workflowMemory.upsert({
                    where: { workflowId_sessionId: { workflowId: workflow.id, sessionId } },
                    update: { messages: newMessages },
                    create: { workflowId: workflow.id, sessionId, messages: newMessages }
                });
            }
            break;

        case 'ai':
            let simpleApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
            let simpleModelName = "gemini-2.0-flash";
            
            if (node.data?.credentialId) {
                const cred = await db.credentials.findUnique({ where: { id: node.data.credentialId } });
                if (cred && cred.credentials) {
                    const d = cred.credentials;
                    simpleApiKey = d.apiKey || d.api_key || d.token || simpleApiKey;
                    simpleModelName = d.model || simpleModelName;
                }
            }

            const genAI = new GoogleGenerativeAI(simpleApiKey);
            const simpleModel = genAI.getGenerativeModel({ model: simpleModelName });
            let prompt = interpolateString(node.data?.prompt || "Say hello", context);
            const result = await simpleModel.generateContent(prompt);
            outputData = { text: result.response.text() };
            break;
            
        case 'http':
            const url = interpolateString(context.payload?.url_override || node.data?.url || "", context);
            const method = node.data?.method || "GET";
            const headers = { ...node.data?.headers || {} };

            // Resolve HTTP Credential
            if (node.data?.credentialId) {
                const cred = await db.credentials.findUnique({ where: { id: node.data.credentialId } });
                if (cred && cred.credentials) {
                    const d = cred.credentials;
                    if (d.apiKey || d.token) headers['Authorization'] = `Bearer ${d.apiKey || d.token}`;
                    if (d.username && d.password) headers['Authorization'] = `Basic ${btoa(`${d.username}:${d.password}`)}`;
                }
            }

            const res = await fetch(url, { 
                method,
                headers,
                body: method !== 'GET' ? JSON.stringify(context.payload?.body_override || {}) : undefined
            });
            const responseData = await res.json().catch(() => ({}));
            outputData = { status: res.status, data: responseData };
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
    
    const context = { payload: initialPayload, trigger: initialPayload, lastOutput: null };
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
            if (!currentNode || ['modelNode', 'memoryNode'].includes(currentNode.type)) continue;

            // Execute node (including trigger to capture its initial state)
            logs.push({ timestamp: new Date(), message: `Executing node: ${currentNode.data?.label || currentNode.id}` });
            try {
                let output;
                if (currentId === triggerNodeId) {
                    output = initialPayload;
                } else {
                    output = await executeNode(currentNode, context, workflow, logs);
                }

                context[currentId] = output; 
                context.payload = output; 
                context.lastOutput = output;
                
                // n8n alias: $json points to the most recent output
                context.$json = output;

                const logStr = (output !== undefined && output !== null) ? JSON.stringify(output) : "null";
                logs.push({ 
                    timestamp: new Date(), 
                    message: `Node success: ${logStr.length > 100 ? logStr.substring(0, 100) + '...' : logStr}` 
                });
            } catch (e) {
                logs.push({ timestamp: new Date(), message: `Node FAILED: ${e.message}`, error: true });
                throw new Error(`Node ${currentId} failed: ${e.message}`);
            }

            const outgoingEdges = edgesMap.filter(e => e.source === currentId && e.sourceHandle !== 'tools-in' && e.targetHandle !== 'model-in' && e.targetHandle !== 'memory-in' && e.targetHandle !== 'tools-in');
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
