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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    FileText,
    Plus,
    Trash2,
    Send,
    IndianRupee,
    Percent,
    CreditCard,
    Loader2,
    Calculator
} from 'lucide-react';
import { toast } from 'sonner';
import { createInvoice } from '../_actions/payflow-actions';

export function CreateInvoiceModal({ open, onOpenChange, workspaceId, onInvoiceCreated }) {
    const [creating, setCreating] = useState(false);
    const [client, setClient] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [dueDate, setDueDate] = useState('In 14 Days');
    const [currency, setCurrency] = useState('INR (₹)');
    const [taxRate, setTaxRate] = useState('18');
    const [gateway, setGateway] = useState('Razorpay Smart Link');
    const [notes, setNotes] = useState('Thank you for choosing Devlomatix. Payment is due within 14 days via UPI/Bank Transfer.');
    const [sendWhatsApp, setSendWhatsApp] = useState(true);

    const [items, setItems] = useState([
        { id: 1, desc: 'Enterprise SaaS Workspace Retainer - Monthly', qty: 1, rate: 35000 }
    ]);

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), desc: '', qty: 1, rate: 0 }]);
    };

    const handleRemoveItem = (id) => {
        if (items.length <= 1) return toast.info("Invoice must have at least one line item");
        setItems(items.filter(i => i.id !== id));
    };

    const handleItemChange = (id, field, val) => {
        setItems(items.map(item => {
            if (item.id === id) {
                return { ...item, [field]: val };
            }
            return item;
        }));
    };

    const subtotal = items.reduce((acc, item) => acc + (Number(item.qty || 1) * Number(item.rate || 0)), 0);
    const taxAmount = subtotal * (Number(taxRate || 0) / 100);
    const total = subtotal + taxAmount;

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!client.trim()) return toast.error("Please enter a client name");
        if (!clientEmail.trim()) return toast.error("Please enter client billing email");

        setCreating(true);
        const res = await createInvoice(workspaceId, {
            client,
            clientEmail,
            dueDate,
            currency: 'INR',
            taxRate: Number(taxRate),
            gateway,
            notes,
            items: items.map(it => ({
                desc: it.desc || 'Service Item',
                qty: Number(it.qty) || 1,
                rate: Number(it.rate) || 0
            }))
        });

        if (res.success) {
            toast.success(
                sendWhatsApp
                    ? `Invoice ${res.data.id} created & link sent to WhatsApp + Email!`
                    : `Invoice ${res.data.id} created successfully!`
            );
            onOpenChange(false);
            setClient('');
            setClientEmail('');
            setItems([{ id: 1, desc: 'Enterprise SaaS Workspace Retainer - Monthly', qty: 1, rate: 35000 }]);
            if (onInvoiceCreated) onInvoiceCreated(res.data);
        } else {
            toast.error(res.error || "Failed to generate invoice");
        }
        setCreating(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl bg-card border-border/80 p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <DialogHeader className="p-4 border-b border-border/60 bg-secondary/15">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Generate Tax Invoice & Payment Link (INR ₹)
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Create an itemized GST invoice with instant automated collection triggers.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleCreate} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                    {/* Client Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Client / Business Name</Label>
                            <Input
                                placeholder="e.g. Acme Global Enterprises"
                                value={client}
                                onChange={(e) => setClient(e.target.value)}
                                className="h-8 text-xs bg-secondary/30 border-border/80"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Client Billing Email</Label>
                            <Input
                                type="email"
                                placeholder="billing@acme.com"
                                value={clientEmail}
                                onChange={(e) => setClientEmail(e.target.value)}
                                className="h-8 text-xs bg-secondary/30 border-border/80"
                                required
                            />
                        </div>
                    </div>

                    {/* Due Date, Terms & Currency */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Payment Terms / Due Date</Label>
                            <Select value={dueDate} onValueChange={setDueDate}>
                                <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                                    <SelectItem value="In 7 Days">Net 7 (In 7 Days)</SelectItem>
                                    <SelectItem value="In 14 Days">Net 14 (In 14 Days)</SelectItem>
                                    <SelectItem value="In 30 Days">Net 30 (In 30 Days)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Default Currency</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INR (₹)">INR (₹) - Indian Rupee</SelectItem>
                                    <SelectItem value="USD ($)">USD ($) - US Dollar</SelectItem>
                                    <SelectItem value="EUR (€)">EUR (€) - Euro</SelectItem>
                                    <SelectItem value="GBP (£)">GBP (£) - British Pound</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Payment Gateway</Label>
                            <Select value={gateway} onValueChange={setGateway}>
                                <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Razorpay Smart Link">Razorpay Smart Link (UPI/Cards)</SelectItem>
                                    <SelectItem value="Stripe Payment Link">Stripe Auto-Collect</SelectItem>
                                    <SelectItem value="Manual Bank Transfer">NEFT / RTGS / IMPS</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase">Itemized Line Items</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddItem}
                                className="h-6 text-[11px] border-border/80 gap-1"
                            >
                                <Plus className="w-3 h-3" /> Add Item
                            </Button>
                        </div>

                        <div className="space-y-2 bg-secondary/20 p-3 rounded-lg border border-border/40">
                            {items.map((item, idx) => (
                                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-6">
                                        <Input
                                            placeholder="Service or product description..."
                                            value={item.desc}
                                            onChange={(e) => handleItemChange(item.id, 'desc', e.target.value)}
                                            className="h-8 text-xs bg-card border-border/80"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            type="number"
                                            min="1"
                                            placeholder="Qty"
                                            value={item.qty}
                                            onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                                            className="h-8 text-xs bg-card border-border/80 text-center"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <Input
                                            type="number"
                                            min="0"
                                            step="1"
                                            placeholder="Rate (₹)"
                                            value={item.rate}
                                            onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                                            className="h-8 text-xs bg-card border-border/80 text-right"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="h-7 w-7 text-muted-foreground hover:text-rose-500"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals & Tax Calculation */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-3 rounded-lg bg-secondary/30 border border-border/40">
                        <div className="flex items-center gap-2">
                            <Label className="text-xs font-medium">GST / Tax (%):</Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={taxRate}
                                onChange={(e) => setTaxRate(e.target.value)}
                                className="h-7 w-16 text-xs bg-card border-border/80 text-center"
                            />
                        </div>

                        <div className="space-y-1 text-right w-full sm:w-auto">
                            <div className="text-xs text-muted-foreground">
                                Subtotal: <span className="font-mono text-foreground font-semibold">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {Number(taxRate) > 0 && (
                                <div className="text-xs text-muted-foreground">
                                    GST ({taxRate}%): <span className="font-mono text-foreground">₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="text-sm font-bold text-emerald-500">
                                Total Due: ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Payment Notes & Bank Instructions</Label>
                        <Textarea
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="text-xs bg-secondary/30 border-border/80 resize-none font-normal"
                        />
                    </div>
                </form>

                <div className="p-4 border-t border-border/60 bg-secondary/15 flex items-center justify-between gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleCreate}
                        disabled={creating}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
                    >
                        {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        Generate & Dispatch Invoice
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
