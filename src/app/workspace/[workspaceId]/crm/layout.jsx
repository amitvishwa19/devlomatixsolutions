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
    PhoneCall,
    Video,
    MessageSquare,
    CheckSquare,
    UserCheck,
    FileSpreadsheet
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function CrmLayout({ children }) {
    const pathname = usePathname();
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const baseCRMPath = `/workspace/${workspaceId}/crm`;

    const navItems = [
        { title: "Dashboard", href: baseCRMPath, icon: LayoutDashboard, exact: true },
        { title: "Chat & Calls", href: `${baseCRMPath}/chat`, icon: Video },
        { title: "DCR (Daily Call Record)", href: `${baseCRMPath}/dcr`, icon: PhoneCall },
        { title: "AI Copilot", href: `${baseCRMPath}/copilot`, icon: Sparkles },
        { title: "Pipelines & Deals", href: `${baseCRMPath}/pipeline`, icon: Kanban },
        { title: "Quotations", href: `${baseCRMPath}/quotations`, icon: FileSpreadsheet },
        { title: "360° Contacts", href: `${baseCRMPath}/contacts`, icon: Users },
        { title: "Candidates", href: `${baseCRMPath}/candidates`, icon: UserCheck },
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
        <div className="flex flex-col  w-full">

            {/* Main CRM Content Area */}
            <main className="flex-1 w-full sm:p-6 min-w-0">
                {children}
            </main>
        </div>
    );
}
