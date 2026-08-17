'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Cpu, Terminal, Zap, Code, ShieldAlert, FlaskConical, Download, Upload } from 'lucide-react';

export const AdvancedSettings = () => {
    const { settings, updateSettings, saving } = useSettings();
    const [localAdvanced, setLocalAdvanced] = useState({
        maintenanceMode: false,
        customCss: ""
    });

    useEffect(() => {
        if (settings?.advanced) {
            setLocalAdvanced({
                maintenanceMode: settings.advanced.maintenanceMode || false,
                customCss: settings.advanced.customCss || ""
            });
        }
    }, [settings]);

    const handleToggle = (checked) => {
        setLocalAdvanced(prev => ({ ...prev, maintenanceMode: checked }));
    };

    const handleSave = () => {
        updateSettings({ advanced: localAdvanced });
    };

    return (
        <div className="space-y-3">
            {/* System Infrastructure */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                <Card className="bg-card border-border/50 transition-colors shadow-xs">
                    <CardHeader className="p-3 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-amber-500/10 rounded-md border border-amber-500/20">
                                <Cpu className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xs font-bold text-white">System Infrastructure</CardTitle>
                                <CardDescription className="text-[10px] text-zinc-500">
                                    Global technical behavior and states.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2 p-3 pt-2.5">
                        <div className="flex items-center justify-between gap-3 p-2.5 px-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-primary/10 rounded-md border border-primary/20 shrink-0">
                                    <Zap className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-semibold text-white">Instant Updates</Label>
                                    <p className="text-[10px] text-zinc-500">Real-time dashboard propagation via WebSockets.</p>
                                </div>
                            </div>
                            <Switch defaultChecked className="scale-85 origin-right data-[state=checked]:bg-primary" />
                        </div>

                        <div className="flex items-center justify-between gap-3 p-2.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-amber-500/20 rounded-md border border-amber-500/30 shrink-0">
                                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                                </div>
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-semibold text-amber-500">Maintenance Mode</Label>
                                    <p className="text-[10px] text-amber-500/70">Suspend user actions during maintenance.</p>
                                </div>
                            </div>
                            <Switch
                                checked={localAdvanced.maintenanceMode}
                                onCheckedChange={handleToggle}
                                className="scale-85 origin-right data-[state=checked]:bg-amber-500"
                            />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Code Injection & Data Portability Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Code Injection */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.05 }}
                >
                    <Card className="bg-card border-border/50 transition-colors shadow-xs h-full flex flex-col justify-between">
                        <CardHeader className="p-3 pb-2 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">
                                    <Code className="w-3.5 h-3.5 text-indigo-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-xs font-bold text-white">Code Injection</CardTitle>
                                    <CardDescription className="text-[10px] text-zinc-500">Custom CSS or styles.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-3 space-y-1.5">
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                                <Terminal className="w-3 h-3" /> Global CSS Stylesheet
                            </Label>
                            <Textarea
                                rows={3}
                                value={localAdvanced.customCss}
                                onChange={(e) => setLocalAdvanced(prev => ({ ...prev, customCss: e.target.value }))}
                                placeholder="/* Add custom CSS rules */"
                                className="bg-white/5 border-white/10 text-white font-mono text-xs resize-none p-2.5 rounded-lg min-h-[70px]"
                            />
                        </CardContent>
                        <CardFooter className="border-t border-white/5 p-2.5">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8"
                            >
                                {saving ? "Deploying..." : "Update Technical"}
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>

                {/* Data Portability */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                >
                    <Card className="bg-card border-border/50 transition-colors shadow-xs h-full flex flex-col justify-between">
                        <CardHeader className="p-3 pb-2 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-primary/10 rounded-md border border-primary/20">
                                    <Download className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xs font-bold text-white">Data Portability</CardTitle>
                                    <CardDescription className="text-[10px] text-zinc-500">Import or export workspace config.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-3 grid grid-cols-2 gap-2.5">
                            <button
                                className="h-16 rounded-lg bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-all flex flex-col gap-1 items-center justify-center cursor-pointer"
                            >
                                <Download className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Export JSON</span>
                            </button>
                            <button
                                className="h-16 rounded-lg bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-all flex flex-col gap-1 items-center justify-center cursor-pointer"
                            >
                                <Upload className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Import Config</span>
                            </button>
                        </CardContent>
                        <CardFooter className="border-t border-white/5 p-2.5">
                            <span className="text-[10px] text-zinc-500">Supported format: JSON v2.0 Schema</span>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>

            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex gap-2.5 items-center text-xs text-indigo-400">
                <FlaskConical className="w-4 h-4 shrink-0 text-indigo-500" />
                <div>
                    <span className="font-semibold uppercase tracking-wider text-[10px] block">Experimental Labs</span>
                    <span className="text-[10px] text-zinc-500">Beta features are launching in Q4 2026.</span>
                </div>
            </div>
        </div>
    );
};
