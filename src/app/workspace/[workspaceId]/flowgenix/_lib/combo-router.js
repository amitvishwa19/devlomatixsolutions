import dns from "node:dns";
import { db } from "@/lib/db";
import { compressPayload, estimateTokens } from "./compression-engine";
import { recordTelemetry } from "./telemetry-store";
import { runAgentOrchestrator } from "./agent-orchestrator";
import { circuitBreaker } from "./circuit-breaker";
import { prepareProviderRequest, selectOptimalKey, normalizeReasoningContent } from "./provider-adapters";
import { gatewayCache } from "./gateway-cache";
import { spendGuard } from "./spend-guard";

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
        { provider: "openai", model: "gpt-4o-mini", name: "GPT-4o Mini" },
        { provider: "ollama", model: "llama3.2:latest", name: "Local Ollama (Offline Protection)" }
    ],
    "auto/coding": [
        { provider: "openrouter", model: "auto", name: "OpenRouter Auto" },
        { provider: "anthropic", model: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet" },
        { provider: "deepseek", model: "deepseek-chat", name: "DeepSeek V3" },
        { provider: "openai", model: "gpt-4o", name: "GPT-4o" },
        { provider: "google", model: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
        { provider: "groq", model: "llama-3.3-70b-versatile", name: "Groq Llama 3.3" }
    ],
    "auto/fast": [
        { provider: "openrouter", model: "auto", name: "OpenRouter Auto" },
        { provider: "groq", model: "llama-3.3-70b-versatile", name: "Groq Llama 3.3 (High Speed)" },
        { provider: "google", model: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
        { provider: "deepseek", model: "deepseek-chat", name: "DeepSeek V3" }
    ],
    "auto/cheap": [
        { provider: "openrouter", model: "auto", name: "OpenRouter Auto" },
        { provider: "groq", model: "llama-3.3-70b-versatile", name: "Groq Cloud (Free Tier)" },
        { provider: "google", model: "gemini-2.0-flash", name: "Google AI Studio (Free Tier)" },
        { provider: "deepseek", model: "deepseek-chat", name: "DeepSeek V3" }
    ],
    "auto/smart": [
        { provider: "openrouter", model: "auto", name: "OpenRouter Auto" },
        { provider: "anthropic", model: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet" },
        { provider: "deepseek", model: "deepseek-reasoner", name: "DeepSeek R1" },
        { provider: "google", model: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
        { provider: "openai", model: "gpt-4o", name: "GPT-4o" }
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
        orderBy: [
            { isDefault: "desc" },
            { updatedAt: "desc" },
            { createdAt: "desc" }
        ]
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

    // Agent orchestration path: "agent/<name>" targets the master orchestrator agent
    if (requestedModel && typeof requestedModel === "string" && requestedModel.trim().toLowerCase().startsWith("agent/")) {
        return await runAgentOrchestrator({ workspaceId, model: requestedModel.trim(), messages, stream });
    }

    const keyId = extraParams.keyId || null;
    const keyLabel = extraParams.keyLabel || "Gateway Key";
    const keyCap = extraParams.keyCap || null;

    // High-Performance Response Cache Check (serves duplicate queries in <5ms at $0 cost)
    const enableCache = extraParams.cache !== false && !stream;
    const cacheKey = enableCache ? gatewayCache.generateCacheKey({
        workspaceId,
        model: requestedModel,
        messages,
        temperature: extraParams.temperature,
        responseFormat: extraParams.response_format || extraParams.responseFormat
    }) : null;

    if (enableCache && cacheKey) {
        const cached = gatewayCache.get(cacheKey);
        if (cached) {
            const latencyMs = Math.max(2, Date.now() - startTime);
            console.log(`[FlowGenix Cache] ⚡ Cache HIT for ${requestedModel} (${latencyMs}ms, saved ${cached.tokensIn + cached.tokensOut} tokens)`);
            
            spendGuard.recordSpend({
                workspaceId,
                keyId,
                keyLabel,
                keyCap,
                provider: cached.resolvedProvider,
                model: cached.resolvedModel,
                tokensIn: cached.tokensIn,
                tokensOut: cached.tokensOut,
                isCached: true
            });

            recordTelemetry({
                workspaceId,
                requestModel: requestedModel,
                resolvedProvider: `${cached.resolvedProvider.toUpperCase()} (CACHED)`,
                resolvedModel: cached.resolvedModel,
                tokensIn: cached.tokensIn,
                tokensOut: cached.tokensOut,
                compressionSavings: "100%",
                latencyMs,
                status: 200
            });

            return {
                success: true,
                response: new Response(cached.body, {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-FlowGenix-Cache': 'HIT',
                        'X-FlowGenix-Resolved-Provider': cached.resolvedProvider,
                        'X-FlowGenix-Resolved-Model': cached.resolvedModel,
                        'X-FlowGenix-Latency-Ms': String(latencyMs)
                    }
                }),
                resolvedProvider: cached.resolvedProvider,
                resolvedModel: cached.resolvedModel,
                latencyMs,
                isCached: true
            };
        }
    }

    // Spend Guard Pre-flight Budget Verification
    const budgetCheck = await spendGuard.checkBudget(workspaceId, keyId);
    if (!budgetCheck.allowed) {
        return {
            success: false,
            status: 402,
            error: `FlowGenix Spend Guard: ${budgetCheck.reason}`,
            details: { code: "budget_exceeded" }
        };
    }

    const resolution = await resolveCandidateTargets(workspaceId, requestedModel);
    let candidates = resolution.targets;
    let isDowngradedToFree = false;

    if (budgetCheck.shouldDowngradeToFree) {
        console.warn(`[FlowGenix SpendGuard] 🛡️ ${budgetCheck.reason} Routing via 100% Free Tier.`);
        candidates = [
            { provider: "freemodel", model: "meta-llama/llama-3.1-8b-instruct", name: "FreeModel Llama 3.1 (Spend Guard Free Tier)" },
            { provider: "groq", model: "llama-3.3-70b-versatile", name: "Groq Cloud (Free Tier)" },
            { provider: "google", model: "gemini-2.0-flash", name: "Google AI Studio (Free Tier)" },
            { provider: "ollama", model: "llama3.2:latest", name: "Local Ollama" }
        ];
        isDowngradedToFree = true;
    }

    // Fetch all active configured keys for this workspace (prioritizing default and latest updated)
    const configuredModels = await db.agentModel.findMany({
        where: { workspaceId, isActive: true },
        orderBy: [
            { isDefault: "desc" },
            { updatedAt: "desc" },
            { createdAt: "desc" }
        ]
    });

    if (!configuredModels || configuredModels.length === 0) {
        return {
            success: false,
            status: 400,
            error: "No active LLM providers configured in this workspace. Please go to the Providers tab and connect at least one provider (e.g. FreeModel.dev, Groq, Google AI Studio, OpenRouter, OpenAI, or Ollama)."
        };
    }

    // Group all active configurations per provider (supporting multi-key fallback)
    const providerMap = new Map();
    configuredModels.forEach(m => {
        const prov = m.provider.toLowerCase();
        if (!providerMap.has(prov)) {
            providerMap.set(prov, []);
        }
        providerMap.get(prov).push(m);
    });

    let totalSavingsPercent = 0;

    // Process compression on input messages if enabled
    let processedMessages = messages.map(msg => {
        if (Array.isArray(msg.content)) {
            return msg;
        }
        if (typeof msg.content === 'string' && (compression?.rtk || compression?.caveman) && msg.content.length > 30) {
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

    // Clean and validate message objects (supporting both standard strings and multimodal vision arrays)
    const cleanMessages = processedMessages.map(m => ({
        role: String(m.role || 'user'),
        content: Array.isArray(m.content) 
            ? m.content 
            : (typeof m.content === 'string' ? m.content : JSON.stringify(m.content || ''))
    }));

    const inputTokens = estimateTokens(JSON.stringify(cleanMessages));
    const errorsTried = [];

    // Safe Token Limits Normalization:
    // When max_tokens is omitted, providers like OpenRouter reserve credits for the maximum context window (e.g., 28k-32k tokens),
    // which fails on accounts with limited credits with: "This request requires more credits, or fewer max_tokens. You requested up to X tokens, but can only afford Y".
    let requestedMaxTokens = extraParams.max_tokens ?? extraParams.maxTokens;
    let safeMaxTokens = 2048; // Safe default token limit

    if (requestedMaxTokens !== undefined && requestedMaxTokens !== null) {
        const parsed = Number(requestedMaxTokens);
        if (!isNaN(parsed) && parsed > 0) {
            safeMaxTokens = Math.min(parsed, 4096);
        }
    }

    const cleanExtraParams = { ...extraParams };
    delete cleanExtraParams.maxTokens;
    delete cleanExtraParams.max_tokens;

    // Cascading Failover Loop across candidate models & providers
    for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        const dbConfigs = providerMap.get(candidate.provider.toLowerCase()) || [];

        // Skip candidate if no active key configured for this provider in this workspace
        if (dbConfigs.length === 0) {
            continue;
        }

        // Sort candidate keys using P2C priority and circuit health
        const sortedDbConfigs = [...dbConfigs].sort((a, b) => {
            const aCheck = circuitBreaker.canExecute(a.id, candidate.provider);
            const bCheck = circuitBreaker.canExecute(b.id, candidate.provider);
            if (aCheck.allowed && !bCheck.allowed) return -1;
            if (!aCheck.allowed && bCheck.allowed) return 1;
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return 0;
        });

        // Try each configured key for this provider (in order of default, recent, and health)
        for (const dbConfig of sortedDbConfigs) {
            const isOllama = candidate.provider.toLowerCase() === 'ollama';
            if (!dbConfig || (!dbConfig.apiKey && !isOllama)) {
                continue;
            }

            let targetModel = candidate.model;
            if (!targetModel || targetModel === "main" || targetModel === "auto" || targetModel.toLowerCase().includes("main")) {
                targetModel = (dbConfig.name && !dbConfig.name.toLowerCase().includes("main")) 
                    ? dbConfig.name 
                    : (DEFAULT_PROVIDER_MODELS[candidate.provider.toLowerCase()] || "auto");
            }

            // Adaptive Circuit Breaker Check: immediately bypass keys in cooldown (0ms latency penalty)
            const breakerCheck = circuitBreaker.canExecute(dbConfig.id, candidate.provider, targetModel);
            if (!breakerCheck.allowed) {
                console.warn(`[FlowGenix CircuitBreaker] ⚡ Fast-bypassing key ${dbConfig.id} (${candidate.provider}/${targetModel}): ${breakerCheck.reason}`);
                errorsTried.push({
                    provider: candidate.provider,
                    model: targetModel,
                    keyId: dbConfig.id,
                    status: 503,
                    error: `Circuit Breaker: ${breakerCheck.reason}`
                });
                continue;
            }

            const baseUrl = getProviderBaseUrl(candidate.provider, dbConfig.baseUrl);
            const endpoint = `${baseUrl}/chat/completions`;
            const cleanApiKey = dbConfig.apiKey ? dbConfig.apiKey.replace(/^Bearer\s+/i, '').trim() : 'ollama';

            try {
                const controller = new AbortController();
                const timeoutMs = isOllama ? 5000 : 35000;
                const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

                const { headers, payload } = prepareProviderRequest({
                    provider: candidate.provider,
                    model: targetModel,
                    messages: cleanMessages,
                    stream,
                    safeMaxTokens,
                    cleanApiKey,
                    extraParams: cleanExtraParams
                });

                const targetRes = await fetch(endpoint, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                // If success, reset circuit breaker, log telemetry and return response
                if (targetRes.ok) {
                    circuitBreaker.recordSuccess(dbConfig.id, candidate.provider, targetModel);
                    const latencyMs = Date.now() - startTime;

                    if (enableCache && cacheKey && !stream) {
                        try {
                            const clonedForCache = targetRes.clone();
                            clonedForCache.text().then(cachedBody => {
                                gatewayCache.set(cacheKey, {
                                    body: cachedBody,
                                    resolvedProvider: candidate.provider,
                                    resolvedModel: targetModel,
                                    tokensIn: inputTokens,
                                    tokensOut: 200
                                });
                            }).catch(() => {});
                        } catch {}
                    }

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

                    spendGuard.recordSpend({
                        workspaceId,
                        keyId,
                        keyLabel,
                        keyCap,
                        provider: candidate.provider,
                        model: targetModel,
                        tokensIn: inputTokens,
                        tokensOut: stream ? 150 : 200,
                        isCached: false,
                        compressionSavingsPercent: totalSavingsPercent
                    });

                    return {
                        success: true,
                        response: targetRes,
                        resolvedProvider: candidate.provider,
                        resolvedModel: targetModel,
                        latencyMs,
                        isDowngradedToFree
                    };
                }

                // If non-200 (e.g. 429 Rate Limit, 400/402 Credit Limit, 500 Server Error, 404 Model Not Found)
                const errorText = await targetRes.text().catch(() => "Unknown response body");
                const retryAfter = targetRes.headers.get('retry-after');

                // Trip or update circuit breaker state
                circuitBreaker.recordFailure(dbConfig.id, candidate.provider, targetModel, targetRes.status, errorText, retryAfter);

                // Smart Auto-Recovery for OpenRouter / LLM Credit & max_tokens limit errors
                if (candidate.provider === 'openrouter' && (targetRes.status === 400 || targetRes.status === 402 || targetRes.status === 403)) {
                    const isNeverPurchased = errorText.toLowerCase().includes("never purchased credits") || errorText.toLowerCase().includes("insufficient credits");
                    const affordableMatch = errorText.match(/can only afford (\d+)/i);
                    const hasMaxTokensMsg = errorText.toLowerCase().includes("fewer max_tokens") || errorText.toLowerCase().includes("more credits");

                    // 1. If key has never purchased credits or ran out of credits, auto-fall back to OpenRouter free models
                    if (isNeverPurchased && targetModel !== "openrouter/free") {
                        console.log(`[FlowGenix Gateway] OpenRouter key reported insufficient credits. Auto-recovering with 'openrouter/free'...`);
                        try {
                            const freeRes = await fetch(endpoint, {
                                method: 'POST',
                                headers,
                                body: JSON.stringify({
                                    ...payload,
                                    model: 'openrouter/free'
                                })
                            });

                            if (freeRes.ok) {
                                circuitBreaker.recordSuccess(dbConfig.id, candidate.provider, 'openrouter/free');
                                const latencyMs = Date.now() - startTime;
                                recordTelemetry({
                                    workspaceId,
                                    requestModel: requestedModel,
                                    resolvedProvider: dbConfig.provider.toUpperCase(),
                                    resolvedModel: 'openrouter/free',
                                    tokensIn: inputTokens,
                                    tokensOut: stream ? 150 : 200,
                                    compressionSavings: totalSavingsPercent > 0 ? `${totalSavingsPercent}%` : "0%",
                                    latencyMs,
                                    status: freeRes.status
                                });

                                return {
                                    success: true,
                                    response: freeRes,
                                    resolvedProvider: candidate.provider,
                                    resolvedModel: 'openrouter/free',
                                    latencyMs
                                };
                            }
                        } catch (freeErr) {
                            console.warn("[FlowGenix Gateway] OpenRouter 'openrouter/free' recovery failed:", freeErr.message);
                        }
                    }

                    // 2. If it is a max_tokens budget calculation error, lower max_tokens
                    if (affordableMatch || (hasMaxTokensMsg && !isNeverPurchased)) {
                        const affordableCount = affordableMatch ? parseInt(affordableMatch[1], 10) : 1024;
                        const retryLimit = Math.max(128, Math.min(affordableCount > 100 ? affordableCount - 100 : affordableCount, 1500));
                        
                        console.log(`[FlowGenix Gateway] Auto-recovering OpenRouter ${targetModel} (available credits: ~${affordableCount} tokens). Retrying with max_tokens=${retryLimit}...`);

                        try {
                            const retryRes = await fetch(endpoint, {
                                method: 'POST',
                                headers,
                                body: JSON.stringify({
                                    ...payload,
                                    max_tokens: retryLimit
                                })
                            });

                            if (retryRes.ok) {
                                circuitBreaker.recordSuccess(dbConfig.id, candidate.provider, targetModel);
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
                                    status: retryRes.status
                                });

                                return {
                                    success: true,
                                    response: retryRes,
                                    resolvedProvider: candidate.provider,
                                    resolvedModel: targetModel,
                                    latencyMs
                                };
                            }
                        } catch (retryErr) {
                            console.warn("[FlowGenix Gateway] OpenRouter auto-retry failed:", retryErr.message);
                        }
                    }
                }

                // Auto-recovery for OpenRouter missing / deprecated model (404 or invalid model ID)
                if (candidate.provider === 'openrouter' && (targetRes.status === 404 || (targetRes.status === 400 && errorText.includes('model ID'))) && targetModel !== 'auto') {
                    console.log(`[FlowGenix Gateway] OpenRouter model ${targetModel} returned ${targetRes.status}. Auto-recovering with 'auto'...`);
                    try {
                        const autoRes = await fetch(endpoint, {
                            method: 'POST',
                            headers,
                            body: JSON.stringify({
                                ...payload,
                                model: 'auto'
                            })
                        });

                        if (autoRes.ok) {
                            circuitBreaker.recordSuccess(dbConfig.id, candidate.provider, 'auto');
                            const latencyMs = Date.now() - startTime;
                            recordTelemetry({
                                workspaceId,
                                requestModel: requestedModel,
                                resolvedProvider: dbConfig.provider.toUpperCase(),
                                resolvedModel: 'auto',
                                tokensIn: inputTokens,
                                tokensOut: stream ? 150 : 200,
                                compressionSavings: totalSavingsPercent > 0 ? `${totalSavingsPercent}%` : "0%",
                                latencyMs,
                                status: autoRes.status
                            });

                            return {
                                success: true,
                                response: autoRes,
                                resolvedProvider: candidate.provider,
                                resolvedModel: 'auto',
                                latencyMs
                            };
                        }
                    } catch (autoErr) {
                        console.warn("[FlowGenix Gateway] OpenRouter 'auto' recovery failed:", autoErr.message);
                    }
                }

                console.warn(`[FlowGenix Gateway] Failover: ${candidate.provider}/${targetModel} (key ${dbConfig.id}) status ${targetRes.status}. Cascading to backup...`);

                errorsTried.push({
                    provider: candidate.provider,
                    model: targetModel,
                    keyId: dbConfig.id,
                    status: targetRes.status,
                    error: errorText.slice(0, 150)
                });

            } catch (fetchErr) {
                const causeDetail = fetchErr.cause ? ` (${fetchErr.cause.message || fetchErr.cause.code || ''})` : '';
                const errorMsg = fetchErr.name === 'AbortError' ? 'Timeout (35s)' : `${fetchErr.message}${causeDetail}`;
                console.warn(`[FlowGenix Gateway] Failover: Network error on ${candidate.provider}/${targetModel}: ${errorMsg}`);
                
                circuitBreaker.recordFailure(dbConfig.id, candidate.provider, targetModel, 504, errorMsg);

                errorsTried.push({
                    provider: candidate.provider,
                    model: targetModel,
                    keyId: dbConfig.id,
                    error: errorMsg
                });
            }
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
