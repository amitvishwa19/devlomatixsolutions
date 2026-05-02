import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { PROVIDER_PRESETS, getDefaultModel } from "./agent-storage";
import * as math from "mathjs";

function resolveBaseURL(m) {
  const configuredBaseURL = (m.baseURL || m.baseUrl || "").trim();
  if (configuredBaseURL) return configuredBaseURL;

  const providerBaseURL = (PROVIDER_PRESETS[m.provider]?.baseURL || "").trim();
  if (providerBaseURL) return providerBaseURL;

  if (m.apiKey?.startsWith("AIza") || (m.model || m.name || "").startsWith("gemini")) {
    return PROVIDER_PRESETS.Gemini.baseURL;
  }

  return "https://api.openai.com/v1";
}

export function buildModelFrom(m, temperature, streaming = false) {
  return new ChatOpenAI({
    apiKey: m.apiKey || "sk-missing",
    model: m.model || m.name,
    temperature,
    streaming,
    configuration: { baseURL: resolveBaseURL(m), dangerouslyAllowBrowser: true },
  });
}

export async function testModelConnection(m) {
  const baseURL = resolveBaseURL(m).replace(/\/+$/, "");
  const url = `${baseURL}/chat/completions`;
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 8000);
  const t0 = performance.now();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${m.apiKey || "sk-missing"}`,
      },
      body: JSON.stringify({
        model: m.model || m.name,
        temperature: 0,
        max_tokens: 5,
        messages: [{ role: "user", content: "ok" }],
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timeout);
    const latencyMs = Math.round(performance.now() - t0);
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return { ok: false, message: `HTTP ${res.status}: ${txt.slice(0, 120)}`, latencyMs };
    }
    const j = await res.json().catch(() => ({}));
    const content = j?.choices?.[0]?.message?.content ?? "ok";
    return { ok: true, message: String(content).slice(0, 80) || "ok", latencyMs };
  } catch (e) {
    clearTimeout(timeout);
    const latencyMs = Math.round(performance.now() - t0);
    const msg = e.name === "AbortError" ? "timeout after 8s" : e.message;
    return { ok: false, message: msg, latencyMs };
  }
}

const calculatorTool = tool(
  async ({ expression }) => {
    try {
      const v = math.evaluate(expression);
      return String(v);
    } catch (e) {
      return `Error: ${e.message}`;
    }
  },
  {
    name: "calculator",
    description: "Evaluate a complex math expression using mathjs. Input: { expression: string }.",
    schema: z.object({ expression: z.string() }),
  },
);

const webSearchTool = tool(
  async ({ query }, { configurable }) => {
    const tavilyKey = configurable?.tavilyKey;
    if (tavilyKey) {
      try {
        const res = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ api_key: tavilyKey, query, search_depth: "basic", max_results: 5 }),
        });
        const j = await res.json();
        return (j.results || []).map(r => `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`).join("\n\n") || "No results.";
      } catch (e) {
        return `Tavily Search failed: ${e.message}`;
      }
    }

    try {
      const res = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&no_redirect=1`,
      );
      const j = await res.json();
      const parts = [
        j.AbstractText && `Summary: ${j.AbstractText} (${j.AbstractURL})`,
        ...(j.RelatedTopics || []).slice(0, 5).map((t) => t.Text && `- ${t.Text} ${t.FirstURL || ""}`),
      ].filter(Boolean);
      return parts.join("\n") || "No results.";
    } catch {
      return "Search failed (network/CORS).";
    }
  },
  {
    name: "web_search",
    description: "Search the public web for up-to-date info. Input: { query: string }.",
    schema: z.object({ query: z.string() }),
  },
);

function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

export function chunkText(text, size = 800, overlap = 100) {
  const out = [];
  for (let i = 0; i < text.length; i += size - overlap) {
    out.push(text.slice(i, i + size));
  }
  return out;
}

export async function embedTexts(m, texts) {
  const emb = new OpenAIEmbeddings({
    apiKey: m.apiKey,
    model: "text-embedding-3-small",
    configuration: { baseURL: resolveBaseURL(m), dangerouslyAllowBrowser: true },
  });
  return emb.embedDocuments(texts);
}

