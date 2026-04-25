import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Download, Search, Plug, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  AgentConfig,
  ModelConfig,
  PROVIDER_PRESETS,
  newModel,
  upsertModel,
  setDefaultModelId,
} from "@/flowgenix/lib/agent-storage";
import { testModelConnection } from "@/flowgenix/lib/agent-runtime";

interface FreeModel {
  id: string;
  name?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  config: AgentConfig;
  onChange: (c: AgentConfig) => void;
}

export const FreeModelsDialog = ({ open, onOpenChange, config, onChange }: Props) => {
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [models, setModels] = useState<FreeModel[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; message: string }>>({});
  const [testingAll, setTestingAll] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const existingKey = useMemo(
    () => config.models.find((m) => m.provider === "OpenRouter" && m.apiKey)?.apiKey ?? "",
    [config.models],
  );
  const sharedKey = apiKey.trim() || existingKey;

  const testOne = async (modelId: string) => {
    if (!sharedKey) {
      toast.error("Enter an OpenRouter API key first");
      return;
    }
    setTesting((s) => ({ ...s, [modelId]: true }));
    const r = await testModelConnection({
      id: "tmp",
      label: modelId,
      provider: "OpenRouter",
      baseURL: PROVIDER_PRESETS.OpenRouter.baseURL,
      model: modelId,
      apiKey: sharedKey,
      strengths: "",
    } as ModelConfig);
    setTestResults((s) => ({ ...s, [modelId]: r }));
    setTesting((s) => ({ ...s, [modelId]: false }));
    if (r.ok) {
      setSelected((s) => ({ ...s, [modelId]: true }));
    }
  };

  const testBatch = async () => {
    if (!sharedKey) {
      toast.error("Enter an OpenRouter API key first");
      return;
    }
    const selectedList = filtered.filter((m) => selected[m.id] && !existingIds.has(m.id));
    const targets = selectedList.length > 0 ? selectedList : filtered.filter((m) => !existingIds.has(m.id));
    if (targets.length === 0) {
      toast.error("Nothing to test");
      return;
    }
    setTestingAll(true);
    setTesting((s) => ({ ...s, ...Object.fromEntries(targets.map((m) => [m.id, true])) }));
    let okCount = 0;
    await Promise.all(
      targets.map(async (f) => {
        const r = await testModelConnection({
          id: "tmp",
          label: f.id,
          provider: "OpenRouter",
          baseURL: PROVIDER_PRESETS.OpenRouter.baseURL,
          model: f.id,
          apiKey: sharedKey,
          strengths: "",
        } as ModelConfig);
        setTestResults((s) => ({ ...s, [f.id]: r }));
        setTesting((s) => ({ ...s, [f.id]: false }));
        if (r.ok) okCount++;
      }),
    );
    setTestingAll(false);
    const failCount = targets.length - okCount;
    if (failCount === 0) toast.success(`All ${okCount} model${okCount === 1 ? "" : "s"} connected`);
    else toast.error(`${okCount} ok · ${failCount} failed`);
  };

  const existingIds = useMemo(
    () => new Set(config.models.filter((m) => m.provider === "OpenRouter").map((m) => m.model)),
    [config.models],
  );

  useEffect(() => {
    if (!open) return;
    setSelected({});
    setQuery("");
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("https://openrouter.ai/api/v1/models");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const all = (json?.data ?? []) as Array<{
          id: string;
          name?: string;
          pricing?: { prompt?: string; completion?: string };
        }>;
        const free = all
          .filter((m) => {
            const p = parseFloat(m.pricing?.prompt ?? "0");
            const c = parseFloat(m.pricing?.completion ?? "0");
            return m.id.endsWith(":free") || (p === 0 && c === 0);
          })
          .map((m) => ({ id: m.id, name: m.name }))
          .sort((a, b) => a.id.localeCompare(b.id));
        setModels(free);
      } catch (e) {
        toast.error(`Fetch failed: ${(e as Error).message}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return models;
    return models.filter((m) => m.id.toLowerCase().includes(q) || (m.name ?? "").toLowerCase().includes(q));
  }, [models, query]);

  const selectedIds = Object.keys(selected).filter((id) => selected[id]);
  const toggleAll = (val: boolean) => {
    const next: Record<string, boolean> = {};
    filtered.forEach((m) => {
      if (!existingIds.has(m.id)) next[m.id] = val;
    });
    setSelected(next);
  };

  const addSelected = async () => {
    const toAdd = models.filter((m) => selected[m.id] && !existingIds.has(m.id));
    if (toAdd.length === 0) {
      toast.error("Select at least one model");
      return;
    }
    if (!sharedKey) {
      toast.error("Enter an OpenRouter API key first");
      return;
    }
    setAdding(true);
    const created: ModelConfig[] = [];
    for (const f of toAdd) {
      const m = newModel({
        label: (f.name?.slice(0, 60) || f.id),
        provider: "OpenRouter",
        baseURL: PROVIDER_PRESETS.OpenRouter.baseURL,
        model: f.id,
        apiKey: sharedKey,
      });
      try {
        const saved = await upsertModel(m);
        created.push(saved);
      } catch (e) {
        console.error("Failed to add model", f.id, e);
      }
    }
    const next: AgentConfig = {
      ...config,
      models: [...config.models, ...created],
      defaultModelId: config.defaultModelId ?? created[0]?.id ?? null,
    };
    if (!config.defaultModelId && created[0]) await setDefaultModelId(created[0].id);
    onChange(next);
    setAdding(false);
    toast.success(`Added ${created.length} model${created.length === 1 ? "" : "s"}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm">openrouter_free_models</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Select models to add to your list.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={existingKey ? "openrouter api key (using saved key)" : "openrouter api key (sk-or-...)"}
            className="h-8 font-mono text-xs"
          />
          <p className="font-mono text-[10px] text-muted-foreground">
            {existingKey && !apiKey
              ? "// using existing OpenRouter key from your models"
              : "// key is used for testing and saved with each added model"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search..."
              className="h-8 pl-7 font-mono text-xs"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={testBatch}
            disabled={testingAll || filtered.length === 0}
            className="font-mono text-[11px] h-8"
            title="Test selected (or all visible if none selected)"
          >
            {testingAll ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plug className="mr-1 h-3.5 w-3.5" />
            )}
            test_all
          </Button>
          <Button size="sm" variant="outline" onClick={() => toggleAll(true)} className="font-mono text-[11px] h-8">
            select_all
          </Button>
          <Button size="sm" variant="ghost" onClick={() => toggleAll(false)} className="font-mono text-[11px] h-8">
            clear
          </Button>
        </div>

        <ScrollArea className="h-[400px] rounded-md border border-border">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="font-mono text-xs text-muted-foreground">// no models</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((m) => {
                const exists = existingIds.has(m.id);
                const checked = !!selected[m.id];
                const result = testResults[m.id];
                const isTesting = !!testing[m.id];
                return (
                  <div
                    key={m.id}
                    className={`flex items-center gap-3 px-3 py-2 ${
                      exists ? "opacity-50" : "hover:bg-secondary/40"
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={exists}
                      onCheckedChange={(v) => setSelected((s) => ({ ...s, [m.id]: !!v }))}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-xs truncate">{m.name || m.id}</div>
                      <div className="font-mono text-[10px] text-muted-foreground truncate">{m.id}</div>
                    </div>
                    {result?.ok && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                    {result && !result.ok && (
                      <XCircle
                        className="h-3.5 w-3.5 text-destructive shrink-0"
                        aria-label={result.message}
                      />
                    )}
                    {exists ? (
                      <span className="font-mono text-[10px] text-muted-foreground shrink-0">added</span>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => testOne(m.id)}
                        disabled={isTesting}
                        className="h-7 font-mono text-[10px] shrink-0"
                        title={result?.message || "test connection"}
                      >
                        {isTesting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Plug className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <p className="font-mono text-[11px] text-muted-foreground mr-auto self-center">
            {selectedIds.length} selected · {filtered.length} shown · {models.length} total
          </p>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="font-mono text-xs">
            cancel
          </Button>
          <Button onClick={addSelected} disabled={adding || selectedIds.length === 0} className="font-mono text-xs">
            {adding ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="mr-1 h-3.5 w-3.5" />
            )}
            add_selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
