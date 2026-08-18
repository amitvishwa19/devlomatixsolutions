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
import {
    Ticket,
    Plus,
    MessageSquare,
    Mail,
    Globe,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { createTicket } from '../_actions/deskflow-actions';

export function CreateTicketModal({ open, onOpenChange, workspaceId, onTicketCreated }) {
    const [creating, setCreating] = useState(false);
    const [newTicket, setNewTicket] = useState({
        subject: '',
        customer: '',
        email: '',
        channel: 'WhatsApp',
        priority: 'Medium',
        message: ''
    });

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newTicket.subject.trim()) return toast.error("Please enter a ticket subject");
        if (!newTicket.customer.trim()) return toast.error("Please enter customer name");

        setCreating(true);
        const res = await createTicket(workspaceId, newTicket);
        if (res.success) {
            toast.success("Support ticket created successfully!");
            onOpenChange(false);
            setNewTicket({
                subject: '',
                customer: '',
                email: '',
                channel: 'WhatsApp',
                priority: 'Medium',
                message: ''
            });
            if (onTicketCreated) onTicketCreated(res.data);
        } else {
            toast.error(res.error || "Failed to create ticket");
        }
        setCreating(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border/80 p-0 overflow-hidden flex flex-col max-h-[85vh]">
                <DialogHeader className="p-4 border-b border-border/60 bg-secondary/15">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-500">
                            <Ticket className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Create Support Ticket
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Log customer inquiries across WhatsApp, Email, or Webchat.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleCreate} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
                    <div className="space-y-1">
                        <Label className="text-xs">Inquiry Subject</Label>
                        <Input
                            placeholder="e.g. 3DS Card Verification Error on checkout"
                            value={newTicket.subject}
                            onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                            className="h-8 text-xs bg-secondary/30 border-border/80"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                            <Label className="text-xs">Customer Name</Label>
                            <Input
                                placeholder="Alex Rivera"
                                value={newTicket.customer}
                                onChange={(e) => setNewTicket({ ...newTicket, customer: e.target.value })}
                                className="h-8 text-xs bg-secondary/30 border-border/80"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Customer Email / Phone</Label>
                            <Input
                                placeholder="alex@example.com"
                                value={newTicket.email}
                                onChange={(e) => setNewTicket({ ...newTicket, email: e.target.value })}
                                className="h-8 text-xs bg-secondary/30 border-border/80"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                            <Label className="text-xs">Channel</Label>
                            <Select
                                value={newTicket.channel}
                                onValueChange={(val) => setNewTicket({ ...newTicket, channel: val })}
                            >
                                <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WhatsApp">WhatsApp (KonnectX)</SelectItem>
                                    <SelectItem value="Email">Email Support</SelectItem>
                                    <SelectItem value="Live Chat">Live Webchat</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Priority</Label>
                            <Select
                                value={newTicket.priority}
                                onValueChange={(val) => setNewTicket({ ...newTicket, priority: val })}
                            >
                                <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Urgent">Urgent (15m SLA)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs">Inquiry Message / Details</Label>
                        <Textarea
                            rows={3}
                            placeholder="Customer inquiry details or issue description..."
                            value={newTicket.message}
                            onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                            className="text-xs bg-secondary/30 border-border/80 resize-none font-normal"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                        <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={creating} className="h-8 text-xs bg-sky-600 hover:bg-sky-700 text-white shadow-xs">
                            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Ticket'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
