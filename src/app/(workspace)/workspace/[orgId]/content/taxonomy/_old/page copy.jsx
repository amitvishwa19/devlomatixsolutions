'use client'
import { ScrollArea } from '@/components/ui/scroll-area'
import React from 'react'
import { TaxonomyManager } from './_components/TaxonomyManager'

export default function TaxonomyPage() {
    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>
            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-md border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Taxonomy</h2>
                    <h2 className='text-xs text-muted-foreground'>Manage categories and tags</h2>
                </div>
            </div>
            <div className='h-full flex flex-grow dark:bg-darkSecondaryBackground p-2 rounded-md bg-red-100'>
                <ScrollArea className='h-[85vh]'>
                    <TaxonomyManager />
                </ScrollArea>
            </div>
        </div>
    )
}
