// hooks/use-permissions.js
'use client';

import { useOrg } from '@/providers/OrgProvider';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function usePermissions() {
    const { server } = useOrg();
    const { data: session } = useSession();
    const [permissions, setPermissions] = useState([]);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        if (server?.members && session?.user?.id) {
            // Find current user's roles
            const userMember = server.members.find(m => m.userId === session.user.id);
            if (userMember) {
                const userRoles = userMember.roles || [];
                setRoles(userRoles.map(r => r.slug));

                // Flatten all permissions from roles
                const allPermissions = userRoles.flatMap(role =>
                    role.permissions || []
                );
                setPermissions([...new Set(allPermissions)]);
            }
        }
    }, [server?.members, session?.user?.id]);

    const hasPermission = (permission) => {
        return permissions.includes(permission);
    };

    const hasAnyPermission = (permissionsList) => {
        return permissionsList.some(p => hasPermission(p));
    };

    const hasRole = (roleSlug) => {
        return roles.includes(roleSlug);
    };

    const hasAnyRole = (rolesList) => {
        return rolesList.some(r => hasRole(r));
    };

    return {
        permissions,
        roles,
        hasPermission,
        hasAnyPermission,
        hasRole,
        hasAnyRole,
        canCreate: (resource) => hasPermission(`create:${resource}`),
        canRead: (resource) => hasPermission(`read:${resource}`),
        canUpdate: (resource) => hasPermission(`update:${resource}`),
        canDelete: (resource) => hasPermission(`delete:${resource}`)
    };
}
