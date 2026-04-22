'use client';

import React from 'react';
import { 
    Link, 
    Copy, 
    Info, 
    Eye, 
    EyeOff 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function WebhooksTab({
    metadata,
    onSaveMetadata,
    setMetadata,
    webhookUrl,
    showWebhookSecret,
    setShowWebhookSecret,
    copyToClipboard
}) {
    return (
        <div className="max-w-3xl space-y-6">
            <Card className="glass-card border-none shadow-none">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
                            <Link className="w-4 h-4 text-primary" />
                        </div>
                        <div className="space-y-0.5">
                            <CardTitle className="text-base font-bold tracking-tight text-primary">Webhook Configuration</CardTitle>
                            <CardDescription className="text-[10px] font-medium uppercase tracking-widest opacity-60">Event Bridge</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-1">Webhook Payload URL</Label>
                        <div className="flex gap-3">
                            <Input readOnly value={webhookUrl} className="bg-background/40 backdrop-blur-sm h-11 text-xs font-mono font-bold border-border/20 rounded-xl shadow-inner px-4 text-primary/80" />
                            <Button variant="outline" size="icon" className="h-11 w-11 shrink-0 rounded-xl border-border/20 hover:bg-muted/10" onClick={() => copyToClipboard(webhookUrl)}>
                                <Copy size={16} />
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium ml-1 flex items-center gap-2">
                            <Info size={12} className="text-primary/60" />
                            Configure this URL in your Meta Developer Portal Webhooks section.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-1">Verify Token</Label>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Input
                                    type={showWebhookSecret ? "text" : "password"}
                                    value={metadata.webhookSecret || 'devlomatix_secret'}
                                    onChange={(e) => setMetadata({ ...metadata, webhookSecret: e.target.value })}
                                    onBlur={(e) => onSaveMetadata({ webhookSecret: e.target.value })}
                                    className="bg-background/40 backdrop-blur-sm h-11 text-xs font-mono font-bold border-border/20 rounded-xl shadow-inner px-4 pr-12"
                                />
                                <button
                                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showWebhookSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <Button variant="outline" size="icon" className="h-11 w-11 shrink-0 rounded-xl border-border/20 hover:bg-muted/10" onClick={() => copyToClipboard(metadata.webhookSecret || 'devlomatix_secret')}>
                                <Copy size={16} />
                            </Button>
                        </div>
                    </div>

                    <Separator className="bg-border/20" />

                    <div className="space-y-5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-1">Event Subscriptions</Label>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Message Events', key: 'hook_messages' },
                                { label: 'Status Updates', key: 'hook_status' },
                                { label: 'Delivery Reports', key: 'hook_delivery' },
                                { label: 'Error Notifications', key: 'hook_errors' }
                            ].map((evt) => (
                                <div key={evt.key} className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-border/20 rounded-xl shadow-sm">
                                    <span className="text-[11px] font-bold tracking-tight">{evt.label}</span>
                                    <Switch
                                        checked={metadata[evt.key] !== false}
                                        onCheckedChange={(c) => onSaveMetadata({ [evt.key]: c })}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
