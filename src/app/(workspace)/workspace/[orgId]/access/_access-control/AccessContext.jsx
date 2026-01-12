'use client'
import { createContext, useContext, useMemo } from "react";

const AccessContext = createContext(null);

export function AccessProvider({ session, children }) {
  const value = useMemo(() => {
    const roles = session?.user?.roles ?? [];
    const permissions = new Set();

    roles.forEach(role => {
      role.permissions?.forEach(perm => {
        if (perm.status) permissions.add(perm.value);
      });
    });

    const roleNames = roles.map(r => r.name);
    const isSuperAdmin =
      roleNames.includes("SUPER_ADMIN") ||
      roleNames.includes("Super Admin");

    return {
      roles: roleNames,
      permissions,

      hasRole: (role) => roleNames.includes(role),

      hasPermission: (perm) =>
        isSuperAdmin || permissions.has(perm),

      hasAnyPermission: (perms = []) =>
        isSuperAdmin || perms.some(p => permissions.has(p)),

      hasAllPermissions: (perms = []) =>
        isSuperAdmin || perms.every(p => permissions.has(p)),
    };
  }, [session]);

  return (
    <AccessContext.Provider value={value}>
      {children}
    </AccessContext.Provider>
  );
}

export function useAccessContext() {
  const context = useContext(AccessContext);

  if (!context && process.env.NODE_ENV === "development") {
    console.warn(
      "[AccessControl] AccessProvider is missing in component tree"
    );
  }

  return context;
}

export const useRequiredAccessContext = useAccessContext;