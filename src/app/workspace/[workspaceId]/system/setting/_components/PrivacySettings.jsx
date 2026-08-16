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
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="bg-card border-white/10 backdrop-blur-xl hover:border-emerald-500/30 transition-colors">
                    <CardHeader className="pb-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <Database className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold text-white">Data Governance</CardTitle>
                                <CardDescription className="text-xs text-zinc-500">
                                    Storage and retention policies.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Retention Period</Label>
                            <motion.div
                                className="flex gap-4 items-center p-4 rounded-xl bg-white/5 border border-white/10"
                                whileHover={{ x: 4 }}
                            >
                                <History className="w-5 h-5 text-zinc-500" />
                                <div className="flex-1">
                                    <span className="text-sm font-semibold text-white uppercase tracking-tight">Current: {localPrivacy.dataRetention} Days</span>
                                </div>
                                <Button variant="ghost" size="sm" className="rounded-lg bg-white/5 border border-white/10 text-xs font-semibold h-9 px-4" disabled>
                                    Adjust
                                </Button>
                            </motion.div>
                        </div>

                        <motion.div
                            className="flex items-center justify-between gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                            whileHover={{ x: 4 }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-semibold text-emerald-500">GDPR Compliance</Label>
                                    <p className="text-xs text-emerald-500/70">Enhanced privacy controls.</p>
                                </div>
                            </div>
                            <Switch
                                checked={localPrivacy.gdprCompliant}
                                onCheckedChange={(checked) => setLocalPrivacy(prev => ({ ...prev, gdprCompliant: checked }))}
                                className="data-[state=checked]:bg-emerald-500"
                            />
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <Card className="bg-card border-white/10 backdrop-blur-xl hover:border-sky-500/30 transition-colors">
                    <CardHeader className="pb-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-sky-500/10 rounded-lg border border-sky-500/20">
                                <Eye className="w-5 h-5 text-sky-500" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold text-white">Audit & Transparency</CardTitle>
                                <CardDescription className="text-xs text-zinc-500">
                                    Visibility and system logs.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <motion.div
                            className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                            whileHover={{ x: 4 }}
                        >
                            <div className="space-y-0.5">
                                <Label className="text-sm font-semibold text-white">Activity Logging</Label>
                                <p className="text-xs text-zinc-500">Log user interactions for security.</p>
                            </div>
                            <Switch
                                checked={localPrivacy.activityLogging}
                                onCheckedChange={(checked) => setLocalPrivacy(prev => ({ ...prev, activityLogging: checked }))}
                                className="data-[state=checked]:bg-sky-500"
                            />
                        </motion.div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full rounded-xl border-2 border-dashed border-white/20 py-8 flex flex-col gap-2 items-center justify-center hover:bg-primary/5 hover:border-primary/30 transition-all"
                            onClick={() => toast.info("Exporting workspace data bundle...")}
                        >
                            <div className="flex items-center gap-2 text-primary">
                                <FileText className="w-5 h-5" />
                                <span className="text-sm font-semibold uppercase tracking-widest">Export Data Bundle</span>
                            </div>
                            <span className="text-xs text-zinc-500">Generate ZIP with all records</span>
                        </motion.button>
                    </CardContent>
                    <CardFooter className="border-t border-white/5 pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold h-11"
                        >
                            {saving ? "Deploying..." : "Update Privacy"}
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
            >
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider">
                    Updates propagate in 24h
                </p>
            </motion.div>
        </div>
    );
};
