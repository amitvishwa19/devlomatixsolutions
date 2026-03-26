import { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Search, Layers, Key, Shield, Users, Plus, Eye, PlusCircle, Pencil, Trash2, Settings, FileDown, FileUp, Save, Loader2, Loader, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatsCard } from "./StatsCard.jsx";
import { PermissionRow } from "./PermissionRow.jsx";
import PermissionEditor from "./PermissionEditor.jsx";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog.jsx";
import { useAccess } from "../../_provider/accessProvider.js";
import { useAction } from "@/hooks/use-action.js";
import { upsertPermission } from "../../_action/upsert-permission.js";
import { useSession } from "next-auth/react";

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

// Sample data
const samplePermissions = [
    { id: "1", title: "View Users", value: "users.view", color: "#15803D", description: "View user list", category: "users", status: true },
    { id: "2", title: "Create Users", value: "users.create", color: "#15803D", description: "Create new users", category: "users", status: true },
    { id: "3", title: "Edit Users", value: "users.edit", color: "#15803D", description: "Edit existing users", category: "users", status: false },
    { id: "4", title: "Delete Users", value: "users.delete", color: "#15803D", description: "Delete users", category: "users", status: false },
    { id: "5", title: "View Products", value: "products.view", color: "#2563EB", description: "View product list", category: "products", status: true },
    { id: "6", title: "Create Products", value: "products.create", color: "#2563EB", description: "Create new products", category: "products", status: true },
    { id: "7", title: "Edit Products", value: "products.edit", color: "#2563EB", description: "Edit products", category: "products", status: true },
    { id: "8", title: "Delete Products", value: "products.delete", color: "#2563EB", description: "Delete products", category: "products", status: false },
    { id: "9", title: "Export Products", value: "products.export", color: "#2563EB", description: "Export product data", category: "products", status: true },
    { id: "10", title: "View Orders", value: "orders.view", color: "#9333EA", description: "View orders", category: "orders", status: true },
    { id: "11", title: "Create Orders", value: "orders.create", color: "#9333EA", description: "Create orders", category: "orders", status: false },
    { id: "12", title: "Manage Orders", value: "orders.manage", color: "#9333EA", description: "Full order control", category: "orders", status: true },
    { id: "13", title: "View Settings", value: "settings.view", color: "#F59E0B", description: "View settings", category: "settings", status: true },
    { id: "14", title: "Manage Settings", value: "settings.manage", color: "#F59E0B", description: "Manage all settings", category: "settings", status: true },
];

