'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { DynamicIcon } from 'lucide-react/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import OrgAuthBlock from './OrgAuthBlock'
import { AppLogo } from '@/components/global/AppLogo'
import logo from '@/assets/logo/logo.png'
import Image from 'next/image'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getSidebarNavItems } from '../_lib/sidebar-nav-item'
import { useAccess } from '@/providers/WorkspaceProvider'
import { useSession } from 'next-auth/react'

export default function AppSidebar() {
    const pathname = usePathname()
    const params = useParams()
    const { state, setOpen } = useSidebar()
    const { activePermissions, previewRole, isSuperAdmin } = useAccess() || {}
    const { data: session } = useSession()

    const workspaceId = params?.workspaceId || "testid"
    const [openGroups, setOpenGroups] = useState({})
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem("workspace-sidebar")
        if (stored) {
            try {
                setOpenGroups(JSON.parse(stored))
            } catch (e) {
                console.error("Error parsing sidebar state", e)
            }
        }
        setHydrated(true)
    }, [])

    useEffect(() => {
        if (hydrated) {
            localStorage.setItem("workspace-sidebar", JSON.stringify(openGroups))
        }
    }, [openGroups, hydrated])

    const navigation = useMemo(() => getSidebarNavItems(workspaceId), [workspaceId])



    return (
        <Sidebar collapsible="icon" className="[&>div]:bg-transparent glass border-r border-border/50">
            <SidebarHeader className="group-data-[collapsible=icon]:p-2 flex flex-row transition-all duration-300 ease-in-out relative min-h-[64px] border-b border-border/10">
                <AnimatePresence mode="wait">
                    {state === 'expanded' ? (
                        <motion.div
                            key="expanded-logo"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="p-2"
                        >
                            <AppLogo
                                link={'/'}
                                size={150}
                                height={40}
                                width={140}
                                border={false}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="collapsed-logo"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <Image src={logo} alt="Logo" width={32} height={32} className="rounded-md object-contain shadow-glow-sm" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </SidebarHeader>

            <SidebarContent className="bg-transparent px-2 group-data-[collapsible=icon]:px-0 overflow-hidden">
                <ScrollArea className='h-[87vh]'>
                    {navigation.map((item, index) => {
                        const { parent, child, baseUrl } = item;
                        const isOpen = openGroups[index]
                        const isGroupActive = pathname === baseUrl || child.some(c => {
                            if (c.url === `/workspace/${workspaceId}`) return pathname === c.url
                            return pathname === c.url || pathname.startsWith(c.url + '/')
                        })
                        return (
                            <SidebarGroup key={index} className="p-0 group-data-[collapsible=icon]:ml-2">
                                <SidebarMenu className="px-3 group-data-[collapsible=icon]:px-0 ">
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild={!(child && child.length > 0)}
                                            onClick={child && child.length > 0 ? () => setOpenGroups(prev => {
                                                const isCurrentlyOpen = !!prev[index];
                                                // Accordion behavior: if we're opening this one, close everything else.
                                                // If we're closing this one, just return empty.
                                                return isCurrentlyOpen ? {} : { [index]: true };
                                            }) : undefined}
                                            className={`w-full flex items-center gap-3 rounded-md text-sm font-medium transition-all duration-300 cursor-pointer ${isGroupActive ? "bg-primary/10 text-primary border-l-2 border-primary shadow-sm shadow-primary/20" : "text-foreground hover:bg-card/50 hover:text-primary border-l-2 border-transparent hover:border-primary"}`}
                                        >
                                            {child && child.length > 0 ? (
                                                <div className='flex flex-row items-center justify-between w-full pr-2'>
                                                    <div className='flex flex-row items-center gap-2'>
                                                        <DynamicIcon name={parent.icon} size={18} className={`shrink-0 transition-colors ${isGroupActive ? "text-primary" : "text-muted-foreground"}`} />
                                                        <span className={`opacity-90 text-xs transition-all ${isGroupActive ? "font-semibold text-glow" : ""}`}>{parent.title}</span>
                                                    </div>
                                                    <ChevronRight size={14} className={`transition-transform duration-300 text-muted-foreground ${isOpen ? "rotate-90" : ""}`} />
                                                </div>
                                            ) : (
                                                <Link href={parent.url} className='flex flex-row items-center justify-between w-full pr-2'>
                                                    <div className='flex flex-row items-center gap-2'>
                                                        <DynamicIcon name={parent.icon} size={18} className={`shrink-0 transition-colors ${isGroupActive ? "text-primary" : "text-muted-foreground"}`} />
                                                        <span className={`opacity-90 text-xs transition-all ${isGroupActive ? "font-semibold text-glow" : ""}`}>{parent.title}</span>
                                                    </div>
                                                </Link>
                                            )}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                                            className="overflow-hidden"
                                        >
                                            <SidebarGroupContent>
                                                <SidebarMenu className="pl-10 group-data-[collapsible=icon]:pl-0">
                                                    {child.map((c, i) => {
                                                        const isActive = pathname === c.url
                                                        return (
                                                            <SidebarMenuItem key={i}>
                                                                <SidebarMenuButton
                                                                    asChild
                                                                    tooltip={c.title}
                                                                    className={`relative transition-all duration-300 ${i === 0 && 'mt-2'} ${isActive ? "bg-primary/10 text-primary font-semibold" : "hover:bg-primary/5 hover:text-primary/80 text-muted-foreground"}`}
                                                                >
                                                                    <Link href={c.url} className="flex items-center gap-3 w-full group/sub">
                                                                        {c.icon ? (
                                                                            <DynamicIcon 
                                                                                name={c.icon} 
                                                                                size={14} 
                                                                                className={`shrink-0 transition-all duration-300 ${isActive ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "text-muted-foreground/70 group-hover/sub:text-primary/70"}`} 
                                                                            />
                                                                        ) : (
                                                                            <div className="w-3.5 h-3.5" />
                                                                        )}
                                                                        <span className={`text-xs transition-all duration-300 group-data-[collapsible=icon]:hidden ${isActive ? "text-foreground" : "text-muted-foreground group-hover/sub:text-primary/70"}`}>
                                                                            {c.title}
                                                                        </span>
                                                                        
                                                                        {isActive && (
                                                                            <>
                                                                                {/* Active Indicator Dot */}
                                                                                <motion.div 
                                                                                    layoutId="active-nav-dot" 
                                                                                    className="w-1.5 h-1.5 rounded-full bg-primary ml-auto mr-2 shadow-[0_0_8px_rgba(var(--primary),0.8)]" 
                                                                                />
                                                                                {/* Background Shimmer Glow */}
                                                                                <motion.div
                                                                                    className="absolute inset-0 bg-primary/5 rounded-md -z-10"
                                                                                    initial={{ opacity: 0 }}
                                                                                    animate={{ 
                                                                                        opacity: [0.3, 0.6, 0.3],
                                                                                        boxShadow: [
                                                                                            "inset 0 0 0px rgba(var(--primary),0)",
                                                                                            "inset 0 0 10px rgba(var(--primary),0.1)",
                                                                                            "inset 0 0 0px rgba(var(--primary),0)"
                                                                                        ]
                                                                                    }}
                                                                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                                                />
                                                                            </>
                                                                        )}
                                                                    </Link>
                                                                </SidebarMenuButton>
                                                            </SidebarMenuItem>
                                                        )
                                                    })}
                                                </SidebarMenu>
                                            </SidebarGroupContent>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {index < navigation.length - 1 && <div className="my-1" />}
                            </SidebarGroup>
                        )
                    })}
                </ScrollArea>
            </SidebarContent>

            <div className="mt-auto px-2 pb-2">
                <div className="flex flex-col gap-1 p-2 rounded-xl bg-primary/5 border border-primary/10 backdrop-blur-sm group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:items-center">
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 group/footer w-full group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                        <DynamicIcon name="help-circle" size={16} className="shrink-0 opacity-70 group-hover/footer:opacity-100 transition-opacity" />
                        <span className="group-data-[collapsible=icon]:hidden whitespace-nowrap">Help & Support</span>
                    </button>
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 group/footer w-full group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                        <DynamicIcon name="settings" size={16} className="shrink-0 opacity-70 group-hover/footer:opacity-100 transition-opacity" />
                        <span className="group-data-[collapsible=icon]:hidden whitespace-nowrap">System Settings</span>
                    </button>
                </div>
            </div>

            <SidebarFooter>
                <OrgAuthBlock collapsed={state === 'collapsed'} />
            </SidebarFooter>
        </Sidebar>
    )
}