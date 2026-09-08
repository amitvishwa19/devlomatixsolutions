import { db } from "@/lib/db";
import { runAgent, buildModelFrom } from "./agent-runtime";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { recordTelemetry } from "./telemetry-store";
import { estimateTokens } from "./compression-engine";

// Ensure Node.js prefers IPv4 / tolerates dev TLS (mirrors combo-router)
try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
} catch {}

const DEFAULT_ORCHESTRATOR_PROMPT =
  "You are the Master Orchestrator. Analyze the request, route it to the most suitable specialist sub-agent(s), and synthesize their output into one coherent final answer.";

const DEFAULT_SUBAGENT_PROMPT =
  "You are a specialist AI agent. Answer the user's request clearly, accurately, and completely.";

function modelStatesOf(row) {
    const md = row?.metadata && typeof row.metadata === "object" ? row.metadata : {};
    return md.modelStates && typeof md.modelStates === "object" ? md.modelStates : {};
}

function expandProvider(row) {
    if (!row || !row.apiKey) return [];
    const states = modelStatesOf(row);
    const imported = (row.metadata && Array.isArray(row.metadata.importedModels) ? row.metadata.importedModels : [])
        .filter(Boolean);
    const names = imported.length > 0 ? imported : [row.name].filter(Boolean);
    return names
        .filter(n => states[n] !== false)
        .map(name => ({
            id: `${row.id}:${name}`,
            label: row.label || name,
            provider: row.provider || "openai",
            model: name,
            apiKey: row.apiKey,
            baseUrl: row.baseUrl || null,
            baseURL: row.baseUrl || null,
            strengths: row.strengths || "",
            lastTestOk: true
        }));
}

function buildAgentConfig(agent, workspaceModels) {
    const assigned = Array.isArray(agent.models) ? agent.models.map(a => a?.model).filter(Boolean) : [];
    let models = assigned.length > 0
        ? assigned.flatMap(expandProvider)
        : (Array.isArray(workspaceModels) ? workspaceModels : []);

    const seen = new Set();
    const dedup = [];
    for (const m of models) {
        if (seen.has(m.id)) continue;
        seen.add(m.id);
        dedup.push(m);
    }

    const cfg = agent.config && typeof agent.config === "object" ? agent.config : {};
    const tools = Array.isArray(cfg.tools) ? cfg.tools : [];

    return {
        name: agent.name,
        systemPrompt: (cfg.systemPrompt || "").trim() || DEFAULT_SUBAGENT_PROMPT,
        temperature: typeof cfg.temperature === "number" ? cfg.temperature : 0.3,
        enableWebSearch: tools.includes("web_search") || tools.some(t => String(t).includes("search")),
        enableCalculator: tools.includes("calculator"),
        enableRouter: dedup.length > 1,
        models: dedup,
        defaultModelId: dedup[0]?.id ?? null,
        streamDelayMs: typeof cfg.streamDelayMs === "number" ? cfg.streamDelayMs : 18
    };
}

function normalizeMessages(messages) {
    const cleaned = (Array.isArray(messages) ? messages : [])
        .map(m => {
            const content = Array.isArray(m?.content)
                ? m.content
                      .map(p => (typeof p === "string" ? p : p?.text || ""))
                      .filter(Boolean)
                      .join(" ")
                : typeof m?.content === "string"
                  ? m.content
                  : String(m?.content || "");
            return { role: String(m?.role || "user"), content };
        })
        .filter(m => m.content.trim().length > 0);

    if (cleaned.length === 0) {
        return { history: [], userMessage: "Hello" };
    }

    const last = cleaned[cleaned.length - 1];
    const history = cleaned.slice(0, -1).map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content
    }));

    return { history, userMessage: last.content };
}

function scorePick(candidates, userText) {
    const tokens = userText.toLowerCase().match(/[a-z0-9]{2,}/g) || [];
    let best = candidates[0];
    let bestScore = -1;
    for (const c of candidates) {
        const hay = `${c.name} ${c.role || ""} ${c.description || ""}`.toLowerCase();
        const score = tokens.reduce((acc, t) => (hay.includes(t) ? acc + 1 : acc), 0);
        if (score > bestScore) {
            bestScore = score;
            best = c;
        }
    }
    return [best || candidates[0]];
}

