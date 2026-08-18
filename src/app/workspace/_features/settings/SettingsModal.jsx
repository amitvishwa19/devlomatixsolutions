'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    Clock,
    Users,
    Wand2,
    Database as DatabaseIcon,
    FileText,
    ShieldCheck,
    User,
    Settings,
    Search,
    ChevronRight,
    Sparkles,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

import Organization from './_components/Organization';
import Members from './_components/Members';
import TermsnCondition from './_components/TermsnCondition';
import Profile from './_components/Profile';
import Database from './_components/Database';
import PrivacyPolicy from './_components/PrivacyPolicy';
import Timings from './_components/Timings';
import SetupWizard from './_components/SetupWizard';

const settingItems = [
    {
        title: 'General',
        value: 'general',
        icon: Building2,
        color: 'text-primary',
        description: 'Manage organization details, structure, and preferences.',
        component: <Organization />
    },
    {
        title: 'Timings',
        value: 'timings',
        icon: Clock,
        color: 'text-sky-500',
        description: 'Configure operational hours and availability slots.',
        component: <Timings />
    },
    {
        title: 'Members',
        value: 'members',
        icon: Users,
        color: 'text-emerald-500',
        description: 'Add, remove, and manage workspace team members.',
        component: <Members />
    },
    {
        title: 'Setup Wizard',
        value: 'setup',
        icon: Wand2,
        color: 'text-amber-500',
        description: 'Guided workspace configuration and onboarding wizard.',
        component: <SetupWizard />
    },
    {
        title: 'Database',
        value: 'database',
        icon: DatabaseIcon,
        color: 'text-purple-500',
        description: 'Configure database storage, backups, and settings.',
        component: <Database />
    },
    {
        title: 'Terms & Conditions',
        value: 'terms',
        icon: FileText,
        color: 'text-indigo-500',
        description: 'Edit and manage public terms & conditions content.',
        component: <TermsnCondition />
    },
    {
        title: 'Privacy Policy',
        value: 'privacy',
        icon: ShieldCheck,
        color: 'text-rose-500',
        description: 'Manage and update organization privacy policy details.',
        component: <PrivacyPolicy />
    },
    {
        title: 'Profile',
        value: 'profile',
        icon: User,
        color: 'text-blue-500',
        description: 'Update profile information and personal preferences.',
        component: <Profile />
    }
];

export default function SettingsModal({ isOpen, open, onClose }) {
    const isModalOpen = isOpen !== undefined ? isOpen : open;
    const [selectedTab, setSelectedTab] = useState('general');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = searchQuery
        ? settingItems.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : settingItems;

    const currentItem = settingItems.find(i => i.value === selectedTab) || settingItems[0];

    const handleOpenChange = (val) => {
        if (!val && onClose) {
            onClose();
        }
    };

    return (
        <Dialog open={Boolean(isModalOpen)} onOpenChange={handleOpenChange}>
            <DialogContent className="min-h-[80vh] max-h-[80vh] min-w-[85vw] max-w-[85vw] p-0 overflow-hidden bg-card border shadow-2xl rounded-xl">
                <DialogHeader className="hidden">
                    <DialogTitle>Workspace Settings</DialogTitle>
                    <DialogDescription>Manage your workspace preferences and configurations.</DialogDescription>
                </DialogHeader>

                <div className="flex h-[80vh] overflow-hidden">
                    {/* Left Sidebar Navigation */}
                    <motion.aside
                        initial={{ x: -15, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="w-64 border-r bg-card flex flex-col h-full shrink-0"
                    >
                        <div className="p-3 border-b shrink-0">
                            <div className="flex items-center gap-2.5 mb-2.5">
                                <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20">
                                    <Settings className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xs font-bold text-foreground">Organization Settings</h2>
                                    <p className="text-[9px] text-muted-foreground">Configuration & Preferences</p>
                                </div>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search settings..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 bg-secondary/30 border rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                                />
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-2">
                            <nav className="space-y-1 text-xs">
                                {filteredItems.map((item, index) => {
                                    const isSelected = selectedTab === item.value;
                                    const IconComponent = item.icon;

                                    return (
                                        <motion.button
                                            key={item.value}
                                            onClick={() => setSelectedTab(item.value)}
                                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer ${isSelected
                                                ? 'bg-primary/15 text-primary border border-primary/30 font-semibold shadow-xs'
                                                : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
                                                }`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                            whileHover={{ x: 2 }}
                                        >
                                            <IconComponent className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? item.color : ''}`} />
                                            <span className="font-medium text-xs truncate">{item.title}</span>
                                            {isSelected && (
                                                <ChevronRight className="w-3 h-3 ml-auto text-primary" />
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </nav>
                        </ScrollArea>

                        <div className="p-3 border-t bg-card shrink-0">
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">Operational</span>
                            </div>
                        </div>
                    </motion.aside>

                    {/* Right Main Content Area */}
                    <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-card">
                        {/* Compact Top Header */}
                        <div className="flex items-center gap-2.5 p-10 px-4 border-b bg-card shrink-0 ">
                            <div className="p-2 rounded-lg bg-secondary/40 border shrink-0">
                                {React.createElement(currentItem.icon, {
                                    className: `w-4 h-4 ${currentItem.color || 'text-primary'}`
                                })}
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-sm font-bold text-foreground leading-tight truncate">
                                    {currentItem.title}
                                </h1>
                                <p className="text-[10px] text-muted-foreground truncate">
                                    {currentItem.description}
                                </p>
                            </div>
                        </div>

                        {/* Scrollable Tab Body */}
                        <ScrollArea className="flex-1 h-full p-4 overflow-y-auto bg-card">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedTab}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.15 }}
                                    className="space-y-3 pb-6"
                                >
                                    {currentItem.component}
                                </motion.div>
                            </AnimatePresence>
                        </ScrollArea>
                    </main>
                </div>
            </DialogContent>
        </Dialog>
    );
}
