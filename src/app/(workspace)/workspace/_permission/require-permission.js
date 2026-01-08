import { redirect } from "next/navigation";

export function requirePermission(userPermissions = [], permission) {
    const isSuperAdmin = userPermissions.includes("*");

    const hasPermission = Array.isArray(permission)
        ? permission.every(p => userPermissions.includes(p))
        : userPermissions.includes(permission);

    if (!isSuperAdmin && !hasPermission) {
        redirect("/unauthorized");
    }
}
