'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DynamicIcon } from 'lucide-react/dynamic';

import OrgSwitcher from './OrgSwitcher';
import OrgAuthBlock from './OrgAuthBlock';
import { navigationItems } from '../../[orgId]/(misc)/data/data';
import { useData } from '../../[orgId]/(misc)/_providers/DataProvider';


// ------------------------------------
// Constants
// ------------------------------------
const OPEN_GROUPS_KEY = 'org-sidebar-open-groups';

// Dashboard item
const dashboardItem = navigationItems.find(
    (item) => item.category === 'Dashboard'
);

// Grouped navigation (excluding Dashboard)
const groupedNavigation = navigationItems.reduce((acc, item) => {
    if (item.category === 'Dashboard') return acc;

    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);

    return acc;
}, {});



export default function OrgSidebar() {
    const params = useParams();
    const { orgId } = params;

    const pathname = usePathname();
    const segment = pathname.split('/')[3] || '/';

    const { topNav } = useData();
    useSession(); // kept to avoid breaking your auth flow

    const [collapsed, setCollapsed] = useState(false);
    const [openGroups, setOpenGroups] = useState({});
    const [hydrated, setHydrated] = useState(false);


    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        setCollapsed(saved === 'true');
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem(OPEN_GROUPS_KEY);
        if (stored) {
            try {
                setOpenGroups(JSON.parse(stored));
            } catch { }
        }
        setHydrated(true);
    }, []);


    useEffect(() => {
        if (!hydrated) return;
        localStorage.setItem(OPEN_GROUPS_KEY, JSON.stringify(openGroups));
    }, [openGroups, hydrated]);


    useEffect(() => {
        if (!hydrated) return;

        Object.entries(groupedNavigation).forEach(([category, items]) => {
            const matchesRoute = items.some((i) => i.url === segment);

            setOpenGroups((prev) => {
                // User already made a choice → respect it
                if (category in prev) return prev;

                if (matchesRoute) {
                    return { ...prev, [category]: true };
                }

                return prev;
            });
        });
    }, [segment, hydrated]);


    const toggleSidebar = () => {
        const next = !collapsed;
        setCollapsed(next);
        localStorage.setItem('sidebar-collapsed', String(next));

        document.documentElement.style.setProperty(
            '--sidebar-width',
            next ? '72px' : '246px'
        );
    };

    const toggleGroup = (category) => {
        setOpenGroups((prev) => ({
            ...prev,
            [category]: !prev[category],
        }));
    };

    if (topNav) return null;


    return (
        <div
            className={`
                        flex flex-col min-h-full text-primary relative
                        transition-all duration-300 ease-in-out
                        ${collapsed ? 'w-[50px]' : 'w-[246px]'}
                    `}
        >
            {/* Header */}
            <div className="p-2 flex items-center justify-between">
                <OrgSwitcher collapsed={collapsed} setCollapsed={setCollapsed} />

                <span onClick={toggleSidebar} className="p-2 cursor-pointer">
                    {collapsed ? (
                        <PanelRightClose className="h-4 w-4" />
                    ) : (
                        <PanelRightOpen className="h-4 w-4" />
                    )}
                </span>
            </div>

            {/* Navigation */}
            <ScrollArea className="h-[85vh] mt-4 ml-2 pr-2">
                {/* Dashboard (always visible) */}
                {dashboardItem && (
                    <SidebarSingleItem
                        title={dashboardItem.title}
                        link={`/workspace/${orgId}/${dashboardItem.url}`}
                        selected={segment === '/'}
                        icon={dashboardItem.icon}
                        collapsed={collapsed}
                    />
                )}

                {/* Grouped Navigation */}
                {Object.entries(groupedNavigation).map(([category, items]) => {
                    const isOpen = openGroups[category];

                    return (
                        <div key={category} className="mt-4">
                            {/* Group Header */}
                            <button
                                onClick={() => !collapsed && toggleGroup(category)}
                                className={`
                                        w-full px-3 py-2 flex items-center justify-between
                                        rounded-md text-xs font-semibold uppercase
                                        text-muted-foreground
                                        hover:bg-primary/10
                                        transition-colors
                                        ${collapsed && 'justify-center'}
                                        `}
                            >
                                {!collapsed && <span>{category}</span>}
                                {!collapsed && (
                                    <span
                                        className={`transition-transform ${isOpen ? 'rotate-90' : ''
                                            }`}
                                    >
                                        ▶
                                    </span>
                                )}
                            </button>

                            {/* Group Items */}
                            <div
                                className={`
                                        overflow-hidden transition-all duration-300 ease-in-out
                                        ${isOpen && !collapsed
                                        ? 'max-h-[500px] opacity-100 mt-1'
                                        : 'max-h-0 opacity-0'
                                    }
                                        `}
                            >
                                {items.map((nav) => (
                                    <SidebarSingleItem
                                        key={nav.url}
                                        title={nav.title}
                                        link={`/workspace/${orgId}/${nav.url}`}
                                        selected={nav.url === segment}
                                        icon={nav.icon}
                                        collapsed={collapsed}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </ScrollArea>

            {/* Footer */}
            <div className="fixed bottom-0 p-2">
                <OrgAuthBlock collapsed={collapsed} />
            </div>
        </div>
    );
}


// ------------------------------------
// Sidebar Item
// ------------------------------------
const SidebarSingleItem = ({
    title,
    link,
    icon,
    selected,
    collapsed,
}) => {
    const item = (
        <Link
            href={link}
            className={`
        px-2 py-2 flex items-center gap-3
        rounded-md cursor-pointer
        transition-all duration-200
        hover:bg-primary/10 dark:hover:bg-card
        text-muted-foreground
        ${selected &&
                'bg-primary/10 border-l-2 border-l-primary text-primary dark:text-white'
                }
      `}
        >
            <DynamicIcon name={icon} size={16} className="shrink-0" />

            <span
                className={`
          text-sm whitespace-nowrap
          transition-all duration-200
          ${collapsed
                        ? 'opacity-0 translate-x-[-6px] w-0'
                        : 'opacity-100 translate-x-0 w-auto'
                    }
        `}
            >
                {title}
            </span>
        </Link>
    );

    if (!collapsed) return <div className="px-1">{item}</div>;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="px-1">{item}</div>
            </TooltipTrigger>
            <TooltipContent side="right">{title}</TooltipContent>
        </Tooltip>
    );
};
