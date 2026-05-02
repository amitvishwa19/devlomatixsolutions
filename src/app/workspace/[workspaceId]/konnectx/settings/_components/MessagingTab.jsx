'use client';

import React from 'react';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

import { useAction } from "@/hooks/use-action";
import { updateWaMetadata } from "../_actions/update-wa-metadata";

export function MessagingTab({ workspaceId, metadata, setMetadata }) {
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
        <div className="flex-1 space-y-4 outline-none custom-scrollbar overflow-y-auto">
            <div className=" space-y-4">
                <Card className="border shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/5 rounded-lg border border-primary/10">
                                <Send className="w-4 h-4 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                                <CardTitle className="text-base font-semibold">Messaging Standards</CardTitle>
                                <CardDescription className="text-xs font-medium">Engine Preferences</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-xs font-medium text-muted-foreground ml-1">Message Retention</Label>
                                <Select
                                    value={metadata.retention || '90'}
                                    onValueChange={(v) => handleSaveMetadata({ retention: v })}
                                >
                                    <SelectTrigger className="h-11 bg-background text-sm border-border/40 rounded-xl px-4">
                                        <SelectValue placeholder="Select period" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border/20">
                                        <SelectItem value="30" className="text-sm">30 Days</SelectItem>
                                        <SelectItem value="90" className="text-sm">90 Days</SelectItem>
                                        <SelectItem value="365" className="text-sm">1 Year</SelectItem>
                                        <SelectItem value="0" className="text-sm">Indefinite</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-medium text-muted-foreground ml-1">Media Quality</Label>
                                <Select
                                    value={metadata.mediaQuality || 'standard'}
                                    onValueChange={(v) => handleSaveMetadata({ mediaQuality: v })}
                                >
                                    <SelectTrigger className="h-11 bg-background text-sm border-border/40 rounded-xl px-4">
                                        <SelectValue placeholder="Select quality" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border/20">
                                        <SelectItem value="standard" className="text-sm">Standard (Comp.)</SelectItem>
                                        <SelectItem value="hd" className="text-sm">High Definition</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Separator className="bg-border/20" />

                        <div className="space-y-5">
                            <div className="flex items-center justify-between p-4 bg-muted/5 border border-border/40 rounded-xl shadow-sm">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-semibold">Auto-Sync Templates</Label>
                                    <p className="text-xs text-muted-foreground font-medium">Automatically download Meta templates every hour.</p>
                                </div>
                                <Switch
                                    checked={metadata.autoSyncTemplates || false}
                                    onCheckedChange={(c) => handleSaveMetadata({ autoSyncTemplates: c })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
