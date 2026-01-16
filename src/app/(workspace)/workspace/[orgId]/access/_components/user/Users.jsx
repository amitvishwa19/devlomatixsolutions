import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Edit, Eye, Filter, MoreHorizontal, MoreVertical, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { useAccess } from '../../_provider/accessProvider'
import { Button } from '@/components/ui/button'
import { ROLE } from '@prisma/client'
import { UserFormDialog } from './UserFormDialog'
import { CustomBadge } from '../../../(misc)/_components/CustomBadge'
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { UserDelete } from './UserDelete'
import { DataTable } from '../../../(misc)/_components/DataTable'

export default function Users() {
    const { roles, users, setUsers } = useAccess()
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState({
        isOpen: false,
        mode: 'add',
        user: null
    });
    const [deletingUser, setDeletingUser] = useState({
        isOpen: false,
        mode: 'delete',
        user: null
    });


    const filteredUser = useMemo(() => users?.filter(usr => usr.role !== ROLE.PATIENT), [users])

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

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const columns = [
        {
            accessorKey: "info",
            header: "User",
            cell: ({ row }) => {
                return (
                    <div className='flex flex-row gap-2 items-center'>
                        <Avatar className='rounded-md'>
                            <AvatarImage src={row.original.avatar} />
                            <AvatarFallback><span className='text-xs'>{getInitials(row.original.displayName)}</span></AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                            <span>{row.original.displayName}</span>
                            <span className='text-xs text-muted-foreground'>{row.original.email}</span>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "depaartment",
            header: "Department",
            cell: ({ row }) => {
                return (
                    <div className='flex flex-row items-center gap-2 flex-wrap'>
                        <div>{row.original.departments.length === 0 && <CustomBadge status='blank'>No Department Assigned</CustomBadge>}</div>
                        {row.original.departments?.map((department, index) => (
                            <CustomBadge key={index} status='success'>{department.name}</CustomBadge>
                        ))}
                    </div>
                )
            }
        },
        {
            accessorKey: "roles",
            header: "Roles",
            cell: ({ row }) => {

                return (
                    <div className='flex flex-row items-center gap-2 flex-wrap'>
                        <div>{row.original.roles.length === 0 && <CustomBadge status='blank'>No Role Assigned</CustomBadge>}</div>
                        {row.original.roles?.map((role, index) => (
                            <CustomBadge key={index} status='info'>{role.title}</CustomBadge>
                        ))}
                    </div>
                )
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {

                return (
                    <div className=''>
                        <CustomBadge status={row.original.status ? 'success' : 'na'}>
                            {row.original.status ? 'Active' : 'InActive'}
                        </CustomBadge>
                    </div>
                )
            }
        },
        {
            id: 'action',
            header: "Actions",
            cell: ({ row }) => {

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className=" group-hover:opacity-100 transition-opacity"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() =>
                                setEditingUser({
                                    isOpen: true,
                                    mode: 'edit',
                                    user: row.original
                                })
                            }>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                            </DropdownMenuItem> */}
                            <DropdownMenuItem
                                onClick={() =>
                                    setDeletingUser({
                                        isOpen: true,
                                        mode: 'delete',
                                        user: row.original
                                    })
                                }
                                className="text-orange-500 focus:orange-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        },

    ]

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
                <Button onClick={() => {
                    setEditingUser({
                        isOpen: true,
                        mode: 'add',
                        user: null
                    })
                }} variant={'save'} size='sm'>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>


            <div>
                <DataTable columns={columns} data={filteredUser} />
            </div>



            {filteredUsers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">No users found matching your filters.</p>
                </div>
            )}

            {/* User Form Dialog */}
            <UserFormDialog
                open={editingUser.isOpen}
                onOpenChange={() => {
                    setEditingUser({
                        isOpen: false,
                        mode: 'add',
                        user: null
                    })
                }}
                user={editingUser.user}
                mode={deletingUser.mode}
                roles={roles}
                onSubmit={(user) => {
                    if (user) {
                        setUsers(prev =>
                            prev.some(item => item.id === user.id)
                                ? prev.map(item =>
                                    item.id === user.id ? { ...item, ...user } : item
                                )
                                : [user, ...prev]
                        );
                    }
                }}
            />

            {/* User Delete Confirmation */}
            <UserDelete
                open={deletingUser.isOpen}
                onClose={(user) => {
                    setDeletingUser({
                        isOpen: false,
                        mode: 'add',
                        user: null
                    })
                    if (user) {
                        setUsers(users.filter((usr => usr.id !== user.id && user.role !== ROLE.PATIENT)))
                    }
                }}
                data={deletingUser.user}
                onConfirm={handleDeleteUser}
            />

        </div>
    )
}
