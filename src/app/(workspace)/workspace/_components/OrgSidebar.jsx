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
    { title: "Workflow", url: "/workflow", icon: "git-branch" },
    { title: "Appointment", url: "/appointment", icon: "calendar" },
    { title: "Calendar", url: "/calendar", icon: "calendar-days" },
    { title: "Documents", url: "/documents", icon: "file-text" },
    { title: "Articles", url: "/articles", icon: "book-open" },
    { title: "Taxonomy", url: "/taxonomy", icon: "tags" },
    { title: "Patients", url: "/patients", icon: "users" },
    { title: "Prescriptions", url: "/prescriptions", icon: "pill" },
    { title: "Services", url: "/services", icon: "stethoscope" },
    { title: "Laboratory", url: "/laboratory", icon: "flask-conical" },
    { title: "Rooms & Beds", url: "/rooms-beds", icon: "bed-double" },
    { title: "Inventory", url: "/inventory", icon: "package" },
    { title: "Invoices", url: "/invoices", icon: "receipt" },
    { title: "Payments", url: "/payments", icon: "credit-card" },
    { title: "Pharmacy", url: "/pharmacy", icon: "cross" },
    { title: "Communication", url: "/communication", icon: "message-square" },
    { title: "Access Management", url: "/access-management", icon: "shield" },
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

            <ScrollArea className='h-[90vh]'>

                {/* {navigationItems?.map((nav, index) => {
                    return (
                        <SidebarSingleItem
                            key={index}
                            title={nav.title}
                            link={`/workspace/${server?.id}/${nav.url}`}
                            selected={url.split('/')[3] === nav.url}
                            icon={nav.icon}
                        />
                    )
                })} */}

                <Accordion type='multiple' defaultValue={defaultAccordianValue} className='py-2'>



                    <SidebarSingleItem
                        title='Dashboard'
                        link={`/workspace/${server?.id}`}
                        selected={url.split('/')[3] === undefined}
                        icon='layout-dashboard'
                    />

                    <SidebarSingleItem
                        title='Workflow'
                        link={`/workspace/${server?.id}/workflow`}
                        selected={url.split('/')[3] === 'workflow'}
                        icon='workflow'
                    />

                    <SidebarSingleItem
                        title='Appointment'
                        link={`/workspace/${server?.id}/appointment`}
                        selected={url.split('/')[3] === 'appointment'}
                        icon='newspaper'
                    />

                    <SidebarSingleItem
                        title='Calendar'
                        link={`/workspace/${server?.id}/calendar`}
                        selected={url.split('/')[3] === 'calendar'}
                        icon='calendar-days'
                    />


                    <SidebarSingleItem
                        title='Documents'
                        link={`/workspace/${server?.id}/document`}
                        selected={url.split('/')[3] === 'document'}
                        icon='files'
                    />

                    <SidebarSingleItem
                        title='Articles'
                        link={`/workspace/${server?.id}/article`}
                        selected={url.split('/')[3] === 'article'}
                        icon='sparkles'
                    />

                    <SidebarSingleItem
                        title='Taxonomy'
                        link={`/workspace/${server?.id}/content/taxonomy`}
                        selected={url.split('/')[4] === 'taxonomy'}
                        icon='hand-helping'
                    />


                    <SidebarSingleItem
                        title='Patients'
                        link={`/workspace/${server?.id}/patient`}
                        selected={url.split('/')[3] === 'patient'}
                        icon='accessibility'
                    />

                    <SidebarSingleItem
                        title='Prescriptions'
                        link={`/workspace/${server?.id}/prescription`}
                        selected={url.split('/')[3] === 'prescription'}
                        icon='pill'
                    />

                    <SidebarSingleItem
                        title='Services'
                        link={`/workspace/${server?.id}/service`}
                        selected={url.split('/')[3] === 'service'}
                        icon='hand-helping'
                    />

                    <SidebarSingleItem
                        title='Laboratory'
                        link={`/workspace/${server?.id}/laboratory`}
                        selected={url.split('/')[3] === 'laboratory'}
                        icon='flask-conical'
                    />

                    <SidebarSingleItem
                        title='Rooms & Beds'
                        link={`/workspace/${server?.id}/accommodation`}
                        selected={url.split('/')[3] === 'accommodation'}
                        icon='bed'
                    />

                    <SidebarSingleItem
                        title='Inventory'
                        link={`/workspace/${server?.id}/inventory`}
                        selected={url.split('/')[3] === 'inventory'}
                        icon='brick-wall-shield'
                    />


                    <SidebarSingleItem
                        title='Invoices'
                        link={`/workspace/${server?.id}/invoice`}
                        selected={url.split('/')[3] === 'invoice'}
                        icon='file-text'
                    />

                    <SidebarSingleItem
                        title='Payments'
                        link={`/workspace/${server?.id}/payment`}
                        selected={url.split('/')[3] === 'payment'}
                        icon='credit-card'
                    />

                    <SidebarSingleItem
                        title='Pharmacy'
                        link={`/workspace/${server?.id}/pharmacy`}
                        selected={url.split('/')[3] === 'pharmacy'}
                        icon='tablets'
                    />

                    <SidebarSingleItem
                        title='Communication'
                        link={`/workspace/${server?.id}/communication`}
                        selected={url.split('/')[3] === 'communication'}
                        icon='megaphone'
                    />

                    <SidebarSingleItem
                        title='Access Management'
                        link={`/workspace/${server?.id}/access`}
                        selected={url.split('/')[3] === 'access'}
                        icon='shield-user'
                    />

                </Accordion>



            </ScrollArea>

            <div className='fixed bottom-0 w-[246px] p-2'>
                <OrgAuthBlock />
            </div>
        </div>
    )
}

