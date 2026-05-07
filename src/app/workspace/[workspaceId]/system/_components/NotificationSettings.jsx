'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
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
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:border-rose-500/30 transition-colors">
                    <CardHeader className="pb-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-rose-500/10 rounded-lg border border-rose-500/20">
                                <BellRing className="w-5 h-5 text-rose-500" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold text-white">Notification Channels</CardTitle>
                                <CardDescription className="text-xs text-zinc-500">
                                    Configure how your team receives alerts.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                        {notificationItems.map((item, index) => (
                            <motion.div
                                key={item.key}
                                className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ x: 4 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 bg-${item.color}-500/10 rounded-lg flex items-center justify-center border border-${item.color}-500/20`}>
                                        <item.icon className={`w-5 h-5 text-${item.color}-500`} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-semibold text-white">{item.label}</Label>
                                        <p className="text-xs text-zinc-500">{item.description}</p>
                                    </div>
                                </div>
                                <Switch
                                    disabled={saving}
                                    checked={localNotifications[item.key]}
                                    onCheckedChange={(checked) => handleToggle(item.key, checked)}
                                    className="data-[state=checked]:bg-rose-500"
                                />
                            </motion.div>
                        ))}
                    </CardContent>
                    <CardFooter className="border-t border-white/5 pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold h-11"
                        >
                            {saving ? "Saving..." : "Save Preferences"}
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
            >
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <p className="text-sm text-emerald-500 font-semibold uppercase tracking-wider">
                    Settings synchronized globally
                </p>
            </motion.div>
        </div>
    );
};
