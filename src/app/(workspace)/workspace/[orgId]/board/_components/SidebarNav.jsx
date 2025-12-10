import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from '@/lib/utils'
import Image from 'next/image'
import defaultImage from "@/assets/images/default_image.png";
import { Activity, CreditCard, Layout, Settings } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';


export function SidebarNav({ isActive, organization, isExpanded, onExpand }) {
    const { activeOrg } = useAuth()
    const router = useRouter();
    const pathname = usePathname();

    const routes = [
        {
            label: 'Boards',
            icon: <Layout className='h-4 w-4 mr-2' />,
            href: `/project/taskman/org/${organization?.id}`,
        },
        {
            label: 'Activity',
            icon: <Activity className='h-4 w-4 mr-2' />,
            href: `/project/taskman/org/${organization?.id}/activity`,
        },
        {
            label: 'Settings',
            icon: <Settings className='h-4 w-4 mr-2' />,
            href: `/project/taskman/org/${organization?.id}/setting`,
        },
        {
            label: 'Billing',
            icon: <CreditCard className='h-4 w-4 mr-2' />,
            href: `/project/taskman/org/${organization?.id}/billing`,
        }
    ]

    const onItemClick = (href) => {
        router.push(href)
    }


    return (
        <AccordionItem className='border-none' value={organization.id}>

            <AccordionTrigger
                onClick={() => { onExpand(organization.id) }}
                className={cn('flex item-ccenter gap-x-2 p-1.5  rounded-md hover:bg-nuteral-500/10 transition text-start no-underline hover:no-underline', isActive && !isExpanded && 'bg-slate-300 dark:bg-blue-600')}
            >
                <div className='flex items-center gap-x-2'>
                    <div className='w-7 h-7 relative'>
                        <Image fill src={organization.avatar || defaultImage.src} alt='org' className='rounded-sm object-cover' />
                    </div>
                    <span className='font-medium text-sm'>{organization.title}</span>
                </div>
            </AccordionTrigger>
            <AccordionContent>

                {
                    routes.map((route) => (
                        <Button
                            key={route.href}
                            size='sm' onClick={() => { onItemClick(route.href) }}
                            variant='ghost'
                            className={cn('w-full justify-start pl-10 mb-1 hover:bg-blue-400', pathname === route.href && 'bg-slate-300 dark:bg-blue-600')} >
                            {route.icon}
                            {route.label}
                        </Button>
                    ))
                }
            </AccordionContent>

        </AccordionItem>
    )
}
