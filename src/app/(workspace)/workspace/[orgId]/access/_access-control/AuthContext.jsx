'use client'

import { createContext, useCallback, useContext, useMemo } from "react";

export const PermissionContext = createContext(undefined);

export function PermissionProvider({ children, session, user = null }) {
  //const user = session?.user ?? null;

  // Extract all permissions from all roles
  const permissions = useMemo(() => {
    const permSet = new Set();
    if (user?.roles) {
      user.roles.forEach((role) => {
        role.permissions?.forEach((perm) => {
          if (perm.status) {
            permSet.add(perm.value);
          }
        });
      });
    }
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

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissionContext() {
  const context = useContext(PermissionContext);
  // Return context or undefined - no error thrown for standalone Access usage
  return context;
}

// Use this when you require the provider to be present
export function useRequiredPermissionContext() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("useRequiredPermissionContext must be used within a PermissionProvider");
  }
  return context;
}
