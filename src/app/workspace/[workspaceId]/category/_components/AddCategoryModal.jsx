'use client';

import { useState, useEffect, Fragment } from "react";
import { useModal } from"@/hooks/useModal";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from"@/components/ui/dialog";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from"@/components/ui/select";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Textarea } from"@/components/ui/textarea";
import { Loader2, Tags, Palette, Type, AlignLeft, FolderTree, CornerDownRight } from "lucide-react";
import axios from"@/utils/axios";
import { toast } from"sonner";

export const AddCategoryModal = () => {
 const { isOpen, onClose, type, data } = useModal();
 const isModalOpen = isOpen && type ==="addCategory";
 const { workspaceId, category, parentCategories, parentId: defaultParentId, onApply } = data || {};

 const [isLoading, setIsLoading] = useState(false);
 const [name, setName] = useState("");
 const [slug, setSlug] = useState("");
 const [isManualSlug, setIsManualSlug] = useState(false);
 const [description, setDescription] = useState("");
 const [color, setColor] = useState("#3b82f6");
 const [categoryType, setCategoryType] = useState("GENERAL");
 const [parentId, setParentId] = useState("none");

 const isEdit = !!category;

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
   if (isModalOpen) {
     if (category) {
       setName(category.name || "");
       setSlug(category.slug || "");
       setIsManualSlug(true);
       setDescription(category.description || "");
       setColor(category.color || "#3b82f6");
       setCategoryType(category.type || "GENERAL");
       setParentId(category.parentId || "none");
     } else {
       setName("");
       setSlug("");
       setIsManualSlug(false);
       setDescription("");
       setColor("#3b82f6");
       setCategoryType("GENERAL");
       setParentId(defaultParentId || "none");
     }
   }
 }, [isModalOpen, category, defaultParentId]);

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

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const payload = {
        name,
        slug,
        description,
        color,
        type: categoryType,
        parentId: parentId === "none" ? null : parentId
      };

      if (isEdit) {
        await axios.patch(`/api/workspace/${workspaceId}/management/category/${category.id}`, payload);
        toast.success("Category updated successfully");
      } else {
        await axios.post(`/api/workspace/${workspaceId}/management/category`, payload);
        toast.success("Category created successfully");
      }

      onClose();
      if (onApply) onApply();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const colorPresets = [
    "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
    "#ec4899", "#06b6d4", "#f97316", "#64748b", "#000000"
  ];

 return (
 <Dialog open={isModalOpen} onOpenChange={handleClose}>
 <DialogContent className="sm:max-w-lg overflow-hidden border border-border/100 shadow-2xl p-0 bg-background rounded-md">
 <form onSubmit={onSubmit} className="flex flex-col">
 <DialogHeader className="p-8 pb-0">
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 rounded-md bg-primary/10">
 <Tags className="h-5 w-5 text-primary"/>
 </div>
 <DialogTitle className="text-2xl font-bold">
 {isEdit ?"Edit Category": defaultParentId ?"Add Subcategory":"Create New Category"}
 </DialogTitle>
 </div>
 <DialogDescription className="text-[10px] font-bold text-muted-foreground opacity-70">
 {isEdit
 ?"Update the details for this category."
 : defaultParentId
 ?"Add a subcategory under the selected parent."
 :"Add a new category to organize your platform content."}
 </DialogDescription>
 </DialogHeader>

 <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
 <div className="space-y-4">
 <div className="space-y-2 text-left">
 <label className="text-[10px] font-bold text-muted-foreground ml-1 flex items-center gap-1.5">
 <Type size={12} /> Category Name
 </label>
 <Input
 disabled={isLoading}
 className="h-12 bg-muted/30 border-none rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-inner text-sm font-bold"
 placeholder="e.g. Blog Posts"
 value={name}
 onChange={handleNameChange}
 required
 />
 </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-muted-foreground ml-1 flex items-center gap-1.5 uppercase tracking-widest opacity-60">
                  Category Slug
                </label>
                <Input
                  disabled={isLoading}
                  className="h-10 bg-muted/20 border-none rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-inner text-xs font-mono text-muted-foreground"
                  placeholder="category-slug"
                  value={slug}
                  onChange={handleSlugChange}
                  required
                />
              </div>

 <div className="space-y-2 text-left">
 <label className="text-[10px] font-bold text-muted-foreground ml-1 flex items-center gap-1.5">
 <AlignLeft size={12} /> Description
 </label>
 <Textarea
 disabled={isLoading}
 rows='4'
 className="min-h-[80px] bg-muted/30 border-none rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-inner text-sm py-3"
 placeholder="What content belongs to this category?"
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 />
 </div>

  <div className="space-y-2 text-left">
    <label className="text-[10px] font-bold text-muted-foreground ml-1 flex items-center gap-1.5 uppercase tracking-widest">
      <FolderTree size={12} /> Parent Category
    </label>
    <Select value={parentId} onValueChange={setParentId} disabled={isLoading}>
      <SelectTrigger className="h-12 bg-muted/30 border-none rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-inner text-[10px] font-bold">
        <SelectValue placeholder="None (Top-level)"/>
      </SelectTrigger>
      <SelectContent className="rounded-md border-border/40 bg-card/90 backdrop-blur-xl">
        <SelectItem value="none" className="font-black text-[10px] rounded-md uppercase tracking-widest">
          NONE (TOP-LEVEL CATEGORY)
        </SelectItem>
        {parentCategories?.map((parent) => (
          <Fragment key={parent.id}>
            <SelectItem value={parent.id} className="font-bold text-[10px] rounded-md">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: parent.color }} />
                {parent.name}
              </div>
            </SelectItem>
            {parent.children?.map(child => (
              <SelectItem key={child.id} value={child.id} disabled={child.id === category?.id} className="font-bold text-[10px] rounded-md pl-8">
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

 <div className="space-y-3 text-left">
 <label className="text-[10px] font-bold text-muted-foreground ml-1 flex items-center gap-1.5">
 <Palette size={12} /> Category Color
 </label>
 <div className="flex flex-wrap gap-2.5 p-4 rounded-md bg-muted/20 border border-border/10">
 {colorPresets.map((p) => (
 <button
 key={p}
 type="button"
 className={`h-8 w-8 rounded-full border-4 transition-all transform hover:scale-110 shadow-sm ${color === p ?"border-white scale-110 shadow-md":"border-transparent opacity-70 hover:opacity-100"
 }`}
 style={{ backgroundColor: p }}
 onClick={() => setColor(p)}
 />
 ))}
 <div className="h-8 w-px bg-border/20 mx-1"/>
 <div className="relative group">
 <Input
 type="color"
 value={color}
 onChange={(e) => setColor(e.target.value)}
 className="w-8 h-8 p-0 border-none rounded-full cursor-pointer bg-transparent overflow-hidden"
 />
 </div>
 </div>
 </div>
 </div>
 </div>

 <DialogFooter className="p-8 pt-0 flex gap-3">
 <Button
 type="button"
 variant="outline"
 onClick={handleClose}
 className="h-12 rounded-md font-bold flex-1 border-border/100 bg-background/50 text-[10px]"
 >
 Cancel
 </Button>
 <Button
 disabled={isLoading}
 className="h-12 rounded-md font-bold flex-1 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 text-[10px]"
 >
 {isLoading ? (
 <Loader2 className="h-4 w-4 animate-spin"/>
 ) : (
 isEdit ?"Update Category":"Create Category"
 )}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 );
};