export const PermissionMatrix = () => {
    const { permissions, setPermissions } = useAccess()
    //const [permissions, setPermissions] = useState(samplePermissions);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession()

    const [editorModal, setEditorModal] = useState({
        isOpen: false,
        mode: "add",
        category: undefined,
        editData: null,
    });

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        module: null,
    });

    //console.log(permissions)

    const [users] = useState([]);
    const [roles] = useState([]);

    // Helper to get users for a permission
    const getUsersForPermission = (permissionId) => {
        const roleIds = roles?.filter(r => r.permissions?.includes(permissionId)) || [];
        const userIds = new Set();
        roleIds.forEach(role => role.users?.forEach(uid => userIds.add(uid)));
        return (users || []).filter(u => userIds.has(u.id));
    };

    // Helper to get roles for a permission
    const getRolesForPermission = (permissionId) => {
        return roles?.filter(r => r.permissions?.includes(permissionId)) || [];
    };



    useEffect(() => {
        if (!originalPermissionsRef.current && permissions?.length) {
            originalPermissionsRef.current = new Map(
                permissions.map((p) => [p.id, p.status])
            );
        }
    }, [permissions]);

    const originalPermissionsRef = useRef(null);

    // const modules = useMemo(() => {
    //     const grouped = {};

    //     permissions.forEach((permission) => {
    //         if (!permission || typeof permission !== "object") return;

    //         const category = permission.category;
    //         if (typeof category !== "string") return;

    //         if (!grouped[category]) {
    //             grouped[category] = {
    //                 category,
    //                 displayName: formatCategoryName(category),
    //                 permissions: {
    //                     view: null,
    //                     create: null,
    //                     edit: null,
    //                     delete: null,
    //                     manage: null,
    //                     export: null,
    //                     import: null,
    //                 },
    //             };
    //         }

    //         const action = getActionFromValue(permission.value);
    //         if (!action) return;

    //         if (action in grouped[category].permissions) {
    //             grouped[category].permissions[action] = permission;
    //         }
    //     });

    //     return Object.values(grouped);
    // }, [permissions]);

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
                    permissions: {},
                };
            }

            const action = getActionFromValue(permission.value);
            if (!action) return;

            grouped[category].permissions[action] = permission;
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
        const totalModules = modules?.length || 0;
        const totalPermissions = permissions?.length || 0;
        const activePermissions = permissions?.filter((p) => p?.status).length || 0;
        const percentage =
            totalPermissions > 0
                ? Math.round((activePermissions / totalPermissions) * 100)
                : 0;

        return { totalModules, totalPermissions, activePermissions, percentage };
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
        };

        setPermissions((prev) => [...prev, newPermission]);
        toast.success(`Created ${action} permission`);
    };

    const { execute } = useAction(upsertPermission, {
        onSuccess: (data) => {
            setLoading(false);
            toast.success('Permission updated successfully', { id: 'update-permission' })
        },
        onError: (error) => {
            console.log(error)
            toast.error('Oops somethig went wrong ! try again later', { id: 'update-permission' })
            setLoading(false);
        }
    })

    const handleSave = async () => {

        if (!originalPermissionsRef.current) {
            toast.info("No changes to save");
            return;
        }

        const newlyCreated = permissions.filter((p) => p.id.startsWith("new-"));
        const changed = permissions.filter((p) => {
            const original = originalPermissionsRef.current?.get(p.id);
            return original !== undefined && original !== p.status;
        });



        if (!newlyCreated?.length && !changed?.length) {
            toast.info("No changes to save");
            return;
        }

        setLoading(true);
        toast.loading(`Saving permission ${(newlyCreated?.length || 0) + (changed?.length || 0)} changes`, { id: 'update-permission' });
        await execute({ userId: session.user.userId, formData: changed })


        await new Promise((r) => setTimeout(r, 1200));


    };



    const handleEditorSubmit = async (newPermissions) => {
        console.log("New permissions:", newPermissions);

        setPermissions((prev) => {
            const updated = [...prev];

            newPermissions.forEach((newPerm) => {
                const existingIndex = updated.findIndex(
                    (p) => p.value === newPerm.value
                );

                if (existingIndex !== -1) {
                    // UPDATE → replace object to trigger re-render
                    updated[existingIndex] = {
                        ...newPerm,
                        ...updated[existingIndex]
                    };
                } else if (newPerm.status) {
                    // ADD → add to TOP
                    updated.unshift({
                        ...newPerm,
                        id:
                            newPerm.id ??
                            `new-${newPerm.category}-${Date.now()}-${Math.random()
                                .toString(36)
                                .slice(2)}`,
                    });
                }
            });

            return updated;
        });
        // setPermissions((prev) => {
        //     const updated = [...prev];

        //     newPermissions.forEach((newPerm) => {
        //         const existingIndex = updated.findIndex(
        //             (p) => p.value === newPerm.value
        //         );

        //         if (existingIndex !== -1) {
        //             updated[existingIndex] = { ...updated[existingIndex], ...newPerm };
        //         } else if (newPerm.status) {
        //             updated.push({
        //                 ...newPerm,
        //                 id: `new-${newPerm.category}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        //             });
        //         }
        //     });

        //     return updated;
        // });

        setEditorModal({ isOpen: false, mode: "add", category: undefined, editData: null });
    };

    // useEffect(() => {
    //     //console.log('Permissions updated:', permissions)
    // }, [permissions])

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
        <div className="space-y-6 p-2">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard icon={Layers} label="Total Modules" value={stats.totalModules} />
                <StatsCard icon={Key} label="Total Permissions" value={stats.totalPermissions} />
                <StatsCard icon={Shield} label="Active Permissions" value={stats.activePermissions} subValue={`${stats.percentage}% enabled`} />
                <StatsCard icon={Users} label="Coverage" value={`${stats.percentage}%`} />
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search modules..."
                            className="pl-10 pr-4 py-2.5 w-64 bg-background border rounded-xl text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditorModal({ isOpen: true, mode: "add", category: "" })}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Permission
                        </Button>

                        <Button size="sm" onClick={handleSave} disabled={loading}>
                            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>

                {/* Table body */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/20">
                                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Module
                                </th>
                                {columnHeaders.map(({ key, label, icon: Icon }) => (
                                    <th key={key} className="py-3 px-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <Icon className="w-3.5 h-3.5" />
                                            {label}
                                        </div>
                                    </th>
                                ))}
                                <th className="py-3 px-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredModules.map((module) => (
                                <PermissionRow
                                    key={module.category}
                                    module={module}
                                    onPermissionChange={handlePermissionChange}
                                    onCreatePermission={handlePermissionCreate}
                                    onEditModule={(m) => {
                                        setEditorModal({ isOpen: true, mode: "edit", category: m.category, editData: m });
                                    }}
                                    onDeleteModule={(m) => {
                                        setDeleteModal({ isOpen: true, module: m });
                                    }}
                                    getUsersForPermission={getUsersForPermission}
                                    getRolesForPermission={getRolesForPermission}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredModules?.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                        No modules found
                    </div>
                )}

                <div className="p-4 border-t bg-muted/20 text-sm text-muted-foreground text-center">
                    {matrixEnabledCount} of {matrixTotalCount} permissions enabled
                </div>
            </div>

            {/* Editor */}
            <PermissionEditor
                open={editorModal.isOpen}
                onOpenChange={(open) => setEditorModal((prev) => ({ ...prev, isOpen: open }))}
                mode={editorModal.mode}
                category={editorModal.category}
                editData={editorModal.editData}
                onClose={() => setEditorModal({ isOpen: false, mode: "add", category: undefined, editData: null })}
                onSubmit={handleEditorSubmit}
            />

            {/* Delete Confirmation */}
            <DeleteConfirmDialog
                open={deleteModal.isOpen}
                onOpenChange={(open) => setDeleteModal((prev) => ({ ...prev, isOpen: open }))}
                title={`Delete ${deleteModal.module?.displayName || "Module"}?`}
                description={`This will permanently delete the "${deleteModal.module?.displayName}" module and all its permissions. This action cannot be undone.`}
                module={deleteModal.module}
                onConfirm={() => {
                    if (deleteModal.module) {
                        const permissionsToDelete = permissions.filter((p) => p.category === deleteModal.module.category);
                        setPermissions((prev) => prev.filter((p) => p.category !== deleteModal.module.category));
                        //toast.success(`Deleted ${deleteModal.module.displayName} module`);
                    }
                    setDeleteModal({ isOpen: false, module: null });
                }}
            />
        </div>
    );
};