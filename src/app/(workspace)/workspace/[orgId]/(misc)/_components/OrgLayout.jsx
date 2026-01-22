'use client'
import React from 'react'
import OrgSidebar from '../../../_components/general/OrgSidebar'
import AppTopNav from './AppTopNav'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

export default function OrgLayout() {
    return (
        <div className={`flex h-screen max-w-screen ${font.className} overflow-hidden dark:bg-darkbackground`}>
            <div className='h-screen flex-grow hidden xl:flex '>
                <OrgSidebar />
            </div>
            <div className='flex  flex-col w-full h-screen transition-all'>
                <div className=''>
                    {/* <TopNav /> */}
                    <AppTopNav />

                </div>
                <div className='h-full relative flex-1 p-2 pt-0'>
                    <ScrollArea className='h-full relative flex-1 rounded-md  dark:bg-darkcontent border overflow-hidden pb-2'>
                        {children}
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
            </div>
        </div>
    )
}
