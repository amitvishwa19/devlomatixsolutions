'use client'
import { ScrollArea } from '@/components/ui/scroll-area'
import React from 'react'
import { ContentTopbar } from '../(misc)/_components/ContentTopbar'
import { LabManagement } from './_components/LabManagement'
import supabase from '@/supabase/client'




export default function LaboratoryPage() {

    console.log(supabase)
    return (
        <div className=''>
            <LabManagement />
        </div>
    )
}
