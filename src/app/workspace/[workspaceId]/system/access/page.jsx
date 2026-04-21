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
import { useAccess } from '@/providers/WorkspaceProvider'
import { Loader2, MonitorSmartphone, X } from 'lucide-react'
import AccessSkeleton from './_components/AccessSkeleton'



export default function Dashboard() {

    const { loading, previewRole, setPreviewRole } = useAccess();

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
            {/* Persona Preview Active Bar */}
            {previewRole && (
                <div className="mb-6 mx-2 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/30 backdrop-blur-md shadow-2xl shadow-primary/20 relative overflow-hidden group">
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/20 animate-pulse">
                                <MonitorSmartphone className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-primary tracking-tight">Persona Simulator Active</h4>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-70">
                                    Simulating as: <span className="text-primary">{previewRole.title}</span>
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewRole(null)}
                            className="rounded-lg border-primary/20 hover:bg-primary/20 hover:text-primary transition-all gap-2 relative z-10 font-bold text-[10px] uppercase tracking-wider px-6 h-10"
                        >
                            <X className="w-4 h-4" />
                            Exit Preview Mode
                        </Button>

                        {/* Decorative background pulse */}
                        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                            <MonitorSmartphone className="w-40 h-40 rotate-12" />
                        </div>
                    </div>
                </div>
            )}
            <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold">Access Management</h1>
                    <p className="text-xs text-muted-foreground">Manage users, roles, and permissions.</p>
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

            <ScrollArea className='grow'>
                <div className='flex flex-col gap-4 h-full min-h-[400px]'>
                    {loading ? (
                        <AccessSkeleton />
                    ) : (
                        active.component
                    )}
                </div>
            </ScrollArea>
        </div>


    )
}