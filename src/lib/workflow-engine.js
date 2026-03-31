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
async function executeNode(node, context) {
    const type = node.data?.subType;
    let outputData = {};

    switch (type) {
        case 'ai':
            const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
            if (!apiKey) throw new Error("Missing Gemini API Key in environment");
            
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            
            let prompt = node.data?.prompt || "Say hello";
            // Interpolate variables from context
            prompt = interpolateString(prompt, context);
            
            const result = await model.generateContent(prompt);
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
            // Stub for email node
            const emailTo = interpolateString(node.data?.toAddress || "", context);
            outputData = { message: `Email simulated sent to ${emailTo}` };
            break;
            
        default:
            // Standard passthrough
            outputData = { completed: true };
            break;
    }

    return outputData;
}

/**
 * Main execution runner
 * Takes a workflow JSON (nodes and edges), and the starting webhook payload 
 */
export async function runWorkflow(workflowId, executionId, triggerNodeId, initialPayload) {
    const workflow = await db.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow) throw new Error("Workflow not found");
    
    // Convert to Maps for fast lookup
    const nodesMap = new Map((workflow.nodes || []).map(n => [n.id, n]));
    const edgesMap = workflow.edges || [];
    
    // The "Context" holds outputs from each node, keyed by the node ID so subsequent 
    // nodes can pull data from node.id outputs or webhook payloads
    const context = {
        [triggerNodeId]: initialPayload
    };

    const logs = [{ timestamp: new Date(), message: `Started execution at trigger ${triggerNodeId}` }];
    
    const updateExecution = async (status, finalLogs) => {
        await db.workflowExecution.update({
            where: { id: executionId },
            data: { status, logs: finalLogs, finishedAt: new Date() }
        });
    };

    try {
        // Naive BFS traversal
        const queue = [triggerNodeId];
        const visited = new Set();
        
        while (queue.length > 0) {
            const currentId = queue.shift();
            
            if (visited.has(currentId)) continue;
            visited.add(currentId);
            
            const currentNode = nodesMap.get(currentId);
            if (!currentNode) continue;
            
            // Execute Node Logic (Skip trigger since we just mapped its payload)
            if (currentId !== triggerNodeId) {
                logs.push({ timestamp: new Date(), message: `Executing node ${currentNode.data?.label} (${currentId})` });
                
                try {
                    const output = await executeNode(currentNode, context);
                    context[currentId] = output; // Save output to context for future nodes
                    logs.push({ timestamp: new Date(), message: `Node success: ${JSON.stringify(output)}` });
                } catch (e) {
                    logs.push({ timestamp: new Date(), message: `Node FAILED: ${e.message}`, error: true });
                    throw new Error(`Node ${currentId} failed: ${e.message}`);
                }
            }

            // Find all connected Target edges
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