const SidebarItem = ({ title, children, value, icon, isActive, onExpand }) => {
    const [expanded, setExpanded] = useState(false)

    const handleOnExpand = (value) => {
        onExpand(value)
        setExpanded(!expanded)
    }

    return (
        <AccordionItem className='border-none rounded-md' value={value} open>
            <AccordionTrigger
                onClick={() => { handleOnExpand(value) }}
                className={cn('hover:dark:bg-darkFocusColor flex item-ccenter gap-x-2 p-0 mt-2 mx-1.5 hover:bg-nuteral-500/10 transition text-start no-underline  rounded-t-md',
                    expanded && 'bg-primary/10 dark:bg-darkPrimaryBackground/60  border ')}
            >
                <div className={cn(` px-2 py-2 w-full rounded-md ${expanded && 'rounded-b-none'}  font-semibold text-md flex flex-row justify-between items-center `)} >
                    <div className='flex flex-row gap-2 items-center font-semibold text-slate-600 dark:text-white'>
                        <AppIcon name={icon} size={14} />
                        {title}
                    </div>
                    {/* {!expanded ? <ChevronRight size={14} className=' text-muted-foreground font-bold' /> : <ChevronDown size={14} className=' text-slate-600' />} */}
                </div>
            </AccordionTrigger>
            <AccordionContent className={`gap-x-2 mx-[6px] p-2 px-4 bg-primary/10 dark:bg-darkPrimaryBackground/60 text-xs rounded-b-md border border-t-0`}>
                {children}
            </AccordionContent>
        </AccordionItem>
    )
}

const SidebarSubItem = ({ title, link, selected }) => {
    const router = useRouter()
    return (
        <div className={`flex text-xs text-muted-foreground items-center justify-between
                    cursor-pointer hover:bg-muted-foreground/10 p-2 rounded-md font-semibold mb-1
                    ${selected && 'bg-muted-foreground/10 dark:bg-darkFocusColor'}`}
            onClick={() => router.push(`${link}`)}
        >
            <span>{title}</span>

        </div>
    )
}

const SidebarSingleItem = ({ title, link, icon, selected }) => {

    return (
        <div className='p-2 -mb-2'>
            <Link
                href={link}
                className={`py-1.5 px-2 flex items-center gap-2 cursor-pointer 
                            hover:bg-primary/10 dark:hover:bg-darkfocus   rounded-md 
                            text-slate-600 dark:text-white/80   
                            ${selected && 'bg-primary/10 dark:bg-darkfocus  border/10'}`}
            >
                <DynamicIcon name={icon} size={16} />
                <span className='text-sm font-semibold'>
                    {title}
                </span>
            </Link>
        </div>
    )
}

