'use client';

import React, { useState, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    Shield,
    Bell,
    AlertTriangle,
    Puzzle,
    Cpu,
    ShieldCheck,
    Terminal,
    ChevronRight,
    Search,
    Activity,
    Unplug,
    Sparkles,
    Tag,
} from 'lucide-react';
import { GeneralSettings } from './GeneralSettings';
import { SecuritySettings } from './SecuritySettings';
import { NotificationSettings } from './NotificationSettings';
import { IntegrationSettings } from './IntegrationSettings';
import { AdvancedSettings } from './AdvancedSettings';
import { PrivacySettings } from './PrivacySettings';
import { DeveloperSettings } from './DeveloperSettings';
import { ScrollArea } from '@/components/ui/scroll-area';
import ConnectorSetting from './ConnectorSetting';
import { DangerZone } from './DangerZone';
import { searchSettings } from '../_lib/settings-search-index';

const settingTabs = [
    { id: 'general', label: 'General', icon: Settings, color: 'text-primary' },
    { id: 'security', label: 'Security', icon: Shield, color: 'text-sky-500' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-rose-500' },
    { id: 'integrations', label: 'Integrations', icon: Puzzle, color: 'text-emerald-500' },
    { id: 'connectors', label: 'Connectors', icon: Unplug, color: 'text-primary-500' },
    { id: 'advanced', label: 'Advanced', icon: Cpu, color: 'text-amber-500' },
    { id: 'privacy', label: 'Privacy', icon: ShieldCheck, color: 'text-indigo-500' },
    { id: 'developer', label: 'Developer', icon: Terminal, color: 'text-fuchsia-500' },
];

const settingDescriptions = {
    general: 'Configure workspace identity, branding, and social presence.',
    security: 'Manage authentication policies and access controls.',
    notifications: 'Configure alert channels and notification preferences.',
    integrations: 'Connect external services, webhooks, and APIs.',
    connectors: 'Connect external services, LLMs, and third-party APIs.',
    advanced: 'System configuration, code injection, and 1-click backups.',
    privacy: 'Data governance, GDPR compliance, and audit settings.',
    developer: 'API keys, webhooks, and developer tools.',
    danger: 'Destructive and critical workspace actions.'
};

export default function SettingModal({ open, onClose }) {
    const [activeTab, setActiveTab] = useState('general');
    const [searchQuery, setSearchQuery] = useState('');

    // Deep search results
    const deepMatches = useMemo(() => {
        return searchSettings(searchQuery);
    }, [searchQuery]);

    // Matching tab IDs from deep search
    const matchedTabIds = useMemo(() => {
        if (!searchQuery) return null;
        const set = new Set(deepMatches.map(m => m.tabId));
        settingTabs.forEach(tab => {
            if (tab.label.toLowerCase().includes(searchQuery.toLowerCase())) {
                set.add(tab.id);
            }
        });
        if ('danger zone'.includes(searchQuery.toLowerCase())) set.add('danger');
        return set;
    }, [searchQuery, deepMatches]);

    const filteredTabs = matchedTabIds
        ? settingTabs.filter(tab => matchedTabIds.has(tab.id))
        : settingTabs;

    const showDangerInFilter = !matchedTabIds || matchedTabIds.has('danger');

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="min-h-[80vh] max-h-[80vh] min-w-[85vw] max-w-[85vw] p-0 overflow-hidden bg-card border border-border shadow-2xl rounded-xl">
                <DialogHeader className="hidden">
                    <DialogTitle>Workspace Settings</DialogTitle>
                    <DialogDescription>Manage your workspace preferences.</DialogDescription>
                </DialogHeader>

                <div className="flex h-[80vh] overflow-hidden">
                    {/* Sidebar */}
                    <motion.aside
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="w-72 border-r border-border/50 bg-card flex flex-col h-full shrink-0"
                    >
                        <div className="p-3.5 border-b border-border/50 shrink-0">
                            <div className="flex items-center gap-2.5 mb-2.5">
                                <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20">
                                    <Settings className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xs font-bold text-foreground">Workspace Settings</h2>
                                    <p className="text-[10px] text-muted-foreground">Configuration & Deep Search</p>
                                </div>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search fields, e.g. 'mfa', 'color'..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 bg-secondary/30 border border-border/50 rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                                />
                            </div>

                            {/* Deep match count pill */}
                            {searchQuery && (
                                <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-muted-foreground">
                                    <span>Matches: {deepMatches.length} field(s)</span>
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="text-primary hover:underline text-[9px] font-semibold cursor-pointer"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>

                        <ScrollArea className="flex-1 p-2">
                            <nav className="space-y-1 text-xs">
                                {filteredTabs.map((tab, index) => {
                                    const isSelected = activeTab === tab.id;
                                    const tabMatches = deepMatches.filter(m => m.tabId === tab.id);

                                    return (
                                        <div key={tab.id} className="space-y-1">
                                            <motion.button
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer ${isSelected
                                                        ? 'bg-primary/15 text-primary border border-primary/30 font-semibold shadow-xs'
                                                        : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
                                                    }`}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.02 }}
                                                whileHover={{ x: 2 }}
                                            >
                                                <tab.icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? tab.color : ''}`} />
                                                <span className="font-medium text-xs truncate">{tab.label}</span>
                                                {tabMatches.length > 0 && searchQuery && (
                                                    <span className="ml-auto px-1.5 py-0.2 rounded-full text-[9px] bg-primary/20 text-primary font-bold">
                                                        {tabMatches.length}
                                                    </span>
                                                )}
                                                {isSelected && !searchQuery && (
                                                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary" />
                                                )}
                                            </motion.button>

                                            {/* Nested Deep Search Matching Field Badges */}
                                            {searchQuery && tabMatches.length > 0 && (
                                                <div className="pl-6 pr-1 pb-1 space-y-1">
                                                    {tabMatches.map((match, mIdx) => (
                                                        <button
                                                            key={mIdx}
                                                            onClick={() => setActiveTab(tab.id)}
                                                            className="w-full text-left p-1 px-1.5 rounded bg-secondary/20 hover:bg-secondary/60 border border-border/40 text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 truncate cursor-pointer"
                                                        >
                                                            <Tag className="w-2.5 h-2.5 text-primary shrink-0" />
                                                            <span className="truncate">{match.title}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {showDangerInFilter && (
                                    <>
                                        <div className="my-2 border-t border-border/40" />
                                        <motion.button
                                            key="danger"
                                            onClick={() => setActiveTab('danger')}
                                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer ${activeTab === 'danger'
                                                    ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30 font-semibold'
                                                    : 'hover:bg-rose-500/10 text-rose-500/80 hover:text-rose-500'
                                                }`}
                                        >
                                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                            <span className="font-medium text-xs">Danger Zone</span>
                                        </motion.button>
                                    </>
                                )}
                            </nav>
                        </ScrollArea>

                        <div className="p-3 border-t border-border/50 bg-card shrink-0">
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">Operational</span>
                            </div>
                        </div>
                    </motion.aside>

                    {/* Main Content Viewport */}
                    <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-card">
                        {/* Header */}
                        <div className="flex items-center gap-2.5 p-3 px-4 border-b border-border/80 bg-card shrink-0">
                            <div className="p-1.5 rounded-lg bg-secondary/40 border border-border/50 shrink-0">
                                {React.createElement(
                                    settingTabs.find(t => t.id === activeTab)?.icon || AlertTriangle,
                                    { className: 'w-4 h-4 text-primary' }
                                )}
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-sm font-bold text-foreground leading-tight truncate">
                                    {settingTabs.find(t => t.id === activeTab)?.label || 'Danger Zone'} Settings
                                </h1>
                                <p className="text-[10px] text-muted-foreground truncate">
                                    {settingDescriptions[activeTab] || 'Workspace operations.'}
                                </p>
                            </div>
                        </div>

                        {/* Content Scroll Area */}
                        <ScrollArea className="flex-1 h-full p-4 overflow-y-auto bg-card">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.15 }}
                                    className="space-y-3 pb-8"
                                >
                                    {activeTab === 'general' && <GeneralSettings />}
                                    {activeTab === 'security' && <SecuritySettings />}
                                    {activeTab === 'notifications' && <NotificationSettings />}
                                    {activeTab === 'integrations' && <IntegrationSettings />}
                                    {activeTab === 'connectors' && <ConnectorSetting />}
                                    {activeTab === 'advanced' && <AdvancedSettings />}
                                    {activeTab === 'privacy' && <PrivacySettings />}
                                    {activeTab === 'developer' && <DeveloperSettings />}
                                    {activeTab === 'danger' && <DangerZone />}
                                </motion.div>
                            </AnimatePresence>
                        </ScrollArea>
                    </main>
                </div>
            </DialogContent>
        </Dialog>
    );
}
