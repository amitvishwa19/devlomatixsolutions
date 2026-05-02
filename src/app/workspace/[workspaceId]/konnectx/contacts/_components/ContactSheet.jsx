'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet";
import { Loader2 } from 'lucide-react';
import { useAction } from '@/hooks/use-action';
import { saveContact } from '../_actions/save-contact';
import { toast } from 'sonner';

export default function ContactSheet({ 
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
        categoryId: '',
        tags: [],
        info: ''
    });

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
                categoryId: activeContact.categoryId || '',
                tags: activeContact.tags || [],
                info: activeContact.info || ''
            });
        } else {
            setContactForm({
                name: '',
                phone: '',
                email: '',
                categoryId: '',
                tags: [],
                info: ''
            });
        }
    }, [activeContact, isOpen]);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        toast.loading(activeContact ? "Updating contact..." : "Creating contact...", { id: 'save-contact' });
        executeSave({ 
            ...contactForm, 
            id: activeContact?.id,
            userId, 
            workspaceId 
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-6">
                <SheetHeader className="pb-8">
                    <SheetTitle className="text-2xl font-bold tracking-tight">
                        {activeContact ? 'Edit Identity' : 'Secure Entry'}
                    </SheetTitle>
                    <SheetDescription>Configure primary contact details.</SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSave} className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Identity</Label>
                            <Input 
                                placeholder="Full Name" 
                                value={contactForm.name} 
                                onChange={e => setContactForm({ ...contactForm, name: e.target.value })} 
                                required 
                                className="bg-muted/10 h-11" 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Mobile</Label>
                                <Input 
                                    placeholder="+123456789" 
                                    value={contactForm.phone} 
                                    onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} 
                                    required 
                                    className="bg-muted/10 h-11 font-mono text-xs" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Email</Label>
                                <Input 
                                    placeholder="user@cloud.com" 
                                    value={contactForm.email} 
                                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })} 
                                    className="bg-muted/10 h-11" 
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Categorization</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {categories.map(cat => (
                                <div 
                                    key={cat.id} 
                                    onClick={() => setContactForm({ ...contactForm, categoryId: contactForm.categoryId === cat.id ? '' : cat.id })} 
                                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${contactForm.categoryId === cat.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/30 border-border/40 opacity-60'}`}
                                >
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                    <span className="text-[11px] font-bold truncate">{cat.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Raw Details Section */}
                    {activeContact?.info?.raw && (
                        <div className="space-y-3 mt-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Raw Intelligence</Label>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {Object.entries(activeContact.info.raw).map(([key, value]) => {
                                    if (typeof value === 'object' || Array.isArray(value) || !value) return null;
                                    if (['id', 'name', 'phone', 'email', 'address'].includes(key)) return null;
                                    return (
                                        <div key={key} className="flex flex-col gap-0.5 border-b border-white/5 pb-2 last:border-0">
                                            <span className="text-[10px] text-muted-foreground uppercase font-medium">{key.replace(/_/g, ' ')}</span>
                                            <span className="text-xs text-zinc-200 font-semibold">{String(value)}</span>
                                        </div>
                                    );
                                })}
                                {/* Handle complex objects like opening hours or reviews if needed */}
                                {activeContact.info.raw.rating && (
                                    <div className="flex flex-col gap-0.5 border-b border-white/5 pb-2">
                                        <span className="text-[10px] text-muted-foreground uppercase font-medium">Rating</span>
                                        <span className="text-xs text-amber-400 font-bold">★ {activeContact.info.raw.rating} ({activeContact.info.raw.reviewsCount || 0} reviews)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <Button type="submit" disabled={isSaving} className="px-8 shadow-lg shadow-primary/20 gap-2">
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {activeContact ? (isSaving ? 'Updating...' : 'Save Changes') : (isSaving ? 'Initializing...' : 'Initialize Contact')}
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}
