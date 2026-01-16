"use client";

import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAccess } from "@/providers/AccessProvider";




export default function AccessControl({
    view,
    edit,
    tooltip,
    children,
}) {
    const { can } = useAccess();

    const canView = view ? can(view) : true;
    const canEdit = edit ? can(edit) : true;

    // ❌ Cannot view at all
    if (!canView) {
        if (!tooltip) return null;

        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="opacity-50 cursor-not-allowed">{children}</div>
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
        );
    }

    // ✅ Full access
    if (canEdit) {
        return <>{children}</>;
    }

    // 👁 VIEW ONLY — HARD LOCK
    const content = (
        <div
            className="pointer-events-none opacity-60"
            aria-disabled="true"
            tabIndex={-1}
        >
            {children}
        </div>
    );

    if (!tooltip) return content;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="cursor-not-allowed">{content}</div>
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
    );
}
