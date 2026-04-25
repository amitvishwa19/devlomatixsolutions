import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Save, Play, KeyRound } from "lucide-react";
import { toast } from "sonner";
import {
  applyCredential,
  hasSecretFields,
  listCredentials,
  saveCredentialPreset,
} from "../../_lib/node-credentials";
import { testNode } from "../../_lib/node-test";

export const NodeCredentialsSection = ({ kind, config, onApplyConfig }) => {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(
    typeof config.__credentialId === "string" ? config.__credentialId : "",
  );
  const [saveOpen, setSaveOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [saving, setSaving] = useState(false);

  const [testOpen, setTestOpen] = useState(false);
  const [sampleInput, setSampleInput] = useState('"hello"');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (!kind) return;
    let cancelled = false;
    setLoading(true);
    listCredentials(kind)
      .then((rows) => {
        if (!cancelled) setPresets(rows);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  const usePreset = async (id) => {
    setSelectedId(id);
    if (!id) return;
    const cred = presets.find((p) => p.id === id);
    if (!cred) return;
    try {
      const merged = await applyCredential(cred);
      onApplyConfig({ ...merged, __credentialId: cred.id });
      toast.success(`Loaded "${cred.name}"`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load preset");
    }
  };

  const savePreset = async () => {
    if (!kind) return;
    if (!presetName.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const row = await saveCredentialPreset({
        kind,
        name: presetName.trim(),
        config,
      });
      setPresets((prev) => [row, ...prev]);
      setSelectedId(row.id);
      onApplyConfig({ ...config, __credentialId: row.id });
      toast.success("Preset saved");
      setSaveOpen(false);
      setPresetName("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      let parsed = sampleInput;
      try {
        parsed = JSON.parse(sampleInput);
      } catch {
        /* keep as string */
      }
      const r = await testNode(kind, config, parsed);
      setTestResult(r);
    } catch (e) {
      setTestResult({
        ok: false,
        mode: "dryrun",
        message: e instanceof Error ? e.message : String(e),
        durationMs: 0,
      });
    } finally {
      setTesting(false);
    }
  };

  const showCredentials = hasSecretFields(kind) || presets.length > 0;

  return (
    <div className="space-y-2 rounded-md border border-border bg-secondary/20 p-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 font-mono text-xs">
          <KeyRound className="h-3.5 w-3.5" /> Credentials & test
        </Label>
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 px-2 font-mono text-[10px]"
          onClick={() => {
            setTestOpen(true);
            setTestResult(null);
          }}
        >
          <Play className="h-3 w-3" /> Test
        </Button>
      </div>

      {showCredentials && (
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Select value={selectedId || "__none__"} onValueChange={(v) => usePreset(v === "__none__" ? "" : v)}>
              <SelectTrigger className="h-8 font-mono text-[11px]">
                <SelectValue placeholder={loading ? "loading…" : "Use saved preset…"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__" className="font-mono text-[11px]">
                  // none
                </SelectItem>
                {presets.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="font-mono text-[11px]">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 px-2 font-mono text-[10px]"
              onClick={() => {
                setPresetName("");
                setSaveOpen(true);
              }}
            >
              <Save className="h-3 w-3" /> Save as preset
            </Button>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground">
            // Reusable presets are stored in the Credentials page. Sensitive fields (API keys, webhook URLs, tokens) are kept in a separate secrets table.
          </p>
        </div>
      )}

      {/* Save preset dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm">Save preset</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="font-mono text-xs">Preset name</Label>
            <Input
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="e.g. Prod Slack alerts"
              className="h-9 font-mono text-xs"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSaveOpen(false)} className="font-mono text-xs">
              Cancel
            </Button>
            <Button onClick={savePreset} disabled={saving} className="gap-1.5 font-mono text-xs">
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test dialog */}
      <Dialog open={testOpen} onOpenChange={setTestOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm">Test node</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="font-mono text-xs">Sample input (JSON)</Label>
            <Textarea
              value={sampleInput}
              onChange={(e) => setSampleInput(e.target.value)}
              rows={3}
              className="font-mono text-xs"
              placeholder='"hello" or {"foo":"bar"}'
            />
            <Button
              onClick={runTest}
              disabled={testing}
              className="w-full gap-1.5 font-mono text-xs"
            >
              {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
              Run test
            </Button>
            {testResult && (
              <div
                className={`rounded border p-2 ${
                  testResult.ok
                    ? "border-[hsl(142_76%_36%)]/40 bg-[hsl(142_76%_36%)]/10"
                    : "border-destructive/40 bg-destructive/10"
                }`}
              >
                <p className="font-mono text-[11px]">
                  <span className={testResult.ok ? "text-[hsl(142_76%_36%)]" : "text-destructive"}>
                    {testResult.ok ? "✓" : "✗"}
                  </span>{" "}
                  {testResult.mode} · {testResult.durationMs}ms
                </p>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">{testResult.message}</p>
                {testResult.detail !== undefined && (
                  <pre className="mt-2 max-h-40 overflow-auto rounded border border-border bg-background p-2 font-mono text-[10px]">
                    {(() => {
                      try {
                        return JSON.stringify(testResult.detail, null, 2);
                      } catch {
                        return String(testResult.detail);
                      }
                    })()}
                  </pre>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
