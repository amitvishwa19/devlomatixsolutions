'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
    PhoneCall,
    Car,
    MessageCircle,
    Video,
    DollarSign,
    Calendar,
    Clock,
    MapPin,
    User,
    Building2,
    CheckCircle2,
    Sparkles,
    AlertCircle,
    Plus,
    Search,
    Filter,
    Download,
    Printer,
    RefreshCw,
    TrendingUp,
    Target,
    ArrowUpRight,
    Check,
    ChevronDown,
    MoreVertical,
    Trash2,
    Edit3,
    Send,
    ExternalLink,
    Briefcase
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';

import { getDcrRecordsAction, deleteDcrRecordAction } from '../_actions/dcr-actions';
import DcrModal from './_components/DcrModal';
import AiFollowupModal from './_components/AiFollowupModal';

const OUTCOME_CONFIG = {
    HOT_LEAD: { label: '🔥 Hot Lead', bg: 'bg-rose-500/10 text-rose-600 border-rose-500/30' },
    PROPOSAL_SENT: { label: '📄 Proposal Sent', bg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30' },
    FOLLOWUP_SCHEDULED: { label: '⏰ Follow-up Set', bg: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
    WON: { label: '🏆 Deal Won', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
    GATEKEEPER: { label: '⏳ Gatekeeper / No Answer', bg: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
    NOT_INTERESTED: { label: '❌ Not Interested', bg: 'bg-red-500/10 text-red-600 border-red-500/30' },
    PAYMENT_COLLECTED: { label: '💵 Payment Collected', bg: 'bg-green-500/10 text-green-600 border-green-500/30' }
};

const TYPE_CONFIG = {
    PHONE_CALL: { label: 'Phone Call', icon: PhoneCall, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    FIELD_VISIT: { label: 'Field Visit', icon: Car, color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
    WHATSAPP: { label: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    VIDEO_DEMO: { label: 'Video Demo', icon: Video, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    PAYMENT_COLLECTION: { label: 'Collection', icon: DollarSign, color: 'text-green-600 bg-green-500/10 border-green-500/20' }
};

export default function DcrPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [records, setRecords] = useState([]);
    const [metrics, setMetrics] = useState({
        totalCalls: 0,
        fieldVisitsCount: 0,
        phoneCallsCount: 0,
        whatsAppCount: 0,
        positiveOutcomesCount: 0,
        conversionRate: 0,
        totalDealPotential: 0,
        followUpsScheduledCount: 0,
        dailyTarget: 12,
        targetAchievement: 0
    });

    const [loading, setLoading] = useState(true);
    const [dateRangeFilter, setDateRangeFilter] = useState('TODAY'); // 'TODAY', 'YESTERDAY', 'WEEK', 'ALL', 'CUSTOM'
    const [customDate, setCustomDate] = useState(new Date().toISOString().slice(0, 10));
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [outcomeFilter, setOutcomeFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    const [aiRecord, setAiRecord] = useState(null);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);

    const fetchRecords = useCallback(async () => {
        if (!workspaceId) return;
        setLoading(true);
        try {
            let filterDate = undefined;
            let startDate = undefined;
            let endDate = undefined;

            const todayStr = new Date().toISOString().slice(0, 10);
            if (dateRangeFilter === 'TODAY') {
                filterDate = todayStr;
            } else if (dateRangeFilter === 'YESTERDAY') {
                const yest = new Date();
                yest.setDate(yest.getDate() - 1);
                filterDate = yest.toISOString().slice(0, 10);
            } else if (dateRangeFilter === 'WEEK') {
                const now = new Date();
                const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
                startDate = firstDay.toISOString().slice(0, 10);
                endDate = todayStr;
            } else if (dateRangeFilter === 'CUSTOM') {
                filterDate = customDate;
            }

            const res = await getDcrRecordsAction(workspaceId, {
                date: filterDate,
                startDate,
                endDate,
                callType: typeFilter,
                outcome: outcomeFilter,
                search: searchQuery
            });

            if (res.success) {
                setRecords(res.data.records);
                setMetrics(res.data.metrics);
            } else {
                toast.error(res.error || "Failed to load activity records");
            }
        } catch (err) {
            toast.error("Network error while loading activity records");
        } finally {
            setLoading(false);
        }
    }, [workspaceId, dateRangeFilter, customDate, typeFilter, outcomeFilter, searchQuery]);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const handleDelete = async (recordId) => {
        if (!confirm("Are you sure you want to delete this activity record?")) return;
        try {
            const res = await deleteDcrRecordAction(workspaceId, recordId);
            if (res.success) {
                toast.success("Activity record deleted");
                fetchRecords();
            } else {
                toast.error(res.error || "Failed to delete record");
            }
        } catch (err) {
            toast.error("Failed to delete record");
        }
    };

    const handleExportCsv = () => {
        if (!records.length) {
            toast.error("No records available to export");
            return;
        }

        const headers = ["Date & Time", "Type", "Client / Account", "Contact Person", "Phone", "Purpose", "Conversation Notes", "Outcome", "Next Follow-Up Date", "Next Action", "Deal Potential (INR)", "Location", "Duration (Mins)"];
        const rows = records.map(r => [
            new Date(r.createdAt).toLocaleString(),
            r.callType,
            `"${(r.clientName || '').replace(/"/g, '""')}"`,
            `"${(r.contactPerson || '').replace(/"/g, '""')}"`,
            r.phone,
            `"${(r.callPurpose || '').replace(/"/g, '""')}"`,
            `"${(r.description || '').replace(/"/g, '""')}"`,
            r.outcome,
            r.nextFollowUpDate ? new Date(r.nextFollowUpDate).toLocaleString() : '',
            `"${(r.nextFollowUpAction || '').replace(/"/g, '""')}"`,
            r.dealValue || 0,
            `"${(r.location || '').replace(/"/g, '""')}"`,
            r.durationMinutes || 15
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Activity_Center_Report_${dateRangeFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Activity Center CSV Export downloaded successfully!");
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* Top Title & Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                            <PhoneCall className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                Activity Center
                                <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                                    Calls, Visits & Meetings
                                </Badge>
                            </h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Track daily client conversations, on-site field visits, objections, and scheduled follow-ups.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Date Quick Selector */}
                    <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border">
                        <button
                            onClick={() => setDateRangeFilter('TODAY')}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                dateRangeFilter === 'TODAY'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setDateRangeFilter('YESTERDAY')}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                dateRangeFilter === 'YESTERDAY'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Yesterday
                        </button>
                        <button
                            onClick={() => setDateRangeFilter('WEEK')}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                dateRangeFilter === 'WEEK'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => setDateRangeFilter('ALL')}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                dateRangeFilter === 'ALL'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            All Logs
                        </button>
                    </div>

                    {dateRangeFilter === 'CUSTOM' && (
                        <Input
                            type="date"
                            value={customDate}
                            onChange={(e) => setCustomDate(e.target.value)}
                            className="h-8 w-36 text-xs"
                        />
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportCsv}
                        className="h-8 text-xs gap-1.5"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                    </Button>

                    <Button
                        size="sm"
                        onClick={() => {
                            setEditingRecord(null);
                            setIsModalOpen(true);
                        }}
                        className="h-8 text-xs gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Log Sales Activity</span>
                    </Button>
                </div>
            </div>

            {/* Daily Performance & KPI Metrics Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* Metric 1: Total Calls Logged & Daily Target */}
                <div className="p-4 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Calls & Visits</span>
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                            <PhoneCall className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-black tracking-tight text-foreground">
                            {metrics.totalCalls}
                            <span className="text-xs font-normal text-muted-foreground ml-1">/ {metrics.dailyTarget} target</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <Progress value={metrics.targetAchievement} className="h-1.5 flex-1" />
                            <span className="text-[10px] font-bold text-muted-foreground">{metrics.targetAchievement}%</span>
                        </div>
                    </div>
                </div>

                {/* Metric 2: Field Visits vs Phone Calls */}
                <div className="p-4 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Field vs Calls</span>
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                            <Car className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-amber-600">{metrics.fieldVisitsCount}</span>
                            <span className="text-xs text-muted-foreground font-semibold">Visits</span>
                            <span className="text-slate-300 dark:text-slate-700">|</span>
                            <span className="text-xl font-bold text-blue-600">{metrics.phoneCallsCount}</span>
                            <span className="text-xs text-muted-foreground">Calls</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                            <MessageCircle className="w-3 h-3 text-emerald-500" /> {metrics.whatsAppCount} WhatsApp touchpoints
                        </p>
                    </div>
                </div>

                {/* Metric 3: Positive Outcomes / Win Rate */}
                <div className="p-4 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Positive Outcomes</span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-black tracking-tight text-emerald-600">
                            {metrics.positiveOutcomesCount}
                            <span className="text-xs font-semibold text-muted-foreground ml-1.5">({metrics.conversionRate}%)</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1.5">
                            Hot Leads, Quotes & Closed Deals
                        </p>
                    </div>
                </div>

                {/* Metric 4: Pipeline Potential Generated */}
                <div className="p-4 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Potential Generated</span>
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                            <DollarSign className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-black tracking-tight text-indigo-600">
                            ₹{metrics.totalDealPotential.toLocaleString('en-IN')}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1.5">
                            Total Commercial Value Discussed
                        </p>
                    </div>
                </div>

                {/* Metric 5: Follow-ups Scheduled */}
                <div className="p-4 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Follow-Ups Set</span>
                        <div className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center">
                            <Calendar className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-black tracking-tight text-violet-600">
                            {metrics.followUpsScheduledCount}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1.5">
                            Synced to Calendar & Tasks
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-card border border-border rounded-xl">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by client, contact person, phone number, discussion keyword..."
                        className="pl-9 h-9 text-xs bg-background"
                    />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="h-9 w-36 text-xs bg-background">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL" className="text-xs">All Call Types</SelectItem>
                            <SelectItem value="PHONE_CALL" className="text-xs">📞 Phone Call</SelectItem>
                            <SelectItem value="FIELD_VISIT" className="text-xs">🚗 Field Visit</SelectItem>
                            <SelectItem value="WHATSAPP" className="text-xs">💬 WhatsApp</SelectItem>
                            <SelectItem value="VIDEO_DEMO" className="text-xs">💻 Video Demo</SelectItem>
                            <SelectItem value="PAYMENT_COLLECTION" className="text-xs">💵 Payment Collection</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                        <SelectTrigger className="h-9 w-40 text-xs bg-background">
                            <SelectValue placeholder="All Outcomes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL" className="text-xs">All Outcomes</SelectItem>
                            <SelectItem value="HOT_LEAD" className="text-xs">🔥 Hot Lead</SelectItem>
                            <SelectItem value="PROPOSAL_SENT" className="text-xs">📄 Proposal Sent</SelectItem>
                            <SelectItem value="FOLLOWUP_SCHEDULED" className="text-xs">⏰ Follow-up Set</SelectItem>
                            <SelectItem value="WON" className="text-xs">🏆 Deal Won</SelectItem>
                            <SelectItem value="GATEKEEPER" className="text-xs">⏳ Gatekeeper / No Answer</SelectItem>
                            <SelectItem value="NOT_INTERESTED" className="text-xs">❌ Not Interested</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchRecords}
                        disabled={loading}
                        className="h-9 w-9"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Records List / Table */}
            {loading ? (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3 bg-card border border-border rounded-xl">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    <p className="text-xs font-medium">Loading Activity Center Records...</p>
                </div>
            ) : records.length === 0 ? (
                <div className="p-16 text-center bg-card border border-dashed border-border rounded-2xl flex flex-col items-center justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                        <PhoneCall className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">No Activity Records Found</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">
                        {searchQuery || typeFilter !== 'ALL' || outcomeFilter !== 'ALL'
                            ? "No activity records match the applied filters. Try resetting the filters."
                            : "No field visits or calls logged for this date. Start recording your daily sales interactions to build CRM intelligence."}
                    </p>
                    <Button
                        onClick={() => {
                            setEditingRecord(null);
                            setIsModalOpen(true);
                        }}
                        className="gap-2 text-xs font-semibold"
                        size="sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Log First Activity</span>
                    </Button>
                </div>
            ) : (
                <div className="space-y-3.5">
                    {records.map((record) => {
                        const typeInfo = TYPE_CONFIG[record.callType] || TYPE_CONFIG.PHONE_CALL;
                        const TypeIcon = typeInfo.icon;
                        const outcomeInfo = OUTCOME_CONFIG[record.outcome] || OUTCOME_CONFIG.FOLLOWUP_SCHEDULED;
                        const cleanPhone = record.phone ? record.phone.replace(/[^0-9]/g, '') : '';

                        return (
                            <div
                                key={record.id}
                                className="p-4 sm:p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-200 shadow-xs hover:shadow-md space-y-3.5"
                            >
                                {/* Top Row: Type, Timestamp, Client Name, Quick Action Buttons */}
                                <div className="flex flex-wrap items-start justify-between gap-2.5">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl border flex items-center justify-center ${typeInfo.color}`}>
                                            <TypeIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-sm font-bold text-foreground">
                                                    {record.clientName}
                                                </h3>
                                                {record.contactPerson && record.contactPerson !== record.clientName && (
                                                    <span className="text-xs text-muted-foreground font-medium">
                                                        ({record.contactPerson})
                                                    </span>
                                                )}
                                                <Badge variant="outline" className={`text-[10px] font-semibold border ${outcomeInfo.bg}`}>
                                                    {outcomeInfo.label}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(record.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <span>•</span>
                                                <span>{record.durationMinutes || 15} mins duration</span>
                                                {record.location && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                                                            <MapPin className="w-3 h-3" />
                                                            {record.location}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Shortcuts */}
                                    <div className="flex items-center gap-1.5 ml-auto">
                                        {cleanPhone && (
                                            <>
                                                <a
                                                    href={`tel:${cleanPhone}`}
                                                    className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-blue-600 hover:text-blue-700 transition-colors"
                                                    title="Call client"
                                                >
                                                    <PhoneCall className="w-3.5 h-3.5" />
                                                </a>
                                                <a
                                                    href={`https://wa.me/${cleanPhone}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-emerald-600 hover:text-emerald-700 transition-colors"
                                                    title="Chat on WhatsApp"
                                                >
                                                    <MessageCircle className="w-3.5 h-3.5" />
                                                </a>
                                            </>
                                        )}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setAiRecord(record);
                                                setIsAiModalOpen(true);
                                            }}
                                            className="h-7 text-xs gap-1 border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10 px-2.5 font-medium"
                                        >
                                            <Sparkles className="w-3 h-3 text-indigo-500" />
                                            <span>AI Follow-Up</span>
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                                    <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setEditingRecord(record);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="text-xs gap-2"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5 text-muted-foreground" /> Edit Record
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(record.id)}
                                                    className="text-xs gap-2 text-rose-600 focus:text-rose-600"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Middle Row: Discussion Points & Conversation Summary */}
                                <div className="p-3 bg-muted/30 rounded-xl border border-border/60 text-xs text-foreground/90 leading-relaxed">
                                    <div className="font-semibold text-primary mb-1 flex items-center gap-1.5">
                                        <Briefcase className="w-3.5 h-3.5" />
                                        <span>Purpose: {record.callPurpose || 'Sales Discussion'}</span>
                                    </div>
                                    <p className="whitespace-pre-line text-muted-foreground">{record.description}</p>

                                    {record.objections && (
                                        <div className="mt-2 pt-2 border-t border-border/40 text-[11px] text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5">
                                            <AlertCircle className="w-3 h-3 shrink-0" />
                                            <span>Objection / Feedback: {record.objections}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Bottom Row: Next Follow-Up Plan & Commercial Potential */}
                                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                        {record.nextFollowUpDate ? (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-medium">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>
                                                    Follow-up: {new Date(record.nextFollowUpDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(record.nextFollowUpDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {record.nextFollowUpAction && (
                                                    <span className="text-muted-foreground font-normal">({record.nextFollowUpAction})</span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-[11px]">No follow-up date specified</span>
                                        )}

                                        {record.dealValue > 0 && (
                                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold">
                                                <DollarSign className="w-3.5 h-3.5" />
                                                <span>Potential: ₹{record.dealValue.toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                        <User className="w-3 h-3" />
                                        <span>Logged by <strong>{record.user?.displayName || 'Sales Representative'}</strong></span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* DCR Entry / Edit Modal */}
            <DcrModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                workspaceId={workspaceId}
                editRecord={editingRecord}
                onSuccess={() => fetchRecords()}
            />

            {/* AI Follow-Up Generator Modal */}
            <AiFollowupModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                workspaceId={workspaceId}
                record={aiRecord}
            />
        </div>
    );
}
