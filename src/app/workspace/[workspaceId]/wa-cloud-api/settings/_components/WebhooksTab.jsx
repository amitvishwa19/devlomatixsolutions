'use client';

import React, { useState, useEffect } from 'react';
import { 
    Link as LinkIcon, 
    Copy, 
    Info, 
    Eye, 
    EyeOff 
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

import { useAction } from "@/hooks/use-action";
import { updateWaMetadata } from "../_actions/update-wa-metadata";

export function WebhooksTab({ workspaceId, metadata, setMetadata }) {
    const [webhookUrl, setWebhookUrl] = useState('');
    const [showWebhookSecret, setShowWebhookSecret] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWebhookUrl(`${window.location.origin}/api/wa/webhook`);
        }
    }, []);

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

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="flex-1 space-y-6 outline-none custom-scrollbar overflow-y-auto">
            <div className="max-w-3xl space-y-6">
                <Card className="border shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/5 rounded-lg border border-primary/10">
                                <LinkIcon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                                <CardTitle className="text-base font-semibold">Webhook Configuration</CardTitle>
                                <CardDescription className="text-xs font-medium">Event Bridge</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-xs font-medium text-muted-foreground ml-1">Webhook Payload URL</Label>
                            <div className="flex gap-3">
                                <Input readOnly value={webhookUrl} className="bg-muted/5 h-11 text-xs font-mono border-border/40 rounded-xl px-4 text-foreground/80" />
                                <Button variant="outline" size="icon" className="h-11 w-11 shrink-0 rounded-xl border-border/40 hover:bg-muted/10" onClick={() => copyToClipboard(webhookUrl)}>
                                    <Copy size={16} />
                                </Button>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-medium ml-1 flex items-center gap-2">
                                <Info size={12} className="text-primary/60" />
                                Configure this URL in your Meta Developer Portal Webhooks section.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-medium text-muted-foreground ml-1">Verify Token</Label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Input
                                        type={showWebhookSecret ? "text" : "password"}
                                        value={metadata.webhookSecret || 'devlomatix_secret'}
                                        onChange={(e) => setMetadata({ ...metadata, webhookSecret: e.target.value })}
                                        onBlur={(e) => handleSaveMetadata({ webhookSecret: e.target.value })}
                                        className="bg-background h-11 text-xs font-mono border-border/40 rounded-xl px-4 pr-12"
                                    />
                                    <button
                                        onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showWebhookSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <Button variant="outline" size="icon" className="h-11 w-11 shrink-0 rounded-xl border-border/40 hover:bg-muted/10" onClick={() => copyToClipboard(metadata.webhookSecret || 'devlomatix_secret')}>
                                    <Copy size={16} />
                                </Button>
                            </div>
                        </div>

                        <Separator className="bg-border/20" />

                        <div className="space-y-4">
                            <Label className="text-xs font-medium text-muted-foreground ml-1">Event Subscriptions</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Message Events', key: 'hook_messages' },
                                    { label: 'Status Updates', key: 'hook_status' },
                                    { label: 'Delivery Reports', key: 'hook_delivery' },
                                    { label: 'Error Notifications', key: 'hook_errors' }
                                ].map((evt) => (
                                    <div key={evt.key} className="flex items-center justify-between p-4 bg-muted/5 border border-border/40 rounded-xl">
                                        <span className="text-xs font-semibold">{evt.label}</span>
                                        <Switch
                                            checked={metadata[evt.key] !== false}
                                            onCheckedChange={(c) => handleSaveMetadata({ [evt.key]: c })}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
