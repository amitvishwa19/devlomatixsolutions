import { useEffect, useRef, useState } from "react";
import { Check, Save, Eye, Plus, Pencil, Trash2, Shield, Users, Key, Activity, MoreVertical, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import PermissionSearch from "../permission/PermissionSearch";
import PermissionStatCard from "../permission/PermissionStatCard";
import { Checkbox } from "@/components/ui/checkbox";
import PermissionEditor from "../permission/PermissionEditor";
import { useAccess } from "../../_provider/accessProvider";
import { upsertPermission } from "../../_action/upsert-permission";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { useSession } from "next-auth/react";



const actionTypes = ["view", "create", "edit", "delete"];


const actionConfig = {
    view: { label: "View", icon: Eye },
    create: { label: "Create", icon: Plus },
    edit: { label: "Edit", icon: Pencil },
    delete: { label: "Delete", icon: Trash2 },
};

const permissionsData = [
    {
        id: "cmk3mh3c30008ikfczgyo9tnj",
        title: "View Dashboard",
        value: "dashboard.view",
        color: "#FFFF",
        description: "Access and view the main dashboard",
        category: "dashboard",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c30009ikfcy8xi1ogz",
        title: "View Workflow",
        value: "workflow.view",
        color: "#FFFF",
        description: "View workflow pipelines and stages",
        category: "workflow",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000aikfchshwwuay",
        title: "Create Workflow",
        value: "workflow.create",
        color: "#FFFF",
        description: "Create new workflows",
        category: "workflow",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000bikfct3ifwzmz",
        title: "Edit Workflow",
        value: "workflow.edit",
        color: "#FFFF",
        description: "Edit existing workflows",
        category: "workflow",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000cikfc4inzudkh",
        title: "Delete Workflow",
        value: "workflow.delete",
        color: "#FFFF",
        description: "Delete workflows",
        category: "workflow",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000dikfc7rhp51oi",
        title: "View Appointments",
        value: "appointments.view",
        color: "#FFFF",
        description: "View appointments and schedules",
        category: "appointments",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000eikfc3pimwm6u",
        title: "Create Appointment",
        value: "appointments.create",
        color: "#FFFF",
        description: "Create new appointments",
        category: "appointments",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000fikfck3kbo7w9",
        title: "Edit Appointment",
        value: "appointments.edit",
        color: "#FFFF",
        description: "Edit appointment details",
        category: "appointments",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000gikfcp3gg7fm9",
        title: "Cancel Appointment",
        value: "appointments.cancel",
        color: "#FFFF",
        description: "Cancel scheduled appointments",
        category: "appointments",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000hikfcxxaw4z4q",
        title: "View Calendar",
        value: "calendar.view",
        color: "#FFFF",
        description: "View calendar events and schedules",
        category: "calendar",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000iikfcae3slxfw",
        title: "Manage Calendar",
        value: "calendar.manage",
        color: "#FFFF",
        description: "Manage calendar events and settings",
        category: "calendar",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000jikfc65mch3ay",
        title: "View Kanban",
        value: "kanban.view",
        color: "#FFFF",
        description: "View kanban boards",
        category: "kanban",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000kikfce49bzjo2",
        title: "Create Kanban Item",
        value: "kanban.create",
        color: "#FFFF",
        description: "Create kanban cards",
        category: "kanban",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000likfc7nkxf4mo",
        title: "Edit Kanban Item",
        value: "kanban.edit",
        color: "#FFFF",
        description: "Edit kanban cards and stages",
        category: "kanban",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000mikfc7vaf7mi8",
        title: "Delete Kanban Item",
        value: "kanban.delete",
        color: "#FFFF",
        description: "Delete kanban cards",
        category: "kanban",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000nikfc02x78u4q",
        title: "View Documents",
        value: "documents.view",
        color: "#FFFF",
        description: "View uploaded documents",
        category: "documents",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000oikfcn0g7ep6j",
        title: "Upload Document",
        value: "documents.upload",
        color: "#FFFF",
        description: "Upload new documents",
        category: "documents",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000pikfciffi06vn",
        title: "Edit Document",
        value: "documents.edit",
        color: "#FFFF",
        description: "Edit document details",
        category: "documents",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000qikfczy5tdx8d",
        title: "Delete Document",
        value: "documents.delete",
        color: "#FFFF",
        description: "Delete documents",
        category: "documents",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000rikfclkou1r9o",
        title: "View Articles",
        value: "articles.view",
        color: "#FFFF",
        description: "View articles and posts",
        category: "articles",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000sikfce0n18e8g",
        title: "Create Article",
        value: "articles.create",
        color: "#FFFF",
        description: "Create new articles",
        category: "articles",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000tikfc0bcr9iil",
        title: "Edit Article",
        value: "articles.edit",
        color: "#FFFF",
        description: "Edit article content",
        category: "articles",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000uikfcaxxhc7fj",
        title: "Delete Article",
        value: "articles.delete",
        color: "#FFFF",
        description: "Delete articles",
        category: "articles",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000vikfc3fhxvlrp",
        title: "Publish Article",
        value: "articles.publish",
        color: "#FFFF",
        description: "Publish or unpublish articles",
        category: "articles",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000wikfcthp0l2f5",
        title: "View Patients",
        value: "patients.view",
        color: "#FFFF",
        description: "View patient list and profiles",
        category: "patients",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000xikfczxlvk6c9",
        title: "Create Patient",
        value: "patients.create",
        color: "#FFFF",
        description: "Register new patients",
        category: "patients",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000yikfc4fwy68bw",
        title: "Edit Patient",
        value: "patients.edit",
        color: "#FFFF",
        description: "Edit patient information",
        category: "patients",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3000zikfcfzy65a07",
        title: "Delete Patient",
        value: "patients.delete",
        color: "#FFFF",
        description: "Delete patient records",
        category: "patients",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c30010ikfcrlv4lp6k",
        title: "View Rooms & Beds",
        value: "rooms_beds.view",
        color: "#FFFF",
        description: "View hospital rooms and beds",
        category: "rooms_beds",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c30011ikfcy5vooeu3",
        title: "Assign Bed",
        value: "rooms_beds.assign_bed",
        color: "#FFFF",
        description: "Assign beds to patients",
        category: "rooms_beds",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c30012ikfcyzfpv5x8",
        title: "Transfer Bed",
        value: "rooms_beds.transfer_bed",
        color: "#FFFF",
        description: "Transfer patients between beds",
        category: "rooms_beds",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c30013ikfcqduyaemt",
        title: "View Inventory",
        value: "inventory.view",
        color: "#FFFF",
        description: "View inventory items and stock",
        category: "inventory",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c30014ikfcp9pm08er",
        title: "Add Inventory Item",
        value: "inventory.create",
        color: "#FFFF",
        description: "Add new inventory items",
        category: "inventory",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c30015ikfcgncz10fa",
        title: "Edit Inventory Item",
        value: "inventory.edit",
        color: "#FFFF",
        description: "Edit inventory details",
        category: "inventory",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c30016ikfcfvzs2qjb",
        title: "Delete Inventory Item",
        value: "inventory.delete",
        color: "#FFFF",
        description: "Delete inventory items",
        category: "inventory",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c30017ikfcyvoe535r",
        title: "View Access Management",
        value: "access_management.view",
        color: "#FFFF",
        description: "View roles and permissions",
        category: "access_management",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c30018ikfc0i4e17n3",
        title: "Create Role",
        value: "access_management.create_role",
        color: "#FFFF",
        description: "Create new user roles",
        category: "access_management",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c30019ikfc6js3ixgg",
        title: "Edit Role",
        value: "access_management.edit_role",
        color: "#FFFF",
        description: "Edit role permissions",
        category: "access_management",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
    {
        id: "cmk3mh3c3001aikfctrwz441a",
        title: "Assign Permissions",
        value: "access_management.assign_permission",
        color: "#FFFF",
        description: "Assign permissions to roles",
        category: "access_management",
        status: true,
        createdAt: "2026-01-07T06:13:24.387Z",
        updatedAt: "2026-01-07T06:13:24.387Z",
    },
];


const formatCategoryName = (category) => {
    return category
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};


const PermissionMatrix = () => {
    const [loading, setLoading] = useState(false)
    const { data: session } = useSession()
    const [editorModal, setEditorModal] = useState({
        isOpen: false,
        mode: 'add',
        permissions: null,
        editData: null,
        onSubmit: null,
        open: null
    })


    const { permissions, setPermissions } = useAccess()
    const [permissionsData, setpermissionsData] = useState(permissions)
    const originalPermissionsMap = new Map(
        permissionsData?.map((p) => [p.id, p.status])
    );


    const [searchQuery, setSearchQuery] = useState("");
    const [editingCategory, setEditingCategory] = useState(null);
    const [editSheetOpen, setEditSheetOpen] = useState(false);


    // Use useRef to capture initial state once:
    const originalPermissionsRef = useRef(null);


    useEffect(() => {
        if (permissions?.length > 0 && !originalPermissionsRef.current) {
            originalPermissionsRef.current = new Map(
                permissions.map((p) => [p.id, p.status])
            );
        }
    }, [permissions]);



    // Group permissions by category
    const allCategories = [...new Set(permissions.map((p) => p.category))];

    // Filter categories based on search
    const categories = allCategories.filter((category) =>
        formatCategoryName(category).toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Create a lookup map for quick permission checking
    const permissionMap = new Map();
    permissions.forEach((p) => {
        const action = p.value.split(".")[1];
        permissionMap.set(`${p.category}.${action}`, p);
    });

    const hasPermission = (category, action) => {
        const variations = [
            `${category}.${action}`,
            `${category}.${action}_bed`,
            `${category}.${action}_role`,
            `${category}.${action}_permission`,
            `${category}.manage`,
            `${category}.upload`,
            `${category}.cancel`,
            `${category}.publish`,
            `${category}.assign_bed`,
            `${category}.transfer_bed`,
            `${category}.create_role`,
            `${category}.edit_role`,
            `${category}.assign_permission`,
        ];

        for (const variation of variations) {
            const perm = permissionMap.get(variation);
            if (perm) {
                const permAction = perm.value.split(".")[1];
                if (action === "view" && permAction === "view") return perm;
                if (
                    action === "create" &&
                    ["create", "upload", "create_role", "assign_bed"].includes(permAction)
                )
                    return perm;
                if (
                    action === "edit" &&
                    ["edit", "manage", "edit_role", "transfer_bed", "assign_permission"].includes(
                        permAction
                    )
                )
                    return perm;
                if (
                    action === "delete" &&
                    ["delete", "cancel", "publish"].includes(permAction)
                )
                    return perm;
            }
        }
        return undefined;
    };

    const handlePermissionChange = (permissionId, newStatus) => {
        setPermissions((prev) =>
            prev.map((p) =>
                p.id === permissionId ? { ...p, status: newStatus } : p
            )
        );
    };

    const handlePermissionCreate = (category, action) => {
        const newPermission = {
            id: `new-${category}-${action}-${Date.now()}`,
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} ${category
                .split("_")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}`,
            value: `${category}.${action}`,
            color: "#FFFF",
            description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${category}`,
            category: category,
            status: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setPermissions((prev) => [...prev, newPermission]);
    };

    const handleAddPermissionsFromSheet = (data) => {
        const newPermissions = data.map((item) => ({
            id: `new-${item.category}-${item.value.split(".")[1]}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: item.title,
            value: item.value,
            color: "#FFFF",
            description: item.description,
            category: item.category,
            status: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));
        setPermissions((prev) => [...prev, ...newPermissions]);
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setEditSheetOpen(true);
    };

    const handleEditSubmit = (data) => {
        if (!editingCategory) return;

        // Remove old permissions for this category
        const filteredPermissions = permissions.filter(p => p.category !== editingCategory);

        // Add new permissions
        const newPermissions = data.map((item) => ({
            id: `new-${item.category}-${item.value.split(".")[1]}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: item.title,
            value: item.value,
            color: "#FFFF",
            description: item.description,
            category: item.category,
            status: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));

        setPermissions([...filteredPermissions, ...newPermissions]);
        setEditingCategory(null);
        setEditSheetOpen(false);
    };


    const getEditDataForCategory = (category) => {
        const categoryPermissions = permissions.filter(p => p.category === category);
        const actions = categoryPermissions.map(p => p.value.split(".")[1]);
        return {
            id: category,
            title: formatCategoryName(category),
            category: category,
            description: categoryPermissions[0]?.description || "",
            actions: actions,
        };
    };

    // Calculate stats
    const totalModules = allCategories.length;
    const enabledPermissions = permissions.filter((p) => p.status).length;
    const totalPermissionsCount = permissions.length;
    const matrixEnabledCount = categories.reduce((acc, category) => {
        return (
            acc +
            actionTypes.filter((action) => hasPermission(category, action)?.status)
                .length
        );
    }, 0);


    const { execute } = useAction(upsertPermission, {
        onSuccess: (data) => {
            console.log(data)
            setLoading(false)
            toast.success('Permission created successfully', { id: 'new-permission' })
        },
        onError: (error) => {
            console.log(error)
            toast.error('Oops somethig went wrong ! try again later', { id: 'new-invoice' })
            setLoading(false);
        }
    })


    const handleSave = async () => {
        const newlyCreated = permissions.filter((p) => p.id.startsWith("new-"));
        const changed = permissions?.filter((p) => {
            const originalStatus = originalPermissionsMap.get(p.id)
            return originalStatus !== undefined && originalStatus !== p.status;
        });

        if (changed.length === 0) return toast.info('No changes to save', { id: 'no-changes' })
        setLoading(true);
        await execute({ userId: session.user.userId, formData: changed })
        console.log('changed', changed)
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 hover:border-primary/30 transition-colors animate-fade-in">
                    <PermissionStatCard
                        title="Total Modules"
                        value={totalModules}
                        change="+2 this month"
                        changeType="positive"
                        icon={Shield}
                        delay={300}
                    />
                    <PermissionStatCard
                        title="Active Permissions"
                        value={enabledPermissions}
                        change={`${Math.round((enabledPermissions / totalPermissionsCount) * 100)}% enabled`}
                        changeType="positive"
                        icon={Key}
                        delay={300}
                    />
                    <PermissionStatCard
                        title="Total Permissions"
                        value={totalPermissionsCount}
                        change="All actions"
                        changeType="neutral"
                        icon={Activity}
                        delay={300}
                    />
                    <PermissionStatCard
                        title="User Roles"
                        value={5}
                        change="Admin, Manager, Staff..."
                        changeType="neutral"
                        icon={Users}
                        delay={300}
                    />
                </div>

                {/* Permission Matrix Table */}
                <div className="bg-card rounded-lg border border-border overflow-hidden opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
                    {/* Header */}
                    <div className=" p-2 ">
                        <div className="flex items-center justify-between">

                            <div>
                                <PermissionSearch onSearch={setSearchQuery} />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {matrixEnabledCount} of {categories.length * actionTypes.length} permissions enabled across {categories.length} modules
                                </p>
                            </div>

                            <div className="flex flex-row gap-2 items-center">
                                {/* <PermissionEditor onSubmit={handleAddPermissionsFromSheet} /> */}

                                <Button
                                    variant='default'
                                    size='sm'
                                    disabled={loading}
                                    onClick={() => {
                                        setEditorModal({
                                            isOpen: true
                                        })
                                    }}
                                >
                                    <Key />
                                    Add Permission
                                </Button>

                                <Button
                                    onClick={handleSave}
                                    variant={'default'}
                                    disabled={loading}
                                >
                                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-secondary/50">
                                    <th className="text-left py-4 px-6 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                                        Module
                                    </th>
                                    {actionTypes.map((action) => {
                                        const config = actionConfig[action];
                                        const Icon = config.icon;
                                        return (
                                            <th
                                                key={action}
                                                className="text-center py-4 px-6 text-muted-foreground font-semibold text-xs uppercase tracking-wider"
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    <Icon className="w-3.5 h-3.5" />
                                                    {config.label}
                                                </div>
                                            </th>
                                        );
                                    })}
                                    <th className="w-12"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr
                                        key={category}
                                        className="border-b border-border/50 hover:bg-secondary/30 transition-all duration-200 group"
                                    >
                                        <td className="py-5 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-primary/60 group-hover:bg-primary transition-colors" />
                                                <span className="text-foreground font-medium">
                                                    {formatCategoryName(category)}
                                                </span>
                                            </div>
                                        </td>
                                        {actionTypes.map((action) => {
                                            const permission = hasPermission(category, action);
                                            const isEnabled = permission?.status ?? false;

                                            return (
                                                <td key={action} className="py-5 px-6 text-center">
                                                    <div className="flex justify-center">
                                                        <Checkbox
                                                            onClick={() => {
                                                                if (permission) {
                                                                    handlePermissionChange(permission.id, !isEnabled);
                                                                } else {
                                                                    handlePermissionCreate(category, action);
                                                                }
                                                            }}
                                                            checked={isEnabled}
                                                        />
                                                    </div>
                                                </td>
                                            );
                                        })}
                                        <td className="py-5 px-3 text-center">
                                            {/* <Button
                                                variant='ghost'
                                                size='sm'
                                                onClick={() => {
                                                    setEditorModal({
                                                        isOpen: true,
                                                        mode: 'edit',

                                                    })
                                                }}
                                                
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </Button> */}
                                            <PermissionEditor
                                                mode="edit"
                                                editData={getEditDataForCategory(category)}
                                                onSubmit={handleEditSubmit}
                                                open={editSheetOpen && editingCategory === category}
                                                onClose={() => { }}
                                                onOpenChange={(open) => {
                                                    if (!open) {
                                                        setEditingCategory(null);
                                                        setEditSheetOpen(false);
                                                    }
                                                }}
                                                trigger={
                                                    <button
                                                        onClick={() => handleEditCategory(category)}
                                                        className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="bg-secondary/30 px-6 py-4 border-t border-border">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Showing {categories.length} modules</span>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-dashboard-gradient-start to-dashboard-gradient-end" />
                                    <span>Enabled</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm bg-secondary border border-border" />
                                    <span>Disabled</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PermissionEditor
                mode={editorModal.mode}
                isOpen={editorModal.isOpen}
                onOpenChange={(open) => {

                }}
                onClose={() => {
                    setEditorModal({
                        isOpen: false,
                        mode: 'add',
                        permissions: null
                    })
                }}
            />
        </div>
    );
};

export default PermissionMatrix;
