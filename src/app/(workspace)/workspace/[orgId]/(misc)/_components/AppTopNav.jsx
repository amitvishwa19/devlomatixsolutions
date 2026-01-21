'use client'
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { icons } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useIsMobile } from "@/hooks/use-mobile";
import { useParams, usePathname } from "next/navigation";
import ThemeSwitcher from "@/components/global/ThemeSwitch";
import { useOrg } from "@/providers/OrgProvider";
import { navigationItems } from "../data/data";
import Link from "next/link";


// Group items by category
const groupedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.category]) {
        acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
}, {});

// Convert to nav structure
const navItems = Object.entries(groupedItems).map(([category, items]) => ({
    label: category,
    items: items,
}));

const Icon = ({ name, className }) => {
    const iconName = name
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
    const LucideIcon = icons[iconName];
    if (!LucideIcon) return null;
    return <LucideIcon className={className} />;
};


const AppTopNav = () => {
    const { server, servers, hasPermission, superadmin, hasRole } = useOrg()
    const CLOSE_DELAY_MS = 1000;
    const [openValue, setOpenValue] = useState("");
    const [viewportOffset, setViewportOffset] = useState(0);
    const closeTimerRef = useRef(null);
    const navRootRef = useRef(null);
    const triggerRefs = useRef({});
    const [topNav, setTopNav] = useState(false)
    const isMobile = useIsMobile()
    const pathName = usePathname()
    const paths = pathName === '/' ? [''] : pathName.split('/')
    const params = useParams();
    const orgId = params?.orgId;



    const getActiveKey = () => {
        const parts = pathName.split("/").filter(Boolean);

        // ["workspace", "orgId"] → dashboard
        if (parts.length === 2) return "/";

        // ["workspace", "orgId", "access"]
        return parts[2];
    };

    const activeKey = getActiveKey();


    const isGroupActive = (items) => {
        return items.some(
            (item) => pathName === `/workspace/${orgId}/${item.url}`
        );
    };

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


    useLayoutEffect(() => {
        if (!openValue) return;
        const trigger = triggerRefs.current[openValue];
        const root = navRootRef.current;
        if (!trigger || !root) return;

        const rootRect = root.getBoundingClientRect();
        const triggerRect = trigger.getBoundingClientRect();

        // Align the dropdown viewport under the active trigger.
        setViewportOffset(Math.max(0, Math.round(triggerRect.left - rootRect.left)));
    }, [openValue]);

    const clearCloseTimer = () => {
        if (closeTimerRef.current !== null) {
            window.clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    };

    const scheduleClose = () => {
        clearCloseTimer();
        closeTimerRef.current = window.setTimeout(() => {
            setOpenValue("");
        }, CLOSE_DELAY_MS);
    };

    return (
        <div className="flex flex-row items-center justify-between">

            {/* Topnav false */}
            <div>

            </div>


            <NavigationMenu
                ref={navRootRef}
                className="hidden md:flex"
                value={openValue}
                style={{
                    // Used by NavigationMenuViewport wrapper to position the dropdown under the trigger.
                    ["--nav-viewport-offset"]: `${viewportOffset}px`,
                }}
                onValueChange={(next) => {
                    if (next === "") {
                        scheduleClose();
                        return;
                    }

                    clearCloseTimer();
                    setOpenValue(next);
                }}
            >
                <NavigationMenuList>
                    {navItems.map((navItem) => {

                        const isNavActive = (navItem) => {
                            return navItem.items.some(item => item.url === activeKey);
                        };


                        return (
                            <NavigationMenuItem key={navItem.label} value={navItem.label}>
                                {navItem.items.length === 1 ? (
                                    <NavigationMenuLink asChild>
                                        <Link
                                            href={`/workspace/${orgId}/${navItem.items[0].url}  `}
                                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-nav-hover
                                                ${isNavActive(navItem) && 'text-primary dark:text-white'}
                                                `}
                                        >
                                            <Icon name={navItem.items[0].icon} className="h-4 w-4" />
                                            {navItem.label}
                                        </Link>
                                    </NavigationMenuLink>
                                ) : (
                                    <>
                                        <NavigationMenuTrigger
                                            ref={(node) => {
                                                triggerRefs.current[navItem.label] = node;
                                            }}
                                            className={`bg-transparent text-muted-foreground hover:bg-nav-hover data-[state=open]:bg-nav-hover focus:bg-transparent ${isGroupActive(navItem.items) && 'text-primary dark:text-white'}`}
                                            onMouseEnter={() => {
                                                clearCloseTimer();
                                                setOpenValue(navItem.label);
                                            }}
                                            onMouseLeave={scheduleClose}
                                        >
                                            {navItem.label}
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent onMouseEnter={clearCloseTimer} onMouseLeave={scheduleClose}>
                                            <ul className="grid w-[280px] gap-1 p-2 bg-dropdown-background">
                                                {navItem.items.map((item) => (
                                                    <ListItem
                                                        key={item.title}
                                                        title={item.title}
                                                        href={`/workspace/${orgId}/${item.url}`}
                                                        icon={item.icon}
                                                        active={pathName === `/workspace/${orgId}/${item.url}`}
                                                    />
                                                ))}
                                            </ul>
                                        </NavigationMenuContent>
                                    </>
                                )}
                            </NavigationMenuItem>
                        )
                    })}
                </NavigationMenuList>
            </NavigationMenu>

            <div className=' justify-end'>
                <div className='flex flex-row gap-4 items-center mr-4'>
                    <ThemeSwitcher />
                </div>
            </div>
        </div>
    );
};


const ListItem = React.forwardRef(({ className, title, href, icon, active, ...props }, ref) => {


    return (
        <li>
            <NavigationMenuLink asChild>
                <Link
                    ref={ref}
                    href={href}
                    className={cn(
                        "flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className,
                    )}
                    {...props}
                >
                    <Icon name={icon} className="h-4 w-4 text-primary" />
                    <span className={`text-sm font-medium leading-none text-muted-foreground ${active && 'text-primary dark:text-white'}`}>{title}</span>

                </Link>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";

export default AppTopNav;
