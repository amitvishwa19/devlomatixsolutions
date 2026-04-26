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
                                            onClick={child && child.length > 0 ? () => setOpenGroups(prev => ({ ...prev, [index]: !prev[index] })) : undefined}
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
                                                                    className={`transition-all duration-200 ${i === 0 && 'mt-2'} ${isActive ? "bg-primary/5 text-primary font-medium" : "hover:bg-muted/50"}`}
                                                                >
                                                                    <Link href={c.url} className="flex items-center gap-3 w-full">
                                                                        {c.icon ? <DynamicIcon name={c.icon} size={14} className={`shrink-0 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} /> : <div className="w-3.5 h-3.5" />}
                                                                        <span className={`text-xs transition-all group-data-[collapsible=icon]:hidden ${isActive ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{c.title}</span>
                                                                        {isActive && <motion.div layoutId="active-nav-dot" className="w-1 h-1 rounded-full bg-primary ml-auto mr-2" />}
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

            <SidebarFooter>
                <OrgAuthBlock collapsed={state === 'collapsed'} />
            </SidebarFooter>
        </Sidebar>
    )
}