'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Users,
    Plus,
    Building2,
    Mail,
    Phone,
    FileText,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { createCustomer } from '../_actions/payflow-actions';

export function AddCustomerModal({ open, onOpenChange, workspaceId, onCustomerAdded }) {
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [taxId, setTaxId] = useState('');
    const [currency, setCurrency] = useState('INR');

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!name.trim()) return toast.error("Please enter company / customer name");
        if (!email.trim()) return toast.error("Please enter primary billing email");

        setCreating(true);
        const res = await createCustomer(workspaceId, {
            name,
            email,
            phone,
            taxId,
            currency
        });

        if (res.success) {
            toast.success(`Billing customer profile created for ${name}!`);
            onOpenChange(false);
            setName('');
            setEmail('');
            setPhone('');
            setTaxId('');
            if (onCustomerAdded) onCustomerAdded(res.data);
        } else {
            toast.error(res.error || "Failed to add customer");
        }
        setCreating(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border/80 p-0 overflow-hidden flex flex-col max-h-[85vh]">
                <DialogHeader className="p-4 border-b border-border/60 bg-secondary/15">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                            <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Add Billing Customer (INR ₹)
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Register a client company profile for automated invoicing and billing.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleCreate} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Company / Client Name</Label>
                        <Input
                            placeholder="e.g. Apex Dynamics Private Limited"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-8 text-xs bg-secondary/30 border-border/80"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Billing Email</Label>
                            <Input
                                type="email"
                                placeholder="finance@apexdynamics.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-8 text-xs bg-secondary/30 border-border/80"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">WhatsApp / Phone</Label>
                            <Input
                                placeholder="+91 98200 12345"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="h-8 text-xs bg-secondary/30 border-border/80"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">GSTIN / Tax ID</Label>
                            <Input
                                placeholder="29AABCB1234F1Z0"
                                value={taxId}
                                onChange={(e) => setTaxId(e.target.value)}
                                className="h-8 text-xs bg-secondary/30 border-border/80"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Default Currency</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                                    <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                                    <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                                    <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                        <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={creating} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Customer'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
