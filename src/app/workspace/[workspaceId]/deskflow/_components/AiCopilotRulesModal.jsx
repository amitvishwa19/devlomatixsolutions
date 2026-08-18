'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Bot,
    Sparkles,
    Shield,
    Zap,
    MessageSquare,
    CheckCircle2,
    Sliders,
    BrainCircuit
} from 'lucide-react';
import { toast } from 'sonner';

export function AiCopilotRulesModal({ open, onOpenChange }) {
    const [autoReply, setAutoReply] = useState(true);
    const [knowledgeBaseLookup, setKnowledgeBaseLookup] = useState(true);
    const [autoEscalate, setAutoEscalate] = useState(true);
    const [sentimentTagging, setSentimentTagging] = useState(true);
    const [modelTier, setModelTier] = useState('FlowGenix Claude 3.5 Sonnet');
    const [tone, setTone] = useState('Friendly & Professional');
    const [systemPrompt, setSystemPrompt] = useState(
        'You are the official Devlomatix Support AI. Answer customer queries with concise, helpful steps based on the workspace Knowledge Base. Escalate billing disputes and refund requests to human agents immediately.'
    );

    const handleSave = () => {
        toast.success("AI Copilot resolution rules updated successfully!");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl bg-card border-border/80 p-0 overflow-hidden flex flex-col max-h-[85vh]">
                <DialogHeader className="p-4 border-b border-border/60 bg-secondary/15">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                DeskFlow AI Copilot & Automation Rules
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Configure automated multi-channel resolution, knowledge lookup, and fallback triggers.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                    {/* Model Tier & Tone */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">LLM Engine</Label>
                            <Select value={modelTier} onValueChange={setModelTier}>
                                <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FlowGenix Claude 3.5 Sonnet">Claude 3.5 Sonnet (Best Reasoning)</SelectItem>
                                    <SelectItem value="FlowGenix GPT-4o">GPT-4o (Ultra Fast)</SelectItem>
                                    <SelectItem value="Gemini 1.5 Pro">Gemini 1.5 Pro (Large Context)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Response Tone</Label>
                            <Select value={tone} onValueChange={setTone}>
                                <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Friendly & Professional">Friendly & Professional</SelectItem>
                                    <SelectItem value="Direct & Technical">Direct & Technical</SelectItem>
                                    <SelectItem value="Executive & Formal">Executive & Formal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Automation Switches */}
                    <div className="space-y-2 pt-1">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Autonomous Capabilities</Label>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/40">
                                <div className="space-y-0.5">
                                    <span className="font-semibold text-foreground block">Real-time WhatsApp & Chat Auto-Reply</span>
                                    <p className="text-[11px] text-muted-foreground">Automatically answer customer inquiries when agents are offline or busy.</p>
                                </div>
                                <Switch checked={autoReply} onCheckedChange={setAutoReply} />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/40">
                                <div className="space-y-0.5">
                                    <span className="font-semibold text-foreground block">KnowBase RAG Semantic Search</span>
                                    <p className="text-[11px] text-muted-foreground">Index published Knowledge Base articles as dynamic ground truth.</p>
                                </div>
                                <Switch checked={knowledgeBaseLookup} onCheckedChange={setKnowledgeBaseLookup} />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/40">
                                <div className="space-y-0.5">
                                    <span className="font-semibold text-foreground block">Auto-Escalate Complex Inquiries</span>
                                    <p className="text-[11px] text-muted-foreground">Transfer ticket immediately to a human lead if sentiment drops or refund requested.</p>
                                </div>
                                <Switch checked={autoEscalate} onCheckedChange={setAutoEscalate} />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/40">
                                <div className="space-y-0.5">
                                    <span className="font-semibold text-foreground block">Sentiment Scoring & Auto-Tagging</span>
                                    <p className="text-[11px] text-muted-foreground">Automatically assign Urgent / High priority tags based on conversation tone.</p>
                                </div>
                                <Switch checked={sentimentTagging} onCheckedChange={setSentimentTagging} />
                            </div>
                        </div>
                    </div>

                    {/* System Prompt Guidelines */}
                    <div className="space-y-1.5 pt-1">
                        <Label className="text-xs font-semibold">Custom AI Persona & Safety Guidelines</Label>
                        <Textarea
                            rows={3}
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            className="text-xs bg-secondary/30 border-border/80 resize-none font-mono"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-border/60 bg-secondary/15 flex items-center justify-end gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs border-border/80">
                        Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
                        Save AI Rules
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
