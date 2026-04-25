// Shared Meta Graph API client — browser equivalent of the edge function's `graph` helper.
// Mirrors supabase/functions/wa-cloud-api/index.ts behavior so module functions return
// identical payloads and throw identical error messages.

export const GRAPH = "https://graph.facebook.com/v22.0";

export function required(value, name) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${name} is required`);
  return value.trim();
}

export function phoneNum(value) {
  const v = required(value, "Recipient phone").replace(/[\s().-]/g, "");
  if (!/^\+?[1-9][0-9]{7,15}$/.test(v)) throw new Error("Invalid phone number");
  return v;
}

export function tokenPreview(token) {
  return token.length > 12 ? `${token.slice(0, 6)}••••${token.slice(-4)}` : "••••";
}

export async function graph(path, token, init = {}) {
  const response = await fetch(`${GRAPH}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Meta API failed [${response.status}]: ${JSON.stringify(data)}`);
  return data;
}

// Smart retry: only retry network errors and 5xx responses.
export async function withRetry(exec, opts = {}) {
  const max = opts.maxAttempts ?? 3;
  const attempts = [];
  let lastError = null;
  for (let i = 1; i <= max; i++) {
    const start = Date.now();
    try {
      const r = await exec();
      const latency = Date.now() - start;
      if (r.ok) {
        const log = { attempt_number: i, status: "success", http_status: r.status, latency_ms: latency, error_message: null, response_payload: r.data };
        attempts.push(log);
        opts.onAttempt?.(log);
        return { result: r.data, attempts };
      }
      const errMsg = `Meta API failed [${r.status}]: ${JSON.stringify(r.data)}`;
      const log = { attempt_number: i, status: "failed", http_status: r.status, latency_ms: latency, error_message: errMsg, response_payload: r.data };
      attempts.push(log);
      opts.onAttempt?.(log);
      if (r.status < 500) {
        const e = new Error(errMsg);
        e.attempts = attempts;
        throw e;
      }
      lastError = new Error(errMsg);
    } catch (e) {
      if (e?.attempts) throw e;
      const latency = Date.now() - start;
      const msg = e instanceof Error ? e.message : String(e);
      if (!attempts.length || attempts[attempts.length - 1].attempt_number !== i) {
        const log = { attempt_number: i, status: "failed", http_status: null, latency_ms: latency, error_message: msg, response_payload: {} };
        attempts.push(log);
        opts.onAttempt?.(log);
      }
      lastError = e instanceof Error ? e : new Error(msg);
      if (msg.includes("Meta API failed [4")) {
        lastError.attempts = attempts;
        throw lastError;
      }
    }
    if (i < max) {
      const backoff = Math.pow(2, i - 1) * 1000;
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  const finalErr = lastError || new Error("Operation failed after retries");
  finalErr.attempts = attempts;
  throw finalErr;
}