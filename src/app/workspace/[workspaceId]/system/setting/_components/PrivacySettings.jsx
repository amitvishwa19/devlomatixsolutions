'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '../_provider/SettingProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ShieldCheck, FileText, Fingerprint, Trash2, Eye, ShieldAlert, Database, History } from 'lucide-react';

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
        <div className="space-y-6 animate-fade-in">
            {/* Data Governance */}
            <Card className="rounded-xl border border-border shadow-soft bg-card/100">
                <CardHeader>
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-2 border border-emerald-500/20">
                        <Database className="w-5 h-5 text-emerald-500" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">Data Governance</CardTitle>
                    <CardDescription className="text-sm font-medium opacity-70">
                        Manage how your workspace data is stored, retained, and archived.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-3">
                        <Label className="text-[10px] font-bold tracking-widest uppercase opacity-70">Data Retention Period (Days)</Label>
                        <div className="flex gap-4 items-center">
                            <History className="w-5 h-5 text-muted-foreground/40" />
                            <code className="text-[11px] font-black tracking-tight text-foreground flex-1">
                                PURGE ALL LOGS OLDER THAN {localPrivacy.dataRetention} DAYS
                            </code>
                            <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-bold tracking-widest h-8 px-4" disabled>
                                Adjust Policy
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-8 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <Label className="text-sm font-bold tracking-tight uppercase">GDPR Compliance Mode</Label>
                            </div>
                            <p className="text-[10px] text-emerald-600/60 font-medium">
                                Enable enhanced privacy controls and data processing agreements.
                            </p>
                        </div>
                        <Switch 
                            checked={localPrivacy.gdprCompliant}
                            onCheckedChange={(checked) => setLocalPrivacy(prev => ({ ...prev, gdprCompliant: checked }))}
                            className="data-[state=checked]:bg-emerald-600"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Audit & Transparency */}
            <Card className="rounded-xl border border-border shadow-soft bg-card/100">
                <CardHeader>
                    <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center mb-2 border border-sky-500/20">
                        <Eye className="w-5 h-5 text-sky-500" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">Audit & Transparency</CardTitle>
                    <CardDescription className="text-sm font-medium opacity-70">
                        Control the visibility of administrative actions and system logs.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-8 p-4 bg-muted/20 rounded-xl border border-border/40">
                        <div className="space-y-1">
                            <Label className="text-sm font-bold tracking-tight uppercase">Detailed Activity Logging</Label>
                            <p className="text-[10px] text-muted-foreground font-medium opacity-70 font-semibold italic">
                                Log every user interaction for security audit trails.
                            </p>
                        </div>
                        <Switch 
                            checked={localPrivacy.activityLogging}
                            onCheckedChange={(checked) => setLocalPrivacy(prev => ({ ...prev, activityLogging: checked }))}
                        />
                    </div>

                   <Button 
                        variant="outline" 
                        className="w-full rounded-xl border-dashed border-2 py-8 flex flex-col gap-1 items-center justify-center hover:bg-muted/50 transition-all opacity-80"
                        onClick={() => toast.info("Exporting workspace data bundle...")}
                    >
                        <div className="flex items-center gap-2 text-primary">
                            <FileText className="w-4 h-4" />
                            <span className="text-[10px] font-black tracking-widest uppercase">Export Workspace Data Bundle</span>
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground italic">Generate a ZIP file with all posts, comments, and settings</span>
                    </Button>
                </CardContent>
                <CardFooter className="border-t border-border/10 bg-muted/20 p-6 flex justify-end">
                    <Button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="rounded-xl font-bold px-8 shadow-soft bg-primary hover:bg-primary/90"
                    >
                        {saving ? "Deploying..." : "Update Privacy Policy"}
                    </Button>
                </CardFooter>
            </Card>

            <div className="flex items-center gap-2 px-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <p className="text-[10px] font-bold text-muted-foreground/60 tracking-widest uppercase">
                    Privacy updates may take up to 24 hours to propagate across all edge regions.
                </p>
            </div>
        </div>
    );
};
