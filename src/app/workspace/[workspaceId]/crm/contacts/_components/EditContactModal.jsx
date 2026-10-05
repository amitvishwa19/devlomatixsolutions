'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, Building2, Phone, Mail, Tag, MapPin, Briefcase } from 'lucide-react';
import { toast } from "sonner";
import { updateCrmContactAction } from "../../_actions/contact-actions";
import { getAccountsAction } from "../../_actions/account-actions";

export default function EditContactModal({ isOpen, onClose, contact, workspaceId, onContactUpdated }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [title, setTitle] = useState('');
    const [type, setType] = useState('LEAD');
    const [accountId, setAccountId] = useState('NONE');
    const [address, setAddress] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);

    const [accounts, setAccounts] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen || !contact) return;

        setName(contact.name || '');
        setPhone(contact.phone || '');
        setEmail(contact.email || '');
        setTitle(contact.title || '');
        setType(contact.type || 'LEAD');
        setAccountId(contact.accountId || 'NONE');
        setAddress(contact.address || '');
        setTags(contact.tags || []);

        async function fetchAccounts() {
            try {
                const res = await getAccountsAction(workspaceId);
                if (res.success) setAccounts(res.data);
            } catch (e) {
                console.error("Failed to load accounts:", e);
            }
        }
        fetchAccounts();
    }, [isOpen, contact, workspaceId]);

    const handleAddTag = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const trimmed = tagInput.trim().replace(/^,+|,+$/g, '');
            if (trimmed && !tags.includes(trimmed)) {
                setTags([...tags, trimmed]);
                setTagInput('');
            }
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Contact name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await updateCrmContactAction(workspaceId, contact.id, {
                name: name.trim(),
                phone: phone.trim(),
                email: email.trim() || undefined,
                title: title.trim() || undefined,
                type,
                accountId: accountId === 'NONE' ? null : accountId,
                address: address.trim() || undefined,
                tags
            });

            if (res.success) {
                toast.success("Contact updated successfully!");
                onClose();
                if (onContactUpdated) onContactUpdated(res.data);
            } else {
                toast.error(res.error || "Failed to update contact");
            }
        } catch (error) {
            console.error("Update contact error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <User className="w-5 h-5" />
                        </div>
                        <span>Edit Contact</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Update contact record details and organizational association.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">
                            Full Name <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="pl-9 h-9 text-xs"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Phone / WhatsApp</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="pl-9 h-9 text-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-9 h-9 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Job Title & Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Job Title / Role</Label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="pl-9 h-9 text-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Contact Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LEAD">Lead</SelectItem>
                                    <SelectItem value="CLIENT">Client</SelectItem>
                                    <SelectItem value="CONTACT">Contact</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Company Linkage */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Company / Organization</Label>
                        <Select value={accountId} onValueChange={setAccountId}>
                            <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">— Independent (None) —</SelectItem>
                                {accounts.map(acc => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        {acc.name} {acc.industry ? `(${acc.industry})` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Address */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Location</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="pl-9 h-9 text-xs"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Tags</Label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Type and press enter"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                className="pl-9 h-9 text-xs"
                            />
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {tags.map(t => (
                                    <span
                                        key={t}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-[11px] font-medium"
                                    >
                                        #{t}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(t)}
                                            className="hover:text-destructive"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={isSubmitting} className="font-semibold">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
