"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    FileSpreadsheet,
    Download,
    Printer,
    RefreshCw,
    Search,
    Filter,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    Users,
    Send,
    Workflow,
    ChevronLeft,
    ChevronRight,
    Copy,
    Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useAction } from "@/hooks/use-action";
import { getReports } from "./_actions/get-reports";
import { toast } from "sonner";
import AccountSwitcher from "../_components/AccountSwitcher";

export default function ReportsPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;
    const [mounted, setMounted] = useState(false);

    const [reportType, setReportType] = useState('messages');
    const [range, setRange] = useState('30');
    const [status, setStatus] = useState('ALL');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { execute: executeGetReports } = useAction(getReports, {
        onSuccess: (result) => {
            setData(result);
            setIsLoading(false);
            setIsRefreshing(false);
        },
        onError: (err) => {
            toast.error(err || "Failed to generate report");
            setIsLoading(false);
            setIsRefreshing(false);
        }
    });

    const fetchReport = (resetPage = false) => {
        setIsRefreshing(true);
        const targetPage = resetPage ? 1 : page;
        if (resetPage) setPage(1);

        executeGetReports({
            workspaceId,
            reportType,
            range,
            status,
            search,
            page: targetPage,
            pageSize
        });
    };

    useEffect(() => {
        if (mounted) {
            fetchReport(true);
        }
    }, [reportType, range, status, pageSize, mounted]);

    useEffect(() => {
        if (mounted) {
            fetchReport(false);
        }
    }, [page, mounted]);

    const handleCopy = (text, id) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleExportCSV = () => {
        if (!data?.rows || data.rows.length === 0) {
            toast.error("No report rows available to export");
            return;
        }

        const rows = data.rows;
        let headers = [];
        let csvRows = [];

        if (reportType === 'messages') {
            headers = ["Message ID", "Recipient Phone", "Contact Name", "Direction", "Type", "Template Name", "Message Text", "Status", "Timestamp"];
            csvRows = rows.map(r => [
                r.id,
                r.recipientPhone,
                r.contactName || '',
                r.direction,
                r.type,
                r.templateName || '',
                `"${(r.text || '').replace(/"/g, '""')}"`,
                r.status,
                r.createdAt
            ]);
        } else if (reportType === 'campaigns') {
            headers = ["Campaign ID", "Campaign Name", "Status", "Template", "Total Recipients", "Sent Count", "Failed Count", "Success Rate", "Created At"];
            csvRows = rows.map(r => [
                r.id,
                `"${r.name.replace(/"/g, '""')}"`,
                r.status,
                r.templateName,
                r.totalRecipients,
                r.sentCount,
                r.failedCount,
                r.successRate,
                r.createdAt
            ]);
        } else if (reportType === 'templates') {
            headers = ["Template ID", "Template Name", "Category", "Language", "Type", "Status", "Sent Count", "Read Count", "Delivery Rate", "Created At"];
            csvRows = rows.map(r => [
                r.id,
                r.name,
                r.category,
                r.language,
                r.type,
                r.status,
                r.sentCount,
                r.readCount,
                r.deliveryRate,
                r.createdAt
            ]);
        } else if (reportType === 'contacts') {
            headers = ["Contact ID", "Name", "Phone", "Email", "Total Interactions", "Inbound Replies", "Last Interaction", "Created At"];
            csvRows = rows.map(r => [
                r.id,
                `"${(r.name || '').replace(/"/g, '""')}"`,
                r.phone,
                r.email,
                r.totalInteractions,
                r.inboundReplies,
                r.lastInteraction || '',
                r.createdAt
            ]);
        }

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(","), ...csvRows.map(e => e.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `konnectx-${reportType}-report-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${reportType.toUpperCase()} report exported to CSV`);
    };

    const handleExportJSON = () => {
        if (!data?.rows || data.rows.length === 0) {
            toast.error("No report rows available to export");
            return;
        }

        const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data.rows, null, 2));
        const link = document.createElement("a");
        link.setAttribute("href", jsonContent);
        link.setAttribute("download", `konnectx-${reportType}-report-${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${reportType.toUpperCase()} report exported to JSON`);
    };

    const handlePrint = () => {
        window.print();
    };

    const totalCount = data?.pagination?.totalCount || 0;
    const totalPages = data?.pagination?.totalPages || 1;

    return (
        <ScrollArea className="h-full w-full">
            <div className="space-y-6 animate-in fade-in duration-500 p-4 md:p-6 pb-24 max-w-[1600px] mx-auto min-h-full print:p-0">
            {/* Top Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60 print:hidden">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" asChild>
                            <Link href={`/workspace/${workspaceId}/konnectx`}>
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                        </Button>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Reports & Audit Center</h2>
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-mono border-purple-500/30 bg-purple-500/10 text-purple-400">
                            EXPORT READY
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground ml-10">
                        Generate granular WhatsApp Cloud audit logs, broadcast campaigns, template telemetry, and audience records
                    </p>
                </div>

                <div className="flex items-center flex-wrap gap-2.5">
                    <AccountSwitcher />

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5 text-xs font-semibold"
                        onClick={handleExportCSV}
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5 text-xs font-semibold"
                        onClick={handleExportJSON}
                    >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        Export JSON
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5 text-xs font-semibold"
                        onClick={handlePrint}
                    >
                        <Printer className="w-3.5 h-3.5" />
                        Print
                    </Button>

                    <Button
                        size="sm"
                        className="h-9 gap-1.5 text-xs font-semibold shadow-xs"
                        asChild
                    >
                        <Link href={`/workspace/${workspaceId}/konnectx/analytics`}>
                            Analytics View
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Print Header (Visible only when printing) */}
            <div className="hidden print:block pb-4 mb-4 border-b">
                <h1 className="text-xl font-bold">KonnectX WhatsApp Business Suite - {reportType.toUpperCase()} REPORT</h1>
                <p className="text-xs text-muted-foreground">Generated on {new Date().toLocaleString()} • Date Range: {range} Days</p>
            </div>

            {/* Report Type Selector Tabs */}
            <div className="print:hidden">
                <Tabs value={reportType} onValueChange={(v) => { setReportType(v); setPage(1); }}>
                    <TabsList className="grid grid-cols-2 md:grid-cols-4 h-10 w-full max-w-2xl bg-card/60 border border-border/60 p-1">
                        <TabsTrigger value="messages" className="text-xs font-semibold gap-1.5">
                            <Send className="w-3.5 h-3.5" />
                            Message Logs
                        </TabsTrigger>
                        <TabsTrigger value="campaigns" className="text-xs font-semibold gap-1.5">
                            <Workflow className="w-3.5 h-3.5" />
                            Campaigns
                        </TabsTrigger>
                        <TabsTrigger value="templates" className="text-xs font-semibold gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Templates
                        </TabsTrigger>
                        <TabsTrigger value="contacts" className="text-xs font-semibold gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            Audience
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Filter Bar */}
            <Card className="bg-card/40 border-border/60 rounded-xl shadow-xs print:hidden">
                <CardContent className="px-4 py-0">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                        <div className="flex-1 flex items-center gap-2">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder={`Search ${reportType} by phone, name, or keyword...`}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchReport(true)}
                                    className="pl-9 h-9 text-xs bg-background/50 border-border/60"
                                />
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-9 px-3 text-xs font-semibold shrink-0"
                                onClick={() => fetchReport(true)}
                            >
                                Filter
                            </Button>
                        </div>

                        <div className="flex items-center flex-wrap gap-2.5">
                            {reportType === 'messages' && (
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-[125px] h-9 text-xs font-semibold bg-background/50 border-border/60">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Statuses</SelectItem>
                                        <SelectItem value="SENT">Outbound</SelectItem>
                                        <SelectItem value="INBOUND">Inbound</SelectItem>
                                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                                        <SelectItem value="READ">Read</SelectItem>
                                        <SelectItem value="FAILED">Failed</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}

                            <Select value={range} onValueChange={setRange}>
                                <SelectTrigger className="w-[120px] h-9 text-xs font-semibold bg-background/50 border-border/60">
                                    <SelectValue placeholder="Timeframe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">Last 7 Days</SelectItem>
                                    <SelectItem value="14">Last 14 Days</SelectItem>
                                    <SelectItem value="30">Last 30 Days</SelectItem>
                                    <SelectItem value="90">Last 90 Days</SelectItem>
                                    <SelectItem value="ALL">All Time</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                                <SelectTrigger className="w-[100px] h-9 text-xs font-semibold bg-background/50 border-border/60">
                                    <SelectValue placeholder="Page Size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10 / page</SelectItem>
                                    <SelectItem value="25">25 / page</SelectItem>
                                    <SelectItem value="50">50 / page</SelectItem>
                                    <SelectItem value="100">100 / page</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0"
                                onClick={() => fetchReport(false)}
                                disabled={isRefreshing}
                                title="Refresh Report"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Table Card */}
            <Card className="bg-card/40 border-border/60 rounded-xl shadow-xs overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-bold capitalize">
                                {reportType} Records ({totalCount})
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Showing page {page} of {totalPages}
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono border-border/60">
                            {data?.rows?.length || 0} visible on page
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="w-full">
                        <table className="w-full text-xs">
                            <thead className="border-b border-border/60 bg-muted/20 text-muted-foreground font-semibold">
                                {/* MESSAGES TABLE HEADERS */}
                                {reportType === 'messages' && (
                                    <tr className="text-left">
                                        <th className="px-4 py-3">Timestamp</th>
                                        <th className="px-4 py-3">Recipient / Phone</th>
                                        <th className="px-4 py-3">Contact</th>
                                        <th className="px-4 py-3">Direction</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Message Snippet</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                )}

                                {/* CAMPAIGNS TABLE HEADERS */}
                                {reportType === 'campaigns' && (
                                    <tr className="text-left">
                                        <th className="px-4 py-3">Created Date</th>
                                        <th className="px-4 py-3">Campaign Name</th>
                                        <th className="px-4 py-3">Template Used</th>
                                        <th className="px-4 py-3">Total Target</th>
                                        <th className="px-4 py-3">Sent Count</th>
                                        <th className="px-4 py-3">Failed</th>
                                        <th className="px-4 py-3">Success Rate</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                )}

                                {/* TEMPLATES TABLE HEADERS */}
                                {reportType === 'templates' && (
                                    <tr className="text-left">
                                        <th className="px-4 py-3">Template Name</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3">Language</th>
                                        <th className="px-4 py-3">Format</th>
                                        <th className="px-4 py-3">Total Sent</th>
                                        <th className="px-4 py-3">Total Read</th>
                                        <th className="px-4 py-3">Delivery Rate</th>
                                        <th className="px-4 py-3">Meta Status</th>
                                    </tr>
                                )}

                                {/* CONTACTS TABLE HEADERS */}
                                {reportType === 'contacts' && (
                                    <tr className="text-left">
                                        <th className="px-4 py-3">Contact Name</th>
                                        <th className="px-4 py-3">Phone Number</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Total Messages</th>
                                        <th className="px-4 py-3">Inbound Replies</th>
                                        <th className="px-4 py-3">Last Active</th>
                                        <th className="px-4 py-3">Created</th>
                                    </tr>
                                )}
                            </thead>

                            <tbody className="divide-y divide-border/20">
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map(i => (
                                        <tr key={i}>
                                            <td colSpan={8} className="p-4">
                                                <Skeleton className="h-4 w-full rounded" />
                                            </td>
                                        </tr>
                                    ))
                                ) : (!data?.rows || data.rows.length === 0) ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-12 text-muted-foreground">
                                            No records matched the selected filters.
                                        </td>
                                    </tr>
                                ) : (
                                    data.rows.map((row, idx) => {
                                        if (reportType === 'messages') {
                                            return (
                                                <tr key={idx} className="hover:bg-muted/10 transition-colors">
                                                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                                                        {new Date(row.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-foreground font-mono">
                                                        +{row.recipientPhone}
                                                    </td>
                                                    <td className="px-4 py-3 text-foreground font-medium truncate max-w-[120px]">
                                                        {row.contactName || <span className="text-muted-foreground/50 italic">—</span>}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline" className={`text-[10px] font-mono ${row.direction === 'OUTBOUND' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : 'border-blue-500/30 text-blue-400 bg-blue-500/5'}`}>
                                                            {row.direction}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="secondary" className="text-[9px] font-mono px-1.5 py-0">
                                                            {row.type}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 max-w-[280px] truncate text-muted-foreground">
                                                        {row.text}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline" className={`text-[10px] font-mono ${row.status === 'READ' ? 'text-purple-400 border-purple-500/30' :
                                                            row.status === 'DELIVERED' || row.status === 'SENT' ? 'text-emerald-400 border-emerald-500/30' :
                                                                row.status === 'FAILED' ? 'text-rose-400 border-rose-500/30' : 'text-blue-400 border-blue-500/30'
                                                            }`}>
                                                            {row.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() => handleCopy(row.text, row.id)}
                                                            title="Copy Message Text"
                                                        >
                                                            {copiedId === row.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        if (reportType === 'campaigns') {
                                            return (
                                                <tr key={idx} className="hover:bg-muted/10 transition-colors">
                                                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                                                        {new Date(row.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 font-bold text-foreground">
                                                        {row.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground font-mono">
                                                        {row.templateName}
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-foreground">
                                                        {row.totalRecipients}
                                                    </td>
                                                    <td className="px-4 py-3 text-emerald-400 font-semibold">
                                                        {row.sentCount}
                                                    </td>
                                                    <td className="px-4 py-3 text-rose-400">
                                                        {row.failedCount}
                                                    </td>
                                                    <td className="px-4 py-3 font-bold text-foreground">
                                                        {row.successRate}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline" className="text-[10px] font-mono">
                                                            {row.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        if (reportType === 'templates') {
                                            return (
                                                <tr key={idx} className="hover:bg-muted/10 transition-colors">
                                                    <td className="px-4 py-3 font-bold text-foreground">
                                                        {row.name}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline" className="text-[10px] font-mono">
                                                            {row.category}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground font-mono">
                                                        {row.language}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {row.type}
                                                    </td>
                                                    <td className="px-4 py-3 font-bold text-foreground">
                                                        {row.sentCount}
                                                    </td>
                                                    <td className="px-4 py-3 text-purple-400 font-semibold">
                                                        {row.readCount}
                                                    </td>
                                                    <td className="px-4 py-3 text-emerald-400 font-bold">
                                                        {row.deliveryRate}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                                                            {row.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        if (reportType === 'contacts') {
                                            return (
                                                <tr key={idx} className="hover:bg-muted/10 transition-colors">
                                                    <td className="px-4 py-3 font-bold text-foreground">
                                                        {row.name}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-muted-foreground">
                                                        {row.phone}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {row.email}
                                                    </td>
                                                    <td className="px-4 py-3 font-bold text-foreground">
                                                        {row.totalInteractions}
                                                    </td>
                                                    <td className="px-4 py-3 text-blue-400 font-semibold">
                                                        {row.inboundReplies}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                                                        {row.lastInteraction ? new Date(row.lastInteraction).toLocaleDateString() : '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                                                        {new Date(row.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return null;
                                    })
                                )}
                            </tbody>
                        </table>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </CardContent>

                {/* Table Pagination Footer */}
                {totalPages > 1 && (
                    <div className="p-3.5 border-t border-border/60 bg-muted/10 flex items-center justify-between print:hidden text-xs">
                        <div className="text-muted-foreground">
                            Page <span className="font-bold text-foreground">{page}</span> of <span className="font-bold text-foreground">{totalPages}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-xs font-semibold"
                                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                                Previous
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-xs font-semibold"
                                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={page >= totalPages}
                            >
                                Next
                                <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
        <ScrollBar orientation="vertical" />
    </ScrollArea>
    );
}
