import React, { useState } from 'react'
import { useAccess } from '../../_provider/accessProvider';
import { PermissionMatrix } from '../permission/PermissionMatrix';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PermissionCard from '../permission/PermissionCard';
import { PermissionFormDialog } from '../permission/PermissionFormDialog';
import { PermissionDelete } from '../permission/PermissionDelete';


export default function Permissions() {
    const { roles, permissions, setPermissions } = useAccess()
    const [permissionSearchQuery, setPermissionSearchQuery] = useState('');


    const [isPermissionFormOpen, setIssPermissionFormOpen] = useState(false);
    const [editingsPermission, setEditingsPermission] = useState(null);
    const [deletingsPermission, setDeletingsPermission] = useState(null);
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        permission: null
    })

    // Filtered data
    const filteredPermissions = permissions.filter(
        (permission) =>
            permission.title.toLowerCase().includes(permissionSearchQuery.toLowerCase()) ||
            permission.description.toLowerCase().includes(permissionSearchQuery.toLowerCase())
    );

    const handleCreatePermission = (data) => {
        if (data) {
            setPermissions(prev =>
                prev.some(item => item.id === data.id)
                    ? prev.map(item =>
                        item.id === data.id ? { ...item, ...data } : item
                    )
                    : [data, ...prev]
            );
        }
    };

    const handleUpdatePermission = (data) => {
        if (data) {
            setPermissions(prev =>
                prev.some(item => item.id === data.id)
                    ? prev.map(item =>
                        item.id === data.id ? { ...item, ...data } : item
                    )
                    : [data, ...prev]
            );
        }
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
                                    onDelete={(p) => {
                                        setDeleteModal({
                                            isOpen: true,
                                            permission: p
                                        })
                                    }}
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

            <PermissionDelete
                open={deleteModal.isOpen}
                onClose={(permission) => {
                    setDeleteModal({
                        isOpen: false,
                        permission: false
                    })
                    if (permission) {
                        setPermissions(permissions.filter(per => per.id !== permission.id))
                    }
                }}
                data={deleteModal?.permission}
            />
        </div>
    )
}
