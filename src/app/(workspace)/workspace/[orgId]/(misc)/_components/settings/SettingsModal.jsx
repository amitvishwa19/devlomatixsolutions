'use client'
import { useModal } from '@/hooks/useModal';
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DynamicIcon } from 'lucide-react/dynamic';

import Organization from './_components/Organization';
import Members from './_components/Members';
import TermsnCondition from './_components/TermsnCondition';
import Profile from './_components/Profile';
import Database from './_components/Database';
import PrivacyPolicy from './_components/PrivacyPolicy';
import Timings from './_components/Timings';
import SetupWizard from './_components/SetupWizard';



const settingItems = [

    {
        title: 'General',
        value: 'general',
        icon: 'settings',
        description: 'Manage organization details, structure, and preferences.',
        component: <Organization />
    },
    {
        title: 'Timings',
        value: 'timings',
        icon: 'clipboard-clock',
        description: 'Add, remove, and manage team members.',
        component: <Timings />
    },
    {
        title: 'Members',
        value: 'members',
        icon: 'users',
        description: 'Add, remove, and manage team members.',
        component: <Members />
    },
    {
        title: 'Setup Wizard',
        value: 'setup',
        icon: 'tool-case',
        description: 'Application setup and configuration wizard.',
        component: <SetupWizard />
    },
    {
        title: 'Appearance',
        value: 'appearance',
        icon: 'monitor',
        description: 'Customize themes, colors, and UI style.',
        component: <TermsnCondition />
    },
    {
        title: 'Profile',
        value: 'profile',
        icon: 'monitor',
        description: 'Update profile information and personal settings.',
        component: <Profile />
    },
    {
        title: 'Notification',
        value: 'notification',
        icon: 'bell',
        description: 'Control email, push, and in-app notifications.',
        component: <TermsnCondition />
    },
    {
        title: 'Auth',
        value: 'auth',
        icon: 'shield-user',
        description: 'Manage authentication methods and security.',
        component: <TermsnCondition />
    },
    {
        title: 'Database',
        value: 'database',
        icon: 'database',
        description: 'Configure database storage, backups, and settings.',
        component: <Database />
    },
    {
        title: 'Terms & Condition',
        value: 'terms',
        icon: 'handshake',
        description: 'Edit and manage terms & conditions content.',
        component: <TermsnCondition />
    },
    {
        title: 'Privacy Policy',
        value: 'privacy',
        icon: 'globe-lock',
        description: 'Manage and update privacy policy information.',
        component: <PrivacyPolicy />
    }
];



export default function SettingsModal() {

    const [selected, setSelected] = useState({
        title: 'General',
        value: 'general',
        icon: 'settings',
        description: 'Basic application settings and overview.',
        component: <Organization title={'General'} description={'Basic application settings and overview.'} />
    })

    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "orgsetting";



    return (
        <Dialog open={isModalOpen} onOpenChange={() => { onClose() }} modal={true}>

            <DialogContent className=" dark:bg-darkPrimaryBackground min-w-[95%] md:min-w-[90%] lg:min-w-[85%] min-h-[75%] max-h-[75%] rounded-lg p-0 overflow-hidden [&>button:last-child]:hidden" >

                <DialogHeader className={'hidden'}>
                    <DialogTitle>Edit profile</DialogTitle>
                </DialogHeader>


                <div className="flex flex-row">

                    <div className=' w-[20%] border border-l-0 border-t-0 border-b-0 hidden md:flex p-4 text-sm  flex-col gap-10'>
                        <div className='flex flex-row gap-2 py-4'>
                            <Settings size={18} />
                            <span>Organization settings</span>
                        </div>

                        <div>
                            {
                                settingItems.map((item, index) => {

                                    return (
                                        <div
                                            key={index}
                                            className={`flex flex-row items-center gap-4 p-2 w-full cursor-pointer  rounded-md mb-2 text-sm dark:hover:bg-darkFocusColor ${item.value === selected.value && 'dark:bg-darkFocusColor/50'}`}
                                            onClick={() => { setSelected(item) }}
                                        >
                                            <DynamicIcon name={item.icon} strokeWidth={2} size={15} />
                                            <span className={`${item.value != selected.value && 'text-[13px] text-muted-foreground'}`}>{item.title}</span>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>


                    <div className='w-full h-full'>
                        <ScrollArea className='flex-1 w-full h-[75vh] '>
                            <div className='p-2'>
                                {selected.component}
                            </div>
                        </ScrollArea>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    )
}
