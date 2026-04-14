import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Edit, Eye, Filter, MoreHorizontal, MoreVertical, Pencil, Plus, Search, Trash2, UserMinus } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { useAccess } from '../../_provider/accessProvider'
import { Button } from '@/components/ui/button'
import { ROLE } from '@prisma/client'
import { UserFormDialog } from './UserFormDialog'
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { UserDelete } from './UserDelete'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/app/workspace/_components/DataTable'
import { toast } from 'sonner'
import { titleCaseLabel } from '@/utils/functions'

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
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? user.isActive : !user.isActive);
        const matchesRole = roleFilter === 'all' || user.roles?.some(r => r.id === roleFilter);
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
        toast.success(`${deletingUser.name} has been removed.`);
        setDeletingUser(null);
    };

    const handleUserFormSubmit = (data) => {
        if (data.id) {
            setUsers(users.map((u) => (u.id === data.id ? { ...u, ...data } : u)));
            toast.success(`${data.name}'s information has been updated.`);
        } else {
            const newUser = {
                id: crypto.randomUUID(),
                name: data.name,
                email: data.email,
                isActive: data.status,
                lastActive: new Date(),
            };
            setUsers([...users, newUser]);
            toast.success(`${data.name} has been added to the system.`);
        }
        setEditingUser(null);
    };

    const getInitials = (name) => {
        return name
            ? name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            : 'U';
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
                            <AvatarFallback><span className='text-xs'>{getInitials(row.original.displayName || row.original.name)}</span></AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                            <span>{row.original.displayName}</span>
                            <span className='text-xs text-muted-foreground'>{row.original.email}</span>
                        </div>
                    </div>
                )
            }
        },
        // Department column removed as it is missing in User model schema
        {
            accessorKey: "roles",
            header: "Roles",
            cell: ({ row }) => {

                return (
                    <div className='flex flex-row items-center gap-2 flex-wrap'>
                        <div>{row.original.roles?.length === 0 && <Badge status='blank'>No Role Assigned</Badge>}</div>
                        {row.original.roles?.map((role, index) => (
                            <Badge key={index} status='info'>{titleCaseLabel(role.title)}</Badge>
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
                        <Badge status={row.original.isActive ? 'success' : 'na'}>
                            {row.original.isActive ? 'Active' : 'InActive'}
                        </Badge>
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
                                className="group-hover:opacity-100 transition-opacity"
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
                                            {role.title}
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
                <DataTable columns={columns} data={filteredUsers} />
            </div>



            {filteredUsers?.length === 0 && (
                <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border/40 rounded-md bg-muted/5 animate-pulse-subtle group overflow-hidden relative">
                    <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className="w-20 h-20 bg-muted/20 rounded-md flex items-center justify-center mb-8 border border-border/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <UserMinus className="w-10 text-muted-foreground/30 group-hover:text-primary/40 transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground/80 mb-3 tracking-tight">
                        {userSearchQuery || statusFilter !== 'all' || roleFilter !== 'all' ? "No users match filters" : "No users found"}
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground/60 max-w-[280px] text-center leading-relaxed mb-8">
                        {userSearchQuery || statusFilter !== 'all' || roleFilter !== 'all'
                            ? "We couldn't find any team members matching your current filters. Try adjusting your search or resetting filters."
                            : "It looks like your workspace hasn't added any users yet. Start by inviting your team members to manage their access."}
                    </p>
                    <div className="flex gap-4">
                        {(userSearchQuery || statusFilter !== 'all' || roleFilter !== 'all') && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-md font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground hover:text-foreground transition-all px-8 border border-border/40 bg-background"
                                onClick={() => {
                                    setUserSearchQuery('');
                                    setStatusFilter('all');
                                    setRoleFilter('all');
                                }}
                            >
                                Reset Filters
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            size="sm"
                            className="rounded-md font-black uppercase tracking-[0.2em] text-[10px] text-primary dark:text-darkFocusColor hover:text-primary hover:bg-primary/5 transition-all px-8 border border-primary/10 shadow-xl shadow-primary/5"
                            onClick={handleAddNewUser}
                        >
                            {userSearchQuery || statusFilter !== 'all' || roleFilter !== 'all' ? "Add User Directly" : "Invite First Member"}
                        </Button>
                    </div>
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