'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Globe, Clock } from "lucide-react";
import { VisitorsLogTab } from "./_components/VisitorsLogTab";
import SystemCronManagementPage from "../cron/page";

export default function LogPage() {
    const [activeTab, setActiveTab] = useState('visitors'); // 'visitors' | 'cron'

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            if (tabParam === 'cron') {
                setActiveTab('cron');
            }
        }
    }, []);

    return (
        <div className="p-6 space-y-5 animate-fade-in bg-background/50">
            {/* Module Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                <Button
                    variant={activeTab === 'visitors' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('visitors')}
                    className={`font-bold text-xs gap-2 rounded-lg transition-all ${
                        activeTab === 'visitors'
                            ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <Globe size={14} />
                    Site Visitors
                </Button>

                <Button
                    variant={activeTab === 'cron' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('cron')}
                    className={`font-bold text-xs gap-2 rounded-lg transition-all ${
                        activeTab === 'cron'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <Clock size={14} />
                    Cron Tasks & Hub
                </Button>
            </div>

            {/* Content Display */}
            {activeTab === 'visitors' ? (
                <VisitorsLogTab />
            ) : (
                <SystemCronManagementPage className="space-y-6 max-w-full" />
            )}
        </div>
    );
}