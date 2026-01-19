'use client'
import React, { useContext, useEffect, useState } from 'react'
import { ChannelType, MemberRole } from '@prisma/client';
import { BedDouble, BookOpen, BrickWallShield, Calendar, CalendarClock, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Cog, CogIcon, CreditCard, Cross, Divide, File, FileText, FlaskConical, GitBranch, Goal, Hash, KeyIcon, LayoutDashboard, LayoutDashboardIcon, MessageSquare, Mic, Package, Pill, Plus, PlusIcon, Receipt, Settings, Settings2, Shield, ShieldAlert, ShieldCheck, Sparkles, Stethoscope, Tags, Trash2, Users, Video } from "lucide-react";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion"
import { useLocalStorage } from '@uidotdev/usehooks'
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useModal } from '@/hooks/useModal';
import { useOrg } from '@/providers/OrgProvider';
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react';
import OrgAuthBlock from './OrgAuthBlock';
import OrgSwitcher from './OrgSwitcher';
import { cn } from '@/lib/utils';
import { AppIcon } from '@/components/global/AppIcon';
import { DynamicIcon } from 'lucide-react/dynamic';


const iconMap = {
    [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
    [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
    [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />
};

const roleIconMap = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />,
    [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />
}

const navigationItems = [
    { title: "Dashboard", url: "/", icon: "layout-dashboard" },
    { title: "Workflow", url: "workflow", icon: "workflow" },
    { title: "Appointment", url: "appointment", icon: "calendar" },
    { title: "Calendar", url: "calendar", icon: "calendar-days" },
    { title: "Kanban", url: "kanban", icon: "file-text" },
    { title: "Documents", url: "document", icon: "file-text" },
    { title: "Articles", url: "article", icon: "book-open" },
    { title: "Taxonomy", url: "taxonomy", icon: "tags" },
    { title: "Patients", url: "patient", icon: "users" },
    { title: "Prescriptions", url: "prescription", icon: "pill" },
    { title: "Services", url: "services", icon: "stethoscope" },
    { title: "Laboratory", url: "laboratory", icon: "flask-conical" },
    { title: "Rooms & Beds", url: "accomodation", icon: "bed-double" },
    { title: "Inventory", url: "inventory", icon: "package" },
    { title: "Invoices", url: "invoice", icon: "receipt" },
    { title: "Payments", url: "payment", icon: "credit-card" },
    { title: "Pharmacy", url: "pharmacy", icon: "cross" },
    { title: "Communication", url: "communication", icon: "message-square" },
    { title: "Mailbox", url: "mailer", icon: "mails" },
    { title: "Development", url: "dev", icon: "combine" },
    { title: "Access Management", url: "access", icon: "shield-user" },
];

export default function OrgSidebar({ storageKey = 'sidebar-state' }) {
    const { server, servers, hasPermission, superadmin, hasRole } = useOrg()
    const params = useParams()
    const [expanded, setExpanded] = useLocalStorage(storageKey, {})
    const boardId = params?.boardId
    const { data: session } = useSession()
    const userId = session?.user?.userId
    const textChannels = server?.channels.filter((channel) => channel.type === ChannelType.TEXT)
    const audioChannels = server?.channels.filter((channel) => channel.type === ChannelType.AUDIO)
    const videoChannels = server?.channels.filter((channel) => channel.type === ChannelType.VIDEO)
    const members = server?.members.filter((member) => member.userId !== userId)
    const router = useRouter()
    const url = usePathname()

    const role = server?.members.find((member) => member.userId === userId)?.role;
    const { onOpen } = useModal()

    const defaultAccordianValue = Object.keys(expanded)
        .reduce((acc, key) => {
            if (expanded[key]) {
                acc.push(key)
            }
            return acc;
        }, [])

    const onExpand = (i) => {
        setExpanded((curr) => ({
            ...curr,
            [i]: Boolean(expanded[i])
        }))

        //console.log('expanded', expanded)
    }



    return (
        <div className='flex-col min-h-full text-primary  w-[246px]  relative '>

            <div className=' w-[246px] p-2'>
                <OrgSwitcher />
            </div>

            <ScrollArea className="h-[90vh] mt-4">
                {navigationItems.map((nav, index) => {
                    const segment = url.split("/")[3] || "/";
                    const selected =
                        nav.url === "/"
                            ? segment === "/"
                            : segment === nav.url;

                    return (
                        <SidebarSingleItem
                            key={index}
                            title={nav.title}
                            link={`/workspace/${server?.id}/${nav.url}`}
                            selected={selected}
                            icon={nav.icon}
                        />
                    );
                })}
            </ScrollArea>

            <div className='fixed bottom-0 w-[246px] p-2'>
                <OrgAuthBlock />
            </div>
        </div>
    )
}


const SidebarSingleItem = ({ title, link, icon, selected }) => {

    return (
        <div className='p-2 -mb-2'>
            <Link
                href={link}
                className={`py-1.5 px-2 flex items-center gap-2 cursor-pointer 
                            hover:bg-primary/10 dark:hover:bg-card   rounded-md 
                            text-muted-foreground 
                            ${selected && 'bg-primary/10 border-l-2 border-l-primary dark:bg-card text-primary dark:text-white  border/10'}`}
            >
                <DynamicIcon name={icon} size={16} />
                <span className='text-sm font-semibold'>
                    {title}
                </span>
            </Link>
        </div>
    )
}

