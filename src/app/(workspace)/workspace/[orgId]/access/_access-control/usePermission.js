import { usePermissionContext } from "./AuthContext";

// Helper hook for common permission patterns
export function usePermission() {
  const context = usePermissionContext();

  // Return no-op functions if no context (for standalone Access usage)
  if (!context) {
    return {
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      permissions: new Set(),
      canView: () => false,
      canCreate: () => false,
      canEdit: () => false,
      canDelete: () => false,
      canManage: () => false,
    };
  }

  const { hasPermission, hasAnyPermission, hasAllPermissions, permissions } = context;

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions,

    // Convenience methods for common patterns
    canView: (category) => hasPermission(`${category}.view`),
    canCreate: (category) => hasPermission(`${category}.create`),
    canEdit: (category) => hasPermission(`${category}.edit`),
    canDelete: (category) => hasPermission(`${category}.delete`),
    canManage: (category) => hasPermission(`${category}.manage`),
    canExport: (category) => hasPermission(`${category}.export`),
    canImport: (category) => hasPermission(`${category}.import`),
  };
}
