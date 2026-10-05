'use client';

import React, { useState } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Receipt,
    Plus,
    Trash2,
    MessageCircle,
    DollarSign,
    Sparkles,
    Loader2,
    Calendar,
    Send,
    FileText,
    CheckCircle2
} from 'lucide-react';
import { toast } from "sonner";
import { generateDealQuotationAction, convertDealToPayFlowInvoiceAction } from '../_actions/crm-invoice-actions';

export default function GenerateQuotationModal({ isOpen, onClose, deal, workspaceId, onDocumentCreated }) {
    if (!deal) return null;

    const [clientName, setClientName] = useState(deal.contact?.name || deal.account?.name || '');
    const [clientEmail, setClientEmail] = useState(deal.contact?.email || '');
    const [clientPhone, setClientPhone] = useState(deal.contact?.phone || '');
    const [companyName, setCompanyName] = useState(deal.account?.name || '');

    const [taxRate, setTaxRate] = useState(18);
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState('Payment Schedule: 50% advance upon contract sign-off, 50% upon final delivery. Valid for 14 days.');
    const [sendWhatsAppOnCreate, setSendWhatsAppOnCreate] = useState(true);

    const [items, setItems] = useState([
        {
            desc: `${deal.title} - Scope of Work & Deliverables`,
            qty: 1,
            rate: parseFloat(deal.value) || 50000
        }
    ]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionType, setActionType] = useState('QUOTE'); // 'QUOTE' or 'INVOICE'

    const handleAddItem = () => {
        setItems([...items, { desc: '', qty: 1, rate: 0 }]);
    };

    const handleRemoveItem = (index) => {
        if (items.length <= 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const handleUpdateItem = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = field === 'qty' || field === 'rate' ? parseFloat(value) || 0 : value;
        setItems(updated);
    };

    // Calculate Totals
    const subtotal = items.reduce((acc, item) => acc + (Number(item.qty || 1) * Number(item.rate || 0)), 0);
    const taxableAmount = Math.max(0, subtotal - Number(discount || 0));
    const taxAmount = taxableAmount * (Number(taxRate || 0) / 100);
    const grandTotal = taxableAmount + taxAmount;

    const handleSubmit = async (type) => {
        if (!clientName.trim()) {
            toast.error("Client name is required.");
            return;
        }

        try {
            setIsSubmitting(true);
            setActionType(type);

            if (type === 'QUOTE') {
                const res = await generateDealQuotationAction(workspaceId, deal.id, {
                    clientName,
                    clientEmail,
                    clientPhone,
                    companyName,
                    items,
                    taxRate,
                    discount,
                    notes
                });

                if (res.success) {
                    toast.success(`Quotation ${res.data.id} created successfully!`);
                    if (onDocumentCreated) onDocumentCreated(res.data);
                    onClose();
                } else {
                    toast.error(res.error || "Failed to create quotation");
                }
            } else {
                // 1-Click PayFlow Invoice
                const res = await convertDealToPayFlowInvoiceAction(workspaceId, deal.id, {
                    clientName,
                    clientEmail,
                    clientPhone,
                    items,
                    taxRate,
                    notes
                });

                if (res.success) {
                    toast.success(`PayFlow Invoice ${res.data.id} generated and issued!`);
                    if (onDocumentCreated) onDocumentCreated(res.data);
                    onClose();
                } else {
                    toast.error(res.error || "Failed to generate PayFlow invoice");
                }
            }
        } catch (error) {
            console.error("Quotation creation error:", error);
            toast.error("Error creating billing document");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 bg-card border-border shadow-2xl">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-xl font-black text-foreground flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                            <Receipt className="w-4 h-4" />
                        </div>
                        <span>1-Click Quotation & PayFlow Invoicing</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Generate official commercial estimates and instant PayFlow invoices for <strong>{deal.title}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 mt-2">
                    {/* Client & Billing Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-muted/20 border border-border/70">
                        <div className="space-y-1">
                            <Label className="text-xs font-medium">Billed To (Client Name) *</Label>
                            <Input
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="h-8 text-xs bg-background"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-medium">Company Name</Label>
                            <Input
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="h-8 text-xs bg-background"
                                placeholder="Organization Ltd"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-medium">Email</Label>
                            <Input
                                type="email"
                                value={clientEmail}
                                onChange={(e) => setClientEmail(e.target.value)}
                                className="h-8 text-xs bg-background"
                                placeholder="billing@client.com"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-medium">WhatsApp Phone</Label>
                            <Input
                                value={clientPhone}
                                onChange={(e) => setClientPhone(e.target.value)}
                                className="h-8 text-xs bg-background"
                                placeholder="+91 98201 22931"
                            />
                        </div>
                    </div>

                    {/* Scope Items Table */}
                    <div className="space-y-2.5 p-4 rounded-2xl bg-muted/20 border border-border/70">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Line Items & Scope Breakdown
                            </Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddItem}
                                className="h-7 text-xs gap-1 bg-background"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Item</span>
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <Input
                                        placeholder="Deliverable Description (e.g., Q3 Cloud Migration)..."
                                        value={item.desc}
                                        onChange={(e) => handleUpdateItem(idx, 'desc', e.target.value)}
                                        className="h-8 text-xs flex-1 bg-background"
                                    />
                                    <Input
                                        type="number"
                                        min="1"
                                        placeholder="Qty"
                                        value={item.qty}
                                        onChange={(e) => handleUpdateItem(idx, 'qty', e.target.value)}
                                        className="h-8 text-xs w-16 text-center font-bold bg-background"
                                    />
                                    <div className="relative w-28">
                                        <span className="absolute left-2 top-2 text-xs text-muted-foreground font-bold">₹</span>
                                        <Input
                                            type="number"
                                            placeholder="Rate"
                                            value={item.rate}
                                            onChange={(e) => handleUpdateItem(idx, 'rate', e.target.value)}
                                            className="h-8 text-xs pl-5 font-bold bg-background text-right"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveItem(idx)}
                                        disabled={items.length <= 1}
                                        className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tax & Discount Configuration */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/20 border border-border/70">
                        <div className="space-y-1">
                            <Label className="text-xs font-medium">GST / Tax Rate (%)</Label>
                            <Select value={taxRate.toString()} onValueChange={(val) => setTaxRate(Number(val))}>
                                <SelectTrigger className="h-8 text-xs bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">0% (Tax Exempt)</SelectItem>
                                    <SelectItem value="5">5% GST</SelectItem>
                                    <SelectItem value="12">12% GST</SelectItem>
                                    <SelectItem value="18">18% GST (Standard)</SelectItem>
                                    <SelectItem value="28">28% GST</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-medium">Discount (₹)</Label>
                            <Input
                                type="number"
                                min="0"
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)}
                                className="h-8 text-xs bg-background text-right font-bold"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-medium">Grand Total (₹)</Label>
                            <div className="h-8 px-3 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-end text-xs font-black text-primary font-mono">
                                ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>

                    {/* Terms & Notes */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Payment Terms & Acceptance Notes</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="text-xs bg-muted/20"
                        />
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-border/70">
                    <Button type="button" variant="outline" onClick={onClose} className="h-9 text-xs w-full sm:w-auto">
                        Cancel
                    </Button>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleSubmit('QUOTE')}
                            disabled={isSubmitting}
                            className="h-9 text-xs font-semibold gap-1.5 flex-1 sm:flex-initial shadow-xs"
                        >
                            {isSubmitting && actionType === 'QUOTE' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5 text-blue-500" />}
                            <span>Save Quotation</span>
                        </Button>

                        <Button
                            type="button"
                            onClick={() => handleSubmit('INVOICE')}
                            disabled={isSubmitting}
                            className="h-9 text-xs font-bold gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 flex-1 sm:flex-initial shadow-sm"
                        >
                            {isSubmitting && actionType === 'INVOICE' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Receipt className="w-3.5 h-3.5" />}
                            <span>Issue PayFlow Invoice</span>
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
