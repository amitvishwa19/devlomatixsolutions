import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AgentConfig,
  ModelConfig,
  PROVIDER_PRESETS,
  newModel,
  upsertModel,
  deleteModel,
  saveModelTestResult,
  setDefaultModelId,
} from "@/flowgenix/lib/agent-storage";
import { testModelConnection } from "@/flowgenix/lib/agent-runtime";
import { inferCapabilities, type Capability } from "@/flowgenix/lib/model-capabilities";
import { toast } from "sonner";
import { Brain, Code2, Eye as EyeIcon, Globe, Infinity as InfinityIcon, CheckCircle2, ChevronDown, ChevronRight, Download, Eye, EyeOff, GripVertical, Loader2, Plug, Plus, Star, Timer, Trash2, XCircle } from "lucide-react";
import { FreeModelsDialog } from "@/flowgenix/components/FreeModelsDialog";

const CAP_META: Record<Capability, { icon: typeof Brain; label: string }> = {
  thinking: { icon: Brain, label: "thinking" },
  coding: { icon: Code2, label: "coding" },
  vision: { icon: EyeIcon, label: "vision" },
  search: { icon: Globe, label: "search" },
  "long-ctx": { icon: InfinityIcon, label: "long-context" },
};

interface Props {
  config: AgentConfig;
  onChange: (c: AgentConfig) => void;
}

