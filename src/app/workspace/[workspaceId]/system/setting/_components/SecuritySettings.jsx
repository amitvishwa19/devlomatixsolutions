'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
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
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                <Card className="bg-card border-border/50 transition-colors shadow-xs">
                    <CardHeader className="p-3 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-sky-500/10 rounded-md border border-sky-500/20">
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
                    <CardContent className="space-y-2.5 p-3 pt-2.5">
                        {/* MFA Toggle */}
                        <div className="flex items-center justify-between gap-3 p-2.5 px-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-primary/10 rounded-md border border-primary/20 shrink-0">
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
                                className="scale-85 origin-right data-[state=checked]:bg-sky-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {/* Session Timeout */}
                            <div className="space-y-1">
                                <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Session Idle Timeout</Label>
                                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-2">
                                        <History className="w-3.5 h-3.5 text-zinc-500" />
                                        <div>
                                            <span className="text-xs font-semibold text-white block">Current Policy</span>
                                            <p className="text-[10px] text-zinc-500">{Math.floor(localSecurity.sessionTimeout / 60)} minutes</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold h-7 px-2.5" disabled>
                                        Adjust
                                    </Button>
                                </div>
                            </div>

                            {/* Password Strength */}
                            <div className="space-y-1">
                                <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Password Strength</Label>
                                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-2">
                                        <Lock className="w-3.5 h-3.5 text-zinc-500" />
                                        <div>
                                            <span className="text-xs font-semibold text-white block">Current Level</span>
                                            <p className="text-[10px] text-zinc-500 uppercase">{localSecurity.passwordPolicy}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold h-7 px-2.5" disabled>
                                        Change
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t border-white/5 p-2.5">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs h-8"
                        >
                            {saving ? "Saving..." : "Update Security"}
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>

            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex gap-2 items-center text-xs text-zinc-400">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Changing security policies will notify all workspace administrators.</span>
            </div>
        </div>
    );
};
