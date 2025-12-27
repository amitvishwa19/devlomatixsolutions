import React, { useMemo } from 'react'
import { StatCard } from '../dashboard/StatCard'
import { useAccess } from '../../_provider/accessProvider'
import { ROLE } from '@prisma/client'
import { Activity, Key, Shield, Users } from 'lucide-react'
import { RoleCard } from '../role/RoleCard'
import { Button } from '@/components/ui/button'

export default function AccessDashboard() {
    const { users, roles, permissions } = useAccess()

    const totalUsers = useMemo(() => users?.filter(usr => usr.role !== ROLE.PATIENT), [])
    const activelUsers = useMemo(() => users?.filter(usr => usr.status === true), [])

    return (
        <div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">

                <StatCard
                    title="Total Users"
                    value={totalUsers?.length || 0}
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

            {/* Recent Roles */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Recent Roles</h2>
                    <Button variant="outline" size='sm'>
                        View All Roles
                    </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {roles?.slice(0, 3).map((role) => (
                        <RoleCard
                            key={role.id}
                            role={role}
                            onEdit={() => { }}
                            onDelete={() => { }}
                        />
                    ))}
                </div>
            </div>

        </div>
    )
}
