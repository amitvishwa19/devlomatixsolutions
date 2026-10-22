'use client'
import { Button } from '@/components/ui/button'
import React, { useMemo, useState, useEffect } from 'react'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, } from "@/components/ui/button-group"
import { DynamicIcon } from 'lucide-react/dynamic'
import AccessDashboard from './_components/AccessDashboard'
import Users from './_components/user/Users'
import Roles from './_components/comps/Roles'

import { useSession } from 'next-auth/react'
import Permissions from './_components/permission/Permissions'
import { PermissionTabs } from './_components/permission/PermissionTabs'
import { authorize } from '@/lib/authorize'
import ProtectedRoute from '@/components/global/ProtectedRoute'
import { useAccess } from '@/providers/WorkspaceProvider'
import { Loader2, MonitorSmartphone, X, DatabaseZap } from 'lucide-react'
import AccessSkeleton from './_components/AccessSkeleton'
import { seedAccessData } from './_actions/seed-access-data'
import { toast } from 'sonner'

export default function Dashboard() {

    const { loading, previewRole, setPreviewRole, fetchAccessData } = useAccess();
    const { data: session } = useSession();
    const [isSeeding, setIsSeeding] = useState(false);

    const handleSeedData = async () => {
        setIsSeeding(true);
        toast.loading('Seeding roles & permissions...', { id: 'seed-access' });
        try {
            const result = await seedAccessData();
            if (result?.data) {
                toast.success(
                    `Seeded ${result.data.permissionsSeeded} permissions and ${result.data.rolesSeeded} roles successfully!`,
                    { id: 'seed-access', duration: 5000 }
                );
                fetchAccessData?.();
            } else {
                toast.error(result?.message || 'Seed failed', { id: 'seed-access' });
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to seed access data', { id: 'seed-access' });
        } finally {
            setIsSeeding(false);
        }
    };

    const routes = useMemo(() => [
        { value: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', component: <AccessDashboard user={session?.user} /> },
        { value: 'users', label: 'Users', icon: 'user', component: <Users /> },
        { value: 'roles', label: 'Roles', icon: 'shield-user', component: <Roles /> },
        { value: 'permissions', label: 'Permissions', icon: 'key', component: <PermissionTabs /> }
    ], [session?.user]);

    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTab = localStorage.getItem('system_access_tab');
            if (savedTab && routes.some(r => r.value === savedTab)) {
                setActiveTab(savedTab);
            }
        }
    }, [routes]);

    const activeRoute = useMemo(() => {
        return routes.find(r => r.value === activeTab) || routes[0];
    }, [routes, activeTab]);

    const handleTabChange = (tabValue) => {
        setActiveTab(tabValue);
        if (typeof window !== 'undefined') {
            localStorage.setItem('system_access_tab', tabValue);
        }
    };

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
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSeedData}
                        disabled={isSeeding}
                        className="gap-2 text-xs border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600 cursor-pointer"
                    >
                        {isSeeding ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <DatabaseZap className="w-3.5 h-3.5" />
                        )}
                        <span>Seed Roles & Permissions</span>
                    </Button>
                    <ButtonGroup>
                        {routes?.map((route) => (
                            <Button
                                key={route.value}
                                variant='ghost'
                                size='sm'
                                className={`border w-32   ${activeRoute.value === route.value && 'text-primary '}`}
                                onClick={() => handleTabChange(route.value)}
                            >
                                <DynamicIcon name={route.icon} />
                                <span>{route.label}</span>
                            </Button>
                        ))}
                    </ButtonGroup>
                </div>
            </div>

            <div className='grow overflow-y-auto min-h-0'>
                <div className='flex flex-col gap-4 h-full min-h-100'>
                    {loading ? (
                        <AccessSkeleton />
                    ) : (
                        activeRoute.component
                    )}
                </div>
            </div>
        </div>


    )
}