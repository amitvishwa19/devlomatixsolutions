'use client'

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DynamicIcon } from "lucide-react/dynamic";
import {
    ChevronDown,
    ChevronRight,
    Shield,
    ShieldCheck,
    Plus,
    Check,
    ExternalLink,
    Loader2,
} from "lucide-react";
import { normalizeIdentifier } from "@/lib/rbac-utils";

export function NavigationPermissionRow({
    group,
    dbPerm,
    allPerms,
    roles,
    onToggleRole,
    togglingMap = {},
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isRolePopoverOpen, setIsRolePopoverOpen] = useState(false);

    const moduleTitle = group.parent.title;
    const primaryPermValue = group.permission?.[0] || `navbar:${moduleTitle}:Parent`;
    const children = group.child || [];

    // Find all roles assigned to this module level permission
    const getRolesForPerm = (perm) => {
        if (!perm) return [];
        return (roles || []).filter((r) => {
            // Direct title match (e.g. role "Devx(CRM)" matches module "DevX(CRM)")
            if (normalizeIdentifier(r.title) === normalizeIdentifier(moduleTitle)) {
                return true;
            }
            // Check role's permissions
            return r.permissions?.some(
                (p) =>
                    p.id === perm.id ||
                    normalizeIdentifier(p.value) === normalizeIdentifier(perm.value)
            );
        });
    };

    const moduleAssignedRoles = getRolesForPerm(dbPerm);

    return (
        <div className="border border-border/60 rounded-xl bg-card overflow-hidden shadow-xs hover:border-primary/30 transition-all duration-200">
            {/* Top Module Header Row */}
            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/10 hover:bg-muted/20 transition-colors">
                {/* Module Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                        title={isExpanded ? "Collapse sub-pages" : "Expand sub-pages"}
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-primary" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </button>

                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <DynamicIcon name={group.parent.icon || "layout-grid"} className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-foreground tracking-tight">
                                {moduleTitle}
                            </span>
                            <code className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 border border-border/50 text-muted-foreground font-mono">
                                {primaryPermValue}
                            </code>
                        </div>
                        <p className="text-xs text-muted-foreground truncate font-mono opacity-80 mt-0.5">
                            {group.baseUrl}
                        </p>
                    </div>
                </div>

                {/* Assigned Roles & Quick Assign Popover */}
                <div className="flex items-center gap-2 flex-wrap md:justify-end pl-10 md:pl-0">
                    {/* Role Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {moduleAssignedRoles.length > 0 ? (
                            moduleAssignedRoles.map((role) => (
                                <Badge
                                    key={role.id}
                                    variant="outline"
                                    className="text-xs px-2.5 py-0.5 gap-1 font-medium bg-background border-primary/30 text-primary"
                                    style={{ borderColor: role.color ? `${role.color}40` : undefined }}
                                >
                                    <div
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: role.color || "var(--primary)" }}
                                    />
                                    <span>{role.title}</span>
                                </Badge>
                            ))
                        ) : (
                            <span className="text-[11px] text-muted-foreground italic px-2">
                                No roles assigned
                            </span>
                        )}
                    </div>

                    {/* Assign / Remove Role Popover */}
                    {dbPerm && (
                        <Popover open={isRolePopoverOpen} onOpenChange={setIsRolePopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs px-2.5 gap-1.5 border-dashed border-primary/40 hover:border-primary text-primary hover:bg-primary/5 cursor-pointer"
                                >
                                    <Shield className="w-3 h-3" />
                                    <span>Assign Role</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-64 p-3 bg-popover border border-border/80 shadow-xl rounded-xl">
                                <div className="space-y-2">
                                    <div className="border-b pb-2">
                                        <h4 className="text-xs font-bold tracking-tight">
                                            Assign {moduleTitle}
                                        </h4>
                                        <p className="text-[10px] text-muted-foreground">
                                            Toggle roles that can access this module
                                        </p>
                                    </div>

                                    <div className="space-y-1 max-h-48 overflow-y-auto pt-1">
                                        {(roles || []).map((role) => {
                                            const isAssigned = moduleAssignedRoles.some((r) => r.id === role.id);
                                            const key = `${role.id}-${dbPerm.id}`;
                                            const isToggling = Boolean(togglingMap[key]);

                                            return (
                                                <button
                                                    key={role.id}
                                                    type="button"
                                                    disabled={isToggling}
                                                    onClick={() => onToggleRole(role.id, dbPerm.id)}
                                                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                                                        isAssigned
                                                            ? "bg-primary/10 text-primary font-medium"
                                                            : "hover:bg-muted text-muted-foreground"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div
                                                            className="w-2 h-2 rounded-full shrink-0"
                                                            style={{ backgroundColor: role.color || "var(--primary)" }}
                                                        />
                                                        <span className="truncate">{role.title}</span>
                                                    </div>

                                                    {isToggling ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : isAssigned ? (
                                                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                                                    ) : null}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            </div>

            {/* Expanded Sub-pages Section */}
            {isExpanded && children.length > 0 && (
                <div className="border-t border-border/40 bg-muted/5 p-4 space-y-2.5 animate-in fade-in-50 duration-200">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Sub-pages & Granular Routes ({children.length})
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {children.map((child) => {
                            const cleanSlug = child.title.replace(/[^a-zA-Z0-9]/g, "");
                            const childPermValue = `navbar:${moduleTitle}:${cleanSlug}`;
                            const childDbPerm = allPerms.find(
                                (p) => normalizeIdentifier(p.value) === normalizeIdentifier(childPermValue)
                            );
                            const childRoles = getRolesForPerm(childDbPerm);

                            return (
                                <div
                                    key={child.title}
                                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-background/80 hover:bg-background transition-colors text-xs"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <DynamicIcon
                                            name={child.icon || "file-text"}
                                            className="w-3.5 h-3.5 text-muted-foreground shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <p className="font-medium text-foreground truncate">{child.title}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono truncate">
                                                {child.url}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                                        {childRoles.length > 0 ? (
                                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-mono">
                                                {childRoles.length} {childRoles.length === 1 ? "role" : "roles"}
                                            </Badge>
                                        ) : (
                                            <span className="text-[10px] text-muted-foreground opacity-60 italic">
                                                Inherits module
                                            </span>
                                        )}

                                        {childDbPerm && (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer"
                                                        title="Manage sub-page roles"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent align="end" className="w-56 p-2 bg-popover border shadow-lg rounded-xl">
                                                    <div className="space-y-1.5">
                                                        <div className="border-b pb-1.5 px-1">
                                                            <p className="text-xs font-bold truncate">{child.title}</p>
                                                            <p className="text-[9px] text-muted-foreground font-mono truncate">
                                                                {childPermValue}
                                                            </p>
                                                        </div>
                                                        <div className="max-h-40 overflow-y-auto space-y-0.5">
                                                            {(roles || []).map((role) => {
                                                                const isAssigned = childRoles.some((r) => r.id === role.id);
                                                                return (
                                                                    <button
                                                                        key={role.id}
                                                                        type="button"
                                                                        onClick={() => onToggleRole(role.id, childDbPerm.id)}
                                                                        className={`w-full flex items-center justify-between p-1.5 rounded-md text-xs cursor-pointer ${
                                                                            isAssigned
                                                                                ? "bg-primary/10 text-primary font-medium"
                                                                                : "hover:bg-muted text-muted-foreground"
                                                                        }`}
                                                                    >
                                                                        <span className="truncate">{role.title}</span>
                                                                        {isAssigned && <Check className="w-3 h-3" />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
