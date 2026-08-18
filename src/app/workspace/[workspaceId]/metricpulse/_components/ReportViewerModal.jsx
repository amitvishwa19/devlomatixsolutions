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
    FileText,
    Download,
    Send,
    Printer,
    CheckCircle2,
    Calendar,
    Share2,
    BarChart3,
    TrendingUp,
    IndianRupee
} from 'lucide-react';
import { toast } from 'sonner';

export function ReportViewerModal({ open, onOpenChange, report }) {
    if (!report) return null;

    const handleDownload = () => {
        toast.success(`Downloaded official PDF for "${report.title}"`);
    };

    const handleEmail = () => {
        toast.success(`Executive report emailed to workspace administrators!`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl bg-card border-border/80 p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <DialogHeader className="p-4 border-b border-border/60 bg-purple-500/10 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-500">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                {report.title}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Generated: {report.generatedAt} • {report.size} • {report.frequency}
                            </DialogDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-mono bg-purple-500/10 text-purple-500 border-purple-500/20">
                        {report.status}
                    </Badge>
                </DialogHeader>

                <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs bg-card">
                    {/* Executive Scorecard */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 text-center">
                            <span className="text-[10px] text-muted-foreground block">Gross Revenue</span>
                            <span className="font-bold text-sm text-foreground">₹64,92,000</span>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 text-center">
                            <span className="text-[10px] text-muted-foreground block">Total Orders</span>
                            <span className="font-bold text-sm text-foreground">482</span>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 text-center">
                            <span className="text-[10px] text-muted-foreground block">CSAT Score</span>
                            <span className="font-bold text-sm text-emerald-500">98.2%</span>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 text-center">
                            <span className="text-[10px] text-muted-foreground block">AI Tokens</span>
                            <span className="font-bold text-sm text-purple-500">1.84M</span>
                        </div>
                    </div>

                    {/* Executive Summary */}
                    <div className="p-3.5 rounded-lg bg-secondary/20 border border-border/40 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Executive Summary</span>
                        <p className="text-xs text-foreground leading-relaxed">
                            {report.summary || 'Strong performance across all business units with a 18.4% month-over-month expansion in unified pipeline and automated WhatsApp conversational conversions.'}
                        </p>
                    </div>

                    {/* Module Key Takeaways */}
                    <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Key Module Metrics</span>
                        <div className="space-y-2">
                            <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/40 flex justify-between items-center">
                                <div>
                                    <span className="font-semibold text-foreground">eCommerce & PayFlow Revenue</span>
                                    <p className="text-[11px] text-muted-foreground">482 direct store checkouts + 12 enterprise invoices paid</p>
                                </div>
                                <Badge variant="outline" className="text-xs font-mono text-emerald-500 bg-emerald-500/10">₹52.6L</Badge>
                            </div>
                            <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/40 flex justify-between items-center">
                                <div>
                                    <span className="font-semibold text-foreground">KonnectX WhatsApp Engagement</span>
                                    <p className="text-[11px] text-muted-foreground">42,800 messages delivered • 98.4% delivery success rate</p>
                                </div>
                                <Badge variant="outline" className="text-xs font-mono text-emerald-500 bg-emerald-500/10">+24.1%</Badge>
                            </div>
                            <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/40 flex justify-between items-center">
                                <div>
                                    <span className="font-semibold text-foreground">DeskFlow Customer Support SLA</span>
                                    <p className="text-[11px] text-muted-foreground">3m 45s average ticket resolution time • 0 SLA breaches</p>
                                </div>
                                <Badge variant="outline" className="text-xs font-mono text-sky-500 bg-sky-500/10">100% SLA</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-3.5 border-t border-border/60 bg-secondary/15 flex items-center justify-between gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                        Close
                    </Button>
                    <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="sm" onClick={handleEmail} className="h-8 text-xs border-border/80 gap-1">
                            <Send className="w-3 h-3" /> Email Digest
                        </Button>
                        <Button size="sm" onClick={handleDownload} className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1 shadow-xs">
                            <Download className="w-3.5 h-3.5" /> Download PDF
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
