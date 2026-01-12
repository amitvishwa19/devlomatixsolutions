import { useAccessContext } from "./AccessContext";

export function usePermission() {
  const access = useAccessContext();

  if (!access) {
    return {
      can: () => false,
      canAny: () => false,
      canAll: () => false,
      hasRole: () => false,
    };
  }

  return {
    can: (permission) => access.hasPermission(permission),
    canAny: (perms) => access.hasAnyPermission(perms),
    canAll: (perms) => access.hasAllPermissions(perms),
    hasRole: (role) => access.hasRole(role),
  };
}