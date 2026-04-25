import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { PROVIDER_PRESETS, getDefaultModel } from "./agent-storage";
import type { AgentConfig, ChatMessage, ModelConfig, RagDoc } from "./agent-storage";

function resolveBaseURL(m: ModelConfig) {
  const configuredBaseURL = m.baseURL.trim();
  if (configuredBaseURL) return configuredBaseURL;

  const providerBaseURL = PROVIDER_PRESETS[m.provider]?.baseURL?.trim();
  if (providerBaseURL) return providerBaseURL;

  if (m.apiKey.startsWith("AIza") || m.model.startsWith("gemini")) {
    return PROVIDER_PRESETS.Gemini.baseURL;
  }

  return "https://api.openai.com/v1";
}

export function buildModelFrom(m: ModelConfig, temperature: number, streaming = false) {
  return new ChatOpenAI({
    apiKey: m.apiKey || "sk-missing",
    model: m.model,
    temperature,
    streaming,
    configuration: { baseURL: resolveBaseURL(m), dangerouslyAllowBrowser: true },
  });
}

export async function testModelConnection(m: ModelConfig): Promise<{ ok: boolean; message: string; latencyMs?: number }> {
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
        model: m.model,
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
    const msg = (e as Error).name === "AbortError" ? "timeout after 8s" : (e as Error).message;
    return { ok: false, message: msg, latencyMs };
  }
}

