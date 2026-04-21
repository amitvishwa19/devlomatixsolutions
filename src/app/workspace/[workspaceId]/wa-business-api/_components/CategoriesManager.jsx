'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Loader2, Layers } from 'lucide-react';
import { useAction } from '@/hooks/use-action';
import { saveCategory } from '../_actions/save-category';
import { deleteCategory } from '../_actions/delete-category';
import { toast } from 'sonner';

export default function CategoriesManager({ workspaceId, categories = [], onUpdate, type }) {
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
            toast.success("Removed successfully", { id: 'delete-category' });
            onUpdate();
        },
        onError: (err) => {
            const errorMsg = typeof err === 'string' ? err : (err?.message || "Failed to remove");
            toast.error(errorMsg, { id: 'delete-category' });
        }
    });

    const handleAdd = async () => {
        if (!name) return;
        setIsLoading(true);
        toast.loading(`Adding ${type.toLowerCase()}...`, { id: 'manage-category' });
        executeAdd({ name, color, workspaceId, type });
    };

    const handleDelete = async (id) => {
        toast.loading("Removing category...", { id: 'delete-category' });
        executeDelete({ id });
    };

    return (
        <div className="space-y-6 mt-4">
            <div className="flex gap-2">
                <Input
                    placeholder="New Taxonomy Entry..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="flex-1 bg-muted/10 h-11"
                />
                <div className="relative w-11 h-11 border rounded-lg overflow-hidden shrink-0">
                    <input
                        type="color"
                        value={color}
                        onChange={e => setColor(e.target.value)}
                        className="absolute inset-0 w-full h-full scale-150 cursor-pointer"
                    />
                </div>
                <Button onClick={handleAdd} disabled={isLoading || !name} size="icon" className="h-11 w-11">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5" />}
                </Button>
            </div>

            <ScrollArea className="h-[300px] border rounded-2xl p-2 bg-muted/10 border-dashed">
                <div className="space-y-1 p-2">
                    {categories.length > 0 ? categories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-3 bg-card border border-border/40 hover:border-primary/20 rounded-xl transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                                <span className="text-xs font-bold truncate">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black opacity-30 font-mono bg-muted px-1.5 py-0.5 rounded uppercase">
                                    {cat._count?.contacts || 0} hits
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(cat.id);
                                    }}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center opacity-30">
                            <Layers className="w-10 h-10 mb-2" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">No segments defined</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
