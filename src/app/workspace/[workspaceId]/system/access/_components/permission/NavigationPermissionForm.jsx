'use client'

import React, { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { DynamicIcon } from "lucide-react/dynamic";
import { ChevronDown, ChevronRight, Shield, ShieldCheck } from "lucide-react";
import { getSidebarNavItems } from "@/app/workspace/_lib/sidebar-nav-item";
import { useParams } from "next/navigation";
import { normalizeIdentifier } from "@/lib/rbac-utils";

export function NavigationPermissionForm({ form }) {
    const params = useParams();
    const workspaceId = params?.workspaceId || "default";

    const navStructure = useMemo(() => getSidebarNavItems(workspaceId), [workspaceId]);
    const formPermissions = form ? form.watch("permissions") || [] : [];

    // Helper to get status of a permission by value
    const getPermStatus = (permValue) => {
        const normTarget = normalizeIdentifier(permValue);
        const found = formPermissions.find((p) => {
            if (!p?.value) return false;
            return normalizeIdentifier(p.value) === normTarget;
        });
        return found ? Boolean(found.status) : false;
    };

    // Toggle a single permission
    const togglePerm = (permValue) => {
        const normTarget = normalizeIdentifier(permValue);
        const updated = formPermissions.map((p) => {
            if (p?.value && normalizeIdentifier(p.value) === normTarget) {
                return { ...p, status: !p.status };
            }
            return p;
        });
        form.setValue("permissions", updated, { shouldDirty: true, shouldValidate: true });
    };

    // Toggle entire module and all its children
    const toggleModule = (group, nextStatus) => {
        const modulePerm = group.permission?.[0] || `navbar:${group.parent.title}:Parent`;
        const childPerms = (group.child || []).map(
            (c) => `navbar:${group.parent.title}:${c.title.replace(/[^a-zA-Z0-9]/g, "")}`
        );
        const allTargets = new Set([
            normalizeIdentifier(modulePerm),
            ...childPerms.map((cp) => normalizeIdentifier(cp)),
        ]);

        const updated = formPermissions.map((p) => {
            if (p?.value && allTargets.has(normalizeIdentifier(p.value))) {
                return { ...p, status: nextStatus };
            }
            return p;
        });
        form.setValue("permissions", updated, { shouldDirty: true, shouldValidate: true });
    };

    return (
        <div className="p-3 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
                <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Sidebar Navigation Modules
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                        Enable entire modules or customize access to specific sub-pages
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {navStructure.map((group) => {
                    const moduleTitle = group.parent.title;
                    const primaryPerm = group.permission?.[0] || `navbar:${moduleTitle}:Parent`;
                    const isModuleActive = getPermStatus(primaryPerm);

                    const children = group.child || [];
                    const activeChildrenCount = children.filter((child) => {
                        const childPerm = `navbar:${moduleTitle}:${child.title.replace(/[^a-zA-Z0-9]/g, "")}`;
                        return getPermStatus(childPerm);
                    }).length;

                    return (
                        <div
                            key={moduleTitle}
                            className={`border rounded-lg transition-all duration-200 overflow-hidden ${
                                isModuleActive ? "border-primary/40 bg-primary/5" : "border-border/60 bg-card/40"
                            }`}
                        >
                            {/* Module Header Bar */}
                            <div className="flex items-center justify-between p-3 bg-muted/20 hover:bg-muted/40 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-8 h-8 rounded-md flex items-center justify-center border ${
                                            isModuleActive
                                                ? "bg-primary/20 border-primary/30 text-primary"
                                                : "bg-muted border-border text-muted-foreground opacity-60"
                                        }`}
                                    >
                                        <DynamicIcon name={group.parent.icon || "layout-grid"} className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold tracking-tight">{moduleTitle}</span>
                                            {isModuleActive && (
                                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-primary/40 text-primary font-mono">
                                                    Active
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-mono text-muted-foreground opacity-70">
                                            {children.length > 0
                                                ? `${activeChildrenCount}/${children.length} pages enabled`
                                                : "Single page module"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={isModuleActive}
                                        onCheckedChange={(checked) => toggleModule(group, checked)}
                                    />
                                </div>
                            </div>

                            {/* Sub-pages list */}
                            {children.length > 0 && (
                                <div className="p-3 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-border/40 bg-background/50">
                                    {children.map((child) => {
                                        const cleanSlug = child.title.replace(/[^a-zA-Z0-9]/g, "");
                                        const childPerm = `navbar:${moduleTitle}:${cleanSlug}`;
                                        const isChildActive = getPermStatus(childPerm);

                                        return (
                                            <label
                                                key={child.title}
                                                className={`flex items-center gap-2.5 p-2 rounded-md border text-xs cursor-pointer transition-all ${
                                                    isChildActive
                                                        ? "border-primary/30 bg-primary/10 text-primary font-medium"
                                                        : "border-transparent hover:bg-muted/50 text-muted-foreground"
                                                }`}
                                            >
                                                <Checkbox
                                                    checked={isChildActive}
                                                    onCheckedChange={() => togglePerm(childPerm)}
                                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                />
                                                <DynamicIcon name={child.icon || "file-text"} className="w-3.5 h-3.5 opacity-70" />
                                                <span className="truncate flex-1">{child.title}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
