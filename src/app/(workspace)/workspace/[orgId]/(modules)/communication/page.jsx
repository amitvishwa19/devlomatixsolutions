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
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar'

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




    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <ContentTopbar
                title={active?.label}
                description={active?.tooltip}
                icon='mail-check'

            />

            <ScrollArea className='h-[85vh] flex flex-grow  rounded-md'>
                <MailerIntractive />
            </ScrollArea>

        </div >
    )
}
