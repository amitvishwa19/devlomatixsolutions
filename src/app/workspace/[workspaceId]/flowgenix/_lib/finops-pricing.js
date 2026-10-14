/**
 * FlowGenix FinOps & Token Pricing Matrix
 * Exact input/output token pricing per 1,000,000 tokens (USD)
 * Supports model-specific rates and provider fallbacks.
 */

export const MODEL_PRICING = {
    // OpenAI Models
    "gpt-4o": { in: 2.50, out: 10.00, provider: "openai", tier: "paid" },
    "gpt-4o-mini": { in: 0.15, out: 0.60, provider: "openai", tier: "paid" },
    "gpt-4-turbo": { in: 10.00, out: 30.00, provider: "openai", tier: "paid" },
    "o1": { in: 15.00, out: 60.00, provider: "openai", tier: "paid" },
    "o1-mini": { in: 3.00, out: 12.00, provider: "openai", tier: "paid" },
    "o3-mini": { in: 1.10, out: 4.40, provider: "openai", tier: "paid" },

    // Anthropic Models
    "claude-3-7-sonnet": { in: 3.00, out: 15.00, provider: "anthropic", tier: "paid" },
    "claude-3-5-sonnet": { in: 3.00, out: 15.00, provider: "anthropic", tier: "paid" },
    "claude-3-5-haiku": { in: 0.80, out: 4.00, provider: "anthropic", tier: "paid" },
    "claude-3-opus": { in: 15.00, out: 75.00, provider: "anthropic", tier: "paid" },

    // DeepSeek Models
    "deepseek-chat": { in: 0.14, out: 0.28, provider: "deepseek", tier: "paid" },
    "deepseek-reasoner": { in: 0.55, out: 2.19, provider: "deepseek", tier: "paid" },
    "deepseek/deepseek-chat": { in: 0.14, out: 0.28, provider: "deepseek", tier: "paid" },
    "deepseek/deepseek-r1": { in: 0.55, out: 2.19, provider: "deepseek", tier: "paid" },

    // Google Models (AI Studio Free Tier / Standard)
    "gemini-2.0-flash": { in: 0.10, out: 0.40, provider: "google", tier: "free_eligible" },
    "gemini-1.5-flash": { in: 0.075, out: 0.30, provider: "google", tier: "free_eligible" },
    "gemini-1.5-pro": { in: 1.25, out: 5.00, provider: "google", tier: "paid" },

    // Groq Cloud Models (Free tier available / high speed)
    "llama-3.3-70b-versatile": { in: 0.059, out: 0.079, provider: "groq", tier: "free_eligible" },
    "llama-3.1-8b-instant": { in: 0.05, out: 0.08, provider: "groq", tier: "free_eligible" },
    "mixtral-8x7b-32768": { in: 0.05, out: 0.08, provider: "groq", tier: "free_eligible" },

    // OpenRouter Auto & Aggregated
    "openrouter/auto": { in: 0.20, out: 0.40, provider: "openrouter", tier: "paid" },
    "meta-llama/llama-3.3-70b-instruct": { in: 0.12, out: 0.30, provider: "openrouter", tier: "paid" },
    "meta-llama/llama-3.1-8b-instruct": { in: 0.04, out: 0.05, provider: "openrouter", tier: "paid" },

    // 100% Free Providers
    "freemodel": { in: 0.00, out: 0.00, provider: "freemodel", tier: "free" },
    "ollama": { in: 0.00, out: 0.00, provider: "ollama", tier: "free" }
};

// Fallback pricing per provider if exact model slug is not in the table
export const PROVIDER_FALLBACK_PRICING = {
    "freemodel": { in: 0.00, out: 0.00, tier: "free" },
    "ollama": { in: 0.00, out: 0.00, tier: "free" },
    "nvidia": { in: 0.00, out: 0.00, tier: "free" },
    "groq": { in: 0.05, out: 0.08, tier: "free_eligible" },
    "google": { in: 0.10, out: 0.40, tier: "free_eligible" },
    "deepseek": { in: 0.14, out: 0.28, tier: "paid" },
    "openrouter": { in: 0.20, out: 0.40, tier: "paid" },
    "openai": { in: 0.15, out: 0.60, tier: "paid" },
    "anthropic": { in: 1.00, out: 5.00, tier: "paid" }
};

/**
 * Resolve rate per 1M tokens for a given model & provider
 */
export function getModelRate(provider = "", model = "") {
    const p = provider.toLowerCase().trim();
    const m = model.toLowerCase().trim();

    // 1. Direct match on model
    if (MODEL_PRICING[m]) {
        return MODEL_PRICING[m];
    }

    // 2. Fuzzy match on known models
    for (const [key, rate] of Object.entries(MODEL_PRICING)) {
        if (m.includes(key) || key.includes(m)) {
            return rate;
        }
    }

    // 3. Match on provider fallback
    if (PROVIDER_FALLBACK_PRICING[p]) {
        return {
            ...PROVIDER_FALLBACK_PRICING[p],
            provider: p
        };
    }

    // 4. Default conservative estimate
    return { in: 0.20, out: 0.50, provider: p, tier: "paid" };
}

/**
 * Calculate precise USD cost for a token count
 */
export function calculateTokenCost({ provider, model, tokensIn = 0, tokensOut = 0 }) {
    const rate = getModelRate(provider, model);
    const costIn = (Number(tokensIn || 0) / 1_000_000) * rate.in;
    const costOut = (Number(tokensOut || 0) / 1_000_000) * rate.out;
    const totalCost = costIn + costOut;

    return {
        costUsd: Number(totalCost.toFixed(6)),
        rateIn: rate.in,
        rateOut: rate.out,
        tier: rate.tier
    };
}