export async function retrieveContext(
  m,
  docs,
  query,
  k = 4,
) {
  if (docs.length === 0) return "";
  const [qVec] = await embedTexts(m, [query]);
  const scored = docs.flatMap((d) =>
    d.chunks.map((c) => ({ doc: d.name, text: c.text, score: cosineSim(qVec, c.embedding) })),
  );
  scored.sort((a, b) => b.score - a.score);
  return scored
    .slice(0, k)
    .map((s, i) => `[${i + 1}] (${s.doc})\n${s.text}`)
    .join("\n\n");
}

export async function routeInput(
  defaultModel,
  candidates,
  userInput,
) {
  if (candidates.length === 0) {
    return { chosen: defaultModel, rewrittenInput: userInput, reason: "no candidates" };
  }
  if (candidates.length === 1) {
    return { chosen: candidates[0], rewrittenInput: userInput, reason: "only candidate" };
  }

  const list = candidates
    .map(
      (m, i) =>
        `${i + 1}. id="${m.id}" label="${m.label}" provider="${m.provider}" model="${m.model}" strengths="${m.strengths || "general"}"`,
    )
    .join("\n");

  const router = buildModelFrom(defaultModel, 0);
  const sys = new SystemMessage(
    `You are a routing controller. You MUST respond with a single JSON object of the shape:
{"id":"<one of the listed ids>","rewritten":"<prompt rewritten for that model>","reason":"<short>"}
No prose, no code fences. Pick the model whose strengths best match the user's request. Rewrite the prompt so the chosen model produces the best answer (clarify, structure, keep meaning).`,
  );
  const user = new HumanMessage(
    `Available models:\n${list}\n\nUser input:\n"""${userInput}"""\n\nReturn JSON only.`,
  );
  try {
    const res = await router.invoke([sys, user]);
    const raw = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
    const match = raw.match(/\{[\s\S]*\}/);
    const json = JSON.parse(match ? match[0] : raw);
    const chosen = candidates.find((c) => c.id === json.id) ?? candidates[0];
    return {
      chosen,
      rewrittenInput: typeof json.rewritten === "string" && json.rewritten.trim() ? json.rewritten : userInput,
      reason: json.reason || "router pick",
    };
  } catch (e) {
    return { chosen: candidates[0], rewrittenInput: userInput, reason: `router failed: ${e.message}` };
  }
}

export class AgentAbortError extends Error {
  constructor(partial) {
    super("aborted");
    this.name = "AgentAbortError";
    this.partial = partial;
  }
}

