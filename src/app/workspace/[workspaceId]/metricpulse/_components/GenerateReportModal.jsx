'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    FileText,
    Download,
    Calendar,
    Sparkles,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { generateReport } from '../_actions/metricpulse-actions';

export function GenerateReportModal({ open, onOpenChange, workspaceId, onReportGenerated }) {
    const [generating, setGenerating] = useState(false);
    const [title, setTitle] = useState('');
    const [timeframe, setTimeframe] = useState('Last 30 Days');
    const [format, setFormat] = useState('Executive PDF Report');
    const [modules, setModules] = useState({
        ecommerce: true,
        whatsapp: true,
        deskflow: true,
        payflow: true,
        flowgenix: true
    });

    const handleToggleModule = (key) => {
        setModules({ ...modules, [key]: !modules[key] });
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        const reportTitle = title.trim() || `Workspace Performance Digest (${timeframe})`;

        setGenerating(true);
        const res = await generateReport(workspaceId, {
            title: reportTitle,
            timeframe,
            format,
            notes: `Consolidated digest for ${timeframe} across active modules.`
        });

        if (res.success) {
            toast.success(`Executive report "${reportTitle}" generated successfully!`);
            onOpenChange(false);
            setTitle('');
            if (onReportGenerated) onReportGenerated(res.data);
        } else {
            toast.error(res.error || "Failed to generate report");
        }
        setGenerating(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border/80 p-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-4 border-b border-border/60 bg-purple-500/10">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-500">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Generate Executive Analytics Digest
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Compile cross-module intelligence, revenue, and SLA summaries.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleGenerate} className="p-5 space-y-3.5 text-xs">
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Report Title (Optional)</Label>
                        <Input
                            placeholder="e.g. Q3 2026 Executive Financial & Growth Review"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-8 text-xs bg-secondary/30 border-border/80"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Timeframe</Label>
                            <Select value={timeframe} onValueChange={setTimeframe}>
                                <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
                                    <SelectItem value="Last 30 Days">Last 30 Days (MTD)</SelectItem>
                                    <SelectItem value="Q3 2026">Q3 2026 (Quarterly)</SelectItem>
                                    <SelectItem value="Year-to-Date (YTD)">Year-to-Date (YTD)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Output Format</Label>
                            <Select value={format} onValueChange={setFormat}>
                                <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Executive PDF Report">Executive PDF (High-Res)</SelectItem>
                                    <SelectItem value="Raw Data CSV">Raw Data CSV Sheet</SelectItem>
                                    <SelectItem value="JSON Data Payload">Developer JSON</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2 pt-1">
                        <Label className="text-xs font-semibold uppercase text-muted-foreground text-[10px]">Include Module Metrics</Label>
                        <div className="space-y-1.5 p-3 rounded-lg bg-secondary/30 border border-border/40">
                            {[
                                { key: 'ecommerce', label: 'eCommerce Orders & GMV Revenue' },
                                { key: 'payflow', label: 'PayFlow Invoices & Recurring MRR' },
                                { key: 'whatsapp', label: 'KonnectX WhatsApp Broadcasts & Delivery' },
                                { key: 'deskflow', label: 'DeskFlow Customer SLA & CSAT' },
                                { key: 'flowgenix', label: 'FlowGenix AI Tokens & Cost Analytics' }
                            ].map((m) => (
                                <div key={m.key} className="flex items-center gap-2">
                                    <Checkbox
                                        id={m.key}
                                        checked={modules[m.key]}
                                        onCheckedChange={() => handleToggleModule(m.key)}
                                    />
                                    <label htmlFor={m.key} className="text-xs font-medium text-foreground cursor-pointer">
                                        {m.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                        <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={generating} className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-xs">
                            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Generate & Download'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
