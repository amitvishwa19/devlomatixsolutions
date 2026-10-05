'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
    LayoutDashboard,
    Kanban,
    Users,
    Building2,
    Activity,
    Settings2,
    Plus,
    Sparkles,
    Briefcase,
    MessageCircle,
    Zap,
    BarChart3,
    CheckSquare,
    PhoneCall
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function CrmLayout({ children }) {
    const pathname = usePathname();
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const baseCRMPath = `/workspace/${workspaceId}/crm`;

    const navItems = [
        { title: "Dashboard", href: baseCRMPath, icon: LayoutDashboard, exact: true },
        { title: "Activity Center", href: `${baseCRMPath}/dcr`, icon: PhoneCall },
        { title: "AI Copilot", href: `${baseCRMPath}/copilot`, icon: Sparkles },
        { title: "Pipelines & Deals", href: `${baseCRMPath}/pipeline`, icon: Kanban },
        { title: "360° Contacts", href: `${baseCRMPath}/contacts`, icon: Users },
        { title: "Companies", href: `${baseCRMPath}/accounts`, icon: Building2 },
        { title: "Tasks", href: `${baseCRMPath}/tasks`, icon: CheckSquare },
        { title: "Forecast & Leaderboard", href: `${baseCRMPath}/analytics`, icon: BarChart3 },
        { title: "Automations", href: `${baseCRMPath}/automations`, icon: Zap },
        { title: "Activities", href: `${baseCRMPath}/activities`, icon: Activity },
        { title: "Settings", href: `${baseCRMPath}/settings`, icon: Settings2 },
    ];

    const isActive = (item) => {
        if (item.exact) return pathname === item.href;
        return pathname.startsWith(item.href);
    };

    return (
        <div className="flex flex-col min-h-screen bg-background/95 w-full">
            {/* Top CRM Sub-Navigation Bar */}
            <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur-md px-4 sm:px-6 py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Left: Branding & Sub-navigation Tabs */}
                    <div className="flex items-center gap-4 overflow-x-auto hide-scrollbar py-0.5">
                        <div className="flex items-center gap-2 pr-2 border-r border-border shrink-0">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm">
                                <Briefcase className="w-4 h-4" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
                                    Enterprise CRM
                                    <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-medium px-1.5 py-0.2 rounded-full">
                                        Pro
                                    </span>
                                </h1>
                            </div>
                        </div>

                        <nav className="flex items-center gap-1 shrink-0">
                            {/* {navItems.map((item) => {
                                const active = isActive(item);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 shrink-0 ${
                                            active
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                        }`}
                                    >
                                        <Icon className="w-3.5 h-3.5 shrink-0" />
                                        <span>{item.title}</span>
                                    </Link>
                                );
                            })} */}
                        </nav>
                    </div>

                    {/* Right: Cross-module shortcuts */}
                    <div className="flex items-center gap-2 shrink-0 ml-auto">
                        <Link href={`/workspace/${workspaceId}/konnectx`}>
                            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 bg-background border-border hover:border-[#25D366]/40 hover:text-[#25D366]">
                                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                                <span className="hidden md:inline">KonnectX</span>
                            </Button>
                        </Link>
                        <Link href={`/workspace/${workspaceId}/hireflow`}>
                            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 bg-background border-border hover:border-indigo-500/40 hover:text-indigo-500">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="hidden md:inline">Hireflow</span>
                            </Button>
                        </Link>
                        <Link href={`${baseCRMPath}/pipeline?createDeal=true`}>
                            <Button size="sm" className="h-8 text-xs gap-1 shadow-sm font-semibold">
                                <Plus className="w-3.5 h-3.5" />
                                <span>New Deal</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main CRM Content Area */}
            <main className="flex-1 w-full p-4 sm:p-6 min-w-0">
                {children}
            </main>
        </div>
    );
}