export async function runAgent(
  cfg,
  history,
  userInput,
  ragDocs,
  onUpdate,
  signal,
  tavilyKey,
) {
  const checkAbort = (partial = "") => {
    if (signal?.aborted) throw new AgentAbortError(partial);
  };
  checkAbort();
  const tools = [
    ...(cfg.enableCalculator ? [calculatorTool] : []),
    ...(cfg.enableWebSearch ? [webSearchTool] : []),
  ];

  const executorModel = getDefaultModel(cfg);
  if (!executorModel) throw new Error("No models configured. Add one in Setup.");

  let executor = executorModel;
  let prompt = userInput;
  if (cfg.enableRouter && cfg.models.length > 1) {
    onUpdate({ toolNote: `router: selecting best model…` });
    const candidates = cfg.models.filter(m => m.apiKey && m.lastTestOk);
    if (candidates.length > 1) {
      const r = await routeInput(executorModel, candidates, userInput);
      executor = r.chosen;
      prompt = r.rewrittenInput;
      onUpdate({ toolNote: `router → ${executor.label} (${r.reason})` });
    }
  } else {
    onUpdate({ toolNote: `engine: using ${executor.label}` });
  }

  let context = "";
  if (ragDocs.length) {
    try {
      context = await retrieveContext(executor, ragDocs, prompt);
      if (context) onUpdate({ toolNote: `Retrieved ${ragDocs.length} doc(s) for context` });
    } catch (e) {
      onUpdate({ toolNote: `RAG skipped: ${e.message}` });
    }
  }

  const sys = new SystemMessage(
    cfg.systemPrompt + (context ? `\n\n--- DOCUMENT CONTEXT ---\n${context}\n\nIMPORTANT: When using info from the DOCUMENT CONTEXT, you MUST cite the source filename like (Source: filename.pdf).` : ""),
  );
  const msgs = [
    sys,
    ...history.map((m) =>
      m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content),
    ),
    new HumanMessage(prompt),
  ];

  const model = buildModelFrom(executor, cfg.temperature);
  const bound = tools.length ? model.bindTools(tools) : model;

  onUpdate({ toolNote: `engine: invoking ${executor.label}…` });

  for (let step = 0; step < 5; step++) {
    checkAbort();
    let res;
    try {
      res = await bound.invoke(msgs, { signal, configurable: { tavilyKey } });
    } catch (e) {
      // Handle models that don't support tool calling
      if (tools.length && (e.message.includes("tool") || e.message.includes("404") || e.message.includes("endpoint"))) {
        onUpdate({ toolNote: `Tools not supported by ${executor.label}, retrying without tools...` });
        try {
          res = await model.invoke(msgs, signal ? { signal } : undefined);
        } catch (e2) {
          e = e2; // Continue to fallback if even without tools it fails
        }
      }

      if (!res) {
        const others = cfg.models.filter((m) => m.id !== executor.id);
        if (!others.length) throw e;
        onUpdate({ toolNote: `${executor.label} failed; falling back…` });
        for (const fb of others) {
          try {
            const fbModel = buildModelFrom(fb, cfg.temperature);
            const fbBound = tools.length ? fbModel.bindTools(tools) : fbModel;
            try {
              res = await fbBound.invoke(msgs, { configurable: { tavilyKey } });
            } catch (fbErr) {
              if (tools.length && (fbErr.message.includes("tool") || fbErr.message.includes("404"))) {
                res = await fbModel.invoke(msgs);
              } else {
                throw fbErr;
              }
            }
            executor = fb;
            onUpdate({ toolNote: `fallback → ${fb.label}` });
            break;
          } catch {
            // try next
          }
        }
      }
      if (!res) throw e;
    }

    const calls = res.tool_calls || [];

    if (!calls.length) {
      // If we already have content from the first invoke, we can use it as a fallback
      const initialContent = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
      
      // Try to stream for a better UI experience
      const streamModel = buildModelFrom(executor, cfg.temperature, true);
      let acc = "";
      try {
        const stream = await streamModel.stream(msgs, signal ? { signal } : undefined);
        const delay = Math.max(0, Math.min(2000, cfg.streamDelayMs ?? 18));
        for await (const chunk of stream) {
          if (signal?.aborted) throw new AgentAbortError(acc);
          const piece = typeof chunk?.content === "string"
            ? chunk.content
            : Array.isArray(chunk?.content)
              ? chunk.content.map((c) => (typeof c === "string" ? c : c?.text || "")).join("")
              : "";
          if (piece) {
            acc += piece;
            onUpdate({ partial: acc });
            if (delay > 0) await new Promise((r) => setTimeout(r, delay));
          }
        }
      } catch (e) {
        console.error("Streaming error:", e);
        if (e instanceof AgentAbortError) throw e;
      }
      
      const text = acc || initialContent || "_(no response)_";
      onUpdate({ partial: text });
      return text;
    }

    msgs.push(res);
    for (const call of calls) {
      onUpdate({ toolNote: `→ ${call.name}(${JSON.stringify(call.args).slice(0, 80)})` });
      const t = tools.find((tl) => tl.name === call.name);
      const t0 = performance.now();
      const out = t ? await t.invoke(call.args) : `Unknown tool ${call.name}`;
      const durationMs = Math.round(performance.now() - t0);
      const resultStr = String(out);
      onUpdate({ toolCall: { name: call.name, args: call.args, result: resultStr, durationMs } });
      msgs.push(new ToolMessage({ content: resultStr, tool_call_id: call.id }));
    }
  }
  return "Stopped after maximum tool steps.";
}
