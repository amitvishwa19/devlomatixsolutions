'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquarePlus, Send, Loader2, Smartphone, User } from 'lucide-react';
import { toast } from 'sonner';
import { startNewChatAction } from '../_actions/chat-actions';

export default function NewChatModal({ isOpen, onClose, workspaceId, onChatCreated }) {
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('Hello!');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!phone.trim()) {
            toast.error("Please enter a phone number");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await startNewChatAction(workspaceId, {
                phone: phone.trim(),
                name: name.trim() || undefined,
                initialMessage: message.trim() || "Hello!"
            });

            if (!res.success) {
                throw new Error(res.error || "Failed to start conversation");
            }

            toast.success("Message dispatched via linked WhatsApp!");
            if (onChatCreated) {
                onChatCreated(res.conversation, res.message);
            }
            onClose();
            setPhone('');
            setName('');
            setMessage('Hello!');
        } catch (err) {
            toast.error(err.message || "Failed to initiate chat");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border/50 text-foreground p-6 rounded-2xl shadow-2xl">
                <DialogHeader className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <MessageSquarePlus size={18} />
                        </div>
                        <DialogTitle className="text-base font-bold text-foreground">
                            Start New WhatsApp Chat
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Send a message directly from your linked mobile phone to any WhatsApp number.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Smartphone size={13} className="text-emerald-400" />
                            Recipient Phone Number
                        </Label>
                        <Input
                            placeholder="e.g. 9712340450 or +919712340450"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="h-9 text-xs bg-background/50 border-border/50 rounded-xl font-mono"
                            required
                            autoFocus
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Enter number with or without country code (default: India +91 if 10 digits).
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <User size={13} className="text-emerald-400" />
                            Contact Name (Optional)
                        </Label>
                        <Input
                            placeholder="e.g. John Doe, Client, Supplier"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-9 text-xs bg-background/50 border-border/50 rounded-xl"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">
                            Initial Message
                        </Label>
                        <Textarea
                            placeholder="Type your opening message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            className="text-xs bg-background/50 border-border/50 rounded-xl resize-none"
                            required
                        />
                    </div>

                    <DialogFooter className="pt-2 flex items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="h-8 text-xs text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isSubmitting || !phone.trim()}
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 rounded-xl shadow-md"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={13} className="animate-spin" />
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={13} />
                                    <span>Send & Open Chat</span>
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
