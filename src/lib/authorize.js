import { redirect, notFound } from "next/navigation";



export function authorize(
    user,
    { permissions = [], redirectTo = "unauthorized" }
) {
    // Not logged in
    if (!user) {
        redirect("/login");
    }

    // Super Admin → allow all
    const isSuperAdmin = user.roles?.some(
        (r) => r.title === "Super Admin"
    );

    if (isSuperAdmin) return;

    // Check permission
    const userPermissions = new Set(
        user.roles?.flatMap((r) =>
            r.permissions?.filter((p) => p.status).map((p) => p.value)
        )
    );

    const hasAccess =
        permissions.length === 0 ||
        permissions.some((p) => userPermissions.has(p));

    if (!hasAccess) {
        redirectTo === "not-found" ? notFound() : redirect("/unauthorized");
    }
}
