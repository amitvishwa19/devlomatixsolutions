'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSettings } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { BellRing, Mail, MessageSquare, Monitor, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { StickySaveBar } from './StickySaveBar';

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

    const isDirty = useMemo(() => {
        if (!settings) return false;
        return (
            localNotifications.whatsapp !== (settings?.notifications?.whatsapp || false) ||
            localNotifications.email !== (settings?.notifications?.email || false) ||
            localNotifications.push !== (settings?.notifications?.push || false)
        );
    }, [localNotifications, settings]);

    const handleToggle = (key, checked) => {
        setLocalNotifications(prev => ({ ...prev, [key]: checked }));
    };

    const handleSave = () => {
        updateSettings({ notifications: localNotifications });
        toast.success("Notification preferences saved successfully");
    };

    const handleReset = () => {
        if (settings?.notifications) {
            setLocalNotifications({
                whatsapp: settings.notifications.whatsapp || false,
                email: settings.notifications.email || false,
                push: settings.notifications.push || false
            });
        }
    };

    const notificationItems = [
        {
            key: 'whatsapp',
            icon: MessageSquare,
            color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
            label: 'WhatsApp Alerts',
            description: 'Critical notifications via WhatsApp.',
        },
        {
            key: 'email',
            icon: Mail,
            color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
            label: 'Email Digest',
            description: 'Daily activity summaries & reports.',
        },
        {
            key: 'push',
            icon: Monitor,
            color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
            label: 'Desktop Push',
            description: 'Browser push notifications in real time.',
        },
    ];

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
                            <div className="p-1 bg-rose-500/10 rounded-md border border-rose-500/20">
                                <BellRing className="w-3.5 h-3.5 text-rose-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xs font-bold text-foreground leading-tight">Notification Channels</CardTitle>
                                <CardDescription className="text-[10px] text-muted-foreground leading-none">
                                    Configure how your team receives alerts.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2 p-3 pt-2.5">
                        {notificationItems.map((item) => (
                            <div
                                key={item.key}
                                className="flex items-center justify-between gap-3 p-2 px-3 rounded-lg bg-secondary/30 border border-border/40 hover:border-border transition-colors"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-7 h-7 rounded-md flex items-center justify-center border shrink-0 ${item.color}`}>
                                        <item.icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <Label className="text-xs font-semibold text-foreground">{item.label}</Label>
                                        <p className="text-[10px] text-muted-foreground">{item.description}</p>
                                    </div>
                                </div>
                                <Switch
                                    disabled={saving}
                                    checked={localNotifications[item.key]}
                                    onCheckedChange={(checked) => handleToggle(item.key, checked)}
                                    className="scale-85 origin-right data-[state=checked]:bg-rose-500"
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Sticky Save Bar */}
            <StickySaveBar
                isDirty={isDirty}
                saving={saving}
                onSave={handleSave}
                onReset={handleReset}
                label="Unsaved Notification Settings"
            />
        </div>
    );
};
