'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
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
        <div className="space-y-3">
            {/* Data Governance */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                <Card className="bg-card border-border/50 transition-colors shadow-xs">
                    <CardHeader className="p-3 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                                <Database className="w-3.5 h-3.5 text-emerald-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xs font-bold text-white">Data Governance</CardTitle>
                                <CardDescription className="text-[10px] text-zinc-500">
                                    Storage and retention policies.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2.5 p-3 pt-2.5">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Retention Period</Label>
                            <div className="flex items-center justify-between gap-3 p-2 px-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2">
                                    <History className="w-3.5 h-3.5 text-zinc-500" />
                                    <span className="text-xs font-semibold text-white">Current: {localPrivacy.dataRetention} Days</span>
                                </div>
                                <Button variant="ghost" size="sm" className="rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold h-7 px-2.5" disabled>
                                    Adjust
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 p-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-emerald-500/20 rounded-md border border-emerald-500/30 shrink-0">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                </div>
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-semibold text-emerald-500">GDPR Compliance</Label>
                                    <p className="text-[10px] text-emerald-500/70">Enhanced privacy controls.</p>
                                </div>
                            </div>
                            <Switch
                                checked={localPrivacy.gdprCompliant}
                                onCheckedChange={(checked) => setLocalPrivacy(prev => ({ ...prev, gdprCompliant: checked }))}
                                className="scale-85 origin-right data-[state=checked]:bg-emerald-500"
                            />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Audit & Transparency */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
            >
                <Card className="bg-card border-border/50 transition-colors shadow-xs">
                    <CardHeader className="p-3 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-sky-500/10 rounded-md border border-sky-500/20">
                                <Eye className="w-3.5 h-3.5 text-sky-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xs font-bold text-white">Audit & Transparency</CardTitle>
                                <CardDescription className="text-[10px] text-zinc-500">
                                    Visibility and system logs.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2.5 p-3 pt-2.5">
                        <div className="flex items-center justify-between gap-3 p-2 px-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="space-y-0.5">
                                <Label className="text-xs font-semibold text-white">Activity Logging</Label>
                                <p className="text-[10px] text-zinc-500">Log user interactions for security.</p>
                            </div>
                            <Switch
                                checked={localPrivacy.activityLogging}
                                onCheckedChange={(checked) => setLocalPrivacy(prev => ({ ...prev, activityLogging: checked }))}
                                className="scale-85 origin-right data-[state=checked]:bg-sky-500"
                            />
                        </div>

                        <button
                            className="w-full rounded-lg border-2 border-dashed border-white/15 py-3 flex flex-col gap-1 items-center justify-center hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer"
                            onClick={() => toast.info("Exporting workspace data bundle...")}
                        >
                            <div className="flex items-center gap-1.5 text-primary">
                                <FileText className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Export Data Bundle</span>
                            </div>
                            <span className="text-[10px] text-zinc-500">Generate ZIP with all audit records</span>
                        </button>
                    </CardContent>
                    <CardFooter className="border-t border-white/5 p-2.5">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs h-8"
                        >
                            {saving ? "Deploying..." : "Update Privacy"}
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Updates propagate across all replicas in 24h
                </span>
            </div>
        </div>
    );
};
