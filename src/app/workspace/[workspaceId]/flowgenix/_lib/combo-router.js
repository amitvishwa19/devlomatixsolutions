import dns from "node:dns";
import { db } from "@/lib/db";
import { compressPayload, estimateTokens } from "./compression-engine";
import { recordTelemetry } from "./telemetry-store";

// Ensure Node.js prefers IPv4 on dual-stack hosts and tolerates system clock skew in dev/custom environments
try {
    dns.setDefaultResultOrder("ipv4first");
} catch {}

try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
} catch {}

// Built-in zero-config routing presets
export const ROUTING_PRESETS = {
    "auto": [
        { provider: "openrouter", model: "auto", name: "OpenRouter Auto" },
        { provider: "freemodel", model: "meta-llama/llama-3.1-8b-instruct", name: "FreeModel Llama 3.1" },
        { provider: "groq", model: "llama-3.3-70b-versatile", name: "Groq Llama 3.3" },
        { provider: "google", model: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
        { provider: "deepseek", model: "deepseek-chat", name: "DeepSeek Chat" },
        { provider: "anthropic", model: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet" },
        { provider: "openai", model: "gpt-4o-mini", name: "GPT-4o Mini" }
    ],
    "auto/coding": [
        { provider: "openrouter", model: "qwen/qwen-2.5-coder-32b-instruct", name: "OpenRouter Qwen Coder" },
        { provider: "anthropic", model: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet" },
        { provider: "deepseek", model: "deepseek-chat", name: "DeepSeek V3" },
        { provider: "freemodel", model: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B" },
        { provider: "openai", model: "gpt-4o", name: "GPT-4o" },
        { provider: "google", model: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
        { provider: "groq", model: "llama-3.3-70b-versatile", name: "Groq Llama 3.3" }
    ],
    "auto/fast": [
        { provider: "groq", model: "llama-3.3-70b-versatile", name: "Groq Llama 3.3 (High Speed)" },
        { provider: "google", model: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
        { provider: "openrouter", model: "meta-llama/llama-3.1-8b-instruct:free", name: "OpenRouter Fast" },
        { provider: "freemodel", model: "meta-llama/llama-3.1-8b-instruct", name: "FreeModel Llama 3.1" },
        { provider: "deepseek", model: "deepseek-chat", name: "DeepSeek V3" }
    ],
    "auto/cheap": [
        { provider: "freemodel", model: "meta-llama/llama-3.1-8b-instruct", name: "FreeModel (Free Tier)" },
        { provider: "openrouter", model: "meta-llama/llama-3.1-8b-instruct:free", name: "OpenRouter Free" },
        { provider: "groq", model: "llama-3.3-70b-versatile", name: "Groq Cloud (Free Tier)" },
        { provider: "google", model: "gemini-2.0-flash", name: "Google AI Studio (Free Tier)" },
        { provider: "deepseek", model: "deepseek-chat", name: "DeepSeek V3" }
    ],
    "auto/smart": [
        { provider: "anthropic", model: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet" },
        { provider: "deepseek", model: "deepseek-reasoner", name: "DeepSeek R1" },
        { provider: "openrouter", model: "deepseek/deepseek-r1", name: "OpenRouter DeepSeek R1" },
        { provider: "google", model: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
        { provider: "openai", model: "gpt-4o", name: "GPT-4o" },
        { provider: "freemodel", model: "deepseek-ai/deepseek-r1-distill-llama-70b", name: "FreeModel DeepSeek R1" }
    ]
};

// Default fallback models per provider when model is generic or 'main' / 'auto'
const DEFAULT_PROVIDER_MODELS = {
    "freemodel": "meta-llama/llama-3.1-8b-instruct",
    "groq": "llama-3.3-70b-versatile",
    "google": "gemini-2.0-flash",
    "deepseek": "deepseek-chat",
    "openai": "gpt-4o-mini",
    "anthropic": "claude-3-5-haiku-20241022",
    "openrouter": "auto",
    "nvidia": "meta/llama-3.1-405b-instruct",
    "ollama": "llama3.2:latest"
};

/**
 * Standard Provider Base URL Resolver
 */
export function getProviderBaseUrl(providerId, customBaseUrl = null) {
    if (customBaseUrl && customBaseUrl.trim()) {
        let url = customBaseUrl.trim().replace(/\/+$/, "");
        url = url.replace(/\/chat\/completions$/, "").replace(/\/completions$/, "");
        return url;
    }

    switch (providerId?.toLowerCase()) {
        case "openai": return "https://api.openai.com/v1";
        case "google": return "https://generativelanguage.googleapis.com/v1beta/openai";
        case "groq": return "https://api.groq.com/openai/v1";
        case "deepseek": return "https://api.deepseek.com/v1";
        case "openrouter": return "https://openrouter.ai/api/v1";
        case "nvidia": return "https://integrate.api.nvidia.com/v1";
        case "ollama": return "http://localhost:11434/v1";
        case "freemodel": return "https://freemodel.dev/api/v1";
        case "anthropic": return "https://api.anthropic.com/v1";
        default: return "https://api.openai.com/v1";
    }
}

/**
 * Resolve Target Candidates for a Request
 */
export async function resolveCandidateTargets(workspaceId, requestedModel) {
    const raw = (requestedModel || "auto").trim();
    let initialTargets = [];

    // 1. Check if it matches a preset combo (e.g. "auto/coding")
    if (ROUTING_PRESETS[raw]) {
        initialTargets = [...ROUTING_PRESETS[raw]];
    }
    // 2. Check if it's formatted as "provider/model" (e.g. "groq/llama-3.3-70b-versatile")
    else if (raw.includes("/")) {
        const parts = raw.split("/");
        const prov = parts[0].toLowerCase();
        const modelName = parts.slice(1).join("/");

        const knownProviders = ["openrouter", "openai", "anthropic", "google", "deepseek", "groq", "ollama", "nvidia", "freemodel"];
        if (knownProviders.includes(prov)) {
            initialTargets = [{ provider: prov, model: modelName, name: `${prov}/${modelName}` }];
        }
    }

    // 3. If still empty, check DB for an exact model or provider match
    if (initialTargets.length === 0 && raw !== "auto") {
        const dbModel = await db.agentModel.findFirst({
            where: {
                workspaceId,
                OR: [
                    { name: raw },
                    { label: raw },
                    { provider: raw.toLowerCase() }
                ],
                isActive: true
            }
        });

        if (dbModel) {
            initialTargets = [{ provider: dbModel.provider, model: dbModel.name, name: dbModel.label || dbModel.name }];
        }
    }

    // 4. If still empty, fall back to "auto" preset
    if (initialTargets.length === 0) {
        initialTargets = [...ROUTING_PRESETS["auto"]];
    }

    // 5. Query all active models in the workspace to append as fallbacks
    const activeWorkspaceModels = await db.agentModel.findMany({
        where: { workspaceId, isActive: true },
        orderBy: { createdAt: "desc" }
    });

    const combinedTargets = [...initialTargets];

    // Append workspace's configured models if not already in target list
    activeWorkspaceModels.forEach(m => {
        const alreadyIncluded = combinedTargets.some(t => t.provider.toLowerCase() === m.provider.toLowerCase());
        if (!alreadyIncluded) {
            combinedTargets.push({
                provider: m.provider.toLowerCase(),
                model: m.name || DEFAULT_PROVIDER_MODELS[m.provider.toLowerCase()] || "auto",
                name: m.label || `${m.provider}/${m.name}`
            });
        }
    });

    return {
        targets: combinedTargets,
        configuredCount: activeWorkspaceModels.length
    };
}

/**
 * Execute Gateway Request with Resilient Auto-Failover Cascades
 */
export async function executeGatewayRequest({
    workspaceId,
    model: requestedModel,
    messages,
    stream = false,
    compression = { rtk: true, caveman: true },
    ...extraParams
}) {
    const startTime = Date.now();
    const resolution = await resolveCandidateTargets(workspaceId, requestedModel);
    const candidates = resolution.targets;

    // Fetch all active configured keys for this workspace
    const configuredModels = await db.agentModel.findMany({
        where: { workspaceId, isActive: true }
    });

    if (!configuredModels || configuredModels.length === 0) {
        return {
            success: false,
            status: 400,
            error: "No active LLM providers configured in this workspace. Please go to the Providers tab and connect at least one provider (e.g. FreeModel.dev, Groq, Google AI Studio, OpenRouter, OpenAI, or Ollama)."
        };
    }

    const providerMap = new Map();
    configuredModels.forEach(m => {
        if (!providerMap.has(m.provider.toLowerCase())) {
            providerMap.set(m.provider.toLowerCase(), m);
        }
    });

    // Apply Token Compression to incoming messages if requested
    let processedMessages = messages;
    let totalSavingsPercent = 0;

    if (compression?.rtk || compression?.caveman) {
        processedMessages = messages.map(msg => {
            if (typeof msg.content === 'string' && msg.content.length > 30) {
                const comp = compressPayload(msg.content, {
                    rtk: Boolean(compression.rtk),
                    caveman: Boolean(compression.caveman),
                    inflationGuard: true
                });
                if (comp.applied) {
                    totalSavingsPercent = Math.max(totalSavingsPercent, comp.savingsPercent);
                }
                return { ...msg, content: comp.compressed };
            }
            return msg;
        });
    }

    // Clean and validate message objects
    const cleanMessages = processedMessages.map(m => ({
        role: String(m.role || 'user'),
        content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content || '')
    }));

    const inputTokens = estimateTokens(JSON.stringify(cleanMessages));
    const errorsTried = [];

    // Cascading Failover Loop
    for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        const dbConfig = providerMap.get(candidate.provider.toLowerCase());

        // Skip candidate if no active key configured for this provider in this workspace
        if (!dbConfig || !dbConfig.apiKey) {
            continue;
        }

        let targetModel = candidate.model;
        if (!targetModel || targetModel === "main" || targetModel === "auto") {
            targetModel = (dbConfig.name && dbConfig.name !== "main") 
                ? dbConfig.name 
                : (DEFAULT_PROVIDER_MODELS[candidate.provider.toLowerCase()] || "auto");
        }

        const baseUrl = getProviderBaseUrl(candidate.provider, dbConfig.baseUrl);
        const endpoint = `${baseUrl}/chat/completions`;
        const cleanApiKey = dbConfig.apiKey.replace(/^Bearer\s+/i, '').trim();

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout for high reasoning models

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cleanApiKey}`,
                ...(candidate.provider === 'openrouter' ? { 
                    'HTTP-Referer': 'https://devlomatix.com', 
                    'X-Title': 'FlowGenix' 
                } : {})
            };

            const payload = {
                model: targetModel,
                messages: cleanMessages,
                stream: Boolean(stream),
                ...extraParams
            };

            const targetRes = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // If success, log telemetry and return response
            if (targetRes.ok) {
                const latencyMs = Date.now() - startTime;

                recordTelemetry({
                    workspaceId,
                    requestModel: requestedModel,
                    resolvedProvider: dbConfig.provider.toUpperCase(),
                    resolvedModel: targetModel,
                    tokensIn: inputTokens,
                    tokensOut: stream ? 150 : 200,
                    compressionSavings: totalSavingsPercent > 0 ? `${totalSavingsPercent}%` : "0%",
                    latencyMs,
                    status: targetRes.status
                });

                return {
                    success: true,
                    response: targetRes,
                    resolvedProvider: candidate.provider,
                    resolvedModel: targetModel,
                    latencyMs
                };
            }

            // If non-200 (e.g. 429 Rate Limit, 500 Server Error, 404 Model Not Found), log and cascade to next candidate
            const errorText = await targetRes.text().catch(() => "Unknown response body");
            console.warn(`[FlowGenix Gateway] Failover: ${candidate.provider}/${targetModel} status ${targetRes.status}. Cascading to backup...`);

            errorsTried.push({
                provider: candidate.provider,
                model: targetModel,
                status: targetRes.status,
                error: errorText.slice(0, 150)
            });

        } catch (fetchErr) {
            const causeDetail = fetchErr.cause ? ` (${fetchErr.cause.message || fetchErr.cause.code || ''})` : '';
            const errorMsg = fetchErr.name === 'AbortError' ? 'Timeout (35s)' : `${fetchErr.message}${causeDetail}`;
            console.warn(`[FlowGenix Gateway] Failover: Network error on ${candidate.provider}/${targetModel}: ${errorMsg}`);
            errorsTried.push({
                provider: candidate.provider,
                model: targetModel,
                error: errorMsg
            });
        }
    }

    // If all candidates in cascade failed
    const latencyMs = Date.now() - startTime;
    recordTelemetry({
        workspaceId,
        requestModel: requestedModel,
        resolvedProvider: "Failover Exhausted",
        resolvedModel: "none",
        tokensIn: inputTokens,
        tokensOut: 0,
        compressionSavings: "0%",
        latencyMs,
        status: 400,
        error: "All configured provider keys failed"
    });

    const triedSummary = errorsTried.map(e => `[${e.provider}/${e.model}: ${e.error || e.status}]`).join(", ");

    return {
        success: false,
        status: 400,
        error: `Could not reach any configured model in this workspace. Errors: ${triedSummary || "No responsive upstream endpoints found."}`,
        details: errorsTried
    };
}
