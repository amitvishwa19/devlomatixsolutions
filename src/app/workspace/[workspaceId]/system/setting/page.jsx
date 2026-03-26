'use client';

import React from 'react';
import { SettingProvider } from './_provider/SettingProvider';
import { GeneralSettings } from './_components/GeneralSettings';
import { SecuritySettings } from './_components/SecuritySettings';
import { NotificationSettings } from './_components/NotificationSettings';
import { IntegrationSettings } from './_components/IntegrationSettings';
import { AdvancedSettings } from './_components/AdvancedSettings';
import { PrivacySettings } from './_components/PrivacySettings';
import { DangerZone } from './_components/DangerZone';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Shield, Bell, Palette, AlertTriangle, Puzzle, Cpu, ShieldCheck } from 'lucide-react';

export default function SettingPage() {
    return (
        <SettingProvider>
            <div className="p-2 space-y-4 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/10 pb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Settings className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-xl font-bold text-foreground">Workspace Settings</h1>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground opacity-70">
                            Manage your workspace identity, security policies, and team notification preferences.
                        </p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full border border-border/40">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">System Operational</span>
                    </div>
                </div>

                {/* Tabs Interface */}
                <Tabs defaultValue="general" className="flex flex-col md:flex-row gap-8 items-start">
                    <TabsList className="bg-muted/20 p-2 rounded-xl border border-border/40 flex flex-col h-auto w-full md:w-72 gap-1 sticky top-6">
                        <TabsTrigger
                            value="general"
                            className="w-full justify-start rounded-lg py-3 px-4 data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary transition-all gap-3"
                        >
                            <Settings className="w-4 h-4" />
                            <span className="text-[10px] font-black tracking-widest uppercase">General</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="w-full justify-start rounded-lg py-3 px-4 data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-sky-500 transition-all gap-3"
                        >
                            <Shield className="w-4 h-4" />
                            <span className="text-[10px] font-black tracking-widest uppercase">Security</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="w-full justify-start rounded-lg py-3 px-4 data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-rose-500 transition-all gap-3"
                        >
                            <Bell className="w-4 h-4" />
                            <span className="text-[10px] font-black tracking-widest uppercase">Notifications</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="integrations"
                            className="w-full justify-start rounded-lg py-3 px-4 data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-emerald-500 transition-all gap-3"
                        >
                            <Puzzle className="w-4 h-4" />
                            <span className="text-[10px] font-black tracking-widest uppercase">Integrations</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="advanced"
                            className="w-full justify-start rounded-lg py-3 px-4 data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-amber-500 transition-all gap-3"
                        >
                            <Cpu className="w-4 h-4" />
                            <span className="text-[10px] font-black tracking-widest uppercase">Advanced</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="privacy"
                            className="w-full justify-start rounded-lg py-3 px-4 data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-indigo-500 transition-all gap-2"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[10px] font-black tracking-widest uppercase">Privacy</span>
                        </TabsTrigger>
                        <div className="my-2 border-t border-border/10"></div>
                        <TabsTrigger
                            value="danger"
                            className="w-full justify-start rounded-lg py-3 px-4 data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-soft transition-all gap-3 text-rose-500"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-[10px] font-black tracking-widest uppercase">Danger Zone</span>
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 w-full min-w-0">
                        <TabsContent value="general">
                            <GeneralSettings />
                        </TabsContent>
                        <TabsContent value="security">
                            <SecuritySettings />
                        </TabsContent>
                        <TabsContent value="notifications">
                            <NotificationSettings />
                        </TabsContent>
                        <TabsContent value="integrations">
                            <IntegrationSettings />
                        </TabsContent>
                        <TabsContent value="advanced">
                            <AdvancedSettings />
                        </TabsContent>
                        <TabsContent value="privacy">
                            <PrivacySettings />
                        </TabsContent>
                        <TabsContent value="danger" className="mt-0">
                            <DangerZone />
                        </TabsContent>
                    </div>
                </Tabs>

                {/* Footer Info */}
                <div className="flex border-t border-border/10 pt-8 mt-12 mb-8 items-center justify-between text-muted-foreground/40">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase">Devlomatix Solutions © 2026</p>
                    <div className="flex gap-4">
                        <span className="text-[10px] font-bold tracking-widest uppercase hover:text-primary cursor-pointer transition-colors underline-offset-4 hover:underline">Documentation</span>
                        <span className="text-[10px] font-bold tracking-widest uppercase hover:text-primary cursor-pointer transition-colors underline-offset-4 hover:underline">Privacy Policy</span>
                    </div>
                </div>
            </div>
        </SettingProvider>
    );
}