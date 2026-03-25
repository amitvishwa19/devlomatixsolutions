'use client'

import React, { useEffect, useState } from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, MessageSquare } from 'lucide-react'
import { DynamicIcon } from 'lucide-react/dynamic'
import OrgAuthBlock from './OrgAuthBlock'
import { AppLogo } from '@/components/global/AppLogo'

const OPEN_GROUPS_KEY = "wa-sidebar-open-groups"


export default function AppSidebar() {

    const pathname = usePathname()
    const params = useParams()
    const { state, setOpen } = useSidebar()

    const workspaceId = params?.workspaceId || "testid"
    const basePath = `/workspace/${workspaceId}/wa`
    const baseDocPath = `/workspace/${workspaceId}/document`
    const baseAccessPath = `/workspace/${workspaceId}/management`
    const systemPath = `/workspace/${workspaceId}/system`
    const baseProductivityPath = `/workspace/${workspaceId}/productivity`
    const baseAtsPath = `/workspace/${workspaceId}/ats`

    const [openGroups, setOpenGroups] = useState({ Workspace: true })
    const [hydrated, setHydrated] = useState(false)

    const navigation = [
        // DASHBOARD
        { type: 'parent', title: "Workspace", url: `/workspace/${workspaceId}`, icon: "layout-dashboard", category: "Workspace" },
        { type: 'child', title: "Dashboard", url: `/workspace/${workspaceId}`, category: "Workspace" },
        { type: 'child', title: "Article", url: `/workspace/${workspaceId}/article`, category: "Workspace" },
        { type: 'child', title: "Category", url: `/workspace/${workspaceId}/category`, category: "Workspace" },


        // WHATSAPP
        { type: 'parent', title: "WhatsApp Manager", url: `${basePath}`, icon: "bar-chart-3", category: "WhatsApp Manager" },
        { type: 'child', title: "Dashboard", url: `${basePath}`, icon: "bar-chart-3", category: "WhatsApp Manager" },
        { type: 'child', title: "Contacts", url: `${basePath}/contacts`, icon: "users", category: "WhatsApp Manager" },
        { type: 'child', title: "Templates", url: `${basePath}/template`, icon: "zap", category: "WhatsApp Manager" },
        { type: 'child', title: "Quick Message", url: `${basePath}/quick-message`, icon: "zap", category: "WhatsApp Manager" },
        { type: 'child', title: "Campaigns", url: `${basePath}/campaigns`, icon: "megaphone", category: "WhatsApp Manager" },
        { type: 'child', title: "Bot Flow Builder", url: `${basePath}/bot-flow-builder`, icon: "git-branch", category: "WhatsApp Manager" },
        { type: 'child', title: "Bulk Sender", url: `${basePath}/bulk-sender`, icon: "upload", category: "WhatsApp Manager" },
        { type: 'child', title: "Button & Quick Reply", url: `${basePath}/button-quick-reply`, icon: "mouse-pointer-click", category: "WhatsApp Manager" },
        { type: 'child', title: "Auto Responder", url: `${basePath}/auto-responder`, icon: "zap", category: "WhatsApp Manager" },
        { type: 'child', title: "Media Support", url: `${basePath}/media-support`, icon: "image", category: "WhatsApp Manager" },
        { type: 'child', title: "Orders & Payments", url: `${basePath}/orders-payments`, icon: "shopping-cart", category: "WhatsApp Manager" },
        { type: 'child', title: "Multi-Platform", url: `${basePath}/multi-platform`, icon: "link-2", category: "WhatsApp Manager" },
        { type: 'child', title: "AI Smart Reply", url: `${basePath}/ai-smart-reply`, icon: "brain", category: "WhatsApp Manager" },
        { type: 'child', title: "Settings", url: `${basePath}/settings`, icon: "settings", category: "WhatsApp Manager" },

        // Document Manager
        { type: 'parent', title: "Documents", url: `${basePath}`, icon: "file", category: "documents" },
        { type: 'child', title: "Dashboard", url: `${baseDocPath}`, icon: "bar-chart-3", category: "documents" },
        { type: 'child', title: "Files", url: `${baseDocPath}/files`, icon: "bar-chart-3", category: "documents" },
        { type: 'child', title: "Folders", url: `${baseDocPath}/folders`, icon: "bar-chart-3", category: "documents" },
        { type: 'child', title: "Uploads", url: `${baseDocPath}/uploads`, icon: "bar-chart-3", category: "documents" },
        { type: 'child', title: "Trash", url: `${baseDocPath}/trash`, icon: "trash", category: "documents" },

        // Applicant tracking system
        { type: 'parent', title: "ATS", url: `${baseAtsPath}`, icon: "file", category: "ats" },
        { type: 'child', title: "Dashboard", url: `${baseAtsPath}`, icon: "bar-chart-3", category: "ats" },
        { type: 'child', title: "Analytics", url: `${baseAtsPath}/analytics`, icon: "bar-chart-3", category: "ats" },
        { type: 'child', title: "Jobs", url: `${baseAtsPath}/jobs`, icon: "bar-chart-3", category: "ats" },
        { type: 'child', title: "Candidates", url: `${baseAtsPath}/candidates`, icon: "bar-chart-3", category: "ats" },
        { type: 'child', title: "Pipeline", url: `${baseAtsPath}/pipeline`, icon: "bar-chart-3", category: "ats" },


        // Productivity Manager
        { type: 'parent', title: "Productivity", url: `${baseProductivityPath}`, icon: "folder-kanban", category: "productivity" },
        { type: 'child', title: "Dashboard", url: `${baseProductivityPath}/`, icon: "bar-chart-3", category: "productivity" },
        { type: 'child', title: "Kanban", url: `${baseProductivityPath}/kanban`, icon: "bar-chart-3", category: "productivity" },
        { type: 'child', title: "Mailbox", url: `${baseProductivityPath}/mailbox`, icon: "mail", category: "productivity" },
        // { type: 'child', title: "Uploads", url: `${baseDocPath}/uploads`, icon: "bar-chart-3", category: "productivity" },
        // { type: 'child', title: "Trash", url: `${baseDocPath}/trash`, icon: "trash", category: "productivity" },

        // Access Management
        { type: 'parent', title: "Access Management", url: `${basePath}`, icon: "file", category: "access-management" },
        { type: 'child', title: "Users", url: `${baseAccessPath}/user`, icon: "bar-chart-3", category: "access-management" },
        { type: 'child', title: "Roles", url: `${baseAccessPath}/role`, icon: "bar-chart-3", category: "access-management" },
        { type: 'child', title: "Permissions", url: `${baseAccessPath}/permission`, icon: "bar-chart-3", category: "access-management" },

        // Access Management
        { type: 'parent', title: "System", url: `${basePath}`, icon: "monitor-cog", category: "system" },
        { type: 'child', title: "Credentials", url: `${systemPath}/credential`, icon: "bar-chart-3", category: "system" },
        { type: 'child', title: "Settings", url: `${systemPath}/setting`, icon: "bar-chart-3", category: "system" },
        { type: 'child', title: "Logs", url: `${systemPath}/log`, icon: "bar-chart-3", category: "system" },

    ]

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
            <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2 flex flex-row items-center justify-between">
                <AppLogo link={'/'} size={100} />
            </SidebarHeader>

            <SidebarContent className="bg-transparent px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:gap-0 overflow-x-hidden">
                {Object.entries(groupedNavigation).map(([category, { parent, children }]) => {
                    const isOpen = openGroups[category]

                    return (
                        <SidebarGroup key={category} className="p-0 group-data-[collapsible=icon]:p-0">
                            {parent && (
                                <SidebarMenu className="px-3 group-data-[collapsible=icon]:px-0">
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            onClick={() => toggleGroup(category)}
                                            tooltip={parent.title}
                                            className="w-full flex items-center gap-3 rounded-md text-sm font-medium text-foreground hover:bg-primary/10 transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none cursor-pointer"
                                        >
                                            <DynamicIcon
                                                name={parent.icon}
                                                size={18}
                                                className="shrink-0 text-muted-foreground"
                                            />
                                            <span className="flex-1 text-left group-data-[collapsible=icon]:hidden">
                                                {parent.title}
                                            </span>
                                            <ChevronRight
                                                size={16}
                                                className={`transition-transform text-muted-foreground group-data-[collapsible=icon]:hidden ${isOpen ? "rotate-90" : ""}`}
                                            />
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
                                                        className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center ml-4"
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
            </SidebarContent>


            <SidebarFooter>
                <OrgAuthBlock collapsed={state === 'collapsed'} />
            </SidebarFooter>
        </Sidebar>
    )
}