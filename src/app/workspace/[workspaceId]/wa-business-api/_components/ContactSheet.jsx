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
    DialogTitle
} from "@/components/ui/dialog";
import { Loader2, User, Phone, Mail, Tag, Palette, Folder, Sparkles } from 'lucide-react';
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
        category: '',
        tags: [],
        tagsStr: '',
        color: '#3b82f6',
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
                category: activeContact.category || '',
                tags: activeContact.tags || [],
                tagsStr: activeContact.tags?.join(', ') || '',
                color: activeContact.color || '#3b82f6',
                info: activeContact.info || ''
            });
        } else {
            setContactForm({
                name: '',
                phone: '',
                email: '',
                categoryId: '',
                category: '',
                tags: [],
                tagsStr: '',
                color: '#3b82f6',
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
            tags: contactForm.tagsStr.split(',').map(t => t.trim()).filter(Boolean),
            id: activeContact?.id,
            userId,
            workspaceId
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-card border-border shadow-2xl">
                <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                    {/* Left Branding/Info Panel */}
                    <div className="hidden md:flex flex-col justify-between w-1/3 bg-muted/20 p-8 border-r border-border/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />

                        <div className="relative z-10">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 shadow-inner">
                                <Sparkles className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Contact Node</h3>
                            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                                Define the identity and categorization attributes for this contact to enable seamless CRM filtering, intelligent grouping, and automated message routing.
                            </p>
                        </div>

                        <div className="space-y-4 relative z-10 mt-12">
                            <div className="p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-white/5 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[10px] font-bold  text-muted-foreground">Engine Scope</span>
                                </div>
                                <p className="text-xs text-foreground/80 font-medium leading-tight">Data will instantly sync with active WhatsApp campaigns and broadcast lists.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Form Panel */}
                    <div className="flex-1 flex flex-col p-8 overflow-y-auto">
                        <DialogHeader className="pb-6">
                            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                                {activeContact ? 'Edit Identity' : 'New Identity'}
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Configure the primary details for this audience member.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSave} className="flex-1 flex flex-col gap-8">

                            {/* Section: Basic Details */}
                            <div className="space-y-5">
                                <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                                    <div className="p-1 rounded-md bg-primary/10"><User className="w-3.5 h-3.5 text-primary" /></div>
                                    <h4 className="text-sm font-semibold tracking-tight text-foreground/90">Basic Information</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className=" text-muted-foreground">Full Name</Label>
                                        <Input
                                            placeholder=""
                                            value={contactForm.name}
                                            onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                                            required
                                            className="bg-muted/10  border focus-visible:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className=" text-muted-foreground">Mobile Number</Label>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-sm bg-background border shadow-sm group-focus-within:border-primary/30 transition-colors">
                                                <Phone className="w-3 h-3 text-muted-foreground/70" />
                                            </div>
                                            <Input
                                                placeholder="+123456789"
                                                value={contactForm.phone}
                                                onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                                                required
                                                className="bg-muted/10  pl-11 font-mono text-sm border focus-visible:ring-primary/20 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className=" text-muted-foreground">Email Address</Label>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-sm bg-background border shadow-sm group-focus-within:border-primary/30 transition-colors">
                                                <Mail className="w-3 h-3 text-muted-foreground/70" />
                                            </div>
                                            <Input
                                                placeholder="user@cloud.com"
                                                value={contactForm.email}
                                                onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                                                className="bg-muted/10  pl-11 border focus-visible:ring-primary/20 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Categorization */}
                            <div className="space-y-5">
                                <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                                    <div className="p-1 rounded-md bg-emerald-500/10"><Folder className="w-3.5 h-3.5 text-emerald-500" /></div>
                                    <h4 className="text-sm font-semibold tracking-tight text-foreground/90">Meta & Classification</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label className=" text-muted-foreground">Text Category</Label>
                                        <Input
                                            placeholder="e.g. VIP, Partner, Supplier"
                                            value={contactForm.category}
                                            onChange={e => setContactForm({ ...contactForm, category: e.target.value })}
                                            className="bg-muted/10  border focus-visible:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className=" text-muted-foreground">Brand Color</Label>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-sm bg-background border shadow-sm group-focus-within:border-primary/30 transition-colors pointer-events-none">
                                                <Palette className="w-3 h-3 text-muted-foreground/70" />
                                            </div>
                                            <Input
                                                type="color"
                                                value={contactForm.color}
                                                onChange={e => setContactForm({ ...contactForm, color: e.target.value })}
                                                className=" pl-11 w-full p-1 cursor-pointer bg-muted/10 border focus-visible:ring-primary/20 rounded-md transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className=" text-muted-foreground">Tags (Comma Separated)</Label>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-sm bg-background border shadow-sm group-focus-within:border-primary/30 transition-colors">
                                                <Tag className="w-3 h-3 text-muted-foreground/70" />
                                            </div>
                                            <Input
                                                placeholder="vip, lead, internal..."
                                                value={contactForm.tagsStr}
                                                onChange={e => setContactForm({ ...contactForm, tagsStr: e.target.value })}
                                                className="bg-muted/10  pl-11 border focus-visible:ring-primary/20 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Logical Association */}
                            <div className="space-y-3">
                                <Label className=" text-muted-foreground mb-1 block">Visual Board Category</Label>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                    {categories.map(cat => (
                                        <div
                                            key={cat.id}
                                            onClick={() => setContactForm({ ...contactForm, categoryId: contactForm.categoryId === cat.id ? '' : cat.id })}
                                            className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${contactForm.categoryId === cat.id ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/20' : 'hover:bg-muted/40 border-border/40 opacity-70 hover:opacity-100 hover:border-border/80'}`}
                                        >
                                            <div className="w-3 h-3 rounded-full shadow-sm ring-1 ring-black/10 dark:ring-white/10" style={{ backgroundColor: cat.color }} />
                                            <span className="text-[12px] font-semibold truncate text-foreground/90">{cat.name}</span>
                                        </div>
                                    ))}
                                    {categories.length === 0 && (
                                        <div className="col-span-full py-6 text-center border rounded-xl border-dashed bg-muted/5 text-muted-foreground text-xs italic">
                                            No visual categories defined in workspace.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 mt-auto">
                                <Button type="outline" disabled={isSaving} className="w-full h-12 text-sm font-bold  shadow-xl shadow-primary/10 hover:shadow-primary/20 transition-all gap-2 rounded-lg">
                                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {activeContact ? (isSaving ? 'Updating Node...' : 'Save Changes') : (isSaving ? 'Initializing...' : 'Initialize Contact Node')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
