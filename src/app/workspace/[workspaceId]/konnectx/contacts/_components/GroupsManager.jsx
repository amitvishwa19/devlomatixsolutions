'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, X, Layers, Trash2, Loader2, Pencil, Save } from 'lucide-react';
import { useAction } from '@/hooks/use-action';
import { createGroup } from '../_actions/create-group';
import { deleteGroup } from '../_actions/delete-group';
import { updateGroup } from '../_actions/update-group';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function GroupsManager({ workspaceId, groups, onUpdate }) {
    const { data: session } = useSession();
    const userId = session?.user?.userId || '';
    
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [editingGroup, setEditingGroup] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const { execute: executeAdd } = useAction(createGroup, {
        onSuccess: () => {
            toast.success("Broadcast group created successfully", { id: 'manage-group' });
            resetForm();
            onUpdate();
        },
        onError: (err) => {
            const errorMsg = typeof err === 'string' ? err : (err?.message || "Failed to create group");
            toast.error(errorMsg, { id: 'manage-group' });
            setIsProcessing(false);
        }
    });

    const { execute: executeUpdate } = useAction(updateGroup, {
        onSuccess: () => {
            toast.success("Group updated successfully", { id: 'manage-group' });
            resetForm();
            onUpdate();
        },
        onError: (err) => {
            const errorMsg = typeof err === 'string' ? err : (err?.message || "Failed to update group");
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

    const resetForm = () => {
        setName('');
        setDescription('');
        setEditingGroup(null);
        setIsProcessing(false);
    };

    const handleSubmit = () => {
        if (!name) return;
        setIsProcessing(true);
        toast.loading(editingGroup ? "Updating group..." : "Creating group...", { id: 'manage-group' });
        
        if (editingGroup) {
            executeUpdate({ id: editingGroup.id, name, description, userId, workspaceId });
        } else {
            executeAdd({ name, description, userId, workspaceId });
        }
    };

    const handleEdit = (group) => {
        setEditingGroup(group);
        setName(group.name);
        setDescription(group.description || '');
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this group?")) {
            executeDelete({ id, userId });
        }
    };

    return (
        <div className="space-y-6 mt-4">
            <div className="space-y-3 p-4 border rounded-xl bg-muted/20">
                <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold uppercase text-primary/70 tracking-widest">
                        {editingGroup ? 'Edit Group' : 'Create New Group'}
                    </span>
                    {editingGroup && (
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={resetForm}>
                            <X className="w-3 h-3" />
                        </Button>
                    )}
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1 opacity-60">Group Name</label>
                    <Input
                        placeholder="e.g. VIP Clients, Q4 Leads"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="h-9 bg-background/50"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1 opacity-60">Description (Optional)</label>
                    <Textarea
                        placeholder="Purpose of this group..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="resize-none h-20 text-xs bg-background/50"
                    />
                </div>
                <Button onClick={handleSubmit} disabled={isProcessing || !name} className="w-full gap-2 h-9 font-bold">
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingGroup ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                    {isProcessing ? (editingGroup ? 'Updating...' : 'Creating...') : (editingGroup ? 'Update Group' : 'Create Group')}
                </Button>
            </div>

            <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-1">Existing Groups ({groups.length})</span>
                <ScrollArea className="h-[250px] border border-border/40 rounded-xl p-1 bg-muted/5">
                    <div className="space-y-1">
                        {groups.map(group => (
                            <div key={group.id} className={`flex items-center justify-between p-2 rounded-lg transition-all group ${editingGroup?.id === group.id ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-muted/30'}`}>
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`p-1.5 rounded-md shrink-0 ${editingGroup?.id === group.id ? 'bg-primary/20' : 'bg-primary/10'}`}>
                                        <Layers className={`w-4 h-4 text-primary ${editingGroup?.id === group.id ? 'opacity-100' : 'opacity-70'}`} />
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
                                        className="h-8 w-8 text-muted-foreground/50 hover:text-primary transition-colors"
                                        onClick={() => handleEdit(group)}
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground/50 hover:text-destructive transition-colors"
                                        onClick={() => handleDelete(group.id)}
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
            </div>
        </div>
    );
}
