'use client'
// Cache touch for Turbopack

import React, { useEffect, useState } from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, MessageSquare } from 'lucide-react'
import { DynamicIcon } from 'lucide-react/dynamic'
import OrgAuthBlock from './OrgAuthBlock'
import { AppLogo } from '@/components/global/AppLogo'
import logo from '@/assets/logo/logo.png'
import Image from 'next/image'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getSidebarItems } from '../_lib/sidebar-items'
import { useAccess } from '@/providers/WorkspaceProvider'
import { useSession } from 'next-auth/react'


const OPEN_GROUPS_KEY = "wa-sidebar-open-groups"


export default function AppSidebar() {

    const pathname = usePathname()
    const params = useParams()
    const { state, setOpen } = useSidebar()
    const { activePermissions, previewRole, isSuperAdmin } = useAccess() || {}

    const workspaceId = params?.workspaceId || "testid"
    const [openGroups, setOpenGroups] = useState({})
    const [hydrated, setHydrated] = useState(false)

    const rawNavigation = getSidebarItems(workspaceId)

    const { data: session } = useSession()

    const normalizePath = (url) => {
        if (!url) return null;
        // Strip /workspace/[id] prefix to get a stable path for matching
        return url.replace(/^\/workspace\/[^/]+/, '') || '/';
    };

    // Permission Filtering Logic
    const navigation = React.useMemo(() => {
        // DEV BYPASS: Return all items for development purposes
        return rawNavigation;

        // 1. If we are in simulation mode (previewRole active), we ALWAYS filter strictly
        if (previewRole) {
            return rawNavigation.filter(item => {
                return (previewRole?.permissions || []).some(p =>
                    p.status === true &&
                    (p.url === normalizePath(item.url) || p.value === item.permission)
                );
            });
        }

        // 3. Admin & Super Admin see everything in their workspace
        if (session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN' || isSuperAdmin) return rawNavigation;

        // 4. Regular users see only items they have explicit permission for
        return rawNavigation.filter(item => {
            const relativeUrl = normalizePath(item.url);
            const slug = relativeUrl === '/' ? 'home' : relativeUrl.replace(/^\//, '').replace(/\//g, '.');
            const navValue = `navigation.${slug}`;
            const parentValue = `navigation.${item.category}.parent`;

            return activePermissions.some(p =>
                p.status === true &&
                (p.url === relativeUrl || p.value === navValue || (item.type === 'parent' && p.value === parentValue) || p.value === item.permission || p.value?.startsWith(`navbar:`))
            );
        });
    }, [rawNavigation, activePermissions, previewRole, isSuperAdmin, session?.user?.role]);

    const groupedNavigation = navigation.reduce((acc, item) => {
        // Skip the parent record in the reduced list if it somehow got through,
        // we will look it up manually to ensure accuracy.
        if (item.type === 'parent') return acc;

        if (!acc[item.category]) {
            // Find the canonical header metadata from the full item list
            const parentItem = rawNavigation.find(i => i.category === item.category && i.type === 'parent');
            acc[item.category] = {
                parent: parentItem || { title: item.category, icon: 'layout-dashboard' },
                children: []
            }
        }

        acc[item.category].children.push(item)
        return acc
    }, {})

    useEffect(() => {
        const stored = localStorage.getItem(OPEN_GROUPS_KEY)
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                setOpenGroups({ ...parsed })
            } catch { }
        }
        setHydrated(true)
    }, [])

    useEffect(() => {
        if (!hydrated) return
        localStorage.setItem(
            OPEN_GROUPS_KEY,
            JSON.stringify(openGroups)
        )
    }, [openGroups, hydrated])

    useEffect(() => {
        if (!hydrated) return

        Object.entries(groupedNavigation).forEach(([category, { children }]) => {
            const matchesRoute = children.some((i) =>
                i.url && (pathname === i.url || pathname.startsWith(i.url + '/'))
            )

            if (matchesRoute && !openGroups[category]) {
                // Accordion behavior: replace state with only the active category
                setOpenGroups({ [category]: true })
            }
        })
    }, [pathname, hydrated])

    const toggleGroup = (category) => {
        if (state === "collapsed") {
            setOpen(true)
            // When expanding from collapsed, open the clicked group
            setOpenGroups({
                [category]: true,
            })
            return
        }

        setOpenGroups((prev) => {
            const isExpanding = !prev[category]
            if (isExpanding) {
                // Accordion behavior: close others when opening a new one
                return {
                    [category]: true
                }
            } else {
                // Just toggle off
                return {
                    ...prev,
                    [category]: false
                }
            }
        })
    }

    return (
        <Sidebar collapsible="icon" className="[&>div]:bg-transparent">


            <SidebarHeader className=" group-data-[collapsible=icon]:p-2 flex flex-row transition-all duration-300 ease-in-out relative min-h-[64px]">
                {/* Full Logo - Fades out when collapsed */}
                <AppLogo
                    link={'/'}
                    size={150}
                    height={50}
                    width={150}
                    border={false}
                    className="transition-all p-2 duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:scale-95 pointer-events-auto group-data-[collapsible=icon]:pointer-events-none"
                />

                {/* Collapsed Logo - Fades in when collapsed */}
                <div id='collapsed-logo' className="absolute inset-0 flex items-center justify-center opacity-0 group-data-[collapsible=icon]:opacity-100 transition-all duration-300 scale-90 group-data-[collapsible=icon]:scale-100 pointer-events-none group-data-[collapsible=icon]:pointer-events-auto">
                    <Image
                        src={logo}
                        alt="Logo"
                        width={40}
                        height={40}
                        className="rounded-md object-contain"
                    />
                </div>
            </SidebarHeader>

            <SidebarContent className="bg-transparent px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:gap-0 overflow-hidden">
                <ScrollArea className='h-[87vh]'>
                    {Object.entries(groupedNavigation).map(([category, { parent, children }]) => {
                        const isOpen = openGroups[category]
                        const hasChildren = children.length > 1
                        const targetUrl = !hasChildren ? (children[0]?.url || parent.url) : undefined
                        const isGroupActive = !hasChildren ? (pathname === targetUrl) : children.some(c => pathname === c.url)

                        return (
                            <SidebarGroup key={category} className="p-0 group-data-[collapsible=icon]:p-0">
                                {parent && (
                                    <SidebarMenu className="px-3 group-data-[collapsible=icon]:px-0">
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                asChild={!hasChildren}
                                                onClick={hasChildren ? () => toggleGroup(category) : undefined}
                                                tooltip={parent.title}
                                                className={`w-full flex mb-2 items-center gap-3 rounded-md text-sm font-medium transition-all group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none cursor-pointer ${isGroupActive ? "bg-primary/10 text-primary shadow-sm border-l-2 border-primary" : "text-foreground hover:bg-card/50 hover:text-primary border-l-2 border-transparent hover:border-primary"}`}
                                            >
                                                {!hasChildren ? (
                                                    <Link href={targetUrl} className="flex items-center gap-3 w-full">
                                                        <DynamicIcon
                                                            name={parent.icon}
                                                            size={18}
                                                            className={`shrink-0 ${isGroupActive ? "text-primary" : "text-muted-foreground"} group-data-[collapsible=icon]:ml-4 group-data-[collapsible=icon]:text-primary`}
                                                        />
                                                        <span className={`flex-1 text-left text-sm font-medium group-data-[collapsible=icon]:hidden ${isGroupActive ? "font-bold" : ""}`}>
                                                            {parent.title}
                                                        </span>
                                                    </Link>
                                                ) : (
                                                    <>
                                                        <DynamicIcon
                                                            name={parent.icon}
                                                            size={18}
                                                            className="shrink-0 text-muted-foreground group-data-[collapsible=icon]:ml-4 group-data-[collapsible=icon]:text-primary"
                                                        />
                                                        <span className="flex-1 text-left text-sm font-medium group-data-[collapsible=icon]:hidden">
                                                            {parent.title}
                                                        </span>
                                                        <ChevronRight
                                                            size={16}
                                                            className={`transition-transform text-muted-foreground group-data-[collapsible=icon]:hidden ${isOpen ? "rotate-90" : ""}`}
                                                        />
                                                    </>
                                                )}
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </SidebarMenu>
                                )}

                                {hasChildren && (
                                    <div className={`overflow-hidden transition-all duration-300 group-data-[collapsible=icon]:hidden ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
                                        <SidebarGroupContent>
                                            <SidebarMenu className="pl-6 group-data-[collapsible=icon]:pl-0">
                                                {children.map((item) => {
                                                    const isActive = pathname === item.url
                                                    return (
                                                        <SidebarMenuItem key={`${item.category}-${item.title}`}>
                                                            <SidebarMenuButton
                                                                asChild
                                                                tooltip={item.title}
                                                                className={`flex items-center gap-3 group-data-[collapsible=icon]:justify-center ml-4 rounded-md hover:bg-card/50 hover:text-primary transition-colors ${isActive ? "bg-primary/5 text-primary" : ""}`}
                                                            >
                                                                <Link href={item.url} className="flex items-center gap-3 w-full">
                                                                    {item.icon ? (
                                                                        <DynamicIcon
                                                                            name={item.icon}
                                                                            size={14}
                                                                            className={`shrink-0 ${isActive ? "text-primary" : "text-muted-foreground opacity-70"}`}
                                                                        />
                                                                    ) : (
                                                                        <div className="w-3.5 h-3.5" /> // Spacer if no icon
                                                                    )}
                                                                    <span className={`group-data-[collapsible=icon]:hidden text-xs ${isActive ? "font-semibold" : "text-muted-foreground"}`}>
                                                                        {item.title}
                                                                    </span>
                                                                </Link>
                                                            </SidebarMenuButton>
                                                        </SidebarMenuItem>
                                                    )
                                                })}
                                            </SidebarMenu>
                                        </SidebarGroupContent>
                                    </div>
                                )}
                            </SidebarGroup>
                        )
                    })}
                </ScrollArea>
            </SidebarContent>


            <SidebarFooter>
                <OrgAuthBlock collapsed={state === 'collapsed'} />
            </SidebarFooter>
        </Sidebar>
    )
}