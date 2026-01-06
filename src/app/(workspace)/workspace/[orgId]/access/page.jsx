'use client'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import React, { useMemo, useState } from 'react'
import { ROLE } from '@prisma/client'
import { StatCard } from './_components/dashboard/StatCard'
import { useAccess } from './_provider/accessProvider'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, } from "@/components/ui/button-group"
import { DynamicIcon } from 'lucide-react/dynamic'
import AccessDashboard from './_components/comps/AccessDashboard'
import Users from './_components/comps/Users'
import Roles from './_components/comps/Roles'
import Permissions from './_components/comps/Permissions'
import { ContentTopbar } from '../(misc)/_components/ContentTopbar'



export default function Dashboard() {
    const routes = [
        { value: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', component: <AccessDashboard /> },
        { value: 'users', label: 'Users', icon: 'user', component: <Users /> },
        { value: 'roles', label: 'Roles', icon: 'shield', component: <Roles /> },
        { value: 'permissions', label: 'Permissions', icon: 'key', component: <Permissions /> }
    ]
    const [active, setActive] = useState(routes[0])



    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>



            <ContentTopbar
                title='User, Roles & Permissions management'
                description='Manage users, define roles, and assign permissions to ensure secure and efficient access across the entire system.'
                icon='shield-user'
                actionComp={<ButtonGroup>
                    {routes?.map((route) => (
                        <Button
                            key={route.value}
                            variant='ghost'
                            size='sm'
                            className={`border w-32 hover:bg-primary/20 hover:dark:bg-darkFocusColor ${active.value === route.value && 'text-sky-500 bg-primary/10 dark:bg-darkFocusColor'}`}
                            onClick={() => { setActive(route) }}
                        >
                            <DynamicIcon name={route.icon} />
                            <span>{route.label}</span>
                        </Button>
                    ))}
                </ButtonGroup>}
            />

            <ScrollArea className='h-[85vh] flex flex-grow  rounded-md'>
                <div className='flex flex-col gap-4 p-2'>
                    {active.component}
                </div>
            </ScrollArea>
        </div>
    )
}
