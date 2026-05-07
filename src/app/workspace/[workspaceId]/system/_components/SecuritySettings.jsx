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
        <div className="space-y-3">
            <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-3 px-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-sky-500/10 rounded-lg border border-sky-500/20">
                            <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                        </div>
                        <div>
                            <CardTitle className="text-xs font-bold text-white">Security & Governance</CardTitle>
                            <CardDescription className="text-[10px] text-zinc-500">
                                Authentication requirements and policies.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-3 px-3">
                    <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20">
                                <Fingerprint className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-xs font-semibold text-white">Multi-Factor Authentication</Label>
                                <p className="text-[10px] text-zinc-500">Require TOTP/SMS for all team members.</p>
                            </div>
                        </div>
                        <Switch
                            disabled={saving}
                            checked={localSecurity.mfaEnabled}
                            onCheckedChange={handleToggleMFA}
                            className="data-[state=checked]:bg-sky-500 scale-90"
                        />
                    </div>

                    <div className="grid gap-2">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Session Idle Timeout</Label>
                            <div className="flex gap-2 items-center p-2 rounded-lg bg-white/5 border border-white/10">
                                <History className="w-3.5 h-3.5 text-zinc-500" />
                                <div className="flex-1">
                                    <span className="text-xs font-semibold text-white">Current Policy</span>
                                    <p className="text-[10px] text-zinc-500">{Math.floor(localSecurity.sessionTimeout / 60)} minutes</p>
                                </div>
                                <Button variant="ghost" size="sm" className="rounded-lg bg-white/5 border border-white/10 text-[10px] font-semibold h-7 px-2" disabled>
                                    Adjust
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Password Strength</Label>
                            <div className="flex gap-2 items-center p-2 rounded-lg bg-white/5 border border-white/10">
                                <Lock className="w-3.5 h-3.5 text-zinc-500" />
                                <div className="flex-1">
                                    <span className="text-xs font-semibold text-white">Current Level</span>
                                    <p className="text-[10px] text-zinc-500 uppercase">{localSecurity.passwordPolicy}</p>
                                </div>
                                <Button variant="ghost" size="sm" className="rounded-lg bg-white/5 border border-white/10 text-[10px] font-semibold h-7 px-2" disabled>
                                    Change
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t border-white/5 pt-3 px-3">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs h-8"
                    >
                        {saving ? "Saving..." : "Update Security"}
                    </Button>
                </CardFooter>
            </Card>

            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex gap-2 items-center">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <p className="text-[10px] text-zinc-400">
                    Changing security policies will notify all administrators.
                </p>
            </div>
        </div>
    );
};
