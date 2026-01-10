import { useContext, useMemo, useCallback } from "react";
import { PermissionContext } from "./AuthContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Helper to extract permissions from session
function useSessionPermissions(session, user = null) {


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

  return {
    user,
    isAuthenticated: !!user,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
  };
}

export function Access({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  role,
  deniedTooltip,
  tooltip,
  session, // Optional: pass session directly for standalone usage
}) {
  // Try to use context first, fallback to session prop
  const contextValue = useContext(PermissionContext);
  const sessionValue = useSessionPermissions(session);

  // Use context if available and no session prop, otherwise use session prop
  const authData = session ? sessionValue : (contextValue ?? sessionValue);

  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, isAuthenticated } = authData;

  const checkAccess = () => {
    // Not authenticated = no access
    if (!isAuthenticated) return false;

    // Check role if provided
    if (role && !hasRole(role)) return false;

    // Check single permission
    if (permission && !hasPermission(permission)) return false;

    // Check multiple permissions
    if (permissions && permissions.length > 0) {
      const hasAccess = requireAll
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
      if (!hasAccess) return false;
    }

    return true;
  };

  const hasAccess = checkAccess();

  // Wrap content with tooltip if provided
  const wrapWithTooltip = (content, tooltipText) => {
    if (!tooltipText) return content;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">{content}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (!hasAccess) {
    return <>{wrapWithTooltip(fallback, deniedTooltip)}</>;
  }

  return <>{wrapWithTooltip(children, tooltip)}</>;
}
