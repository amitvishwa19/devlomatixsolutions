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

    const notificationItems = [
        {
            key: 'whatsapp',
            icon: MessageSquare,
            color: 'emerald',
            label: 'WhatsApp Alerts',
            description: 'Critical notifications via WhatsApp.',
        },
        {
            key: 'email',
            icon: Mail,
            color: 'blue',
            label: 'Email Digest',
            description: 'Daily activity summaries.',
        },
        {
            key: 'push',
            icon: Monitor,
            color: 'zinc',
            label: 'Desktop Push',
            description: 'Browser push notifications.',
        },
    ];

    return (
        <div className="space-y-3">
            <Card className="bg-card border-border/50">
                <CardHeader className="pb-3 px-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-rose-500/10 rounded-lg border border-rose-500/20">
                            <BellRing className="w-3.5 h-3.5 text-rose-500" />
                        </div>
                        <div>
                            <CardTitle className="text-xs font-bold text-white">Notification Channels</CardTitle>
                            <CardDescription className="text-[10px] text-zinc-500">
                                Configure how your team receives alerts.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-3 px-3">
                    {notificationItems.map((item) => (
                        <div
                            key={item.key}
                            className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white/5 border border-white/10"
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 bg-${item.color}-500/10 rounded-lg flex items-center justify-center border border-${item.color}-500/20`}>
                                    <item.icon className={`w-4 h-4 text-${item.color}-500`} />
                                </div>
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-semibold text-white">{item.label}</Label>
                                    <p className="text-[10px] text-zinc-500">{item.description}</p>
                                </div>
                            </div>
                            <Switch
                                disabled={saving}
                                checked={localNotifications[item.key]}
                                onCheckedChange={(checked) => handleToggle(item.key, checked)}
                                className="data-[state=checked]:bg-rose-500 scale-90"
                            />
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="border-t border-white/5 pt-3 px-3">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs h-8"
                    >
                        {saving ? "Saving..." : "Save Preferences"}
                    </Button>
                </CardFooter>
            </Card>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
                    Settings synchronized globally
                </p>
            </div>
        </div>
    );
};
