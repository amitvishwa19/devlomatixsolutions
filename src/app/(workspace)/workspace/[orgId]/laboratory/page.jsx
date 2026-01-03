'use client'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FlaskConical } from 'lucide-react'
import React from 'react'
import { ContentTopbar } from '../(misc)/_components/ContentTopbar'
import LabManagement from './_components/LabManagement'

export default function LaboratoryPage() {
    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <ContentTopbar
                title='Laboratory Management'
                description='Streamlined Test Orders, Accurate Reporting, and End-to-End Diagnostic Workflow in One Smart Hub'
                icon='flask-conical'
                action={true}
                actionName='New Test'
                actionIcon='save'
                onActionClick={() => { console.log('Action click') }}
            />

            <ScrollArea className='h-[85vh] flex flex-grow dark:bg-darkSecondaryBackground rounded-md pr-4 border'>
                <div>
                    <LabManagement />
                </div>
            </ScrollArea>


        </div >
    )
}
