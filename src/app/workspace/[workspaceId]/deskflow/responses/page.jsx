'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    MessageSquareText,
    Plus,
    Copy,
    Search,
    Trash2,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getCannedResponses, saveCannedResponse, deleteCannedResponse } from '../_actions/deskflow-actions';

export default function DeskFlowResponsesPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newResp, setNewResp] = useState({ shortcut: '', title: '', category: 'General', text: '' });

    const loadData = async () => {
        setLoading(true);
        const res = await getCannedResponses(workspaceId);
        if (res.success) setResponses(res.data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newResp.shortcut || !newResp.text) return toast.error("Please fill in shortcut and message text");

        const res = await saveCannedResponse(workspaceId, newResp);
        if (res.success) {
            toast.success("Canned response saved!");
            setIsCreateOpen(false);
            setNewResp({ shortcut: '', title: '', category: 'General', text: '' });
            loadData();
        }
    };

    const copyText = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    const handleDelete = async (id) => {
        const res = await deleteCannedResponse(workspaceId, id);
        if (res.success) {
            toast.success("Snippet deleted");
            loadData();
        }
    };

    const filtered = responses.filter(r =>
        r.shortcut.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.text.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                            <MessageSquareText className="w-4 h-4 text-sky-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Canned Responses & Quick Replies</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Standardized message snippets and keyboard shortcuts for lightning-fast customer replies.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-8 text-xs bg-sky-600 hover:bg-sky-700 text-white gap-1.5 shadow-xs">
                            <Plus className="w-3.5 h-3.5" />
                            New Snippet
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-card border-border/80">
                        <DialogHeader>
                            <DialogTitle className="text-sm font-bold">Create Canned Snippet</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-3 pt-2">
                            <div className="space-y-1">
                                <Label className="text-xs">Shortcut (e.g. !welcome)</Label>
                                <Input
                                    placeholder="!refund"
                                    value={newResp.shortcut}
                                    onChange={(e) => setNewResp({ ...newResp, shortcut: e.target.value })}
                                    className="h-8 text-xs bg-secondary/30 border-border/80 font-mono"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Snippet Title</Label>
                                <Input
                                    placeholder="e.g. Refund Policy Guidance"
                                    value={newResp.title}
                                    onChange={(e) => setNewResp({ ...newResp, title: e.target.value })}
                                    className="h-8 text-xs bg-secondary/30 border-border/80"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Message Content</Label>
                                <Textarea
                                    rows={3}
                                    placeholder="Full message text to insert into conversation..."
                                    value={newResp.text}
                                    onChange={(e) => setNewResp({ ...newResp, text: e.target.value })}
                                    className="text-xs bg-secondary/30 border-border/80 resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateOpen(false)} className="h-8 text-xs">
                                    Cancel
                                </Button>
                                <Button type="submit" size="sm" className="h-8 text-xs bg-sky-600 hover:bg-sky-700 text-white">
                                    Save Snippet
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="relative max-w-md">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                    placeholder="Search shortcuts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs bg-secondary/30 border-border/80"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map((r) => (
                    <Card key={r.id} className="bg-card border-border/80 p-4 space-y-2.5 shadow-xs flex flex-col justify-between">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className="font-mono text-xs text-sky-500 bg-sky-500/10 border-sky-500/20">{r.shortcut}</Badge>
                                <Badge variant="secondary" className="text-[9px]">{r.category}</Badge>
                            </div>
                            <h3 className="font-semibold text-xs text-foreground">{r.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-3 bg-secondary/20 p-2 rounded border border-border/40 font-normal">
                                {r.text}
                            </p>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-border/40">
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="h-7 w-7 text-rose-500 hover:bg-rose-500/10">
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => copyText(r.text)} className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1">
                                <Copy className="w-3 h-3" /> Copy Text
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
