'use client'

import Link from 'next/link'
import React, { useState } from 'react'

import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AppIcon } from '@/components/global/AppIcon'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'



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
                className={cn('flex item-ccenter gap-x-2 p-0 mt-2 mx-1.5 hover:bg-nuteral-500/10 transition text-start no-underline hover:no-underline rounded-t-md',
                    expanded && 'bg-[#F0FAF9] dark:bg-[#0E141B]/60  border')}
            >
                <div className={cn('hover:dark:bg-[#1C2736] px-2 py-2 w-full rounded-md font-semibold text-md flex flex-row justify-between items-center ')} >
                    <div className='flex flex-row gap-2 items-center font-semibold'>
                        <AppIcon name={icon} size={14} />
                        {title}
                    </div>
                    {!expanded ? <ChevronRight size={14} className=' text-muted-foreground font-bold' /> : <ChevronDown size={14} className=' text-muted-foreground' />}
                </div>
            </AccordionTrigger>
            <AccordionContent className={`gap-x-2 mx-[6px] p-2 px-4 bg-[#F0FAF9] dark:bg-[#0E141B]/60 text-xs rounded-b-md border border-t-0`}>
                {children}
            </AccordionContent>
        </AccordionItem>
    )
}
