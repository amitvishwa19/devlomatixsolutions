'use client';

import React, { useState } from 'react';
import {
    Bot
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import { useAction } from "@/hooks/use-action";
import { updateWaMetadata } from "../_actions/update-wa-metadata";

export function AutomationTab({ workspaceId, metadata, setMetadata }) {
    const { execute: executeUpdateMetadata } = useAction(updateWaMetadata, {
        onSuccess: (data) => {
            toast.success('Settings updated');
            setMetadata(data.metadata);
        },
        onError: (err) => toast.error(err || 'Failed to save settings')
    });

    const handleSaveMetadata = (updates) => {
        const newMetadata = { ...metadata, ...updates };
        setMetadata(newMetadata);
        executeUpdateMetadata({ workspaceId, metadata: newMetadata });
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

            </div>
        </div>
    );
}
