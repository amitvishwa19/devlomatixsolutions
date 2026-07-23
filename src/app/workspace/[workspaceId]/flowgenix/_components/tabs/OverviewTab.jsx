'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Zap, 
    ShieldCheck, 
    TrendingDown, 
    Activity, 
    Cpu, 
    Layers, 
    Sparkles, 
    CheckCircle2, 
    Clock, 
    ArrowUpRight,
    Server,
    Database,
    RefreshCw,
    Send,
    Bot,
    User
} from 'lucide-react';

export function OverviewTab({ onNavigateTab, workspaceId }) {
    const [testPrompt, setTestPrompt] = useState('');
    const [testResponse, setTestResponse] = useState('');
    const [testModel, setTestModel] = useState('openrouter/meta-llama/llama-3.1-8b-instruct');
    const [isTesting, setIsTesting] = useState(false);

    const handleTestSubmit = async (e) => {
        e.preventDefault();
        if (!testPrompt.trim()) return;

        setIsTesting(true);
        setTestResponse('');

        try {
            const res = await fetch(`/api/workspace/${workspaceId}/flowgenix/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: testModel,
                    messages: [{ role: 'user', content: testPrompt }],
                    stream: true
                })
            });

            if (!res.ok) {
                const err = await res.text();
                setTestResponse(`Error: ${err}`);
                setIsTesting(false);
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder('utf-8');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    if (line.replace(/^data: /, '').trim() === '[DONE]') continue;
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.replace(/^data: /, ''));
                            if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                                setTestResponse(prev => prev + data.choices[0].delta.content);
                            }
                        } catch (e) {
                            // ignore partial JSON
                        }
                    }
                }
            }
        } catch (error) {
            setTestResponse(`Error: ${error.message}`);
        } finally {
            setIsTesting(false);
        }
    };

    // Mock metrics for rich preview UI
    const metrics = [
        {
            title: "Total Requests (24h)",
            value: "14,892",
            change: "+18.4%",
            icon: Activity,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            borderColor: "border-blue-500/20"
        },
        {
            title: "Token Compression Savings",
            value: "68.4%",
            change: "~4.2M tokens saved",
            icon: TrendingDown,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
            borderColor: "border-emerald-500/20"
        },
        {
            title: "Avg Latency",
            value: "284 ms",
            change: "-42ms via Fast-Route",
            icon: Clock,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
            borderColor: "border-amber-500/20"
        },
        {
            title: "Active Providers",
            value: "12 Connected",
            change: "90+ Free Tiers Ready",
            icon: Cpu,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
            borderColor: "border-purple-500/20"
        }
    ];

    const activeCombos = [
        { name: "auto", strategy: "LKGP (Last-Known-Good)", status: "Active", primary: "Claude 3.7 Sonnet", fallback: "DeepSeek V3 -> Gemini 2.0" },
        { name: "auto/coding", strategy: "Quality-Weighted", status: "Active", primary: "Claude 3.5 Sonnet", fallback: "GPT-4o -> Qwen 2.5 Coder" },
        { name: "auto/fast", strategy: "Latency-Optimized", status: "Active", primary: "Groq Llama 3.3", fallback: "Cerebras Llama 3.1" },
        { name: "auto/cheap", strategy: "Cost-Optimized", status: "Active", primary: "DeepSeek V3", fallback: "GLM-4 Flash (Free)" }
    ];

    const providerHealth = [
        { name: "Anthropic", model: "claude-3-7-sonnet", latency: "310ms", status: "Healthy", tier: "Subscription" },
        { name: "DeepSeek API", model: "deepseek-chat-v3", latency: "190ms", status: "Healthy", tier: "Pay-as-you-go" },
        { name: "Groq Cloud", model: "llama-3.3-70b", latency: "85ms", status: "Healthy", tier: "Free Tier" },
        { name: "Google AI Studio", model: "gemini-2.0-flash", latency: "240ms", status: "Healthy", tier: "Free Tier" },
        { name: "OpenRouter", model: "auto-fallback", latency: "350ms", status: "Healthy", tier: "Multi-Provider" }
    ];

    return (
        <div className="space-y-6 pb-6">
            {/* Top Gateway Status Banner */}
            <div className="p-5 rounded-xl border border-primary/20 bg-linear-to-r from-primary/10 via-card to-secondary/20 shadow-lg relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-xl bg-primary/20 border border-primary/30 text-primary shadow-inner">
                            <Zap className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold tracking-tight">OmniRoute AI Gateway Endpoint</h2>
                                <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px] font-mono">
                                    ONLINE • http://localhost:3000/api/v1
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Single unified OpenAI-compatible endpoint translating OpenAI, Anthropic, Gemini, & Ollama with auto-fallback.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5" onClick={() => onNavigateTab("combos")}>
                            <Layers className="w-3.5 h-3.5 text-primary" /> Configure Combos
                        </Button>
                        <Button size="sm" variant="save" className="text-xs font-semibold gap-1.5" onClick={() => onNavigateTab("providers")}>
                            <Cpu className="w-3.5 h-3.5" /> Manage Providers
                        </Button>
                    </div>
                </div>
            </div>

            {/* Metrics Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, i) => {
                    const IconComponent = metric.icon;
                    return (
                        <Card key={i} className={`border ${metric.borderColor} bg-card/60 backdrop-blur-xs shadow-xs hover:shadow-md transition-all`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    {metric.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${metric.bgColor} ${metric.color}`}>
                                    <IconComponent className="w-4 h-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-black tracking-tight">{metric.value}</div>
                                <p className="text-[11px] font-medium text-emerald-500 mt-1 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> {metric.change}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Middle Section: Active Routing Combos & Live Provider Health */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Active Combos Summary */}
                <Card className="lg:col-span-7 border-border/50 bg-card/40 backdrop-blur-xs">
                    <CardHeader className="p-5 pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-primary" /> Active Preset Routing Combos
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Auto-evaluates candidate models across 12 live factors.
                                </CardDescription>
                            </div>
                            <Button size="sm" variant="ghost" className="text-xs text-primary" onClick={() => onNavigateTab("combos")}>
                                View All (18 Strategies) <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 space-y-3">
                        {activeCombos.map((combo, i) => (
                            <div key={i} className="p-3.5 rounded-lg border border-border/40 bg-secondary/20 hover:bg-secondary/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs font-bold text-foreground">{combo.name}</span>
                                        <Badge variant="outline" className="text-[9px] font-mono bg-primary/10 text-primary border-primary/20">
                                            {combo.strategy}
                                        </Badge>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Primary: <span className="font-medium text-foreground">{combo.primary}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Failover Path</span>
                                    <span className="text-[11px] font-mono text-muted-foreground">{combo.fallback}</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Provider Health Grid */}
                <Card className="lg:col-span-5 border-border/50 bg-card/40 backdrop-blur-xs">
                    <CardHeader className="p-5 pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Connected Provider Health
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Live circuit breaker & latency telemetry.
                                </CardDescription>
                            </div>
                            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground hover:rotate-180 transition-transform cursor-pointer" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 space-y-3">
                        {providerHealth.map((prov, i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-border/30 bg-muted/20 text-xs">
                                <div className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <div>
                                        <p className="font-bold">{prov.name}</p>
                                        <p className="text-[10px] font-mono text-muted-foreground">{prov.model}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-right">
                                    <div>
                                        <span className="text-[10px] font-mono text-emerald-500 font-semibold block">{prov.latency}</span>
                                        <span className="text-[9px] text-muted-foreground block">{prov.tier}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Live API Playground */}
            <Card className="border border-border/50 bg-card/40 backdrop-blur-xs">
                <CardHeader className="p-5 pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-500" /> API Test Playground
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Test your FlowGenix gateway live using the standard OpenAI format.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Prompt Input */}
                        <form onSubmit={handleTestSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold">Model String (Prefix with Provider)</label>
                                <Input 
                                    value={testModel}
                                    onChange={(e) => setTestModel(e.target.value)}
                                    className="h-9 text-xs bg-black/40 border-border/50 font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold">Prompt</label>
                                <textarea 
                                    value={testPrompt}
                                    onChange={(e) => setTestPrompt(e.target.value)}
                                    placeholder="Write a greeting..."
                                    className="w-full h-32 p-3 text-xs bg-black/40 border border-border/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                />
                            </div>
                            <Button 
                                type="submit" 
                                disabled={isTesting || !testPrompt.trim()}
                                className="w-full text-xs font-bold h-9 bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
                            >
                                {isTesting ? 'Streaming...' : (
                                    <>Send to Gateway <Send className="w-3 h-3 ml-2" /></>
                                )}
                            </Button>
                        </form>

                        {/* Response Output */}
                        <div className="space-y-2 flex flex-col h-full">
                            <label className="text-xs font-bold">Streamed Response</label>
                            <div className="flex-1 min-h-[140px] bg-black/60 border border-border/50 rounded-lg p-4 font-mono text-[11px] text-emerald-400 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                                {testResponse || (
                                    <span className="text-muted-foreground opacity-50 block text-center mt-12">
                                        Response will stream here...
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
