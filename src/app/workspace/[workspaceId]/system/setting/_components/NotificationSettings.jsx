'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BellRing, Mail, MessageSquare, Monitor, CheckCircle2 } from 'lucide-react';

export const NotificationSettings = () => {
    const { settings, updateSettings, saving } = useSettings();
    const [localNotifications, setLocalNotifications] = useState({
        whatsapp: true,
        email: true,
        push: false
    });

    useEffect(() => {
        if (settings?.notifications) {
            setLocalNotifications({
                whatsapp: settings.notifications.whatsapp || false,
                email: settings.notifications.email || false,
                push: settings.notifications.push || false
            });
        }
    }, [settings]);

    const handleToggle = (key, checked) => {
        setLocalNotifications(prev => ({ ...prev, [key]: checked }));
    };

    const handleSave = () => {
        updateSettings({ notifications: localNotifications });
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <Card className="rounded-md border border-border/50 bg-transparent overflow-hidden hover:border-primary/20 transition-colors duration-300">
                <CardHeader className="p-3 border-b border-border/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-500/5 rounded-md flex items-center justify-center border border-rose-500/10">
                            <BellRing className="w-4 h-4 text-rose-500" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold">Notification Channels</CardTitle>
                            <CardDescription className="text-[10px] font-medium opacity-60">
                                Team alert preferences.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2 p-3">
                    {/* WhatsApp */}
                    <div className="flex items-center justify-between gap-4 p-2.5 rounded-md border border-border/50 bg-muted/5">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-emerald-500/5 rounded flex items-center justify-center border border-emerald-500/10">
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-xs font-bold">WhatsApp Alerts</Label>
                                <p className="text-[9px] text-muted-foreground font-medium opacity-60">Critical notifications.</p>
                            </div>
                        </div>
                        <Switch
                            disabled={saving}
                            checked={localNotifications.whatsapp}
                            onCheckedChange={(checked) => handleToggle('whatsapp', checked)}
                            className="data-[state=checked]:bg-emerald-500 scale-90"
                        />
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between gap-4 p-2.5 rounded-md border border-border/50 bg-muted/5">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-blue-500/5 rounded flex items-center justify-center border border-blue-500/10">
                                <Mail className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-xs font-bold">Email Digest</Label>
                                <p className="text-[9px] text-muted-foreground font-medium opacity-60">Activity summaries.</p>
                            </div>
                        </div>
                        <Switch
                            disabled={saving}
                            checked={localNotifications.email}
                            onCheckedChange={(checked) => handleToggle('email', checked)}
                            className="data-[state=checked]:bg-blue-500 scale-90"
                        />
                    </div>

                    {/* Desktop Push */}
                    <div className="flex items-center justify-between gap-4 p-2.5 rounded-md border border-border/50 bg-muted/5">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-muted rounded flex items-center justify-center border border-border/10">
                                <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-xs font-bold">Desktop Push</Label>
                                <p className="text-[9px] text-muted-foreground font-medium opacity-60">Browser alerts.</p>
                            </div>
                        </div>
                        <Switch
                            disabled={saving}
                            checked={localNotifications.push}
                            onCheckedChange={(checked) => handleToggle('push', checked)}
                            className="scale-90"
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t border-border/10 p-3 flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        size="sm"
                        className="rounded-md font-bold px-4 bg-rose-600 hover:bg-rose-700 text-white text-[10px] h-8"
                    >
                        {saving ? "Saving..." : "Save Preferences"}
                    </Button>
                </CardFooter>
            </Card>

            <div className="flex items-center gap-2 px-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-tighter leading-none">
                    Settings synchronized globally
                </p>
            </div>
        </div>
    );
};