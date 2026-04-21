import React, { useState } from'react'
import { useAccess } from '@/providers/WorkspaceProvider'
import { Plus, Search, ShieldOff } from'lucide-react'
import { Input } from'@/components/ui/input'
import { Button } from'@/components/ui/button'
import { RoleCard } from'../role/RoleCard'
import { RoleFormDialog } from'../role/RoleFormDialog'
import { DeleteConfirmDialog } from'./DeleteConfirmDialog'
import { RoleDelete } from'../role/RoleDelete'

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
 mode:'add'
 })


 const [deleteModal, setDeleteModal] = useState({
 isOpen: false,
 role: null,
 mode:'add'
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
 title:'Role Deleted',
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
 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
 <Input
 placeholder="Search roles..."
 value={roleSearchQuery}
 onChange={(e) => setRoleSearchQuery(e.target.value)}
 className="pl-10"
 />
 </div>
 <Button variant='save'size='sm'onClick={() => setRoleEditor({
 isOpen: true,
 mode:'add',
 role: null
 })}>
 <Plus className="mr-2 h-4 w-4"/>
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
 mode:'edit',
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
 <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border/40 rounded-md bg-muted/5 animate-pulse-subtle group overflow-hidden relative">
 <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"/>
 <div className="w-20 h-20 bg-muted/20 rounded-md flex items-center justify-center mb-8 border border-border/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
 <ShieldOff className="w-10 text-muted-foreground/30 group-hover:text-primary/40 transition-colors"/>
 </div>
 <h3 className="text-xl font-bold text-foreground/80 mb-3 tracking-tight">
 {roleSearchQuery ?"No results found":"No roles established"}
 </h3>
 <p className="text-xs font-medium text-muted-foreground/60 max-w-[280px] text-center leading-relaxed mb-8">
 {roleSearchQuery 
 ? `We couldn't find any roles matching"${roleSearchQuery}". Try a different term or clear the search.`
 :"Start by creating a custom role to define access boundaries and operational permissions for your workspace team."}
 </p>
 <Button 
 variant="ghost"
 size="sm"
 className="rounded-md font-black uppercase tracking-[0.2em] text-[10px] text-primary/60 hover:text-primary hover:bg-primary/5 transition-all px-8 border border-primary/10"
 onClick={() => roleSearchQuery ? setRoleSearchQuery('') : setRoleEditor({ isOpen: true, mode:'add', role: null })}
 >
 {roleSearchQuery ?"Clear Search Cache":"Initialize First Role"}
 </Button>
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
 mode:'add'
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