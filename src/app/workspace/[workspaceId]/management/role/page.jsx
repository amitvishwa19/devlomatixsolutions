'use client';

import { useState, useEffect, useCallback } from'react';
import { useParams } from'next/navigation';
import axios from'@/utils/axios';
import { AlertModal } from'@/components/global/AlertModal';
import {
 Loader2,
 Plus,
 Shield,
 Trash2,
 Settings2,
 Users,
 CheckCircle2,
 XCircle,
 Copy,
 ExternalLink,
 ChevronRight,
 Search,
 Filter,
 ArrowUpDown,
 Check
} from'lucide-react';
import { Button } from'@/components/ui/button';
import { Input } from'@/components/ui/input';
import { Badge } from'@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from'@/components/ui/card';
import { toast } from'sonner';
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogFooter,
} from"@/components/ui/dialog";
import { Checkbox } from"@/components/ui/checkbox";

export default function RoleManagementPage() {
 const params = useParams();
 const workspaceId = params.workspaceId;

 const [roles, setRoles] = useState([]);
 const [permissions, setPermissions] = useState({});
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');

 // Modal States
 const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
 const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
 const [isDeletingModalOpen, setIsDeletingModalOpen] = useState(false);
 const [roleToDelete, setRoleToDelete] = useState(null);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [isDeleting, setIsDeleting] = useState(false);

 const [selectedRole, setSelectedRole] = useState(null);
 const [roleForm, setRoleForm] = useState({
 title:'',
 description:'',
 color:'#3b82f6'
 });
 const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);

 const fetchData = useCallback(async () => {
 setLoading(true);
 try {
 const [rolesRes, permsRes] = await Promise.all([
 axios.get(`/api/workspace/${workspaceId}/management/role`),
 axios.get(`/api/workspace/${workspaceId}/management/permission`)
 ]);
 setRoles(rolesRes.data);
 setPermissions(permsRes.data.grouped);
 } catch (error) {
 console.error(error);
 toast.error("Failed to load roles and permissions");
 } finally {
 setLoading(false);
 }
 }, [workspaceId]);

 useEffect(() => {
 fetchData();
 }, [fetchData]);

 const handleCreateRole = async () => {
 if (!roleForm.title) {
 toast.error("Title is required");
 return;
 }
 setIsSubmitting(true);
 const payload = {
 ...roleForm,
 permissionIds: selectedPermissionIds
 };
 try {
 if (selectedRole) {
 // Update
 await axios.patch(`/api/workspace/${workspaceId}/management/role/${selectedRole.id}`, payload);
 toast.success("Role updated successfully");
 } else {
 // Create
 await axios.post(`/api/workspace/${workspaceId}/management/role`, payload);
 toast.success("Role created successfully");
 }
 setIsCreateModalOpen(false);
 resetForm();
 fetchData();
 } catch (error) {
 console.error(error);
 toast.error("Failed to save role");
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleDeleteRole = async () => {
 if (!roleToDelete) return;

 setIsDeleting(true);
 try {
 await axios.delete(`/api/workspace/${workspaceId}/management/role/${roleToDelete}`);
 toast.success("Role deleted");
 setIsDeletingModalOpen(false);
 setRoleToDelete(null);
 fetchData();
 } catch (error) {
 console.error(error);
 toast.error("Failed to delete role");
 } finally {
 setIsDeleting(false);
 }
 };

 const confirmDelete = (id) => {
 setRoleToDelete(id);
 setIsDeletingModalOpen(true);
 };

 const openPermissionsModal = (role) => {
 setSelectedRole(role);
 setSelectedPermissionIds(role.permissions.map(p => p.id));
 setIsPermissionsModalOpen(true);
 };

 const handleUpdatePermissions = async () => {
 setIsSubmitting(true);
 try {
 await axios.patch(`/api/workspace/${workspaceId}/management/role/${selectedRole.id}`, {
 permissionIds: selectedPermissionIds
 });
 toast.success("Permissions updated successfully");
 setIsPermissionsModalOpen(false);
 fetchData();
 } catch (error) {
 console.error(error);
 toast.error("Failed to update permissions");
 } finally {
 setIsSubmitting(false);
 }
 };

 const resetForm = () => {
 setSelectedRole(null);
 setRoleForm({ title:'', description:'', color:'#3b82f6'});
 setSelectedPermissionIds([]);
 };

 const filteredRoles = roles.filter(r =>
 r.title.toLowerCase().includes(search.toLowerCase())
 );

 return (
 <div className="space-y-8 max-w-7xl mx-auto py-6 px-4 animate-fade-in text-foreground">
 {/* Header Section */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h1 className="text-xl text-foreground font-bold">Access Roles</h1>
 <p className="text-muted-foreground text-xs font-medium mt-1">Manage functional roles and their associated system capabilities.</p>
 </div>
 <Button
 variant='outline'
 onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
 size={'sm'}
 className='bg-primary'
 >
 <Plus className="w-4 h-4 mr-2"/> New Role
 </Button>
 </div>

 {/* Role Navigation/Filter */}
 <div className="relative group max-w-md">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors"/>
 <Input
 placeholder="Search roles..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="pl-11 h-12 bg-card/40 border border-border/40 rounded-md focus-visible:ring-1 focus-visible:ring-blue-500 shadow-inner"
 />
 </div>

 {/* Role Grid */}
 {loading ? (
 <div className="flex flex-col items-center justify-center py-40 space-y-4">
 <Loader2 className="w-10 text-blue-500 animate-spin"/>
 <p className="text-[10px] font-bold text-muted-foreground animate-pulse">Mapping role hierarchy...</p>
 </div>
 ) : filteredRoles.length === 0 ? (
 <div className="py-24 text-center border-2 border-dashed border-border/40 rounded-md bg-muted/5">
 <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4"/>
 <h3 className="text-lg font-bold">No identities found</h3>
 <p className="text-sm text-muted-foreground mt-1">Create your first functional role to begin managing access.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {filteredRoles.map((role) => (
 <Card key={role.id} className="group relative border-border overflow-hidden rounded-md bg-card/30 backdrop-blur-md hover:shadow-2xl hover:shadow-blue-500/5 hover:border-blue-500/40 transition-all duration-500 shadow-sm">
 {/* Accent Bar */}
 <div className="absolute top-0 left-0 w-full h-1.5"style={{ backgroundColor: role.color ||'#3b82f6'}} />

 <CardHeader className="pt-8 px-8">
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 border border-border/20">
 <Users className="w-3 h-3 text-muted-foreground"/>
 <span className="text-[10px] font-bold">{role._count?.users || 0} Members</span>
 </div>
 <Badge variant="outline"className="rounded-md border-none bg-blue-500/10 text-blue-500 font-bold text-[9px]">
 ID: {role.id.slice(-4).toUpperCase()}
 </Badge>
 </div>
 <CardTitle className="text-2xl font-bold">{role.title}</CardTitle>
 <CardDescription className="text-[11px] font-medium leading-relaxed line-clamp-2 min-h-[32px]">
 {role.description ||"Assign this role to grant specific access levels to workspace members."}
 </CardDescription>
 </CardHeader>

 <CardContent className="px-8 py-4">
 <div className="space-y-4">
 <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground/50 border-b border-border/10 pb-2">
 <span>Permissions</span>
 <span>{role.permissions.length} Tokens</span>
 </div>
 <div className="flex flex-wrap gap-2 min-h-[40px]">
 {role.permissions.slice(0, 4).map(p => (
 <Badge key={p.id} variant="secondary"className="bg-muted/40 text-[9px] font-bold rounded-md border-none hover:bg-muted/60">
 {p.title}
 </Badge>
 ))}
 {role.permissions.length > 4 && (
 <span className="text-[9px] font-bold text-muted-foreground/40 self-center">+{role.permissions.length - 4} More</span>
 )}
 {role.permissions.length === 0 && (
 <span className="text-[10px] text-muted-foreground/30">No permissions assigned.</span>
 )}
 </div>
 </div>
 </CardContent>

 <CardFooter className="px-8 pb-8 pt-4">
 <Button
 variant="outline"
 size="sm"
 onClick={() => {
 setSelectedRole(role);
 setRoleForm({ title: role.title, description: role.description ||'', color: role.color ||'#3b82f6'});
 setSelectedPermissionIds(role.permissions.map(p => p.id));
 setIsCreateModalOpen(true);
 }}
 className="w-full h-11 rounded-md font-bold text-[10px] bg-background/40 hover:bg-blue-50 border-border/40 hover:border-blue-500/40 hover:text-blue-600 transition-all shadow-sm"
 >
 <Settings2 className="w-3 h-3 mr-2"/> Configure Capabilities
 </Button>
 <Button
 variant="destructive"
 size="icon"
 onClick={() => confirmDelete(role.id)}
 className="absolute top-3 right-3 rounded-full h-8 w-8 shadow-xl shadow-rose-500/20 border border-rose-500/20 hover:scale-110 active:scale-95 transition-all opacity-40 group-hover:opacity-100"
 >
 <Trash2 className="w-3.5 h-3.5"/>
 </Button>
 </CardFooter>
 </Card>
 ))}
 </div>
 )}

 {/* Create/Edit Role Modal */}
 <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
 <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none shadow-2xl p-8 bg-card">
 <DialogHeader>
 <DialogTitle className="text-2xl font-bold">{selectedRole ?"Configure":"Initialize"} Identity</DialogTitle>
 <DialogDescription className="font-medium text-sm">
 Define the metadata for this functional role. Permissions are mapped separately.
 </DialogDescription>
 </DialogHeader>

 <div className="py-6 space-y-5">
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-muted-foreground ml-1">Role Title</label>
 <Input
 placeholder="e.g. Workspace Manager"
 value={roleForm.title}
 onChange={(e) => setRoleForm(prev => ({ ...prev, title: e.target.value }))}
 className="h-12 rounded-md bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-blue-500 font-bold"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-muted-foreground ml-1">Theme Color</label>
 <div className="flex gap-2">
 <Input
 type="color"
 value={roleForm.color}
 onChange={(e) => setRoleForm(prev => ({ ...prev, color: e.target.value }))}
 className="h-12 w-12 p-1 rounded-md bg-muted/30 border-none cursor-pointer"
 />
 <Input
 value={roleForm.color}
 onChange={(e) => setRoleForm(prev => ({ ...prev, color: e.target.value }))}
 className="h-12 flex-1 rounded-md bg-muted/30 border-none font-mono text-xs font-bold text-center"
 />
 </div>
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-bold text-muted-foreground ml-1">Description</label>
 <Input
 placeholder="What can this role do?"
 value={roleForm.description}
 onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
 className="h-12 rounded-md bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-blue-500"
 />
 </div>

 {/* Permission Selection Inside Modal */}
 <div className="space-y-3 pt-2">
 <label className="text-[10px] font-bold text-muted-foreground ml-1">Capability Matrix</label>
 <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1 space-y-6">
 {Object.keys(permissions).length === 0 ? (
 <p className="text-center py-4 text-xs text-muted-foreground border border-dashed rounded-md">Define permissions first.</p>
 ) : (
 Object.entries(permissions).map(([category, perms]) => (
 <div key={category} className="space-y-2">
 <p className="text-[9px] font-bold text-blue-500/70 border-b border-blue-500/10 pb-1">{category}</p>
 <div className="grid grid-cols-1 gap-1.5">
 {perms.map(perm => (
 <div
 key={perm.id}
 onClick={() => {
 setSelectedPermissionIds(prev =>
 prev.includes(perm.id) ? prev.filter(id => id !== perm.id) : [...prev, perm.id]
 );
 }}
 className={`flex items-center justify-between p-3 rounded-md border transition-all cursor-pointer ${selectedPermissionIds.includes(perm.id)
 ?'bg-blue-500/5 border-blue-500/30'
 :'border-border/40 hover:bg-muted/30'
 }`}
 >
 <div className="min-w-0">
 <p className="text-[11px] font-bold truncate">{perm.title}</p>
 <p className="text-[9px] text-muted-foreground font-mono truncate">{perm.value}</p>
 </div>
 <Checkbox
 checked={selectedPermissionIds.includes(perm.id)}
 onCheckedChange={() => { }}
 className="rounded-full"
 />
 </div>
 ))}
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>

 <DialogFooter className="flex gap-2 border-t border-border/10 pt-4">
 <Button variant="outline"onClick={() => setIsCreateModalOpen(false)} className="rounded-md font-bold border-border/40 bg-background/50 flex-1">
 Dismiss
 </Button>
 <Button
 onClick={handleCreateRole}
 disabled={isSubmitting}
 className="rounded-md font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex-1"
 >
 {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin"/> : (selectedRole ?"Apply Changes":"Deploy Role")}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>

 <AlertModal
 isOpen={isDeletingModalOpen}
 onClose={() => setIsDeletingModalOpen(false)}
 onConfirm={handleDeleteRole}
 loading={isDeleting}
 title="Delete Workspace Role?"
 description="This will permanently delete the role and remove it from all users. Existing users with this role will lose its permissions."
 />

 <style jsx global>{`
 .custom-scrollbar::-webkit-scrollbar {
 width: 6px;
 }
 .custom-scrollbar::-webkit-scrollbar-track {
 background: transparent;
 }
 .custom-scrollbar::-webkit-scrollbar-thumb {
 background: #e2e8f0;
 border-radius: 10px;
 }
 .custom-scrollbar::-webkit-scrollbar-thumb:hover {
 background: #cbd5e1;
 }
 `}</style>
 </div>
 );
}