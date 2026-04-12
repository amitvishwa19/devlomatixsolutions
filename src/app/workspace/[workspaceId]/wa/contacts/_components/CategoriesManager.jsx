'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, X } from 'lucide-react';

export default function CategoriesManager({ workspaceId, categories, onUpdate, type }) {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#3b82f6');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleAdd = async () => {
        if (!name) return;
        setLoading(true);
        try {
            const res = await fetch('/api/wa/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, color, workspaceId, type })
            });
            if (res.ok) {
                toast({ title: "Category Added" });
                setName('');
                onUpdate();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const res = await fetch(`/api/wa/categories/${id}`, { method: 'DELETE' });
        if (res.ok) {
            toast({ title: "Removed" });
            onUpdate();
        }
    };

    return (
        <div className="space-y-4 mt-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Category Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="flex-1"
                />
                <div className="relative w-10 h-10 border rounded-md overflow-hidden shrink-0">
                    <input
                        type="color"
                        value={color}
                        onChange={e => setColor(e.target.value)}
                        className="absolute inset-0 w-full h-full scale-150 cursor-pointer"
                    />
                </div>
                <Button onClick={handleAdd} disabled={loading || !name} size="icon">
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            <ScrollArea className="h-[300px] border rounded-md p-2 bg-muted/5">
                <div className="space-y-1">
                    {categories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-md transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                <span className="text-sm font-medium">{cat.name}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                                onClick={() => handleDelete(cat.id)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    {categories.length === 0 && <p className="text-center text-xs text-muted-foreground py-8">No structured {type.toLowerCase()}s found.</p>}
                </div>
            </ScrollArea>
        </div>
    );
}
