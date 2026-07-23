import {
  appendRunLog,
  createRun,
  finishRun,
} from "./workflow-storage";
import { loadConfig, getDefaultModel, loadRag } from "./agent-storage";
import { runAgent } from "./agent-runtime";
import { supabase } from "@/lib/supabase";
import { resolveConfigSecrets } from "./node-credentials";

/**
 * Execute a single node body that depends only on (kind, config, incoming).
 * Used by the workflow runtime AND by the per-node Test panel for dry-runs.
 * Does NOT cover trigger/agent/if/repeat — those depend on graph context.
 */
export async function runNodeBodyStandalone(
  kind,
  rawCfg,
  incoming,
) {
  const cfg = await resolveConfigSecrets(rawCfg);
  if (kind === "util.http") {
    const url = String(cfg.url ?? "");
    if (!url) throw new Error("HTTP node: URL is required");
    const method = String(cfg.method ?? "GET").toUpperCase();
    let headers = {};
    try { headers = cfg.headers ? JSON.parse(String(cfg.headers)) : {}; } catch { /* ignore */ }
    const body = method === "GET" || method === "HEAD" ? undefined : String(cfg.body ?? "");
    const resp = await fetch(url, { method, headers, body });
    const text = await resp.text();
    let parsed = text;
    try { parsed = JSON.parse(text); } catch { /* keep text */ }
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${text.slice(0, 200)}`);
    return parsed;
  }
  if (kind === "util.delay") {
    const ms = Math.max(0, Math.min(60_000, Number(cfg.ms ?? 1000)));
    await new Promise((r) => setTimeout(r, ms));
    return incoming;
  }
  if (kind === "util.slack") {
    const url = String(cfg.webhookUrl ?? "");
    if (!url) throw new Error("Slack node: webhook URL required");
    const text = String(cfg.text ?? (typeof incoming === "string" ? incoming : JSON.stringify(incoming ?? "")));
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const respText = await resp.text();
    if (!resp.ok) throw new Error(`Slack ${resp.status}: ${respText.slice(0, 200)}`);
    return { ok: true, text };
  }
  if (kind === "util.email") {
    const to = String(cfg.to ?? "");
    const subject = String(cfg.subject ?? "");
    const html = String(cfg.html ?? (typeof incoming === "string" ? incoming : JSON.stringify(incoming ?? "")));
    if (!to || !subject) throw new Error("Email node: 'to' and 'subject' required");
    const { data: r, error } = await supabase.functions.invoke("flowgenix-send-email", {
      body: { to, subject, html, from: cfg.from ?? null },
    });
    if (error) throw new Error(error.message ?? "Email send failed");
    if (r?.error) throw new Error(r.error);
    return r;
  }
  if (kind === "util.db") {
    const table = String(cfg.table ?? "");
    if (!table) throw new Error("DB node: table required");
    const limit = Math.max(1, Math.min(1000, Number(cfg.limit ?? 50)));
    const orderBy = String(cfg.orderBy ?? "");
    const ascending = Boolean(cfg.ascending ?? false);
    const filterCol = String(cfg.filterCol ?? "");
    const filterOp = String(cfg.filterOp ?? "eq");
    const filterVal = cfg.filterVal == null ? "" : String(cfg.filterVal);
    
    let q = supabase.from(table).select("*").limit(limit);
    if (filterCol && filterVal !== "") {
      const ops = ["eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike"];
      if (!ops.includes(filterOp)) throw new Error(`DB node: invalid op ${filterOp}`);
      q = q[filterOp](filterCol, filterVal);
    }
    if (orderBy) q = q.order(orderBy, { ascending });
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows;
  }
  if (kind === "util.supabase") {
    const table = String(cfg.table ?? "");
    if (!table) throw new Error("Supabase node: table required");
    const operation = String(cfg.operation ?? "select").toLowerCase();
    const limit = Math.max(1, Math.min(1000, Number(cfg.limit ?? 50)));
    const filterCol = String(cfg.filterCol ?? "");
    const filterOp = String(cfg.filterOp ?? "eq");
    const filterVal = cfg.filterVal == null ? "" : String(cfg.filterVal);
    const ops = ["eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike"];
    let payload = undefined;
    const rawPayload = String(cfg.payload ?? "").trim();
    if (rawPayload) {
      try { payload = JSON.parse(rawPayload); }
      catch { throw new Error("Supabase node: payload must be valid JSON"); }
    } else if (incoming && typeof incoming === "object") {
      payload = incoming;
    }
    
    const tbl = supabase.from(table);
    if (operation === "insert") {
      if (!payload) throw new Error("Supabase insert: payload (JSON) or upstream object required");
      const { data: rows, error } = await tbl.insert(payload).select();
      if (error) throw new Error(error.message);
      return rows;
    }
    if (operation === "update") {
      if (!payload) throw new Error("Supabase update: payload (JSON) or upstream object required");
      if (!filterCol || filterVal === "") throw new Error("Supabase update: filter column + value required (safety)");
      if (!ops.includes(filterOp)) throw new Error(`Supabase node: invalid op ${filterOp}`);
      
      const { data: rows, error } = await tbl.update(payload)[filterOp](filterCol, filterVal).select();
      if (error) throw new Error(error.message);
      return rows;
    }
    if (operation === "delete") {
      if (!filterCol || filterVal === "") throw new Error("Supabase delete: filter column + value required (safety)");
      if (!ops.includes(filterOp)) throw new Error(`Supabase node: invalid op ${filterOp}`);
      
      const { data: rows, error } = await tbl.delete()[filterOp](filterCol, filterVal).select();
      if (error) throw new Error(error.message);
      return rows;
    }
    // select
    let q = tbl.select(String(cfg.columns ?? "*")).limit(limit);
    if (filterCol && filterVal !== "") {
      if (!ops.includes(filterOp)) throw new Error(`Supabase node: invalid op ${filterOp}`);
      q = q[filterOp](filterCol, filterVal);
    }
    const orderBy = String(cfg.orderBy ?? "");
    if (orderBy) q = q.order(orderBy, { ascending: Boolean(cfg.ascending ?? false) });
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows;
  }
  // unknown / no-op
  return incoming;
}


async function callLovableAIChat(prompt) {
  const { data, error } = await supabase.functions.invoke("flowgenix-chat", {
    body: { prompt },
  });
  if (error) throw new Error(error.message ?? "Lovable AI call failed");
  if (data?.error) throw new Error(data.error);
  return data?.reply ?? "";
}

function nextFrom(edges, nodeId, handle) {
  return edges
    .filter((e) => e.source === nodeId && (handle == null || (e.sourceHandle ?? null) === handle))
    .map((e) => e.target);
}

function entryPoints(nodes) {
  return nodes.filter((n) => n.type === "trigger");
}

function evalCondition(expr, input) {
  try {
    const fn = new Function("input", `"use strict"; return (${expr || "false"});`);
    return Boolean(fn(input));
  } catch {
    return false;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function postFailureNotification(url, payload) {
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `❌ Workflow *${payload.workflow}* failed\n\`\`\`${payload.error}\`\`\`\nrun: ${payload.runId}`,
        ...payload,
      }),
    });
  } catch {
    /* swallow — notification best-effort */
  }
}

