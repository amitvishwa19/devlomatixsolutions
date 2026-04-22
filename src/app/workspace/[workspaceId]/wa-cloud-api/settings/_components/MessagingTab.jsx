'use client';

import React from 'react';
import { Send } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";

export default function MessagingTab({
    metadata,
    onSaveMetadata
}) {
    return (
        <div className="max-w-3xl space-y-6">
            <Card className="glass-card border-none shadow-none">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
                            <Send className="w-4 h-4 text-primary" />
                        </div>
                        <div className="space-y-0.5">
                            <CardTitle className="text-base font-bold tracking-tight text-primary">Messaging Standards</CardTitle>
                            <CardDescription className="text-[10px] font-medium uppercase tracking-widest opacity-60">Engine Preferences</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-1">Message Retention</Label>
                            <Select
                                value={metadata.retention || '90'}
                                onValueChange={(v) => onSaveMetadata({ retention: v })}
                            >
                                <SelectTrigger className="h-11 bg-background/40 backdrop-blur-sm text-xs font-bold border-border/20 rounded-xl shadow-inner px-4">
                                    <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                                <SelectContent className="glass-card border-border/20 rounded-xl">
                                    <SelectItem value="30" className="text-xs">30 Days</SelectItem>
                                    <SelectItem value="90" className="text-xs">90 Days</SelectItem>
                                    <SelectItem value="365" className="text-xs">1 Year</SelectItem>
                                    <SelectItem value="0" className="text-xs">Indefinite</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-1">Media Quality</Label>
                            <Select
                                value={metadata.mediaQuality || 'standard'}
                                onValueChange={(v) => onSaveMetadata({ mediaQuality: v })}
                            >
                                <SelectTrigger className="h-11 bg-background/40 backdrop-blur-sm text-xs font-bold border-border/20 rounded-xl shadow-inner px-4">
                                    <SelectValue placeholder="Select quality" />
                                </SelectTrigger>
                                <SelectContent className="glass-card border-border/20 rounded-xl">
                                    <SelectItem value="standard" className="text-xs">Standard (Comp.)</SelectItem>
                                    <SelectItem value="hd" className="text-xs">High Definition</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator className="bg-border/20" />

                    <div className="space-y-5">
                        <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-border/20 rounded-xl shadow-sm">
                            <div className="space-y-0.5">
                                <Label className="text-xs font-bold tracking-tight">Auto-Sync Templates</Label>
                                <p className="text-[10px] text-muted-foreground font-medium">Automatically download Meta templates every hour.</p>
                            </div>
                            <Switch
                                checked={metadata.autoSyncTemplates || false}
                                onCheckedChange={(c) => onSaveMetadata({ autoSyncTemplates: c })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
