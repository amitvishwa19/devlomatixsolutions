'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
    FileText,
    Printer,
    Loader2,
    Sparkles,
    ShieldCheck
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPublicQuotationAction, recordQuotationViewAction } from '@/app/workspace/[workspaceId]/crm/_actions/quotation-actions';
import QuotationDocumentPreview from '@/app/workspace/[workspaceId]/crm/quotations/_components/QuotationDocumentPreview';


export default function PublicQuotationViewPage() {
    const params = useParams();
    const quotationId = params?.id;

    const [quotation, setQuotation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const printRef = useRef(null);
    const viewStartTime = useRef(Date.now());

    useEffect(() => {
        if (!quotationId) return;

        async function fetchQuotation() {
            try {
                setIsLoading(true);
                const res = await getPublicQuotationAction(quotationId);
                if (res.success && res.data) {
                    setQuotation(res.data);
                    // Record view telemetry
                    recordQuotationViewAction(quotationId, {
                        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Browser',
                        page: 1
                    }).catch(console.warn);
                } else {
                    setError(res.error || "Quotation could not be located.");
                }
            } catch (err) {
                console.error("Public quote fetch error:", err);
                setError("Failed to load quotation document.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchQuotation();

        const startTime = viewStartTime.current;
        // On unmount/unload record view duration
        return () => {
            const duration = Math.round((Date.now() - startTime) / 1000);
            if (duration > 3 && quotationId) {
                recordQuotationViewAction(quotationId, { durationSeconds: duration }).catch(() => {});
            }
        };
    }, [quotationId]);

    const handlePrint = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 gap-3 p-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm text-slate-400 font-medium">Decrypting & loading commercial proposal...</p>
            </div>
        );
    }

    if (error || !quotation) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-bold">Proposal Unavailable</h2>
                    <p className="text-xs text-slate-400">{error || "This document link has expired or is invalid."}</p>
                </div>
            </div>
        );
    }

    const qData = typeof quotation.data === 'object' ? quotation.data : {};
    const company = qData.company || {};
    const client = qData.client || {};

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 py-8 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header Actions Bar */}
                <header className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 backdrop-blur border border-slate-800 p-4 rounded-2xl print:hidden shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-bold text-sm tracking-tight text-white">
                                    Quotation #{quotation.quotationNumber}
                                </h1>
                                <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/30">
                                    Official Proposal
                                </Badge>
                            </div>
                            <p className="text-xs text-slate-400">
                                Prepared for <span className="text-slate-200 font-medium">{quotation.clientName || client.name || "Client"}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Button
                            onClick={handlePrint}
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-semibold gap-1.5 border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200"
                        >
                            <Printer className="w-3.5 h-3.5 text-blue-400" />
                            <span>Print / Save PDF</span>
                        </Button>
                        {company.phone && (
                            <a
                                href={`https://wa.me/${company.phone.replace(/[^0-9]/g, '')}?text=Hi,%20I%20am%20reviewing%20Quotation%20%23${quotation.quotationNumber}%20and%20would%20like%20to%20proceed.`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Button size="sm" className="h-8 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Accept & Connect on WhatsApp</span>
                                </Button>
                            </a>
                        )}
                    </div>
                </header>

                {/* Printable Proposal Document */}
                <main ref={printRef} className="bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:m-0 print:rounded-none">
                    <QuotationDocumentPreview data={qData} />
                </main>

                {/* Secure Trust Footer */}
                <footer className="text-center py-4 text-xs text-slate-500 space-y-1 print:hidden">
                    <div className="flex items-center justify-center gap-1.5 text-slate-400">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>Powered by Devlomatix Commercial OS & FlowGenix Security</span>
                    </div>
                    <p>© {new Date().getFullYear()} {company.name || "Devlomatix Solutions"}. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
}
