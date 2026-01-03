'use client'
import { ScrollArea } from '@/components/ui/scroll-area'
import React from 'react'
import { ContentTopbar } from '../(misc)/_components/ContentTopbar'
import { LabManagement } from './_components/LabManagement'

export default function LaboratoryPage() {
    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <ContentTopbar
                title='Laboratory Management'
                description='Accelerate research, ensure reliability, and enhance care with technology'
                icon='flask-conical'
                action={false}
                actionName='Quick Bill'
                actionIcon='receipt-indian-rupee'
                onActionClick={() => { setQuickBillDialogOpen(true) }}
            />

            <ScrollArea className='h-[85vh] flex flex-grow dark:bg-darkSecondaryBackground p-2 rounded-md border'>
                <LabManagement />
            </ScrollArea>


        </div >
    )
}