export const ModelsManager = ({ config, onChange }: Props) => {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, { ok: boolean; message: string; latencyMs?: number }>>(() =>
    Object.fromEntries(
      config.models
        .filter((m) => m.lastTestOk !== null && m.lastTestOk !== undefined)
        .map((m) => [
          m.id,
          {
            ok: !!m.lastTestOk,
            message: m.lastTestMessage ?? (m.lastTestOk ? "ok" : "failed"),
            latencyMs: m.lastLatencyMs ?? undefined,
          },
        ]),
    ),
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [freeOpen, setFreeOpen] = useState(false);
  const [testingAll, setTestingAll] = useState(false);

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    if (targetId === config.defaultModelId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    const models = [...config.models];
    const from = models.findIndex((m) => m.id === dragId);
    const to = models.findIndex((m) => m.id === targetId);
    if (from === -1 || to === -1) return;
    const [moved] = models.splice(from, 1);
    models.splice(to, 0, moved);
    onChange({ ...config, models });
    setDragId(null);
    setDragOverId(null);
  };

  const updateModelLocal = (id: string, patch: Partial<ModelConfig>) => {
    const models = config.models.map((m) => (m.id === id ? { ...m, ...patch } : m));
    onChange({ ...config, models });
  };

  const persistModel = async (id: string, patch: Partial<ModelConfig>) => {
    const current = config.models.find((m) => m.id === id);
    if (!current) return;
    const merged = { ...current, ...patch };
    updateModelLocal(id, patch);
    setSavingId(id);
    try {
      await upsertModel(merged);
    } catch (e) {
      toast.error(`Save failed: ${(e as Error).message}`);
    } finally {
      setSavingId(null);
    }
  };

  const onProvider = (id: string, p: string) => {
    const preset = PROVIDER_PRESETS[p];
    persistModel(id, {
      provider: p,
      baseURL: preset?.baseURL ?? "",
      model: preset?.model ?? "",
    });
  };

  const addModel = async () => {
    const m = newModel({ label: `model-${config.models.length + 1}` });
    try {
      const saved = await upsertModel(m);
      const next: AgentConfig = {
        ...config,
        models: [...config.models, saved],
        defaultModelId: config.defaultModelId ?? saved.id,
      };
      if (!config.defaultModelId) await setDefaultModelId(saved.id);
      onChange(next);
      setExpanded((s) => ({ ...s, [saved.id]: true }));
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const removeModel = async (id: string) => {
    try {
      await deleteModel(id);
      const models = config.models.filter((m) => m.id !== id);
      let defaultModelId = config.defaultModelId;
      if (defaultModelId === id) {
        defaultModelId = models[0]?.id ?? null;
        await setDefaultModelId(defaultModelId);
      }
      onChange({ ...config, models, defaultModelId });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const setDefault = async (id: string) => {
    try {
      await setDefaultModelId(id);
      onChange({ ...config, defaultModelId: id });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const test = async (m: ModelConfig) => {
    if (!m.apiKey) {
      toast.error("Add an API key first");
      return;
    }
    setTesting((s) => ({ ...s, [m.id]: true }));
    const r = await testModelConnection(m);
    setResults((s) => ({ ...s, [m.id]: r }));
    setTesting((s) => ({ ...s, [m.id]: false }));
    const caps = inferCapabilities(m);
    try {
      await saveModelTestResult(m.id, r.ok, r.message, r.latencyMs, caps);
      const models = config.models.map((x) =>
        x.id === m.id
          ? {
              ...x,
              lastTestOk: r.ok,
              lastTestAt: new Date().toISOString(),
              lastTestMessage: r.message,
              lastLatencyMs: r.latencyMs ?? null,
              capabilities: caps,
            }
          : x,
      );
      onChange({ ...config, models });
    } catch (e) {
      console.error("Failed to persist test result", e);
    }
    r.ok ? toast.success(`${m.label}: connected`) : toast.error(`${m.label}: ${r.message.slice(0, 80)}`);
  };

  const testAll = async () => {
    const targets = config.models.filter((m) => m.apiKey);
    if (targets.length === 0) {
      toast.error("No models with API keys to test");
      return;
    }
    setTestingAll(true);
    setTesting((s) => ({ ...s, ...Object.fromEntries(targets.map((m) => [m.id, true])) }));
    const outcomes = await Promise.all(
      targets.map(async (m) => {
        const r = await testModelConnection(m);
        const caps = inferCapabilities(m);
        setResults((s) => ({ ...s, [m.id]: r }));
        setTesting((s) => ({ ...s, [m.id]: false }));
        try {
          await saveModelTestResult(m.id, r.ok, r.message, r.latencyMs, caps);
        } catch (e) {
          console.error("persist test result failed", e);
        }
        return { m, r, caps };
      }),
    );
    const models = config.models.map((x) => {
      const hit = outcomes.find((o) => o.m.id === x.id);
      if (!hit) return x;
      return {
        ...x,
        lastTestOk: hit.r.ok,
        lastTestAt: new Date().toISOString(),
        lastTestMessage: hit.r.message,
        lastLatencyMs: hit.r.latencyMs ?? null,
        capabilities: hit.caps,
      };
    });
    onChange({ ...config, models });
    setTestingAll(false);
    const okCount = outcomes.filter((o) => o.r.ok).length;
    const failCount = outcomes.length - okCount;
    if (failCount === 0) toast.success(`All ${okCount} model${okCount === 1 ? "" : "s"} connected`);
    else toast.error(`${okCount} ok · ${failCount} failed`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-xs text-muted-foreground">
          {config.models.length} model{config.models.length === 1 ? "" : "s"} · default routes inputs to fallbacks
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={testAll}
            disabled={testingAll || config.models.length === 0}
            className="font-mono"
            title="Test connection for all models"
          >
            {testingAll ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plug className="mr-1 h-3.5 w-3.5" />
            )}
            test_all
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setFreeOpen(true)}
            className="font-mono"
            title="Browse free OpenRouter models"
          >
            <Download className="mr-1 h-3.5 w-3.5" />
            browse_openrouter_free
          </Button>
          <Button size="sm" variant="outline" onClick={addModel} className="font-mono">
            <Plus className="mr-1 h-3.5 w-3.5" /> add_model
          </Button>
        </div>
      </div>

      {config.models.length === 0 && (
        <div className="rounded-md border border-dashed border-border bg-secondary/20 p-6 text-center">
          <p className="font-mono text-xs text-muted-foreground">// no models yet — click add_model</p>
        </div>
      )}

      <div className="space-y-3">
        {[...config.models]
          .sort((a, b) => {
            if (a.id === config.defaultModelId) return -1;
            if (b.id === config.defaultModelId) return 1;
            return 0;
          })
          .map((m) => {
          const isDefault = config.defaultModelId === m.id;
          const result = results[m.id];
          const isOpen = expanded[m.id] ?? false;
          return (
            <div
              key={m.id}
              draggable={!isDefault}
              onDragStart={(e) => {
                if (isDefault) return;
                setDragId(m.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                if (isDefault || !dragId || dragId === m.id) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dragOverId !== m.id) setDragOverId(m.id);
              }}
              onDragLeave={() => {
                if (dragOverId === m.id) setDragOverId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(m.id);
              }}
              onDragEnd={() => {
                setDragId(null);
                setDragOverId(null);
              }}
              className={`rounded-md border bg-secondary/30 transition-all ${
                isDefault ? "border-primary/60" : "border-border"
              } ${dragId === m.id ? "opacity-50" : ""} ${
                dragOverId === m.id && dragId !== m.id ? "border-primary ring-1 ring-primary" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2 p-3">
                {!isDefault ? (
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0 cursor-grab active:cursor-grabbing" />
                ) : (
                  <span className="w-3.5 shrink-0" />
                )}
                <button
                  type="button"
                  onClick={() => setExpanded((s) => ({ ...s, [m.id]: !isOpen }))}
                  className="flex items-center gap-2 min-w-0 flex-1 text-left"
                >
                  {isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span className="font-mono text-xs truncate">{m.label}</span>
                  <span className="font-mono text-[10px] text-muted-foreground truncate">
                    · {m.provider} · {m.model || "no-model"}
                  </span>
                  {inferCapabilities(m).map((cap) => {
                    const { icon: Icon, label } = CAP_META[cap];
                    return (
                      <Badge
                        key={cap}
                        variant="outline"
                        className="font-mono text-[10px] gap-1 border-border bg-secondary/50 text-muted-foreground shrink-0"
                        title={label}
                      >
                        <Icon className="h-3 w-3" /> {label}
                      </Badge>
                    );
                  })}
                  {result?.latencyMs !== undefined && (
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] gap-1 border-border bg-secondary/50 text-muted-foreground shrink-0"
                      title="last test response time"
                    >
                      <Timer className="h-3 w-3" /> {result.latencyMs}ms
                    </Badge>
                  )}
                  {isDefault && (
                    <Badge className="font-mono text-[10px] gap-1 bg-primary text-primary-foreground border-transparent hover:bg-primary">
                      <Star className="h-3 w-3" /> default
                    </Badge>
                  )}
                  {result?.ok && (
                    <Badge className="font-mono text-[10px] gap-1 bg-primary text-primary-foreground border-transparent hover:bg-primary">
                      <CheckCircle2 className="h-3 w-3" /> ok
                    </Badge>
                  )}
                  {result && !result.ok && (
                    <Badge variant="destructive" className="font-mono text-[10px] gap-1">
                      <XCircle className="h-3 w-3" /> failed
                    </Badge>
                  )}
                  {savingId === m.id && (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  )}
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  {!isDefault && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDefault(m.id)}
                      className="h-7 font-mono text-[11px]"
                      title="Set as default"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeModel(m.id)}
                    className="h-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {isOpen && (
                <div className="space-y-3 border-t border-border px-3 pb-3 pt-3">
                  <div>
                    <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      label
                    </Label>
                    <Input
                      value={m.label}
                      onChange={(e) => updateModelLocal(m.id, { label: e.target.value })}
                      onBlur={(e) => persistModel(m.id, { label: e.target.value })}
                      className="mt-1 h-8 font-mono text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        provider
                      </Label>
                      <Select value={m.provider} onValueChange={(v) => onProvider(m.id, v)}>
                        <SelectTrigger className="mt-1 h-8 font-mono text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(PROVIDER_PRESETS).map((p) => (
                            <SelectItem key={p} value={p} className="font-mono text-xs">
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        model
                      </Label>
                      <Input
                        value={m.model}
                        onChange={(e) => updateModelLocal(m.id, { model: e.target.value })}
                        onBlur={(e) => persistModel(m.id, { model: e.target.value })}
                        placeholder="gpt-4o-mini"
                        className="mt-1 h-8 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      base_url
                    </Label>
                    <Input
                      value={m.baseURL}
                      onChange={(e) => updateModelLocal(m.id, { baseURL: e.target.value })}
                      onBlur={(e) => persistModel(m.id, { baseURL: e.target.value })}
                      placeholder="https://api.openai.com/v1"
                      className="mt-1 h-8 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      api_key
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        type={showKeys[m.id] ? "text" : "password"}
                        value={m.apiKey}
                        onChange={(e) => updateModelLocal(m.id, { apiKey: e.target.value })}
                        onBlur={(e) => persistModel(m.id, { apiKey: e.target.value })}
                        placeholder="sk-..."
                        className="h-8 font-mono pr-9 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys((s) => ({ ...s, [m.id]: !s[m.id] }))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showKeys[m.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      strengths (router hint)
                    </Label>
                    <Input
                      value={m.strengths || ""}
                      onChange={(e) => updateModelLocal(m.id, { strengths: e.target.value })}
                      onBlur={(e) => persistModel(m.id, { strengths: e.target.value })}
                      placeholder="e.g. code, math, long-context, vision"
                      className="mt-1 h-8 font-mono text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => test(m)}
                      disabled={testing[m.id]}
                      className="font-mono text-[11px] h-7"
                    >
                      {testing[m.id] ? (
                        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Plug className="mr-1 h-3.5 w-3.5" />
                      )}
                      test_connection
                    </Button>
                    {result && (
                      <div
                        className={`flex items-center gap-1 font-mono text-[11px] truncate ${
                          result.ok ? "text-primary" : "text-destructive"
                        }`}
                        title={result.message}
                      >
                        {result.ok ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="truncate max-w-[180px]">{result.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <FreeModelsDialog open={freeOpen} onOpenChange={setFreeOpen} config={config} onChange={onChange} />
    </div>
  );
};
