/**
 * FlowGenix High-Performance Response Cache
 * Implements deterministic prompt hashing, LRU eviction, and zero-cost response replay.
 */

import crypto from "node:crypto";

if (!globalThis.__flowgenixResponseCache) {
    globalThis.__flowgenixResponseCache = new Map();
    globalThis.__flowgenixCacheStats = {
        hits: 0,
        misses: 0,
        savedTokens: 0
    };
}

const cacheStore = globalThis.__flowgenixResponseCache;
const stats = globalThis.__flowgenixCacheStats;
const MAX_CACHE_ENTRIES = 500;
const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes default

class GatewayCacheService {
    /**
     * Compute a deterministic hash key for an incoming request
     */
    generateCacheKey({ workspaceId, model, messages, temperature = 0.2, responseFormat = null }) {
        const normalized = {
            ws: String(workspaceId || ''),
            m: String(model || 'auto').trim().toLowerCase(),
            temp: typeof temperature === 'number' ? Math.round(temperature * 10) / 10 : 0.2,
            fmt: responseFormat || 'text',
            msgs: (messages || []).map(msg => ({
                r: String(msg.role || 'user').toLowerCase(),
                c: typeof msg.content === 'string' ? msg.content.trim() : JSON.stringify(msg.content || '')
            }))
        };

        const jsonStr = JSON.stringify(normalized);
        return crypto.createHash('sha256').update(jsonStr).digest('hex');
    }

    /**
     * Look up a cached response
     */
    get(cacheKey) {
        if (!cacheStore.has(cacheKey)) {
            stats.misses += 1;
            return null;
        }

        const entry = cacheStore.get(cacheKey);
        const now = Date.now();

        // Check expiration
        if (now - entry.createdAt > entry.ttlMs) {
            cacheStore.delete(cacheKey);
            stats.misses += 1;
            return null;
        }

        // Move to most recently used in Map
        cacheStore.delete(cacheKey);
        cacheStore.set(cacheKey, entry);

        stats.hits += 1;
        stats.savedTokens += (entry.tokensIn + entry.tokensOut);

        return entry;
    }

    /**
     * Store a response in cache
     */
    set(cacheKey, {
        body,
        resolvedProvider,
        resolvedModel,
        tokensIn = 0,
        tokensOut = 0,
        ttlMs = DEFAULT_TTL_MS
    }) {
        // Enforce LRU size limit
        if (cacheStore.size >= MAX_CACHE_ENTRIES) {
            const oldestKey = cacheStore.keys().next().value;
            if (oldestKey) cacheStore.delete(oldestKey);
        }

        cacheStore.set(cacheKey, {
            body,
            resolvedProvider,
            resolvedModel,
            tokensIn,
            tokensOut,
            ttlMs,
            createdAt: Date.now()
        });
    }

    /**
     * Retrieve global cache statistics
     */
    getStats() {
        const total = stats.hits + stats.misses;
        const hitRatio = total > 0 ? `${Math.round((stats.hits / total) * 100)}%` : '0%';
        return {
            hits: stats.hits,
            misses: stats.misses,
            hitRatio,
            savedTokens: stats.savedTokens,
            cachedEntries: cacheStore.size
        };
    }

    /**
     * Clear all cached entries
     */
    clear() {
        cacheStore.clear();
        stats.hits = 0;
        stats.misses = 0;
        stats.savedTokens = 0;
    }
}

export const gatewayCache = new GatewayCacheService();
