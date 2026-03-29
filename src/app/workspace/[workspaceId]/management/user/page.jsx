'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import axios from '@/utils/axios';
import { useModal } from '@/hooks/useModal';
import { AlertModal } from '@/components/global/AlertModal';
import {
 Loader2,
 Plus,
 Shield,
 Trash2,
 Users,
 CheckCircle2,
 XCircle,
 Search,
 Filter,
 UserPlus,
 MoreHorizontal,
 User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

// Local Components
import { AddUserModal } from './_components/AddUserModal';
import { InviteModal } from './_components/InviteModal';

export default function UserManagementPage() {
 const params = useParams();
 const workspaceId = params.workspaceId;
 const { onOpen } = useModal();

 const [users, setUsers] = useState([]);
 const [roles, setRoles] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');

 // Modal States
 const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 const [selectedUser, setSelectedUser] = useState(null);
 const [selectedRoleIds, setSelectedRoleIds] = useState([]);
 const [isUpdating, setIsUpdating] = useState(false);
 const [isDeletingModalOpen, setIsDeletingModalOpen] = useState(false);
 const [userToDelete, setUserToDelete] = useState(null);
 const [isDeleting, setIsDeleting] = useState(false);

 const fetchData = useCallback(async () => {
 setLoading(true);
 try {
 const [usersRes, rolesRes] = await Promise.all([
 axios.get(`/api/workspace/${workspaceId}/management/user`),
 axios.get(`/api/workspace/${workspaceId}/management/role`)
 ]);
 setUsers(usersRes.data);
 setRoles(rolesRes.data);
 } catch (error) {
 console.error(error);
 toast.error("Failed to load management data");
 } finally {
 setLoading(false);
 }
 }, [workspaceId]);

 useEffect(() => {
 fetchData();
 }, [fetchData]);

 const openEditModal = (user) => {
 setSelectedUser(user);
 setSelectedRoleIds(user.roles.map(r => r.id));
 setIsEditModalOpen(true);
 };

 const handleUpdateRoles = async () => {
 setIsUpdating(true);
 try {
 await axios.patch(`/api/workspace/${workspaceId}/management/user`, {
 userId: selectedUser.id,
 roleIds: selectedRoleIds,
 displayName: selectedUser.displayName,
 isActive: selectedUser.isActive
 });
 toast.success("User updated successfully");
 setIsEditModalOpen(false);
 fetchData();
 } catch (error) {
 console.error(error);
 toast.error("Failed to update user");
 } finally {
 setIsUpdating(false);
 }
 };

 const toggleStatus = async (user) => {
 setIsUpdating(true);
 try {
 await axios.patch(`/api/workspace/${workspaceId}/management/user`, {
 userId: user.id,
 isActive: !user.isActive
 });
 toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
 fetchData();
 } catch (error) {
 console.error(error);
 toast.error("Failed to update status");
 } finally {
 setIsUpdating(false);
 }
 };

 const handleDeleteUser = async () => {
 if (!userToDelete) return;

 setIsDeleting(true);
 try {
 await axios.delete(`/api/workspace/${workspaceId}/management/user/${userToDelete.id}`);
 toast.success("User removed successfully");
 setIsDeletingModalOpen(false);
 setUserToDelete(null);
 fetchData();
 } catch (error) {
 console.error(error);
 toast.error("Failed to delete user");
 } finally {
 setIsDeleting(false);
 }
 };

 const confirmDelete = (user) => {
 setUserToDelete(user);
 setIsDeletingModalOpen(true);
 };

 const filteredUsers = users.filter(u =>
 u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
 u.email?.toLowerCase().includes(search.toLowerCase()) ||
 u.username?.toLowerCase().includes(search.toLowerCase())
 );

 return (
 <div className="space-y-8 max-w-7xl mx-auto py-8 px-6 animate-fade-in">
 {/* Local Modals */}
 <AddUserModal />
 <InviteModal />

 {/* Header Section */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/10 p-8 rounded-md border border-border/40 backdrop-blur-sm shadow-sm">
 <div className="space-y-1 text-left">
 <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
 <Users className="text-primary h-8 w-8" />
 User Management
 </h1>
 <p className="text-muted-foreground text-[10px] font-bold opacity-70">
 Manage platform users, assign roles and control access levels.
 </p>
 </div>
 <div className="flex gap-3">
 <Button
 onClick={() => onOpen('invite', { workspaceId })}
 variant="outline"
 className="rounded-md font-bold h-11 px-6 text-[10px] border-border/40 "
 >
 <UserPlus className="w-5 h-5 mr-2" /> Invite
 </Button>
 <Button
 onClick={() => onOpen('addUser', { workspaceId, roles, onApply: fetchData })}
 className='bg-primary hover:bg-primary/90 rounded-md font-bold h-11 px-6 text-[10px] shadow-lg shadow-primary/20'
 >
 <Plus className="w-5 h-5 mr-2" /> Add User
 </Button>
 </div>
 </div>

 {/* Filters */}
 <div className="flex flex-col md:flex-row items-center gap-4 bg-card/20 p-4 rounded-md border border-border/40 backdrop-blur-sm shadow-xl shadow-black/5">
 <div className="relative flex-1 group">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
 <Input
 placeholder="SEARCH BY NAME, EMAIL OR USERNAME..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="pl-11 h-12 bg-background/50 border-none rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-inner font-bold text-[10px] "
 />
 </div>
 <div className="flex items-center gap-2">
 <Button variant="outline" className="w-12 rounded-md border-border/40 bg-background/50">
 <Filter className="w-4 h-4" />
 </Button>
 </div>
 </div>

 {/* User Table */}
 <div className="bg-card/30 rounded-md border border-border/40 shadow-xl overflow-hidden backdrop-blur-md mt-4">
 {loading ? (
 <div className="flex flex-col items-center justify-center py-32 space-y-4">
 <Loader2 className="h-10 w-10 text-primary animate-spin" />
 <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] animate-pulse">Synchronizing directory...</p>
 </div>
 ) : filteredUsers.length === 0 ? (
 <div className="text-center py-24 px-6 flex flex-col items-center justify-center">
 <div className="w-16 h-16 bg-muted/30 rounded-md flex items-center justify-center mb-6 border border-border/20 shadow-inner">
 <UserIcon className="w-8 h-8 text-muted-foreground/50" />
 </div>
 <h3 className="text-xl font-bold text-foreground mb-2">
 {search ? `Nothing found for "${search}"` : "No members yet"}
 </h3>
 <p className="text-[10px] font-bold text-muted-foreground opacity-70">
 {search ? "Try refining your search terms." : "Start by inviting team members to your workspace."}
 </p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-border/20 bg-muted/10">
 <th className="px-6 py-5 text-[10px] font-bold text-muted-foreground whitespace-nowrap">Member Details</th>
 <th className="px-6 py-5 text-[10px] font-bold text-muted-foreground whitespace-nowrap">Access Rights</th>
 <th className="px-6 py-5 text-[10px] font-bold text-muted-foreground whitespace-nowrap">Directory Status</th>
 <th className="px-6 py-5 text-[10px] font-bold text-muted-foreground whitespace-nowrap">Member Since</th>
 <th className="px-6 py-5 text-[10px] font-bold text-muted-foreground whitespace-nowrap text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/10">
 {filteredUsers.map((user) => (
 <tr key={user.id} className="group hover:bg-primary/[0.02] transition-colors">
 <td className="px-6 py-5 whitespace-nowrap">
 <div className="flex items-center gap-4">
 <Avatar className="h-11 w-11 rounded-md border-2 border-background shadow-md">
 <AvatarImage src={user.avatar} />
 <AvatarFallback className="bg-primary/10 text-primary font-bold text-md">
 {user.displayName?.charAt(0) || user.username?.charAt(0)}
 </AvatarFallback>
 </Avatar>
 <div className="min-w-0">
 <p className="text-sm font-bold text-foreground/90 truncate">
 {user.displayName || user.username}
 </p>
 <p className="text-[10px] font-bold text-muted-foreground truncate opacity-70 ">
 @{user.username || 'n/a'}
 </p>
 </div>
 </div>
 </td>
 <td className="px-6 py-5">
 <div className="flex flex-wrap gap-1.5 max-w-[200px]">
 {user.roles.length === 0 ? (
 <span className="text-[10px] font-bold text-muted-foreground opacity-30 ">No assigned roles</span>
 ) : (
 user.roles.map(role => (
 <Badge
 key={role.id}
 variant="outline"
 style={{
 backgroundColor: `${role.color}15`,
 color: role.color,
 borderColor: `${role.color}30`
 }}
 className="text-[9px] font-bold tracking-tighter px-2 rounded-md"
 >
 {role.title}
 </Badge>
 ))
 )}
 <Button
 variant="ghost"
 size="icon"
 className="h-6 w-6 rounded-md hover:bg-primary/10 text-muted-foreground/30 hover:text-primary transition-colors ml-1"
 onClick={() => openEditModal(user)}
 >
 <Shield className="w-3 h-3" />
 </Button>
 </div>
 </td>
 <td className="px-6 py-5 whitespace-nowrap">
 <div className="flex items-center gap-2">
 {user.isActive ? (
 <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
 <span className="text-[10px] font-bold ">Active</span>
 </div>
 ) : (
 <div className="flex items-center gap-1.5 text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-md border border-orange-500/20">
 <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
 <span className="text-[10px] font-bold ">Idle</span>
 </div>
 )}
 </div>
 </td>
 <td className="px-6 py-5 whitespace-nowrap">
 <p className="text-[10px] font-bold text-muted-foreground opacity-80 ">
 {new Date(user.createdAt).toLocaleDateString()}
 </p>
 </td>
 <td className="px-6 py-5 whitespace-nowrap text-right">
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon" className="w-8 rounded-md text-muted-foreground/50 hover:text-foreground">
 <MoreHorizontal className="w-4 h-4" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-52 rounded-md shadow-2xl border-border/40 p-2">
 <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground px-3 py-2">Account Control</DropdownMenuLabel>
 <DropdownMenuItem onClick={() => openEditModal(user)} className="cursor-pointer font-bold text-[10px] px-3 py-2.5 rounded-md">
 <Shield className="w-4 h-4 mr-2 text-primary" /> Manage Roles
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => toggleStatus(user)} className="cursor-pointer font-bold text-[10px] px-3 py-2.5 rounded-md">
 {user.isActive ? (
 <><XCircle className="w-4 h-4 mr-2 text-rose-500" /> Deactivate</>
 ) : (
 <><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Activate</>
 )}
 </DropdownMenuItem>
 <DropdownMenuSeparator className="bg-border/10" />
 <DropdownMenuItem onClick={() => confirmDelete(user)} className="cursor-pointer font-bold text-[10px] px-3 py-2.5 rounded-md text-rose-500 hover:bg-rose-500/10 transition-colors">
 <Trash2 className="w-4 h-4 mr-2" /> Remove
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* Edit Roles Modal (Simplified inline for now, but following design) */}
 <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
 <DialogContent className="sm:max-w-md bg-background border border-border/60 shadow-2xl rounded-md overflow-hidden p-0">
 <div className="p-8 pb-4">
 <DialogHeader>
 <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
 <Shield className="h-6 w-6 text-primary" />
 Manage Access
 </DialogTitle>
 <DialogDescription className="text-[10px] font-bold text-muted-foreground opacity-70">
 Set access levels and directory status for <span className="text-primary ">@{selectedUser?.username}</span>.
 </DialogDescription>
 </DialogHeader>

 <div className="py-8 space-y-6">
 <div className="space-y-4 border-b border-border/10 pb-8">
 <div className="space-y-2 text-left">
 <label className="text-[10px] font-bold text-muted-foreground ml-1">Display Name</label>
 <Input
 value={selectedUser?.displayName || ''}
 onChange={(e) => setSelectedUser(prev => ({ ...prev, displayName: e.target.value }))}
 className="h-12 bg-muted/30 border-none rounded-md px-4 text-xs font-bold shadow-inner focus-visible:ring-1 focus-visible:ring-primary"
 />
 </div>
 <div className="flex items-center justify-between p-4 rounded-md bg-muted/20 border border-border/10">
 <div className="space-y-1">
 <p className="text-[10px] font-bold ">Directory Access</p>
 <p className="text-[9px] font-bold text-muted-foreground opacity-50">Toggle platform entry</p>
 </div>
 <Button
 onClick={() => setSelectedUser(prev => ({ ...prev, isActive: !prev.isActive }))}
 variant={selectedUser?.isActive ? "outline" : "destructive"}
 className={`h-9 rounded-md font-bold text-[9px] px-4 ${selectedUser?.isActive ? 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5' : ''}`}
 >
 {selectedUser?.isActive ? 'ACTIVE' : 'IDLE'}
 </Button>
 </div>
 </div>

 <div className="space-y-4 text-left">
 <label className="text-[10px] font-bold text-muted-foreground ml-1">Assign Roles</label>
 <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-2">
 {roles.length === 0 ? (
 <p className="text-center py-4 text-[10px] text-muted-foreground font-bold">No roles defined yet.</p>
 ) : (
 roles.map((role) => (
 <div
 key={role.id}
 className={`flex items-center justify-between p-4 rounded-md border transition-all cursor-pointer ${selectedRoleIds.includes(role.id)
 ? 'bg-primary/5 border-primary/20 shadow-sm'
 : 'bg-muted/10 border-border/10 hover:bg-muted/20'
 }`}
 onClick={() => {
 setSelectedRoleIds(prev =>
 prev.includes(role.id)
 ? prev.filter(id => id !== role.id)
 : [...prev, role.id]
 );
 }}
 >
 <div className="flex items-center gap-3">
 <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: role.color || '#3b82f6' }} />
 <div>
 <p className="text-[10px] font-bold ">{role.title}</p>
 <p className="text-[9px] font-bold text-muted-foreground opacity-50 truncate max-w-[180px]">{role.description || 'No description provided.'}</p>
 </div>
 </div>
 <Checkbox
 checked={selectedRoleIds.includes(role.id)}
 onCheckedChange={() => { }} // handled by parent div
 className="rounded-full h-5 w-5 border-primary/20 bg-background"
 />
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 </div>

 <DialogFooter className="p-8 bg-muted/5 border-t border-border/10 flex gap-2">
 <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="rounded-md font-bold px-6 text-[10px] flex-1 ">
 Cancel
 </Button>
 <Button
 onClick={handleUpdateRoles}
 disabled={isUpdating}
 className="rounded-md font-bold px-8 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all flex-1 text-[10px] "
 >
 {isUpdating ? <Loader2 className="h-4 w-4 animate-spin font-bold" /> : "Save Changes"}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>

 <AlertModal
 isOpen={isDeletingModalOpen}
 onClose={() => setIsDeletingModalOpen(false)}
 onConfirm={handleDeleteUser}
 loading={isDeleting}
 title="Remove Member?"
 description={`This action will revoke all access for ${userToDelete?.displayName || userToDelete?.username}.`}
 />
 </div>
 );
}
