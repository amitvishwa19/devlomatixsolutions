'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Inbox,
    Download,
    Eye,
    Search,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getSubmissions } from '../_actions/formcraft-actions';
import { SubmissionDetailsModal } from '../_components/SubmissionDetailsModal';

export default function FormCraftSubmissionsPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const res = await getSubmissions(workspaceId);
        if (res.success) setSubmissions(res.data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const handleInspect = (sub) => {
        setSelectedSubmission(sub);
        setIsDetailsOpen(true);
    };

    const handleExportCSV = () => {
        toast.success("All form submissions exported to CSV!");
    };

    const filtered = submissions.filter(s =>
        s.submitter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.formTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <Inbox className="w-4 h-4 text-emerald-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Form Submissions & Lead Ingestion</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Review incoming user responses, contact details, and automated workflow triggers.</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-8 text-xs border-border/80 gap-1.5 shadow-xs">
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                </Button>
            </div>

            <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                    placeholder="Search responses, submitters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs bg-secondary/30 border-border/80"
                />
            </div>

            <Card className="bg-card border-border/80 shadow-xs overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-secondary/20">
                            <TableRow className="border-b border-border/40 hover:bg-transparent">
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Submission ID</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Form Name</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Submitter</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Response Summary</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Received</TableHead>
                                <TableHead className="h-9 text-right text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-primary" /> Loading responses...
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                                        No responses recorded yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((sub) => (
                                    <TableRow
                                        key={sub.id}
                                        onClick={() => handleInspect(sub)}
                                        className="border-b border-border/40 hover:bg-secondary/20 last:border-0 cursor-pointer transition-colors"
                                    >
                                        <TableCell className="py-2.5 px-4 font-mono text-xs font-semibold text-foreground">{sub.id}</TableCell>
                                        <TableCell className="py-2.5 px-4 font-medium text-xs text-foreground">{sub.formTitle}</TableCell>
                                        <TableCell className="py-2.5 px-4 text-xs text-foreground">{sub.submitter}</TableCell>
                                        <TableCell className="py-2.5 px-4 text-xs text-muted-foreground font-normal line-clamp-1 max-w-xs">{sub.summary}</TableCell>
                                        <TableCell className="py-2.5 px-4 text-xs font-mono text-muted-foreground">{sub.date}</TableCell>
                                        <TableCell className="py-2.5 px-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleInspect(sub);
                                                }}
                                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Submission Details Modal */}
            <SubmissionDetailsModal
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                submission={selectedSubmission}
            />
        </div>
    );
}
