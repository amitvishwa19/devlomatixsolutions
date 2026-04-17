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
import { getSidebarItems } from '@/constants/sidebar-items'
import { useAccess } from '@/providers/WorkspaceProvider'
import { useSession } from 'next-auth/react'


const OPEN_GROUPS_KEY = "wa-sidebar-open-groups"


export default function AppSidebar() {

    const pathname = usePathname()
    const params = useParams()
    const { state, setOpen } = useSidebar()
    const { activePermissions, previewRole, isSuperAdmin } = useAccess() || {}

    const workspaceId = params?.workspaceId || "testid"
    const [openGroups, setOpenGroups] = useState({ Workspace: true })
    const [hydrated, setHydrated] = useState(false)

    const rawNavigation = getSidebarItems(workspaceId)

    const { data: session } = useSession()
    console.log('session', session)

    const normalizePath = (url) => {
        if (!url) return null;
        // Strip /workspace/[id] prefix to get a stable path for matching
        return url.replace(/^\/workspace\/[^/]+/, '') || '/';
    };

    // Permission Filtering Logic
    const navigation = React.useMemo(() => {
        // 1. If we are in simulation mode (previewRole active), we ALWAYS filter strictly
        if (previewRole) {
            return rawNavigation.filter(item => {
                return (previewRole?.permissions || []).some(p => 
                    p.status === true && 
                    (p.url === normalizePath(item.url) || p.value === item.permission)
                );
            });
        }

        // 3. Admin sees everything in their workspace
        if (session?.user?.role === 'ADMIN') return rawNavigation;

        // 4. Regular users see only items they have explicit permission for
        return rawNavigation.filter(item => {
            const itemPath = normalizePath(item.url);
            const slug = itemPath === '/' ? 'home' : itemPath.replace(/^\//, '').replace(/\//g, '.');
            const navValue = `navigation.${slug}`;

            return activePermissions.some(p => 
                p.status === true && 
                (p.url === itemPath || p.value === navValue || p.value === item.permission || p.value?.startsWith(`navbar:`))
            );
        });
    }, [rawNavigation, activePermissions, previewRole, isSuperAdmin, session?.user?.role]);

    const groupedNavigation = navigation.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = { parent: null, children: [] }
        }
        if (item.type === 'parent') {
            acc[item.category].parent = item
        } else {
            acc[item.category].children.push(item)
        }
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
                pathname.startsWith(i.url)
            )

            if (matchesRoute && !openGroups[category]) {
                setOpenGroups((prev) => ({ ...prev, [category]: true }))
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
                        const hasChildren = children.length > 0

                        return (
                            <SidebarGroup key={category} className="p-0 group-data-[collapsible=icon]:p-0">
                                {parent && (
                                    <SidebarMenu className="px-3 group-data-[collapsible=icon]:px-0">
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                asChild={!hasChildren}
                                                onClick={hasChildren ? () => toggleGroup(category) : undefined}
                                                tooltip={parent.title}
                                                className="w-full flex items-center gap-3 rounded-xl text-sm font-medium text-foreground hover:bg-card/50 hover:text-primary transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none cursor-pointer"
                                            >
                                                {!hasChildren ? (
                                                    <Link href={parent.url} className="flex items-center gap-3 w-full">
                                                        <DynamicIcon
                                                            name={parent.icon}
                                                            size={18}
                                                            className="shrink-0 text-muted-foreground group-data-[collapsible=icon]:ml-4 group-data-[collapsible=icon]:text-primary"
                                                        />
                                                        <span className="flex-1 text-left text-sm font-medium group-data-[collapsible=icon]:hidden">
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

                                <div className={`overflow-hidden transition-all duration-300 group-data-[collapsible=icon]:hidden ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
                                    <SidebarGroupContent>
                                        <SidebarMenu className="pl-6 group-data-[collapsible=icon]:pl-0">
                                            {children.map((item) => {
                                                const isActive = pathname === item.url
                                                return (
                                                    <SidebarMenuItem key={`${item.category}-${item.title}`}>
                                                        <SidebarMenuButton
                                                            asChild
                                                            //isActive={isActive}
                                                            tooltip={item.title}
                                                            className={`flex items-center gap-3 group-data-[collapsible=icon]:justify-center ml-4 rounded-xl hover:bg-card hover:text-primary transition-colors ${isActive ? "" : ""}`}
                                                        >
                                                            <Link href={item.url}>
                                                                <span className={`group-data-[collapsible=icon]:hidden text-xs ${isActive ? "text-primary font-bold" : "text-muted-foreground"}`}>
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