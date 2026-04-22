'use client';

import React from 'react';
import { 
    Bot, 
    Smartphone, 
    Plus, 
    User, 
    Info, 
    Trash2 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
    Tooltip, 
    TooltipContent, 
    TooltipTrigger 
} from "@/components/ui/tooltip";

export default function AutomationTab({
    metadata,
    onSaveMetadata,
    setMetadata,
    testNumberInput,
    setTestNumberInput,
    onAddTestNumber,
    onRemoveTestNumber
}) {
    return (
        <div className="max-w-3xl space-y-6">
            <Card className="glass-card border-none shadow-none">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
                                <Bot className="w-4 h-4 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                                <CardTitle className="text-base font-bold tracking-tight">Auto-Responder</CardTitle>
                                <CardDescription className="text-[10px] font-medium uppercase tracking-widest opacity-60">Message Handlers</CardDescription>
                            </div>
                        </div>
                        <Switch
                            checked={metadata.autoResponderEnabled || false}
                            onCheckedChange={(checked) => onSaveMetadata({ autoResponderEnabled: checked })}
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-5 bg-background/40 backdrop-blur-sm rounded-xl border border-border/20 shadow-sm">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold tracking-tight">AI Synthesis Hub</Label>
                            <p className="text-[10px] text-muted-foreground font-medium">Use AI to analyze intent before replying.</p>
                        </div>
                        <Switch
                            checked={metadata.aiAssistantEnabled || false}
                            onCheckedChange={(checked) => onSaveMetadata({ aiAssistantEnabled: checked })}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-1">Default Welcome Message</Label>
                        <Textarea
                            rows={6}
                            className="min-h-[120px] bg-background/40 backdrop-blur-sm text-xs font-medium focus:border-primary/40 rounded-xl border-border/20 shadow-inner p-4 leading-relaxed"
                            placeholder="Hello! How can we help you today?"
                            value={metadata.welcomeMessage || ''}
                            onChange={(e) => setMetadata({ ...metadata, welcomeMessage: e.target.value })}
                            onBlur={(e) => onSaveMetadata({ welcomeMessage: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="glass-card border-none shadow-none">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
                            <Smartphone className="w-4 h-4 text-primary" />
                        </div>
                        <div className="space-y-0.5">
                            <CardTitle className="text-base font-bold tracking-tight text-primary">Test Audience</CardTitle>
                            <CardDescription className="text-[10px] font-medium uppercase tracking-widest opacity-60">Internal QA Node</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40">
                                <Plus size={16} />
                            </div>
                            <Input
                                placeholder="Enter phone with country code (e.g. +919712340450)"
                                className="pl-11 bg-background/40 backdrop-blur-sm h-11 text-xs font-medium border-border/20 rounded-xl shadow-inner px-4"
                                value={testNumberInput}
                                onChange={e => setTestNumberInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && onAddTestNumber()}
                            />
                        </div>
                        <Button size="sm" onClick={onAddTestNumber} className="h-11 px-6 rounded-xl font-bold">Add Number</Button>
                    </div>

                    <div className="grid gap-3">
                        {(metadata.testNumbers || []).map((num) => (
                            <div key={num} className="flex items-center justify-between p-4 rounded-xl border border-border/20 bg-background/40 backdrop-blur-sm hover:border-primary/20 transition-all group shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center border border-border/40 shadow-inner">
                                        <User className="w-4 h-4 text-muted-foreground/60" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold font-mono tracking-tight">{num}</span>
                                        <Badge variant="outline" className="text-[8px] font-black tracking-widest h-4 border-primary/20 text-primary bg-primary/5 py-0 px-1.5">VERIFIED</Badge>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="w-3 h-3 text-muted-foreground cursor-help opacity-40 hover:opacity-100 transition-opacity" />
                                            </TooltipTrigger>
                                            <TooltipContent className="text-[10px] rounded-lg p-2 leading-relaxed">
                                                Ensure this number is also added to 'Test Numbers' in Meta Dev Console.
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                    onClick={() => onRemoveTestNumber(num)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        ))}
                        {(metadata.testNumbers || []).length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 bg-muted/5 border border-dashed border-border/40 rounded-2xl">
                                <div className="p-3 bg-muted/10 rounded-full">
                                    <Smartphone className="w-6 h-6 text-muted-foreground/30" />
                                </div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest italic">No test numbers defined yet.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
