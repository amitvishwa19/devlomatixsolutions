'use client'

import React, { useState } from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { DynamicIcon } from 'lucide-react/dynamic'
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

    const navigation = getSidebarNavItems(workspaceId)

    return (
        <Sidebar collapsible="icon" className="[&>div]:bg-transparent">


            <SidebarHeader className=" group-data-[collapsible=icon]:p-2 flex flex-row transition-all duration-200 ease-in-out relative min-h-[64px]">
                <AppLogo
                    link={'/'}
                    size={150}
                    height={50}
                    width={150}
                    border={false}
                    className="transition-all p-2 duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:scale-95 pointer-events-auto group-data-[collapsible=icon]:pointer-events-none"
                />
                <div id='collapsed-logo' className="absolute inset-0 flex items-center justify-center opacity-0 group-data-[collapsible=icon]:opacity-100 transition-all duration-200 scale-90 group-data-[collapsible=icon]:scale-100 pointer-events-none group-data-[collapsible=icon]:pointer-events-auto">
                    <Image src={logo} alt="Logo" width={40} height={40} className="rounded-md object-contain" />
                </div>
            </SidebarHeader>

            <SidebarContent className="bg-transparent px-2 group-data-[collapsible=icon]:px-0 overflow-hidden">
                <ScrollArea className='h-[87vh]'>
                    {navigation.map((item, index) => {
                        const { parent, child, baseUrl } = item;
                        const Icon = parent.icon;
                        return (
                            <SidebarGroup key={index} className="p-0">
                                <SidebarMenu className="px-3 group-data-[collapsible=icon]:px-0">
                                    <SidebarMenuItem>
                                        <SidebarMenuButton>
                                            <div className='flex flex-row items-center gap-2'>
                                                <DynamicIcon name={Icon} size={18} className="shrink-0 text-muted-foreground" />
                                                <span className='opacity-90'>{parent.title}</span>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>

                                <SidebarGroupContent>
                                    <SidebarMenu className="pl-6 group-data-[collapsible=icon]:pl-0">
                                        {child.map((c, i) => {
                                            const isActive = pathname === c.url
                                            return (
                                                <SidebarMenuItem key={i}>
                                                    <SidebarMenuButton
                                                        asChild
                                                        tooltip={c.title}
                                                    >
                                                        <Link href={c.url} className="flex items-center gap-3 w-full">
                                                            {c.icon ? <DynamicIcon name={c.icon} size={14} className="shrink-0" /> : <div className="w-3.5 h-3.5" />}
                                                            <span className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">{c.title}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            )
                                        })}
                                    </SidebarMenu>
                                </SidebarGroupContent>


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