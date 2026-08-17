/**
 * FlowGenix Token Compression Engine
 * Implements RTK (Redundant Token Killer) and Caveman Prompt Compaction
 */

// Simple approximate token estimator (~4 characters per token for English / code)
export function estimateTokens(text) {
    if (!text || typeof text !== 'string') return 0;
    // Approximates GPT/Claude subword tokenization
    return Math.max(1, Math.ceil(text.trim().length / 3.8));
}

/**
 * RTK (Redundant Token Killer) Filter
 * Aggressively trims redundant terminal logs, git diffs, excessive JSON formatting, stack traces, and noise.
 */
export function applyRtkFilter(input) {
    if (!input || typeof input !== 'string') return input;

    let text = input;

    // 1. Compress consecutive blank lines
    text = text.replace(/\n{3,}/g, '\n\n');

    // 2. Compress Git Diffs (removes unchanged hunk context padding and index metadata lines)
    if (text.includes('diff --git') || text.includes('index ') || text.includes('@@ -')) {
        text = text.replace(/^index [0-9a-f]+\.\.[0-9a-f]+.*$/gm, '');
        text = text.replace(/^===\s*$/gm, '');
        // Collapse repetitive +/- whitespace
        text = text.replace(/\n\s*\n/g, '\n');
    }

    // 3. Compress Build Output & Stack Traces (trim node_modules / gradle / mvn noise)
    text = text.replace(/^\s*at\s+.*node_modules.*$/gm, '');
    text = text.replace(/^\s*at\s+.*internal\/process.*$/gm, '');
    text = text.replace(/\[webpack\.cache\.PackFileCacheStrategy\]\s*Stored\s*\(.*?\)/g, '');

    // 4. Minify embedded JSON blocks if detected
    text = text.replace(/\{(\s*"[a-zA-Z0-9_-]+":\s*("[^"]*"|\d+|true|false|null|\[.*?\]|\{.*?\})\s*,?\s*){3,}\}/gs, (match) => {
        try {
            const parsed = JSON.parse(match);
            return JSON.stringify(parsed);
        } catch {
            return match;
        }
    });

    return text.trim();
}

/**
 * Caveman Prompt Compactor
 * Compresses system prompts and conversational prose by removing filler phrases, 
 * conversational pleasantries, and redundant instructions while strictly preserving directives.
 */
export function applyCavemanFilter(input) {
    if (!input || typeof input !== 'string') return input;

    let text = input;

    // Remove common conversational filler phrases
    const fillers = [
        /\b(Please be aware that|Please note that|It is important to remember that)\b/gi,
        /\b(In order to|With the purpose of)\b/gi,
        /\b(Feel free to|Don't hesitate to|Make sure to always)\b/gi,
        /\b(As an AI assistant,|As a large language model,)\b/gi,
        /\b(I would be happy to help you with|Sure, I can assist you with)\b/gi,
        /\b(Let me know if you need any further assistance\b\.?)/gi,
        /\b(Hope this helps!\b\.?)/gi
    ];

    fillers.forEach(regex => {
        text = text.replace(regex, '');
    });

    // Replace verbose phrases with concise equivalents
    const replacements = [
        { from: /\bat this point in time\b/gi, to: 'now' },
        { from: /\bdue to the fact that\b/gi, to: 'because' },
        { from: /\butilize\b/gi, to: 'use' },
        { from: /\bin the event that\b/gi, to: 'if' },
        { from: /\bfor the purpose of\b/gi, to: 'for' }
    ];

    replacements.forEach(({ from, to }) => {
        text = text.replace(from, to);
    });

    // Cleanup excessive whitespace
    text = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

    return text;
}

/**
 * Master Token Compression Pipeline
 * Applies selected modules and returns compressed text along with metrics
 */
export function compressPayload(content, options = { rtk: true, caveman: true, inflationGuard: true }) {
    if (!content) return { compressed: content, originalTokens: 0, compressedTokens: 0, savingsPercent: 0 };

    const originalTokens = estimateTokens(content);
    let working = content;

    if (options.rtk) {
        working = applyRtkFilter(working);
    }

    if (options.caveman) {
        working = applyCavemanFilter(working);
    }

    const compressedTokens = estimateTokens(working);

    // Inflation Guard: If compression somehow grew the token count, discard it
    if (options.inflationGuard && compressedTokens > originalTokens) {
        return {
            compressed: content,
            originalTokens,
            compressedTokens: originalTokens,
            savingsPercent: 0,
            applied: false
        };
    }

    const savings = originalTokens > 0 
        ? Math.max(0, Math.round(((originalTokens - compressedTokens) / originalTokens) * 100))
        : 0;

    return {
        compressed: working,
        originalTokens,
        compressedTokens,
        savingsPercent: savings,
        applied: savings > 0
    };
}
