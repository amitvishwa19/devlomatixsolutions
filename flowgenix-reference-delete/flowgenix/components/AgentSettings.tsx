import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { AgentConfig, saveAgentMeta } from "@/flowgenix/lib/agent-storage";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface Props {
  config: AgentConfig;
  onChange: (c: AgentConfig) => void;
}

export const AgentSettings = ({ config, onChange }: Props) => {
  const set = <K extends keyof AgentConfig>(k: K, v: AgentConfig[K]) =>
    onChange({ ...config, [k]: v });

  const handleSave = async () => {
    try {
      await saveAgentMeta(config);
      toast.success("Agent configuration saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          agent.name
        </Label>
        <Input
          value={config.name}
          onChange={(e) => set("name", e.target.value)}
          className="mt-1 font-mono"
        />
      </div>

      <div>
        <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          system_prompt
        </Label>
        <Textarea
          value={config.systemPrompt}
          onChange={(e) => set("systemPrompt", e.target.value)}
          rows={5}
          className="mt-1 font-mono text-xs"
        />
      </div>

      <div>
        <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          temperature: {config.temperature.toFixed(2)}
        </Label>
        <Slider
          value={[config.temperature]}
          min={0}
          max={1}
          step={0.05}
          onValueChange={(v) => set("temperature", v[0])}
          className="mt-3"
        />
      </div>

      <div>
        <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          stream_delay: {config.streamDelayMs}ms / chunk
          <span className="ml-2 normal-case tracking-normal text-muted-foreground/70">
            ({config.streamDelayMs === 0 ? "instant" : config.streamDelayMs <= 25 ? "fast" : config.streamDelayMs <= 75 ? "smooth" : config.streamDelayMs <= 200 ? "slow" : "very slow"})
          </span>
        </Label>
        <Slider
          value={[config.streamDelayMs]}
          min={0}
          max={500}
          step={5}
          onValueChange={(v) => set("streamDelayMs", v[0])}
          className="mt-3"
        />
      </div>

      <div className="space-y-3 rounded-md border border-border bg-secondary/40 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-sm">smart_router</p>
            <p className="text-xs text-muted-foreground">
              Default model studies input & picks best fallback
            </p>
            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
              ⚠ adds latency (extra LLM call); auto-skipped when only 1 model
            </p>
          </div>
          <Switch
            checked={config.enableRouter}
            onCheckedChange={(v) => set("enableRouter", v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-sm">calculator</p>
            <p className="text-xs text-muted-foreground">Math expression evaluator</p>
          </div>
          <Switch
            checked={config.enableCalculator}
            onCheckedChange={(v) => set("enableCalculator", v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-sm">web_search</p>
            <p className="text-xs text-muted-foreground">DuckDuckGo instant answers</p>
          </div>
          <Switch
            checked={config.enableWebSearch}
            onCheckedChange={(v) => set("enableWebSearch", v)}
          />
        </div>
      </div>

      <Button onClick={handleSave} className="w-full font-mono" variant="default">
        <Save className="mr-2 h-4 w-4" /> save_config
      </Button>
    </div>
  );
};
