'use client';

import React from 'react';
import { 
    BellRing, 
    Mail, 
    AlertCircle 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function NotificationsTab({
    metadata,
    setMetadata,
    onSaveMetadata
}) {
    return (
        <div className="max-w-3xl space-y-6">
            <Card className="glass-card border-none shadow-none">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
                            <BellRing className="w-4 h-4 text-primary" />
                        </div>
                        <div className="space-y-0.5">
                            <CardTitle className="text-base font-bold tracking-tight text-primary">Alert Center</CardTitle>
                            <CardDescription className="text-[10px] font-medium uppercase tracking-widest opacity-60">System Stability</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-5 bg-background/40 backdrop-blur-sm border border-border/20 rounded-xl shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center border border-border/40 shadow-inner">
                                    <Mail className="w-4 h-4 text-muted-foreground/60" />
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-xs font-bold tracking-tight">Disconnect Alerts</span>
                                    <p className="text-[10px] text-muted-foreground font-medium">Email notification when a session drops unexpectedly.</p>
                                </div>
                            </div>
                            <Switch
                                checked={metadata.notifyDisconnect || false}
                                onCheckedChange={(c) => onSaveMetadata({ notifyDisconnect: c })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-5 bg-background/40 backdrop-blur-sm border border-border/20 rounded-xl shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center border border-border/40 shadow-inner">
                                    <AlertCircle className="w-4 h-4 text-muted-foreground/60" />
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-xs font-bold tracking-tight">Delivery Failures</span>
                                    <p className="text-[10px] text-muted-foreground font-medium">Alert when a template or broadcast fails to deliver.</p>
                                </div>
                            </div>
                            <Switch
                                checked={metadata.notifyFailure || false}
                                onCheckedChange={(c) => onSaveMetadata({ notifyFailure: c })}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-1">Admin Alert Email</Label>
                        <Input
                            placeholder="admin@example.com"
                            className="h-11 bg-background/40 backdrop-blur-sm text-xs font-bold border-border/20 rounded-xl shadow-inner px-4"
                            value={metadata.alertEmail || ''}
                            onChange={(e) => setMetadata({ ...metadata, alertEmail: e.target.value })}
                            onBlur={(e) => onSaveMetadata({ alertEmail: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
