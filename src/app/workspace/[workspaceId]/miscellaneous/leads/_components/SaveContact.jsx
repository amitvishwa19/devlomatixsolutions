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
import { Save, Tag as TagIcon, MapPin, Phone, User, Hash, Info, Briefcase, Loader } from 'lucide-react'
import { useParams } from 'next/navigation'
import { saveLeadAction } from '../_actions/save-lead'
import { bulkSaveLeadsAction } from '../_actions/bulk-save'
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

export default function SaveContact({ open, setOpen, leads, selectedLeadIds }) {
    const { workspaceId } = useParams();
    const isBulk = selectedLeadIds?.length > 1;
    const lead = leads?.[0];
    const [saving, setSaving] = useState(false);

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
        }
    }, [open, lead?.id, isBulk, form]);

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
        const tags = values.tags ? values.tags.split(',').map(t => t.trim()) : [];

        try {
            if (isBulk) {
                const result = await bulkSaveLeadsAction(workspaceId, leads, {
                    category: values.category,
                    tags: tags,
                    description: values.description
                });
                
                if (result.success) {
                    toast.success(`Successfully saved ${result.results.saved} leads`);
                    handleOpenChange(false);
                } else {
                    toast.error(result.error || "Bulk save failed");
                }
            } else {
                const data = {
                    ...values,
                    tags: tags,
                    location: lead.location,
                    email: lead.email
                };
                const result = await saveLeadAction(workspaceId, data);
                if (result.success) {
                    toast.success("Lead saved to contacts successfully");
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
                                                    <Input
                                                        {...field}
                                                        placeholder="Industry or Type"
                                                        className="bg-transparent border transition-all rounded-md"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="tags"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-medium flex items-center gap-2">
                                                    <TagIcon className="w-3 h-3" />
                                                    Tags
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Warm Lead, Priority (comma separated)"
                                                        className="bg-transparent border transition-all rounded-md"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />

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
