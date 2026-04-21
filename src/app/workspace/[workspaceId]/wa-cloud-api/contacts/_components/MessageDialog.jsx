'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export default function MessageDialog({ isOpen, onOpenChange, onSend, contactName, isSending }) {
    const [messageText, setMessageText] = useState('');

    const handleShip = () => {
        if (!messageText) return;
        onSend(messageText);
        setMessageText('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Secure Message to {contactName}</DialogTitle>
                </DialogHeader>
                <Textarea 
                    placeholder="Type message..." 
                    value={messageText} 
                    onChange={e => setMessageText(e.target.value)} 
                    className="min-h-[150px] bg-muted/10 focus:bg-background transition-all" 
                />
                <DialogFooter className="pt-4">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSending}>Cancel</Button>
                    <Button onClick={handleShip} disabled={!messageText || isSending} className="gap-2">
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {isSending ? 'Shipping...' : 'Ship Now'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
