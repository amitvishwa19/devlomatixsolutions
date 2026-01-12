import React from 'react'
import { ContentTopbar } from '../(misc)/_components/ContentTopbar'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function DevPage() {
    return (
        <div className='absolute inset-0 flex flex-col gap-2'>



            <ContentTopbar
                title='Development'
                description='Appointment Calendar for Optimal Patient Flow, Real-Time Updates, and Effortless Time Management'
                icon='combine'

            />

            <ScrollArea className='h-[85vh] flex flex-grow  rounded-md'>
                <div className="p-2 space-y-6 animate-fade-in">



                </div>
            </ScrollArea>


        </div >
    )
}
