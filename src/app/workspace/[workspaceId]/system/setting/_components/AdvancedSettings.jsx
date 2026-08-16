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
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="bg-card border-white/10 backdrop-blur-xl hover:border-amber-500/30 transition-colors">
                    <CardHeader className="pb-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                <Cpu className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold text-white">System Infrastructure</CardTitle>
                                <CardDescription className="text-xs text-zinc-500">
                                    Global technical behavior and states.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <motion.div
                            className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                            whileHover={{ x: 4 }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/20">
                                    <Zap className="w-5 h-5 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-semibold text-white">Instant Updates</Label>
                                    <p className="text-xs text-zinc-500">Real-time dashboard propagation via WebSockets.</p>
                                </div>
                            </div>
                            <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                        </motion.div>

                        <motion.div
                            className="flex items-center justify-between gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
                            whileHover={{ x: 4 }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-500/20 rounded-lg border border-amber-500/30">
                                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                                </div>
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-semibold text-amber-500">Maintenance Mode</Label>
                                    <p className="text-xs text-amber-500/70">Suspend all user actions during maintenance.</p>
                                </div>
                            </div>
                            <Switch
                                checked={localAdvanced.maintenanceMode}
                                onCheckedChange={handleToggle}
                                className="data-[state=checked]:bg-amber-500"
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
                <Card className="bg-card border-white/10 backdrop-blur-xl hover:border-indigo-500/30 transition-colors">
                    <CardHeader className="pb-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                <Code className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold text-white">Code Injection</CardTitle>
                                <CardDescription className="text-xs text-zinc-500">
                                    Custom CSS or scripts for your workspace.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                                <Terminal className="w-4 h-4" />
                                Global CSS Stylesheet
                            </Label>
                            <Textarea
                                rows={4}
                                value={localAdvanced.customCss}
                                onChange={(e) => setLocalAdvanced(prev => ({ ...prev, customCss: e.target.value }))}
                                placeholder="/* Add your custom CSS here */"
                                className="bg-white/5 border-white/10 text-white font-mono text-sm resize-none p-4 rounded-xl"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t border-white/5 pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11"
                        >
                            {saving ? "Deploying..." : "Update Technical"}
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <Card className="bg-card border-white/10 backdrop-blur-xl hover:border-primary/30 transition-colors">
                    <CardHeader className="pb-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/20">
                                <Download className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold text-white">Data Portability</CardTitle>
                                <CardDescription className="text-xs text-zinc-500">
                                    Import or export configuration settings.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 pt-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="h-20 rounded-xl bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-all flex flex-col gap-2 items-center justify-center"
                        >
                            <Download className="w-5 h-5 text-primary" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Export JSON</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="h-20 rounded-xl bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-all flex flex-col gap-2 items-center justify-center"
                        >
                            <Upload className="w-5 h-5 text-primary" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Import Config</span>
                        </motion.button>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex gap-4 items-center"
            >
                <FlaskConical className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                    <p className="text-sm text-indigo-500 font-semibold uppercase tracking-wider">Experimental Labs</p>
                    <p className="text-xs text-zinc-500">Beta features are launching in Q4 2026.</p>
                </div>
            </motion.div>
        </div>
    );
};
