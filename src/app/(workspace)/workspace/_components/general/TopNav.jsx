'use client'
import React, { useEffect, useState } from 'react'
import MobileToggleMenu from './MobileToggleMenu'
import { useSelector } from 'react-redux'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub,
    DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


import { useParams, usePathname } from 'next/navigation'
import OrgAuthBlock from './OrgAuthBlock'
import ThemeSwitcher from '@/components/global/ThemeSwitch'
import Link from "next/link"
import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from '@/components/ui/button'
import { ContextMenuItem } from '@/components/ui/context-menu'
import { navigationItems } from '../../[orgId]/(misc)/data/data'



function buildNavigationByCategory(navigationItems) {
    const map = {};

    for (const item of navigationItems) {
        const category = item.category || "Other";

        if (!map[category]) {
            map[category] = [];
        }

        map[category].push(item);
    }

    return Object.keys(map).map((category) => ({
        category,
        items: map[category],
    }));
}

// Group items by category
const groupedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.category]) {
        acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
}, {});

const categories = Object.keys(groupedItems);

export function TopNav() {
    const title = useSelector((state) => state.org.topnavTitle)
    const server = useSelector((state) => state.org.server)
    const params = useParams()
    const pathName = usePathname()
    const isMobile = useIsMobile()
    const paths = pathName === '/' ? [''] : pathName.split('/')
    const [topNav, setTopNav] = useState(false)

    useEffect(() => {
        const topNav = localStorage.getItem("top-nav")
        const mode = topNav == "true"
        setTopNav(mode)
    }, [])

    const togglrNav = () => {
        console.log('toggle nav')
        const next = !topNav;
        setTopNav(next)
        localStorage.setItem("top-nav", String(next));
    }

    const navs = buildNavigationByCategory(navigationItems)
    const dashboardItem = navigationItems.find((item) => item.category === "Dashboard");
    console.log('dashboardItem', groupedItems)

    return (
        <div className='text-foreground  flex items-center justify-between'>

            {/* Topnav false */}
            <div>
                {!topNav && (
                    <div>
                        <div className='px-2 hidden md:flex items-center gap-2'>
                            <Breadcrumb>
                                <BreadcrumbList>
                                    {paths.map((path, index) => (
                                        < div key={index} className='flex items-center gap-2 text-xs'>
                                            <BreadcrumbItem>
                                                <BreadcrumbLink href={`${path}`} className=' capitalize'>
                                                    {path === '' ? 'dashboard' : path}
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>
                                            {index !== paths.length - 1 && <BreadcrumbSeparator />}
                                        </div>
                                    ))}
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </div>
                )}
            </div>


            {/* TopNav True */}
            {/* <div className='flex flex-row gap-4'>
                {navs.map((nav, index) => {
                    return (
                        <DropdownItem key={index} group={nav} />
                    )
                })}

            </div> */}


            <div className=' justify-end'>
                <div className='flex flex-row gap-4 items-center mr-4'>
                    <ThemeSwitcher />
                </div>
            </div>
        </div>
    )
}


function DropdownItem({ group, isOpen, onMouseEnter, onMouseLeave }) {

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className='text-sm text-muted-foreground focus:border-0  focus:outline-none focus:ring-0 focus-visible:ring-0 '>
                {group?.category}
            </DropdownMenuTrigger>
            <DropdownMenuContent>

                <DropdownMenuGroup>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                </DropdownMenuGroup>

            </DropdownMenuContent>
        </DropdownMenu>
    )
}