import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, Pencil, Shield, ShieldAlert, X, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { upsertPermission } from "../../_action/upsert-permission";
import { useSession } from "next-auth/react";
import { GeneralPermissionForm } from "./GeneralPermissionForm";
import { NavigationPermissionForm } from "./NavigationPermissionForm";
import { PermissionInfo } from "./PermissionInfo";
import { getSidebarItems } from "@/constants/sidebar-items";

const defaultActionOptions = [
    { id: "view", label: "View", description: "Read-only access" },
    { id: "create", label: "Create", description: "Add new items" },
    { id: "edit", label: "Edit", description: "Modify existing items" },
    { id: "delete", label: "Delete", description: "Remove items" },
];

const colorOptions = [
    { id: "emerald", label: "Emerald", color: "#15803D" },
    { id: "blue", label: "Blue", color: "#2563EB" },
    { id: "purple", label: "Purple", color: "#9333EA" },
    { id: "amber", label: "Amber", color: "#F59E0B" },
    { id: "rose", label: "Rose", color: "#F43F5E" },
    { id: "cyan", label: "Cyan", color: "#06B6D4" },
    { id: "orange", label: "Orange", color: "#F97316" },
    { id: "teal", label: "Teal", color: "#14B8A6" },
];

const formatCategoryName = (category) => {
    return category
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
};

