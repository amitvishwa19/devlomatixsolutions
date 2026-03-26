'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '../_provider/SettingProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Lock, Fingerprint, ShieldAlert, History } from 'lucide-react';

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

    const handleToggleMFA = (checked) => {
        setLocalSecurity(prev => ({ ...prev, mfaEnabled: checked }));
    };

    const handleSave = () => {
        updateSettings({ security: localSecurity });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <Card className="rounded-xl border border-border shadow-soft bg-card/100">
                <CardHeader>
                    <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center mb-2 border border-sky-500/20">
                        <ShieldCheck className="w-5 h-5 text-sky-500" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">Security & Governance</CardTitle>
                    <CardDescription className="text-sm font-medium opacity-70">
                        Manage your workspace security policies and authentication requirements.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="flex items-center justify-between gap-8 p-4 bg-muted/20 rounded-xl border border-border/40">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Fingerprint className="w-4 h-4 text-primary" />
                                <Label className="text-sm font-bold tracking-tight uppercase">Multi-Factor Authentication</Label>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium opacity-70">
                                Require users to verify their identity with a second factor (TOTP or SMS).
                            </p>
                        </div>
                        <Switch 
                            disabled={saving}
                            checked={localSecurity.mfaEnabled}
                            onCheckedChange={handleToggleMFA}
                            className="data-[state=checked]:bg-primary"
                        />
                    </div>

                    <div className="grid gap-6">
                        <div className="grid gap-3">
                            <Label className="text-[10px] font-bold tracking-widest uppercase opacity-70">Session Idle Timeout</Label>
                            <div className="flex gap-4 items-center">
                                <History className="w-5 h-5 text-muted-foreground/40" />
                                <code className="text-[11px] font-black tracking-tight text-foreground flex-1">
                                    CURRENTLY SET TO: {Math.floor(localSecurity.sessionTimeout / 60)} MINUTES
                                </code>
                                <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-bold tracking-widest h-8" disabled>
                                    Adjust Policy
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <Label className="text-[10px] font-bold tracking-widest uppercase opacity-70">Password Strength Policy</Label>
                            <div className="flex gap-4 items-center">
                                <Lock className="w-5 h-5 text-muted-foreground/40" />
                                <code className="text-[11px] font-black tracking-tight text-foreground flex-1 uppercase">
                                    {localSecurity.passwordPolicy}
                                </code>
                                <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-bold tracking-widest h-8" disabled>
                                    Change Level
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t border-border/10 bg-muted/20 p-6 flex justify-end">
                    <Button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="rounded-xl font-bold px-8 shadow-soft bg-primary hover:bg-primary/90"
                    >
                        {saving ? "Saving..." : "Update Security"}
                    </Button>
                </CardFooter>
            </Card>

            <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/10 flex gap-4 items-start shadow-inner">
                <div className="p-2 bg-amber-500/10 rounded-xl mt-0.5">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                </div>
                <div className="space-y-1">
                    <p className="text-[11px] font-bold text-amber-600 tracking-wide uppercase">Critical Action Logged</p>
                    <p className="text-xs text-amber-500/80 font-medium">
                        Disabling authentication requirements will trigger an alert to all workspace administrators.
                    </p>
                </div>
            </div>
        </div>
    );
};
