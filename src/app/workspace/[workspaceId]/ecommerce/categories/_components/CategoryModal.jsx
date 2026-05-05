'use client';

import { useState, useEffect, Fragment } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Tags, Palette, Type, AlignLeft, FolderTree, CornerDownRight, Store } from "lucide-react";
import { toast } from "sonner";
import { createCategory } from "../_actions/createCategory";
import { updateCategory } from "../_actions/updateCategory";

export function CategoryModal({
    isOpen,
    onClose,
    workspaceId,
    stores = [],
    categories = [],
    initialData = null,
    defaultParentId = null,
    onSuccess
}) {
    const isEdit = !!initialData;
    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [isManualSlug, setIsManualSlug] = useState(false);
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("#3b82f6");
    const [categoryType, setCategoryType] = useState("GENERAL");
    const [storeId, setStoreId] = useState("");
    const [parentId, setParentId] = useState("none");

    const slugify = (text) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/[^\w-]+/g, '')   // Remove all non-word chars
            .replace(/--+/g, '-');    // Replace multiple - with single -
    };

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "");
                setSlug(initialData.slug || "");
                setIsManualSlug(true);
                setDescription(initialData.description || "");
                setColor(initialData.color || "#3b82f6");
                setCategoryType(initialData.type || "GENERAL");
                setStoreId(initialData.storeId || "");

                const isSubcategoryOfAnother = categories.some(c => c.id === initialData.parentId);
                setParentId(isSubcategoryOfAnother ? initialData.parentId : "none");
            } else {
                setName("");
                setSlug("");
                setIsManualSlug(false);
                setDescription("");
                setColor("#3b82f6");
                setCategoryType("GENERAL");
                // If adding subcategory, default to its store
                if (defaultParentId) {
                    const parentCat = categories.find(c => c.id === defaultParentId);
                    if (parentCat) setStoreId(parentCat.storeId || "");
                } else {
                    setStoreId("");
                }
                setParentId(defaultParentId || "none");
            }
        }
    }, [isOpen, initialData, defaultParentId, categories]);

    const handleNameChange = (e) => {
        const val = e.target.value;
        setName(val);
        if (!isManualSlug) {
            setSlug(slugify(val));
        }
    };

    const handleSlugChange = (e) => {
        setSlug(e.target.value);
        setIsManualSlug(true);
    };

    const handleStoreChange = (val) => {
        setStoreId(val);
        setParentId("none"); // Reset parent when store changes
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!storeId) {
            toast.error("Please select a store to assign this category to.");
            return;
        }

        try {
            setIsLoading(true);
            const dataToSubmit = {
                name,
                slug,
                description,
                color,
                type: categoryType,
                storeId,
                parentCategoryId: parentId === "none" ? null : parentId
            };

            let result;
            if (isEdit) {
                result = await updateCategory({
                    workspaceId,
                    categoryId: initialData.id,
                    formData: dataToSubmit
                });
            } else {
                result = await createCategory({
                    workspaceId,
                    formData: dataToSubmit
                });
            }

            if (result?.error) {
                toast.error(result.error);
                return;
            }

            toast.success(`Category ${isEdit ? 'updated' : 'created'} successfully`);
            onClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const colorPresets = [
        "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
        "#ec4899", "#06b6d4", "#f97316", "#64748b", "#000000"
    ];

    // Build tree just for the dropdown, filtered by selected store
    const buildTree = (cats) => {
        const catIds = new Set(cats.map(c => c.id));
        const catMap = {};
        cats.forEach(c => {
            catMap[c.id] = { ...c, children: [] };
        });

        const topLevel = [];
        cats.forEach(c => {
            if (!catIds.has(c.parentId)) {
                topLevel.push(catMap[c.id]);
            } else {
                if (catMap[c.parentId]) {
                    catMap[c.parentId].children.push(catMap[c.id]);
                }
            }
        });
        return topLevel;
    };

    const storeCategories = categories.filter(c => c.storeId === storeId);
    const parentCategoriesTree = buildTree(storeCategories);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg overflow-hidden border border-border shadow-2xl p-0 bg-background rounded-md">
                <form onSubmit={onSubmit} className="flex flex-col">
                    <DialogHeader className="p-8 pb-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-md bg-primary/10">
                                <Tags className="h-5 w-5 text-primary" />
                            </div>
                            <DialogTitle className="text-2xl font-bold">
                                {isEdit ? "Edit Category" : defaultParentId ? "Add Subcategory" : "Create New Category"}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs font-bold text-muted-foreground opacity-70">
                            {isEdit
                                ? "Update the details for this category."
                                : defaultParentId
                                    ? "Add a subcategory under the selected parent."
                                    : "Add a new category to organize your eCommerce store."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-4  overflow-y-auto">

                        {/* Store Selection */}
                        <div className="space-y-2 text-left">
                            <label className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-1.5  ">
                                <Store size={12} /> Store Assignment
                            </label>
                            <Select value={storeId} onValueChange={handleStoreChange} disabled={isLoading || (defaultParentId && !isEdit)}>
                                <SelectTrigger className=" bg-muted/30  rounded-md   shadow-inner text-xs font-bold">
                                    <SelectValue placeholder="Select a Store" />
                                </SelectTrigger>
                                <SelectContent className="rounded-md border-border/40 bg-card/90 backdrop-blur-xl">
                                    {stores.map(store => (
                                        <SelectItem key={store.id} value={store.id} className="font-bold text-xs rounded-md">
                                            {store.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Name Input */}
                        <div className="space-y-2 text-left">
                            <label className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-1.5  ">
                                <Type size={12} /> Category Name
                            </label>
                            <Input
                                disabled={isLoading}
                                className=" bg-muted/30  rounded-md   shadow-inner text-sm font-bold"
                                placeholder="e.g. Summer Collection"
                                value={name}
                                onChange={handleNameChange}
                                required
                            />
                        </div>

                        {/* Slug Input */}
                        <div className="space-y-2 text-left">
                            <label className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-1.5   opacity-60">
                                Category Slug
                            </label>
                            <Input
                                disabled={isLoading}
                                className="h-10 bg-muted/20  rounded-md   shadow-inner text-xs font-mono text-muted-foreground"
                                placeholder="summer-collection"
                                value={slug}
                                onChange={handleSlugChange}
                                required
                            />
                        </div>

                        {/* Description Input */}
                        <div className="space-y-2 text-left">
                            <label className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-1.5  ">
                                <AlignLeft size={12} /> Description
                            </label>
                            <Textarea
                                disabled={isLoading}
                                rows='4'
                                className="min-h-[80px] bg-muted/30  rounded-md   shadow-inner text-sm py-3"
                                placeholder="Brief description of this category..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Parent Category Dropdown */}
                        {storeId && (
                            <div className="space-y-2 text-left">
                                <label className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-1.5  ">
                                    <FolderTree size={12} /> Parent Category
                                </label>
                                <Select value={parentId} onValueChange={setParentId} disabled={isLoading}>
                                    <SelectTrigger className=" bg-muted/30  rounded-md   shadow-inner text-xs font-bold">
                                        <SelectValue placeholder="None (Direct Store Subcategory)" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-md border-border/40 bg-card/90 backdrop-blur-xl">
                                        <SelectItem value="none" className="font-black text-xs rounded-md  ">
                                            {stores.find(s => s.id === storeId)?.name} (MAIN STORE)
                                        </SelectItem>
                                        {parentCategoriesTree.map((parent) => (
                                            <Fragment key={parent.id}>
                                                <SelectItem value={parent.id} disabled={parent.id === initialData?.id} className="font-bold text-xs rounded-md">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: parent.color || '#3b82f6' }} />
                                                        {parent.name}
                                                    </div>
                                                </SelectItem>
                                                {parent.children?.map(child => (
                                                    <SelectItem key={child.id} value={child.id} disabled={child.id === initialData?.id || parent.id === initialData?.id} className="font-bold text-xs rounded-md pl-8">
                                                        <div className="flex items-center gap-2 opacity-60">
                                                            <CornerDownRight size={10} />
                                                            {child.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </Fragment>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Color Selection */}
                        <div className="space-y-3 text-left">
                            <label className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-1.5  ">
                                <Palette size={12} /> Category Color
                            </label>
                            <div className="flex flex-wrap gap-2.5 p-4 rounded-md bg-muted/20 border border-border/10">
                                {colorPresets.map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        className={`h-8 w-8 rounded-full border transition-all transform hover:scale-110 shadow-sm ${color === p ? "border-white scale-110 shadow-md" : "border-transparent opacity-70 hover:opacity-100"}`}
                                        style={{ backgroundColor: p }}
                                        onClick={() => setColor(p)}
                                    />
                                ))}

                                <div className="hidden relative group">
                                    <Input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="w-8 h-8 p-0  rounded-full cursor-pointer bg-transparent overflow-hidden"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-0 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className=" rounded-md font-semibold flex-1 border-border bg-background/50 text-xs  "
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={isLoading}
                            className="rounded-md font-semibold flex-1 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 text-xs  "
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                isEdit ? "Update Category" : "Create Category"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
