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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, X, RefreshCw, Check, Tag } from 'lucide-react';

export default function ReviewImportDialog({
    isOpen,
    onOpenChange,
    data,
    setData,
    onImport,
    isImporting
}) {
    const [bulkTags, setBulkTags] = useState('');
    const [bulkCategory, setBulkCategory] = useState('');

    const applyBulkTags = () => {
        if (!bulkTags) return;
        const newData = data.map(item => ({ ...item, tags: bulkTags }));
        setData(newData);
        setBulkTags('');
    };

    const applyBulkCategory = () => {
        if (!bulkCategory) return;
        const newData = data.map(item => ({ ...item, category: bulkCategory }));
        setData(newData);
        setBulkCategory('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 overflow-hidden bg-card border-none shadow-2xl">
                <DialogHeader className="px-8 py-6 bg-primary/5 border-b border-primary/10">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-bold  flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Users className="w-6 h-6 text-primary" />
                                </div>
                                Review Business Import ({data.length})
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium text-muted-foreground/80">
                                Verify details before merging into Business API audience.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex flex-col md:flex-row items-center gap-4 px-6 py-4 bg-muted/10 border-b">
                    <div className="flex-1 flex items-center justify-between gap-2 p-1.5 bg-background border rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 flex-1">
                            <Tag className="w-3.5 h-3.5 text-primary ml-2" />
                            <Input
                                placeholder="Bulk Tags (tag1,tag2)..."
                                value={bulkTags}
                                onChange={e => setBulkTags(e.target.value)}
                                className="h-8 flex-1 text-xs border-none rounded-md focus-visible:ring-0 bg-transparent"
                            />
                        </div>
                        <Button size="sm" variant="ghost" className="h-7 text-[10px] font-bold px-3 hover:bg-primary/10 text-primary transition-all" onClick={applyBulkTags}>Apply Tags</Button>
                    </div>

                    <div className="flex-1 flex items-center justify-between gap-2 p-1.5 bg-background border rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 flex-1">
                            <RefreshCw className="w-3.5 h-3.5 text-emerald-500 ml-2" />
                            <Input
                                placeholder="Bulk Category (Lead, VIP)..."
                                value={bulkCategory}
                                onChange={e => setBulkCategory(e.target.value)}
                                className="h-8 flex-1 text-xs border-none rounded-md focus-visible:ring-0 bg-transparent"
                            />
                        </div>
                        <Button size="sm" variant="ghost" className="h-7 text-[10px] font-bold px-3 hover:bg-emerald-500/10 text-emerald-600 transition-all" onClick={applyBulkCategory}>Apply Category</Button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden p-6 bg-muted/20">
                    <div className="h-full border rounded-2xl bg-background overflow-hidden shadow-inner relative flex flex-col">
                        <Table>
                            <TableHeader className="bg-muted/30 sticky top-0 z-10 border-b">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="w-[180px] text-[10px] uppercase font-bold tracking-widest pl-6">Name</TableHead>
                                    <TableHead className="w-[160px] text-[10px] uppercase font-bold tracking-widest">Phone</TableHead>
                                    <TableHead className="w-[120px] text-[10px] uppercase font-bold tracking-widest">Category</TableHead>
                                    <TableHead className="text-[10px] uppercase font-bold tracking-widest">Tags</TableHead>
                                    <TableHead className="w-12 pr-6"></TableHead>
                                </TableRow>
                            </TableHeader>
                        </Table>

                        <ScrollArea className="flex-1">
                            <Table>
                                <TableBody>
                                    {data.map((contact, idx) => (
                                        <TableRow key={idx} className="group border-b border-border/40 hover:bg-primary/5 transition-colors">
                                            <TableCell className="py-2 pl-6">
                                                <Input
                                                    value={contact.name}
                                                    onChange={(e) => {
                                                        const newData = [...data];
                                                        newData[idx].name = e.target.value;
                                                        setData(newData);
                                                    }}
                                                    className="h-8 text-xs font-semibold bg-transparent border-transparent hover:border-border/60 focus:bg-background focus:border-primary transition-all"
                                                />
                                            </TableCell>
                                            <TableCell className="py-2">
                                                <Input
                                                    value={contact.phone}
                                                    onChange={(e) => {
                                                        const newData = [...data];
                                                        newData[idx].phone = e.target.value.replace(/[^\d+]/g, '');
                                                        setData(newData);
                                                    }}
                                                    className="h-8 text-xs font-mono bg-transparent border-transparent hover:border-border/60 focus:bg-background focus:border-primary transition-all"
                                                />
                                            </TableCell>
                                            <TableCell className="py-2">
                                                <Input
                                                    value={contact.category}
                                                    onChange={(e) => {
                                                        const newData = [...data];
                                                        newData[idx].category = e.target.value;
                                                        setData(newData);
                                                    }}
                                                    className="h-8 text-[10px] font-bold uppercase tracking-tight bg-transparent border-transparent hover:border-border/60 focus:bg-background focus:border-primary transition-all"
                                                />
                                            </TableCell>
                                            <TableCell className="py-2">
                                                <Input
                                                    value={contact.tags || ''}
                                                    onChange={(e) => {
                                                        const newData = [...data];
                                                        newData[idx].tags = e.target.value;
                                                        setData(newData);
                                                    }}
                                                    className="h-8 text-[10px] bg-transparent border-transparent hover:border-border/60 focus:bg-background focus:border-primary transition-all"
                                                    placeholder="tag1, tag2..."
                                                />
                                            </TableCell>
                                            <TableCell className="py-2 pr-6">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setData(data.filter((_, i) => i !== idx))}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter className="px-8 py-6 bg-card border-t flex items-center justify-between">
                    <Button variant="ghost" disabled={isImporting} onClick={() => onOpenChange(false)}>Discard</Button>
                    <Button onClick={() => onImport(data)} disabled={data.length === 0 || isImporting}>
                        {isImporting ? <RefreshCw className="animate-spin w-4 h-4 mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                        Merge {data.length} Contacts
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