export async function executeWorkflow(opts) {
  const run = await createRun(opts.workflowId, opts.trigger ?? "manual", opts.input);
  const log = (msg, status = "info") => opts.onLog?.(msg, status);
  const setStatus = (id, s) => opts.onNodeStatus?.(id, s);

  const nodeById = new Map(opts.nodes.map((n) => [n.id, n]));
  const main = opts.nodes.filter((n) => n.type !== "tool" && n.type !== "addFirst");
  const mainIds = new Set(main.map((n) => n.id));

  let lastOutput = opts.input?.prompt ?? opts.input ?? null;

  async function runNodeBody(node, incoming) {
    const data = node.data || {};
    const cfg = (data.config ?? {});
    let output = incoming;
    let branchHandle = null;

    if (node.type === "trigger") {
      const isChat = data.kind === "trigger.chat";
      const hasAgentDownstream = nextFrom(opts.edges, node.id).some((id) => nodeById.get(id)?.type === "agent");
      if (isChat && !hasAgentDownstream && opts.input?.prompt) {
        output = await callLovableAIChat(String(opts.input.prompt));
      } else {
        output = incoming;
      }
    } else if (node.type === "agent") {
      const agentCfg = await loadConfig();
      const model = getDefaultModel(agentCfg);
      if (!model || !model.apiKey) throw new Error("AI Agent skipped: no default model with API key configured.");
      const docs = await loadRag();
      const prompt = String(incoming ?? "Hello");
      let reply = "";
      reply = await runAgent(agentCfg, [], prompt, docs, (u) => {
        if (u.partial) reply = u.partial;
      });
      output = reply;
    } else if (data.kind === "util.if") {
      const expr = String(cfg.expression ?? "false");
      const result = evalCondition(expr, incoming);
      branchHandle = result ? "true" : "false";
      output = incoming;
    } else {
      output = await runNodeBodyStandalone(data.kind, cfg, incoming);
    }

    return { output, branchHandle };
  }

  async function runNode(nodeId, incoming, depth = 0) {
    if (depth > 50) throw new Error("Workflow too deep (>50 levels)");
    const node = nodeById.get(nodeId);
    if (!node || !mainIds.has(nodeId)) return incoming;
    const data = node.data || {};
    const cfg = (data.config ?? {});
    const start = performance.now();
    const baseEntry = {
      run_id: run.id,
      node_id: node.id,
      node_label: data.label ?? node.type ?? null,
      node_kind: data.kind ?? null,
    };

    setStatus(node.id, "running");

    if (data.kind === "util.repeat") {
      const times = Math.max(1, Math.min(100, Number(cfg.times ?? 1)));
      const downstream = nextFrom(opts.edges, node.id, null).filter((id) => {
        const edge = opts.edges.find((e) => e.source === node.id && e.target === id);
        return (edge?.sourceHandle ?? null) !== "error";
      });
      let iterOut = incoming;
      try {
        for (let i = 0; i < times; i++) {
          for (const child of downstream) iterOut = await runNode(child, iterOut, depth + 1);
        }
        await appendRunLog({ ...baseEntry, status: "success", message: `Repeated ${times}× downstream subgraph`, data: { times }, duration_ms: Math.round(performance.now() - start) });
        log(`✓ ${data.label} (${times}×)`, "success");
        setStatus(node.id, "success");
        lastOutput = iterOut;
        return iterOut;
      } catch (err) {
        return await handleNodeError(node, err, start, baseEntry, incoming, depth);
      }
    }

    const retryCount = Math.max(0, Math.min(5, Number(data.retry?.count ?? 0)));
    const retryDelay = Math.max(0, Math.min(30_000, Number(data.retry?.delayMs ?? 500)));

    let attempt = 0;
    let lastErr;
    while (attempt <= retryCount) {
      try {
        const { output, branchHandle } = await runNodeBody(node, incoming);
        await appendRunLog({
          ...baseEntry,
          status: "success",
          message: attempt > 0 ? `Succeeded on attempt ${attempt + 1}` : `Executed ${data.label}`,
          data: {
            attempt: attempt + 1,
            branch: branchHandle,
            input: typeof incoming === "string" ? incoming.slice(0, 2000) : incoming,
            output: typeof output === "string" ? output.slice(0, 2000) : output,
          },
          duration_ms: Math.round(performance.now() - start),
        });
        log(`✓ ${data.label}${attempt ? ` (retry ${attempt})` : ""}`, "success");
        setStatus(node.id, "success");
        lastOutput = output;

        const downstream = nextFrom(opts.edges, node.id, branchHandle).filter((id) => {
          const edge = opts.edges.find((e) => e.source === node.id && e.target === id);
          if (branchHandle == null) return (edge?.sourceHandle ?? null) !== "error";
          return true;
        });
        let last = output;
        for (const child of downstream) last = await runNode(child, output, depth + 1);
        return last;
      } catch (err) {
        lastErr = err;
        attempt++;
        if (attempt > retryCount) break;
        await appendRunLog({
          ...baseEntry,
          status: "info",
          message: `Attempt ${attempt} failed, retrying in ${retryDelay}ms: ${err instanceof Error ? err.message : String(err)}`,
          duration_ms: Math.round(performance.now() - start),
        });
        log(`↻ ${data.label} retry ${attempt}/${retryCount}`, "info");
        if (retryDelay > 0) await sleep(retryDelay);
      }
    }

    return await handleNodeError(node, lastErr, start, baseEntry, incoming, depth);
  }

  async function handleNodeError(
    node,
    err,
    start,
    baseEntry,
    incoming,
    depth,
  ) {
    const errMsg = err instanceof Error ? err.message : String(err);
    setStatus(node.id, "error");
    await appendRunLog({
      ...baseEntry,
      status: "error",
      message: errMsg,
      duration_ms: Math.round(performance.now() - start),
    });
    log(`✗ ${node.data?.label}: ${errMsg}`, "error");

    const errorTargets = nextFrom(opts.edges, node.id, "error");
    if (errorTargets.length > 0) {
      log(`→ routing to error branch (${errorTargets.length})`, "info");
      const errPayload = { error: errMsg, input: incoming, node: node.data?.label };
      let last = errPayload;
      for (const child of errorTargets) last = await runNode(child, errPayload, depth + 1);
      return last;
    }

    throw err;
  }

  try {
    const triggers = entryPoints(opts.nodes);
    if (triggers.length === 0) {
      await appendRunLog({ run_id: run.id, node_id: "_", message: "No trigger node.", status: "info" });
      log("No trigger node.", "info");
      await finishRun(run.id, "success", null);
      return { ...run, status: "success", finished_at: new Date().toISOString() };
    }
    for (const t of triggers) await runNode(t.id, lastOutput);
    await finishRun(run.id, "success", lastOutput);
    return { ...run, status: "success", finished_at: new Date().toISOString(), output: lastOutput };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await finishRun(run.id, "error", null, msg);
    if (opts.failureWebhook) {
      void postFailureNotification(opts.failureWebhook, {
        workflow: opts.workflowName ?? opts.workflowId,
        error: msg,
        runId: run.id,
      });
    }
    return { ...run, status: "error", finished_at: new Date().toISOString(), error: msg };
  }
}
