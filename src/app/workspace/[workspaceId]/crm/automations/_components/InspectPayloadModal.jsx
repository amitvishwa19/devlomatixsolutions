'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Activity,
    CheckCircle2,
    Clock,
    Layers,
    Code2,
    Copy,
    Check
} from 'lucide-react';
import { toast } from "sonner";

export default function InspectPayloadModal({ isOpen, onClose, log }) {
    const [copied, setCopied] = React.useState(false);

    if (!log) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(log, null, 2));
        setCopied(true);
        toast.success("Payload copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 bg-card border-border shadow-2xl">
                <DialogHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Code2 className="w-4 h-4 text-primary" />
                            <span>Execution Log Inspector</span>
                        </DialogTitle>
                        <Badge className={`text-[10px] ${
                            log.status === 'SUCCESS'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        }`}>
                            {log.status}
                        </Badge>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground">
                        FlowForge event trace and payload snapshot for <strong>{log.ruleName}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-2">
                    {/* Key Metrics Strip */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-muted/20 border border-border/70 text-center">
                        <div>
                            <span className="text-[10px] text-muted-foreground block">Trigger Event</span>
                            <span className="text-xs font-bold text-foreground">{log.triggerEvent}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-muted-foreground block">Duration</span>
                            <span className="text-xs font-bold text-emerald-500">{log.durationMs || 250} ms</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-muted-foreground block">Nodes Run</span>
                            <span className="text-xs font-bold text-primary">{log.executedNodes?.length || 1}</span>
                        </div>
                    </div>

                    {/* Nodes Path */}
                    <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-muted-foreground">Action Chain Sequence:</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {log.executedNodes?.map((node, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <Badge variant="outline" className="text-[11px] py-0.5 bg-background font-medium">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500 mr-1 inline" />
                                        {node}
                                    </Badge>
                                    {i < log.executedNodes.length - 1 && (
                                        <span className="text-muted-foreground text-xs">→</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* JSON Payload Viewer */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">Snapshot Data Payload:</span>
                            <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 text-xs gap-1">
                                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                            </Button>
                        </div>
                        <pre className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 text-[11px] font-mono text-foreground overflow-x-auto max-h-60">
                            {JSON.stringify(log.payload || {}, null, 2)}
                        </pre>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs w-full sm:w-auto">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
