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
import { Loader2, Tag, X } from 'lucide-react';
import { useAction } from '@/hooks/use-action';
import { saveContact } from '../_actions/save-contact';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function ContactDialog({
    isOpen,
    onOpenChange,
    activeContact,
    categories,
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
        info: ''
    });

    const [tagInput, setTagInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const { execute: executeSave } = useAction(saveContact, {
        onSuccess: () => {
            toast.success(activeContact ? "Contact updated" : "Contact created", { id: 'save-contact' });
            setIsSaving(false);
            onSave();
            onOpenChange(false);
        },
        onError: (err) => {
            const errorMsg = typeof err === 'string' ? err : (err?.message || "Failed to save contact");
            toast.error(errorMsg, { id: 'save-contact' });
            setIsSaving(false);
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
                info: activeContact.info || ''
            });
        } else {
            setContactForm({
                name: '',
                phone: '',
                email: '',
                category: '',
                tags: [],
                info: ''
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
        e.preventDefault();
        setIsSaving(true);
        toast.loading(activeContact ? "Updating contact..." : "Creating contact...", { id: 'save-contact' });
        executeSave({
            ...contactForm,
            categoryId: contactForm.category, // Map 'category' back to 'categoryId' for the existing server action
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
                            <Label className="text-xs font-bold   text-muted-foreground/60 px-1">Identity</Label>
                            <Input
                                placeholder="Full Name"
                                value={contactForm.name}
                                onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                                required
                                className="bg-muted/20 border focus:border-primary/40 transition-colors"
                            />
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
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground/60 px-1">Email (Optional)</Label>
                                <Input
                                    placeholder="user@example.com"
                                    value={contactForm.email}
                                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                                    className="bg-muted/20 border focus:border-primary/40 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-bold   text-muted-foreground/60 px-1">Tags</Label>
                        <div className="flex flex-wrap gap-2 p-2 min-h-[44px] bg-muted/10 rounded-lg border border-border/40 focus-within:border-primary/50 transition-colors">
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
                                className="flex-1bg-muted/20  border-none outline-none text-sm min-w-[120px] py-1"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-bold   text-muted-foreground/60 px-1 flex items-center gap-2">
                            Categorization
                            {contactForm.category && (
                                <span className="text-[9px] text-primary lowercase font-medium bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Selected</span>
                            )}
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                            {categories.map(cat => (
                                <div
                                    key={cat.id}
                                    onClick={() => setContactForm({ ...contactForm, category: contactForm.category === cat.id ? '' : cat.id })}
                                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${contactForm.category === cat.id ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/20' : 'hover:bg-muted/30 border-border/40 opacity-70 hover:opacity-100'}`}
                                >
                                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                                    <span className="text-[11px] font-bold truncate">{cat.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Raw Details Section (only for editing) */}
                    {activeContact?.info?.raw && (
                        <div className="space-y-3 mt-4 p-4 rounded-xl bg-muted/20 border border-border/40">
                            <Label className="text-xs font-bold   text-primary/70">Raw Intelligence</Label>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                {Object.entries(activeContact.info.raw).map(([key, value]) => {
                                    if (typeof value === 'object' || Array.isArray(value) || !value) return null;
                                    if (['id', 'name', 'phone', 'email', 'address'].includes(key)) return null;
                                    return (
                                        <div key={key} className="flex flex-col gap-0.5 border-b border-border/30 pb-2 last:border-0">
                                            <span className="text-[9px] text-muted-foreground  font-semibold">{key.replace(/_/g, ' ')}</span>
                                            <span className="text-xs text-foreground/80 font-medium">{String(value)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </form>

                <DialogFooter className="p-6 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 border border-border/40 hover:bg-muted/50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-[2] shadow-lg shadow-primary/20 gap-2 font-bold"
                    >
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {activeContact ? (isSaving ? 'Updating...' : 'Save Changes') : (isSaving ? 'Initializing...' : 'Add Contact')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
