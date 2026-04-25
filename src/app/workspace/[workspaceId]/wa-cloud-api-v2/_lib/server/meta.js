export const GRAPH_VERSION = "v22.0";
export const GRAPH_BASE = "https://graph.facebook.com";

export function required(value, name) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${name} is required`);
  return value.trim();
}

export function phoneNum(value) {
  const v = required(value, "Recipient phone").replace(/[\s().-]/g, "");
  if (!/^\+?[1-9][0-9]{7,15}$/.test(v)) throw new Error("Invalid phone number");
  return v;
}

export async function graph(path, token, init = {}) {
  const version = init.version || GRAPH_VERSION;
  const url = path.startsWith("http") ? path : `${GRAPH_BASE}/${version}${path}`;
  
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    throw new Error(`Meta API failed [${response.status}]: ${data?.error?.message || JSON.stringify(data)}`);
  }
  
  return data;
}

export async function withRetry(exec, opts = {}) {
  const max = opts.maxAttempts ?? 3;
  const attempts = [];
  let lastError = null;

  for (let i = 1; i <= max; i++) {
    const start = Date.now();
    try {
      const data = await exec();
      const latency = Date.now() - start;
      const log = { attempt_number: i, status: "success", latency_ms: latency, error_message: null, response_payload: data };
      attempts.push(log);
      return { result: data, attempts };
    } catch (e) {
      const latency = Date.now() - start;
      const msg = e instanceof Error ? e.message : String(e);
      const log = { attempt_number: i, status: "failed", latency_ms: latency, error_message: msg, response_payload: {} };
      attempts.push(log);
      lastError = e instanceof Error ? e : new Error(msg);
      
      // If it's a 4xx error (client error), don't retry unless specified
      if (msg.includes("[4") && !opts.retryClientErrors) {
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
