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
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="bg-card border-white/10 backdrop-blur-xl hover:border-sky-500/30 transition-colors">
                    <CardHeader className="pb-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-sky-500/10 rounded-lg border border-sky-500/20">
                                <ShieldCheck className="w-5 h-5 text-sky-500" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold text-white">Security & Governance</CardTitle>
                                <CardDescription className="text-xs text-zinc-500">
                                    Authentication requirements and policies.
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
                                    <Fingerprint className="w-5 h-5 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-semibold text-white">Multi-Factor Authentication</Label>
                                    <p className="text-xs text-zinc-500">Require TOTP/SMS for all team members.</p>
                                </div>
                            </div>
                            <Switch
                                disabled={saving}
                                checked={localSecurity.mfaEnabled}
                                onCheckedChange={handleToggleMFA}
                                className="data-[state=checked]:bg-sky-500"
                            />
                        </motion.div>

                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Session Idle Timeout</Label>
                                <motion.div
                                    className="flex gap-4 items-center p-4 rounded-xl bg-white/5 border border-white/10"
                                    whileHover={{ x: 4 }}
                                >
                                    <History className="w-5 h-5 text-zinc-500" />
                                    <div className="flex-1">
                                        <span className="text-sm font-semibold text-white">Current Policy</span>
                                        <p className="text-xs text-zinc-500">{Math.floor(localSecurity.sessionTimeout / 60)} minutes</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="rounded-lg bg-white/5 border border-white/10 text-xs font-semibold h-9 px-4" disabled>
                                        Adjust
                                    </Button>
                                </motion.div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Password Strength</Label>
                                <motion.div
                                    className="flex gap-4 items-center p-4 rounded-xl bg-white/5 border border-white/10"
                                    whileHover={{ x: 4 }}
                                >
                                    <Lock className="w-5 h-5 text-zinc-500" />
                                    <div className="flex-1">
                                        <span className="text-sm font-semibold text-white">Current Level</span>
                                        <p className="text-xs text-zinc-500 uppercase">{localSecurity.passwordPolicy}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="rounded-lg bg-white/5 border border-white/10 text-xs font-semibold h-9 px-4" disabled>
                                        Change
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t border-white/5 pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold h-11"
                        >
                            {saving ? "Saving..." : "Update Security"}
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3 items-center"
            >
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-sm text-zinc-400">
                    Changing security policies will notify all administrators.
                </p>
            </motion.div>
        </div>
    );
};
