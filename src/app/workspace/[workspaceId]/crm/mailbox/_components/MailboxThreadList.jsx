'use client';

import React, { useState, useMemo } from 'react';
import { Search, RefreshCw, Mail, Loader2, Star, DollarSign, Filter, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MailboxThreadCard from './MailboxThreadCard';

export default function MailboxThreadList({
    threads = [],
    selectedThreadId,
    currentFolder,
    searchQuery,
    isLoading,
    onSearchChange,
    onSearchSubmit,
    onRefresh,
    onSelectThread,
    onToggleStar
}) {
    const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'starred' | 'deals'

    // Filter threads based on selected local tab
    const filteredThreads = useMemo(() => {
        if (!threads) return [];
        return threads.filter(thread => {
            if (activeFilter === 'unread') {
                return (thread.unreadCount || 0) > 0;
            }
            if (activeFilter === 'starred') {
                return !!thread.isStarred;
            }
            if (activeFilter === 'deals') {
                return !!thread.dealId || !!thread.deal;
            }
            return true;
        });
    }, [threads, activeFilter]);

    // Compute dynamic counts for the filter tabs
    const filterCounts = useMemo(() => {
        if (!threads) return { all: 0, unread: 0, starred: 0, deals: 0 };
        return {
            all: threads.length,
            unread: threads.filter(t => (t.unreadCount || 0) > 0).length,
            starred: threads.filter(t => !!t.isStarred).length,
            deals: threads.filter(t => !!t.dealId || !!t.deal).length
        };
    }, [threads]);

    return (
        <section className={`w-96 border-r border-slate-200 dark:border-slate-800 bg-card flex flex-col shrink-0 h-full min-h-0 ${
            selectedThreadId ? 'hidden md:flex' : 'flex'
        }`}>
            {/* Search & Refresh Bar */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/40 dark:bg-slate-900/40">
                <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <Input
                        placeholder="Search emails (or press Enter)..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') onSearchSubmit(); }}
                        className="pl-8 pr-7 h-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => {
                                onSearchChange('');
                                onRefresh();
                            }}
                            className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRefresh}
                    className="h-8 w-8 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Refresh emails"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
                </Button>
            </div>

            {/* Filter Pills Bar */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-900/20 overflow-x-auto no-scrollbar">
                <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                        activeFilter === 'all'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <span>All</span>
                    <span className={`text-[10px] px-1 py-0.2 rounded-full ${activeFilter === 'all' ? 'bg-blue-700/80 text-white' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'}`}>
                        {filterCounts.all}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveFilter('unread')}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                        activeFilter === 'unread'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <span>Unread</span>
                    {filterCounts.unread > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeFilter === 'unread' ? 'bg-blue-800 text-white' : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'}`}>
                            {filterCounts.unread}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setActiveFilter('starred')}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1 ${
                        activeFilter === 'starred'
                            ? 'bg-amber-500 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <Star className="w-3 h-3 fill-current opacity-80" />
                    <span>Starred</span>
                    {filterCounts.starred > 0 && (
                        <span className="text-[10px] opacity-80">({filterCounts.starred})</span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setActiveFilter('deals')}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1 ${
                        activeFilter === 'deals'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <DollarSign className="w-3 h-3" />
                    <span>Deals</span>
                    {filterCounts.deals > 0 && (
                        <span className="text-[10px] opacity-80">({filterCounts.deals})</span>
                    )}
                </button>
            </div>

            {/* Thread Cards List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        <span className="text-xs">Loading conversations...</span>
                    </div>
                ) : filteredThreads.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                            <Mail className="w-6 h-6 stroke-1" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {activeFilter !== 'all' ? `No ${activeFilter} messages` : `No emails in ${currentFolder.toLowerCase()}`}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 max-w-[220px] leading-relaxed">
                            {activeFilter !== 'all'
                                ? 'Try switching filter tabs or searching with another term.'
                                : 'Inbound emails from Resend will automatically appear here in real-time.'}
                        </p>
                    </div>
                ) : (
                    filteredThreads.map(thread => (
                        <MailboxThreadCard
                            key={thread.id}
                            thread={thread}
                            isSelected={thread.id === selectedThreadId}
                            onSelect={() => onSelectThread(thread.id)}
                            onToggleStar={onToggleStar}
                        />
                    ))
                )}
            </div>
        </section>
    );
}
