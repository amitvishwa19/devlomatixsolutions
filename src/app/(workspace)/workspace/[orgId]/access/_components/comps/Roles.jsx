import React, { useState } from 'react'
import { useAccess } from '../../_provider/accessProvider'
import { Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RoleCard } from '../role/RoleCard'
import { RoleFormDialog } from '../role/RoleFormDialog'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'

export default function Roles() {
    const { roles, setRoles } = useAccess()
    // Roles state

    const [roleSearchQuery, setRoleSearchQuery] = useState('');
    const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [deletingRole, setDeletingRole] = useState(null);

    // Filtered data
    const filteredRoles = roles.filter(
        (role) =>
            role.title.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
            role.description.toLowerCase().includes(roleSearchQuery.toLowerCase())
    );

    const handleCreateRole = (data) => {
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

    const handleUpdateRole = (data) => {
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

    const handleDeleteRole = () => {
        if (!deletingRole) return;
        setRoles(roles.filter((r) => r.id !== deletingRole.id));
        toast({
            title: 'Role Deleted',
            description: `${deletingRole.name} has been deleted.`,
        });
        setDeletingRole(null);
    };


    const handleEditRole = (role) => {
        setEditingRole(role);
        setIsRoleFormOpen(true);
    };

    return (
        <div className='flex flex-col gap-4'>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search roles..."
                        value={roleSearchQuery}
                        onChange={(e) => setRoleSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button variant='save' size='sm' onClick={() => setIsRoleFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Role
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRoles.map((role) => (
                    <RoleCard
                        key={role.id}
                        role={role}
                        onEdit={handleEditRole}
                        onDelete={setDeletingRole}
                    />
                ))}
            </div>

            {filteredRoles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">No roles found matching your search.</p>
                </div>
            )}


            {/* Role Form Dialog */}
            <RoleFormDialog
                open={isRoleFormOpen}
                onOpenChange={(open) => {
                    setIsRoleFormOpen(open);
                    if (!open) setEditingRole(null);
                }}
                role={editingRole}
                onSubmit={editingRole ? handleUpdateRole : handleCreateRole}
            />

            <DeleteConfirmDialog
                open={!!deletingRole}
                onOpenChange={(open) => !open && setDeletingRole(null)}
                title="Delete Role"
                description={`Are you sure you want to delete "${deletingRole?.name}"? This action cannot be undone. Users with this role will need to be reassigned.`}
                onConfirm={handleDeleteRole}
            />


        </div>
    )
}
