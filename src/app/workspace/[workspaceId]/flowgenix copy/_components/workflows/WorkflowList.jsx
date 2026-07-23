"use client";

import { useState } from "react";
import { 
    Workflow, 
    MoreHorizontal, 
    Play, 
    Trash2, 
    Eye, 
    Edit2, 
    RefreshCw,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function WorkflowList({ workflows, loading, onRefresh, onDelete, onEdit, onRun }) {
    const [search, setSearch] = useState("");

    const filtered = workflows.filter(w => 
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold tracking-tight">Workflows</h2>
                    <p className="text-xs text-muted-foreground font-medium">Manage and monitor your automated processes.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search workflows..."
                            className="pl-9 h-9 bg-muted/20"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Badge variant="outline" className="font-bold h-5">{workflows.length} TOTAL</Badge>
                    <Button size="sm" variant="ghost" onClick={onRefresh} disabled={loading} className="h-8 w-8 p-0">
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden rounded-xl border border-border/60 bg-card/30">
                <ScrollArea className="h-full">
                    <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-muted/90 backdrop-blur z-10">
                            <tr className="border-b border-border/60 text-left font-bold tracking-tighter text-muted-foreground">
                                <th className="py-3 pl-6">Workflow Name</th>
                                <th>Status</th>
                                <th>Nodes</th>
                                <th>Updated</th>
                                <th className="pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {loading && !workflows.length && (
                                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground animate-pulse font-mono">Initializing stream...</td></tr>
                            )}
                            {filtered.length === 0 && !loading && (
                                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground font-mono">No workflows found</td></tr>
                            )}
                            {filtered.map((w) => (
                                <tr key={w.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="py-3 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                <Workflow className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">{w.name}</div>
                                                <div className="font-mono text-muted-foreground opacity-60">ID: {w.id.slice(0, 8)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] h-5 rounded-sm font-bold tracking-tighter">
                                            {w.status || 'Active'}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-1.5 font-mono text-muted-foreground">
                                            <span className="text-foreground font-bold">{(w.nodes || []).length}</span>
                                            <span className="opacity-40">nodes</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-muted-foreground font-medium">
                                            {new Date(w.updatedAt).toLocaleDateString()}
                                            <span className="ml-2 opacity-40 text-[10px]">
                                                {new Date(w.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="pr-6 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => onRun(w.id)}>
                                                <Play className="h-3.5 w-3.5 text-primary" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => onEdit(w.id)}>
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem onClick={() => onEdit(w.id)}>
                                                        <Eye className="mr-2 h-4 w-4" /> Open Canvas
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(w.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ScrollArea>
            </div>
        </div>
    );
}
