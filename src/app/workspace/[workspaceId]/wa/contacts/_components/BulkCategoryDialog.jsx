'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

export default function BulkCategoryDialog({ isOpen, onOpenChange, categories, onConfirm }) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Bulk Categories</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-2">
                    {categories.map(cat => (
                        <Button 
                            key={cat.id} 
                            onClick={() => onConfirm(cat.id)} 
                            variant="outline"
                            className="justify-start gap-2 h-10"
                        >
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                            {cat.name}
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
