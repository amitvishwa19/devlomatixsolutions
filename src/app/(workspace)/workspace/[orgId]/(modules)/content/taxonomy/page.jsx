'use client'
import React, { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, } from "@/components/ui/button-group"
import { Button } from '@/components/ui/button'
import { DynamicIcon } from 'lucide-react/dynamic';
//import { TaxonomyDashboard } from './_components/category-management-dashboard/TaxonomyDashboard'
import { CatogeriesTree } from './_components/category-tree-management/CatogeriesTree'
//import TagsComponent from './_components/tag-management/TagsComponent'
import DashboardInteractive from './_components/category-management-dashboard/DashboardInteractive'
import CategoryTreeInteractive from './_components/category-tree-management/CategoryTreeInteractive'
import { ContentTopbar } from '../../../(misc)/_components/ContentTopbar'

export default function TaxanomyPage() {
    const [active, setActive] = useState({ title: 'dashboard', icon: 'layout-dashboard', component: <DashboardInteractive /> })
    const nav = [
        { title: 'dashboard', icon: 'layout-dashboard', component: <DashboardInteractive /> },
        { title: 'categories', icon: 'folder-closed', component: <CategoryTreeInteractive /> }
    ]


    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2' >


            <ContentTopbar
                title='Taxonomy Management Dashboard'
                description='Comprehensive overview of your healthcare content organization system '
                icon='group'
                actionComp={
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
                }
            />


            <div className='h-full  w-full  rounded-md  overflow-hidden '>
                <ScrollArea className=' mt-0 flex flex-col gap-4 h-[90vh]  '>
                    {active.component}
                </ScrollArea>
            </div>

        </div>
    )
}
