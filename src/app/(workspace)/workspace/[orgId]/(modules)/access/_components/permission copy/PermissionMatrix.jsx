"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Search, Layers, Key, Shield, Users, Plus, Eye, PlusCircle, Pencil, Trash2, Settings, FileDown, FileUp, Save, Loader2, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccess } from "../../_provider/accessProvider";
import { StatsCard } from "./StatsCard";
import { PermissionRow } from "./PermissionRow";
import PermissionEditor from "./PermissionEditor";



const formatCategoryName = (category) => {
    if (typeof category !== "string") return "";

    return category
        .replace(/[_-]+/g, " ")
        .trim()
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
};

const getActionFromValue = (value) => {
    if (typeof value !== "string") return null;
    if (!value.includes(".")) return null;
    return value.split(".")[1] || null;
};



export const PermissionMatrix = () => {
    const { permissions, setPermissions } = useAccess();

    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const [editorModal, setEditorModal] = useState({
        isOpen: false,
        mode: "add",
        permissions: null,
    });



    const originalPermissionsRef = useRef(null);

    useEffect(() => {
        if (!originalPermissionsRef.current && permissions.length) {
            originalPermissionsRef.current = new Map(
                permissions.map((p) => [p.id, p.status])
            );
        }
    }, [permissions]);



    const modules = useMemo(() => {
        const grouped = {};

        permissions.forEach((permission) => {
            if (!permission || typeof permission !== "object") return;

            const category = permission.category;
            if (typeof category !== "string") return;

            if (!grouped[category]) {
                grouped[category] = {
                    category,
                    displayName: formatCategoryName(category),
                    permissions: {
                        view: null,
                        create: null,
                        edit: null,
                        delete: null,
                        manage: null,
                        export: null,
                        import: null,
                    },
                };
            }

            const action = getActionFromValue(permission.value);
            if (!action) return;

            if (action in grouped[category].permissions) {
                grouped[category].permissions[action] = permission;
            }
        });

        return Object.values(grouped);
    }, [permissions]);



    const filteredModules = useMemo(() => {
        if (!searchQuery) return modules;
        return modules.filter((m) =>
            m.displayName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [modules, searchQuery]);



    const stats = useMemo(() => {
        const totalModules = modules.length;
        const totalPermissions = permissions.length;
        const activePermissions = permissions.filter((p) => p?.status).length;

        const percentage =
            totalPermissions > 0
                ? Math.round((activePermissions / totalPermissions) * 100)
                : 0;

        return {
            totalModules,
            totalPermissions,
            activePermissions,
            percentage,
        };
    }, [modules, permissions]);



    const handlePermissionChange = (permissionId, status) => {
        setPermissions((prev) =>
            prev.map((p) => (p.id === permissionId ? { ...p, status } : p))
        );
    };

    const handlePermissionCreate = (category, action) => {
        const newPermission = {
            id: `new-${category}-${action}-${Date.now()}`,
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} ${formatCategoryName(category)}`,
            value: `${category}.${action}`,
            color: "#15803D",
            description: `${action} permission for ${formatCategoryName(category)}`,
            category,
            status: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            roles: [],
        };

        setPermissions((prev) => [...prev, newPermission]);
        toast.success(`Created ${action} permission`);
    };

    const handleSave = async () => {
        if (!originalPermissionsRef.current) {
            toast.info("No changes to save");
            return;
        }

        const newlyCreated = permissions.filter((p) => p.id.startsWith("new-"));
        const changed = permissions.filter((p) => {
            const original = originalPermissionsRef.current.get(p.id);
            return original !== undefined && original !== p.status;
        });

        if (!newlyCreated.length && !changed.length) {
            toast.info("No changes to save");
            return;
        }

        setLoading(true);
        await new Promise((r) => setTimeout(r, 1200));

        originalPermissionsRef.current = new Map(
            permissions.map((p) => [p.id, p.status])
        );

        setLoading(false);
        toast.success(`Saved ${newlyCreated.length + changed.length} changes`);
    };





    const columnHeaders = [
        { key: "view", label: "View", icon: Eye },
        { key: "create", label: "Create", icon: PlusCircle },
        { key: "edit", label: "Edit", icon: Pencil },
        { key: "delete", label: "Delete", icon: Trash2 },
        { key: "manage", label: "Manage", icon: Settings },
        { key: "export", label: "Export", icon: FileDown },
        { key: "import", label: "Import", icon: FileUp },
    ];


    const matrixEnabledCount = filteredModules.reduce(
        (acc, m) => acc + Object.values(m.permissions).filter((p) => p?.status).length,
        0
    );

    const matrixTotalCount = filteredModules.reduce(
        (acc, m) => acc + Object.values(m.permissions).filter(Boolean).length,
        0
    );



    return (
        <div>

            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard title="Total Modules" value={stats.totalModules} icon={Layers} />
                    <StatsCard title="Active Permissions" value={stats.activePermissions} subtitle={`${stats.percentage}% enabled`} icon={Key} />
                    <StatsCard title="Total Permissions" value={stats.totalPermissions} icon={Shield} />
                    <StatsCard title="User Roles" value={5} icon={Users} />
                </div>

                {/* Table */}
                <div className="bg-card rounded-xl overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-border/30 flex justify-between gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search modules..."
                                className="pl-10 pr-4 py-2.5 w-64 bg-muted/30 border rounded-xl text-sm"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={() => setEditorModal({ isOpen: true, mode: "add" })}>
                                <Plus className="w-4 h-4 mr-2" /> Add Permission
                            </Button>

                            <Button onClick={handleSave} disabled={loading} variant="outline">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Table body */}
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/20">
                                <th className="text-left px-4 py-3 w-[250px]">Module</th>
                                {columnHeaders.map(({ key, label, icon: Icon }) => (
                                    <th key={key} className="text-center px-4 py-3">
                                        <div className="flex justify-center gap-1">
                                            <Icon className="w-4 h-4" /> {label}
                                        </div>
                                    </th>
                                ))}
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {filteredModules.map((module, i) => (
                                <PermissionRow
                                    key={module.category}
                                    module={module}
                                    index={i}
                                    onPermissionChange={handlePermissionChange}
                                    onPermissionCreate={handlePermissionCreate}
                                    onEditModule={(e) => {
                                        console.log(e)
                                    }}
                                    onDeleteModule={(e) => {
                                        console.log(e)
                                    }}
                                />
                            ))}
                        </tbody>
                    </table>

                    {filteredModules.length === 0 && (
                        <div className="p-12 text-center text-muted-foreground">
                            No modules found
                        </div>
                    )}

                    <div className="p-4 border-t text-sm text-muted-foreground">
                        {matrixEnabledCount} of {matrixTotalCount} permissions enabled
                    </div>
                </div>
            </div>

            {/* Editor */}
            <PermissionEditor
                isOpen={editorModal.isOpen}
                mode={editorModal.mode}
                editData={editorModal.permissions}
                onClose={() =>
                    setEditorModal({ isOpen: false, mode: "add", permissions: null })
                }
                onSubmit={(perm) => {
                    //if (!perm) return;

                    console.log(perm)

                    // setPermissions((prev) => {
                    //     const index = prev.findIndex((p) => p.id === perm.id);
                    //     if (index === -1) return [...prev, perm];

                    //     const updated = [...prev];
                    //     updated[index] = { ...updated[index], ...perm };
                    //     return updated;
                    // });
                }}
            />
        </div>
    );
};
