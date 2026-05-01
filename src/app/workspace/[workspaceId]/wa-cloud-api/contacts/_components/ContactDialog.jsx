'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Loader2, Tag, X, Users } from 'lucide-react';
import { useAction } from '@/hooks/use-action';
import { saveContact } from '../_actions/save-contact';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function ContactDialog({
    isOpen,
    onOpenChange,
    activeContact,
    categories,
    groups = [],
    userId,
    workspaceId,
    onSave
}) {
    const [contactForm, setContactForm] = useState({
        name: '',
        phone: '',
        email: '',
        category: '',
        tags: [],
        info: '',
        type: 'CONTACT',
        selectedGroups: [] // Stores objects {id, name}
    });

    const [tagInput, setTagInput] = useState('');

    const { execute: executeSave, isLoading, fieldErrors } = useAction(saveContact, {
        onSuccess: () => {
            toast.success(activeContact ? "Contact updated" : "Contact created", { id: 'save-contact' });
            onSave();
            onOpenChange(false);
        },
        onError: (err) => {
            const errorMsg = typeof err === 'string' ? err : (err?.message || "Failed to save contact");
            toast.error(errorMsg, { id: 'save-contact' });
        }
    });

    useEffect(() => {
        if (activeContact) {
            setContactForm({
                name: activeContact.name,
                phone: activeContact.phone,
                email: activeContact.email || '',
                category: activeContact.category || '',
                tags: activeContact.tags || [],
                info: activeContact.info || '',
                type: activeContact.type || 'CONTACT',
                selectedGroups: activeContact.groups || []
            });
        } else {
            setContactForm({
                name: '',
                phone: '',
                email: '',
                category: '',
                tags: [],
                info: '',
                type: 'CONTACT',
                selectedGroups: []
            });
        }
        setTagInput('');
    }, [activeContact, isOpen]);

    const handleAddTag = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tag = tagInput.trim().replace(',', '');
            if (tag && !contactForm.tags.includes(tag)) {
                setContactForm({ ...contactForm, tags: [...contactForm.tags, tag] });
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setContactForm({ ...contactForm, tags: contactForm.tags.filter(t => t !== tagToRemove) });
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (isLoading) return;

        toast.loading(activeContact ? "Updating contact..." : "Creating contact...", { id: 'save-contact' });
        
        executeSave({
            ...contactForm,
            groupIds: contactForm.selectedGroups.map(g => g.id),
            id: activeContact?.id,
            userId,
            workspaceId
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col p-0 bg-card border">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-2xl font-bold tracking-tight">
                        {activeContact ? 'Edit Contact' : 'New Contact'}
                    </DialogTitle>
                    <DialogDescription>Configure primary contact details and categorization.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 pt-2 space-y-6 custom-scrollbar">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground/60 px-1">Identity</Label>
                            <Input
                                placeholder="Full Name"
                                value={contactForm.name}
                                onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                                required
                                className="bg-muted/20 border focus:border-primary/40 transition-colors"
                            />
                            {fieldErrors?.name && <p className="text-[10px] text-destructive px-1">{fieldErrors.name[0]}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground/60 px-1">Mobile</Label>
                                <Input
                                    placeholder="+123456789"
                                    value={contactForm.phone}
                                    onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                                    required
                                    className="bg-muted/20 border focus:border-primary/40 transition-colors"
                                />
                                {fieldErrors?.phone && <p className="text-[10px] text-destructive px-1">{fieldErrors.phone[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground/60 px-1">Email (Optional)</Label>
                                <Input
                                    placeholder="user@example.com"
                                    value={contactForm.email}
                                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                                    className="bg-muted/20 border focus:border-primary/40 transition-colors"
                                />
                                {fieldErrors?.email && <p className="text-[10px] text-destructive px-1">{fieldErrors.email[0]}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-bold text-muted-foreground/60 px-1">Broadcast Lists (Groups)</Label>
                        <MultiSelect
                            options={groups}
                            selected={contactForm.selectedGroups}
                            onChange={(val) => setContactForm({ ...contactForm, selectedGroups: val })}
                            placeholder="Add to broadcast lists..."
                            className="bg-muted/20 border border-border/40"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-bold text-muted-foreground/60 px-1">Tags</Label>
                        <div className="flex flex-wrap gap-2 p-2 bg-muted/20 rounded-lg border focus-within:border-primary/40 transition-colors">
                            {contactForm.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="gap-1 pl-2 pr-1 py-1 bg-primary/10 text-primary border-none hover:bg-primary/20">
                                    {tag}
                                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                                </Badge>
                            ))}
                            <input
                                placeholder={contactForm.tags.length === 0 ? "Add tags (press enter or comma)" : ""}
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px] "
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-bold text-muted-foreground/60 px-1">Classification</Label>
                        <div className="flex gap-2">
                            {['CONTACT', 'CLIENT', 'LEAD'].map(type => (
                                <Button
                                    key={type}
                                    type="button"
                                    variant={contactForm.type === type ? 'default' : 'outline'}
                                    onClick={() => setContactForm({ ...contactForm, type })}
                                    className="flex-1 h-9 text-[10px] font-bold"
                                >
                                    {type}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <Label className="text-xs font-bold text-muted-foreground/60">Category</Label>
                        </div>
                        
                        <div className="space-y-2">
                            <Select 
                                value={categories.find(c => c.name === contactForm.category)?.name || ""} 
                                onValueChange={(val) => setContactForm({ ...contactForm, category: val })}
                            >
                                <SelectTrigger className="bg-muted/20 border">
                                    <SelectValue placeholder="Select existing category..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.name}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                                {cat.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Tag className="w-3 h-3 text-muted-foreground/40" />
                                </div>
                                <Input
                                    placeholder="Or type a new category..."
                                    value={contactForm.category}
                                    onChange={e => setContactForm({ ...contactForm, category: e.target.value })}
                                    className="pl-9 bg-muted/20 border focus:border-primary/40 transition-colors h-10"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Raw Details Section (only for editing) */}
                    {activeContact?.info?.raw && (
                        <div className="space-y-3 mt-4 p-4 rounded-xl bg-muted/20 border border-border/40">
                            <Label className="text-xs font-bold text-primary/70">Raw Intelligence</Label>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                {Object.entries(activeContact.info.raw).map(([key, value]) => {
                                    if (typeof value === 'object' || Array.isArray(value) || !value) return null;
                                    if (['id', 'name', 'phone', 'email', 'address'].includes(key)) return null;
                                    return (
                                        <div key={key} className="flex flex-col gap-0.5 border-b border-border/30 pb-2 last:border-0">
                                            <span className="text-[9px] text-muted-foreground font-semibold">{key.replace(/_/g, ' ')}</span>
                                            <span className="text-xs text-foreground/80 font-medium">{String(value)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <button type="submit" className="hidden" />
                </form>

                <DialogFooter className="p-6 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="hover:bg-muted/50"
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isLoading}
                        className="shadow-lg shadow-primary/20 gap-2 font-bold"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {activeContact ? (isLoading ? 'Updating...' : 'Save Changes') : (isLoading ? 'Initializing...' : 'Add Contact')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
