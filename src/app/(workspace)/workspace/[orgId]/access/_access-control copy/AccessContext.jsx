'use client'

import { createContext, useCallback, useContext, useMemo } from "react";

export const AccessContext = createContext(undefined);

export function AccessProvider({ children, session, user = null }) {
    //const user = session?.user ?? null;

    // Extract all permissions from all roles
    const permissions = useMemo(() => {
        const permSet = new Set();
        if (user?.roles) {
            user.roles.forEach((role) => {
                role?.permissions?.forEach((perm) => {
                    if (perm.status) {
                        permSet.add(perm.value);
                    }
                });
            });
        }


        console.log('from access context', permSet)

        return permSet;
    }, [user]);

    const hasPermission = useCallback((permission) => {
        return permissions.has(permission);
    }, [permissions]);

    const hasAnyPermission = useCallback((perms) => {
        return perms.some((p) => permissions.has(p));
    }, [permissions]);

    const hasAllPermissions = useCallback((perms) => {
        return perms.every((p) => permissions.has(p));
    }, [permissions]);

    const hasRole = useCallback((roleTitle) => {
        return user?.roles?.some((r) => r.title.toLowerCase() === roleTitle.toLowerCase()) ?? false;
    }, [user]);

    const value = {
        user,
        isAuthenticated: !!user,
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
    };

    return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccessContext() {
    const context = useContext(AccessContext);
    // Return context or undefined - no error thrown for standalone Access usage
    return context;
}

// Use this when you require the provider to be present
export function useRequiredAccessContext() {
    const context = useContext(AccessContext);
    if (context === undefined) {
        throw new Error("useRequiredAccessContext must be used within a PermissionProvider");
    }
    return context;
}
