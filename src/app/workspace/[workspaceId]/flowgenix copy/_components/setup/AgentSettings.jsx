"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOrCreateAgentConfig, saveAgentConfig } from "../../_actions/setup/actions";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Save, Settings2, Sparkles, Zap } from "lucide-react";
import { useParams } from "next/navigation";

export const AgentSettings = ({ config, onChange, userId }) => {
    const params = useParams();
    const workspaceId = params?.workspaceId;
    const set = (k, v) => onChange({ ...config, [k]: v });

    const handleSave = async () => {
        try {
            await saveAgentConfig(workspaceId, userId, config);
            toast.success("Agent configuration updated successfully");
        } catch (e) {
            toast.error(e.message);
        }
    };

    if (!config) return <div className="text-muted-foreground font-mono text-xs p-4">Loading settings...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-primary" />
                    <div>
                        <h2 className="text-sm font-bold tracking-tight uppercase font-mono">Agent Configuration</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Global behavior & model parameters</p>
                    </div>
                </div>
                <Button size="sm" onClick={handleSave} className="font-mono text-xs h-8 px-4 gap-2">
                    <Save className="h-3.5 w-3.5" /> Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[11px] font-mono uppercase text-muted-foreground">Agent Name</Label>
                        <Input
                            value={config?.name || ""}
                            onChange={(e) => set("name", e.target.value)}
                            placeholder="e.g. Support Assistant"
                            className="font-mono h-9"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[11px] font-mono uppercase text-muted-foreground">System Prompt</Label>
                        <Textarea
                            value={config?.systemPrompt || ""}
                            onChange={(e) => set("systemPrompt", e.target.value)}
                            rows={8}
                            placeholder="Describe how the agent should behave..."
                            className="font-mono text-xs leading-relaxed resize-none"
                        />
                    </div>
                </div>

                <div className="space-y-6 p-4 bg-secondary/20 rounded-xl border border-border">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-[11px] font-mono uppercase text-muted-foreground">Temperature: {config?.temperature?.toFixed(2)}</Label>
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <Slider
                            value={[config?.temperature ?? 0.7]}
                            min={0}
                            max={2}
                            step={0.05}
                            onValueChange={([v]) => set("temperature", v)}
                        />
                        <p className="text-[10px] text-muted-foreground font-mono italic">Lower is more focused, higher is more creative.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-[11px] font-mono uppercase text-muted-foreground">Stream Delay: {config?.streamDelayMs}ms</Label>
                            <Zap className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <Slider
                            value={[config?.streamDelayMs || 18]}
                            min={0}
                            max={200}
                            step={1}
                            onValueChange={([v]) => set("streamDelayMs", v)}
                        />
                    </div>

                    <div className="pt-4 border-t border-border flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={!!config?.enableWebSearch}
                                onCheckedChange={(v) => set("enableWebSearch", v)}
                            />
                            <Label className="text-[11px] font-mono uppercase cursor-pointer">Web Search</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={!!config?.enableCalculator}
                                onCheckedChange={(v) => set("enableCalculator", v)}
                            />
                            <Label className="text-[11px] font-mono uppercase cursor-pointer">Calculator</Label>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-border space-y-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <h3 className="text-xs font-bold uppercase font-mono">Share & API</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label className="text-[10px] font-mono uppercase text-muted-foreground">Public Agent ID</Label>
                                <div className="flex gap-2">
                                    <Input readOnly value={config?.id || ""} className="font-mono text-[10px] h-8 bg-muted" />
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="h-8 text-[10px]" 
                                        onClick={() => {
                                            navigator.clipboard.writeText(config?.id || "");
                                            toast.success("Copied Agent ID");
                                        }}
                                    >
                                        Copy
                                    </Button>
                                </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
                                Use this ID with the public API: <code className="bg-muted px-1">{"/api/flowgenix/chat"}</code>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
