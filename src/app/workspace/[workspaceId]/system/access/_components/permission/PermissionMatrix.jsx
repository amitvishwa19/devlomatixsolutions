'use client'

import React, { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
    Search,
    Layers,
    Key,
    Shield,
    Users,
    RefreshCw,
    Loader2,
    CheckCircle2,
    ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatsCard } from "./StatsCard.jsx";
import { NavigationPermissionRow } from "./NavigationPermissionRow.jsx";
import { useAccess } from "@/providers/WorkspaceProvider";
import { useAction } from "@/hooks/use-action";
import { syncNavigationPermissions } from "../../_actions/sync-navigation-permissions";
import { toggleRolePermission } from "../../_actions/toggle-role-permission";
import { getSidebarNavItems } from "@/app/workspace/_lib/sidebar-nav-item";
import { useSession } from "next-auth/react";
import { normalizeIdentifier } from "@/lib/rbac-utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export const PermissionMatrix = () => {
    const params = useParams();
    const workspaceId = params?.workspaceId || "default";
    const { permissions, setPermissions, roles, setRoles, fetchAccessData } = useAccess();
    const { data: session, update } = useSession();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterTab, setFilterTab] = useState("all"); // 'all' | 'assigned' | 'unassigned'
    const [togglingMap, setTogglingMap] = useState({});

    // 1. Single Source of Truth: Get all navigation items directly from sidebar-nav-item.js
    const navStructure = useMemo(() => {
        return getSidebarNavItems(workspaceId);
    }, [workspaceId]);

    // 2. Action to Sync Navigation permissions to Database
    const { execute: executeSync, loading: isSyncing } = useAction(syncNavigationPermissions, {
        onSuccess: (data) => {
            toast.success("Navigation permissions synchronized from sidebar items!", { id: "sync-perms" });
            fetchAccessData?.();
            update();
        },
        onError: (error) => {
            console.error("Sync error:", error);
            toast.error("Failed to sync navigation permissions", { id: "sync-perms" });
        },
    });

    const handleSync = async () => {
        toast.loading("Synchronizing navigation permissions...", { id: "sync-perms" });
        await executeSync({ workspaceId });
    };

    // 3. Quick Role Assignment Handler
    const handleToggleRole = useCallback(
        async (roleId, permissionId) => {
            const key = `${roleId}-${permissionId}`;
            setTogglingMap((prev) => ({ ...prev, [key]: true }));

            try {
                const res = await toggleRolePermission({ roleId, permissionId });
                if (res?.data) {
                    const { assigned } = res.data;
                    toast.success(assigned ? "Role permission granted" : "Role permission removed", {
                        duration: 2000,
                    });

                    // Optimistically update roles state in useAccess
                    setRoles((prevRoles) =>
                        prevRoles.map((r) => {
                            if (r.id !== roleId) return r;
                            const curPerms = r.permissions || [];
                            const updatedPerms = assigned
                                ? [...curPerms, { id: permissionId }]
                                : curPerms.filter((p) => p.id !== permissionId);
                            return { ...r, permissions: updatedPerms };
                        })
                    );

                    // Refresh active session in background
                    update();
                } else if (res?.message) {
                    toast.error(res.message);
                }
            } catch (err) {
                console.error("Toggle role error:", err);
                toast.error("Failed to toggle role permission");
            } finally {
                setTogglingMap((prev) => ({ ...prev, [key]: false }));
            }
        },
        [setRoles, update]
    );

    // 4. Filter navigation modules by search and status
    const filteredModules = useMemo(() => {
        return navStructure.filter((group) => {
            const moduleTitle = group.parent.title;
            const primaryPerm = group.permission?.[0] || `navbar:${moduleTitle}:Parent`;
            const children = group.child || [];

            // Search filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchModule = moduleTitle.toLowerCase().includes(q) || group.baseUrl.toLowerCase().includes(q);
                const matchChildren = children.some(
                    (c) => c.title.toLowerCase().includes(q) || c.url?.toLowerCase().includes(q)
                );
                if (!matchModule && !matchChildren) return false;
            }

            // Tab filter
            if (filterTab !== "all") {
                const isAssigned = roles?.some((r) => {
                    if (normalizeIdentifier(r.title) === normalizeIdentifier(moduleTitle)) return true;
                    return r.permissions?.some(
                        (p) =>
                            normalizeIdentifier(p.value) === normalizeIdentifier(primaryPerm) ||
                            normalizeIdentifier(p.value) === normalizeIdentifier(moduleTitle)
                    );
                });

                if (filterTab === "assigned" && !isAssigned) return false;
                if (filterTab === "unassigned" && isAssigned) return false;
            }

            return true;
        });
    }, [navStructure, searchQuery, filterTab, roles]);

    // 5. Stats computation
    const totalModules = navStructure.length;
    const totalSubPages = navStructure.reduce((acc, g) => acc + (g.child?.length || 0), 0);
    const assignedModulesCount = navStructure.filter((group) => {
        const moduleTitle = group.parent.title;
        const primaryPerm = group.permission?.[0] || `navbar:${moduleTitle}:Parent`;
        return roles?.some((r) => {
            if (normalizeIdentifier(r.title) === normalizeIdentifier(moduleTitle)) return true;
            return r.permissions?.some(
                (p) =>
                    normalizeIdentifier(p.value) === normalizeIdentifier(primaryPerm) ||
                    normalizeIdentifier(p.value) === normalizeIdentifier(moduleTitle)
            );
        });
    }).length;

    const coveragePercentage = totalModules > 0 ? Math.round((assignedModulesCount / totalModules) * 100) : 0;

    return (
        <div className="space-y-4 ">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard icon={Layers} label="Navigation Modules" value={totalModules} subValue="Driven from sidebar" />
                <StatsCard icon={Key} label="Sub-pages & Routes" value={totalSubPages} subValue="Granular permission points" />
                <StatsCard
                    icon={ShieldCheck}
                    label="Assigned Modules"
                    value={assignedModulesCount}
                    subValue={`${coveragePercentage}% role coverage`}
                />
                <StatsCard icon={Users} label="Total Roles" value={roles?.length || 0} subValue="Available for assignment" />
            </div>

            {/* Controls Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border bg-card shadow-xs">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search modules, routes, or sub-pages..."
                        className="pl-10 text-xs bg-background"
                    />
                </div>

                {/* Filter Tabs & Sync Action */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/50 text-xs">
                        <button
                            type="button"
                            onClick={() => setFilterTab("all")}
                            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${filterTab === "all" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            All ({totalModules})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterTab("assigned")}
                            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${filterTab === "assigned"
                                ? "bg-background shadow-xs text-primary"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Assigned ({assignedModulesCount})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterTab("unassigned")}
                            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${filterTab === "unassigned"
                                ? "bg-background shadow-xs text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Unassigned ({totalModules - assignedModulesCount})
                        </button>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="gap-2 text-xs border-primary/30 text-primary  cursor-pointer"
                    >
                        {isSyncing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                        )}
                        <span>Sync Navigation</span>
                    </Button>
                </div>
            </div>

            {/* List of Navigation Modules */}
            <ScrollArea className="space-y-3 h-[60vh]">
                <div className="space-y-2">
                    {filteredModules.length > 0 ? (
                        filteredModules.map((group) => {
                            const moduleTitle = group.parent.title;
                            const primaryPermValue = group.permission?.[0] || `navbar:${moduleTitle}:Parent`;
                            const dbPerm = permissions?.find(
                                (p) => normalizeIdentifier(p.value) === normalizeIdentifier(primaryPermValue)
                            );

                            return (
                                <NavigationPermissionRow
                                    key={moduleTitle}
                                    group={group}
                                    dbPerm={dbPerm}
                                    allPerms={permissions || []}
                                    roles={roles || []}
                                    onToggleRole={handleToggleRole}
                                    togglingMap={togglingMap}
                                />
                            );
                        })
                    ) : (
                        <div className="text-center py-16 border rounded-xl bg-card/50 space-y-2">
                            <Key className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
                            <h4 className="text-sm font-semibold">No navigation modules found</h4>
                            <p className="text-xs text-muted-foreground">
                                Try adjusting your search query or sync navigation permissions
                            </p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};