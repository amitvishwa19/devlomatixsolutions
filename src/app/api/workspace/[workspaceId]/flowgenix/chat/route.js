import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        
        // Simple auth for the API route
        if (!session || !session.user?.userId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        const body = await req.json();
        const { model, messages, stream = false, ...rest } = body;

        if (!model || !messages) {
            return new Response(JSON.stringify({ error: "Missing model or messages" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // 1. Parse Provider and Target Model
        // Example: "openrouter/anthropic/claude-3.5-sonnet" -> provider: "openrouter", targetModel: "anthropic/claude-3.5-sonnet"
        let providerId = "freemodel";
        let targetModel = model;

        if (model.includes("/")) {
            const parts = model.split("/");
            const possibleProvider = parts[0].toLowerCase();
            
            // Check if first part matches known providers in catalog
            const knownProviders = ["openrouter", "openai", "anthropic", "google", "deepseek", "groq", "ollama", "nvidia", "freemodel"];
            if (knownProviders.includes(possibleProvider)) {
                providerId = possibleProvider;
                targetModel = parts.slice(1).join("/");
            }
        }

        // 2. Fetch API Key from db.agentModel
        const agentModel = await db.agentModel.findFirst({
            where: {
                workspaceId,
                provider: providerId,
                isActive: true
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!agentModel || !agentModel.apiKey) {
            return new Response(JSON.stringify({ error: `No active configuration or API key found for provider '${providerId}' in this workspace.` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // 3. Prepare downstream fetch
        let baseUrl = agentModel.baseUrl;
        if (!baseUrl) {
            switch(providerId) {
                case "openai": baseUrl = "https://api.openai.com/v1"; break;
                // Note: Anthropic native doesn't use standard OpenAI chat/completions out-of-the-box without a wrapper
                case "google": baseUrl = "https://generativelanguage.googleapis.com/v1beta/openai"; break;
                case "groq": baseUrl = "https://api.groq.com/openai/v1"; break;
                case "deepseek": baseUrl = "https://api.deepseek.com/v1"; break;
                case "openrouter": baseUrl = "https://openrouter.ai/api/v1"; break;
                case "nvidia": baseUrl = "https://integrate.api.nvidia.com/v1"; break;
                case "ollama": baseUrl = "http://localhost:11434/v1"; break;
                case "freemodel": baseUrl = "https://freemodel.dev/api/v1"; break;
                default: baseUrl = "https://api.openai.com/v1";
            }
        }

        // Clean trailing slash and append /chat/completions (Ollama needs /v1/chat/completions if using OpenAI compat)
        const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

        // 4. Proxy request
        const startTime = Date.now();
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${agentModel.apiKey}`,
                ...(providerId === 'openrouter' ? { 'HTTP-Referer': 'http://localhost:20128', 'X-Title': 'FlowGenix' } : {})
            },
            body: JSON.stringify({
                model: targetModel,
                messages,
                stream,
                ...rest
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[FLOWGENIX] Provider Error (${providerId}):`, errorText);
            return new Response(errorText, { status: response.status, headers: { 'Content-Type': 'application/json' }});
        }

        // 5. Stream response back to client transparently
        return new Response(response.body, {
            status: response.status,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || (stream ? 'text/event-stream' : 'application/json'),
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            }
        });

    } catch (error) {
        console.error("[FLOWGENIX_CHAT_ERROR]", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
