import React, { useMemo } from 'react'
import { ROLE } from '@prisma/client'
import { Activity, Key, Shield, ShieldOff, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { StatCard } from './dashboard/StatCard'
import { useAccess } from '../_provider/accessProvider'
import { RoleCard } from './role/RoleCard'


export default function AccessDashboard({ user }) {
    const { users, roles, permissions } = useAccess()
    const { data: session } = useSession()



    const totalUsers = useMemo(() => users?.filter(usr => usr.role !== ROLE.PATIENT), [users])
    const activeUsers = useMemo(() => users?.filter(usr => usr.status === true), [users])

    return (
        <div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">

                <StatCard
                    title="Total Users"
                    value={totalUsers?.length || 0}
                    description={`${activeUsers?.length || 0} currently active`}
                    icon={Users}
                    trend={{ value: 8, isPositive: true }}
                />

                <StatCard
                    title="Total Roles"
                    value={roles?.length || 0}
                    description="Active role configurations"
                    icon={Shield}
                    trend={{ value: 12, isPositive: true }}
                />

                <StatCard
                    title="Permissions"
                    value={permissions?.length || 0}
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
            <div className="space-y-6">

                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold tracking-tight text-foreground">Recent Roles</h2>
                        <p className="text-xs font-semibold text-muted-foreground">Manage and assign roles to your team members.</p>
                    </div>
                    <Button variant="outline" size='sm' className="rounded-lg font-bold border-border/60 hover:bg-muted/50 transition-all">
                        View All Roles
                    </Button>
                </div>

                {roles?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/40 rounded-lg bg-muted/5 animate-pulse-subtle group overflow-hidden relative">
                        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div className="w-16 h-16 bg-muted/20 rounded-lg flex items-center justify-center mb-6 border border-border/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                             <ShieldOff className="w-8 h-8 text-muted-foreground/30 group-hover:text-primary/40 transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground/80 mb-2">No roles found</h3>
                        <p className="text-xs font-semibold text-muted-foreground/60 max-w-[200px] text-center leading-relaxed">
                            Start by creating a custom role to define access levels for your workspace.
                        </p>
                        <Button variant="ghost" size="sm" className="mt-6 text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-primary/5 transition-all">
                             Create First Role
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {roles?.slice(0, 3).map((role) => (
                            <RoleCard
                                key={role.id}
                                role={role}
                                onEdit={() => { }}
                                onDelete={() => { }}
                            />
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
}
