'use client'
import React, { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, } from "@/components/ui/button-group"
import { Button } from '@/components/ui/button'
import { DynamicIcon } from 'lucide-react/dynamic';
import { TaxonomyDashboard } from './_components/category-management-dashboard/TaxonomyDashboard'
import { CatogeriesTree } from './_components/category-tree-management/CatogeriesTree'
import TagsComponent from './_components/tag-management/TagsComponent'

export default function TaxanomyPage() {
    const [active, setActive] = useState({ title: 'dashboard', icon: 'layout-dashboard', component: <TaxonomyDashboard /> })
    const nav = [
        { title: 'dashboard', icon: 'layout-dashboard', component: <TaxonomyDashboard /> },
        { title: 'categories', icon: 'folder-closed', component: <CatogeriesTree /> },
        { title: 'tags', icon: 'tag', component: <TagsComponent /> }
    ]


    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2' >

            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-md border flex flex-row items-center justify-between' >
                <div>
                    <h2 className='text-xl' > Taxonomy Management Dashboard </h2>
                    < h2 className='text-xs text-muted-foreground' > Comprehensive overview of your healthcare content organization system </h2>
                </div>
                < div >
                    <ButtonGroup>
                        {
                            nav.map((item) => (
                                <Button
                                    key={item.title} variant='ghost'
                                    className={`border w-32 capitalize hover:bg-primary/20 dark:hover:bg-darkFocusColor ${active.title === item.title && 'bg-primary/20 dark:bg-darkFocusColor'}`}
                                    onClick={() => { setActive(item) }
                                    }
                                >
                                    <DynamicIcon name={item.icon} />
                                    < span > {item.title} </span>
                                </Button>
                            ))}
                    </ButtonGroup>
                </div>
            </div>


            <div className='h-full  w-full dark:bg-darkSecondaryBackground rounded-md py-2'>
                <ScrollArea className=' mt-0 p-4 flex flex-col gap-4 h-[85vh]  '>
                    {active.component}
                </ScrollArea>
            </div>

        </div>
    )
}
