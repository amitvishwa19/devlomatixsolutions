'use client';

import React, { useState } from 'react';
import { WorkspaceProvider } from '@/providers/WorkspaceProvider';
import { GeneralSettings } from './_components/GeneralSettings';
import { SecuritySettings } from './_components/SecuritySettings';
import { NotificationSettings } from './_components/NotificationSettings';
import { IntegrationSettings } from './_components/IntegrationSettings';
import { AdvancedSettings } from './_components/AdvancedSettings';
import { PrivacySettings } from './_components/PrivacySettings';
import { DeveloperSettings } from './_components/DeveloperSettings';
import { DangerZone } from './_components/DangerZone';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Shield, Bell, AlertTriangle, Puzzle, Cpu, ShieldCheck, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingPage() {
    const [activeTab, setActiveTab] = useState('general');

    return (
        <WorkspaceProvider>
            <div className="p-2 space-y-4 animate-in fade-in duration-500">
                {/* Minimalist Header */}
                <div className="rounded-md border border-border/50 p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-primary/5 rounded-md border border-primary/10">
                                    <Settings className="w-4 h-4 text-primary" />
                                </div>
                                <h1 className="text-base font-bold tracking-tight text-foreground">Workspace Settings</h1>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-medium">
                                Configure your workspace identity and manage security protocols.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2 px-2 py-1 rounded-md border border-emerald-500/20">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-500/80">Operational</span>
                        </div>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 items-start">
                    {/* Navigation Sidebar */}
                    <TabsList className="bg-transparent border border-border/50 p-1 rounded-md flex flex-col h-auto w-full gap-1 sticky top-6">
                        {[
                            { id: 'general', label: 'General', icon: Settings, color: 'text-primary' },
                            { id: 'security', label: 'Security', icon: Shield, color: 'text-blue-500' },
                            { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-rose-500' },
                            { id: 'integrations', label: 'Integrations', icon: Puzzle, color: 'text-emerald-500' },
                            { id: 'advanced', label: 'Advanced', icon: Cpu, color: 'text-amber-500' },
                            { id: 'privacy', label: 'Privacy', icon: ShieldCheck, color: 'text-indigo-500' },
                            { id: 'developer', label: 'Developer', icon: Terminal, color: 'text-fuchsia-500' },
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="relative w-full justify-start rounded-md py-1.5 px-2.5 data-[state=active]:text-foreground data-[state=active]:bg-transparent transition-all gap-2 group"
                            >
                                <tab.icon className={`w-3.5 h-3.5 transition-all duration-300 ${activeTab === tab.id ? tab.color : 'text-muted-foreground'}`} />
                                <span className="text-[11px] font-bold transition-all duration-300">{tab.label}</span>
                                
                                {activeTab === tab.id && (
                                    <motion.div 
                                        layoutId="settings-active-pill"
                                        className="absolute inset-0 bg-primary/5 rounded-md -z-10 border border-primary/20"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </TabsTrigger>
                        ))}
                        
                        <div className="my-1 border-t border-border/20 mx-2"></div>
                        
                        <TabsTrigger
                            value="danger"
                            className="relative w-full justify-start rounded-md py-1.5 px-2.5 data-[state=active]:bg-rose-500 data-[state=active]:text-white transition-all gap-2 text-rose-500 group"
                        >
                            <AlertTriangle className="w-3.5 h-3.5 group-hover:animate-pulse" />
                            <span className="text-[11px] font-bold">Danger Zone</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Content Area */}
                    <div className="min-w-0 border border-border/50 rounded-md p-4 min-h-[500px] relative">
                        <TabsContent value="general" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-2 duration-300">
                            <GeneralSettings />
                        </TabsContent>
                        <TabsContent value="security" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-2 duration-300">
                            <SecuritySettings />
                        </TabsContent>
                        <TabsContent value="notifications" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-2 duration-300">
                            <NotificationSettings />
                        </TabsContent>
                        <TabsContent value="integrations" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-2 duration-300">
                            <IntegrationSettings />
                        </TabsContent>
                        <TabsContent value="advanced" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-2 duration-300">
                            <AdvancedSettings />
                        </TabsContent>
                        <TabsContent value="privacy" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-2 duration-300">
                            <PrivacySettings />
                        </TabsContent>
                        <TabsContent value="developer" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-2 duration-300">
                            <DeveloperSettings />
                        </TabsContent>
                        <TabsContent value="danger" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-2 duration-300">
                            <DangerZone />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </WorkspaceProvider>
    );
}