async function pickSubagents(subagents, masterModels, userText) {
    const candidates = subagents.filter(s => s.status !== "offline");
    if (candidates.length === 0) return [];
    if (candidates.length === 1) return [candidates[0]];

    const executor = masterModels.find(m => m.apiKey);
    if (!executor) return scorePick(candidates, userText);

    const list = candidates
        .map((s, i) => `${i + 1}. name="${s.name}" role="${s.role || "specialist"}" description="${s.description || ""}"`)
        .join("\n");

    const router = buildModelFrom(executor, 0);
    const sys = {
        role: "system",
        content:
            "You are a routing controller for an agent swarm. Respond ONLY with a JSON object of the shape " +
            '{"ids":["<matching sub-agent name(s)>"],"reason":"<short>"}. ' +
            "Pick the 1-3 sub-agents whose role/description best match the user request. If none match well, return an empty ids array. No prose, no code fences."
    };
    const user = { role: "user", content: `Available sub-agents:\n${list}\n\nUser request:\n"""${userText}"""` };

    try {
        const res = await router.invoke([
            new SystemMessage(sys.content),
            new HumanMessage(user.content)
        ]);
        const raw = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
        const match = raw.match(/\{[\s\S]*\}/);
        const json = JSON.parse(match ? match[0] : raw);
        const wanted = Array.isArray(json.ids) ? json.ids : json.id ? [json.id] : [];
        const picked = wanted
            .map(n => String(n).trim())
            .flatMap(n => {
                const exact = candidates.find(c => c.name.toLowerCase() === n.toLowerCase());
                if (exact) return [exact];
                return candidates.filter(c => c.name.toLowerCase().includes(n.toLowerCase()));
            });
        return picked.length > 0 ? [...new Map(picked.map(p => [p.id, p])).values()] : scorePick(candidates, userText);
    } catch {
        return scorePick(candidates, userText);
    }
}

async function runSubagent(cfg, history, userMessage) {
    let text = "";
    const onUpdate = (u) => {
        if (u?.partial) text = u.partial;
    };
    const result = await runAgent(cfg, history, userMessage, [], onUpdate, undefined);
    return result || text;
}

async function synthesize(masterCfg, history, userMessage, subOutputs) {
    const blocks = subOutputs
        .map(o => `[${o.label}]\n${o.text}`)
        .join("\n\n");

    const prompt = blocks
        ? `Original user request:\n"""${userMessage}"""\n\nSub-agent outputs:\n${blocks}\n\nSynthesize a single coherent final answer from these outputs. Keep useful detail, resolve contradictions, and never mention the sub-agents unless helpful.`
        : userMessage;

    if (!masterCfg.models.some(m => m.apiKey)) return blocks;

    let text = "";
    try {
        text = await runAgent(
            { ...masterCfg, systemPrompt: masterCfg.systemPrompt || DEFAULT_ORCHESTRATOR_PROMPT },
            history,
            prompt,
            [],
            (u) => {
                if (u?.partial) text = u.partial;
            },
            undefined
        );
    } catch (e) {
        console.error("Synthesis failed, returning raw sub-agent output:", e.message);
        return blocks || `(no response)`;
    }
    return text;
}

function splitContent(text, size = 8) {
    if (!text) return [""];
    const out = [];
    for (let i = 0; i < text.length; i += size) out.push(text.slice(i, i + size));
    return out;
}

