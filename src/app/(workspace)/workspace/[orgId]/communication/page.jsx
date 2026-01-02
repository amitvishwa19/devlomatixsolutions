'use client'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus } from 'lucide-react'
import React, { useState } from 'react'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, } from "@/components/ui/button-group"
import { DynamicIcon } from 'lucide-react/dynamic'
import EmailDashboardInteractive from './_components/email-dashboard/EmailDashboardInteractive'
import ComposeEmailInteractive from './_components/compose-email/ComposeEmailInteractive'
import TemplateManagementInteractive from './_components/template-management/TemplateManagementInteractive'
import RecipientManagementInteractive from './_components/recipient-management/RecipientManagementInteractive'
import EmailReportsInteractive from './_components/email-reports/EmailReportsInteractive'
import MailerIntractive from './_components/mailer/MailerIntractive'

export default function MailerPage() {

    const routes = [
        {
            label: 'Mailer Dashboard',
            value: 'email-dashboard',
            icon: 'chart-no-axes-column-increasing',
            tooltip: 'Streamline Patient Follow-ups, Appointment Reminders, and Internal Collaboration Effortlessly',
            component: <MailerIntractive />
        },
        {
            label: 'Compose',
            value: 'compose-email',
            icon: 'square-pen',
            tooltip: 'Create new email',
            component: <ComposeEmailInteractive />
        },
        {
            label: 'Templates Management',
            value: 'template-management',
            icon: 'file-text',
            tooltip: 'Manage email templates',
            component: <TemplateManagementInteractive />
        },
        {
            label: 'Recipient Management',
            value: 'recipient-management',
            icon: 'users',
            tooltip: 'Organize and maintain contact databases for targeted email communications',
            component: <RecipientManagementInteractive />
        },
        {
            label: 'Reports',
            value: 'email-reports',
            icon: 'file-chart-column-increasing',
            tooltip: 'Analytics and compliance reporting',
            component: <EmailReportsInteractive />
        },
    ]

    const [active, setActive] = useState(routes[0])

    //https://lovable.dev/projects/f804b5f5-88fa-4492-bf54-f4363722810c?magic_link=mc_d4240264-8e81-4c79-b833-1f1dcd6e86c9


    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-md border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>{active?.label}</h2>
                    <h2 className='text-xs text-muted-foreground'>{active?.tooltip}</h2>
                </div>

                {/* <div className='flex flex-row items-center gap-2'>


                    {routes?.map(route => (
                        <Button key={route.value} variant={`${active.value === route.value ? 'save' : 'outline'}`} size='sm' onClick={() => { setActive(route) }}>
                            <DynamicIcon name={route.icon} />
                            {route.label}
                        </Button>
                    ))}


                </div> */}
            </div>

            <ScrollArea className='h-[85vh] flex flex-grow dark:bg-darkSecondaryBackground  rounded-md p-2 border'>
                <MailerIntractive />
            </ScrollArea>

        </div >
    )
}
