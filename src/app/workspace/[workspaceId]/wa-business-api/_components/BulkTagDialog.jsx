'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tag, Check, Loader2 } from 'lucide-react';

export default function BulkTagDialog({
    isOpen,
    onOpenChange,
    count,
    onTag,
    isProcessing
}) {
    const [tag, setTag] = useState('');

    const handleApply = () => {
        if (!tag) return;
        onTag(tag);
        setTag('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden bg-card border-none shadow-2xl">
                <DialogHeader className="p-8 pb-4 text-center">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                        <Tag className="w-8 h-8" />
                    </div>
                    <DialogTitle className="text-xl font-black tracking-tight">Mass Annotation Protocol</DialogTitle>
                    <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">
                        Apply a global tag to <span className="text-primary font-black underline">{count}</span> selected identities.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="px-8 pb-8 flex flex-col gap-6">
                    <div className="space-y-2">
                        <Input 
                            placeholder="e.g. VIP, Q2-Lead, Verified" 
                            value={tag} 
                            onChange={e => setTag(e.target.value)}
                            className="bg-muted/10 h-11 border-border/40 focus:border-primary/50 text-center font-black uppercase tracking-widest text-[10px]"
                        />
                    </div>
                    
                    <div className="flex gap-3">
                        <Button variant="ghost" className="flex-1 h-11 rounded-xl font-black uppercase tracking-widest text-[10px]" disabled={isProcessing} onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button className="flex-1 h-11 rounded-xl shadow-lg shadow-primary/20 font-black uppercase tracking-widest text-[10px] gap-2" onClick={handleApply} disabled={!tag || isProcessing}>
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Apply Tag
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
