'use client'
import { ScrollArea } from '@/components/ui/scroll-area'
import React, { useState } from 'react'
import { useManagement } from '../_provider/managementProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid3X3, List } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PermissionMatrix } from '../_components/permission/PermissionMatrix';

export default function PermissionPage() {
    const [view, setView] = useState('matrix');
    const { permissions, roles } = useManagement()

    const groupedPermissions = permissions?.reduce((acc, permission) => {
        if (!acc[permission.category]) {
            acc[permission.category] = [];
        }
        acc[permission.category].push(permission);
        return acc;
    }, {});

    console.log('groupedPermissions', groupedPermissions)

    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-lg border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Permissions</h2>
                    <h2 className='text-xs text-muted-foreground'>View and manage permission assignments across roles.</h2>
                </div>
            </div>

            <ScrollArea className='h-[85vh] flex flex-grow dark:bg-darkSecondaryBackground rounded-md pr-4'>
                <div className='flex flex-col gap-4 p-2'>


                    <Tabs value={view} onValueChange={(v) => setView('matrix' | 'list')} className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="matrix" className="gap-2">
                                <Grid3X3 className="h-4 w-4" />
                                Matrix View
                            </TabsTrigger>
                            <TabsTrigger value="list" className="gap-2">
                                <List className="h-4 w-4" />
                                List View
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="matrix" className="animate-fade-in">
                            <PermissionMatrix roles={roles} />
                        </TabsContent>

                        <TabsContent value="list" className="animate-fade-in">
                            <div className="space-y-6">
                                {(Object?.entries(groupedPermissions)).map(
                                    ([category, permissions]) => (
                                        <div
                                            key={category}
                                            className="rounded-xl border border-border bg-card p-6 shadow-soft"
                                        >
                                            <h3 className="text-lg font-semibold text-card-foreground mb-4">
                                                {PERMISSION_CATEGORIES[category].label}
                                            </h3>
                                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                {permissions.map((permission) => {
                                                    const rolesWithPermission = roles.filter((r) =>
                                                        r.permissions.includes(permission.id)
                                                    );
                                                    return (
                                                        <div
                                                            key={permission.id}
                                                            className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
                                                        >
                                                            <h4 className="font-medium text-card-foreground">
                                                                {permission.name}
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {permission.description}
                                                            </p>
                                                            <div className="flex flex-wrap gap-1.5 mt-3">
                                                                {rolesWithPermission.map((role) => (
                                                                    <Badge
                                                                        key={role.id}
                                                                        variant="outline"
                                                                        className="text-xs"
                                                                        style={{ borderColor: role.color, color: role.color }}
                                                                    >
                                                                        {role.name}
                                                                    </Badge>
                                                                ))}
                                                                {rolesWithPermission.length === 0 && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        No roles assigned
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>






                </div>
            </ScrollArea>
        </div>
    )
}
