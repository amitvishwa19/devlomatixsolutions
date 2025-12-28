// components/protected.jsx
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export function Protected({
    children,
    create,
    read,
    update,
    delete: del,
    fallback = "No access"
}) {
    const { canCreate, canRead, canUpdate, canDelete } = usePermissions();

    const permissions = [];
    if (create) permissions.push('create:' + create);
    if (read) permissions.push('read:' + read);
    if (update) permissions.push('update:' + update);
    if (del) permissions.push('delete:' + del);

    const hasAccess = permissions.every(p => {
        if (p.startsWith('create:')) return canCreate(p.split(':')[1]);
        if (p.startsWith('read:')) return canRead(p.split(':')[1]);
        if (p.startsWith('update:')) return canUpdate(p.split(':')[1]);
        if (p.startsWith('delete:')) return canDelete(p.split(':')[1]);
        return false;
    });

    if (!hasAccess) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-muted rounded-lg">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">Insufficient Permissions</h3>
                <p className="text-sm text-muted-foreground mt-1">{fallback}</p>
            </div>
        );
    }

    return children;
}
