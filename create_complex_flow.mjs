import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'bot@admin.com' }
    });

    if (!user) {
        console.error("User bot@admin.com not found!");
        return;
    }

    const workspaceId = 'cmnbhifag000458ikwhv1zso2';

    const nodes = [
        { 
            id: "node-1", 
            type: "triggerNode", 
            position: {x: 100, y: 150}, 
            data: { subType: "chat", label: "Chat Trigger", initialPrompt: "Welcome to the ultimate complex automation!" } 
        },
        { 
            id: "node-2", 
            type: "modelNode", 
            position: {x: 400, y: 50}, 
            data: { subType: "model", label: "AI Model", provider: "openai" } 
        },
        { 
            id: "node-3", 
            type: "memoryNode", 
            position: {x: 400, y: 250}, 
            data: { subType: "window", label: "AI Memory", windowSize: 15 } 
        },
        { 
            id: "node-4", 
            type: "agentNode", 
            position: {x: 700, y: 150}, 
            data: { subType: "agent", label: "Orchestrator Agent", reasoning: "PlanExecute", systemPrompt: "You are the master orchestrator. Break down user requests and formulate a plan.", maxIterations: 10 } 
        },
        { 
            id: "node-5", 
            type: "actionNode", 
            position: {x: 1000, y: 150}, 
            data: { subType: "ai", label: "Report Generator", prompt: "Format the output into a markdown report." } 
        },
        { 
            id: "node-6", 
            type: "actionNode", 
            position: {x: 1300, y: 150}, 
            data: { subType: "http", label: "Send to Webhook", method: "POST", url: "https://echo.free.beeceptor.com", authentication: "none" } 
        }
    ];

    const edges = [
        { id: "e1", source: "node-1", target: "node-4" },
        { id: "e2", source: "node-2", target: "node-4" },
        { id: "e3", source: "node-3", target: "node-4" },
        { id: "e4", source: "node-4", target: "node-5" },
        { id: "e5", source: "node-5", target: "node-6" }
    ];

    const workflow = await prisma.workflow.create({
        data: {
            name: "Mega Complex Automator",
            description: "A large workflow using chat trigger, memory, models, agents, simplistic AI, and external webhooks.",
            workspaceId,
            userId: user.id,
            status: "DRAFT",
            nodes: nodes,
            edges: edges
        }
    });

    console.log("Created Workflow successfully!");
    console.log("Workflow ID:", workflow.id);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