export default function PermissionEditor({
    isOpen,
    onClose,
    mode = "add",
    category,
    editData,
    onSubmit,
    trigger,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}) {
    const params = useParams();
    const workspaceId = params.workspaceId;
    const [internalOpen, setInternalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const { data: session } = useSession()

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = (value) => {
        if (isControlled) {
            controlledOnOpenChange?.(value);
        } else {
            setInternalOpen(value);
        }
    };

    const [moduleName, setModuleName] = useState("");
    const [selectedActions, setSelectedActions] = useState([]);
    const [description, setDescription] = useState("");
    const [selectedColor, setSelectedColor] = useState("emerald");
    const [customActions, setCustomActions] = useState([]);
    const [newActionName, setNewActionName] = useState("");
    const [newActionDescription, setNewActionDescription] = useState("");
    const [selectedNavItems, setSelectedNavItems] = useState([]);

    const actionOptions = [...defaultActionOptions, ...customActions];

    useEffect(() => {
        if (open && category) {
            setModuleName(category);

            if (mode === "edit" && editData?.permissions) {
                const activeActions = [];
                Object.entries(editData.permissions).forEach(([actionId, perm]) => {
                    if (perm?.status === true) {
                        activeActions.push(actionId);
                    }
                });
                setSelectedActions(activeActions);
                setDescription(editData.displayName || "");

                const colorId =
                    colorOptions.find((c) => c.color === editData.permissions?.view?.color)?.id || "emerald";
                setSelectedColor(colorId);

                // Load Navigation Permissions
                const navItems = [];
                Object.entries(editData.permissions).forEach(([actionId, perm]) => {
                    if (perm?.value?.startsWith("navbar:") && perm?.status === true) {
                        // value is "navbar:category:slug", we need "category:slug"
                        const parts = perm.value.split(":");
                        if (parts.length >= 3) {
                            navItems.push(`${parts[1]}:${parts[2]}`);
                        }
                    }
                });
                setSelectedNavItems(navItems);
            } else {
                setModuleName(category || "");
                // Pre-select core CRUD actions by default
                setSelectedActions(['view', 'create', 'edit', 'delete']);
                setDescription("");
                setSelectedColor("emerald");
                setSelectedNavItems([]);
            }
        }
    }, [open, mode, category, editData, workspaceId]);

    const handleActionToggle = (actionId) => {
        setSelectedActions((prev) =>
            prev.includes(actionId) ? prev.filter((a) => a !== actionId) : [...prev, actionId]
        );
    };

    const handleSelectAll = () => {
        if (selectedActions.length === actionOptions.length) {
            setSelectedActions([]);
        } else {
            setSelectedActions(actionOptions.map((a) => a.id));
        }
    };

    const handleAddCustomAction = () => {
        const trimmedName = newActionName.trim();
        if (!trimmedName) {
            toast.error("Action name is required");
            return;
        }

        const actionId = trimmedName.toLowerCase().replace(/\s+/g, "_");

        if (actionOptions.some((a) => a.id === actionId)) {
            toast.error("Action already exists");
            return;
        }

        const newAction = {
            id: actionId,
            label: trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1),
            description: newActionDescription.trim() || `${trimmedName} permission`,
            isCustom: true,
        };

        setCustomActions((prev) => [...prev, newAction]);
        setSelectedActions((prev) => [...prev, actionId]);
        setNewActionName("");
        setNewActionDescription("");
        toast.success(`Added"${newAction.label}"action`);
    };

    const { execute } = useAction(upsertPermission, {
        onSuccess: (data) => {
            setLoading(false);
            toast.success(mode === "edit" ? "Permissions updated" : "Permissions created", { id: "permission-form" });
            onSubmit?.(data.permissions);
            handleOpenClose();
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to save permissions. Please try again.", { id: "permission-form" });
            setLoading(false);
        }
    });

    const handleSubmit = async () => {
        if (!moduleName.trim()) {
            toast.error("Module name required");
            return;
        }
        if (selectedActions.length === 0) {
            toast.error("Select at least one action");
            return;
        }

        const categorySlug = moduleName.toLowerCase().replace(/\s+/g, "_");
        const colorValue = colorOptions.find((c) => c.id === selectedColor)?.color || "#15803D";

        const actionPermissions = actionOptions.map((action) => ({
            // If editing and permission exists, keep its ID
            id: mode === "edit" && editData?.permissions[action.id]?.id
                ? editData.permissions[action.id].id
                : `new-${categorySlug}-${action.id}-${Date.now()}`,
            title: `${action.label} ${formatCategoryName(categorySlug)}`,
            value: `${categorySlug}.${action.id}`,
            description: description || `${action.label} permission for ${formatCategoryName(categorySlug)}`,
            category: categorySlug,
            color: colorValue,
            status: selectedActions.includes(action.id),
        }));

        // 2. Generate Navbar Permissions (ALL sidebar items)
        const sidebarItems = getSidebarItems(workspaceId);
        const navbarPermissions = [];

        sidebarItems.forEach((item) => {
            // Logic to get the same ID used in UI checkboxes
            const isParent = item.type === 'parent';
            const slug = item.url.split("/").pop();

            // Skip items with no slug or current workspace id
            if (!slug || slug === workspaceId) return;

            const itemId = `${item.category}:${slug}`;
            const dbValue = `navbar:${item.category}:${slug}`;

            navbarPermissions.push({
                id: mode === "edit" && editData?.permissions[dbValue]?.id
                    ? editData.permissions[dbValue].id
                    : `nav-${categorySlug}-${item.category}-${slug}-${Date.now()}`,
                title: `Access ${item.title} (${item.category})`,
                value: dbValue,
                description: `UI access to ${item.title} in the ${item.category} group`,
                category: categorySlug,
                color: colorValue,
                status: selectedNavItems.includes(itemId),
            });
        });

        const permissionsPayload = [...actionPermissions, ...navbarPermissions];

        setLoading(true);
        toast.loading(mode === "edit" ? "Updating..." : "Creating...", { id: "permission-form" });
        await execute({ userId: session.user?.userId || session.user?.id, formData: permissionsPayload });
    };

    const handleOpenClose = () => {
        setLoading(false);
        setModuleName("");
        setSelectedActions([]);
        setDescription("");
        setSelectedColor("emerald");
        setCustomActions([]);
        setNewActionName("");
        setNewActionDescription("");
        setSelectedNavItems([]);
        setOpen(false);
        onClose?.();
    };

    const isValid = moduleName.trim() && selectedActions.length > 0;
    const categorySlug = moduleName.toLowerCase().replace(/\s+/g, "_");

    return (
        <Sheet open={open} onOpenChange={(val) => {
            if (!val) handleOpenClose();
            else setOpen(true);
        }}>
            {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
            <SheetContent className="min-w-[620px] bg-transparent border-0 shadow-none p-2">
                <div className="bg-card rounded-md flex flex-col h-full border overflow-hidden shadow-2xl">
                    <SheetHeader className="border-b p-6 bg-muted/5">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-md bg-primary/10 border border-primary/20 shadow-inner">
                                {mode === "edit" ? (
                                    <Pencil className="w-6 h-6 text-primary" />
                                ) : (
                                    <Shield className="w-6 h-6 text-primary animate-pulse-slow" />
                                )}
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold ">
                                    {mode === "edit" ? "Refine Permissions" : "Define New Permission"}
                                </SheetTitle>
                                <SheetDescription className="text-xs opacity-60">
                                    {mode === "edit"
                                        ? `Fine-tuning access for the "${category}" ecosystem`
                                        : "Establish a new security perimeter within the app"}
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    <ScrollArea className="h-[82vh]">
                        <Accordion type="multiple" defaultValue={["permission-info"]} className="px-4 py-2 space-y-2">

                            {/* Permission Info */}
                            <AccordionItem value="permission-info" className="border border-primary/20 rounded-lg bg-card/50 overflow-hidden group/item">
                                <AccordionTrigger className="px-4 bg-muted/40 hover:bg-muted/50 transition-colors group-data-[state=open]/item:border-b border-primary/10 cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-primary/10 border border-primary/20 group-data-[state=open]/item:bg-primary/20 transition-colors">
                                            <Shield className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="text-left py-1">
                                            <h4 className="text-sm font-bold tracking-tight">Permission Information</h4>
                                            <p className="text-[10px] text-muted-foreground opacity-60">Identity and visual signature</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-0 pb-0 p-4">
                                    <PermissionInfo
                                        moduleName={moduleName}
                                        setModuleName={setModuleName}
                                        categorySlug={categorySlug}
                                        selectedColor={selectedColor}
                                        setSelectedColor={setSelectedColor}
                                    />
                                </AccordionContent>
                            </AccordionItem>


                            {/* General Permissions */}
                            <AccordionItem value="general" className="border border-primary/20 rounded-lg bg-card/50 overflow-hidden group/item">
                                <AccordionTrigger className="px-4 hover:bg-muted/50 transition-colors cursor-pointer group-data-[state=open]/item:border-b border-primary/10 bg-muted/40">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-primary/10 border border-primary/20 group-data-[state=open]/item:bg-primary/20 transition-colors">
                                            <ShieldAlert className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="text-left py-1">
                                            <h4 className="text-sm font-bold tracking-tight">General Permissions</h4>
                                            <p className="text-[10px] text-muted-foreground opacity-60">Operation scopes and access levels</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="">
                                    <GeneralPermissionForm
                                        categorySlug={categorySlug}
                                        selectedActions={selectedActions}
                                        handleSelectAll={handleSelectAll}
                                        actionOptions={actionOptions}
                                        handleActionToggle={handleActionToggle}
                                        setCustomActions={setCustomActions}
                                        setSelectedActions={setSelectedActions}
                                        newActionName={newActionName}
                                        setNewActionName={setNewActionName}
                                        newActionDescription={newActionDescription}
                                        setNewActionDescription={setNewActionDescription}
                                        handleAddCustomAction={handleAddCustomAction}
                                        description={description}
                                        setDescription={setDescription}
                                        formatCategoryName={formatCategoryName}
                                        moduleName={moduleName}
                                    />
                                </AccordionContent>
                            </AccordionItem>


                            {/* Navigation Permissions */}
                            <AccordionItem value="navigation" className="border border-primary/20 rounded-lg bg-card/50 overflow-hidden group/item">
                                <AccordionTrigger className="px-4 hover:bg-muted/50 transition-colors cursor-pointer group-data-[state=open]/item:border-b border-primary/10 bg-muted/40">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-primary/10 border border-primary/20 group-data-[state=open]/item:bg-primary/20 transition-colors">
                                            <Plus className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="text-left py-1">
                                            <h4 className="text-sm font-bold tracking-tight">Navigation Access</h4>
                                            <p className="text-[10px] text-muted-foreground opacity-60">UI sidebar routes and menu assignment</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-0 pb-0">
                                    <NavigationPermissionForm
                                        selectedNavItems={selectedNavItems}
                                        setSelectedNavItems={setSelectedNavItems}
                                    />
                                </AccordionContent>
                            </AccordionItem>

                        </Accordion>
                    </ScrollArea>

                    <SheetFooter className="p-4 border-t bg-muted/5 flex-row justify-end items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={handleOpenClose}
                            disabled={loading}
                            className="rounded-md font-bold text-xs uppercase tracking-wide px-8"
                        >
                            Discard
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!isValid || loading}
                            className="rounded-md px-8 shadow-xl shadow-primary/20"
                        >
                            {loading ? (
                                <Loader className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                mode === "edit" ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />
                            )}
                            {mode === "edit" ? "Update Permissions" : "Save Permissions"}
                        </Button>
                    </SheetFooter>

                </div>
            </SheetContent >
        </Sheet >
    );
}