'use client';

import React, { useState } from 'react';
import {
    Bot,
    Smartphone,
    Plus,
    User,
    Info,
    Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { useAction } from "@/hooks/use-action";
import { updateWaMetadata } from "../_actions/update-wa-metadata";
import { updateTestNumbers } from "../_actions/update-test-numbers";

export function AutomationTab({ workspaceId, metadata, setMetadata }) {
    const [testNumberInput, setTestNumberInput] = useState('');

    const { execute: executeUpdateMetadata } = useAction(updateWaMetadata, {
        onSuccess: (data) => {
            toast.success('Settings updated');
            setMetadata(data.metadata);
        },
        onError: (err) => toast.error(err || 'Failed to save settings')
    });

    const { execute: executeUpdateTestNumbers } = useAction(updateTestNumbers, {
        onSuccess: (data) => {
            toast.success('Test numbers updated');
            setMetadata(prev => ({ ...prev, testNumbers: data.testNumbers }));
        },
        onError: (err) => toast.error(err || 'Failed to update test numbers')
    });

    const handleSaveMetadata = (updates) => {
        const newMetadata = { ...metadata, ...updates };
        setMetadata(newMetadata);
        executeUpdateMetadata({ workspaceId, metadata: newMetadata });
    };

    const handleAddTestNumber = () => {
        if (!testNumberInput?.trim()) return;
        const currentNumbers = metadata.testNumbers || [];
        if (currentNumbers.includes(testNumberInput)) {
            toast.error("Number already exists");
            return;
        }
        const updated = [...currentNumbers, testNumberInput];
        executeUpdateTestNumbers({ workspaceId, testNumbers: updated });
        setTestNumberInput('');
    };

    const handleRemoveTestNumber = (num) => {
        const updated = (metadata.testNumbers || []).filter(n => n !== num);
        executeUpdateTestNumbers({ workspaceId, testNumbers: updated });
    };

    return (
        <div className="flex-1 space-y-4 outline-none  overflow-y-auto">
            <div className="flex-row items-center space-y-4">

                <Card className="border shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/5 rounded-lg border border-primary/10">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <CardTitle className="text-base font-semibold">Auto-Responder</CardTitle>
                                    <CardDescription className="text-xs font-medium">Message Handlers</CardDescription>
                                </div>
                            </div>
                            <Switch
                                checked={metadata.autoResponderEnabled || false}
                                onCheckedChange={(checked) => handleSaveMetadata({ autoResponderEnabled: checked })}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-5 bg-muted/5 rounded-xl border border-border/40">
                            <div className="space-y-1">
                                <Label className="text-sm font-semibold">AI Synthesis Hub</Label>
                                <p className="text-xs text-muted-foreground">Use AI to analyze intent before replying.</p>
                            </div>
                            <Switch
                                checked={metadata.aiAssistantEnabled || false}
                                onCheckedChange={(checked) => handleSaveMetadata({ aiAssistantEnabled: checked })}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-medium text-muted-foreground ml-1">Default Welcome Message</Label>
                            <Textarea
                                rows={6}
                                className="min-h-[120px] bg-background text-sm focus:border-primary/40 rounded-xl border-border/40 p-4 leading-relaxed"
                                placeholder="Hello! How can we help you today?"
                                value={metadata.welcomeMessage || ''}
                                onChange={(e) => setMetadata({ ...metadata, welcomeMessage: e.target.value })}
                                onBlur={(e) => handleSaveMetadata({ welcomeMessage: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/5 rounded-lg border border-primary/10">
                                <Smartphone className="w-4 h-4 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                                <CardTitle className="text-base font-semibold">Test Audience</CardTitle>
                                <CardDescription className="text-xs font-medium">Internal QA Node</CardDescription>
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
                                    className="pl-11 bg-background h-11 text-sm border-border/40 rounded-xl px-4"
                                    value={testNumberInput}
                                    onChange={e => setTestNumberInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddTestNumber()}
                                />
                            </div>
                            <Button size="sm" onClick={handleAddTestNumber} className="h-11 px-6 rounded-xl font-medium">Add Number</Button>
                        </div>

                        <div className="grid gap-3">
                            {(metadata.testNumbers || []).map((num) => (
                                <div key={num} className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-background hover:border-primary/20 transition-all group shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-muted/10 flex items-center justify-center border border-border/40">
                                            <User className="w-4 h-4 text-muted-foreground/60" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold font-mono tracking-tight">{num}</span>
                                            <Badge variant="secondary" className="text-[10px] font-semibold h-5 bg-green-500/10 text-green-600 border-none">VERIFIED</Badge>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help opacity-40 hover:opacity-100 transition-opacity" />
                                                </TooltipTrigger>
                                                <TooltipContent className="text-xs rounded-lg p-2">
                                                    Ensure this number is also added to 'Test Numbers' in Meta Dev Console.
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                        onClick={() => handleRemoveTestNumber(num)}
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
                                    <p className="text-xs text-muted-foreground font-medium italic">No test numbers defined yet.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
