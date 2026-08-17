'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
            <Card className="bg-card border-border/50">
                <CardHeader className="pb-3 px-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
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
                <CardContent className="space-y-2 pt-3 px-3">
                    <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20">
                                <Zap className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-xs font-semibold text-white">Instant Updates</Label>
                                <p className="text-[10px] text-zinc-500">Real-time dashboard propagation via WebSockets.</p>
                            </div>
                        </div>
                        <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                    </div>

                    <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-amber-500/20 rounded-lg border border-amber-500/30">
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-xs font-semibold text-amber-500">Maintenance Mode</Label>
                                <p className="text-[10px] text-amber-500/70">Suspend all user actions during maintenance.</p>
                            </div>
                        </div>
                        <Switch
                            checked={localAdvanced.maintenanceMode}
                            onCheckedChange={handleToggle}
                            className="data-[state=checked]:bg-amber-500"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
                <CardHeader className="pb-3 px-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                            <Code className="w-3.5 h-3.5 text-indigo-500" />
                        </div>
                        <div>
                            <CardTitle className="text-xs font-bold text-white">Code Injection</CardTitle>
                            <CardDescription className="text-[10px] text-zinc-500">
                                Custom CSS or scripts for your workspace.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-3 px-3">
                    <div className="space-y-1">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                            <Terminal className="w-3 h-3" />
                            Global CSS Stylesheet
                        </Label>
                        <Textarea
                            rows={3}
                            value={localAdvanced.customCss}
                            onChange={(e) => setLocalAdvanced(prev => ({ ...prev, customCss: e.target.value }))}
                            placeholder="/* Add your custom CSS here */"
                            className="bg-white/5 border-white/10 text-white font-mono text-xs resize-none p-2.5 rounded-lg"
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t border-white/5 pt-3 px-3">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-8"
                    >
                        {saving ? "Deploying..." : "Update Technical"}
                    </Button>
                </CardFooter>
            </Card>

            <Card className="bg-card border-border/50">
                <CardHeader className="pb-3 px-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20">
                            <Download className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xs font-bold text-white">Data Portability</CardTitle>
                            <CardDescription className="text-[10px] text-zinc-500">
                                Import or export configuration settings.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2 pt-3 px-3">
                    <button className="h-14 rounded-lg bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-all flex flex-col gap-1 items-center justify-center">
                        <Download className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Export JSON</span>
                    </button>
                    <button className="h-14 rounded-lg bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-all flex flex-col gap-1 items-center justify-center">
                        <Upload className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Import Config</span>
                    </button>
                </CardContent>
            </Card>

            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex gap-3 items-center">
                <FlaskConical className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                    <p className="text-[10px] text-indigo-500 font-semibold uppercase tracking-wider">Experimental Labs</p>
                    <p className="text-[10px] text-zinc-500">Beta features are launching in Q4 2026.</p>
                </div>
            </div>
        </div>
    );
};
