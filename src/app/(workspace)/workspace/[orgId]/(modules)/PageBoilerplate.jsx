import React from 'react'
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function BillingPage() {
    return (
        <div className='absolute inset-0 flex flex-col gap-2'>



            <ContentTopbar
                title='Demo Page Boilerplate'
                description='Appointment Calendar for Optimal Patient Flow, Real-Time Updates, and Effortless Time Management'
                icon='calendar-days'

            />

            <ScrollArea className='h-[85vh] flex flex-grow  rounded-md'>

            </ScrollArea>


        </div >
    )
}
