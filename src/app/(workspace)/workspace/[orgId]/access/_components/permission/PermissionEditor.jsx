import { useState, useEffect } from "react";
import { Plus, Pencil, Loader2, Shield, X } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

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
        .join(" ");
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

    // Combine default and custom actions
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
        toast.success(`Added "${newAction.label}" action`);
    };

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

        const permissions = actionOptions.map((action) => ({
            id: `${categorySlug}-${action.id}-${Date.now()}`,
            title: `${action.label} ${formatCategoryName(categorySlug)}`,
            value: `${categorySlug}.${action.id}`,
            description: description || `${action.label} permission for ${formatCategoryName(categorySlug)}`,
            category: categorySlug,
            color: colorValue,
            status: selectedActions.includes(action.id),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            roles: [],
        }));

        setLoading(true);
        toast.loading(mode === "edit" ? "Updating..." : "Creating...", { id: "permission-form" });

        // Simulate API call
        await new Promise((r) => setTimeout(r, 800));

        onSubmit?.(permissions);
        toast.success(mode === "edit" ? "Permission updated" : "Permission created", {
            id: "permission-form",
        });
        handleOpenClose();
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
        <Sheet open={open} onOpenChange={setOpen}>
            {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
            <SheetContent className="min-w-[620px] bg-transparent border-0 shadow-none p-2">
                <div className="bg-card rounded xl flex flex-col h-full border overflow-hidden">
                    <SheetHeader className="border-b">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/10">
                                {mode === "edit" ? (
                                    <Pencil className="w-5 h-5 text-primary" />
                                ) : (
                                    <Shield className="w-5 h-5 text-primary" />
                                )}
                            </div>
                            <div>
                                <SheetTitle className="text-lg">
                                    {mode === "edit" ? "Edit Permissions" : "Add Permissions"}
                                </SheetTitle>
                                <SheetDescription className="text-sm">
                                    {mode === "edit"
                                        ? `Configure actions for "${category}" module`
                                        : "Create permissions for a new module"}
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    <ScrollArea className="h-[85vh] p-4">
                        <div className="space-y-6">

                            {/* Module Name */}
                            <div className="space-y-2 mx-1">
                                <Label htmlFor="moduleName">Module Name</Label>
                                <Input
                                    id="moduleName"
                                    value={moduleName}
                                    onChange={(e) => setModuleName(e.target.value)}
                                    className="bg-secondary/50"
                                    placeholder="e.g. User Management"
                                />
                                {moduleName && (
                                    <p className="text-xs text-muted-foreground">
                                        Slug: <span className="font-mono">{categorySlug}</span>
                                    </p>
                                )}
                            </div>

                            {/* Color Picker */}
                            <div className="space-y-2 mx-2">
                                <Label>Module Color</Label>
                                <div className="flex flex-wrap gap-2">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color.id}
                                            type="button"
                                            onClick={() => setSelectedColor(color.id)}
                                            className={`w-8 h-8 rounded-md transition-all duration-200 ${selectedColor === color.id
                                                ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                                                : "hover:scale-105"
                                                }`}
                                            style={{ backgroundColor: color.color }}
                                            title={color.label}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {colorOptions.find((c) => c.id === selectedColor)?.label}
                                </p>
                            </div>

                            {/* Action Checkboxes */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Actions ({selectedActions.length}/{actionOptions.length})</Label>
                                    <Button type="button" variant="ghost" size="sm" onClick={handleSelectAll}>
                                        {selectedActions.length === actionOptions.length ? "Deselect All" : "Select All"}
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {actionOptions.map((action) => (
                                        <label
                                            key={action.id}
                                            onClick={() => handleActionToggle(action.id)}
                                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedActions.includes(action.id)
                                                ? "border-primary bg-primary/10"
                                                : "border-border bg-secondary/30 hover:border-primary/50"
                                                }`}
                                        >
                                            <Checkbox
                                                checked={selectedActions.includes(action.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                onCheckedChange={() => handleActionToggle(action.id)}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm font-medium">
                                                    {action.label}
                                                    {action.isCustom && (
                                                        <span className="ml-1 text-xs text-primary">(custom)</span>
                                                    )}
                                                </span>
                                                <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                                            </div>
                                            {action.isCustom && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCustomActions((prev) => prev.filter((a) => a.id !== action.id));
                                                        setSelectedActions((prev) => prev.filter((a) => a !== action.id));
                                                        toast.success(`Removed "${action.label}" action`);
                                                    }}
                                                    className="p-1 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </label>
                                    ))}

                                    {/* Add Custom Action Card */}
                                    <div className="col-span-2 p-3 rounded-lg border border-dashed border-border bg-secondary/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Plus className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Add Custom Action</span>
                                        </div>
                                        <div className="space-y-2">
                                            <Input
                                                value={newActionName}
                                                onChange={(e) => setNewActionName(e.target.value)}
                                                placeholder="Action name (e.g. Approve)"
                                                className="bg-background h-8 text-sm"
                                                maxLength={30}
                                            />
                                            <Input
                                                value={newActionDescription}
                                                onChange={(e) => setNewActionDescription(e.target.value)}
                                                placeholder="Description (optional)"
                                                className="bg-background h-8 text-sm"
                                                maxLength={50}
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={handleAddCustomAction}
                                                disabled={!newActionName.trim()}
                                                className="w-full"
                                            >
                                                <Plus className="w-3 h-3 mr-1" />
                                                Add Action
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="bg-secondary/50 resize-none"
                                    rows={3}
                                    placeholder={`Permissions for ${formatCategoryName(categorySlug || "module")}`}
                                />
                            </div>

                            {/* Preview */}
                            {moduleName && selectedActions.length > 0 && (
                                <div className="p-4 rounded-lg bg-secondary/30 border space-y-3">
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Preview ({selectedActions.length} active)
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedActions.map((action) => (
                                            <div key={action} className="text-sm py-2 px-3 rounded-md bg-background/50">
                                                <span className="font-medium">
                                                    {action.charAt(0).toUpperCase() + action.slice(1)}{" "}
                                                    {formatCategoryName(categorySlug)}
                                                </span>
                                                <br />
                                                <span className="text-xs font-mono text-muted-foreground">
                                                    {categorySlug}.{action}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}


                        </div>
                    </ScrollArea>

                    <SheetFooter className="p-4 border-t flex-row justify-end gap-2 mb-2">
                        <Button variant="outline" onClick={handleOpenClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={!isValid || loading}>
                            {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : mode === "edit" ? (
                                <>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Update
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create ({selectedActions.length})
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </div>
            </SheetContent >
        </Sheet >
    );
}