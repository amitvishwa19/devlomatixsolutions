'use client'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import React, { useMemo } from 'react'
import { useManagement } from './_provider/managementProvider'
import { ROLE } from '@prisma/client'
import { Activity, Key, Shield, Users } from 'lucide-react'
import { StatCard } from './_components/dashboard/StatCard'

export default function Dashboard() {

    const { users, roles, permissions } = useManagement()



    const totalUsers = useMemo(() => users?.filter(usr => usr.role !== ROLE.PATIENT), [])
    const activelUsers = useMemo(() => users?.filter(usr => usr.status === true), [])


    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-lg border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>User, Roles & Permissions management</h2>
                    <h2 className='text-xs text-muted-foreground'>Manage users, define roles, and assign permissions to ensure secure and efficient access across the entire system.</h2>
                </div>
            </div>

            <ScrollArea className='h-[85vh] flex flex-grow dark:bg-darkSecondaryBackground rounded-md pr-4 border'>
                <div className='flex flex-col gap-4 p-2'>


                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">

                        <StatCard
                            title="Total Users"
                            value={totalUsers?.length}
                            description={`${activelUsers?.length} currently active`}
                            icon={Users}
                            trend={{ value: 8, isPositive: true }}
                        />

                        <StatCard
                            title="Total Roles"
                            value={roles?.length}
                            description="Active role configurations"
                            icon={Shield}
                            trend={{ value: 12, isPositive: true }}
                        />

                        <StatCard
                            title="Permissions"
                            value={permissions?.length}
                            description="Across all categories"
                            icon={Key}
                        />

                        <StatCard
                            title="Activity"
                            value="98%"
                            description="System uptime this month"
                            icon={Activity}
                            trend={{ value: 2, isPositive: true }}
                        />


                    </div>






                </div>
            </ScrollArea>
        </div>
    )
}
