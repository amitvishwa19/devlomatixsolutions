"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccess } from "@/providers/AccessProvider";



export default function ProtectedRoute({
    permissions = [],
    children,
}) {
    const router = useRouter();
    const { can } = useAccess();

    useEffect(() => {
        if (
            permissions.length > 0 &&
            !permissions.some((p) => can(p))
        ) {
            router.replace("/unauthorized");
        }
    }, [permissions, can, router]);

    return <>{children}</>;
}
