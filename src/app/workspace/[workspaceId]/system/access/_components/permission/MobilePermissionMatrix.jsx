'use client'

import React, { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
    Search,
    Smartphone,
    Key,
    Shield,
    Users,
    CheckCircle2,
    AlertCircle,
    Loader2,
    DatabaseZap,
    ExternalLink,
    Filter,
    Check,
    Layers,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { StatsCard } from "./StatsCard.jsx";
import { useAccess } from "@/providers/WorkspaceProvider";
import { useSession } from "next-auth/react";
import { toggleRolePermission } from "../../_actions/toggle-role-permission";
import { seedAccessData } from "../../_actions/seed-access-data";
import { MOBILE_CATEGORIES, MOBILE_PERMISSIONS } from "../../_lib/mobile-permissions.js";
import { normalizeIdentifier } from "@/lib/rbac-utils";

export const MobilePermissionMatrix = () => {
    const { permissions, setPermissions, roles, setRoles, fetchAccessData } = useAccess();
    const { update } = useSession();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'in_db' | 'missing'
    const [isSeeding, setIsSeeding] = useState(false);
    const [togglingMap, setTogglingMap] = useState({});

    // Map permissions by normalized value for ultra-fast lookup
    const dbPermMap = useMemo(() => {
        const map = new Map();
        (permissions || []).forEach((p) => {
            if (p.value) {
                map.set(normalizeIdentifier(p.value), p);
                map.set(p.value.toLowerCase(), p);
            }
        });
        return map;
    }, [permissions]);

    // Handle Quick Toggle Role Permission
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

                    // Optimistic update
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

    // Handle Seeding of all Mobile Permissions & Default Roles
    const handleSeedData = async () => {
        setIsSeeding(true);
        toast.loading("Seeding mobile permissions and roles to database...", { id: "seed-mobile" });
        try {
            const result = await seedAccessData();
            if (result?.data) {
                toast.success(
                    `Successfully seeded ${result.data.permissionsSeeded} permissions and ${result.data.rolesSeeded} roles!`,
                    { id: "seed-mobile", duration: 5000 }
                );
                await fetchAccessData?.();
                update();
            } else {
                toast.error(result?.message || "Failed to seed mobile access data", { id: "seed-mobile" });
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to seed mobile access data", { id: "seed-mobile" });
        } finally {
            setIsSeeding(false);
        }
    };

    // Calculate Counts and Stats
    const totalMobilePerms = MOBILE_PERMISSIONS.length;
    const inDbCount = useMemo(() => {
        return MOBILE_PERMISSIONS.filter((item) => {
            return dbPermMap.has(normalizeIdentifier(item.value)) || dbPermMap.has(item.value.toLowerCase());
        }).length;
    }, [dbPermMap]);

    const missingCount = totalMobilePerms - inDbCount;

    // Filtered permissions
    const filteredPermissions = useMemo(() => {
        return MOBILE_PERMISSIONS.filter((item) => {
            // Category filter
            if (selectedCategory !== "all" && item.category !== selectedCategory) {
                return false;
            }

            // DB status check
            const dbItem = dbPermMap.get(normalizeIdentifier(item.value)) || dbPermMap.get(item.value.toLowerCase());
            const isInDb = Boolean(dbItem);

            if (statusFilter === "in_db" && !isInDb) return false;
            if (statusFilter === "missing" && isInDb) return false;

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchVal = item.value.toLowerCase().includes(q);
                const matchTitle = item.title.toLowerCase().includes(q);
                const matchKey = item.key.toLowerCase().includes(q);
                const matchDesc = item.description?.toLowerCase().includes(q);
                const matchCat = item.category?.toLowerCase().includes(q);
                const matchGroup = item.group?.toLowerCase().includes(q);
                if (!matchVal && !matchTitle && !matchKey && !matchDesc && !matchCat && !matchGroup) {
                    return false;
                }
            }

            return true;
        });
    }, [selectedCategory, statusFilter, searchQuery, dbPermMap]);

    // Assigned permissions count
    const assignedCount = useMemo(() => {
        return MOBILE_PERMISSIONS.filter((item) => {
            const dbItem = dbPermMap.get(normalizeIdentifier(item.value)) || dbPermMap.get(item.value.toLowerCase());
            if (!dbItem) return false;
            return (roles || []).some((r) =>
                r.permissions?.some((p) => p.id === dbItem.id || normalizeIdentifier(p.value) === normalizeIdentifier(item.value))
            );
        }).length;
    }, [dbPermMap, roles]);

    return (
        <div className="space-y-4">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    icon={Smartphone}
                    label="Mobile Registry"
                    value={totalMobilePerms}
                    subValue="devlomatix-expo/access.js"
                />
                <StatsCard
                    icon={CheckCircle2}
                    label="In Database"
                    value={inDbCount}
                    subValue={`${Math.round((inDbCount / (totalMobilePerms || 1)) * 100)}% synchronized`}
                />
                <StatsCard
                    icon={AlertCircle}
                    label="Missing from DB"
                    value={missingCount}
                    subValue={missingCount === 0 ? "All permissions stored" : "Requires seeding to DB"}
                />
                <StatsCard
                    icon={Shield}
                    label="Role Assigned"
                    value={assignedCount}
                    subValue="Active on mobile app"
                />
            </div>

            {/* Controls & Filter Bar */}
            <div className="flex flex-col gap-3 p-4 rounded-xl border bg-card shadow-xs">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by key (e.g. DEALS_VIEW), value (read:deal), or title..."
                            className="pl-10 text-xs bg-background"
                        />
                    </div>

                    {/* Actions & Status Tabs */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/50 text-xs">
                            <button
                                type="button"
                                onClick={() => setStatusFilter("all")}
                                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                                    statusFilter === "all" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                All ({totalMobilePerms})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter("in_db")}
                                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                                    statusFilter === "in_db" ? "bg-background shadow-xs text-emerald-600 font-semibold" : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                In DB ({inDbCount})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter("missing")}
                                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                                    statusFilter === "missing" ? "bg-background shadow-xs text-amber-600 font-semibold" : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                Missing ({missingCount})
                            </button>
                        </div>

                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleSeedData}
                            disabled={isSeeding}
                            className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        >
                            {isSeeding ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <DatabaseZap className="w-3.5 h-3.5" />
                            )}
                            <span>Seed Mobile Permissions</span>
                        </Button>
                    </div>
                </div>

                {/* Module Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-border/40 scrollbar-none">
                    {MOBILE_CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        const count = cat.id === 'all'
                            ? totalMobilePerms
                            : MOBILE_PERMISSIONS.filter(p => p.category === cat.id).length;

                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                                    isSelected
                                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                        : "bg-muted/40 hover:bg-muted text-muted-foreground border-transparent"
                                }`}
                            >
                                <span>{cat.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                    isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-foreground"
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Permissions Table / Rows */}
            <ScrollArea className="h-[60vh] rounded-xl border bg-card">
                <div className="divide-y divide-border/60">
                    {filteredPermissions.length > 0 ? (
                        filteredPermissions.map((item) => {
                            const dbItem = dbPermMap.get(normalizeIdentifier(item.value)) || dbPermMap.get(item.value.toLowerCase());
                            const isInDb = Boolean(dbItem);

                            // Find roles assigned to this permission
                            const assignedRoles = (roles || []).filter((r) => {
                                if (!dbItem) return false;
                                return r.permissions?.some(
                                    (p) => p.id === dbItem.id || normalizeIdentifier(p.value) === normalizeIdentifier(item.value)
                                );
                            });

                            return (
                                <div
                                    key={`${item.group}-${item.key}-${item.value}`}
                                    className="p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                                >
                                    {/* Left: Permission Identity */}
                                    <div className="flex items-start gap-3 min-w-0 flex-1">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                                            isInDb
                                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                        }`}>
                                            <Key className="w-4 h-4" />
                                        </div>

                                        <div className="min-w-0 space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="text-xs font-semibold text-foreground">
                                                    {item.title}
                                                </h4>
                                                <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 bg-muted/50 border-border/80">
                                                    {item.key}
                                                </Badge>
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/5 text-primary border border-primary/10">
                                                    {item.value}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Center: Module, Type & DB Status */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Badge
                                            variant="secondary"
                                            className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 capitalize"
                                        >
                                            {item.category}
                                        </Badge>

                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] font-medium px-2 py-0.5 ${
                                                item.type === 'NAVIGATION'
                                                    ? 'border-indigo-500/30 text-indigo-600 bg-indigo-500/5'
                                                    : 'border-cyan-500/30 text-cyan-600 bg-cyan-500/5'
                                            }`}
                                        >
                                            {item.type}
                                        </Badge>

                                        {isInDb ? (
                                            <Badge
                                                variant="outline"
                                                className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[10px] gap-1 px-2 py-0.5 font-medium"
                                            >
                                                <CheckCircle2 className="w-3 h-3" />
                                                <span>In Table</span>
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className="border-amber-500/30 text-amber-600 bg-amber-500/10 text-[10px] gap-1 px-2 py-0.5 font-medium"
                                            >
                                                <AlertCircle className="w-3 h-3" />
                                                <span>Not in Table</span>
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Right: Assigned Roles & Quick Assign Popover */}
                                    <div className="flex items-center gap-2 shrink-0 justify-end">
                                        <div className="flex items-center gap-1 flex-wrap max-w-xs justify-end">
                                            {assignedRoles.length > 0 ? (
                                                assignedRoles.slice(0, 3).map((r) => (
                                                    <span
                                                        key={r.id}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-muted/40 border-border/60"
                                                    >
                                                        <span
                                                            className="w-1.5 h-1.5 rounded-full"
                                                            style={{ backgroundColor: r.color || "#6366f1" }}
                                                        />
                                                        <span className="truncate max-w-[80px]">{r.title}</span>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground italic">
                                                    No roles assigned
                                                </span>
                                            )}

                                            {assignedRoles.length > 3 && (
                                                <span className="text-[10px] font-medium text-muted-foreground px-1.5 py-0.5 rounded-full bg-muted">
                                                    +{assignedRoles.length - 3}
                                                </span>
                                            )}
                                        </div>

                                        {isInDb && (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 text-xs px-2.5 gap-1.5 border-dashed border-primary/40 hover:border-primary text-primary hover:bg-primary/5 cursor-pointer shrink-0"
                                                    >
                                                        <Shield className="w-3 h-3" />
                                                        <span>Assign</span>
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent align="end" className="w-64 p-3 bg-popover border border-border/80 shadow-xl rounded-xl">
                                                    <div className="space-y-2">
                                                        <div className="border-b pb-2">
                                                            <h4 className="text-xs font-bold tracking-tight">
                                                                {item.title}
                                                            </h4>
                                                            <p className="text-[10px] text-muted-foreground font-mono truncate">
                                                                {item.value}
                                                            </p>
                                                        </div>

                                                        <div className="space-y-1 max-h-48 overflow-y-auto pt-1">
                                                            {(roles || []).map((role) => {
                                                                const isAssigned = assignedRoles.some((r) => r.id === role.id);
                                                                const key = `${role.id}-${dbItem.id}`;
                                                                const isToggling = Boolean(togglingMap[key]);

                                                                return (
                                                                    <button
                                                                        key={role.id}
                                                                        type="button"
                                                                        disabled={isToggling}
                                                                        onClick={() => handleToggleRole(role.id, dbItem.id)}
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
                            );
                        })
                    ) : (
                        <div className="text-center py-16 space-y-2">
                            <Smartphone className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
                            <h4 className="text-sm font-semibold">No mobile permissions found</h4>
                            <p className="text-xs text-muted-foreground">
                                Try clearing your search query or switching category filter
                            </p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};
