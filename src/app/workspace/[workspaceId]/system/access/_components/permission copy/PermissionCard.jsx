import { Badge } from'@/components/ui/badge'
import { Button } from'@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from'@/components/ui/dropdown-menu'
import { Edit, MoreHorizontal, Trash2 } from'lucide-react'
import React, { useState } from'react'

export default function PermissionCard({ permission, onEdit, onDelete, rolesWithPermission }) {

 return (
 <div className="group relative overflow-hidden rounded-md border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:shadow-medium animate-fade-in flex flex-row justify-between">
 <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl"style={{ backgroundColor: permission?.color }} />


 <div className='flex flex-col'>
 <h4 className="font-medium text-card-foreground">
 {permission.title}
 </h4>
 <p className="text-xs text-muted-foreground mt-1">
 {permission.description}
 </p>
 <div className="flex flex-wrap gap-1.5 mt-3">
 {rolesWithPermission.map((role) => (
 <Badge
 key={role.id}
 variant="outline"
 className="text-xs"
 style={{ borderColor: role.color, color: role.color }}
 >
 {role.title}
 </Badge>
 ))}
 {rolesWithPermission.length === 0 && (
 <span className="text-xs text-muted-foreground">
 No roles assigned
 </span>
 )}
 </div>

 </div>

 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost"size="icon-sm"className="opacity-0 group-hover:opacity-100 transition-opacity">
 <MoreHorizontal className="h-4 w-4"/>
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end">
 <DropdownMenuItem onClick={() => onEdit(permission)}>
 <Edit className="mr-2 h-4 w-4"/>
 Edit Permission
 </DropdownMenuItem>
 <DropdownMenuItem
 onClick={() => onDelete(permission)}
 className="text-orange-500 focus:text-orange-500"
 >
 <Trash2 className="mr-2 h-4 w-4"/>
 Delete Permission
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>


 </div>
 )
}