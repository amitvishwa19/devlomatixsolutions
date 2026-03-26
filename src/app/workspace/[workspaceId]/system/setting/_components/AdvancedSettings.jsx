'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '../_provider/SettingProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Cpu, Terminal, Zap, Code, ShieldAlert, FlaskConical, CalendarClock } from 'lucide-react';

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
        <div className="space-y-6 animate-fade-in">
            {/* System Status Section */}
            <Card className="rounded-xl border border-border shadow-soft bg-card/100">
                <CardHeader>
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center mb-2 border border-amber-500/20">
                        <Cpu className="w-5 h-5 text-amber-500" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">System Infrastructure</CardTitle>
                    <CardDescription className="text-sm font-medium opacity-70">
                        Manage system-wide states and technical behavior.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between gap-8 p-4 bg-muted/20 rounded-xl border border-border/40">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-primary" />
                                <Label className="text-sm font-bold tracking-tight uppercase">Instant Updates</Label>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium opacity-70">
                                Use WebSockets for real-time dashboard propagation.
                            </p>
                        </div>
                        <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                    </div>

                    <div className="flex items-center justify-between gap-8 p-4 bg-amber-500/5 rounded-xl border border-amber-500/10 opacity-80">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-amber-600" />
                                <Label className="text-sm font-bold tracking-tight uppercase text-amber-700">Maintenance Window</Label>
                            </div>
                            <p className="text-[10px] text-amber-600/60 font-medium italic">
                                Prevent all user actions during scheduled system maintenance.
                            </p>
                        </div>
                        <Switch 
                            checked={localAdvanced.maintenanceMode}
                            onCheckedChange={handleToggle}
                            className="data-[state=checked]:bg-amber-600"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Custom Technical Injection */}
            <Card className="rounded-xl border border-border shadow-soft bg-card/100">
                <CardHeader>
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-2 border border-indigo-500/20">
                        <Code className="w-5 h-5 text-indigo-500" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">Code Injection</CardTitle>
                    <CardDescription className="text-sm font-medium opacity-70">
                        Inject custom CSS or scripts into your workspace frontend.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3">
                        <Label className="text-[10px] font-bold tracking-widest uppercase opacity-70 flex items-center gap-2">
                            <Terminal className="w-3 h-3" />
                            Global CSS Stylesheet
                        </Label>
                        <Textarea 
                            value={localAdvanced.customCss}
                            onChange={(e) => setLocalAdvanced(prev => ({ ...prev, customCss: e.target.value }))}
                            placeholder="/* Add your custom CSS here */"
                            className="rounded-xl border border-border min-h-[150px] bg-background shadow-inner font-mono text-[11px] font-bold text-foreground resize-none p-4"
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t border-border/10 bg-muted/20 p-6 flex justify-end">
                    <Button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="rounded-xl font-bold px-8 shadow-soft bg-primary hover:bg-primary/90"
                    >
                        {saving ? "Deploying..." : "Update Technical Settings"}
                    </Button>
                </CardFooter>
            </Card>

            {/* Lab Features */}
            <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex gap-4 items-center">
                <div className="p-2 bg-indigo-500/10 rounded-xl">
                    <FlaskConical className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex-1">
                    <p className="text-[10px] font-black text-indigo-600 tracking-widest uppercase">Experimental Labs</p>
                    <p className="text-[11px] text-indigo-500/70 font-medium">
                        Enable early-access features that are currently in beta testing.
                    </p>
                </div>
                <Button variant="ghost" size="sm" className="rounded-xl text-[10px] font-bold text-indigo-500 hover:bg-indigo-500/10 bg-transparent">
                    LEARN MORE
                </Button>
            </div>
        </div>
    );
};
