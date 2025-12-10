'use client'
import React, { useContext, useEffect, useState } from 'react'
import { ChannelType, MemberRole } from '@prisma/client';
import { BrickWallShield, CalendarClock, ChevronDown, ChevronRight, Cog, CogIcon, CreditCard, Divide, File, FileText, Goal, Hash, KeyIcon, LayoutDashboard, LayoutDashboardIcon, Mic, Plus, PlusIcon, Settings, Settings2, ShieldAlert, ShieldCheck, Trash2, Video } from "lucide-react";
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
import OrgSearch from './OrgSearch';
import { Separator } from '@/components/ui/separator';
import ServerSection from './ServerSection';
import ServerChannel from './ServerChannel';
import ServerMember from './ServerMember';
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



    useEffect(() => {
        //console.log('Superadmin', superadmin(), 'Role', hasRole('management'), 'Permission', hasPermission('moderator'))
    }, [session])



    return (
        <div className='flex-col min-h-full text-primary  w-[246px] dark:bg-[#171F26]/90 relative border border-l-0'>

            <div className=' w-[246px] p-2'>
                <OrgSwitcher />
            </div>

            <ScrollArea className=''>

                <Accordion type='multiple' defaultValue={defaultAccordianValue} className='py-2'>



                    <SidebarSingleItem
                        title='Dashboard'
                        link={`/workspace/${server?.id}`}
                        selected={url.split('/')[3] === undefined}
                        icon='layout-dashboard'
                    />

                    <SidebarItem onExpand={onExpand} title={'Content Management'} value={'content'} icon='Sparkles' >
                        <div className='flex flex-col' onClick={() => { console.log('first') }}>

                            <SidebarSubItem
                                title='Content'
                                link={`/workspace/${server?.id}/content`}
                                selected={url.split('/')[3] === 'content' && url.split('/').length === 4}
                            />



                            <SidebarSubItem
                                title='Taxonomy'
                                link={`/workspace/${server?.id}/content/taxonomy`}
                                selected={url.split('/')[3] === 'category' && url.split('/').length === 4}
                            />

                        </div>
                    </SidebarItem>


                    <SidebarItem onExpand={onExpand} title={'Channels'} value={'channel'} icon='Rss' >
                        <div className='flex flex-col'>
                            <div className='mt-2'>
                                <OrgSearch
                                    data={[
                                        {
                                            label: "Text Channels",
                                            type: "channel",
                                            data: textChannels?.map((channel) => ({
                                                id: channel.id,
                                                name: channel.name,
                                                icon: iconMap[channel.type],
                                            }))
                                        },
                                        {
                                            label: "Voice Channels",
                                            type: "channel",
                                            data: audioChannels?.map((channel) => ({
                                                id: channel.id,
                                                name: channel.name,
                                                icon: iconMap[channel.type],
                                            }))
                                        },
                                        {
                                            label: "Video Channels",
                                            type: "channel",
                                            data: videoChannels?.map((channel) => ({
                                                id: channel.id,
                                                name: channel.name,
                                                icon: iconMap[channel.type],
                                            }))
                                        },
                                        {
                                            label: "Members",
                                            type: "member",
                                            data: members?.map((member) => ({
                                                id: member.id,
                                                name: member?.user?.displayName,
                                                icon: roleIconMap[member.role],
                                            }))
                                        },
                                    ]}
                                />
                            </div>

                            <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />

                            {!!textChannels?.length && (
                                <div className="mb-2">
                                    <ServerSection
                                        sectionType="channels"
                                        channelType={ChannelType.TEXT}
                                        role={role}
                                        label="Text Channels"
                                    />
                                    <div className="space-y-[2px]">
                                        {textChannels.map((channel) => (
                                            <ServerChannel
                                                key={channel.id}
                                                channel={channel}
                                                role={role}
                                                server={server}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!!audioChannels?.length && (
                                <div className="mb-2">
                                    <ServerSection
                                        sectionType="channels"
                                        channelType={ChannelType.AUDIO}
                                        role={role}
                                        label="Voice Channels"
                                    />
                                    <div className="space-y-[2px]">
                                        {audioChannels.map((channel) => (
                                            <ServerChannel
                                                key={channel.id}
                                                channel={channel}
                                                role={role}
                                                server={server}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!!videoChannels?.length && (
                                <div className="mb-2">
                                    <ServerSection
                                        sectionType="channels"
                                        channelType={ChannelType.VIDEO}
                                        role={role}
                                        label="Video Channels"
                                    />
                                    <div className="space-y-[2px]">
                                        {videoChannels.map((channel) => (
                                            <ServerChannel
                                                key={channel.id}
                                                channel={channel}
                                                role={role}
                                                server={server}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!!members?.length && (
                                <div className="mb-2">
                                    <ServerSection
                                        sectionType="members"
                                        role={role}
                                        label="Members"
                                        server={server}
                                    />
                                    <div className="space-y-[2px]">
                                        {members.map((member) => (
                                            <ServerMember
                                                key={member.id}
                                                member={member}
                                                server={server}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </SidebarItem>

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
                        title='Patients'
                        link={`/workspace/${server?.id}/patient`}
                        selected={url.split('/')[3] === 'patient'}
                        icon='stethoscope'
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

                    {/* {(hasRole('management') || superadmin()) && ( */}
                    <SidebarItem onExpand={onExpand} title={'Management'} value={'management'} icon='ShieldUser' >

                        <div className='flex flex-col' onClick={() => { console.log('first') }}>

                            <SidebarSubItem
                                title='Users'
                                link={`/workspace/${server?.id}/management/user`}
                                selected={url.split('/')[4] === 'user'}
                            />

                            <SidebarSubItem
                                title='Roles'
                                link={`/workspace/${server?.id}/management/role`}
                                selected={url.split('/')[4] === 'role'}
                            />

                            <SidebarSubItem
                                title='Permissions'
                                link={`/workspace/${server?.id}/management/permission`}
                                selected={url.split('/')[4] === 'permission'}
                            />

                        </div>
                    </SidebarItem>
                    {/* )} */}


                    <SidebarSingleItem
                        title='Department'
                        link={`/workspace/${server?.id}/department`}
                        selected={url.split('/')[3] === 'department'}
                        icon='cog'
                    />

                    <SidebarSingleItem
                        title='Reports'
                        link={`/workspace/${server?.id}/report`}
                        selected={url.split('/')[3] === 'report'}
                        icon='chart-area'
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
                className={cn('flex item-ccenter gap-x-2 p-0 mt-2 mx-1.5 hover:bg-nuteral-500/10 transition text-start no-underline  rounded-t-md',
                    expanded && 'bg-primary/10 dark:bg-darkPrimaryBackground/60  border ')}
            >
                <div className={cn(`hover:dark:bg-[#1C2736] px-2 py-2 w-full rounded-md ${expanded && 'rounded-b-none'}  font-semibold text-md flex flex-row justify-between items-center `)} >
                    <div className='flex flex-row gap-2 items-center font-semibold text-slate-600 dark:text-white'>
                        <AppIcon name={icon} size={14} />
                        {title}
                    </div>
                    {!expanded ? <ChevronRight size={14} className=' text-muted-foreground font-bold' /> : <ChevronDown size={14} className=' text-slate-600' />}
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
                className={`p-2 px-2 flex items-center gap-2 cursor-pointer 
                            hover:bg-primary/10 hover:dark:bg-darkFocusColor  rounded-sm 
                            text-slate-600 dark:text-white/80   
                            ${selected && 'bg-primary/10 dark:bg-darkFocusColor border'}`}
            >
                <DynamicIcon name={icon} size={16} />
                <span className='text-sm font-semibold'>
                    {title}
                </span>
            </Link>
        </div>
    )
}

