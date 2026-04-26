"use client";

import { 
    KeyRound, 
    RefreshCw,
    Plus,
    Trash2,
    MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function CredentialList({ credentials, loading, onRefresh, onAdd, onDelete }) {
    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold tracking-tight">Credentials</h2>
                    <p className="text-xs text-muted-foreground font-medium">Securely store API keys and auth presets for your nodes.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-bold h-5">{credentials.length} STORED</Badge>
                    <Button size="sm" variant="ghost" onClick={onRefresh} disabled={loading} className="h-8 w-8 p-0">
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                    <Button size="sm" onClick={onAdd} className="h-9 gap-2">
                        <Plus className="h-4 w-4" /> New Credential
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden rounded-xl border border-border/60 bg-card/30">
                <ScrollArea className="h-full">
                    <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-muted/90 backdrop-blur z-10">
                            <tr className="border-b border-border/60 text-left font-bold tracking-tighter text-muted-foreground">
                                <th className="py-3 pl-6">Name</th>
                                <th>Type / Provider</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th className="pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {loading && !credentials.length && (
                                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground animate-pulse font-mono">Loading credentials...</td></tr>
                            )}
                            {credentials.length === 0 && !loading && (
                                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground font-mono">No credentials registered</td></tr>
                            )}
                            {credentials.map((c) => (
                                <tr key={c.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="py-3 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary/60 group-hover:bg-primary group-hover:text-white transition-all">
                                                <KeyRound className="h-4 w-4" />
                                            </div>
                                            <div className="font-bold text-sm">{c.name}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <code className="font-mono bg-muted/50 px-2 py-0.5 rounded border border-border/40 text-muted-foreground">
                                            {c.kind}
                                        </code>
                                    </td>
                                    <td>
                                        <Badge variant={c.secretId ? "default" : "outline"} className={cn(
                                            "text-[9px] h-5 rounded-sm font-bold tracking-tighter",
                                            c.secretId ? "bg-emerald-500/20 text-emerald-500 border-0" : "opacity-60"
                                        )}>
                                            {c.secretId ? "Encrypted" : "Public"}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div className="text-muted-foreground font-medium">
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="pr-6 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(c.id)}>
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
