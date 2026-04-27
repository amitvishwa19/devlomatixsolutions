'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ShieldCheck, FileText, Eye, ShieldAlert, Database, History } from 'lucide-react';
import { toast } from 'sonner';

export const PrivacySettings = () => {
    const { settings, updateSettings, saving } = useSettings();
    const [localPrivacy, setLocalPrivacy] = useState({
        dataRetention: 365,
        gdprCompliant: true,
        activityLogging: true
    });

    useEffect(() => {
        if (settings?.privacy) {
            setLocalPrivacy({
                dataRetention: settings.privacy.dataRetention || 365,
                gdprCompliant: settings.privacy.gdprCompliant !== undefined ? settings.privacy.gdprCompliant : true,
                activityLogging: settings.privacy.activityLogging !== undefined ? settings.privacy.activityLogging : true
            });
        }
    }, [settings]);

    const handleSave = () => {
        updateSettings({ privacy: localPrivacy });
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Data Governance */}
            <Card className="rounded-md border border-border/50 bg-transparent overflow-hidden">
                <CardHeader className="p-3 border-b border-border/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500/5 rounded-md flex items-center justify-center border border-emerald-500/10">
                            <Database className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold">Data Governance</CardTitle>
                            <CardDescription className="text-[10px] font-medium opacity-60">
                                Storage and retention policies.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                    <div className="grid gap-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5">Retention Period</Label>
                        <div className="flex gap-3 items-center p-2.5 rounded-md border border-border/50">
                            <History className="w-3.5 h-3.5 text-muted-foreground/40" />
                            <div className="flex-1">
                                <span className="text-[10px] font-bold uppercase tracking-tighter">Current: {localPrivacy.dataRetention} Days</span>
                            </div>
                            <Button variant="ghost" size="sm" className="rounded-md text-[9px] font-bold h-6 px-3 border border-border/50 hover:bg-primary/5" disabled>
                                Adjust
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 p-3 rounded-md border border-emerald-500/10 bg-emerald-500/[0.02]">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <Label className="text-xs font-bold text-emerald-700">GDPR Compliance</Label>
                            </div>
                            <p className="text-[10px] text-emerald-600/60 font-medium">Enhanced privacy controls.</p>
                        </div>
                        <Switch
                            checked={localPrivacy.gdprCompliant}
                            onCheckedChange={(checked) => setLocalPrivacy(prev => ({ ...prev, gdprCompliant: checked }))}
                            className="data-[state=checked]:bg-emerald-600 scale-90"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Audit & Transparency */}
            <Card className="rounded-md border border-border/50 bg-transparent overflow-hidden">
                <CardHeader className="p-3 border-b border-border/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-sky-500/5 rounded-md flex items-center justify-center border border-sky-500/10">
                            <Eye className="w-4 h-4 text-sky-500" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold">Audit & Transparency</CardTitle>
                            <CardDescription className="text-[10px] font-medium opacity-60">
                                Visibility and system logs.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-4 p-3 rounded-md border border-border/50 bg-muted/5">
                        <div className="space-y-0.5">
                            <Label className="text-xs font-bold">Activity Logging</Label>
                            <p className="text-[10px] text-muted-foreground font-medium opacity-60 leading-relaxed">
                                Log user interactions for security.
                            </p>
                        </div>
                        <Switch
                            checked={localPrivacy.activityLogging}
                            onCheckedChange={(checked) => setLocalPrivacy(prev => ({ ...prev, activityLogging: checked }))}
                            className="scale-90"
                        />
                    </div>

                    <Button
                        variant="ghost"
                        className="w-full rounded-md border border-dashed border-border/50 py-6 flex flex-col gap-1 items-center justify-center hover:bg-primary/5 transition-all group"
                        onClick={() => toast.info("Exporting workspace data bundle...")}
                    >
                        <div className="flex items-center gap-2 text-primary">
                            <FileText className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Export Data Bundle</span>
                        </div>
                        <span className="text-[9px] text-muted-foreground opacity-60">Generate ZIP with all records</span>
                    </Button>
                </CardContent>
                <CardFooter className="border-t border-border/10 p-3 flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        size="sm"
                        className="rounded-md font-bold px-4 bg-sky-600 hover:bg-sky-700 text-white text-[10px] h-8"
                    >
                        {saving ? "Deploying..." : "Update Privacy"}
                    </Button>
                </CardFooter>
            </Card>

            <div className="flex items-center gap-2 px-1">
                <ShieldAlert className="w-3 h-3 text-amber-500 opacity-60" />
                <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-tighter leading-none">
                    Updates propagate in 24h
                </p>
            </div>
        </div>
    );
};