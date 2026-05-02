'use client';

import React from 'react';
import { BellRing, Mail, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

import { useAction } from "@/hooks/use-action";
import { updateWaMetadata } from "../_actions/update-wa-metadata";

export function NotificationsTab({ workspaceId, metadata, setMetadata }) {
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
                                <BellRing className="w-4 h-4 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                                <CardTitle className="text-base font-semibold">Alert Center</CardTitle>
                                <CardDescription className="text-xs font-medium">System Stability</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-5 bg-muted/5 border border-border/40 rounded-xl shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border/40">
                                        <Mail className="w-4 h-4 text-muted-foreground/60" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-sm font-semibold">Disconnect Alerts</span>
                                        <p className="text-xs text-muted-foreground font-medium">Email notification when a session drops unexpectedly.</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={metadata.notifyDisconnect || false}
                                    onCheckedChange={(c) => handleSaveMetadata({ notifyDisconnect: c })}
                                />
                            </div>

                            <div className="flex items-center justify-between p-5 bg-muted/5 border border-border/40 rounded-xl shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border/40">
                                        <AlertCircle className="w-4 h-4 text-muted-foreground/60" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-sm font-semibold">Delivery Failures</span>
                                        <p className="text-xs text-muted-foreground font-medium">Alert when a template or broadcast fails to deliver.</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={metadata.notifyFailure || false}
                                    onCheckedChange={(c) => handleSaveMetadata({ notifyFailure: c })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-medium text-muted-foreground ml-1">Admin Alert Email</Label>
                            <Input
                                placeholder="admin@example.com"
                                className="h-11 bg-background text-sm border-border/40 rounded-xl px-4"
                                value={metadata.alertEmail || ''}
                                onChange={(e) => setMetadata({ ...metadata, alertEmail: e.target.value })}
                                onBlur={(e) => handleSaveMetadata({ alertEmail: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
