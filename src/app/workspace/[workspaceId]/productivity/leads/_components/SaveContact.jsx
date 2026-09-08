import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Save, Tag as TagIcon, MapPin, Phone, User, Hash, Info, Briefcase, Loader, X, Plus } from 'lucide-react'
import { useParams } from 'next/navigation'
import { saveLeadAction } from '../_actions/save-lead'
import { bulkSaveLeadsAction } from '../_actions/bulk-save'
import { saveCategory } from '../../../konnectx/contacts/_actions/save-category'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
    title: z.string().optional(),
    name: z.string().min(2, "Name must be at least 2 characters").optional().or(z.literal('')),
    phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal('')),
    category: z.string().min(1, "Category is required"),
    tags: z.string().optional(),
    address: z.string().optional(),
    description: z.string().optional(),
})

const cleanBusinessName = (name) => {
    if (!name) return "";
    return name.split(/[-|]/)[0].trim();
}

const getFirstFiveWords = (name) => {
    if (!name) return "";
    return name.split(/\s+/).slice(0, 5).join(" ");
}

export default function SaveContact({ open, setOpen, leads, selectedLeadIds, onSuccess, categories = [] }) {
    const { workspaceId } = useParams();
    const isBulk = selectedLeadIds?.length > 1;
    const lead = leads?.[0];
    const [saving, setSaving] = useState(false);
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [localCategories, setLocalCategories] = useState([]);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            name: "",
            phone: "",
            category: "Google Places",
            tags: "",
            address: "",
            description: "",
        },
    });

    // Reset form when lead changes or modal opens
    useEffect(() => {
        if (open) {
            if (isBulk) {
                form.reset({
                    title: "",
                    name: "Multiple Contacts",
                    phone: "9999999999", // Placeholder for validation if needed, though we made them optional
                    category: "Google Places",
                    tags: "",
                    address: "",
                    description: "",
                });
            } else if (lead && lead.id) {
                form.reset({
                    title: cleanBusinessName(lead.name),
                    name: getFirstFiveWords(lead.name),
                    phone: lead.phone || "",
                    category: "Google Places",
                    tags: "",
                    address: lead.address || "",
                    description: "",
                });
            }
            setTags([]);
            setTagInput('');
            setLocalCategories(categories);
            setShowNewCategory(false);
            setNewCategoryName('');
            setNewCategoryColor('#3b82f6');
        }
    }, [open, lead?.id, isBulk, form]);

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim() || isCreatingCategory) return;
        setIsCreatingCategory(true);
        try {
            const result = await saveCategory({ name: newCategoryName.trim(), color: newCategoryColor, type: 'CONTACT', workspaceId });
            if (result?.data) {
                setLocalCategories(prev => [...prev, result.data]);
                form.setValue('category', result.data.name);
                setShowNewCategory(false);
                setNewCategoryName('');
                setNewCategoryColor('#3b82f6');
                toast.success("Category created");
            } else {
                toast.error(result?.error || "Failed to create category");
            }
        } catch (error) {
            toast.error("Failed to create category");
        } finally {
            setIsCreatingCategory(false);
        }
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tag = tagInput.trim().replace(',', '');
            if (tag && !tags.includes(tag)) {
                setTags([...tags, tag]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleOpenChange = (newOpen) => {
        if (typeof setOpen === 'function') {
            if (typeof setOpen(newOpen) === 'undefined') {
                // Handle both simple boolean state and object-based state
                setOpen(prev => typeof prev === 'object' ? { ...prev, open: newOpen } : newOpen);
            }
        }
    };

    const onSubmit = async (values) => {
        setSaving(true);

        try {
            if (isBulk) {
                const result = await bulkSaveLeadsAction(workspaceId, leads, {
                    category: values.category,
                    tags: tags,
                    description: values.description
                });
                
                if (result.success) {
                    toast.success(`Successfully saved ${result.results.saved} leads`);
                    if (onSuccess) onSuccess();
                    handleOpenChange(false);
                } else {
                    toast.error(result.error || "Bulk save failed");
                }
            } else {
                const data = {
                    ...values,
                    tags: tags,
                    location: lead.location,
                    email: lead.email,
                    raw: lead // Pass the full lead object here
                };
                const result = await saveLeadAction(workspaceId, data);
                if (result.success) {
                    toast.success("Lead saved to contacts successfully");
                    if (onSuccess) onSuccess();
                    handleOpenChange(false);
                } else {
                    toast.error(result.error || "Failed to save lead");
                }
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className=" bg-card border gap-0 overflow-hidden rounded-xl p-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="">
                            <DialogHeader className="pb-4">
                                <DialogTitle className="text-lg font-semibold  flex items-center gap-2 ">
                                    {isBulk ? `Bulk Save ${selectedLeadIds.length} Contacts` : "Add to Contacts"}
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground text-xs">
                                    {isBulk 
                                        ? "Apply a global category and tags to all selected leads." 
                                        : "Verify and enrich lead details before saving to your workspace."
                                    }
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                {/* Left Column: Essential Info */}
                                {!isBulk && (
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                                                        <Briefcase className="w-3 h-3" />
                                                        Title / Position / Company
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="e.g. CEO, Manager"
                                                            className="bg-transparent border transition-all rounded-md"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                                                        <User className="w-3 h-3" />
                                                        Name
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Enter contact person name"
                                                            className="bg-transparent border transition-all rounded-md"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                                                        <Phone className="w-3 h-3" />
                                                        Phone Number
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="+1 (555) 000-0000"
                                                            className="bg-transparent border transition-all rounded-md"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}

                                {/* Right Column: Categorization */}
                                <div className={isBulk ? "col-span-2 grid grid-cols-2 gap-4" : "space-y-4"}>
<FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                                                <Hash className="w-3 h-3" />
                                                Category
                                            </FormLabel>
                                            <FormControl>
                                                <div className="space-y-2">
                                                    <div className="flex gap-2">
                                                        <Select
                                                            value={localCategories.find(c => c.name === field.value)?.name || ""}
                                                            onValueChange={field.onChange}
                                                        >
                                                            <SelectTrigger className="bg-transparent border transition-all rounded-md flex-1">
                                                                <SelectValue placeholder="Select existing category..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {localCategories.map((cat) => (
                                                                    <SelectItem key={cat.id} value={cat.name}>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                                                            {cat.name}
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="shrink-0 border transition-all rounded-md"
                                                            onClick={() => setShowNewCategory(s => !s)}
                                                            title="Add new category"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    {showNewCategory && (
                                                        <div className="space-y-2 p-3 rounded-md border transition-all rounded-md">
                                                            <div className="flex items-center gap-2">
                                                                <label className="flex items-center gap-2 text-xs font-medium shrink-0">
                                                                    <input
                                                                        type="color"
                                                                        value={newCategoryColor}
                                                                        onChange={e => setNewCategoryColor(e.target.value)}
                                                                        className="w-9 h-8 p-0.5 border rounded cursor-pointer bg-transparent"
                                                                    />
                                                                    Color
                                                                </label>
                                                                <Input
                                                                    placeholder="New category name"
                                                                    value={newCategoryName}
                                                                    onChange={e => setNewCategoryName(e.target.value)}
                                                                    className="flex-1 bg-transparent border transition-all rounded-md"
                                                                />
                                                            </div>
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-xs font-medium"
                                                                    onClick={() => setShowNewCategory(false)}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    className="text-xs font-semibold"
                                                                    disabled={isCreatingCategory || !newCategoryName.trim()}
                                                                    onClick={handleCreateCategory}
                                                                >
                                                                    {isCreatingCategory ? <Loader className="w-3.5 h-3.5 animate-spin" /> : "Create"}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                                            <TagIcon className="w-3 h-3 text-muted-foreground/40" />
                                                        </div>
                                                        <Input
                                                            placeholder="Or type a new category..."
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            className="pl-9 bg-transparent border transition-all rounded-md"
                                                        />
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />

                                <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                                        <TagIcon className="w-3 h-3" />
                                        Tags
                                    </FormLabel>
                                    <div className="flex flex-wrap gap-2 p-2 bg-muted/20 rounded-lg border transition-all rounded-md min-h-10 items-center">
                                        {tags.map(tag => (
                                            <Badge key={tag} variant="secondary" className="gap-1 pl-2 pr-1 py-1 bg-primary/10 text-primary border-none hover:bg-primary/20">
                                                {tag}
                                                <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                                            </Badge>
                                        ))}
                                        <input
                                            placeholder={tags.length === 0 ? "Add tags (press enter or comma)" : ""}
                                            value={tagInput}
                                            onChange={e => setTagInput(e.target.value)}
                                            onKeyDown={handleAddTag}
                                            className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px]"
                                        />
                                    </div>
                                </FormItem>

                                    {!isBulk && (
                                        <FormField
                                            control={form.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                                                        <MapPin className="w-3 h-3" />
                                                        Address
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="City, Country"
                                                            className="bg-transparent border transition-all rounded-md"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>

                                {/* Full Width Description */}
                                <div className="col-span-2 space-y-2 pt-2">
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-medium flex items-center gap-2">
                                                    <Info className="w-3 h-3" />
                                                    Description / Notes
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        rows={isBulk ? 4 : 6}
                                                        placeholder={isBulk ? "Add global notes for this batch..." : "Add context or notes about this interaction..."}
                                                        className="bg-transparent border transition-all rounded-md resize-none"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-4  border-t  flex items-center justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                className=" font-medium"
                            >
                                Discard
                            </Button>
                            <Button
                                type="submit"
                                variant="default"
                                disabled={saving}
                                className=" font-semibold px-6 flex items-center gap-2 group"
                            >
                                {saving ? <Loader className=' animate-spin' /> : <Save className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />}
                                {saving ? "Saving..." : "Save Contact"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
