
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Users, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { titleCaseLabel } from '@/utils/functions';





export function RoleCard({ role, onEdit, onDelete }) {
    return (
        <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:shadow-medium animate-fade-in hover:border-primary/30">
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-md" style={{ backgroundColor: role.color }} />

            <div className="flex items-start justify-between">
                <div className="space-y-3">
                    <div className='flex flex-col'>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-card-foreground capitalize">{titleCaseLabel(role?.title)}</h3>
                            <Badge variant="muted" className="text-xs">
                                {role?.permissions?.length ?? 0} permissions
                            </Badge>
                        </div>
                        <p className="text-xs italic text-muted-foreground">{role?.description}</p>
                    </div>

                    <div className='flex flex-row items-center gap-2 flex-wrap'>
                        {role?.permissions?.map((perm, index) => {
                            return (

                                <Badge key={perm.id} variant="outline" status='info' className={cn("text-xs mr-1 mb-1")}>
                                    <div className='flex flex-col'>
                                        {perm.title}
                                        <span className='text-xs text-muted-foreground'>
                                            {perm.value ? ` ${perm.value}` : ''}
                                        </span>
                                    </div>
                                </Badge>

                            )
                        })}
                    </div>
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
