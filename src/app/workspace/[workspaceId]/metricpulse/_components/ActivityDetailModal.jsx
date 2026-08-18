'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Activity,
    Clock,
    Copy,
    Code2,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

export function ActivityDetailModal({ open, onOpenChange, activity }) {
    if (!activity) return null;

    const handleCopyPayload = () => {
        navigator.clipboard.writeText(JSON.stringify(activity, null, 2));
        toast.success("Event payload copied to clipboard!");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border/80 p-0 overflow-hidden flex flex-col max-h-[85vh]">
                <DialogHeader className="p-4 border-b border-border/60 bg-purple-500/10">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-500">
                            <Activity className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Event Audit: {activity.title}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                {activity.module} • {activity.time}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 space-y-1">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Module:</span>
                            <Badge variant="outline" className="text-[10px] font-mono">{activity.module}</Badge>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Timestamp:</span>
                            <span className="font-mono text-foreground">{activity.time}</span>
                        </div>
                        <div className="pt-1 text-foreground font-medium">
                            {activity.desc}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase text-muted-foreground">Structured JSON Payload</span>
                            <Button variant="ghost" size="sm" onClick={handleCopyPayload} className="h-6 text-[10px] gap-1">
                                <Copy className="w-3 h-3" /> Copy JSON
                            </Button>
                        </div>
                        <pre className="p-3 rounded-lg bg-secondary/40 border border-border/60 font-mono text-[11px] overflow-x-auto text-foreground">
                            {JSON.stringify(activity.rawPayload || activity, null, 2)}
                        </pre>
                    </div>
                </div>

                <div className="p-3.5 border-t border-border/60 bg-secondary/15 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
