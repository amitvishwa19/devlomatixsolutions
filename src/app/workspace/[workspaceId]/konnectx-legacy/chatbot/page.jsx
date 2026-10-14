'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
    Bot,
    Sparkles,
    Zap,
    Plus,
    Trash2,
    Save,
    Check,
    HelpCircle,
    Sliders,
    MessageSquare,
    Power,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
    getChatbotConfigAction,
    saveChatbotConfigAction
} from '../_actions/chatbot-actions';

export default function KonnectChatbotPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Chatbot configuration
    const [active, setActive] = useState(false);
    const [aiEnabled, setAiEnabled] = useState(false);
    const [model, setModel] = useState('gemini-2.0-flash');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [temperature, setTemperature] = useState(0.7);
    const [rules, setRules] = useState([]);

    // Add Rule Modal
    const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
    const [ruleKeyword, setRuleKeyword] = useState('');
    const [ruleMatchType, setRuleMatchType] = useState('contains');
    const [ruleResponse, setRuleResponse] = useState('');

    const loadConfig = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getChatbotConfigAction(workspaceId);
            if (res.success && res.config) {
                setActive(res.config.active);
                setAiEnabled(res.config.aiEnabled);
                setModel(res.config.model);
                setSystemPrompt(res.config.systemPrompt);
                setTemperature(res.config.temperature);
                setRules(res.config.rules || []);
            }
        } catch (e) {
            toast.error("Failed to load chatbot configuration");
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        loadConfig();
    }, [loadConfig]);

    const handleSaveConfig = async () => {
        setSaving(true);
        try {
            const res = await saveChatbotConfigAction(workspaceId, {
                active,
                aiEnabled,
                model,
                systemPrompt,
                temperature,
                rules
            });
            if (res.success) {
                toast.success("Chatbot settings saved successfully!");
            } else {
                toast.error(res.error || "Failed to save configuration");
            }
        } catch (e) {
            toast.error("Error saving chatbot configuration");
        } finally {
            setSaving(false);
        }
    };

    const handleAddRule = (e) => {
        e.preventDefault();
        if (!ruleKeyword.trim() || !ruleResponse.trim()) {
            toast.error("Keyword and response text are required");
            return;
        }

        const newRule = {
            id: `rule-${Date.now()}`,
            keyword: ruleKeyword.trim().toUpperCase(),
            matchType: ruleMatchType,
            response: ruleResponse.trim(),
            active: true
        };

        setRules(prev => [...prev, newRule]);
        setIsAddRuleOpen(false);
        setRuleKeyword('');
        setRuleResponse('');
        toast.success("Rule added! Click 'Save Changes' to apply.");
    };

    const handleDeleteRule = (id) => {
        setRules(prev => prev.filter(r => r.id !== id));
        toast.info("Rule removed. Click 'Save Changes' to persist.");
    };

    const handleToggleRule = (id) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    };

    if (loading) {
        return (
            <div className="py-24 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-500" />
                Loading Chatbot & Auto-Responder settings...
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Bot className="h-5 w-5 text-emerald-500" />
                        AI Chatbots & Keyword Triggers
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Automate replies 24/7 on WhatsApp using FlowGenix LLM models or exact keyword triggers.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={handleSaveConfig}
                        disabled={saving}
                        className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        <span>Save Changes</span>
                    </Button>
                </div>
            </div>

            {/* Master Bot Switch Hero */}
            <Card className="bg-card/40 border-border/40 backdrop-blur-sm p-4 rounded-[16px]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${active ? 'bg-emerald-500/20 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                            <Power className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">
                                Master Auto-Responder Engine
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                When active, all incoming customer messages on WhatsApp will be evaluated against your trigger rules and AI knowledge context.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                            {active ? 'Active' : 'Disabled'}
                        </span>
                        <Switch
                            checked={active}
                            onCheckedChange={setActive}
                        />
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left 6 cols: FlowGenix AI Agent */}
                <div className="lg:col-span-6 space-y-4">
                    <Card className="bg-card/40 border-border/40 backdrop-blur-sm p-4 rounded-[16px] space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-emerald-500" />
                                <h3 className="text-xs font-semibold text-foreground">
                                    FlowGenix Conversational AI
                                </h3>
                            </div>
                            <Switch
                                checked={aiEnabled}
                                onCheckedChange={setAiEnabled}
                            />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            When enabled, unrecognized customer questions are answered dynamically using your AI prompt instructions.
                        </p>

                        <div className="space-y-1 pt-1">
                            <Label className="text-xs">Model Engine</Label>
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full h-8 text-xs rounded-md border border-input bg-background px-2"
                            >
                                <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Fastest & Recommended)</option>
                                <option value="gpt-4o">OpenAI GPT-4o (High Intelligence)</option>
                                <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                                <option value="deepseek-v3">DeepSeek V3 (Economic)</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">AI Knowledge & System Prompt</Label>
                            <Textarea
                                rows={6}
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                placeholder="You are a customer representative for Devlomatix. Answer politely about our services..."
                                className="text-xs"
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Include company policies, product descriptions, pricing details, and contact directions.
                            </p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <Label>Creativity (Temperature): {temperature}</Label>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.1}
                                value={temperature}
                                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                className="w-full accent-emerald-500"
                            />
                        </div>
                    </Card>
                </div>

                {/* Right 6 cols: Keyword Triggers List */}
                <div className="lg:col-span-6 space-y-4">
                    <Card className="bg-card/40 border-border/40 backdrop-blur-sm p-4 rounded-[16px] space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-emerald-500" />
                                <h3 className="text-xs font-semibold text-foreground">
                                    Instant Keyword Trigger Rules
                                </h3>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => setIsAddRuleOpen(true)}
                                className="h-7 text-xs px-2 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <Plus className="h-3 w-3" />
                                <span>Add Rule</span>
                            </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Fast rule engine executing instant formatted WhatsApp responses before falling back to AI.
                        </p>

                        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                            {rules.length === 0 ? (
                                <p className="text-xs text-muted-foreground py-6 text-center">
                                    No trigger rules defined. Click "Add Rule" to create one.
                                </p>
                            ) : (
                                rules.map((r) => (
                                    <div
                                        key={r.id}
                                        className="p-3 rounded-xl border border-border/40 bg-card/30 space-y-1.5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                                                    {r.keyword}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground uppercase">
                                                    ({r.matchType})
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={r.active}
                                                    onCheckedChange={() => handleToggleRule(r.id)}
                                                    className="scale-75"
                                                />
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteRule(r.id)}
                                                    className="h-6 w-6 text-rose-500 hover:text-rose-400"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-2">
                                            {r.response}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Add Rule Dialog */}
            <Dialog open={isAddRuleOpen} onOpenChange={setIsAddRuleOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                            <Zap className="h-4 w-4 text-emerald-500" />
                            Add Keyword Trigger Rule
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddRule} className="space-y-3 py-2">
                        <div className="space-y-1">
                            <Label className="text-xs">Trigger Keyword (e.g. PRICE, SUPPORT, STOP)</Label>
                            <Input
                                placeholder="e.g. PRICING"
                                value={ruleKeyword}
                                onChange={(e) => setRuleKeyword(e.target.value)}
                                required
                                className="h-8 text-xs font-mono uppercase"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Match Condition</Label>
                            <select
                                value={ruleMatchType}
                                onChange={(e) => setRuleMatchType(e.target.value)}
                                className="w-full h-8 text-xs rounded-md border border-input bg-background px-2"
                            >
                                <option value="contains">Contains Keyword</option>
                                <option value="exact">Exact Match Only</option>
                                <option value="starts_with">Starts With</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Automated WhatsApp Response</Label>
                            <Textarea
                                placeholder="Thank you for asking! Our plans start at..."
                                rows={4}
                                value={ruleResponse}
                                onChange={(e) => setRuleResponse(e.target.value)}
                                required
                                className="text-xs"
                            />
                        </div>
                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAddRuleOpen(false)}
                                className="h-8 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                Add Rule
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
