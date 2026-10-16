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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    CheckSquare,
    Phone,
    MessageCircle,
    Calendar,
    Receipt,
    FileText,
    Clock,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { toast } from "sonner";
import { createCrmTaskAction } from '../../_actions/crm-task-actions';
import { getCrmContactsAction } from '../../_actions/contact-actions';
import { getDealsAction } from '../../_actions/deal-actions';

export default function CreateTaskModal({ isOpen, onClose, workspaceId, onTaskCreated, defaultDealId, defaultContactId }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('WHATSAPP_FOLLOWUP');
    const [priority, setPriority] = useState('HIGH');
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString().slice(0, 16));
    const [dealId, setDealId] = useState(defaultDealId || '');
    const [contactId, setContactId] = useState(defaultContactId || '');

    const [contacts, setContacts] = useState([]);
    const [deals, setDeals] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen || !workspaceId) return;

        async function loadOptions() {
            try {
                const [cRes, dRes] = await Promise.all([
                    getCrmContactsAction(workspaceId),
                    getDealsAction(workspaceId)
                ]);
                if (cRes.success) setContacts(cRes.data);
                if (dRes.success) setDeals(dRes.data);
            } catch (err) {
                console.error("Error loading task options:", err);
            }
        }

        loadOptions();
    }, [isOpen, workspaceId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Task title is required");
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await createCrmTaskAction(workspaceId, {
                title: title.trim(),
                description: description.trim(),
                type,
                priority,
                dueDate: new Date(dueDate).toISOString(),
                dealId: dealId || null,
                contactId: contactId || null
            });

            if (res.success) {
                toast.success("Follow-up task scheduled!");
                if (onTaskCreated) onTaskCreated(res.data);
                onClose();
                setTitle('');
                setDescription('');
            } else {
                toast.error(res.error || "Failed to schedule task");
            }
        } catch (error) {
            console.error("Create task error:", error);
            toast.error("Error creating task");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 bg-card border-border shadow-2xl">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-xl font-black text-foreground flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-sm">
                            <CheckSquare className="w-4 h-4" />
                        </div>
                        <span>Schedule Follow-up Task</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Create actionable reminders for WhatsApp outreach, discovery calls, and proposal reviews.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Task Subject *</Label>
                        <Input
                            placeholder="e.g. Follow up on proposal & clarify contract terms"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-9 text-xs bg-background"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Action Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="h-9 text-xs bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WHATSAPP_FOLLOWUP">💬 WhatsApp Follow-up</SelectItem>
                                    <SelectItem value="CALL">📞 Phone Call</SelectItem>
                                    <SelectItem value="MEETING">🤝 Client Meeting</SelectItem>
                                    <SelectItem value="PROPOSAL_REVIEW">📄 Proposal Review</SelectItem>
                                    <SelectItem value="PAYMENT_CHASE">💳 Payment Follow-up</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Priority</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger className="h-9 text-xs bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="URGENT">🔴 Urgent (Immediate)</SelectItem>
                                    <SelectItem value="HIGH">🟠 High Priority</SelectItem>
                                    <SelectItem value="MEDIUM">🟡 Medium Priority</SelectItem>
                                    <SelectItem value="LOW">⚪ Low Priority</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Due Date & Time *</Label>
                        <Input
                            type="datetime-local"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="h-9 text-xs bg-background"
                            required
                        />
                    </div>

                    {/* Linked Entity Pickers */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Link Contact</Label>
                            <Select value={contactId} onValueChange={setContactId}>
                                <SelectTrigger className="h-9 text-xs bg-background">
                                    <SelectValue placeholder="Select contact..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NONE">None</SelectItem>
                                    {contacts.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name} ({c.phone || c.email})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Link Deal</Label>
                            <Select value={dealId} onValueChange={setDealId}>
                                <SelectTrigger className="h-9 text-xs bg-background">
                                    <SelectValue placeholder="Select deal..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NONE">None</SelectItem>
                                    {deals.map(d => (
                                        <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Description & Next Steps</Label>
                        <Textarea
                            placeholder="Add talking points, objectives, or special notes..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="text-xs bg-background resize-none"
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} className="h-9 text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="h-9 text-xs font-bold gap-1.5 shadow-sm">
                            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckSquare className="w-3.5 h-3.5" />}
                            <span>Schedule Task</span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
