'use client'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import React, { useMemo, useState } from 'react'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, } from "@/components/ui/button-group"
import { DynamicIcon } from 'lucide-react/dynamic'
import AccessDashboard from './_components/AccessDashboard'
import Users from './_components/user/Users'
import Roles from './_components/comps/Roles'

import { useSession } from 'next-auth/react'
import Permissions from './_components/permission/Permissions'
import { PermissionMatrix } from './_components/permission/PermissionMatrix'
import { authorize } from '@/lib/authorize'
import ProtectedRoute from '@/components/global/ProtectedRoute'



export default function Dashboard() {

    const { data: session } = useSession();

    const routes = [
        { value: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', component: <AccessDashboard user={session?.user} /> },
        { value: 'users', label: 'Users', icon: 'user', component: <Users /> },
        { value: 'roles', label: 'Roles', icon: 'shield-user', component: <Roles /> },
        { value: 'permissions', label: 'Permissions', icon: 'key', component: < PermissionMatrix /> }
    ]
    const [active, setActive] = useState(routes[0])



    return (


        <div className='absolute inset-0 flex flex-col gap-2 p-4'>
            <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold">Access Management</h1>
                    <p className="text-sm text-muted-foreground">Manage users, roles, and permissions.</p>
                </div>
                <ButtonGroup>
                    {routes?.map((route) => (
                        <Button
                            key={route.value}
                            variant='ghost'
                            size='sm'
                            className={`border w-32 hover:bg-primary/20 hover:dark:bg-darkFocusColor ${active.value === route.value && 'text-primary bg-primary/10 dark:bg-darkFocusColor'}`}
                            onClick={() => { setActive(route) }}
                        >
                            <DynamicIcon name={route.icon} />
                            <span>{route.label}</span>
                        </Button>
                    ))}
                </ButtonGroup>
            </div>

            <ScrollArea className='flex-grow '>
                <div className='flex flex-col gap-4'>
                    {active.component}
                </div>
            </ScrollArea>
        </div>


    )
}
