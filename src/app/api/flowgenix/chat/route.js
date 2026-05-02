import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runAgent } from "../../../workspace/[workspaceId]/flowgenix/_lib/agent-runtime";

export async function POST(req) {
    try {
        const { agentId, message, history = [] } = await req.json();
        
        // Find agent config
        const config = await db.agentConfig.findUnique({
            where: { id: agentId },
            include: { user: true }
        });

        if (!config) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        // Fetch models for this config
        const models = await db.agentModel.findMany({
            where: { workspaceId: config.workspaceId, isActive: true }
        });
        
        const fullConfig = { ...config, models };

        // Fetch RAG docs
        const ragDocs = await db.ragDoc.findMany({
            where: { workspaceId: config.workspaceId }
        });

        let fullText = "";
        await runAgent(
            fullConfig,
            history,
            message,
            ragDocs,
            (update) => {
                if (update.partial) fullText = update.partial;
            },
            null
        );

        return NextResponse.json({ 
            success: true, 
            response: fullText,
            agentName: config.name
        });
    } catch (error) {
        console.error("Public API Chat Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
