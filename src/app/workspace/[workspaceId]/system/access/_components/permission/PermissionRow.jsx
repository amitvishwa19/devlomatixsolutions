import { Pencil, Trash2, Plus, Users, Shield, ShieldOff, ShieldCheck } from"lucide-react";
import { Button } from"@/components/ui/button";
import { Checkbox } from"@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from"@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from"@/components/ui/hover-card";
import { Badge } from"@/components/ui/badge";

const actionKeys = ["view","create","edit","delete","manage","export","import"];

export const PermissionRow = ({
 module,
 onPermissionChange,
 onBulkToggle,
 onCreatePermission,
 onEditModule,
 onDeleteModule,
 getUsersForPermission,
 getRolesForPermission,
}) => {
 const getColor = () => {
 const firstPerm = Object.values(module.permissions).find(p => p);
 return firstPerm?.color ||"#15803D";
 };


 // Get all unique users across all permissions in this module
 const getModuleUsers = () => {
 const allUsers = new Map();
 Object.values(module.permissions).forEach(perm => {
 if (perm && getUsersForPermission) {
 getUsersForPermission(perm.id).forEach(user => {
 allUsers.set(user.id, user);
 });
 }
 });
 return Array.from(allUsers.values());
 };

 // Get all unique roles across all permissions in this module
 const getModuleRoles = () => {
 const allRoles = new Map();
 Object.values(module.permissions).forEach(perm => {
 if (perm && getRolesForPermission) {
 getRolesForPermission(perm.id).forEach(role => {
 allRoles.set(role.id, role);
 });
 }
 });
 return Array.from(allRoles.values());
 };

 const moduleUsers = getModuleUsers();
 const moduleRoles = getModuleRoles();


 return (
 <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors group/row">
 <td className="py-3 px-4">
 <div className="flex items-center gap-3">
 <div
 className="w-2 h-8 rounded-full"
 style={{ backgroundColor: getColor() }}
 />
 <div className="flex flex-col flex-1 min-w-0">
 <p className="font-medium text-sm flex items-center gap-2">
 {module.displayName}
 <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
 <Tooltip>
 <TooltipTrigger asChild>
 <Button 
 variant="ghost"
 size="icon"
 className="w-5 h-5 hov:text-primary"
 onClick={() => onBulkToggle(module.category, true)}
 >
 <ShieldCheck className="w-3 h-3 text-primary/80"/>
 </Button>
 </TooltipTrigger>
 <TooltipContent>Enable all in {module.displayName}</TooltipContent>
 </Tooltip>
 <Tooltip>
 <TooltipTrigger asChild>
 <Button 
 variant="ghost"
 size="icon"
 className="w-5 h-5 hover:text-destructive"
 onClick={() => onBulkToggle(module.category, false)}
 >
 <ShieldOff className="w-3 h-3 text-destructive/80"/>
 </Button>
 </TooltipTrigger>
 <TooltipContent>Disable all in {module.displayName}</TooltipContent>
 </Tooltip>
 </div>
 </p>
 <p className="text-xs text-muted-foreground font-mono">{module.category}</p>
 </div>
 <HoverCard>
 <HoverCardTrigger asChild>
 <Button variant="ghost"size="sm"className="h-7 px-2 gap-1.5">
 <Users className="w-3.5 h-3.5 text-muted-foreground"/>
 <span className="text-sm font-medium">{moduleUsers?.length || 0}</span>
 </Button>
 </HoverCardTrigger>
 <HoverCardContent className="w-72"align="center">
 <div className="space-y-3">
 {/* Roles Section */}
 <div>
 <div className="flex items-center gap-2 mb-2">
 <Shield className="w-4 h-4 text-primary"/>
 <span className="text-sm font-semibold">Roles ({moduleRoles?.length || 0})</span>
 </div>
 <div className="flex flex-wrap gap-1.5">
 {moduleRoles?.length > 0 ? (
 moduleRoles.map(role => (
 <Badge key={role.id} variant="secondary"className="text-xs">
 {role.name}
 </Badge>
 ))
 ) : (
 <span className="text-xs text-muted-foreground">No roles assigned</span>
 )}
 </div>
 </div>

 {/* Users Section */}
 <div>
 <div className="flex items-center gap-2 mb-2">
 <Users className="w-4 h-4 text-primary"/>
 <span className="text-sm font-semibold">Users ({moduleUsers?.length || 0})</span>
 </div>
 <div className="space-y-1.5 max-h-32 overflow-y-auto">
 {moduleUsers?.length > 0 ? (
 moduleUsers.map(user => (
 <div key={user.id} className="flex items-center gap-2 p-1.5 rounded-md bg-muted/50">
 <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
 {user.avatar}
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-sm font-medium truncate">{user.name}</p>
 <p className="text-xs text-muted-foreground truncate">{user.email}</p>
 </div>
 </div>
 ))
 ) : (
 <span className="text-xs text-muted-foreground">No users assigned</span>
 )}
 </div>
 </div>
 </div>
 </HoverCardContent>
 </HoverCard>
 </div>
 </td>

 {actionKeys.map((action) => {
 const perm = module.permissions[action];
 const isActive = perm?.status;

 return (
 <td key={action} className="py-3 px-4 text-center">
 {perm && isActive ? (
 <Tooltip>
 <TooltipTrigger asChild>
 <div className="flex justify-center">
 <Checkbox
 checked={true}
 onCheckedChange={() =>
 onPermissionChange(perm.id, false)
 }
 className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
 />
 </div>
 </TooltipTrigger>
 <TooltipContent>
 <p className="font-medium">{perm.title}</p>
 <p className="text-xs text-muted-foreground">{perm.description}</p>
 </TooltipContent>
 </Tooltip>
 ) : (
 <Tooltip>
 <TooltipTrigger asChild>
 <Button
 variant="ghost"
 size="icon"
 className="w-6 h-6 opacity-30 hover:opacity-100"
 onClick={() => {
 if (perm) {
 onPermissionChange(perm.id, true);
 } else {
 onCreatePermission(module.category, action);
 }
 }}
 >
 <Plus className="w-3 h-3"/>
 </Button>
 </TooltipTrigger>
 <TooltipContent>
 <p>{perm ? `Enable ${action} permission` : `Create ${action} permission`}</p>
 </TooltipContent>
 </Tooltip>
 )}
 </td>
 );
 })}



 <td className="py-3 px-4">
 <div className="flex items-center justify-end gap-1">
 <Tooltip>
 <TooltipTrigger asChild>
 <Button
 variant="ghost"
 size="icon"
 className="w-8 h-8"
 onClick={() => onEditModule(module)}
 >
 <Pencil className="w-4 h-4"/>
 </Button>
 </TooltipTrigger>
 <TooltipContent>Edit module</TooltipContent>
 </Tooltip>

 <Tooltip>
 <TooltipTrigger asChild>
 <Button
 variant="ghost"
 size="icon"
 className="w-8 h-8 text-destructive hover:text-destructive"
 onClick={() => onDeleteModule(module)}
 >
 <Trash2 className="w-4 h-4"/>
 </Button>
 </TooltipTrigger>
 <TooltipContent>Delete module</TooltipContent>
 </Tooltip>
 </div>
 </td>
 </tr>
 );
};