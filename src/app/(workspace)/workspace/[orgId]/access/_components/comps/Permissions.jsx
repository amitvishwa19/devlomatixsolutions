import React, { useState } from 'react'
import { useAccess } from '../../_provider/accessProvider';
import { PermissionMatrix } from '../permission/PermissionMatrix';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PermissionCard from '../permission/PermissionCard';
import { PermissionFormDialog } from '../permission/PermissionFormDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { toast } from '@/hooks/use-toast';

export default function Permissions() {
    const { roles, permissions } = useAccess()
    const [permissionSearchQuery, setPermissionSearchQuery] = useState('');



    const [isPermissionFormOpen, setIssPermissionFormOpen] = useState(false);
    const [editingsPermission, setEditingsPermission] = useState(null);
    const [deletingsPermission, setDeletingsPermission] = useState(null);


    // Filtered data
    const filteredPermissions = permissions.filter(
        (permission) =>
            permission.title.toLowerCase().includes(permissionSearchQuery.toLowerCase()) ||
            permission.description.toLowerCase().includes(permissionSearchQuery.toLowerCase())
    );

    const handleCreatePermission = (data) => {
        const newRole = {
            ...data,
            id: crypto.randomUUID(),
            userCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setRoles([...roles, newRole]);
        toast({
            title: 'Role Created',
            description: `${data.title} has been created successfully.`,
        });
    };

    const handleUpdatePermission = (data) => {
        if (!editingRole) return;
        setRoles(
            roles.map((r) =>
                r.id === editingRole.id
                    ? { ...r, ...data, updatedAt: new Date() }
                    : r
            )
        );
        setEditingRole(null);
        toast({
            title: 'Role Updated',
            description: `${data.name} has been updated successfully.`,
        });
    };

    const handleDeletePermission = (e) => {
        setDeletingsPermission(e)
    };


    const handleEditPermission = (permission) => {
        setEditingsPermission(permission);
        setIssPermissionFormOpen(true);
    };


    return (
        <div className='flex flex-col gap-4'>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search permission..."
                        value={permissionSearchQuery}
                        onChange={(e) => setPermissionSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button variant='save' size='sm' onClick={() => setIssPermissionFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Permission
                </Button>
            </div>


            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">
                    All Permissions ({permissions?.length})
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {permissions?.map((permission) => {
                        const rolesWithPermission = roles.filter((r) =>
                            r.permissions.includes(permission.id)
                        );

                        return (
                            <div key={permission.id}>
                                <PermissionCard
                                    permission={permission}
                                    rolesWithPermission={rolesWithPermission}
                                    onEdit={handleEditPermission}
                                    onDelete={handleDeletePermission}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-4">
                    Permission Matrix
                </h3>
                <PermissionMatrix roles={roles} />
            </div>

            <PermissionFormDialog
                open={isPermissionFormOpen}
                onOpenChange={(open) => {
                    setIssPermissionFormOpen(open);
                    if (!open) setEditingsPermission(null);
                }}
                permission={editingsPermission}
                onSubmit={editingsPermission ? handleUpdatePermission : handleCreatePermission}
            />

            <DeleteConfirmDialog
                open={!!deletingsPermission}
                onOpenChange={(open) => !open && setDeletingsPermission(null)}
                title="Delete Permission"
                description={`Are you sure you want to delete "${deletingsPermission?.title}"? This action cannot be undone. Users with this role will need to be reassigned.`}
                onConfirm={handleDeletePermission}
            />
        </div>
    )
}
