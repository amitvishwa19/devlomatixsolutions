'use client';

import React, { useState, useMemo } from 'react';
import { WorkspaceProvider, useSettings } from '@/providers/WorkspaceProvider';
import { GeneralSettings } from './_components/GeneralSettings';
import { SecuritySettings } from './_components/SecuritySettings';
import { NotificationSettings } from './_components/NotificationSettings';
import { IntegrationSettings } from './_components/IntegrationSettings';
import { AdvancedSettings } from './_components/AdvancedSettings';
import { PrivacySettings } from './_components/PrivacySettings';
import { DeveloperSettings } from './_components/DeveloperSettings';
import { DangerZone } from './_components/DangerZone';
import { SettingContentSkeleton } from './_components/SettingSkeleton';
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
  Tag,
} from 'lucide-react';
import { searchSettings } from '../_lib/settings-search-index';

const settingTabs = [
  { id: 'general', label: 'General', icon: Settings, color: 'text-primary' },
  { id: 'security', label: 'Security', icon: Shield, color: 'text-sky-500' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-rose-500' },
  { id: 'integrations', label: 'Integrations', icon: Puzzle, color: 'text-emerald-500' },
  { id: 'advanced', label: 'Advanced', icon: Cpu, color: 'text-amber-500' },
  { id: 'privacy', label: 'Privacy', icon: ShieldCheck, color: 'text-indigo-500' },
  { id: 'developer', label: 'Developer', icon: Terminal, color: 'text-fuchsia-500' },
];

const settingDescriptions = {
  general: 'Workspace identity, branding, and social presence.',
  security: 'Authentication policies and access controls.',
  notifications: 'Alert channels and notification preferences.',
  integrations: 'External services, webhooks, and APIs.',
  advanced: 'System configuration, code injection, and 1-click backups.',
  privacy: 'Data governance, GDPR compliance, and audit settings.',
  developer: 'API keys, webhooks, and developer tools.',
  danger: 'Destructive workspace actions and factory reset.'
};

function SettingPageContent() {
  const { settings, settingsLoading, loading } = useSettings();
  const [activeTab, setActiveTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');

  const isDataLoading = settingsLoading || (loading && !settings);

  // Deep search results
  const deepMatches = useMemo(() => {
    return searchSettings(searchQuery);
  }, [searchQuery]);

  // Tab match filter
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

  const showDanger = !matchedTabIds || matchedTabIds.has('danger');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Left Sidebar */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-64 border-r border-border/50 bg-card sticky top-0 h-screen overflow-y-auto shrink-0 flex flex-col"
        >
          <div className="p-3 border-b border-border/50 shrink-0">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20">
                <Settings className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-foreground">Workspace Settings</h2>
                <p className="text-[9px] text-muted-foreground">Configuration & Control</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-secondary/30 border border-border/50 rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>

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

          <nav className="p-2 space-y-1 text-xs flex-1">
            {filteredTabs.map((tab, index) => {
              const isSelected = activeTab === tab.id;
              const tabMatches = deepMatches.filter(m => m.tabId === tab.id);

              return (
                <div key={tab.id} className="space-y-1">
                  <motion.button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary/15 text-primary border border-primary/30 font-semibold shadow-xs'
                        : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ x: 2 }}
                  >
                    <tab.icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? tab.color : ''}`} />
                    <span className="font-medium text-xs truncate">{tab.label}</span>
                    {tabMatches.length > 0 && searchQuery && (
                      <span className="ml-auto px-1.5 py-0.2 rounded-full text-[9px] bg-primary/20 text-primary font-bold">
                        {tabMatches.length}
                      </span>
                    )}
                    {isSelected && !searchQuery && (
                      <ChevronRight className="w-3 h-3 ml-auto text-primary" />
                    )}
                  </motion.button>

                  {/* Deep search matching tags */}
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

            {showDanger && (
              <>
                <div className="my-2 border-t border-border/40" />
                <motion.button
                  key="danger"
                  onClick={() => setActiveTab('danger')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer ${
                    activeTab === 'danger'
                      ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30 font-semibold'
                      : 'hover:bg-rose-500/10 text-rose-500/80 hover:text-rose-500'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-medium text-xs">Danger Zone</span>
                </motion.button>
              </>
            )}
          </nav>

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

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-5 max-w-6xl">
          {isDataLoading ? (
            <SettingContentSkeleton />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Header Banner */}
                <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
                  <div className="p-2 rounded-lg bg-secondary/40 border border-border/50">
                    {React.createElement(
                      settingTabs.find(t => t.id === activeTab)?.icon || AlertTriangle,
                      { className: 'w-4 h-4 text-primary' }
                    )}
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-foreground">
                      {settingTabs.find(t => t.id === activeTab)?.label || 'Danger Zone'} Settings
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      {settingDescriptions[activeTab] || 'Critical workspace operations.'}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div>
                  {activeTab === 'general' && <GeneralSettings />}
                  {activeTab === 'security' && <SecuritySettings />}
                  {activeTab === 'notifications' && <NotificationSettings />}
                  {activeTab === 'integrations' && <IntegrationSettings />}
                  {activeTab === 'advanced' && <AdvancedSettings />}
                  {activeTab === 'privacy' && <PrivacySettings />}
                  {activeTab === 'developer' && <DeveloperSettings />}
                  {activeTab === 'danger' && <DangerZone />}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}

export default function WorkspaceSettingsPage() {
  return (
    <WorkspaceProvider>
      <SettingPageContent />
    </WorkspaceProvider>
  );
}
