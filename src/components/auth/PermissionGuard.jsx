"use client";

import React from "react";
import { useAccess } from "@/providers/WorkspaceProvider";
import { useSession } from "next-auth/react";
import {
    isSuperAdmin as checkIsSuperAdmin,
    normalizeIdentifier,
    extractUserPermissions,
    extractUserRoles,
} from "@/lib/rbac-utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * PermissionGuard
 * 
 * Conditionally renders children if the authenticated user has the required
 * permissions or roles.
 * 
 * - Super Admins (SUPER_ADMIN, super-admin, superadmin, etc.) bypass all checks.
 * - Supports simulated roles from Access Management preview mode.
 * - Optional disabled tooltip state via `showTooltip`.
 *
 * @param {string|string[]} [permission] - Required permission value(s)
 * @param {string|string[]} [role] - Required role title(s)
 * @param {string[]} [permissions] - Alternative plural array of permissions
 * @param {string[]} [roles] - Alternative plural array of roles
 * @param {React.ReactNode} [fallback=null] - What to render if unauthorized
 * @param {boolean} [showTooltip=false] - If true, renders child disabled with a tooltip
 * @param {string} [tooltipMessage] - Tooltip message text
 * @param {React.ReactNode} children - Guarded content
 */
export default function PermissionGuard({
    permission,
    role,
    permissions = [],
    roles = [],
    fallback = null,
    showTooltip = false,
    tooltipMessage = "You do not have permission to access this feature.",
    children,
}) {
    const { isSuperAdmin: contextIsSuperAdmin, previewRole, activePermissions } = useAccess() || {};
    const { data: session } = useSession();

    // Merge singular and plural parameters
    const requiredPerms = [
        ...(permission ? (Array.isArray(permission) ? permission : [permission]) : []),
        ...(permissions || []),
    ];

    const requiredRoles = [
        ...(role ? (Array.isArray(role) ? role : [role]) : []),
        ...(roles || []),
    ];

    // Determine current user context (support simulated preview in Access Manager)
    const currentUser = previewRole
        ? {
            role: previewRole.title,
            roles: [previewRole],
            permissions: activePermissions || [],
        }
        : session?.user;

    // 1. Super Admin bypass: Always allow
    if (contextIsSuperAdmin || checkIsSuperAdmin(currentUser)) {
        return <>{children}</>;
    }

    // 2. Open access if no restrictions requested
    if (requiredPerms.length === 0 && requiredRoles.length === 0) {
        return <>{children}</>;
    }

    const userRoles = extractUserRoles(currentUser);
    const userPerms = extractUserPermissions(currentUser);

    // 3. Match roles
    let hasRoleMatch = false;
    if (requiredRoles.length > 0) {
        hasRoleMatch = requiredRoles.some((reqRole) =>
            userRoles.some((ur) => normalizeIdentifier(ur) === normalizeIdentifier(reqRole))
        );
    }

    // 4. Match permissions
    let hasPermMatch = false;
    if (requiredPerms.length > 0) {
        hasPermMatch = requiredPerms.some((reqPerm) => {
            if (userPerms.includes(reqPerm)) return true;
            const normReq = normalizeIdentifier(reqPerm);
            return userPerms.some((up) => normalizeIdentifier(up) === normReq);
        });
    }

    // Authorized if matching any specified role or permission
    const isAuthorized =
        (requiredRoles.length > 0 && hasRoleMatch) ||
        (requiredPerms.length > 0 && hasPermMatch);

    if (isAuthorized) {
        return <>{children}</>;
    }

    if (showTooltip) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="opacity-50 cursor-not-allowed select-none pointer-events-none inline-block">
                        {children}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-xs">{tooltipMessage}</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    return fallback;
}