function buildAgentResponse(text, resolvedModel, stream) {
    const id = `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const created = Math.floor(Date.now() / 1000);
    const content = text || "(no response)";

    if (stream) {
        const encoder = new TextEncoder();
        const chunks = splitContent(content);
        const body = new ReadableStream({
            async start(controller) {
                for (const piece of chunks) {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ id, object: "chat.completion.chunk", created, model: resolvedModel, choices: [{ index: 0, delta: { content: piece }, finish_reason: null }] })}\n\n`)
                    );
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ id, object: "chat.completion.chunk", created, model: resolvedModel, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] })}\n\n`));
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
            }
        });

        return new Response(body, {
            status: 200,
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive"
            }
        });
    }

    const payload = {
        id,
        object: "chat.completion",
        created,
        model: resolvedModel,
        choices: [
            {
                index: 0,
                message: { role: "assistant", content },
                finish_reason: "stop"
            }
        ],
        usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0
        }
    };

    return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}

/**
 * Resolve an "agent/<name>" target to its master agent + sub-agents
 * Supports: exact name, "main"/"orchestrator" shorthand, keyword fallback.
 */
async function resolveAgentTarget(workspaceId, modelName) {
    const agents = await db.aIAgent.findMany({
        where: { workspaceId },
        include: {
            models: {
                include: { model: true },
                orderBy: { priority: "asc" }
            },
            subAgents: true,
            parent: true
        }
    });

    if (!agents || agents.length === 0) return null;

    const name = (modelName || "").trim();
    const normalized = name.toLowerCase();

    let target = null;

    if (!name || normalized === "main" || normalized === "orchestrator" || normalized === "master") {
        target = agents.find(a => a.isMain) || agents.find(a => !a.parentId && a.subAgents.length > 0);
    } else {
        target = agents.find(a => a.name.toLowerCase() === normalized);
        if (!target) target = agents.find(a => a.name.toLowerCase().includes(normalized));
    }

    if (!target) {
        const scored = agents
            .map(a => ({
                agent: a,
                score: `${a.name} ${a.role || ""} ${a.description || ""}`.toLowerCase().includes(normalized) ? 1 : 0
            }))
            .sort((a, b) => b.score - a.score);
        if (scored[0]?.score > 0) target = scored[0].agent;
    }

    if (!target) return null;

    const master = target.parentId ? target.parent || target : target;
    const subagents = agents.filter(a => a.parentId === master.id);
    // Seed/legacy setups don't link sub-agents via parentId; treat other non-main
    // agents as swarm workers so orchestration works out of the box.
    const resolvedSubagents =
        subagents.length > 0
            ? subagents
            : agents.filter(a => a.id !== master.id && !a.parentId && !a.isMain && a.status !== "offline");
    const forceSolo = target.parentId ? target : null;

    return { master, subagents: resolvedSubagents, forceSolo, all: agents };
}

/**
 * Execute a request through the master orchestrator agent (delegates to sub-agents).
 * Mirrors the return contract of executeGatewayRequest:
 *   { success, response, resolvedProvider, resolvedModel, latencyMs } | { success:false, status, error, details }
 */
export async function runAgentOrchestrator({ workspaceId, model, messages, stream = false }) {
    const startTime = Date.now();
    const resolved = await resolveAgentTarget(workspaceId, (model || "").replace(/^agent\//i, ""));

    if (!resolved) {
        return {
            success: false,
            status: 400,
            error: `No agent named '${model}'. Use an agent name like 'agent/OmniRoute Orchestrator' or 'agent/main'.`,
            details: "agent_not_found"
        };
    }

    const { master, subagents, forceSolo, all } = resolved;

    // Pool of runnable models: prefer providers assigned to agents, else all workspace providers.
    // Provider rows are expanded into one entry per imported model (modelStates honored).
    let workspacePool = all.flatMap(a => (Array.isArray(a.models) ? a.models.map(x => x.model).filter(Boolean) : []));
    if (workspacePool.length === 0) {
        workspacePool = await db.agentModel.findMany({ where: { workspaceId } });
    }
    const workspaceModels = workspacePool
        .flatMap(expandProvider)
        .filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i);

    const masterCfg = buildAgentConfig(master, workspaceModels);
    const hasOwnPrompt = master.config && typeof master.config === "object" && String(master.config.systemPrompt || "").trim();
    if (!hasOwnPrompt) masterCfg.systemPrompt = DEFAULT_ORCHESTRATOR_PROMPT;
    const masterModel = masterCfg.models.find(m => m.apiKey) || null;

    if (!masterModel && subagents.length === 0) {
        return {
            success: false,
            status: 502,
            error: `Agent '${master.name}' has no active LLM model connected. Add a provider API key in the Providers tab first.`,
            details: "no_master_model"
        };
    }

    const { history, userMessage } = normalizeMessages(messages);
    const inputTokens = estimateTokens(JSON.stringify(messages || []));
    const resolvedModel = `agent/${master.name}`;

    let selectedSubagents = forceSolo ? [forceSolo] : await pickSubagents(subagents, masterCfg.models, userMessage);

    const subOutputs = [];
    let failed = [];

    const executeOne = async (sub) => {
        const cfg = buildAgentConfig(sub, workspaceModels);
        try {
            const text = await runSubagent(cfg, history, userMessage);
            subOutputs.push({ label: sub.name, text });
        } catch (e) {
            failed.push(sub.name);
            console.error(`Sub-agent '${sub.name}' failed:`, e.message);
        }
    };

    const strategy = String(master.strategy || "SEQUENTIAL").toUpperCase();

    if (selectedSubagents.length > 1 && strategy === "PARALLEL") {
        await Promise.all(selectedSubagents.map(executeOne));
    } else if (selectedSubagents.length > 0) {
        for (const sub of selectedSubagents) {
            await executeOne(sub);
            const last = subOutputs[subOutputs.length - 1];
            if (last) history.push({ role: "assistant", content: last.text });
        }
    }

    let finalText;
    if (subOutputs.length > 1) {
        finalText = await synthesize(masterCfg, history, userMessage, subOutputs);
    } else if (subOutputs.length === 1) {
        finalText = subOutputs[0].text;
    } else {
        finalText = await synthesize(masterCfg, history, userMessage, []);
        if (!finalText && masterModel) {
            finalText = await runSubagent(masterCfg, history, userMessage)
                .catch(() => "");
        }
    }

    const latencyMs = Date.now() - startTime;
    const finalResponse = String(finalText || "").trim();

    recordTelemetry({
        workspaceId,
        requestModel: model,
        resolvedProvider: "AGENT",
        resolvedModel: master.name,
        tokensIn: inputTokens,
        tokensOut: estimateTokens(finalResponse),
        compressionSavings: "0%",
        latencyMs,
        status: finalResponse ? 200 : 502,
        error: failed.length ? `sub_agent_failed:${failed.join(",")}` : null
    });

    if (!finalResponse) {
        return {
            success: false,
            status: 502,
            error: "The orchestrator could not produce a response. Reason: " +
                (failed.length
                    ? `sub-agent failure(s): ${failed.join(", ")}. Check the Providers tab for a valid API key and that the configured model ids exist.`
                    : "no sub-agent produced output and no model could be reached. Add a valid provider API key in the Providers tab."),
            details: {
                subAgents: subOutputs.map(o => o.label),
                failed,
                strategy,
                modelsAvailable: masterCfg.models.length
            }
        };
    }

    return {
        success: true,
        response: buildAgentResponse(finalResponse, resolvedModel, Boolean(stream)),
        resolvedProvider: "AGENT",
        resolvedModel: master.name,
        latencyMs,
        details: {
            subAgents: subOutputs.map(o => o.label),
            failed,
            strategy
        }
    };
}