'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Copy,
    Check,
    Code2,
    ShieldAlert,
    ShieldCheck,
    RefreshCw,
    Sliders,
    Key,
    Plus,
    Trash2,
    Zap,
    ExternalLink,
    Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { getCircuitBreakerStatusesAction, resetCircuitBreakerAction, getCacheStatsAction, clearCacheAction } from '../../_action/telemetry-actions';
import { getGatewayKeysAction, createGatewayKeyAction, revokeGatewayKeyAction } from '../../_action/gateway-key-actions';

export function IntegrationsTab({ workspaceId }) {
    const [origin, setOrigin] = useState('http://localhost:3000');
    const [copiedSnippet, setCopiedSnippet] = useState(null);
    const [selectedTargetModel, setSelectedTargetModel] = useState('auto/coding');

    // Circuit Breaker state
    const [circuitStatuses, setCircuitStatuses] = useState([]);
    const [loadingBreaker, setLoadingBreaker] = useState(false);

    // Cache stats state
    const [cacheStats, setCacheStats] = useState({ hits: 0, misses: 0, hitRatio: '0%', savedTokens: 0, cachedEntries: 0 });

    // Gateway Keys state
    const [apiKeys, setApiKeys] = useState([]);
    const [loadingKeys, setLoadingKeys] = useState(false);
    const [isCreatingKey, setIsCreatingKey] = useState(false);
    const [newKeyLabel, setNewKeyLabel] = useState('');
    const [newKeyScope, setNewKeyScope] = useState('all');
    const [newlyCreatedSecret, setNewlyCreatedSecret] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
        loadAllData();
    }, [workspaceId]);

    const loadAllData = () => {
        loadCircuitStatuses();
        loadCacheStats();
        loadApiKeys();
    };

    const loadCircuitStatuses = async () => {
        setLoadingBreaker(true);
        try {
            const res = await getCircuitBreakerStatusesAction();
            if (res.success) {
                setCircuitStatuses(res.statuses || []);
            }
        } catch (e) {
            console.error("Failed to load circuit statuses:", e);
        } finally {
            setLoadingBreaker(false);
        }
    };

    const loadCacheStats = async () => {
        try {
            const res = await getCacheStatsAction();
            if (res.success && res.stats) {
                setCacheStats(res.stats);
            }
        } catch (e) {
            console.error("Failed to load cache stats:", e);
        }
    };

    const loadApiKeys = async () => {
        if (!workspaceId) return;
        setLoadingKeys(true);
        try {
            const res = await getGatewayKeysAction(workspaceId);
            if (res.success) {
                setApiKeys(res.keys || []);
            }
        } catch (e) {
            console.error("Failed to load API keys:", e);
        } finally {
            setLoadingKeys(false);
        }
    };

    const handleCreateKey = async (e) => {
        e.preventDefault();
        if (!newKeyLabel.trim()) return toast.error("Please enter a key name / label.");

        try {
            const res = await createGatewayKeyAction({
                workspaceId,
                label: newKeyLabel.trim(),
                modelScope: newKeyScope
            });

            if (res.success && res.key) {
                setNewlyCreatedSecret(res.key.fullToken);
                setNewKeyLabel('');
                setIsCreatingKey(false);
                toast.success("Gateway API Key generated!");
                loadApiKeys();
            } else {
                toast.error(res.error || "Failed to create API key");
            }
        } catch {
            toast.error("Failed to create key");
        }
    };

    const handleRevokeKey = async (keyId) => {
        if (!confirm("Are you sure you want to revoke this Gateway API key? Any applications using it will be disconnected.")) return;
        try {
            const res = await revokeGatewayKeyAction({ workspaceId, keyId });
            if (res.success) {
                toast.success("Key revoked successfully");
                loadApiKeys();
            } else {
                toast.error(res.error || "Failed to revoke key");
            }
        } catch {
            toast.error("Failed to revoke key");
        }
    };

    const handleClearCache = async () => {
        try {
            await clearCacheAction();
            toast.success("Response cache cleared.");
            loadCacheStats();
        } catch {
            toast.error("Failed to clear cache");
        }
    };

    const handleResetAllCircuits = async () => {
        try {
            for (const item of circuitStatuses) {
                await resetCircuitBreakerAction(item.target.replace(/^key:/, ''));
            }
            toast.success("All circuit cooldowns cleared successfully.");
            loadCircuitStatuses();
        } catch {
            toast.error("Failed to reset circuits");
        }
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedSnippet(id);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopiedSnippet(null), 2000);
    };

    const gatewayBaseUrl = `${origin}/api/workspace/${workspaceId}/flowgenix/v1`;
    const activeTokenForSnippets = newlyCreatedSecret || (apiKeys.length > 0 ? apiKeys[0].maskedKey : "fg_live_...");

    const cursorConfigSnippet = `{
  "models": [
    {
      "name": "${selectedTargetModel}",
      "type": "custom",
      "model": "${selectedTargetModel}"
    }
  ],
  "openaiApiKey": "${activeTokenForSnippets}",
  "openaiBaseUrl": "${gatewayBaseUrl}"
}`;

    const claudeCodeExport = `# Configure Claude Code CLI to route through FlowGenix
export ANTHROPIC_BASE_URL="${gatewayBaseUrl}"
export ANTHROPIC_API_KEY="${activeTokenForSnippets}"
export CLAUDE_MODEL="${selectedTargetModel}"

# Launch Claude Code with resilient multi-provider failover
claude`;

    const clineConfigSnippet = `{
  "apiProvider": "openai-native",
  "openAiBaseUrl": "${gatewayBaseUrl}",
  "openAiApiKey": "${activeTokenForSnippets}",
  "openAiModelId": "${selectedTargetModel}"
}`;

    const pythonSnippet = `from openai import OpenAI

# Initialize client pointing to FlowGenix AI Gateway
client = OpenAI(
    base_url="${gatewayBaseUrl}",
    api_key="${activeTokenForSnippets}"
)

response = client.chat.completions.create(
    model="${selectedTargetModel}",
    messages=[
        {"role": "system", "content": "You are a specialized coding assistant."},
        {"role": "user", "content": "Write an efficient LRU Cache in Python."}
    ],
    temperature=0.2
)

print(response.choices[0].message.content)`;

    const nodeSnippet = `import OpenAI from "openai";

// Initialize OpenAI SDK pointing to FlowGenix Gateway
const client = new OpenAI({
  baseURL: "${gatewayBaseUrl}",
  apiKey: "${activeTokenForSnippets}",
});

async function main() {
  const completion = await client.chat.completions.create({
    model: "${selectedTargetModel}",
    messages: [{ role: "user", content: "Explain React 19 Actions concisely." }],
    stream: false,
  });

  console.log(completion.choices[0].message.content);
}

main();`;

    return (
        <div className="space-y-4  mx-auto pb-12">
            {/* Header Hero */}
            <div className="p-4 rounded-xl bg-card/60 backdrop-blur-md border border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold flex items-center gap-1.5">
                            <Code2 className="w-4 h-4 text-primary" /> Developer Tooling & Integrations
                        </h2>
                        <Badge variant="outline" className="text-[10px] bg-primary/10 border-primary/30 text-primary font-mono">
                            OpenAI API Compatible
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Drop FlowGenix into Cursor, Claude Code, Cline, or Python/Node SDKs as a zero-downtime, token-compressing proxy.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Cache Stats Pill */}
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-lg text-xs">
                        <Zap className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-semibold text-emerald-500">Cache Hits: {cacheStats.hits}</span>
                        <span className="text-[10px] text-muted-foreground">({cacheStats.hitRatio} ratio • {cacheStats.savedTokens} tokens saved)</span>
                        <Button size="sm" variant="ghost" className="h-5 px-1 text-[10px] text-muted-foreground hover:text-foreground" onClick={handleClearCache}>
                            Clear
                        </Button>
                    </div>

                    {/* Default Route Selector */}
                    <div className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-lg border border-border/40 text-xs">
                        <Sliders className="w-3.5 h-3.5 text-primary" />
                        <span className="font-semibold text-muted-foreground">Default Route:</span>
                        <select
                            value={selectedTargetModel}
                            onChange={(e) => setSelectedTargetModel(e.target.value)}
                            className="bg-transparent font-mono font-bold text-primary focus:outline-none cursor-pointer"
                        >
                            <option value="auto/coding">auto/coding (Coding Plan)</option>
                            <option value="auto">auto (LKGP Balanced)</option>
                            <option value="auto/fast">auto/fast (Lowest Latency)</option>
                            <option value="auto/cheap">auto/cheap (Free Tier)</option>
                            <option value="auto/smart">auto/smart (Deep Reasoning)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Gateway API Keys Card */}
            <Card className="border-border/50 bg-card/60">
                <CardHeader className="py-2.5 px-3 border-b border-border/40 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-primary" />
                        <div>
                            <CardTitle className="text-xs font-bold">
                                Gateway API Keys (<code className="text-primary font-mono">fg_live_*</code>)
                            </CardTitle>
                            <CardDescription className="text-[11px]">
                                Scoped, revocable credentials for authenticating Cursor, Claude Code, and external scripts.
                            </CardDescription>
                        </div>
                    </div>

                    <Button
                        size="sm"
                        variant="default"
                        onClick={() => setIsCreatingKey(!isCreatingKey)}
                        className="h-7 text-xs px-2 gap-1 font-semibold"
                    >
                        <Plus className="w-3 h-3" /> Create API Key
                    </Button>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                    {/* Secret Reveal Banner */}
                    {newlyCreatedSecret && (
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between font-bold text-emerald-500">
                                <span className="flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5" /> New Key Created (Save this now! It won't be shown again)
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-[10px] gap-1 font-mono"
                                    onClick={() => copyToClipboard(newlyCreatedSecret, 'new-secret')}
                                >
                                    {copiedSnippet === 'new-secret' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                    Copy Key
                                </Button>
                            </div>
                            <div className="font-mono bg-black/40 p-2 rounded border border-border/40 select-all break-all text-[11px]">
                                {newlyCreatedSecret}
                            </div>
                        </div>
                    )}

                    {/* Inline Create Form */}
                    {isCreatingKey && (
                        <form onSubmit={handleCreateKey} className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-2 text-xs">
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex-1 min-w-[200px]">
                                    <Input
                                        placeholder="Key Label (e.g. Cursor Pro, Claude Code CLI)"
                                        value={newKeyLabel}
                                        onChange={(e) => setNewKeyLabel(e.target.value)}
                                        className="h-8 text-xs bg-background"
                                        autoFocus
                                    />
                                </div>
                                <select
                                    value={newKeyScope}
                                    onChange={(e) => setNewKeyScope(e.target.value)}
                                    className="h-8 px-2 bg-background border border-border rounded-md text-xs font-mono"
                                >
                                    <option value="all">All Models</option>
                                    <option value="auto/coding">Only auto/coding</option>
                                    <option value="auto/cheap">Only auto/cheap (Free Tier)</option>
                                </select>
                                <Button size="sm" type="submit" className="h-8 text-xs font-semibold px-3">
                                    Generate
                                </Button>
                                <Button size="sm" variant="ghost" type="button" onClick={() => setIsCreatingKey(false)} className="h-8 text-xs">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Keys List */}
                    {loadingKeys ? (
                        <div className="text-center p-4 text-xs text-muted-foreground">Loading gateway keys...</div>
                    ) : apiKeys.length === 0 ? (
                        <div className="text-center p-4 text-xs text-muted-foreground">
                            No custom gateway keys generated yet. Click "Create API Key" above to generate your first key.
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {apiKeys.map((key) => (
                                <div key={key.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/30 text-xs">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-foreground">{key.label}</span>
                                            <Badge variant="outline" className="text-[10px] font-mono py-0">{key.modelScope}</Badge>
                                        </div>
                                        <div className="font-mono text-[11px] text-muted-foreground">{key.maskedKey}</div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                                            onClick={() => handleRevokeKey(key.id)}
                                            title="Revoke Key"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Circuit Breaker Live Status Banner */}
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                <CardHeader className="py-2.5 px-3 border-b border-border/40 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        {circuitStatuses.length > 0 ? (
                            <ShieldAlert className="w-4 h-4 text-amber-500 animate-pulse" />
                        ) : (
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        )}
                        <div>
                            <CardTitle className="text-xs font-bold">
                                Circuit Breaker Live Status
                            </CardTitle>
                            <CardDescription className="text-[11px]">
                                {circuitStatuses.length > 0
                                    ? `${circuitStatuses.length} upstream endpoint(s) currently suspended in cooldown`
                                    : "All upstream provider circuits are healthy and closed."}
                            </CardDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={loadCircuitStatuses}
                            disabled={loadingBreaker}
                            className="h-7 text-xs px-2"
                        >
                            <RefreshCw className={`w-3 h-3 ${loadingBreaker ? 'animate-spin' : ''}`} />
                        </Button>
                        {circuitStatuses.length > 0 && (
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={handleResetAllCircuits}
                                className="h-7 text-xs font-semibold px-2"
                            >
                                Clear Cooldowns
                            </Button>
                        )}
                    </div>
                </CardHeader>
                {circuitStatuses.length > 0 && (
                    <CardContent className="p-3 space-y-2">
                        {circuitStatuses.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs bg-muted/40 p-2 rounded-lg border border-border/40">
                                <div className="space-y-0.5">
                                    <span className="font-mono font-bold text-foreground">{item.target}</span>
                                    <p className="text-[11px] text-muted-foreground">{item.reason}</p>
                                </div>
                                <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-500 font-mono text-[10px]">
                                    Cooldown: {item.remainingCooldownSec}s left
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                )}
            </Card>

            {/* Tool Integration Tabs */}
            <Tabs defaultValue="cursor" className="w-full">
                <TabsList className="bg-muted/40 p-1 rounded-lg border border-border/40 flex items-center gap-1 w-full overflow-x-auto justify-start">
                    <TabsTrigger value="cursor" className="text-xs font-semibold gap-1.5">
                        Cursor IDE
                    </TabsTrigger>
                    <TabsTrigger value="claude" className="text-xs font-semibold gap-1.5">
                        Claude Code CLI
                    </TabsTrigger>
                    <TabsTrigger value="cline" className="text-xs font-semibold gap-1.5">
                        Cline / Roo Code
                    </TabsTrigger>
                    <TabsTrigger value="python" className="text-xs font-semibold gap-1.5">
                        Python SDK
                    </TabsTrigger>
                    <TabsTrigger value="node" className="text-xs font-semibold gap-1.5">
                        Node.js SDK
                    </TabsTrigger>
                </TabsList>

                {/* Cursor IDE Tab */}
                <TabsContent value="cursor" className="mt-3 space-y-3">
                    <Card className="border-border/50 bg-card/60">
                        <CardHeader className="p-3 border-b border-border/40">
                            <CardTitle className="text-xs font-bold flex items-center justify-between">
                                <span>Cursor AI Settings Setup</span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs gap-1 font-semibold"
                                    onClick={() => copyToClipboard(gatewayBaseUrl, 'cursor-url')}
                                >
                                    {copiedSnippet === 'cursor-url' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                    Copy Base URL
                                </Button>
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Configure Cursor to use FlowGenix as an OpenAI-compatible custom model provider.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 space-y-3 text-xs">
                            <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                                <li>Open Cursor and navigate to <strong className="text-foreground">Settings &gt; Models &gt; OpenAI API Key</strong>.</li>
                                <li>Enable <strong className="text-foreground">Override OpenAI Base URL</strong> and paste the Gateway URL below.</li>
                                <li>Under <strong className="text-foreground">Models</strong>, add <code className="text-primary font-bold">{selectedTargetModel}</code>.</li>
                            </ol>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase">Base URL:</label>
                                <div className="p-2 bg-muted/60 rounded-lg border border-border/40 font-mono text-[11px] select-all flex items-center justify-between">
                                    <span>{gatewayBaseUrl}</span>
                                    <Button size="sm" variant="ghost" className="h-5 px-1.5 text-[10px]" onClick={() => copyToClipboard(gatewayBaseUrl, 'cursor-url-inline')}>
                                        Copy
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase">Cursor Settings JSON Snippet:</label>
                                <div className="relative">
                                    <pre className="p-3 bg-black/40 rounded-lg border border-border/40 font-mono text-[11px] text-muted-foreground overflow-x-auto">
                                        {cursorConfigSnippet}
                                    </pre>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="absolute top-2 right-2 h-6 px-2 text-[10px] gap-1 font-semibold"
                                        onClick={() => copyToClipboard(cursorConfigSnippet, 'cursor-json')}
                                    >
                                        {copiedSnippet === 'cursor-json' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                        Copy JSON
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Claude Code CLI Tab */}
                <TabsContent value="claude" className="mt-3 space-y-3">
                    <Card className="border-border/50 bg-card/60">
                        <CardHeader className="p-3 border-b border-border/40">
                            <CardTitle className="text-xs font-bold flex items-center justify-between">
                                <span>Claude Code CLI Terminal Setup</span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs gap-1 font-semibold"
                                    onClick={() => copyToClipboard(claudeCodeExport, 'claude-cli')}
                                >
                                    {copiedSnippet === 'claude-cli' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                    Copy Commands
                                </Button>
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Point Claude Code CLI to FlowGenix to benefit from automated multi-provider failover.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 space-y-3 text-xs">
                            <div className="relative">
                                <pre className="p-3 bg-black/40 rounded-lg border border-border/40 font-mono text-[11px] text-muted-foreground overflow-x-auto">
                                    {claudeCodeExport}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Cline / Roo Code Tab */}
                <TabsContent value="cline" className="mt-3 space-y-3">
                    <Card className="border-border/50 bg-card/60">
                        <CardHeader className="p-3 border-b border-border/40">
                            <CardTitle className="text-xs font-bold flex items-center justify-between">
                                <span>Cline & Roo Code Extension Config</span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs gap-1 font-semibold"
                                    onClick={() => copyToClipboard(clineConfigSnippet, 'cline-json')}
                                >
                                    {copiedSnippet === 'cline-json' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                    Copy JSON
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-3 text-xs">
                            <div className="relative">
                                <pre className="p-3 bg-black/40 rounded-lg border border-border/40 font-mono text-[11px] text-muted-foreground overflow-x-auto">
                                    {clineConfigSnippet}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Python SDK Tab */}
                <TabsContent value="python" className="mt-3 space-y-3">
                    <Card className="border-border/50 bg-card/60">
                        <CardHeader className="p-3 border-b border-border/40">
                            <CardTitle className="text-xs font-bold flex items-center justify-between">
                                <span>Python (openai library)</span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs gap-1 font-semibold"
                                    onClick={() => copyToClipboard(pythonSnippet, 'python-code')}
                                >
                                    {copiedSnippet === 'python-code' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                    Copy Python Code
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 text-xs">
                            <div className="relative">
                                <pre className="p-3 bg-black/40 rounded-lg border border-border/40 font-mono text-[11px] text-muted-foreground overflow-x-auto">
                                    {pythonSnippet}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Node.js SDK Tab */}
                <TabsContent value="node" className="mt-3 space-y-3">
                    <Card className="border-border/50 bg-card/60">
                        <CardHeader className="p-3 border-b border-border/40">
                            <CardTitle className="text-xs font-bold flex items-center justify-between">
                                <span>Node.js / TypeScript (openai npm package)</span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs gap-1 font-semibold"
                                    onClick={() => copyToClipboard(nodeSnippet, 'node-code')}
                                >
                                    {copiedSnippet === 'node-code' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                    Copy TS/JS Code
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 text-xs">
                            <div className="relative">
                                <pre className="p-3 bg-black/40 rounded-lg border border-border/40 font-mono text-[11px] text-muted-foreground overflow-x-auto">
                                    {nodeSnippet}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
