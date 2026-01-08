import { usePermissions } from "./permission-context.jsx";


export function useCan(permission, mode = "all") {
    const { permissions } = usePermissions();

    const isSuperAdmin = permissions.includes("*");

    const can = Array.isArray(permission)
        ? mode === "all"
            ? permission.every(p => permissions.includes(p))
            : permission.some(p => permissions.includes(p))
        : permissions.includes(permission);

    return {
        can: isSuperAdmin || can,
    };
}