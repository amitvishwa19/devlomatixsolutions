import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Users, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { titleCaseLabel } from '@/utils/functions';

export function RoleCard({ role, onEdit, onDelete }) {
  const permissionCount = role?.permissions?.length ?? 0;
  const userCount = role?.users?.length ?? 0;

  return (
    <div className="group relative flex flex-col h-full overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur-small transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 animate-in fade-in slide-in-from-bottom-2">
      {/* Role Color Accent */}
      <div 
        className="absolute top-0 left-0 right-0 h-1.5 opacity-80 group-hover:opacity-100 transition-opacity" 
        style={{ backgroundColor: role.color }} 
      />

      <div className="p-5 flex flex-col h-full gap-4">
        {/* Header section */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <h3 className="text-base font-bold text-card-foreground line-clamp-1 flex items-center gap-2">
              {titleCaseLabel(role?.title)}
              {permissionCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-primary/10 text-primary border-none font-bold">
                  {permissionCount}
                </Badge>
              )}
            </h3>
            <p className="text-xs text-muted-foreground/70 line-clamp-1 italic font-medium">
              {role?.description}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-1 rounded-full opacity-60 group-hover:opacity-100 transition-opacity hover:bg-muted">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1.5">
              <DropdownMenuItem 
                onClick={() => onEdit(role)}
                className="rounded-md gap-2"
              >
                <Edit className="h-4 w-4" />
                <span className="font-medium text-xs">Modify Configurations</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(role)}
                className="rounded-md gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="font-medium text-xs">Terminate Role</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Permissions section - Badge row layout */}
        <div className="flex flex-wrap gap-1.5 overflow-hidden">
          {role?.permissions?.slice(0, 15).map((perm) => (
            <Badge 
              key={perm.id} 
              variant="outline" 
              className="bg-primary/5 border-primary/10 hover:border-primary/30 transition-colors text-[10px] py-0 px-2.5 h-6 flex items-center font-bold tracking-tight text-primary/80"
            >
              {perm.title}
            </Badge>
          ))}
          {permissionCount > 15 && (
            <span className="text-[10px] text-muted-foreground/60 px-1 py-1 font-medium italic">
              +{permissionCount - 15} more permissions
            </span>
          )}
          {permissionCount === 0 && (
            <p className="text-[10px] text-muted-foreground/40 italic py-2">
              No permissions associated with this role
            </p>
          )}
        </div>

        {/* Footer section */}
        <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[...Array(Math.min(userCount, 3))].map((_, i) => (
                <div key={i} className="w-5 h-5 rounded-full border-2 border-card bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
                  {i === 2 && userCount > 3 ? `+${userCount - 2}` : <Users className="w-2.5 h-2.5" />}
                </div>
              ))}
              {userCount === 0 && (
                <div className="w-5 h-5 rounded-full border-2 border-dashed border-muted-foreground/20" />
              )}
            </div>
            <span className="text-[10px] font-medium text-muted-foreground/70 tracking-tight">
              {userCount} {userCount === 1 ? 'User' : 'Users'} Assigned
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}