'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useAction } from '@/hooks/use-action';
import { saveCategory } from '../_actions/save-category';
import { deleteCategory } from '../_actions/delete-category';
import { toast } from 'sonner';

export default function CategoriesManager({ workspaceId, categories, onUpdate, type }) {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#3b82f6');
    const [isLoading, setIsLoading] = useState(false);

    const { execute: executeAdd } = useAction(saveCategory, {
        onSuccess: () => {
            toast.success(`${type} added successfully`, { id: 'manage-category' });
            setName('');
            setIsLoading(false);
            onUpdate();
        },
        onError: (err) => {
            const errorMsg = typeof err === 'string' ? err : (err?.message || `Failed to add ${type.toLowerCase()}`);
            toast.error(errorMsg, { id: 'manage-category' });
            setIsLoading(false);
        }
    });

    const { execute: executeDelete } = useAction(deleteCategory, {
        onSuccess: () => {
            toast.success("Removed successfully");
            onUpdate();
        },
        onError: (err) => {
            const errorMsg = typeof err === 'string' ? err : (err?.message || "Failed to remove");
            toast.error(errorMsg);
        }
    });

    const handleAdd = async () => {
        if (!name) return;
        setIsLoading(true);
        toast.loading(`Adding ${type.toLowerCase()}...`, { id: 'manage-category' });
        executeAdd({ name, color, workspaceId, type });
    };

    const handleDelete = async (id) => {
        executeDelete({ id });
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
                <Button onClick={handleAdd} disabled={isLoading || !name} size="icon">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </Button>
            </div>

            {/* <ScrollArea className="h-[300px] border rounded-md p-2 bg-muted/5">
                <div className="space-y-1">
                    {categories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-md transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                <span className="text-sm font-medium">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[10px] opacity-30 font-mono bg-muted/20 px-1.5 py-0.5 rounded">
                                    {cat._count?.contacts || 0}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground/50 hover:text-destructive transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(cat.id);
                                    }}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && <p className="text-center text-xs text-muted-foreground py-8">No structured {type.toLowerCase()}s found.</p>}
                </div>
            </ScrollArea> */}
        </div>
    );
}
