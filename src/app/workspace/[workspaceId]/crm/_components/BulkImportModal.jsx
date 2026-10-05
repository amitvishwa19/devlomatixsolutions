'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    UploadCloud,
    FileSpreadsheet,
    MessageCircle,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Download,
    Sparkles,
    Users,
    TrendingUp,
    RefreshCw,
    ArrowRight
} from 'lucide-react';
import { toast } from "sonner";

import { bulkImportContactsAndDealsAction, syncWhatsAppChatsToCrmAction } from '../_actions/crm-import-sync-actions';

export default function BulkImportModal({ isOpen, onClose, workspaceId, onImportComplete }) {
    const [activeTab, setActiveTab] = useState('paste');

    // Paste / CSV Text State
    const [rawText, setRawText] = useState(
`Name, Phone, Email, Company, Deal Title, Value
Rajesh Kumar, +91 98201 11223, rajesh@techcorp.in, TechCorp India, Cloud ERP Retainer, 350000
Pooja Mehta, +91 98110 33445, pooja@apexdesign.co, Apex Design, Brand Redesign & Portal, 180000
Anand Sharma, +91 97230 55667, anand@hyperlog.com, Hyper Logistics, WhatsApp API Integration, 120000
Sunita Rao, +91 99012 77889, sunita@innovate.dev, Innovate AI, FlowGenix Custom License, 250000`
    );

    // Options
    const [skipDuplicates, setSkipDuplicates] = useState(true);
    const [autoCreateDeals, setAutoCreateDeals] = useState(true);
    const [sendWelcomeWhatsApp, setSendWelcomeWhatsApp] = useState(false);

    // Import State
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);

    // WhatsApp Sync State
    const [isSyncingWA, setIsSyncingWA] = useState(false);
    const [syncResult, setSyncResult] = useState(null);

    const parseCSV = (text) => {
        const lines = text.trim().split('\n').filter(l => l.trim().length > 0);
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            headers.forEach((h, idx) => {
                const val = values[idx] || '';
                if (h.includes('name')) row.name = val;
                else if (h.includes('phone') || h.includes('mobile')) row.phone = val;
                else if (h.includes('email')) row.email = val;
                else if (h.includes('company') || h.includes('org')) row.company = val;
                else if (h.includes('deal') || h.includes('title')) row.dealTitle = val;
                else if (h.includes('value') || h.includes('amount')) row.dealValue = val;
            });
            if (row.name || row.phone) {
                rows.push(row);
            }
        }
        return rows;
    };

    const handleRunImport = async () => {
        const rows = parseCSV(rawText);
        if (rows.length === 0) {
            toast.error("No valid rows detected. Please ensure you have Name and Phone columns.");
            return;
        }

        try {
            setIsImporting(true);
            const res = await bulkImportContactsAndDealsAction(workspaceId, rows, {
                skipDuplicates,
                autoCreateDeals,
                sendWelcomeWhatsApp
            });

            if (res.success) {
                setImportResult(res.data);
                toast.success(`Import complete! ${res.data.importedContacts} contacts added.`);
                if (onImportComplete) onImportComplete();
            } else {
                toast.error(res.error || "Bulk import failed");
            }
        } catch (error) {
            console.error("Bulk import error:", error);
            toast.error("Import processing error");
        } finally {
            setIsImporting(false);
        }
    };

    const handleSyncWhatsApp = async () => {
        try {
            setIsSyncingWA(true);
            const res = await syncWhatsAppChatsToCrmAction(workspaceId);
            if (res.success) {
                setSyncResult(res.data);
                toast.success(res.data.message);
                if (onImportComplete) onImportComplete();
            } else {
                toast.error(res.error || "WhatsApp sync failed");
            }
        } catch (error) {
            console.error("WhatsApp sync error:", error);
            toast.error("Error synchronizing chats");
        } finally {
            setIsSyncingWA(false);
        }
    };

    const downloadSampleCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8,Name,Phone,Email,Company,Deal Title,Value\nJohn Doe,+91 98201 11223,john@example.com,Acme Corp,Enterprise SaaS,250000\nJane Smith,+91 98110 33445,jane@example.com,Global Tech,WhatsApp Funnel,150000";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "devlomatix_crm_lead_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const previewRows = parseCSV(rawText);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 bg-card border-border shadow-2xl">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-xl font-black text-foreground flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-sm">
                            <UploadCloud className="w-4 h-4" />
                        </div>
                        <span>Bulk Lead Importer & WhatsApp Chat Sync</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Ingest bulk lead spreadsheets, auto-provision pipeline opportunities, and sync KonnectX WhatsApp conversations.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 mt-2">
                    <TabsList className="bg-muted/50 p-1 rounded-xl">
                        <TabsTrigger value="paste" className="text-xs font-bold gap-1.5">
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span>CSV & Spreadsheet Paste</span>
                        </TabsTrigger>
                        <TabsTrigger value="wasync" className="text-xs font-bold gap-1.5 text-emerald-600">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>KonnectX Chat Auto-Sync</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: CSV / Spreadsheet Paste */}
                    <TabsContent value="paste" className="space-y-4 outline-none">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Paste CSV / Tab-Delimited Data:
                                </Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={downloadSampleCSV}
                                    className="h-7 text-[11px] gap-1 text-primary hover:bg-primary/10 font-semibold"
                                >
                                    <Download className="w-3 h-3" />
                                    <span>Download CSV Template</span>
                                </Button>
                            </div>

                            <Textarea
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                                rows={6}
                                className="text-xs font-mono bg-muted/20 border-border"
                                placeholder="Name, Phone, Email, Company, Deal Title, Value..."
                            />
                        </div>

                        {/* Options Switches */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-muted/20 border border-border/70 text-xs">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-semibold text-foreground block">Skip Duplicates</span>
                                    <span className="text-[10px] text-muted-foreground">Ignore existing phones</span>
                                </div>
                                <Switch checked={skipDuplicates} onCheckedChange={setSkipDuplicates} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-semibold text-foreground block">Auto-Create Deals</span>
                                    <span className="text-[10px] text-muted-foreground">Add to default pipeline</span>
                                </div>
                                <Switch checked={autoCreateDeals} onCheckedChange={setAutoCreateDeals} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-semibold text-foreground block">WhatsApp Welcome</span>
                                    <span className="text-[10px] text-muted-foreground">Send KonnectX greeting</span>
                                </div>
                                <Switch checked={sendWelcomeWhatsApp} onCheckedChange={setSendWelcomeWhatsApp} />
                            </div>
                        </div>

                        {/* Live Parser Preview */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-muted-foreground">
                                    Preview ({previewRows.length} valid rows detected):
                                </span>
                            </div>
                            <div className="p-3 rounded-xl bg-muted/30 border border-border/70 max-h-36 overflow-y-auto space-y-1 text-xs">
                                {previewRows.slice(0, 4).map((r, i) => (
                                    <div key={i} className="flex items-center justify-between py-1 border-b border-border/40 last:border-none">
                                        <div className="font-bold text-foreground truncate max-w-[150px]">
                                            {r.name}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground font-mono">
                                            {r.phone}
                                        </div>
                                        <div className="text-[11px] text-foreground truncate max-w-[120px]">
                                            {r.company || 'No Company'}
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-mono">
                                            ₹{parseFloat(r.dealValue || 0).toLocaleString()}
                                        </Badge>
                                    </div>
                                ))}
                                {previewRows.length > 4 && (
                                    <p className="text-[10px] text-muted-foreground text-center pt-1 font-semibold">
                                        +{previewRows.length - 4} more rows will be imported
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Import Result Feedback */}
                        {importResult && (
                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                                <div className="font-bold text-emerald-600 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Import Summary:
                                </div>
                                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                                    <div>Contacts Added: <strong>{importResult.importedContacts}</strong></div>
                                    <div>Deals Created: <strong>{importResult.importedDeals}</strong></div>
                                    <div>Skipped: <strong>{importResult.skippedDuplicates}</strong></div>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    {/* Tab 2: WhatsApp Chat Sync */}
                    <TabsContent value="wasync" className="space-y-4 outline-none">
                        <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                                    <MessageCircle className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-foreground">
                                        KonnectX WhatsApp Omnichannel Auto-Sync
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Automatically scan inbound and outbound WhatsApp conversations across your KonnectX Cloud API instance. Any unmatched customer phone numbers will be provisioned as CRM Leads with full conversation history linked.
                                    </p>
                                </div>
                            </div>

                            <Button
                                type="button"
                                onClick={handleSyncWhatsApp}
                                disabled={isSyncingWA}
                                className="w-full h-9 text-xs font-bold gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-sm"
                            >
                                {isSyncingWA ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                <span>1-Click Scan & Sync WhatsApp Chats</span>
                            </Button>
                        </div>

                        {/* Sync Result Feedback */}
                        {syncResult && (
                            <div className="p-4 rounded-2xl bg-card border border-border/80 text-xs space-y-2">
                                <h5 className="font-bold text-foreground flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span>Sync Results:</span>
                                </h5>
                                <div className="grid grid-cols-3 gap-2 text-center p-3 bg-muted/20 rounded-xl">
                                    <div>
                                        <span className="text-[10px] text-muted-foreground block">Threads Scanned</span>
                                        <strong className="text-sm text-foreground">{syncResult.totalChatsScanned}</strong>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-muted-foreground block">New Leads Added</span>
                                        <strong className="text-sm text-emerald-500">{syncResult.newContactsCreated}</strong>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-muted-foreground block">Messages Linked</span>
                                        <strong className="text-sm text-primary">{syncResult.messagesLinked}</strong>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-border/70">
                    <Button type="button" variant="outline" onClick={onClose} className="h-9 text-xs w-full sm:w-auto">
                        Close
                    </Button>

                    {activeTab === 'paste' && (
                        <Button
                            type="button"
                            onClick={handleRunImport}
                            disabled={isImporting || previewRows.length === 0}
                            className="h-9 text-xs font-bold gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 w-full sm:w-auto shadow-sm"
                        >
                            {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                            <span>Import {previewRows.length} Leads & Deals</span>
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
