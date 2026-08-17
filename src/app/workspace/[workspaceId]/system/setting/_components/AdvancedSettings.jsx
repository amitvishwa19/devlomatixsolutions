'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSettings } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Cpu, Terminal, Download, Upload, Zap, ShieldAlert, Code, CheckCircle, RotateCcw, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import { StickySaveBar } from './StickySaveBar';

export const AdvancedSettings = () => {
    const { settings, updateSettings, saving } = useSettings();
    const importInputRef = useRef(null);

    const [localAdvanced, setLocalAdvanced] = useState({
        customCss: '',
        maintenanceMode: false
    });

    useEffect(() => {
        if (settings?.advanced) {
            setLocalAdvanced({
                customCss: settings.advanced.customCss || '',
                maintenanceMode: settings.advanced.maintenanceMode || false
            });
        }
    }, [settings]);

    const isDirty = useMemo(() => {
        if (!settings) return false;
        return (
            localAdvanced.customCss !== (settings?.advanced?.customCss || '') ||
            localAdvanced.maintenanceMode !== (settings?.advanced?.maintenanceMode || false)
        );
    }, [localAdvanced, settings]);

    const handleSave = () => {
        updateSettings({
            advanced: localAdvanced
        });
        toast.success("Technical configuration deployed successfully");
    };

    const handleReset = () => {
        if (settings?.advanced) {
            setLocalAdvanced({
                customCss: settings.advanced.customCss || '',
                maintenanceMode: settings.advanced.maintenanceMode || false
            });
        }
    };

    const handleToggle = (checked) => {
        setLocalAdvanced(prev => ({
            ...prev,
            maintenanceMode: checked
        }));
    };

    // 1-Click JSON Export
    const handleExportConfig = () => {
        try {
            const configBundle = {
                version: "1.0.0",
                exportedAt: new Date().toISOString(),
                workspaceConfig: {
                    general: settings?.general || {},
                    branding: settings?.branding || {},
                    security: settings?.security || {},
                    notifications: settings?.notifications || {},
                    integrations: settings?.integrations || {},
                    advanced: localAdvanced,
                    privacy: settings?.privacy || {}
                }
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(configBundle, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `workspace-config-${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();

            toast.success("Workspace config exported as JSON snapshot!");
        } catch (e) {
            toast.error("Failed to export config: " + e.message);
        }
    };

    // 1-Click JSON Import / Rollback
    const handleImportConfig = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                const importedSettings = parsed.workspaceConfig || parsed;

                if (!importedSettings || typeof importedSettings !== 'object') {
                    throw new Error("Invalid configuration file format");
                }

                updateSettings(importedSettings);
                toast.success("Workspace configuration successfully restored from snapshot!");
            } catch (err) {
                console.error("Import error:", err);
                toast.error("Invalid JSON config file: " + err.message);
            } finally {
                if (importInputRef.current) importInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-3 relative pb-8">
            {/* System Infrastructure */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                <Card className="bg-card border-border/50 transition-colors shadow-xs">
                    <CardHeader className="p-3 pb-2 border-b border-border/40">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-amber-500/10 rounded-md border border-amber-500/20">
                                <Cpu className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xs font-bold text-foreground">System Infrastructure</CardTitle>
                                <CardDescription className="text-[10px] text-muted-foreground">
                                    Global technical behavior and states.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2 p-3 pt-2.5">
                        <div className="flex items-center justify-between gap-3 p-2.5 px-3 rounded-lg bg-secondary/30 border border-border/40">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-primary/10 rounded-md border border-primary/20 shrink-0">
                                    <Zap className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-semibold text-foreground">Instant Updates</Label>
                                    <p className="text-[10px] text-muted-foreground">Real-time dashboard propagation via WebSockets.</p>
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
                        <CardHeader className="p-3 pb-2 border-b border-border/40">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">
                                    <Code className="w-3.5 h-3.5 text-indigo-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-xs font-bold text-foreground">Code Injection</CardTitle>
                                    <CardDescription className="text-[10px] text-muted-foreground">Custom CSS stylesheet.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-3 space-y-1.5">
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Terminal className="w-3 h-3" /> Global CSS Stylesheet
                            </Label>
                            <Textarea
                                rows={3}
                                value={localAdvanced.customCss}
                                onChange={(e) => setLocalAdvanced(prev => ({ ...prev, customCss: e.target.value }))}
                                placeholder="/* Add custom CSS rules */"
                                className="bg-secondary/30 border-border/50 text-foreground font-mono text-xs resize-none p-2.5 rounded-lg min-h-[70px]"
                            />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Data Portability / 1-Click Backup & Restore */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                >
                    <Card className="bg-card border-border/50 transition-colors shadow-xs h-full flex flex-col justify-between">
                        <CardHeader className="p-3 pb-2 border-b border-border/40">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-primary/10 rounded-md border border-primary/20">
                                    <Download className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xs font-bold text-foreground">1-Click Config Backup</CardTitle>
                                    <CardDescription className="text-[10px] text-muted-foreground">Export snapshot & rollback.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-2 p-3 pt-2.5">
                            <Button
                                variant="outline"
                                onClick={handleExportConfig}
                                className="flex flex-col items-center justify-center h-16 rounded-lg border-border/50 hover:bg-secondary/40 gap-1.5 transition-all text-xs font-semibold"
                            >
                                <FileJson className="w-4 h-4 text-primary" />
                                <span>Export JSON</span>
                            </Button>

                            <input
                                type="file"
                                ref={importInputRef}
                                onChange={handleImportConfig}
                                accept=".json,application/json"
                                className="hidden"
                            />

                            <Button
                                variant="outline"
                                onClick={() => importInputRef.current?.click()}
                                className="flex flex-col items-center justify-center h-16 rounded-lg border-border/50 hover:bg-secondary/40 gap-1.5 transition-all text-xs font-semibold"
                            >
                                <Upload className="w-4 h-4 text-sky-500" />
                                <span>Import Snapshot</span>
                            </Button>
                        </CardContent>
                        <CardFooter className="border-t border-border/40 p-2.5">
                            <p className="text-[9px] text-muted-foreground text-center w-full">
                                Backups include branding, identity, rules, & security policies.
                            </p>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>

            {/* Sticky Save Bar */}
            <StickySaveBar
                isDirty={isDirty}
                saving={saving}
                onSave={handleSave}
                onReset={handleReset}
                label="Unsaved Technical Configuration"
            />
        </div>
    );
};
