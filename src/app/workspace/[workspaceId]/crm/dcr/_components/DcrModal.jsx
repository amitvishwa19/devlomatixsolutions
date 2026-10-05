'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    PhoneCall,
    Car,
    MessageCircle,
    Video,
    DollarSign,
    Calendar,
    Clock,
    MapPin,
    User,
    Building2,
    CheckCircle2,
    Sparkles,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { createDcrRecordAction, updateDcrRecordAction } from '../../_actions/dcr-actions';

const CALL_TYPES = [
    { value: 'PHONE_CALL', label: 'Telephonic Call', icon: PhoneCall, color: 'text-blue-500' },
    { value: 'FIELD_VISIT', label: 'Field / On-Site Visit', icon: Car, color: 'text-amber-500' },
    { value: 'WHATSAPP', label: 'WhatsApp Interaction', icon: MessageCircle, color: 'text-emerald-500' },
    { value: 'VIDEO_DEMO', label: 'Video Demo / Meet', icon: Video, color: 'text-purple-500' },
    { value: 'PAYMENT_COLLECTION', label: 'Payment / Invoice Visit', icon: DollarSign, color: 'text-green-600' }
];

const OUTCOMES = [
    { value: 'HOT_LEAD', label: '🔥 Hot Lead / High Interest', badge: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
    { value: 'PROPOSAL_SENT', label: '📄 Proposal / Quote Requested', badge: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
    { value: 'FOLLOWUP_SCHEDULED', label: '⏰ Follow-up Scheduled', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    { value: 'WON', label: '🏆 Deal Closed / Won', badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    { value: 'GATEKEEPER', label: '⏳ Gatekeeper / Decision Maker Unavailable', badge: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
    { value: 'NOT_INTERESTED', label: '❌ Not Interested / Rejected', badge: 'bg-red-500/10 text-red-600 border-red-500/20' },
    { value: 'PAYMENT_COLLECTED', label: '💵 Payment Collected', badge: 'bg-green-500/10 text-green-600 border-green-500/20' }
];

export default function DcrModal({
    isOpen,
    onClose,
    workspaceId,
    editRecord = null,
    onSuccess
}) {
    const isEdit = !!editRecord;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        clientName: '',
        contactPerson: '',
        phone: '',
        email: '',
        callType: 'PHONE_CALL',
        callPurpose: 'Product Demo & Requirements Discussion',
        conversation: '',
        outcome: 'FOLLOWUP_SCHEDULED',
        nextFollowUpDate: '',
        nextFollowUpAction: 'Send updated quotation on WhatsApp and call back',
        dealValue: '',
        location: '',
        durationMinutes: 15,
        objections: '',
        createTask: true,
        callDate: new Date().toISOString().slice(0, 16)
    });

    useEffect(() => {
        if (editRecord) {
            setFormData({
                clientName: editRecord.clientName || '',
                contactPerson: editRecord.contactPerson || '',
                phone: editRecord.phone || '',
                email: editRecord.email || '',
                callType: editRecord.callType || 'PHONE_CALL',
                callPurpose: editRecord.callPurpose || '',
                conversation: editRecord.description || '',
                outcome: editRecord.outcome || 'FOLLOWUP_SCHEDULED',
                nextFollowUpDate: editRecord.nextFollowUpDate ? new Date(editRecord.nextFollowUpDate).toISOString().slice(0, 16) : '',
                nextFollowUpAction: editRecord.nextFollowUpAction || '',
                dealValue: editRecord.dealValue ? String(editRecord.dealValue) : '',
                location: editRecord.location || '',
                durationMinutes: editRecord.durationMinutes || 15,
                objections: editRecord.objections || '',
                createTask: false,
                callDate: editRecord.createdAt ? new Date(editRecord.createdAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
            });
        } else {
            setFormData({
                clientName: '',
                contactPerson: '',
                phone: '',
                email: '',
                callType: 'PHONE_CALL',
                callPurpose: 'Product Demo & Requirements Discussion',
                conversation: '',
                outcome: 'FOLLOWUP_SCHEDULED',
                nextFollowUpDate: '',
                nextFollowUpAction: 'Send updated quotation on WhatsApp and call back',
                dealValue: '',
                location: '',
                durationMinutes: 15,
                objections: '',
                createTask: true,
                callDate: new Date().toISOString().slice(0, 16)
            });
        }
    }, [editRecord, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.clientName.trim() && !formData.contactPerson.trim()) {
            toast.error("Please provide at least a Client/Company Name or Contact Person.");
            return;
        }

        if (!formData.conversation.trim()) {
            toast.error("Please enter the conversation summary or discussion points.");
            return;
        }

        setLoading(true);
        try {
            if (isEdit) {
                const res = await updateDcrRecordAction(workspaceId, editRecord.id, formData);
                if (res.success) {
                    toast.success("Activity record updated successfully!");
                    onSuccess?.(res.data);
                    onClose();
                } else {
                    toast.error(res.error || "Failed to update record");
                }
            } else {
                const res = await createDcrRecordAction(workspaceId, formData);
                if (res.success) {
                    toast.success("Sales activity logged successfully!");
                    onSuccess?.(res.data);
                    onClose();
                } else {
                    toast.error(res.error || "Failed to log activity record");
                }
            }
        } catch (err) {
            toast.error(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <PhoneCall className="w-4 h-4" />
                        </div>
                        {isEdit ? "Edit Activity Record" : "Log Sales Activity (Call / Visit)"}
                    </DialogTitle>
                    <DialogDescription>
                        Record your field visits, telephonic client conversations, objections, and scheduled follow-ups.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                    {/* Section 1: Interaction Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-muted/40 rounded-xl border border-border/60">
                        <div>
                            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1.5">
                                <Calendar className="w-3.5 h-3.5" /> Call / Visit Date & Time
                            </Label>
                            <Input
                                type="datetime-local"
                                value={formData.callDate}
                                onChange={(e) => setFormData({ ...formData, callDate: e.target.value })}
                                className="h-9 text-xs"
                                required
                            />
                        </div>

                        <div>
                            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1.5">
                                <PhoneCall className="w-3.5 h-3.5" /> Interaction Type
                            </Label>
                            <Select
                                value={formData.callType}
                                onValueChange={(val) => setFormData({ ...formData, callType: val })}
                            >
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CALL_TYPES.map((t) => {
                                        const Icon = t.icon;
                                        return (
                                            <SelectItem key={t.value} value={t.value} className="text-xs">
                                                <div className="flex items-center gap-2">
                                                    <Icon className={`w-3.5 h-3.5 ${t.color}`} />
                                                    <span>{t.label}</span>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1.5">
                                <Clock className="w-3.5 h-3.5" /> Duration (Mins)
                            </Label>
                            <Input
                                type="number"
                                min="1"
                                max="480"
                                value={formData.durationMinutes}
                                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                                className="h-9 text-xs"
                                placeholder="15"
                            />
                        </div>
                    </div>

                    {/* Section 2: Client & Contact Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <Label className="text-xs font-semibold flex items-center gap-1 mb-1.5">
                                <Building2 className="w-3.5 h-3.5 text-primary" /> Client / Company Name *
                            </Label>
                            <Input
                                value={formData.clientName}
                                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                placeholder="e.g. Apex Tech Solutions / Dr. Sharma Clinic"
                                className="h-9 text-xs"
                                required
                            />
                        </div>

                        <div>
                            <Label className="text-xs font-semibold flex items-center gap-1 mb-1.5">
                                <User className="w-3.5 h-3.5 text-primary" /> Contact Person
                            </Label>
                            <Input
                                value={formData.contactPerson}
                                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                placeholder="e.g. Rajesh Sharma (Director)"
                                className="h-9 text-xs"
                            />
                        </div>

                        <div>
                            <Label className="text-xs font-semibold flex items-center gap-1 mb-1.5">
                                <PhoneCall className="w-3.5 h-3.5 text-emerald-500" /> Phone / WhatsApp Number
                            </Label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+91 98765 43210"
                                className="h-9 text-xs"
                            />
                        </div>

                        <div>
                            <Label className="text-xs font-semibold flex items-center gap-1 mb-1.5">
                                <MapPin className="w-3.5 h-3.5 text-amber-500" /> Location / Check-In Address
                            </Label>
                            <Input
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g. Sector 62, Noida / Client HQ"
                                className="h-9 text-xs"
                            />
                        </div>
                    </div>

                    {/* Section 3: Purpose & Conversation Notes */}
                    <div className="space-y-3">
                        <div>
                            <Label className="text-xs font-semibold mb-1.5 block">
                                Purpose of Call / Visit
                            </Label>
                            <Input
                                value={formData.callPurpose}
                                onChange={(e) => setFormData({ ...formData, callPurpose: e.target.value })}
                                placeholder="e.g., Cold Pitch, Software Demo, Contract Renewal, Payment Collection"
                                className="h-9 text-xs"
                            />
                        </div>

                        <div>
                            <Label className="text-xs font-semibold mb-1.5 flex items-center justify-between">
                                <span>Key Discussion & Conversation Notes *</span>
                                <span className="text-[10px] text-muted-foreground font-normal">Supports detailed field observations</span>
                            </Label>
                            <Textarea
                                value={formData.conversation}
                                onChange={(e) => setFormData({ ...formData, conversation: e.target.value })}
                                placeholder="Detailed summary of discussion points, client requirements, pricing quotes shared, competitors mentioned, and key decisions..."
                                className="min-h-[100px] text-xs leading-relaxed"
                                required
                            />
                        </div>

                        <div>
                            <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                                Client Objections / Concerns (Optional)
                            </Label>
                            <Input
                                value={formData.objections}
                                onChange={(e) => setFormData({ ...formData, objections: e.target.value })}
                                placeholder="e.g. Pricing high compared to competitor X, requires board approval"
                                className="h-8 text-xs bg-muted/20"
                            />
                        </div>
                    </div>

                    {/* Section 4: Outcome, Deal Potential & Follow-up */}
                    <div className="p-4 bg-muted/40 rounded-xl border border-border/80 space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <Label className="text-xs font-semibold mb-1.5 block">
                                    Call Outcome / Status *
                                </Label>
                                <Select
                                    value={formData.outcome}
                                    onValueChange={(val) => setFormData({ ...formData, outcome: val })}
                                >
                                    <SelectTrigger className="h-9 text-xs font-medium">
                                        <SelectValue placeholder="Select outcome" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {OUTCOMES.map((o) => (
                                            <SelectItem key={o.value} value={o.value} className="text-xs">
                                                {o.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-xs font-semibold flex items-center gap-1 mb-1.5">
                                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Deal Potential Value (₹)
                                </Label>
                                <Input
                                    type="number"
                                    value={formData.dealValue}
                                    onChange={(e) => setFormData({ ...formData, dealValue: e.target.value })}
                                    placeholder="e.g. 150000"
                                    className="h-9 text-xs"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                            <div>
                                <Label className="text-xs font-semibold flex items-center gap-1 mb-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-amber-500" /> Next Follow-up Date & Time
                                </Label>
                                <Input
                                    type="datetime-local"
                                    value={formData.nextFollowUpDate}
                                    onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                                    className="h-9 text-xs"
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-semibold mb-1.5 block">
                                    Next Action / Follow-up Plan
                                </Label>
                                <Input
                                    value={formData.nextFollowUpAction}
                                    onChange={(e) => setFormData({ ...formData, nextFollowUpAction: e.target.value })}
                                    placeholder="e.g. Share commercial proposal & visit again"
                                    className="h-9 text-xs"
                                />
                            </div>
                        </div>

                        {!isEdit && (
                            <div className="flex items-center space-x-2 pt-1 border-t border-border/50">
                                <Checkbox
                                    id="createTask"
                                    checked={formData.createTask}
                                    onCheckedChange={(checked) => setFormData({ ...formData, createTask: !!checked })}
                                />
                                <label
                                    htmlFor="createTask"
                                    className="text-xs text-muted-foreground font-medium leading-none cursor-pointer flex items-center gap-1.5"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                                    Automatically create a Task reminder on CRM Calendar for the follow-up date
                                </label>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading} size="sm">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} size="sm" className="gap-1.5 font-semibold">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            {isEdit ? "Update Activity" : "Save Activity Record"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
