/**
 * FlowGenix Provider Protocol Adapters & Reasoning Parser
 * Inspired by OmniRoute Universal Protocol Translation Engine
 * 
 * Handles protocol transformations for upstream providers (Anthropic, DeepSeek, OpenRouter, Gemini),
 * normalizes reasoning tokens (<think> tags), and provides Power-of-Two-Choices (P2C) key selection.
 */

import { circuitBreaker } from "./circuit-breaker";

/**
 * Power of Two Choices (P2C) Key Selector with Circuit Breaker Awareness
 * Selects the optimal key from a pool of configured keys for a given provider.
 */
export function selectOptimalKey(dbConfigs, provider) {
    if (!dbConfigs || dbConfigs.length === 0) return null;
    if (dbConfigs.length === 1) return dbConfigs[0];

    // Filter keys that are currently healthy according to the Circuit Breaker
    const availableKeys = dbConfigs.filter(cfg => {
        const check = circuitBreaker.canExecute(cfg.id, provider);
        return check.allowed;
    });

    // If no keys are currently marked healthy, fall back to the first key as a probe
    const candidatePool = availableKeys.length > 0 ? availableKeys : dbConfigs;

    // Prioritize default key if it's healthy
    const defaultKey = candidatePool.find(c => c.isDefault);
    if (defaultKey) return defaultKey;

    // If 2 or more candidates, apply P2C (Power of Two Random Choices)
    if (candidatePool.length >= 2) {
        const idx1 = Math.floor(Math.random() * candidatePool.length);
        let idx2 = Math.floor(Math.random() * candidatePool.length);
        while (idx2 === idx1) {
            idx2 = Math.floor(Math.random() * candidatePool.length);
        }

        const k1 = candidatePool[idx1];
        const k2 = candidatePool[idx2];

        const latency1 = parseInt(k1.latency || '200', 10);
        const latency2 = parseInt(k2.latency || '200', 10);

        return latency1 <= latency2 ? k1 : k2;
    }

    return candidatePool[0];
}

/**
 * Normalizes DeepSeek R1 and other reasoning models output into standard <think> blocks
 */
export function normalizeReasoningContent(content, reasoningContent) {
    if (reasoningContent && typeof reasoningContent === 'string' && reasoningContent.trim()) {
        const trimmedReasoning = reasoningContent.trim();
        // If content already contains <think>, don't duplicate
        if (!content || !content.includes('<think>')) {
            return `<think>\n${trimmedReasoning}\n</think>\n\n${content || ''}`.trim();
        }
    }
    return content || '';
}

/**
 * Format headers and payload specifically tailored for the target provider
 */
export function prepareProviderRequest({
    provider,
    model,
    messages,
    stream,
    safeMaxTokens,
    cleanApiKey,
    extraParams = {}
}) {
    const prov = provider?.toLowerCase() || '';

    // Standard default headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanApiKey}`
    };

    let payload = {
        model,
        messages,
        stream: Boolean(stream),
        max_tokens: safeMaxTokens,
        ...extraParams
    };

    // Provider-specific adjustments
    if (prov === 'openrouter') {
        headers['HTTP-Referer'] = 'https://devlomatix.com';
        headers['X-Title'] = 'FlowGenix AI Gateway';

        // Auto-middle-out context compression for large token payloads
        if (JSON.stringify(messages).length > 25000) {
            payload.transforms = ['middle-out'];
        }
    } else if (prov === 'anthropic' && !cleanApiKey.startsWith('sk-ant-')) {
        // OpenAI-compatible Anthropic proxy
    } else if (prov === 'deepseek') {
        // DeepSeek Native parameters (temperature = 0.6 recommended for DeepSeek R1)
        if (model.includes('reasoner') || model.includes('r1')) {
            payload.temperature = 0.6;
        }
    } else if (prov === 'groq') {
        // Groq high throughput optimizations
        headers['Accept'] = stream ? 'text/event-stream' : 'application/json';
    }

    return { headers, payload };
}
