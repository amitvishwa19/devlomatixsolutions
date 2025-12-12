'use client'
import { ScrollArea } from '@/components/ui/scroll-area'
import React, { useState } from 'react'
import { StatsCard } from '../appointment/_components/cards/StatsCard'
import { Button } from '@/components/ui/button'
import { useModal } from '@/hooks/useModal'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { DynamicIcon } from 'lucide-react/dynamic';
import Dashboard from './_components/Dashboard'
import Template from './_components/Template'
import History from './_components/History'
import { Generate } from './_components/post-generator/Generate'
import { useContent } from './_provider/contentProvider'
import { DashboardStatCard } from './_components/DashboardStatCard'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, } from "@/components/ui/button-group"
import PostCreator from './_components/PostCreator'






export default function ContentPage() {
    const { orgId } = useParams()
    const pathname = usePathname();
    const router = useRouter()
    const { posts } = useContent()



    const navigationItems = [
        { label: 'Dashboard', icon: 'square-chart-gantt', component: <Dashboard /> },
        { label: 'Generate with AI', icon: 'sparkles', component: <Generate /> },
        { label: 'New Post', icon: 'newspaper', component: <PostCreator onSuccessPost={() => { console.log('@post posted callback') }} /> },
    ];

    const [selected, setSelected] = useState(navigationItems[0])




    const metricsData = {
        credits: 1250,
        postsGenerated: 87,
        accountStatus: 'Active'
    };

    const recentPostsData = [
        {
            id: 1,
            platform: 'Twitter',
            content: 'Excited to announce our new product launch! 🚀 Join us for an exclusive webinar on December 15th to learn about innovative features that will transform your workflow. Limited seats available - register now!',
            status: 'Published',
            date: '12/03/2025'
        },
        {
            id: 2,
            platform: 'LinkedIn',
            content: 'Thrilled to share insights from our latest industry report. Key findings reveal 73% growth in AI adoption across enterprise sectors. Download the full report to discover actionable strategies for digital transformation.',
            status: 'Scheduled',
            date: '12/05/2025'
        },
        {
            id: 3,
            platform: 'Instagram',
            content: 'Behind the scenes at our innovation lab! ✨ Our team is working on groundbreaking solutions that will redefine customer experience. Stay tuned for exciting updates coming your way soon.',
            status: 'Draft',
            date: '12/02/2025'
        },
        {
            id: 4,
            platform: 'Facebook',
            content: 'Thank you to our amazing community for 10,000 followers! 🎉 Your support drives us to create better content every day. Special giveaway announcement coming this Friday - don\'t miss it!',
            status: 'Published',
            date: '12/01/2025'
        }
    ];

    const creditUsageData = [
        { day: 'Mon', credits: 180 },
        { day: 'Tue', credits: 220 },
        { day: 'Wed', credits: 150 },
        { day: 'Thu', credits: 280 },
        { day: 'Fri', credits: 190 },
        { day: 'Sat', credits: 120 },
        { day: 'Sun', credits: 110 }
    ];

    const quickAccessData = [
        {
            title: 'Saved Drafts',
            description: 'Continue working on your unfinished posts',
            icon: 'DocumentIcon',
            href: '/content-history?filter=drafts',
            count: 12
        },
        {
            title: 'Post Templates',
            description: 'Browse and customize ready-made templates',
            icon: 'DocumentDuplicateIcon',
            href: '/post-templates',
            count: 24
        },
        {
            title: 'Schedule Posts',
            description: 'Plan your content calendar ahead',
            icon: 'CalendarDaysIcon',
            href: '/content-history?filter=scheduled',
            count: 8
        }
    ];


    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-md border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Content Management</h2>
                    <h2 className='text-xs text-white/50'>Schedule, Post, and Track Across All Platforms Effortlessly</h2>
                </div>

                <div>
                    {/* Desktop Navigation */}

                </div>

                <div className='flex flex-row items-center gap-2'>
                    <div className="hidden md:flex items-center space-x-2">

                        <ButtonGroup>
                            {navigationItems?.map((item, index) => (
                                <Button
                                    key={index}
                                    variant={`outline`}
                                    size='sm'
                                    className={`border ${selected.label === item.label && 'bg-primary/10 dark:bg-darkFocusColor'} hover:bg-primary/10 dark:hover:bg-darkFocusColor`}
                                    onClick={() => { setSelected(item) }}
                                >
                                    <DynamicIcon name={item.icon} size={18} className='h-10 line-through' />
                                    {item.label}
                                </Button>
                            ))}
                        </ButtonGroup>


                        {/* {navigationItems?.map((item) => (
                            <Button
                                key={item?.path}
                                variant={'ghost'}
                                size={'sm'}
                                className={`border bg-primary/10 hover:bg-primary/20 
                                    dark:bg-darkFocusColor/20 hover:dark:bg-darkFocusColor
                                    ${item.label === selected.label && 'bg-primary/20 dark:bg-darkFocusColor'}`}
                                onClick={() => { setSelected(item) }}
                            >
                                <DynamicIcon name={item.icon} size={18} className='h-10 line-through' />
                                <span className=' capitalize'>{item?.label}</span>
                            </Button>
                        ))} */}


                    </div>
                    {/* <Button variant='outline' size='sm' onClick={() => { onOpen('new-post') }} className='hover:dark:bg-darkFocusColor'>New Post</Button> */}

                </div>
            </div>



            <ScrollArea className='h-[70vh] flex flex-grow dark:bg-darkSecondaryBackground rounded-md'>
                {selected.component}
            </ScrollArea>


        </div >
    )
}
