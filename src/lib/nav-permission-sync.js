import { db } from "./db.js";
import { getSidebarNavItems } from "../app/workspace/_lib/sidebar-nav-item.js";

/**
 * Extracts a normalized list of navigation permissions directly from sidebar-nav-item.js.
 * Generates both Module-level permissions and Child Item permissions.
 *
 * @param {string} workspaceId
 * @returns {Array<{ title: string, value: string, category: string, type: string, url: string, description: string, status: boolean }>}
 */
export function generateNavPermissionsFromSidebar(workspaceId = "default") {
    const navItems = getSidebarNavItems(workspaceId);
    const permissions = [];

    navItems.forEach((group) => {
        const moduleTitle = group.parent?.title || "Module";
        const primaryPermValue = Array.isArray(group.permission) && group.permission.length > 0
            ? group.permission[0]
            : `navbar:${moduleTitle}:Parent`;

        // 1. Module Level Permission
        permissions.push({
            title: moduleTitle,
            value: primaryPermValue,
            category: moduleTitle,
            type: "NAVIGATION",
            url: group.baseUrl || group.parent?.url || null,
            description: `Full access to ${moduleTitle} module and sidebar navigation`,
            status: true,
        });

        // 2. Child Items Permissions
        if (Array.isArray(group.child) && group.child.length > 0) {
            group.child.forEach((child) => {
                const childTitle = child.title || "Item";
                const cleanSlug = childTitle.replace(/[^a-zA-Z0-9]/g, "");
                const childValue = `navbar:${moduleTitle}:${cleanSlug}`;

                permissions.push({
                    title: `${moduleTitle} > ${childTitle}`,
                    value: childValue,
                    category: moduleTitle,
                    type: "NAVIGATION_ITEM",
                    url: child.url || null,
                    description: `Access to ${childTitle} page in ${moduleTitle}`,
                    status: true,
                });
            });
        }
    });

    return permissions;
}

/**
 * Synchronizes navigation permissions with the database (db.permission).
 * Upserts all module and child permissions so they are available in RBAC matrix and role dialogs.
 * Uses batch operations for high performance.
 *
 * @param {string} workspaceId
 * @returns {Promise<{ created: number, updated: number, total: number }>}
 */
export async function syncNavigationPermissionsToDb(workspaceId = "default") {
    const generatedPerms = generateNavPermissionsFromSidebar(workspaceId);

    // Fetch existing permission values in 1 fast query
    const existingPerms = await db.permission.findMany({
        select: { id: true, value: true }
    });
    const existingMap = new Map(existingPerms.map(p => [p.value, p.id]));

    const toCreate = [];
    const toUpdate = [];

    for (const perm of generatedPerms) {
        const existingId = existingMap.get(perm.value);
        if (existingId) {
            toUpdate.push({ id: existingId, ...perm });
        } else {
            toCreate.push(perm);
        }
    }

    // 1. Batch create all missing permissions in 1 query
    if (toCreate.length > 0) {
        await db.permission.createMany({
            data: toCreate.map(p => ({
                title: p.title,
                value: p.value,
                category: p.category,
                type: p.type,
                url: p.url,
                description: p.description,
                status: p.status,
            })),
            skipDuplicates: true
        });
    }

    // 2. Update existing in small concurrent chunks if needed
    const updatePromises = toUpdate.map(p => 
        db.permission.update({
            where: { id: p.id },
            data: {
                title: p.title,
                category: p.category,
                type: p.type,
                url: p.url,
                description: p.description,
            }
        })
    );
    await Promise.all(updatePromises);

    return {
        created: toCreate.length,
        updated: toUpdate.length,
        total: generatedPerms.length,
    };
}

