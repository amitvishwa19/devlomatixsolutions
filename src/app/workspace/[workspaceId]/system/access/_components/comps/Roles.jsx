import React, { useState } from 'react'
import { useAccess } from '../../_provider/accessProvider'
import { Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RoleCard } from '../role/RoleCard'
import { RoleFormDialog } from '../role/RoleFormDialog'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import { RoleDelete } from '../role/RoleDelete'

export default function Roles() {
    const { roles, setRoles } = useAccess()
    // Roles state

    const [roleSearchQuery, setRoleSearchQuery] = useState('');
    const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [deletingRole, setDeletingRole] = useState(null);

    const [roleEditor, setRoleEditor] = useState({
        isOpen: false,
        role: null,
        mode: 'add'
    })


    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        role: null,
        mode: 'add'
    })


    // Filtered data
    const filteredRoles = roles.filter(
        (role) =>
            role.title.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
            role.description.toLowerCase().includes(roleSearchQuery.toLowerCase())
    );

    const handleCreateRole = (data) => {
        setRoles(prev =>
            prev.some(item => item.id === data.id)
                ? prev.map(item =>
                    item.id === data.id ? { ...item, ...data } : item
                )
                : [data, ...prev]
        );
    };

    const handleUpdateRole = (data) => {
        setRoles(prev =>
            prev.some(item => item.id === data.id)
                ? prev.map(item =>
                    item.id === data.id ? { ...item, ...data } : item
                )
                : [data, ...prev]
        );
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
                <Button variant='save' size='sm' onClick={() => setRoleEditor({
                    isOpen: true,
                    mode: 'add',
                    role: null
                })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Role
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRoles.map((role) => (
                    <RoleCard
                        key={role.id}
                        role={role}
                        onEdit={() => {
                            setRoleEditor({
                                isOpen: true,
                                mode: 'edit',
                                role: role
                            })
                        }}
                        onDelete={(r) => {
                            setDeleteModal({
                                isOpen: true,
                                role: role
                            })
                        }}
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
                isOpen={roleEditor.isOpen}
                onOpenChange={(open) => {
                    setIsRoleFormOpen(open);
                    if (!open) setEditingRole(null);
                }}
                onClose={() => {
                    setRoleEditor({
                        isOpen: false,
                        role: null,
                        mode: 'add'
                    })
                }}
                role={roleEditor.role}
                onSubmit={editingRole ? handleUpdateRole : handleCreateRole}
            />

            <RoleDelete
                open={deleteModal.isOpen}
                onClose={(role) => {
                    setDeleteModal({
                        isOpen: false,
                        role: false
                    })
                    if (role) {
                        setRoles(roles.filter(per => per.id !== role.id))
                    }
                }}
                data={deleteModal?.role}
            />

        </div>
    )
}
