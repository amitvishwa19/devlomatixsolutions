import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req) {
    try {
        const user = await db.user.findUnique({
            where: { email: 'bot@admin.com' }
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const workspaceId = 'cmnbhifag000458ikwhv1zso2';

        const nodes = [
            { id: "node-1", type: "triggerNode", position: {x: 100, y: 150}, data: { subType: "chat", label: "Chat Trigger", initialPrompt: "Hello! Initiating complex flow." } },
            { id: "node-2", type: "modelNode", position: {x: 400, y: 50}, data: { subType: "model", label: "AI Model Configurator", provider: "openai" } },
            { id: "node-3", type: "memoryNode", position: {x: 400, y: 250}, data: { subType: "window", label: "Conversation Memory", windowSize: 10 } },
            { id: "node-4", type: "agentNode", position: {x: 700, y: 150}, data: { subType: "agent", label: "Master Orchestrator Agent", reasoning: "ReAct", systemPrompt: "You are the orchestrator.", maxIterations: 5 } },
            { id: "node-5", type: "actionNode", position: {x: 1000, y: 150}, data: { subType: "ai", label: "Summarize Findings", prompt: "Summarize everything below." } },
            { id: "node-6", type: "actionNode", position: {x: 1300, y: 150}, data: { subType: "http", label: "Webhook Report", method: "POST", url: "https://echo.free.beeceptor.com", authentication: "none" } }
        ];

        const edges = [
            { id: "e1", source: "node-1", target: "node-4" },
            { id: "e2", source: "node-2", target: "node-4" },
            { id: "e3", source: "node-3", target: "node-4" },
            { id: "e4", source: "node-4", target: "node-5" },
            { id: "e5", source: "node-5", target: "node-6" }
        ];

        const workflow = await db.workflow.create({
            data: {
                name: "Mega AI Workflow via Seeder",
                description: "This workflow contains max possible core nodes connected.",
                workspaceId,
                userId: user.id,
                status: "DRAFT",
                nodes: nodes,
                edges: edges
            }
        });

        return NextResponse.json({ success: true, url: `/workspace/${workspaceId}/flowbot/${workflow.id}` });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
