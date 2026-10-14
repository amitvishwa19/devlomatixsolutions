/**
 * FlowGenix Adaptive Circuit Breaker & Health State Manager
 * Inspired by OmniRoute resilient gateway architecture.
 * 
 * Prevents cascading latency delays by instantly bypassing failing, 
 * exhausted, or rate-limited upstream provider keys without waiting for network timeouts.
 */

const CIRCUIT_STATES = {
    CLOSED: 'CLOSED',       // Healthy, normal execution
    OPEN: 'OPEN',           // Tripped, in cooldown, requests immediately bypassed
    HALF_OPEN: 'HALF_OPEN'  // Probe state, allows 1 trial request to test recovery
};

// Singleton in-memory registry across Node.js runtime
if (!globalThis.__flowgenixCircuitBreaker) {
    globalThis.__flowgenixCircuitBreaker = new Map();
}
const breakerRegistry = globalThis.__flowgenixCircuitBreaker;

class CircuitBreakerService {
    /**
     * Generate unique identifier for an upstream endpoint
     */
    _getBreakerKey(keyId, provider, model) {
        if (keyId) return `key:${keyId}`;
        return `provider:${provider?.toLowerCase()}:${model?.toLowerCase() || 'default'}`;
    }

    /**
     * Determine if a target can be executed immediately
     */
    canExecute(keyId, provider, model) {
        const id = this._getBreakerKey(keyId, provider, model);
        const record = breakerRegistry.get(id);

        if (!record || record.state === CIRCUIT_STATES.CLOSED) {
            return { allowed: true, state: CIRCUIT_STATES.CLOSED };
        }

        const now = Date.now();
        const elapsed = now - record.lastFailureTime;

        if (record.state === CIRCUIT_STATES.OPEN) {
            // Check if cooldown has expired
            if (elapsed >= record.cooldownMs) {
                record.state = CIRCUIT_STATES.HALF_OPEN;
                breakerRegistry.set(id, record);
                return { allowed: true, state: CIRCUIT_STATES.HALF_OPEN, reason: "Testing service recovery (half-open)" };
            }
            return {
                allowed: false,
                state: CIRCUIT_STATES.OPEN,
                reason: `Temporarily suspended (${record.reason || 'Error cooldown'}). Retry in ${Math.ceil((record.cooldownMs - elapsed) / 1000)}s`
            };
        }

        if (record.state === CIRCUIT_STATES.HALF_OPEN) {
            // Only allow 1 probe through
            if (record.probeInFlight) {
                return {
                    allowed: false,
                    state: CIRCUIT_STATES.HALF_OPEN,
                    reason: "Recovery probe currently in-flight"
                };
            }
            record.probeInFlight = true;
            return { allowed: true, state: CIRCUIT_STATES.HALF_OPEN };
        }

        return { allowed: true, state: CIRCUIT_STATES.CLOSED };
    }

    /**
     * Record a successful response, resetting circuit to CLOSED
     */
    recordSuccess(keyId, provider, model) {
        const id = this._getBreakerKey(keyId, provider, model);
        breakerRegistry.delete(id);
    }

    /**
     * Record an upstream failure and adaptively trip circuit if threshold reached
     */
    recordFailure(keyId, provider, model, statusCode, errorText = '', retryAfterSeconds = null) {
        const id = this._getBreakerKey(keyId, provider, model);
        const existing = breakerRegistry.get(id) || {
            failures: 0,
            consecutiveFailures: 0,
            state: CIRCUIT_STATES.CLOSED,
            cooldownMs: 30000,
            reason: ''
        };

        const now = Date.now();
        existing.consecutiveFailures += 1;
        existing.failures += 1;
        existing.lastFailureTime = now;
        existing.probeInFlight = false;

        const lowerError = String(errorText).toLowerCase();

        // 1. Quota / Credit Exhaustion (HTTP 402) -> 5 minute suspension
        if (statusCode === 402 || lowerError.includes('insufficient credits') || lowerError.includes('never purchased credits')) {
            existing.state = CIRCUIT_STATES.OPEN;
            existing.cooldownMs = 5 * 60 * 1000; // 5 min
            existing.reason = 'Quota/Credit balance exhausted';
        }
        // 2. Auth / Invalid Key (HTTP 401) -> 10 minute suspension
        else if (statusCode === 401 || lowerError.includes('invalid api key') || lowerError.includes('unauthorized')) {
            existing.state = CIRCUIT_STATES.OPEN;
            existing.cooldownMs = 10 * 60 * 1000; // 10 min
            existing.reason = 'Invalid or expired API credentials';
        }
        // 3. Rate Limit (HTTP 429) -> Adaptive cooldown based on Retry-After header or 30s
        else if (statusCode === 429 || lowerError.includes('rate limit') || lowerError.includes('too many requests')) {
            existing.state = CIRCUIT_STATES.OPEN;
            const parsedRetry = Number(retryAfterSeconds);
            existing.cooldownMs = !isNaN(parsedRetry) && parsedRetry > 0 ? (parsedRetry + 1) * 1000 : 35000;
            existing.reason = `Rate limit throttled (${Math.round(existing.cooldownMs / 1000)}s)`;
        }
        // 4. Consecutive Upstream / Timeout Errors (5xx, 408, Abort) -> 60s cooldown after 3 failures
        else if (existing.consecutiveFailures >= 3 || statusCode >= 500) {
            existing.state = CIRCUIT_STATES.OPEN;
            existing.cooldownMs = 60000; // 60s
            existing.reason = `Upstream server errors (${existing.consecutiveFailures} consecutive)`;
        }

        breakerRegistry.set(id, existing);
    }

    /**
     * Manually reset circuit breaker for an API key or provider
     */
    reset(keyId, provider, model) {
        const id = this._getBreakerKey(keyId, provider, model);
        breakerRegistry.delete(id);
    }

    /**
     * Inspect all active breaker statuses for telemetry/UI
     */
    getAllStatuses() {
        const list = [];
        for (const [id, record] of breakerRegistry.entries()) {
            list.push({
                target: id,
                state: record.state,
                failures: record.failures,
                reason: record.reason,
                remainingCooldownSec: Math.max(0, Math.ceil((record.cooldownMs - (Date.now() - record.lastFailureTime)) / 1000))
            });
        }
        return list;
    }
}

export const circuitBreaker = new CircuitBreakerService();
