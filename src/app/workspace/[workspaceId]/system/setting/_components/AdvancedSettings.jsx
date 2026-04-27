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

    const cardClasses = "rounded-md border border-border/50 bg-transparent overflow-hidden hover:border-primary/20 transition-colors duration-300";

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* System Status Section */}
            <Card className={cardClasses}>
                <CardHeader className="p-3 border-b border-border/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-500/5 rounded-md flex items-center justify-center border border-amber-500/10">
                            <Cpu className="w-4 h-4 text-amber-500" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold">System Infrastructure</CardTitle>
                            <CardDescription className="text-[10px] font-medium opacity-60">
                                Global technical behavior and states.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-4 p-3 rounded-md border border-border/50 bg-muted/5">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5 text-primary" />
                                <Label className="text-xs font-bold">Instant Updates</Label>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium opacity-60 leading-relaxed">
                                Real-time dashboard propagation via WebSockets.
                            </p>
                        </div>
                        <Switch defaultChecked className="scale-90" />
                    </div>

                    <div className="flex items-center justify-between gap-4 p-3 rounded-md border border-amber-500/10 bg-amber-500/[0.02]">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                                <Label className="text-xs font-bold text-amber-700">Maintenance Mode</Label>
                            </div>
                            <p className="text-[10px] text-amber-600/60 font-medium">
                                Suspend all user actions during maintenance.
                            </p>
                        </div>
                        <Switch
                            checked={localAdvanced.maintenanceMode}
                            onCheckedChange={handleToggle}
                            className="data-[state=checked]:bg-amber-600 scale-90"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Custom Technical Injection */}
            <Card className={cardClasses}>
                <CardHeader className="p-3 border-b border-border/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-500/5 rounded-md flex items-center justify-center border border-indigo-500/10">
                            <Code className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold">Code Injection</CardTitle>
                            <CardDescription className="text-[10px] font-medium opacity-60">
                                Custom CSS or scripts for your workspace.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                    <div className="grid gap-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5 flex items-center gap-2">
                            <Terminal className="w-3 h-3" />
                            Global CSS Stylesheet
                        </Label>
                        <Textarea
                            rows={4}
                            value={localAdvanced.customCss}
                            onChange={(e) => setLocalAdvanced(prev => ({ ...prev, customCss: e.target.value }))}
                            placeholder="/* Add your custom CSS here */"
                            className="rounded-md border border-border/50 bg-transparent font-mono text-[10px] font-bold text-foreground resize-none p-3"
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t border-border/10 p-3 flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        size="sm"
                        className="rounded-md font-bold px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] h-8"
                    >
                        {saving ? "Deploying..." : "Update Technical"}
                    </Button>
                </CardFooter>
            </Card>

            {/* Data Portability */}
            <Card className={cardClasses}>
                <CardHeader className="p-3 border-b border-border/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/5 rounded-md flex items-center justify-center border border-primary/10">
                            <Download className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold">Data Portability</CardTitle>
                            <CardDescription className="text-[10px] font-medium opacity-60">
                                Import or export configuration settings.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 p-4">
                    <Button variant="ghost" className="h-16 rounded-md flex flex-col gap-1.5 border border-border/50 hover:bg-primary/5 transition-all">
                        <Download className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Export JSON</span>
                    </Button>
                    <Button variant="ghost" className="h-16 rounded-md flex flex-col gap-1.5 border border-border/50 hover:bg-primary/5 transition-all">
                        <Upload className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Import Config</span>
                    </Button>
                </CardContent>
            </Card>

            <div className="p-2.5 rounded-md border border-indigo-500/10 bg-indigo-500/[0.02] flex gap-3 items-center">
                <FlaskConical className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <div className="flex-1">
                    <p className="text-[10px] text-indigo-500/80 font-bold uppercase tracking-tighter">Experimental Labs</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Beta features are launching in Q4 2026.
                    </p>
                </div>
            </div>
        </div>
    );
};