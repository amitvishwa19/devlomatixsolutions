'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/providers/WorkspaceProvider';
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
        <div className="space-y-4 animate-in fade-in duration-500">
            <Card className="rounded-md border border-border/50 bg-transparent overflow-hidden hover:border-primary/20 transition-colors duration-300">
                <CardHeader className="p-3 border-b border-border/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-sky-500/5 rounded-md flex items-center justify-center border border-sky-500/10">
                            <ShieldCheck className="w-4 h-4 text-sky-500" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold">Security & Governance</CardTitle>
                            <CardDescription className="text-[10px] font-medium opacity-60">
                                Authentication requirements and policies.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                    <div className="flex items-center justify-between gap-4 p-3 rounded-md border border-border/50 bg-muted/5">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <Fingerprint className="w-3.5 h-3.5 text-primary" />
                                <Label className="text-xs font-bold">Multi-Factor Authentication</Label>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium opacity-70 leading-relaxed">
                                Require TOTP/SMS for all team members.
                            </p>
                        </div>
                        <Switch
                            disabled={saving}
                            checked={localSecurity.mfaEnabled}
                            onCheckedChange={handleToggleMFA}
                            className="scale-90"
                        />
                    </div>

                    <div className="grid gap-4">
                        <div className="grid gap-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5">Session Idle Timeout</Label>
                            <div className="flex gap-3 items-center p-2.5 rounded-md border border-border/50">
                                <History className="w-3.5 h-3.5 text-muted-foreground/40" />
                                <div className="flex-1 flex flex-col">
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">Current Policy</span>
                                    <span className="text-[9px] font-medium text-muted-foreground">{Math.floor(localSecurity.sessionTimeout / 60)} minutes</span>
                                </div>
                                <Button variant="ghost" size="sm" className="rounded-md text-[9px] font-bold h-6 px-3 border border-border/50 hover:bg-primary/5" disabled>
                                    Adjust
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5">Password Strength</Label>
                            <div className="flex gap-3 items-center p-2.5 rounded-md border border-border/50">
                                <Lock className="w-3.5 h-3.5 text-muted-foreground/40" />
                                <div className="flex-1 flex flex-col">
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">Current Level</span>
                                    <span className="text-[9px] font-medium text-muted-foreground uppercase">{localSecurity.passwordPolicy}</span>
                                </div>
                                <Button variant="ghost" size="sm" className="rounded-md text-[9px] font-bold h-6 px-3 border border-border/50 hover:bg-primary/5" disabled>
                                    Change
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t border-border/10 p-3 flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        size="sm"
                        className="rounded-md font-bold px-4 bg-sky-600 hover:bg-sky-700 text-white text-[10px] h-8"
                    >
                        {saving ? "Saving..." : "Update Security"}
                    </Button>
                </CardFooter>
            </Card>

            <div className="p-2.5 rounded-md border border-amber-500/10 bg-amber-500/[0.02] flex gap-2.5 items-start">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Changing security policies will notify all administrators.
                </p>
            </div>
        </div>
    );
};