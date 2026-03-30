import React from'react'
import { useState, useEffect } from"react";
import { Plus, Pencil, Loader, ShieldUser } from"lucide-react";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Label } from"@/components/ui/label";
import { Textarea } from"@/components/ui/textarea";
import { Checkbox } from"@/components/ui/checkbox";
import {
 Sheet,
 SheetContent,
 SheetDescription,
 SheetFooter,
 SheetHeader,
 SheetTitle,
 SheetTrigger,
} from"@/components/ui/sheet";
import { ScrollArea } from'@/components/ui/scroll-area';
import { useAction } from'@/hooks/use-action';
import { upsertPermission } from'../../_action/upsert-permission';
import { useSession } from'next-auth/react';
import { toast } from'sonner';

const actionOptions = [
 { id:"view", label:"View", description:"Read-only access"},
 { id:"create", label:"Create", description:"Add new items"},
 { id:"edit", label:"Edit", description:"Modify existing items"},
 { id:"delete", label:"Delete", description:"Remove items"},
 { id:"manage", label:"Manage", description:"Full control"},
 { id:"export", label:"Export", description:"Export data"},
 { id:"import", label:"Import", description:"Import data"},
];

const colorOptions = [
 { id:"emerald", label:"Emerald", color:"#15803D"},
 { id:"blue", label:"Blue", color:"#2563EB"},
 { id:"purple", label:"Purple", color:"#9333EA"},
 { id:"amber", label:"Amber", color:"#F59E0B"},
 { id:"rose", label:"Rose", color:"#F43F5E"},
 { id:"cyan", label:"Cyan", color:"#06B6D4"},
 { id:"orange", label:"Orange", color:"#F97316"},
 { id:"teal", label:"Teal", color:"#14B8A6"},
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
 mode ="add", //"add"or"edit"
 category, // Pre-fill module name (required for both modes)
 editData, // Only pass for edit mode
 onSubmit,
 trigger,
 open: controlledOpen,
 onOpenChange: controlledOnOpenChange
}) {
 const { data: session } = useSession()
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

 // ✅ Unified logic for ADD + EDIT
 useEffect(() => {
 if (open && category) {
 // Always pre-fill category/moduleName from prop
 setModuleName(category);

 if (mode ==="edit"&& editData?.permissions) {
 // EDIT: Populate from existing permissions
 const activeActions = [];
 Object.entries(editData.permissions).forEach(([actionId, perm]) => {
 if (perm.status === true) {
 activeActions.push(actionId);
 }
 });
 setSelectedActions(activeActions);

 setDescription(editData.displayName ||"");

 // Extract color from permission
 const colorId = colorOptions.find(c => c.color === editData.permissions?.view?.color)?.id ||"emerald";
 setSelectedColor(colorId);
 } else {
 // ADD: Reset form (except category)
 setSelectedActions([]);
 setDescription("");
 setSelectedColor("emerald");
 }
 }
 }, [open, mode, category, editData]);

 const handleActionToggle = (actionId) => {
 setSelectedActions((prev) =>
 prev.includes(actionId)
 ? prev.filter((a) => a !== actionId)
 : [...prev, actionId]
 );
 };

 const handleSelectAll = () => {
 if (selectedActions.length === actionOptions.length) {
 setSelectedActions([]);
 } else {
 setSelectedActions(actionOptions.map((a) => a.id));
 }
 };

 const { execute } = useAction(upsertPermission, {
 onSuccess: (data) => {
 onSubmit?.(data.permissions);
 handleOpenClose();
 toast.success(mode ==="edit"?"Permission updated":"Permission created", { id:'permission-form'});
 },
 onError: (error) => {
 console.error(error);
 toast.error("Something went wrong", { id:'permission-form'});
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

 const categorySlug = moduleName.toLowerCase().replace(/\s+/g,"_");
 const colorValue = colorOptions.find(c => c.id === selectedColor)?.color ||"#15803D";

 const permissions = actionOptions.map((action) => ({
 title: `${action.label} ${formatCategoryName(categorySlug)}`,
 value: `${categorySlug}.${action.id}`,
 description: description || `${action.label} permission for ${formatCategoryName(categorySlug)}`,
 category: categorySlug,
 color: colorValue,
 status: selectedActions.includes(action.id),
 }));

 setLoading(true);
 toast.loading(mode ==="edit"?"Updating...":"Creating...", { id:'permission-form'});
 await execute({ userId: session?.user?.userId, formData: permissions });
 };

 const handleOpenClose = () => {
 setLoading(false);
 setModuleName("");
 setSelectedActions([]);
 setDescription("");
 setSelectedColor("emerald");
 onClose?.();
 };

 const isValid = moduleName.trim() && selectedActions.length > 0;
 const categorySlug = moduleName.toLowerCase().replace(/\s+/g,"_");

 return (
 <Sheet open={isOpen} onOpenChange={handleOpenClose}>
 <SheetTrigger asChild>{trigger}</SheetTrigger>
 <SheetContent className="sm:max-w-xl overflow-y-auto bg-transparent border-0 p-2">
 <div className='bg-card rounded-md h-full overflow-hidden'>
 <SheetHeader>
 <div className="flex flex-row gap-2">
 <div className="p-2 rounded-md bg-gradient-to-br from-dashboard-gradient-start to-dashboard-gradient-end">
 {mode ==="edit"? (
 <Pencil className="w-5 h-5 text-primary"/>
 ) : (
 <Plus className="w-5 h-5 text-primary"/>
 )}
 </div>
 <div>
 <SheetTitle>{mode ==="edit"?"Edit Permissions":"Add Permissions"}</SheetTitle>
 <SheetDescription className='text-xs'>
 {mode ==="edit"
 ? `Configure actions for"${category}"module`
 : `Create permissions for"${category}"module`}
 </SheetDescription>
 </div>
 </div>
 </SheetHeader>

 <ScrollArea className='h-[84vh] p-4'>
 <div className="space-y-4">
 {/* Module Name - Pre-filled & read-only in practice */}
 <div className="space-y-2 mx-1">
 <Label htmlFor="moduleName">Module Name</Label>
 <Input
 id="moduleName"
 value={moduleName}
 onChange={(e) => setModuleName(e.target.value)}
 className="bg-secondary/50"
 placeholder="Module name auto-filled from category"
 />
 {moduleName && (
 <p className="text-xs text-muted-foreground">
 Slug: <span className="font-mono text-foreground">{categorySlug}</span>
 </p>
 )}
 </div>

 {/* Color Picker */}
 <div className="space-y-2 ml-1">
 <Label>Module Color</Label>
 <div className="flex flex-wrap gap-2">
 {colorOptions.map((color) => (
 <button
 key={color.id}
 type="button"
 onClick={() => setSelectedColor(color.id)}
 className={`
 w-8 h-8 rounded-sm transition-all duration-200
 ${selectedColor === color.id ?"ring-2 ring-primary scale-110":"hover:scale-105"}
 `}
 style={{ backgroundColor: color.color }}
 title={color.label}
 />
 ))}
 </div>
 <p className="text-xs text-muted-foreground">
 {colorOptions.find(c => c.id === selectedColor)?.label}
 </p>
 </div>

 {/* Action Checkboxes */}
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <Label>Actions ({selectedActions.length}/7)</Label>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={handleSelectAll}
 className="text-xs h-7 px-2 hover:text-foreground"
 >
 {selectedActions.length === 7 ?"Deselect All":"Select All"}
 </Button>
 </div>
 <div className="grid grid-cols-3 gap-2">
 {actionOptions.map((action) => (
 <div
 key={action.id}
 onClick={() => handleActionToggle(action.id)}
 className={`
 flex items-center gap-3 p-2 rounded-md border cursor-pointer transition-all
 ${selectedActions.includes(action.id)
 ?"border-primary bg-primary/10"
 :"border-border bg-secondary/30 hover:border-primary/50"
 }`}
 >
 <Checkbox
 id={action.id}
 checked={selectedActions.includes(action.id)}
 onClick={(e) => e.stopPropagation()}
 onCheckedChange={() => handleActionToggle(action.id)}
 />
 <div className="flex-1 min-w-0">
 <label htmlFor={action.id} className="text-sm font-medium cursor-pointer">
 {action.label}
 </label>
 <p className="text-xs text-muted-foreground truncate">{action.description}</p>
 </div>
 </div>
 ))}
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
 placeholder={`Permissions for ${formatCategoryName(categorySlug || category ||'')}`}
 />
 </div>

 {/* Preview */}
 {moduleName && selectedActions.length > 0 && (
 <div className="p-4 rounded-md bg-secondary/30 border space-y-3">
 <p className="text-xs font-medium tracking-wider text-muted-foreground">
 Preview ({selectedActions.length} active)
 </p>
 <div className="grid grid-cols-3 gap-2">
 {selectedActions.map((action) => (
 <div key={action} className="text-sm py-1.5 px-2 rounded bg-background/50">
 <span className="font-medium">
 {action.slice(0, 1).toUpperCase() + action.slice(1)} {formatCategoryName(categorySlug)}
 </span>
 <br />
 <span className="text-xs font-mono text-muted-foreground">{categorySlug}.{action}</span>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 </ScrollArea>

 <SheetFooter className="flex flex-row justify-end">
 <Button variant="outline"onClick={handleOpenClose} disabled={loading} >
 Cancel
 </Button>
 <Button onClick={handleSubmit} disabled={!isValid || loading} >
 {loading ? (
 <Loader className="w-4 h-4 mr-2 animate-spin"/>
 ) : mode ==="edit"? (
 <>
 <Pencil className="w-4 h-4 mr-2"/>
 Update
 </>
 ) : (
 <>
 <Plus className="w-4 h-4 mr-2"/>
 Create ({selectedActions.length})
 </>
 )}
 </Button>
 </SheetFooter>
 </div>
 </SheetContent>
 </Sheet>
 );
}