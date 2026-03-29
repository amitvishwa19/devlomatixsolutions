'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import axios from '@/utils/axios';
import { AlertModal } from '@/components/global/AlertModal';
import { 
 Loader2, 
 Plus, 
 ShieldCheck, 
 Hash, 
 Layers, 
 Info, 
 Palette,
 Search,
 Filter,
 Edit3,
 Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogFooter,
} from "@/components/ui/dialog";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";

export default function PermissionManagementPage() {
 const params = useParams();
 const workspaceId = params.workspaceId;

 const [groupedPermissions, setGroupedPermissions] = useState({});
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 
 // Modal States
 const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
 const [isDeletingModalOpen, setIsDeletingModalOpen] = useState(false);
 const [permissionToDelete, setPermissionToDelete] = useState(null);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [isDeleting, setIsDeleting] = useState(false);
 const [permissionToEdit, setPermissionToEdit] = useState(null);
 const [newPermission, setNewPermission] = useState({
 title: '',
 value: '',
 description: '',
 category: 'General',
 color: '#6366f1'
 });

 const fetchData = useCallback(async () => {
 setLoading(true);
 try {
 const res = await axios.get(`/api/workspace/${workspaceId}/management/permission`);
 setGroupedPermissions(res.data.grouped);
 } catch (error) {
 console.error(error);
 toast.error("Failed to load permissions");
 } finally {
 setLoading(false);
 }
 }, [workspaceId]);

 useEffect(() => {
 fetchData();
 }, [fetchData]);

 const handleCreate = async () => {
 if (!newPermission.title || !newPermission.value) {
 toast.error("Title and Value are required");
 return;
 }

 setIsSubmitting(true);
 try {
 if (permissionToEdit) {
 await axios.patch(`/api/workspace/${workspaceId}/management/permission/${permissionToEdit.id}`, newPermission);
 toast.success("Permission updated successfully");
 } else {
 await axios.post(`/api/workspace/${workspaceId}/management/permission`, newPermission);
 toast.success("Permission created successfully");
 }
 setIsCreateModalOpen(false);
 resetForm();
 fetchData();
 } catch (error) {
 console.error(error);
 toast.error(error.response?.data?.message || "Failed to save permission");
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleDelete = async () => {
 if (!permissionToDelete) return;
 
 setIsDeleting(true);
 try {
 await axios.delete(`/api/workspace/${workspaceId}/management/permission/${permissionToDelete}`);
 toast.success("Permission deleted");
 setIsDeletingModalOpen(false);
 setPermissionToDelete(null);
 fetchData();
 } catch (error) {
 console.error(error);
 toast.error("Failed to delete permission");
 } finally {
 setIsDeleting(false);
 }
 };

 const confirmDelete = (id) => {
 setPermissionToDelete(id);
 setIsDeletingModalOpen(true);
 };

 const openEditModal = (perm) => {
 setPermissionToEdit(perm);
 setNewPermission({
 title: perm.title,
 value: perm.value,
 description: perm.description,
 category: perm.category || 'General',
 color: perm.color || '#6366f1'
 });
 setIsCreateModalOpen(true);
 };

 const resetForm = () => {
 setPermissionToEdit(null);
 setNewPermission({
 title: '',
 value: '',
 description: '',
 category: 'General',
 color: '#6366f1'
 });
 }

 const handleModalClose = (open) => {
 if (!open) resetForm();
 setIsCreateModalOpen(open);
 };

 return (
 <div className="space-y-8 max-w-7xl mx-auto py-6 px-4 animate-fade-in text-foreground">
 {/* Header Section */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h1 className="text-xl text-foreground font-bold">System Permissions</h1>
 <p className="text-muted-foreground text-xs font-medium mt-1">Define granular access tokens used across the entire platform ecosystem.</p>
 </div>
 <Button 
 variant='outline'
 onClick={() => {
 resetForm();
 setIsCreateModalOpen(true);
 }}
 size={'sm'}
 className='bg-primary'
 >
 <Plus className="w-4 h-4 mr-2" /> Define Permission
 </Button>
 </div>

 {/* Toolbar */}
 <div className="flex items-center gap-4 bg-card/30 backdrop-blur-md p-3 rounded-md border border-border/40">
 <div className="relative flex-1 group">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
 <Input
 placeholder="Filter system permissions..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="pl-11 h-11 bg-background/50 border-none rounded-md focus-visible:ring-1 focus-visible:ring-indigo-500 shadow-inner"
 />
 </div>
 <Button variant="outline" className="rounded-md border-border/40 bg-background/50">
 <Filter className="w-4 h-4 mr-2" /> Categories
 </Button>
 </div>

 {/* Permission Grid */}
 {loading ? (
 <div className="flex flex-col items-center justify-center py-40 space-y-4">
 <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
 <p className="text-[10px] font-bold text-muted-foreground animate-pulse">Reading system tokens...</p>
 </div>
 ) : Object.keys(groupedPermissions).length === 0 ? (
 <Card className="border-dashed border-2 bg-muted/5 py-24 text-center rounded-md">
 <CardHeader>
 <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
 <ShieldCheck className="w-10 h-10 text-muted-foreground/30" />
 </div>
 <CardTitle className="text-xl font-bold">The vault is empty</CardTitle>
 <CardDescription className="max-w-xs mx-auto text-base mt-2">No system permissions have been defined yet. Start by defining your first granular access token.</CardDescription>
 </CardHeader>
 <CardContent>
 <Button onClick={() => {
 resetForm();
 setIsCreateModalOpen(true);
 }} variant="outline" className="rounded-md font-bold h-11 px-8 border-indigo-500/30 text-indigo-600 hover:bg-indigo-50 text-xs ">
 Initialize Registry
 </Button>
 </CardContent>
 </Card>
 ) : (
 <div className="grid grid-cols-1 gap-12">
 {Object.entries(groupedPermissions).map(([category, items]) => {
 const filteredItems = items.filter(i => 
 i.title.toLowerCase().includes(search.toLowerCase()) ||
 i.value.toLowerCase().includes(search.toLowerCase())
 );
 
 if (filteredItems.length === 0) return null;

 return (
 <div key={category} className="space-y-4">
 <div className="flex items-center gap-3">
 <div className="h-8 w-1 bg-indigo-500 rounded-full" />
 <h2 className="text-xs font-bold text-muted-foreground/70">{category}</h2>
 <div className="h-px flex-1 bg-border/20" />
 <Badge variant="outline" className="rounded-md bg-muted/5 font-bold text-[10px]">{filteredItems.length}</Badge>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {filteredItems.map((perm) => (
 <Card key={perm.id} className="group relative bg-card/40 border-border hover:border-indigo-500/60 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 rounded-md overflow-hidden backdrop-blur-sm shadow-sm">
 {/* No longer hover-only for better visibility */}
 <div className="absolute top-3 right-3 flex gap-1">
 <Button size="icon" variant="ghost" className="rounded-md hover:bg-indigo-500/10 text-indigo-500 transition-colors" onClick={() => openEditModal(perm)}>
 <Edit3 className="w-3.5 h-3.5" />
 </Button>
 <Button size="icon" variant="ghost" className="rounded-md hover:bg-destructive/10 text-destructive transition-colors" onClick={() => confirmDelete(perm.id)}>
 <Trash2 className="w-3.5 h-3.5" />
 </Button>
 </div>
 <CardHeader className="pb-3 px-5 pt-5">
 <div className="flex items-center gap-3 mb-1">
 <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: perm.color || '#6366f1' }} />
 <CardTitle className="text-sm font-bold truncate">{perm.title}</CardTitle>
 </div>
 <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground font-bold bg-muted/30 w-fit px-2 py-0.5 rounded-md border border-border/10">
 <Hash className="w-3 h-3 text-indigo-400" /> {perm.value}
 </div>
 </CardHeader>
 <CardContent className="px-5 pb-5">
 <p className="text-[11px] font-medium text-muted-foreground leading-relaxed line-clamp-2">
 {perm.description || "The user with this permission can access protected resources in this module."}
 </p>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 );
 })}
 </div>
 )}

 {/* Create/Edit Permission Modal */}
 <Dialog open={isCreateModalOpen} onOpenChange={handleModalClose}>
 <DialogContent className="sm:max-w-md rounded-md border-none shadow-2xl p-6">
 <DialogHeader>
 <DialogTitle className="text-xl font-bold ">
 {permissionToEdit ? 'Modify System Token' : 'Define System Token'}
 </DialogTitle>
 <DialogDescription className="font-medium">
 {permissionToEdit ? 'Update existing granular capability controls.' : 'Create a new granular permission string that can be attached to roles.'}
 </DialogDescription>
 </DialogHeader>

 <div className="py-6 space-y-4">
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-muted-foreground ml-1">Title</label>
 <Input 
 placeholder="e.g. Delete Documents"
 value={newPermission.title}
 onChange={(e) => {
 const val = e.target.value;
 setNewPermission(prev => ({ 
 ...prev, 
 title: val,
 value: val.toLowerCase().replace(/\s+/g, ':') 
 }));
 }}
 className="h-11 rounded-md bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-indigo-500 font-bold"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-muted-foreground ml-1">Token String (Auto-generated)</label>
 <div className="relative">
 <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
 <Input 
 placeholder="category:action"
 value={newPermission.value}
 onChange={(e) => setNewPermission(prev => ({ ...prev, value: e.target.value }))}
 readOnly={!!permissionToEdit}
 className={`h-11 pl-10 rounded-md bg-muted/20 border-dashed border-border/60 text-indigo-500 font-mono text-xs font-bold ${permissionToEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-muted-foreground ml-1">Category</label>
 <Select 
 value={newPermission.category} 
 onValueChange={(val) => setNewPermission(prev => ({ ...prev, category: val }))}
 >
 <SelectTrigger className="h-11 rounded-md bg-muted/30 border-none font-bold">
 <SelectValue placeholder="General" />
 </SelectTrigger>
 <SelectContent className="rounded-md shadow-xl">
 <SelectItem value="General">General</SelectItem>
 <SelectItem value="Documents">Documents</SelectItem>
 <SelectItem value="WhatsApp">WhatsApp</SelectItem>
 <SelectItem value="Management">Management</SelectItem>
 <SelectItem value="Settings">Settings</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-muted-foreground ml-1">Theme Color</label>
 <div className="flex gap-2">
 <Input 
 type="color"
 value={newPermission.color}
 onChange={(e) => setNewPermission(prev => ({ ...prev, color: e.target.value }))}
 className="h-11 w-11 p-1 rounded-md bg-muted/30 border-none cursor-pointer"
 />
 <Input 
 value={newPermission.color}
 onChange={(e) => setNewPermission(prev => ({ ...prev, color: e.target.value }))}
 className="h-11 flex-1 rounded-md bg-muted/30 border-none font-mono text-xs font-bold"
 />
 </div>
 </div>
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-muted-foreground ml-1">Description</label>
 <Input 
 placeholder="Explain what this permission allows..."
 value={newPermission.description}
 onChange={(e) => setNewPermission(prev => ({ ...prev, description: e.target.value }))}
 className="h-11 rounded-md bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-indigo-500"
 />
 </div>
 </div>

 <DialogFooter className="flex gap-2 border-t border-border/10 pt-4">
 <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="rounded-md font-bold border-border/40 bg-background/50 flex-1">
 Dismiss
 </Button>
 <Button 
 onClick={handleCreate} 
 disabled={isSubmitting}
 className="rounded-md font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex-1"
 >
 {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (permissionToEdit ? "Update Registry" : "Commit Token")}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>

 <AlertModal 
 isOpen={isDeletingModalOpen}
 onClose={() => setIsDeletingModalOpen(false)}
 onConfirm={handleDelete}
 loading={isDeleting}
 title="Delete System Token?"
 description="This will permanently remove the permission from all roles. This action cannot be undone."
 />
 </div>
 );
}
