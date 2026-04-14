'use client';

import React from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function ContactSheet({
    open,
    onOpenChange,
    formData,
    setFormData,
    onSave,
    handleInfoChange,
    CONTACT_TYPES,
    editingContact,
    categories
}) {
    const isEditing = !!editingContact;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {!isEditing && (
                <SheetTrigger asChild>
                    <Button className="bg-primary/90 hover:bg-primary  shadow-lg shadow-primary/20 transition-all active:scale-95">
                        <Plus className="w-3.5 h-3.5 mr-2" />
                        Add Contact
                    </Button>
                </SheetTrigger>
            )}
            <SheetContent side="right" className=" border-0  bg-transparent p-2 md:min-w-[620px]">
                <div className='border rounded-lg h-full bg-background/80 backdrop-blur-xl p-2 overflow-y-auto'>
                    <SheetHeader>
                        <SheetTitle className="text-xl ">
                            {isEditing ? 'Update Contact' : 'New Contact'}
                        </SheetTitle>
                        <SheetDescription className={`text-xs ${isEditing ? 'text-emerald-500/70' : 'text-muted-foreground'}`}>
                            {isEditing
                                ? `Modify vault record for identification ID: ${editingContact?.id?.slice(-8)}`
                                : 'Add a new business contact to your workspace vault.'
                            }
                        </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="h-[85vh] pr-4 mt-4">
                        <form onSubmit={onSave} className="space-y-4 p-2">
                            {/* Primary Information */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Primary Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                            {isEditing ? 'Legal Name' : 'Full Name'}
                                        </Label>
                                        <Input
                                            required
                                            placeholder="John Doe"
                                            className="bg-muted/10 border-white/5 focus:ring-1 focus:ring-primary h-10 text-xs"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                            {isEditing ? 'Phone Index' : 'Phone Number'}
                                        </Label>
                                        <Input
                                            required
                                            placeholder="+1 (555) 000-0000"
                                            className="bg-muted/10 border-white/5 focus:ring-1 focus:ring-primary h-10 text-xs"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                            {isEditing ? 'Digital Email' : 'Email Address'}
                                        </Label>
                                        <Input
                                            type="email"
                                            placeholder="john@example.com"
                                            className="bg-muted/10 border-white/5 focus:ring-1 focus:ring-primary h-10 text-xs"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-white/5" />

                            {/* Professional Details */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Professional Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Company Name</Label>
                                        <Input
                                            placeholder="Acme Inc."
                                            className="bg-muted/10 border-white/5 focus:ring-1 focus:ring-primary h-10 text-xs"
                                            value={formData.info.company}
                                            onChange={e => handleInfoChange('company', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Job Title / Designation</Label>
                                        <Input
                                            placeholder="Project Manager"
                                            className="bg-muted/10 border-white/5 focus:ring-1 focus:ring-primary h-10 text-xs"
                                            value={formData.info.designation}
                                            onChange={e => handleInfoChange('designation', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-white/5" />

                            {/* Classification */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Classification</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                            {isEditing ? 'Entity Type' : 'Category Type'}
                                        </Label>
                                        <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                                            <SelectTrigger className="bg-muted/10 border-white/5 h-10 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10">
                                                {CONTACT_TYPES.map(t => (
                                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Lead Source</Label>
                                        <Select value={formData.info.source} onValueChange={v => handleInfoChange('source', v)}>
                                            <SelectTrigger className="bg-muted/10 border-white/5 h-10 text-xs">
                                                <SelectValue placeholder="Select Source" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10">
                                                {['Referral', 'Social Media', 'Website', 'Advertising', 'Direct', 'Other'].map(s => (
                                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Dynamic Category Selection */}
                                    {categories && categories.length > 0 && (
                                        <div className="space-y-2 col-span-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Business Category</Label>
                                            <Select
                                                value={formData.categoryId}
                                                onValueChange={v => {
                                                    setFormData({
                                                        ...formData,
                                                        categoryId: v
                                                    });
                                                }}
                                            >
                                                <SelectTrigger className="bg-muted/10 border-white/5 h-10 text-xs">
                                                    <SelectValue placeholder="Select a domain specific category" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-900 border-white/10">
                                                    {categories.map(cat => (
                                                        <SelectItem key={cat.id} value={cat.id}>
                                                            {cat.name}
                                                        </SelectItem>
                                                     ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Tag Management */}
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Search Tags</Label>
                                        <div className="space-y-2">
                                            <Input
                                                placeholder="Type a tag and press Enter..."
                                                className="bg-muted/10 border-white/5 focus:ring-1 focus:ring-primary h-10 text-xs"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const val = e.currentTarget.value.trim();
                                                        if (val && !formData.tags.includes(val)) {
                                                            setFormData({
                                                                ...formData,
                                                                tags: [...formData.tags, val]
                                                            });
                                                            e.currentTarget.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                            <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                                                {formData.tags?.map(tag => (
                                                    <div
                                                        key={tag}
                                                        className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight"
                                                    >
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({
                                                                ...formData,
                                                                tags: formData.tags.filter(t => t !== tag)
                                                            })}
                                                            className="hover:text-white transition-colors"
                                                        >
                                                            <X className="w-2.5 h-2.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {(!formData.tags || formData.tags.length === 0) && (
                                                    <span className="text-[9px] text-muted-foreground/40 italic">No tags assigned yet.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-white/5" />

                            {/* Location & Digital */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Location & Digital</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">City / Region</Label>
                                        <Input
                                            placeholder="New York"
                                            className="bg-muted/10 border-white/5 focus:ring-1 focus:ring-primary h-10 text-xs"
                                            value={formData.info.city}
                                            onChange={e => handleInfoChange('city', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Country</Label>
                                        <Input
                                            placeholder="USA"
                                            className="bg-muted/10 border-white/5 focus:ring-1 focus:ring-primary h-10 text-xs"
                                            value={formData.info.country}
                                            onChange={e => handleInfoChange('country', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Website</Label>
                                        <Input
                                            placeholder="https://example.com"
                                            className="bg-muted/10 border-white/5 focus:ring-1 focus:ring-primary h-10 text-xs"
                                            value={formData.info.website}
                                            onChange={e => handleInfoChange('website', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">LinkedIn Profile</Label>
                                        <Input
                                            placeholder="linkedin.com/in/username"
                                            className="bg-muted/10 border-white/5 focus:ring-1 focus:ring-primary h-10 text-xs"
                                            value={formData.info.linkedin}
                                            onChange={e => handleInfoChange('linkedin', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-white/5" />

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Internal Vault Notes</Label>
                                <Textarea
                                    rows={5}
                                    placeholder="Add any specific details or context about this contact..."
                                    className="bg-muted/10 border-white/5 focus:ring-1 focus:ring-primary min-h-[100px] text-xs resize-none"
                                    value={formData.info.notes}
                                    onChange={e => handleInfoChange('notes', e.target.value)}
                                />
                            </div>

                            <SheetFooter className="p-0 pt-4 pb-10">
                                <Button variant={'default'} type="submit" className={`w-full ${isEditing ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-primary'} h-10 `}>
                                    {isEditing ? 'Commit Changes' : 'Initialize Contact'}
                                </Button>
                            </SheetFooter>
                        </form>
                    </ScrollArea>
                </div>
            </SheetContent>
        </Sheet>
    );
}