const calculatorTool = tool(
  async ({ expression }: { expression: string }) => {
    if (!/^[-+/*().\d\s,e]+$/i.test(expression)) return "Invalid expression.";
    try {
      const v = Function(`"use strict"; return (${expression});`)();
      return String(v);
    } catch (e) {
      return `Error: ${(e as Error).message}`;
    }
  },
  {
    name: "calculator",
    description: "Evaluate a basic math expression. Input: { expression: string }.",
    schema: z.object({ expression: z.string() }),
  },
);

const webSearchTool = tool(
  async ({ query }: { query: string }) => {
    try {
      const res = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&no_redirect=1`,
      );
      const j = await res.json();
      const parts = [
        j.AbstractText && `Summary: ${j.AbstractText} (${j.AbstractURL})`,
        ...(j.RelatedTopics || []).slice(0, 5).map((t: any) => t.Text && `- ${t.Text} ${t.FirstURL || ""}`),
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

function cosineSim(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

export function chunkText(text: string, size = 800, overlap = 100): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += size - overlap) {
    out.push(text.slice(i, i + size));
  }
  return out;
}

export async function embedTexts(m: ModelConfig, texts: string[]): Promise<number[][]> {
  const emb = new OpenAIEmbeddings({
    apiKey: m.apiKey,
    model: "text-embedding-3-small",
    configuration: { baseURL: resolveBaseURL(m), dangerouslyAllowBrowser: true },
  });
  return emb.embedDocuments(texts);
}

export async function retrieveContext(
  m: ModelConfig,
  docs: RagDoc[],
  query: string,
  k = 4,
): Promise<string> {
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

/**
 * Smart router: ask the default model to pick the best model from `candidates`
 * for the given user input, and return a possibly-rewritten prompt tuned for it.
 */
export async function routeInput(
  defaultModel: ModelConfig,
  candidates: ModelConfig[],
  userInput: string,
): Promise<{ chosen: ModelConfig; rewrittenInput: string; reason: string }> {
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
    const res: any = await router.invoke([sys, user]);
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
    return { chosen: candidates[0], rewrittenInput: userInput, reason: `router failed: ${(e as Error).message}` };
  }
}

export class AgentAbortError extends Error {
  constructor(public partial: string) {
    super("aborted");
    this.name = "AgentAbortError";
  }
}

export async function runAgent(
  cfg: AgentConfig,
  history: ChatMessage[],
  userInput: string,
  ragDocs: RagDoc[],
  onUpdate: (delta: { partial?: string; toolNote?: string; toolCall?: import("./agent-storage").ToolCallTrace }) => void,
  signal?: AbortSignal,
): Promise<string> {
  const checkAbort = (partial = "") => {
    if (signal?.aborted) throw new AgentAbortError(partial);
  };
  checkAbort();
  const tools = [
    ...(cfg.enableCalculator ? [calculatorTool] : []),
    ...(cfg.enableWebSearch ? [webSearchTool] : []),
  ];

  const defaultModel = getDefaultModel(cfg);
  if (!defaultModel) throw new Error("No models configured. Add one in Setup.");

  let executor = defaultModel;
  let prompt = userInput;
  if (cfg.enableRouter && cfg.models.length > 1) {
    const fallbacks = cfg.models.filter((m) => m.id !== defaultModel.id);
    onUpdate({ toolNote: `router: analyzing with ${defaultModel.label}…` });
    const r = await routeInput(defaultModel, [defaultModel, ...fallbacks], userInput);
    executor = r.chosen;
    prompt = r.rewrittenInput;
    onUpdate({ toolNote: `router → ${r.chosen.label} (${r.reason})` });
  }

  let context = "";
  if (ragDocs.length) {
    try {
      context = await retrieveContext(executor, ragDocs, prompt);
      if (context) onUpdate({ toolNote: `Retrieved ${ragDocs.length} doc(s) for context` });
    } catch (e) {
      onUpdate({ toolNote: `RAG skipped: ${(e as Error).message}` });
    }
  }

  const sys = new SystemMessage(
    cfg.systemPrompt + (context ? `\n\n--- DOCUMENT CONTEXT ---\n${context}` : ""),
  );
  const msgs: any[] = [
    sys,
    ...history.map((m) =>
      m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content),
    ),
    new HumanMessage(prompt),
  ];

  const model = buildModelFrom(executor, cfg.temperature);
  const bound = tools.length ? model.bindTools(tools) : model;

  for (let step = 0; step < 5; step++) {
    checkAbort();
    let res: any;
    try {
      // First do a non-streaming invoke so we reliably see tool_calls.
      res = await bound.invoke(msgs, signal ? { signal } : undefined);
    } catch (e) {
      const others = cfg.models.filter((m) => m.id !== executor.id);
      if (!others.length) throw e;
      onUpdate({ toolNote: `${executor.label} failed; falling back…` });
      for (const fb of others) {
        try {
          const fbModel = buildModelFrom(fb, cfg.temperature);
          const fbBound = tools.length ? fbModel.bindTools(tools) : fbModel;
          res = await fbBound.invoke(msgs);
          executor = fb;
          onUpdate({ toolNote: `fallback → ${fb.label}` });
          break;
        } catch {
          // try next
        }
      }
      if (!res) throw e;
    }

    const calls = res.tool_calls || [];

    if (!calls.length) {
      // Final turn — re-stream it so the user sees tokens flowing.
      const streamModel = buildModelFrom(executor, cfg.temperature, true);
      let acc = "";
      try {
        const stream: any = await streamModel.stream(msgs, signal ? { signal } : undefined);
        const delay = Math.max(0, Math.min(2000, cfg.streamDelayMs ?? 18));
        for await (const chunk of stream) {
          if (signal?.aborted) throw new AgentAbortError(acc);
          const piece = typeof chunk?.content === "string"
            ? chunk.content
            : Array.isArray(chunk?.content)
              ? chunk.content.map((c: any) => (typeof c === "string" ? c : c?.text || "")).join("")
              : "";
          if (piece) {
            acc += piece;
            onUpdate({ partial: acc });
            if (delay > 0) await new Promise((r) => setTimeout(r, delay));
          }
        }
      } catch (e) {
        if (e instanceof AgentAbortError) throw e;
        // streaming failed — fall back to the already-resolved non-streamed result
      }
      const text = acc || (typeof res.content === "string" ? res.content : JSON.stringify(res.content));
      onUpdate({ partial: text });
      return text;
    }

    msgs.push(res);
    for (const call of calls) {
      onUpdate({ toolNote: `→ ${call.name}(${JSON.stringify(call.args).slice(0, 80)})` });
      const t: any = tools.find((tl) => tl.name === call.name);
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
