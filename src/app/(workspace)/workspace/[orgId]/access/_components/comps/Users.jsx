import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, Plus, Search } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { useAccess } from '../../_provider/accessProvider'
import { Button } from '@/components/ui/button'
import { UserTable } from '../user/UserTable'
import { ROLE } from '@prisma/client'
import { UserFormDialog } from '../user/UserFormDialog'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'

export default function Users() {
    const { roles, users } = useAccess()
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);


    const filteredUser = useMemo(() => users?.filter(usr => usr.role !== ROLE.PATIENT), [])

    const filteredUsers = filteredUser?.filter((user) => {
        const matchesSearch =
            user?.displayName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
            user?.email.toLowerCase().includes(userSearchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        const matchesRole = roleFilter === 'all' || user.roleId === roleFilter;
        return matchesSearch && matchesStatus && matchesRole;
    });

    const handleRoleChange = (userId, roleId) => {
        setUsers(users.map((u) => (u.id === userId ? { ...u, roleId } : u)));
        const user = users.find((u) => u.id === userId);
        const role = roles.find((r) => r.id === roleId);

    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setIsUserFormOpen(true);
    };

    const handleAddNewUser = () => {
        setEditingUser(null);
        setIsUserFormOpen(true);
    };

    const handleDeleteUser = () => {
        if (!deletingUser) return;
        setUsers(users.filter((u) => u.id !== deletingUser.id));
        toast({
            title: 'User Deleted',
            description: `${deletingUser.name} has been removed.`,
        });
        setDeletingUser(null);
    };

    const handleUserFormSubmit = (data) => {
        if (data.id) {
            setUsers(users.map((u) => (u.id === data.id ? { ...u, ...data } : u)));
            toast({
                title: 'User Updated',
                description: `${data.name}'s information has been updated.`,
            });
        } else {
            const newUser = {
                id: crypto.randomUUID(),
                name: data.name,
                email: data.email,
                department: data.department,
                roleId: data.roleId,
                status: data.status,
                lastActive: new Date(),
            };
            setUsers([...users, newUser]);
            toast({
                title: 'User Added',
                description: `${data.name} has been added to the system.`,
            });
        }
        setEditingUser(null);
    };

    return (
        <div className='flex flex-col gap-4'>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                {roles?.map((role) => (
                                    <SelectItem key={role.id} value={role.id}>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-2.5 w-2.5 rounded-full"
                                                style={{ backgroundColor: role.color }}
                                            />
                                            {role.displayName}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button onClick={handleAddNewUser} variant={'save'} size='sm'>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            <UserTable
                users={filteredUsers}
                roles={roles}
                onRoleChange={handleRoleChange}
                onEdit={handleEditUser}
                onDelete={setDeletingUser}
            />

            {filteredUsers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">No users found matching your filters.</p>
                </div>
            )}

            {/* User Form Dialog */}
            <UserFormDialog
                open={isUserFormOpen}
                onOpenChange={setIsUserFormOpen}
                user={editingUser}
                roles={roles}
                onSubmit={handleUserFormSubmit}
            />

            {/* User Delete Confirmation */}
            <DeleteConfirmDialog
                open={!!deletingUser}
                onOpenChange={(open) => !open && setDeletingUser(null)}
                title="Delete User"
                description={`Are you sure you want to delete "${deletingUser?.displayName}"? This action cannot be undone.`}
                onConfirm={handleDeleteUser}
            />

        </div>
    )
}
