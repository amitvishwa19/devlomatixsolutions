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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { upsertPermission } from "../../_action/upsert-permission";
import { useSession } from "next-auth/react";

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
    toast.success(`Added "${newAction.label}" action`);
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
        <div className="bg-card rounded-xl flex flex-col h-full border overflow-hidden shadow-2xl">
          <SheetHeader className="border-b p-6 bg-muted/5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
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
                    ? `Fine-tuning access for the "${category}" ecosystem`
                    : "Establish a new security perimeter within the app"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-8 pb-10">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="moduleName" className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">Module Identity</Label>
                  <Input
                    id="moduleName"
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    className="bg-secondary/30 border-border/40 h-12 rounded-xl text-lg font-medium focus:ring-primary/20"
                    placeholder="e.g. Content Analytics"
                  />
                  {moduleName && (
                    <div className="flex items-center gap-2 ml-1">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      <p className="text-[10px] text-muted-foreground font-mono opacity-60">
                        System Slug: <span className="text-primary">{categorySlug}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid gap-3">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">Visual Signature</Label>
                  <div className="flex flex-wrap gap-2.5 p-3 rounded-2xl bg-secondary/20 border border-border/30">
                    {colorOptions.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setSelectedColor(color.id)}
                        className={`w-9 h-9 rounded-xl transition-all duration-300 relative group ${selectedColor === color.id
                          ? "ring-2 ring-primary ring-offset-4 ring-offset-background scale-110 shadow-lg"
                          : "hover:scale-110 opacity-60 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: color.color }}
                        title={color.label}
                      >
                         {selectedColor === color.id && <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between mx-1">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-50">Operation Scopes ({selectedActions.length})</Label>
                  <Button type="button" variant="ghost" size="xs" onClick={handleSelectAll} className="h-7 text-[10px] font-bold uppercase tracking-tighter">
                    {selectedActions.length === actionOptions.length ? "Clear All" : "Select Global"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {actionOptions.map((action) => (
                    <label
                      key={action.id}
                      onClick={(e) => {
                        handleActionToggle(action.id);
                        e.stopPropagation();
                      }}
                      className={`flex items-start gap-3 p-4 rounded-2xl border transition-all duration-500 cursor-pointer group ${selectedActions.includes(action.id)
                        ? "border-primary/50 bg-primary/5 shadow-md shadow-primary/5"
                        : "border-border/40 bg-muted/10 hover:border-primary/30 hover:bg-muted/30"
                      }`}
                    >
                      <Checkbox
                        checked={selectedActions.includes(action.id)}
                        onCheckedChange={() => handleActionToggle(action.id)}
                        className="mt-1 transition-transform group-hover:scale-110"
                        onClick={(e) => e.stopPropagation()}
                      />

                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold block mb-0.5">
                          {action.label}
                          {action.isCustom && (
                            <span className="ml-1.5 text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-tighter leading-none align-middle">custom</span>
                          )}
                        </span>
                        <p className="text-[10px] text-muted-foreground opacity-60 line-clamp-1">{action.description}</p>
                      </div>
                      {action.isCustom && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomActions((prev) => prev.filter((a) => a.id !== action.id));
                            setSelectedActions((prev) => prev.filter((a) => a !== action.id));
                          }}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive transition-colors shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </label>
                  ))}

                  <div className="col-span-2 p-5 rounded-3xl border border-dashed border-primary/20 bg-primary/[0.02] mt-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Plus className="w-20 h-20 -mr-6 -mt-6 rotate-12" />
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Plus className="w-3 h-3 text-primary font-bold" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-primary/80">Extended Action</span>
                    </div>
                    <div className="space-y-3 relative z-10">
                      <Input
                        value={newActionName}
                        onChange={(e) => setNewActionName(e.target.value)}
                        placeholder="Action identifier (e.g. Audit)"
                        className="bg-background border-border/40 h-10 rounded-xl text-xs"
                      />
                      <Input
                        value={newActionDescription}
                        onChange={(e) => setNewActionDescription(e.target.value)}
                        placeholder="Contextual description"
                        className="bg-background border-border/40 h-10 rounded-xl text-xs"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        onClick={handleAddCustomAction}
                        disabled={!newActionName.trim()}
                        className="w-full h-10 rounded-xl shadow-lg shadow-primary/10"
                      >
                        Append Scoped Action
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">Module Context</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-secondary/30 border-border/40 rounded-2xl resize-none min-h-[100px] p-4 text-sm"
                  placeholder={`High-level overview of the ${formatCategoryName(categorySlug || "module")} scope...`}
                />
              </div>

              {moduleName && selectedActions.length > 0 && (
                <div className="p-6 rounded-3xl bg-primary/[0.03] border border-primary/10 space-y-4 shadow-inner">
                  <p className="text-[10px] font-black tracking-[0.2em] text-primary uppercase opacity-60">Security Manifest Preview</p>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedActions.map((action) => (
                      <div key={action} className="text-[11px] p-3 rounded-xl bg-background/80 border border-border/30 shadow-sm flex flex-col gap-1">
                        <span className="font-bold text-foreground">
                          {action.charAt(0).toUpperCase() + action.slice(1)}{" "}
                          {formatCategoryName(categorySlug)}
                        </span>
                        <span className="font-mono text-[9px] text-primary/70">
                          {categorySlug}.{action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <SheetFooter className="p-6 border-t bg-muted/5 flex-row justify-end items-center gap-4">
            <Button 
                variant="ghost" 
                onClick={handleOpenClose} 
                disabled={loading}
                className="rounded-xl font-bold text-xs uppercase tracking-widest px-8"
            >
              Discard
            </Button>
            <Button 
                onClick={handleSubmit} 
                disabled={!isValid || loading}
                className="rounded-xl font-black text-xs uppercase tracking-widest px-8 h-12 shadow-xl shadow-primary/20"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin mr-2" />
              ) : (
                mode === "edit" ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />
              )}
              {mode === "edit" ? "Commit Changes" : "Deploy Permissions"}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent >
    </Sheet >
  );
}