
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useManagement } from '../../_provider/managementProvider';



export function PermissionMatrix({ roles }) {
    const { permissions } = useManagement()
    const groupedPermissions = permissions.reduce((acc, permission) => {
        if (!acc[permission.category]) {
            acc[permission.category] = [];
        }
        acc[permission.category].push(permission);
        return acc;
    }, {});

    return (
        <div className="rounded-xl border border-border bg-card shadow-soft overflow-hidden">
            <ScrollArea className="w-full">
                <div className="min-w-[800px]">
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex border-b border-border bg-muted/50 backdrop-blur-sm">
                        <div className="w-64 shrink-0 p-4 font-medium text-card-foreground">
                            Permission
                        </div>
                        {roles.map((role) => (
                            <div
                                key={role.id}
                                className="flex-1 min-w-[120px] p-4 text-center font-medium text-card-foreground border-l border-border"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: role.color }}
                                    />
                                    <span className="truncate">{role.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Body */}
                    <div>
                        {(Object.entries(groupedPermissions)).map(
                            ([category, permissions]) => (
                                <div key={category}>
                                    {/* Category Header */}
                                    <div className="flex border-b border-border bg-muted/30">
                                        <div className="w-64 shrink-0 p-3 font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                                            {PERMISSION_CATEGORIES[category].label}
                                        </div>
                                        {roles.map((role) => (
                                            <div key={role.id} className="flex-1 min-w-[120px] border-l border-border" />
                                        ))}
                                    </div>

                                    {/* Permission Rows */}
                                    {permissions.map((permission, index) => (
                                        <div
                                            key={permission.id}
                                            className={cn(
                                                'flex border-b border-border transition-colors hover:bg-muted/30',
                                                index % 2 === 0 ? 'bg-card' : 'bg-muted/10'
                                            )}
                                        >
                                            <div className="w-64 shrink-0 p-4">
                                                <p className="font-medium text-card-foreground text-sm">{permission.name}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{permission.description}</p>
                                            </div>
                                            {roles.map((role) => {
                                                const hasPermission = role.permissions.includes(permission.id);
                                                return (
                                                    <div
                                                        key={role.id}
                                                        className="flex-1 min-w-[120px] flex items-center justify-center border-l border-border"
                                                    >
                                                        {hasPermission ? (
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/15">
                                                                <Check className="h-4 w-4 text-success" />
                                                            </div>
                                                        ) : (
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                                                <X className="h-4 w-4 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
