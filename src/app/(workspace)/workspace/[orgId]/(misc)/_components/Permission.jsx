"use client";

import React from "react";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePermissions } from "@/app/(workspace)/workspace/_permission/permission-context.jsx";

export default function Permission({
    permission,
    mode = "all",
    view = true,
    edit = false,
    readonly = false,
    tooltip = "You don’t have permission to perform this action",
    children,
}) {
    const { permissions } = usePermissions();

    const isSuperAdmin = permissions.includes("*");

    const hasPermission = isSuperAdmin
        ? true
        : Array.isArray(permission)
            ? mode === "all"
                ? permission.every(p => permissions.includes(p))
                : permission.some(p => permissions.includes(p))
            : permissions.includes(permission);

    // ❌ Hide component
    if (!hasPermission && !view) {
        return null;
    }

    // 🔒 Read-only mode (inputs)
    if (!hasPermission && readonly) {
        return React.cloneElement(children, {
            readOnly: true,
            disabled: true,
            className: `${children.props.className || ""} opacity-70`,
        });
    }

    // ❌ Disable with tooltip
    if (!hasPermission && edit) {
        const disabledChild = React.cloneElement(children, {
            disabled: true,
            onClick: undefined,
            className: `${children.props.className || ""} opacity-50 cursor-not-allowed`,
        });

        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="inline-block">{disabledChild}</span>
                    </TooltipTrigger>
                    <TooltipContent>{tooltip}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    // ✅ Allowed
    return children;
}
