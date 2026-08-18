'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    PieChart,
    Download,
    Plus,
    FileText,
    CheckCircle2,
    Eye,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getReports } from '../_actions/metricpulse-actions';
import { GenerateReportModal } from '../_components/GenerateReportModal';
import { ReportViewerModal } from '../_components/ReportViewerModal';

export default function MetricPulseReportsPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const res = await getReports(workspaceId);
        if (res.success) setReports(res.data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const handleInspect = (rep) => {
        setSelectedReport(rep);
        setIsViewerOpen(true);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <PieChart className="w-4 h-4 text-purple-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Executive Reports & Intelligence Digests</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Download comprehensive workspace analytics reports formatted for stakeholder reviews.</p>
                </div>

                <Button
                    size="sm"
                    onClick={() => setIsGenerateOpen(true)}
                    className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1.5 shadow-xs"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Generate New Report
                </Button>
            </div>

            {loading ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" /> Loading executive reports...
                </div>
            ) : reports.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                    No reports generated yet
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {reports.map((rep) => (
                        <Card
                            key={rep.id}
                            onClick={() => handleInspect(rep)}
                            className="bg-card border-border/80 p-4 space-y-3 shadow-xs flex flex-col justify-between hover:border-purple-500/40 cursor-pointer transition-all"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <Badge variant="outline" className="text-[9px] font-mono">{rep.frequency}</Badge>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-xs text-foreground">{rep.title}</h3>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">
                                        Generated: {rep.generatedAt} • {rep.size}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleInspect(rep)}
                                    className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                                >
                                    <Eye className="w-3 h-3" /> Preview
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toast.success(`Downloading official PDF for "${rep.title}"...`)}
                                    className="h-7 text-xs border-border/80 gap-1"
                                >
                                    <Download className="w-3 h-3" /> PDF
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Generate Report Modal */}
            <GenerateReportModal
                open={isGenerateOpen}
                onOpenChange={setIsGenerateOpen}
                workspaceId={workspaceId}
                onReportGenerated={() => loadData()}
            />

            {/* Report Viewer Modal */}
            <ReportViewerModal
                open={isViewerOpen}
                onOpenChange={setIsViewerOpen}
                report={selectedReport}
            />
        </div>
    );
}
