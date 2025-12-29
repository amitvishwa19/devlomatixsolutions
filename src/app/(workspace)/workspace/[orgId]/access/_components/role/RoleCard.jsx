
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Users, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';



export function RoleCard({ role, onEdit, onDelete }) {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:shadow-medium animate-fade-in">
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl" style={{ backgroundColor: role.color }} />

            <div className="flex items-start justify-between">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-card-foreground capitalize">{role?.title}</h3>
                        <Badge variant="muted" className="text-xs">
                            {role.permissions.length} permissions
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{role?.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{role?.users?.length} users assigned</span>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(role)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(role)}
                            className="text-orange-500 focus:text-orange-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Role
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
