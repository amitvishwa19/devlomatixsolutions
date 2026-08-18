'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSettings } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Fingerprint, ShieldAlert, History } from 'lucide-react';
import { toast } from 'sonner';
import { StickySaveBar } from './StickySaveBar';

export const SecuritySettings = () => {
    const { settings, updateSettings, saving } = useSettings();
    const [localSecurity, setLocalSecurity] = useState({
        mfaEnabled: false,
        sessionTimeout: 3600,
        passwordPolicy: "standard"
    });

    useEffect(() => {
        if (settings?.security) {
            setLocalSecurity({
                mfaEnabled: settings.security.mfaEnabled || false,
                sessionTimeout: settings.security.sessionTimeout || 3600,
                passwordPolicy: settings.security.passwordPolicy || "standard"
            });
        }
    }, [settings]);

    const isDirty = useMemo(() => {
        if (!settings) return false;
        return (
            localSecurity.mfaEnabled !== (settings?.security?.mfaEnabled || false) ||
            localSecurity.sessionTimeout !== (settings?.security?.sessionTimeout || 3600) ||
            localSecurity.passwordPolicy !== (settings?.security?.passwordPolicy || "standard")
        );
    }, [localSecurity, settings]);

    const handleToggleMFA = (checked) => {
        setLocalSecurity(prev => ({ ...prev, mfaEnabled: checked }));
    };

    const handleSave = () => {
        updateSettings({ security: localSecurity });
        toast.success("Security policies successfully updated");
    };

    const handleReset = () => {
        if (settings?.security) {
            setLocalSecurity({
                mfaEnabled: settings.security.mfaEnabled || false,
                sessionTimeout: settings.security.sessionTimeout || 3600,
                passwordPolicy: settings.security.passwordPolicy || "standard"
            });
        }
    };

    return (
        <div className="space-y-3 relative pb-8">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                <Card className="bg-card border-border/80 transition-colors shadow-xs">
                    <CardHeader className="py-0 px-3 border-b border-border/40 space-y-0">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-sky-500/10 rounded-md border border-sky-500/20">
                                <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xs font-bold text-foreground leading-tight">Security & Governance</CardTitle>
                                <CardDescription className="text-[10px] text-muted-foreground leading-none">
                                    Authentication requirements and policies.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2.5 p-3 pt-2.5">
                        {/* MFA Toggle */}
                        <div className="flex items-center justify-between gap-3 p-2.5 px-3 rounded-lg bg-secondary/30 border border-border/40">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-primary/10 rounded-md border border-primary/20 shrink-0">
                                    <Fingerprint className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-semibold text-foreground">Multi-Factor Authentication</Label>
                                    <p className="text-[10px] text-muted-foreground">Require TOTP/SMS for all team members.</p>
                                </div>
                            </div>
                            <Switch
                                disabled={saving}
                                checked={localSecurity.mfaEnabled}
                                onCheckedChange={handleToggleMFA}
                                className="scale-85 origin-right data-[state=checked]:bg-sky-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {/* Session Timeout */}
                            <div className="space-y-1">
                                <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Session Idle Timeout</Label>
                                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-secondary/30 border border-border/40">
                                    <div className="flex items-center gap-2">
                                        <History className="w-3.5 h-3.5 text-muted-foreground" />
                                        <div>
                                            <span className="text-xs font-semibold text-foreground block">Current Policy</span>
                                            <p className="text-[10px] text-muted-foreground">{Math.floor(localSecurity.sessionTimeout / 60)} minutes</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="rounded-md bg-background border border-border/50 text-[10px] font-semibold h-7 px-2.5" disabled>
                                        Adjust
                                    </Button>
                                </div>
                            </div>

                            {/* Password Strength */}
                            <div className="space-y-1">
                                <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Password Strength</Label>
                                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-secondary/30 border border-border/40">
                                    <div className="flex items-center gap-2">
                                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                                        <div>
                                            <span className="text-xs font-semibold text-foreground block">Current Level</span>
                                            <p className="text-[10px] text-muted-foreground uppercase">{localSecurity.passwordPolicy}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="rounded-md bg-background border border-border/50 text-[10px] font-semibold h-7 px-2.5" disabled>
                                        Change
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Sticky Save Bar */}
            <StickySaveBar
                isDirty={isDirty}
                saving={saving}
                onSave={handleSave}
                onReset={handleReset}
                label="Unsaved Security Policy Changes"
            />
        </div>
    );
};
