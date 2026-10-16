'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FileSpreadsheet,
    Plus,
    Search,
    Filter,
    Download,
    Send,
    Eye,
    Trash2,
    Calendar,
    Building2,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    MoreVertical,
    RefreshCw,
    TrendingUp,
    FileText,
    Share2,
    MessageCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { toast } from "sonner";

import {
    getCrmQuotationsAction,
    deleteCrmQuotationAction,
    updateCrmQuotationStatusAction
} from '../_actions/quotation-actions';
import QuotationDocumentPreview, { CURRENCY_SYMBOLS } from './_components/QuotationDocumentPreview';
import SendQuotationModal from './_components/SendQuotationModal';

export default function CrmQuotationsDirectoryPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params?.workspaceId;

    const [quotations, setQuotations] = useState([]);
    const [metrics, setMetrics] = useState({
        totalQuotations: 0,
        totalValue: 0,
        acceptedValue: 0,
        sentValue: 0,
        draftCount: 0,
        acceptedCount: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Modals
    const [selectedPreviewQuotation, setSelectedPreviewQuotation] = useState(null);
    const [selectedSendQuotation, setSelectedSendQuotation] = useState(null);

    const loadQuotations = async (showToast = false) => {
        if (!workspaceId) return;
        try {
            if (showToast) setIsRefreshing(true);
            else setIsLoading(true);

            const res = await getCrmQuotationsAction(workspaceId, {
                status: statusFilter,
                search: searchQuery || undefined
            });

            if (res.success && res.data) {
                setQuotations(res.data.quotations || []);
                if (res.data.metrics) {
                    setMetrics(res.data.metrics);
                }
            } else {
                toast.error(res.error || "Failed to load quotations");
            }
            if (showToast) toast.success("Quotations refreshed");
        } catch (error) {
            console.error("Load quotations error:", error);
            toast.error("Error loading quotations");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadQuotations();
    }, [workspaceId, statusFilter]);

    // Client-side quick search filter
    const filteredQuotations = useMemo(() => {
        if (!searchQuery.trim()) return quotations;
        const q = searchQuery.toLowerCase();
        return quotations.filter(item =>
            (item.quotationNumber || '').toLowerCase().includes(q) ||
            (item.clientName || '').toLowerCase().includes(q) ||
            (item.data?.quotation?.title || '').toLowerCase().includes(q)
        );
    }, [quotations, searchQuery]);

    const handleDelete = async (e, id, number) => {
        e.stopPropagation();
        if (!confirm(`Are you sure you want to delete quotation ${number}?`)) return;

        try {
            const res = await deleteCrmQuotationAction(workspaceId, id);
            if (res.success) {
                toast.success("Quotation deleted");
                loadQuotations();
            } else {
                toast.error(res.error || "Failed to delete quotation");
            }
        } catch (error) {
            toast.error("Error deleting quotation");
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const res = await updateCrmQuotationStatusAction(workspaceId, id, newStatus);
            if (res.success) {
                toast.success(`Quotation marked as ${newStatus}`);
                loadQuotations();
            } else {
                toast.error(res.error || "Failed to update status");
            }
        } catch (error) {
            toast.error("Error updating status");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'accepted':
                return (
                    <Badge variant="outline" className="text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Accepted
                    </Badge>
                );
            case 'sent':
                return (
                    <Badge variant="outline" className="text-[10px] font-bold uppercase bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1">
                        <Send className="w-2.5 h-2.5" />
                        Sent
                    </Badge>
                );
            case 'declined':
                return (
                    <Badge variant="outline" className="text-[10px] font-bold uppercase bg-red-500/10 text-red-500 border-red-500/20 gap-1">
                        <XCircle className="w-2.5 h-2.5" />
                        Declined
                    </Badge>
                );
            case 'expired':
                return (
                    <Badge variant="outline" className="text-[10px] font-bold uppercase bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1">
                        <AlertCircle className="w-2.5 h-2.5" />
                        Expired
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-[10px] font-bold uppercase bg-muted text-muted-foreground gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        Draft
                    </Badge>
                );
        }
    };

    return (
        <div className="flex flex-col space-y-5 p-2 sm:p-0">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                        <span>Commercial Quotations</span>
                        <Badge variant="outline" className="text-xs font-mono font-bold bg-primary/10 text-primary border-primary/20">
                            {metrics.totalQuotations} Total
                        </Badge>
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Build customized proposals, calculate taxes, export branded PDFs, and dispatch directly via WhatsApp.
                    </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => loadQuotations(true)}
                        disabled={isRefreshing || isLoading}
                        className="h-9 px-3 text-xs"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>

                    <Button
                        size="sm"
                        className="h-9 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                        onClick={() => router.push(`/workspace/${workspaceId}/crm/quotations/new`)}
                    >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Create Quotation
                    </Button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs flex flex-col justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Total Pipeline Quoted
                    </span>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-xl sm:text-2xl font-black font-mono text-foreground">
                            ₹{metrics.totalValue.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium">
                            {metrics.totalQuotations} quotes
                        </span>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs flex flex-col justify-between">
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        Accepted & Closed
                    </span>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                            ₹{metrics.acceptedValue.toLocaleString()}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600">
                            {metrics.acceptedCount} accepted
                        </span>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs flex flex-col justify-between">
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Pending Client Review
                    </span>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-xl sm:text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                            ₹{metrics.sentValue.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                            Sent to client
                        </span>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs flex flex-col justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Drafts in Progress
                    </span>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-xl sm:text-2xl font-black font-mono text-foreground">
                            {metrics.draftCount}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                            Unsent proposals
                        </span>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-card rounded-2xl border border-border/70 shadow-xs">
                <div className="relative w-full sm:w-80">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                    <Input
                        placeholder="Search quotation #, client, title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-xs bg-background border-border/80"
                    />
                </div>

                {/* Status Switcher Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/60 w-full sm:w-auto overflow-x-auto">
                    {[
                        { id: 'ALL', label: 'All' },
                        { id: 'draft', label: 'Drafts' },
                        { id: 'sent', label: 'Sent' },
                        { id: 'accepted', label: 'Accepted' },
                        { id: 'declined', label: 'Declined' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setStatusFilter(tab.id)}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                                statusFilter === tab.id
                                    ? 'bg-card text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quotations Table */}
            <div className="border border-border/70 rounded-2xl bg-card overflow-hidden shadow-xs">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-16 text-muted-foreground">
                        <RefreshCw className="w-6 h-6 animate-spin text-primary mb-2" />
                        <span className="text-xs font-medium">Loading quotations...</span>
                    </div>
                ) : filteredQuotations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3 text-muted-foreground">
                            <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">No quotations found</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mt-1">
                            {searchQuery ? "No quotations match your search criteria." : "Create your first commercial quotation to send to a client."}
                        </p>
                        <Button
                            size="sm"
                            className="mt-4 text-xs font-semibold"
                            onClick={() => router.push(`/workspace/${workspaceId}/crm/quotations/new`)}
                        >
                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                            Create Quotation
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                                <tr>
                                    <th className="py-3 px-4">Quotation #</th>
                                    <th className="py-3 px-4">Client & Organization</th>
                                    <th className="py-3 px-4">Proposal Title</th>
                                    <th className="py-3 px-4">Total Amount</th>
                                    <th className="py-3 px-4">Valid Until</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {filteredQuotations.map((q) => {
                                    const details = q.data || {};
                                    const currency = details.quotation?.currency || 'INR';
                                    const symbol = CURRENCY_SYMBOLS[currency] || '₹';
                                    const client = details.client || {};

                                    return (
                                        <tr
                                            key={q.id}
                                            className="hover:bg-muted/40 transition-colors cursor-pointer group"
                                            onClick={() => router.push(`/workspace/${workspaceId}/crm/quotations/${q.id}`)}
                                        >
                                            {/* Quotation Number */}
                                            <td className="py-3.5 px-4 font-mono font-bold text-primary">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                                                    <span>{q.quotationNumber}</span>
                                                </div>
                                            </td>

                                            {/* Client & Company */}
                                            <td className="py-3.5 px-4 font-semibold text-foreground">
                                                <div>
                                                    <p className="font-bold">{q.clientName || 'Independent Client'}</p>
                                                    {client.company && (
                                                        <p className="text-[11px] text-muted-foreground font-normal">
                                                            {client.company}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Title */}
                                            <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate">
                                                {details.quotation?.title || 'Commercial Proposal'}
                                            </td>

                                            {/* Grand Total */}
                                            <td className="py-3.5 px-4 font-mono font-black text-foreground">
                                                {symbol}{Number(q.total || 0).toLocaleString()}
                                            </td>

                                            {/* Valid Until */}
                                            <td className="py-3.5 px-4 text-muted-foreground font-mono">
                                                {details.quotation?.validUntil || (q.createdAt ? new Date(q.createdAt).toLocaleDateString() : '-')}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-3.5 px-4">
                                                {getStatusBadge(q.status)}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* WhatsApp Outreach */}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-lg text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600"
                                                        title="Send to client via WhatsApp"
                                                        onClick={() => setSelectedSendQuotation(q)}
                                                    >
                                                        <MessageCircle className="w-3.5 h-3.5" />
                                                    </Button>

                                                    {/* Quick Preview */}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                                                        title="Quick Preview"
                                                        onClick={() => setSelectedPreviewQuotation(q)}
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Button>

                                                    {/* Status Dropdown */}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                                                            >
                                                                <MoreVertical className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="text-xs">
                                                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(q.id, 'draft')}>
                                                                Mark as Draft
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(q.id, 'sent')}>
                                                                Mark as Sent
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(q.id, 'accepted')}>
                                                                Mark as Accepted (Won)
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(q.id, 'declined')}>
                                                                Mark as Declined
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={(e) => handleDelete(e, q.id, q.quotationNumber)}
                                                                className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                                                            >
                                                                Delete Quotation
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Quick Document Preview Modal */}
            <Dialog
                open={!!selectedPreviewQuotation}
                onOpenChange={(open) => !open && setSelectedPreviewQuotation(null)}
            >
                <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader className="pb-2 border-b border-border">
                        <DialogTitle className="text-base font-bold flex items-center justify-between">
                            <span>Quotation Document Preview</span>
                            <Badge variant="outline" className="font-mono text-xs">
                                {selectedPreviewQuotation?.quotationNumber}
                            </Badge>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedPreviewQuotation && (
                        <QuotationDocumentPreview
                            data={selectedPreviewQuotation}
                            showActions={true}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* WhatsApp Client Dispatch Modal */}
            <SendQuotationModal
                isOpen={!!selectedSendQuotation}
                onClose={() => setSelectedSendQuotation(null)}
                workspaceId={workspaceId}
                quotation={selectedSendQuotation}
                onSuccess={() => loadQuotations()}
            />
        </div>
    );
}
