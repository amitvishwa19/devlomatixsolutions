'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, X, Layers, Trash2, Loader2 } from 'lucide-react';
import { useAction } from '@/hooks/use-action';
import { createGroup } from '../_actions/create-group';
import { deleteGroup } from '../_actions/delete-group';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function GroupsManager({ workspaceId, groups, onUpdate }) {
    const { data: session } = useSession();
    const userId = session?.user?.userId || '';
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const { execute: executeAdd } = useAction(createGroup, {
        onSuccess: () => {
            toast.success("Broadcast group created successfully", { id: 'manage-group' });
            setName('');
            setDescription('');
            setIsProcessing(false);
            onUpdate();
        },
        onError: (err) => {
            const errorMsg = typeof err === 'string' ? err : (err?.message || "Failed to create group");
            toast.error(errorMsg, { id: 'manage-group' });
            setIsProcessing(false);
        }
    });

    const { execute: executeDelete } = useAction(deleteGroup, {
        onSuccess: () => {
            toast.success("Group removed");
            onUpdate();
        },
        onError: (err) => {
            const errorMsg = typeof err === 'string' ? err : (err?.message || "Failed to remove group");
            toast.error(errorMsg);
        }
    });

    const handleAdd = () => {
        if (!name) return;
        setIsProcessing(true);
        toast.loading("Creating group...", { id: 'manage-group' });
        executeAdd({ name, description, userId, workspaceId });
    };

    const handleDelete = (id) => {
        executeDelete({ id, userId });
    };

    return (
        <div className="space-y-6 mt-4">
            <div className="space-y-3 p-4 border rounded-md bg-muted/20">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Group Name</label>
                    <Input
                        placeholder="e.g. VIP Clients, Q4 Leads"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="h-9"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Description (Optional)</label>
                    <Textarea
                        placeholder="Purpose of this group..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="resize-none h-20 text-xs"
                    />
                </div>
                <Button onClick={handleAdd} disabled={isProcessing || !name} className="w-full gap-2 h-9">
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {isProcessing ? 'Creating...' : 'Create Group'}
                </Button>
            </div>

            {/* <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-1">Existing Groups ({groups.length})</span>
                <ScrollArea className="h-[250px] border rounded-md p-1 bg-muted/5">
                    <div className="space-y-1">
                        {groups.map(group => (
                            <div key={group.id} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-md transition-colors group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-1.5 bg-primary/10 rounded-md shrink-0">
                                        <Layers className="w-4 h-4 text-primary opacity-70" />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-bold tracking-tight truncate">{group.name}</span>
                                        {group.description && <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">{group.description}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-[10px] opacity-30 font-mono bg-muted/20 px-1.5 py-0.5 rounded">
                                        {group._count?.contacts || 0}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground/50 hover:text-destructive transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(group.id);
                                        }}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {groups.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                                <Layers className="w-8 h-8 mb-2" />
                                <p className="text-xs font-medium">No broadcast groups created yet.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div> */}
        </div>
    );
}
