'use client'
import React, { useEffect, useState } from 'react'
import MobileToggleMenu from './MobileToggleMenu'
import { useSelector } from 'react-redux'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, } from "@/components/ui/navigation-menu"
import { useParams, usePathname } from 'next/navigation'
import OrgAuthBlock from './OrgAuthBlock'
import ThemeSwitcher from '@/components/global/ThemeSwitch'
import Link from "next/link"
import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from '@/components/ui/button'

const components = [
    {
        title: "Alert Dialog",
        href: "/docs/primitives/alert-dialog",
        description:
            "A modal dialog that interrupts the user with important content and expects a response.",
    },
    {
        title: "Hover Card",
        href: "/docs/primitives/hover-card",
        description:
            "For sighted users to preview content available behind a link.",
    },
    {
        title: "Progress",
        href: "/docs/primitives/progress",
        description:
            "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
    },
    {
        title: "Scroll-area",
        href: "/docs/primitives/scroll-area",
        description: "Visually or semantically separates content.",
    },
    {
        title: "Tabs",
        href: "/docs/primitives/tabs",
        description:
            "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
    },
    {
        title: "Tooltip",
        href: "/docs/primitives/tooltip",
        description:
            "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
    },
]

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

    return (
        <div className='text-foreground  flex items-center justify-between p-2 '>

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
            <div>
                <NavigationMenu >
                    <NavigationMenuList className="flex-wrap">
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Home</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                                    <li className="row-span-3">
                                        <NavigationMenuLink asChild>
                                            <a
                                                className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-4 no-underline outline-hidden transition-all duration-200 select-none focus:shadow-md md:p-6"
                                                href="/"
                                            >
                                                <div className="mb-2 text-lg font-medium sm:mt-4">
                                                    shadcn/ui
                                                </div>
                                                <p className="text-muted-foreground text-sm leading-tight">
                                                    Beautifully designed components built with Tailwind CSS.
                                                </p>
                                            </a>
                                        </NavigationMenuLink>
                                    </li>
                                    <ListItem href="/docs" title="Introduction">
                                        Re-usable components built using Radix UI and Tailwind CSS.
                                    </ListItem>
                                    <ListItem href="/docs/installation" title="Installation">
                                        How to install dependencies and structure your app.
                                    </ListItem>
                                    <ListItem href="/docs/primitives/typography" title="Typography">
                                        Styles for headings, paragraphs, lists...etc
                                    </ListItem>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                    {components.map((component) => (
                                        <ListItem
                                            key={component.title}
                                            title={component.title}
                                            href={component.href}
                                        >
                                            {component.description}
                                        </ListItem>
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                <Link href="/docs">Docs</Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem className="hidden md:block">
                            <NavigationMenuTrigger>List</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[300px] gap-4">
                                    <li>
                                        <NavigationMenuLink asChild>
                                            <Link href="#">
                                                <div className="font-medium">Components</div>
                                                <div className="text-muted-foreground">
                                                    Browse all components in the library.
                                                </div>
                                            </Link>
                                        </NavigationMenuLink>
                                        <NavigationMenuLink asChild>
                                            <Link href="#">
                                                <div className="font-medium">Documentation</div>
                                                <div className="text-muted-foreground">
                                                    Learn how to use the library.
                                                </div>
                                            </Link>
                                        </NavigationMenuLink>
                                        <NavigationMenuLink asChild>
                                            <Link href="#">
                                                <div className="font-medium">Blog</div>
                                                <div className="text-muted-foreground">
                                                    Read our latest blog posts.
                                                </div>
                                            </Link>
                                        </NavigationMenuLink>
                                    </li>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                        <NavigationMenuItem className="hidden md:block">
                            <NavigationMenuTrigger>Simple</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[200px] gap-4">
                                    <li>
                                        <NavigationMenuLink asChild>
                                            <Link href="#">Components</Link>
                                        </NavigationMenuLink>
                                        <NavigationMenuLink asChild>
                                            <Link href="#">Documentation</Link>
                                        </NavigationMenuLink>
                                        <NavigationMenuLink asChild>
                                            <Link href="#">Blocks</Link>
                                        </NavigationMenuLink>
                                    </li>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                        <NavigationMenuItem className="hidden md:block">
                            <NavigationMenuTrigger>With Icon</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[200px] gap-4">
                                    <li>
                                        <NavigationMenuLink asChild>
                                            <Link href="#" className="flex-row items-center gap-2">
                                                <CircleHelpIcon />
                                                Backlog
                                            </Link>
                                        </NavigationMenuLink>
                                        <NavigationMenuLink asChild>
                                            <Link href="#" className="flex-row items-center gap-2">
                                                <CircleIcon />
                                                To Do
                                            </Link>
                                        </NavigationMenuLink>
                                        <NavigationMenuLink asChild>
                                            <Link href="#" className="flex-row items-center gap-2">
                                                <CircleCheckIcon />
                                                Done
                                            </Link>
                                        </NavigationMenuLink>
                                    </li>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            <Button variant='outline'>test</Button>
            <div className=' justify-end'>
                <div className='flex flex-row gap-4 items-center mr-4'>
                    <ThemeSwitcher />
                </div>
            </div>
        </div>
    )
}


function ListItem({ title, children, href, ...props }) {
    return (
        <li {...props}>
            <NavigationMenuLink asChild>
                <Link href={href}>
                    <div className="text-sm leading-none font-medium">{title}</div>
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                        {children}
                    </p>
                </Link>
            </NavigationMenuLink>
        </li>
    )
}