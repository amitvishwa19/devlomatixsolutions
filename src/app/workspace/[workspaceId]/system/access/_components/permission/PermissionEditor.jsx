import { useState, useEffect } from "react";
import { Plus, Pencil, Shield, X, Loader } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { upsertPermission } from "../../_action/upsert-permission";
import { useSession } from "next-auth/react";
import { GeneralPermissionForm } from "./GeneralPermissionForm";
import { NavigationPermissionForm } from "./NavigationPermissionForm";

const defaultActionOptions = [
    { id: "view", label: "View", description: "Read-only access" },
    { id: "create", label: "Create", description: "Add new items" },
    { id: "edit", label: "Edit", description: "Modify existing items" },
    { id: "delete", label: "Delete", description: "Remove items" },
    { id: "manage", label: "Manage", description: "Full control" },
    { id: "export", label: "Export", description: "Export data" },
    { id: "import", label: "Import", description: "Import data" },
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
            } else {
                setModuleName(category || "");
                setSelectedActions([]);
                setDescription("");
                setSelectedColor("emerald");
            }
        }
    }, [open, mode, category, editData]);

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

        const permissionsPayload = actionOptions.map((action) => ({
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
                            <div className="p-3 rounded-md bg-primary/10 border border-primary/20 shadow-inner">
                                {mode === "edit" ? (
                                    <Pencil className="w-6 h-6 text-primary" />
                                ) : (
                                    <Shield className="w-6 h-6 text-primary animate-pulse-slow" />
                                )}
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold tracking-tight">
                                    {mode === "edit" ? "Refine Permissions" : "Define New Module"}
                                </SheetTitle>
                                <SheetDescription className="text-sm opacity-70">
                                    {mode === "edit"
                                        ? `Fine-tuning access for the"${category}"ecosystem`
                                        : "Establish a new security perimeter within the app"}
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
                        <TabsList className="mx-6 mt-4 justify-start w-fit">
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="navigation">Navigation</TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="flex-1 overflow-hidden m-0 border-0">
                            <GeneralPermissionForm
                                moduleName={moduleName}
                                setModuleName={setModuleName}
                                categorySlug={categorySlug}
                                selectedColor={selectedColor}
                                setSelectedColor={setSelectedColor}
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
                            />
                        </TabsContent>
                        <TabsContent value="navigation" className="flex-1 overflow-hidden m-0 border-0">
                            <NavigationPermissionForm />
                        </TabsContent>
                    </Tabs>

                    <SheetFooter className="p-6 border-t bg-muted/5 flex-row justify-end items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={handleOpenClose}
                            disabled={loading}
                            className="rounded-md font-bold text-xs uppercase tracking-widest px-8"
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