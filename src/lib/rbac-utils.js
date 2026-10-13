import { getSidebarNavItems } from "../app/workspace/_lib/sidebar-nav-item.js";

/**
 * Normalizes role or string identifiers for robust comparison.
 * e.g., "SUPER_ADMIN", "super-admin", "Super Admin" all become "superadmin".
 */
export function normalizeIdentifier(str) {
    if (typeof str !== "string") return "";
    return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Checks whether a given user or JWT token possesses Super Admin privileges.
 * Matches: SUPER_ADMIN, super-admin, superadmin, super_admin, Super Admin, etc.
 *
 * @param {object|null} tokenOrUser - NextAuth JWT token or User session object
 * @returns {boolean}
 */
export function isSuperAdmin(tokenOrUser) {
    if (!tokenOrUser) return false;

    // 1. Direct role property check (e.g. token.role === "SUPER_ADMIN")
    if (normalizeIdentifier(tokenOrUser.role) === "superadmin") {
        return true;
    }

    // 2. Roles array check (e.g. token.roles = [{ title: "Super Admin" }, ...])
    const roles = Array.isArray(tokenOrUser.roles) ? tokenOrUser.roles : [];
    for (const r of roles) {
        if (typeof r === "string" && normalizeIdentifier(r) === "superadmin") {
            return true;
        }
        if (r && typeof r === "object") {
            if (
                normalizeIdentifier(r.title) === "superadmin" ||
                normalizeIdentifier(r.name) === "superadmin" ||
                normalizeIdentifier(r.role) === "superadmin"
            ) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Extracts a flattened set of active permission string values from a JWT token or user session.
 *
 * @param {object|null} tokenOrUser
 * @returns {string[]} Array of unique permission values
 */
export function extractUserPermissions(tokenOrUser) {
    if (!tokenOrUser) return [];

    const perms = new Set();

    // 1. Direct permissions array if present
    if (Array.isArray(tokenOrUser.permissions)) {
        tokenOrUser.permissions.forEach((p) => {
            if (typeof p === "string") perms.add(p);
            else if (p && typeof p === "object" && p.value && (p.status === undefined || p.status === true)) {
                perms.add(p.value);
            }
        });
    }

    // 2. Permissions inside roles
    const roles = Array.isArray(tokenOrUser.roles) ? tokenOrUser.roles : [];
    for (const role of roles) {
        if (role && typeof role === "object" && Array.isArray(role.permissions)) {
            role.permissions.forEach((p) => {
                if (typeof p === "string") perms.add(p);
                else if (p && typeof p === "object" && p.value && (p.status === undefined || p.status === true)) {
                    perms.add(p.value);
                }
            });
        }
    }

    return Array.from(perms);
}

/**
 * Extracts a flattened list of active role titles/names from a JWT token or user session.
 *
 * @param {object|null} tokenOrUser
 * @returns {string[]} Array of role names
 */
export function extractUserRoles(tokenOrUser) {
    if (!tokenOrUser) return [];

    const rolesSet = new Set();

    if (typeof tokenOrUser.role === "string") {
        rolesSet.add(tokenOrUser.role);
    }

    if (Array.isArray(tokenOrUser.roles)) {
        tokenOrUser.roles.forEach((r) => {
            if (typeof r === "string") rolesSet.add(r);
            else if (r && typeof r === "object") {
                if (r.title) rolesSet.add(r.title);
                if (r.name) rolesSet.add(r.name);
            }
        });
    }

    return Array.from(rolesSet);
}

/**
 * Finds the navigation group that best matches a specific pathname.
 *
 * @param {string} pathname - Full request URL path (e.g. /workspace/ws123/crm/dcr)
 * @param {string} workspaceId - Workspace identifier
 * @returns {object|null} Matching navigation group item from sidebar-nav-item
 */
export function getNavGroupForPath(pathname, workspaceId) {
    if (!pathname || !workspaceId) return null;

    const items = getSidebarNavItems(workspaceId);
    const normalizedPath = pathname.endsWith("/") && pathname.length > 1
        ? pathname.slice(0, -1)
        : pathname;

    // Filter candidate groups whose baseUrl matches the pathname prefix
    const matches = items.filter((item) => {
        if (!item.baseUrl) return false;
        const base = item.baseUrl.endsWith("/") && item.baseUrl.length > 1
            ? item.baseUrl.slice(0, -1)
            : item.baseUrl;

        if (normalizedPath === base) return true;
        return normalizedPath.startsWith(base + "/");
    });

    if (matches.length === 0) return null;

    // Sort descending by baseUrl length to pick the most specific match
    // e.g. /workspace/[id]/crm over /workspace/[id]
    matches.sort((a, b) => (b.baseUrl?.length || 0) - (a.baseUrl?.length || 0));

    return matches[0];
}

/**
 * Validates whether a token/user has authorization to access a given navigation item.
 *
 * @param {object} group - Navigation group object from sidebar-nav-item
 * @param {object|null} tokenOrUser - NextAuth JWT token or user session
 * @returns {boolean}
 */
export function canAccessNavGroup(group, tokenOrUser) {
    if (!group) return true;

    // Super Admin bypasses all checks
    if (isSuperAdmin(tokenOrUser)) return true;

    const userRoles = extractUserRoles(tokenOrUser);
    const userPerms = extractUserPermissions(tokenOrUser);

    // 1. Direct Module Role Match: If user has a role whose title matches the group parent title
    // e.g., role "Devx(CRM)", "eCommerce", "Workspace", "KonnectX", etc.
    if (group.parent?.title) {
        const normTitle = normalizeIdentifier(group.parent.title);
        if (userRoles.some((ur) => normalizeIdentifier(ur) === normTitle)) return true;
        if (userPerms.some((up) => normalizeIdentifier(up) === normTitle)) return true;
    }

    const requiredPermissions = Array.isArray(group.permission)
        ? group.permission
        : (group.permission ? [group.permission] : []);

    const requiredRoles = Array.isArray(group.roles)
        ? group.roles
        : (group.roles ? [group.roles] : []);

    // If no permission or role is defined, it is accessible to all workspace users
    if (requiredPermissions.length === 0 && requiredRoles.length === 0) {
        return true;
    }

    // 2. Role match (against user's assigned roles or permissions)
    if (requiredRoles.length > 0) {
        const hasRole = requiredRoles.some((reqRole) => {
            const normReq = normalizeIdentifier(reqRole);
            return (
                userRoles.some((ur) => normalizeIdentifier(ur) === normReq) ||
                userPerms.some((up) => normalizeIdentifier(up) === normReq)
            );
        });
        if (hasRole) return true;
    }

    // 3. Permission match (against user's permissions OR roles)
    if (requiredPermissions.length > 0) {
        const hasPerm = requiredPermissions.some((reqPerm) => {
            // Direct exact match
            if (userPerms.includes(reqPerm)) return true;

            // Normalized match against user permissions or user roles
            const normReq = normalizeIdentifier(reqPerm);
            if (userPerms.some((up) => normalizeIdentifier(up) === normReq)) return true;
            if (userRoles.some((ur) => normalizeIdentifier(ur) === normReq)) return true;

            // Fallback match for legacy or db style slug e.g. navigation.crm vs navbar:DevX(CRM):Parent
            return userPerms.some((up) => {
                const normUp = normalizeIdentifier(up);
                if (group.parent?.title && normUp.includes(normalizeIdentifier(group.parent.title))) return true;
                return false;
            });
        });

        if (hasPerm) return true;
    }

    // 4. Sub-item permission check: If user possesses any child page permission for this group
    if (group.parent?.title) {
        const normTitle = normalizeIdentifier(group.parent.title);
        const hasChildPerm = userPerms.some((up) => {
            const normUp = normalizeIdentifier(up);
            return normUp.startsWith(`navbar${normTitle}`);
        });
        if (hasChildPerm) return true;
    }

    return false;
}

/**
 * High-level check to determine if a route path is authorized for the given token/user.
 *
 * @param {string} pathname
 * @param {string} workspaceId
 * @param {object|null} tokenOrUser
 * @returns {{ allowed: boolean, matchedGroup: object|null, reason?: string }}
 */
export function checkPathAccess(pathname, workspaceId, tokenOrUser) {
    if (isSuperAdmin(tokenOrUser)) {
        return { allowed: true, matchedGroup: null };
    }

    // 1. Workspace membership check: user must belong to this workspace
    if (tokenOrUser?.workspaces && Array.isArray(tokenOrUser.workspaces) && tokenOrUser.workspaces.length > 0) {
        if (!tokenOrUser.workspaces.includes(workspaceId)) {
            return {
                allowed: false,
                matchedGroup: null,
                reason: `User is not a member of workspace ${workspaceId}`
            };
        }
    }

    const matchedGroup = getNavGroupForPath(pathname, workspaceId);

    // If no specific group matched (e.g. unknown sub-route or generic workspace landing)
    if (!matchedGroup) {
        return { allowed: true, matchedGroup: null };
    }

    // Enforce permission checks strictly, including on Workspace Home (navbar:Workspace:Home)
    const allowed = canAccessNavGroup(matchedGroup, tokenOrUser);
    return {
        allowed,
        matchedGroup,
        reason: allowed ? undefined : `Missing permission for module ${matchedGroup.parent?.title || "Unknown"}`
    };
}
