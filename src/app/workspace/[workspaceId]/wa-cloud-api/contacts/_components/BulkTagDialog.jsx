'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function BulkTagDialog({ isOpen, onOpenChange, onConfirm, isProcessing }) {
    const [tagInput, setTagInput] = useState('');

    const handleApply = () => {
        if (!tagInput) return;
        onConfirm(tagInput);
        setTagInput('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Bulk Tagging</DialogTitle>
                </DialogHeader>
                <Input 
                    placeholder="Enter tag..." 
                    value={tagInput} 
                    onChange={e => setTagInput(e.target.value)} 
                    className="bg-muted/10 h-11" 
                />
                <DialogFooter>
                    <Button 
                        onClick={handleApply} 
                        disabled={!tagInput || isProcessing}
                        className="gap-2"
                    >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {isProcessing ? 'Applying...' : 'Apply Tag'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
