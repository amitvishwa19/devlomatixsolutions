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
} from 'lucide-react';

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
  general: 'Configure workspace identity, branding, and social presence.',
  security: 'Manage authentication policies and access controls.',
  notifications: 'Configure alert channels and notification preferences.',
  integrations: 'Connect external services, webhooks, and APIs.',
  advanced: 'System configuration, code injection, and data portability.',
  privacy: 'Data governance, GDPR compliance, and audit settings.',
  developer: 'API keys, webhooks, and developer tools.',
};

export default function SettingPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTabs = searchQuery
    ? settingTabs.filter(tab =>
      tab.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : settingTabs;

  return (
    <WorkspaceProvider>
      <div className="min-h-screen ">


        <div className="flex">
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-72 border-r border-white/5  backdrop-blur-xl sticky top-0 h-screen overflow-y-auto"
          >
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Workspace Settings</h2>
                  <p className="text-[10px] text-zinc-500">Configuration & Control</p>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <nav className="p-3 space-y-1 text-sm">
              {filteredTabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeTab === tab.id
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'hover:bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  <tab.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === tab.id ? tab.color : ''}`} />
                  <span className="font-medium text-sm">{tab.label}</span>
                  {activeTab === tab.id && (
                    <ChevronRight className="w-4 h-4 ml-auto text-primary" />
                  )}
                </motion.button>
              ))}

              <div className="my-3 border-t border-white/5" />

              <motion.button
                key="danger"
                onClick={() => setActiveTab('danger')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeTab === 'danger'
                  ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                  : 'hover:bg-rose-500/5 text-rose-500/70 hover:text-rose-500'
                  }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: filteredTabs.length * 0.05 }}
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">Danger Zone</span>
              </motion.button>
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-[#0a0a0a]/80">
              <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Operational</span>
              </div>
            </div>
          </motion.aside>

          <main className="flex-1 p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className=" mx-auto"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    {React.createElement(
                      settingTabs.find(t => t.id === activeTab)?.icon || Settings,
                      { className: 'w-6 h-6 text-primary' }
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {settingTabs.find(t => t.id === activeTab)?.label || 'Danger Zone'} Settings
                    </h1>
                    <p className="text-sm text-zinc-500">
                      {settingDescriptions[activeTab] || 'Critical workspace operations.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
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
          </main>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
