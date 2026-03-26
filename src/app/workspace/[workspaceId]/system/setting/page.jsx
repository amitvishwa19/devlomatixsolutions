'use client';

import React from 'react';
import { SettingProvider } from './_provider/SettingProvider';
import { GeneralSettings } from './_components/GeneralSettings';
import { SecuritySettings } from './_components/SecuritySettings';
import { NotificationSettings } from './_components/NotificationSettings';
import { IntegrationSettings } from './_components/IntegrationSettings';
import { AdvancedSettings } from './_components/AdvancedSettings';
import { PrivacySettings } from './_components/PrivacySettings';
import { DeveloperSettings } from './_components/DeveloperSettings';
import { DangerZone } from './_components/DangerZone';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Shield, Bell, Palette, AlertTriangle, Puzzle, Cpu, ShieldCheck, Terminal, History } from 'lucide-react';

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

                <Tabs defaultValue="general" className="flex flex-col md:flex-row gap-8 items-start min-h-[600px]">
                    <TabsList className="bg-card/50 backdrop-blur-xl p-2 rounded-2xl border border-border/40 flex flex-col h-auto w-full md:w-72 gap-1.5 sticky top-6 shadow-xl shadow-primary/5">
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
                            className="w-full justify-start rounded-xl py-3 px-4 data-[state=active]:bg-card data-[state=active]:shadow-xl data-[state=active]:text-indigo-500 transition-all gap-3 group relative overflow-hidden"
                        >
                            <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black tracking-widest uppercase">Privacy</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="developer"
                            className="w-full justify-start rounded-xl py-3 px-4 data-[state=active]:bg-card data-[state=active]:shadow-xl data-[state=active]:text-fuchsia-500 transition-all gap-3 group relative overflow-hidden"
                        >
                            <Terminal className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black tracking-widest uppercase">Developer</span>
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
                        <TabsContent value="privacy" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <PrivacySettings />
                        </TabsContent>
                        <TabsContent value="developer" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <DeveloperSettings />
                        </TabsContent>
                        <TabsContent value="danger" className="mt-0">
                            <DangerZone />
                        </TabsContent>
                    </div>
                </Tabs>


            </div>
        </SettingProvider>
    );
}