'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '../_provider/SettingProvider';
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
        <div className="space-y-6 animate-fade-in">
            <Card className="rounded-xl border border-border shadow-soft bg-card/100">
                <CardHeader>
                    <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center mb-2 border border-rose-500/20">
                        <BellRing className="w-5 h-5 text-rose-500" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">Notification Channels</CardTitle>
                    <CardDescription className="text-sm font-medium opacity-70">
                        Control how you and your team receive alerts for workspace events.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-8 p-4 bg-muted/20 rounded-xl border border-border/40">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                                <MessageSquare className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold tracking-tight uppercase">WhatsApp Alerts</Label>
                                <p className="text-[10px] text-muted-foreground font-medium opacity-70">
                                    Direct messages for critical system notifications.
                                </p>
                            </div>
                        </div>
                        <Switch 
                            disabled={saving}
                            checked={localNotifications.whatsapp}
                            onCheckedChange={(checked) => handleToggle('whatsapp', checked)}
                            className="data-[state=checked]:bg-emerald-500"
                        />
                    </div>

                    <div className="flex items-center justify-between gap-8 p-4 bg-muted/20 rounded-xl border border-border/40">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                                <Mail className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold tracking-tight uppercase">Email Digest</Label>
                                <p className="text-[10px] text-muted-foreground font-medium opacity-70">
                                    Weekly and daily activity summaries via email.
                                </p>
                            </div>
                        </div>
                        <Switch 
                            disabled={saving}
                            checked={localNotifications.email}
                            onCheckedChange={(checked) => handleToggle('email', checked)}
                            className="data-[state=checked]:bg-blue-500"
                        />
                    </div>

                    <div className="flex items-center justify-between gap-8 p-4 bg-muted/20 rounded-xl border border-border/40">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center border border-border/20">
                                <Monitor className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold tracking-tight uppercase">Desktop Push</Label>
                                <p className="text-[10px] text-muted-foreground font-medium opacity-70">
                                    Real-time browser notifications.
                                </p>
                            </div>
                        </div>
                        <Switch 
                            disabled={saving}
                            checked={localNotifications.push}
                            onCheckedChange={(checked) => handleToggle('push', checked)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t border-border/10 bg-muted/20 p-6 flex justify-end">
                    <Button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="rounded-xl font-bold px-8 shadow-soft bg-primary hover:bg-primary/90"
                    >
                        {saving ? "Saving..." : "Save Preferences"}
                    </Button>
                </CardFooter>
            </Card>

            <div className="flex items-center gap-2 px-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <p className="text-[10px] font-bold text-muted-foreground/60 tracking-widest uppercase">
                    Changes take effect immediately for all active members.
                </p>
            </div>
        </div>
    );
};
