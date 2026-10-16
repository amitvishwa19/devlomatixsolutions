'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
    CheckCircle2,
    Download,
    Printer,
    PenTool,
    XCircle,
    FileText,
    Building2,
    Calendar,
    Clock,
    ShieldCheck,
    CreditCard,
    ArrowRight,
    RotateCcw,
    AlertCircle,
    Check
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import QuotationDocumentPreview, { CURRENCY_SYMBOLS } from '@/app/workspace/[workspaceId]/crm/quotations/_components/QuotationDocumentPreview';
import {
    getPublicQuotationByIdAction,
    submitPublicQuotationAcceptanceAction,
    submitPublicQuotationDeclineAction
} from '@/app/workspace/[workspaceId]/crm/_actions/quotation-actions';

export default function PublicQuotationViewPage() {
    const params = useParams();
    const id = params?.id;

    const [quotation, setQuotation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal States
    const [isSignModalOpen, setIsSignModalOpen] = useState(false);
    const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);

    // Sign Form States
    const [signMode, setSignMode] = useState('draw'); // 'draw' | 'type'
    const [signatoryName, setSignatoryName] = useState('');
    const [signatoryTitle, setSignatoryTitle] = useState('Authorized Signatory');
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [signNotes, setSignNotes] = useState('');

    // Decline Form
    const [declineReason, setDeclineReason] = useState('');

    // Canvas Ref for Drawing Signature
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);

    useEffect(() => {
        if (!id) return;
        const load = async () => {
            setIsLoading(true);
            try {
                const res = await getPublicQuotationByIdAction(id);
                if (res.success && res.data) {
                    setQuotation(res.data);
                    const qData = res.data.data || {};
                    const client = qData.client || {};
                    if (client.name) setSignatoryName(client.name);
                    if (client.title) setSignatoryTitle(client.title);
                } else {
                    toast.error(res.error || "Quotation not found");
                }
            } catch (err) {
                console.error("Load public quotation error:", err);
                toast.error("Failed to load quotation document");
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [id]);

    // Canvas Signature Drawing
    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
        setIsDrawing(true);
        setHasDrawn(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#1e3a5f';
        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
    };

    const handleAcceptAndSign = async () => {
        if (!signatoryName.trim()) {
            toast.error("Please enter your full legal name");
            return;
        }
        if (!termsAgreed) {
            toast.error("Please agree to the quotation terms and conditions");
            return;
        }

        let signatureDataUrl = null;
        if (signMode === 'draw') {
            const canvas = canvasRef.current;
            if (canvas && hasDrawn) {
                signatureDataUrl = canvas.toDataURL('image/png');
            } else {
                toast.error("Please draw your signature or switch to 'Type to Sign'");
                return;
            }
        } else {
            // Generate canvas image from typed calligraphy
            const offCanvas = document.createElement('canvas');
            offCanvas.width = 400;
            offCanvas.height = 120;
            const ctx = offCanvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 400, 120);
            ctx.font = 'italic 34px "Brush Script MT", "Caveat", "Segoe Script", cursive';
            ctx.fillStyle = '#1e3a5f';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(signatoryName.trim(), 200, 60);
            signatureDataUrl = offCanvas.toDataURL('image/png');
        }

        setIsSubmitting(true);
        try {
            const res = await submitPublicQuotationAcceptanceAction(id, {
                signatureDataUrl,
                signatoryName: signatoryName.trim(),
                signatoryDesignation: signatoryTitle.trim(),
                notes: signNotes
            });

            if (res.success && res.data) {
                setQuotation(res.data);
                setIsSignModalOpen(false);
                toast.success("Quotation accepted & digitally signed successfully!");
            } else {
                toast.error(res.error || "Failed to submit acceptance");
            }
        } catch (err) {
            console.error("Acceptance error:", err);
            toast.error("An error occurred during signature submission");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDecline = async () => {
        if (!declineReason.trim()) {
            toast.error("Please provide a reason or revision notes");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await submitPublicQuotationDeclineAction(id, {
                reason: declineReason.trim()
            });

            if (res.success && res.data) {
                setQuotation(res.data);
                setIsDeclineModalOpen(false);
                toast.info("Feedback submitted. Our team will review and contact you.");
            } else {
                toast.error(res.error || "Failed to submit feedback");
            }
        } catch (err) {
            console.error("Decline error:", err);
            toast.error("An error occurred while submitting feedback");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white">
                <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-semibold tracking-wide text-slate-300">Retrieving official quotation document...</p>
            </div>
        );
    }

    if (!quotation) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
                <AlertCircle className="w-16 h-16 text-rose-400 mb-4" />
                <h2 className="text-xl font-bold mb-2">Quotation Not Found or Expired</h2>
                <p className="text-sm text-slate-400 max-w-md">
                    This document may have been archived or removed by the issuer. Please contact your account representative.
                </p>
            </div>
        );
    }

    const qData = quotation.data || {};
    const signature = qData.clientSignature;
    const invoice = qData.invoice;
    const isAccepted = quotation.status === 'accepted' || quotation.status === 'invoiced';
    const isDeclined = quotation.status === 'declined';

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            {/* Top Navigation & Client Actions Bar */}
            <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 sm:px-8">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="h-9 w-9 rounded-xl bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-sm shadow-md">
                            QT
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-white">
                                    {quotation.quotationNumber}
                                </span>
                                <Badge className={`text-[10px] font-bold uppercase ${
                                    isAccepted ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                                    isDeclined ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                                    'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                                }`}>
                                    {isAccepted ? 'Accepted & Authorized' : isDeclined ? 'Declined / Revision' : 'Pending Client Review'}
                                </Badge>
                            </div>
                            <p className="text-xs text-slate-400">
                                Issued to: <span className="text-slate-200 font-medium">{quotation.clientName || 'Client'}</span>
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {!isAccepted && !isDeclined && (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsDeclineModalOpen(true)}
                                    className="h-8 text-xs font-semibold border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300"
                                >
                                    <XCircle className="w-3.5 h-3.5 mr-1 text-rose-400" />
                                    Decline / Notes
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setIsSignModalOpen(true)}
                                    className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                                >
                                    <PenTool className="w-3.5 h-3.5 mr-1.5" />
                                    Accept & E-Sign
                                </Button>
                            </>
                        )}

                        {isAccepted && (
                            <div className="flex items-center gap-2">
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs px-2.5 py-1 flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    Digitally Authorized
                                </Badge>
                                {invoice && (
                                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs px-2.5 py-1 flex items-center gap-1.5">
                                        <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                                        Invoice #{invoice.id} ({invoice.amount})
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Document Body Area */}
            <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 flex flex-col items-center">
                {/* Digital Signature Banner if signed */}
                {isAccepted && signature && (
                    <div className="w-full max-w-3xl mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-emerald-300">Quotation Officially Accepted & Authorized</h4>
                                <p className="text-xs text-slate-300">
                                    Signed by <strong className="text-white">{signature.signatoryName}</strong> ({signature.signatoryDesignation}) on {new Date(signature.acceptedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}.
                                </p>
                            </div>
                        </div>
                        {signature.signatureDataUrl && (
                            <div className="bg-white p-1 rounded-lg border border-slate-300 shadow-xs">
                                <img src={signature.signatureDataUrl} alt="Client Signature" className="h-10 w-auto object-contain" />
                            </div>
                        )}
                    </div>
                )}

                {/* The Clean Quotation Sheet */}
                <div className="w-full flex justify-center">
                    <QuotationDocumentPreview
                        data={quotation}
                        theme="corporate"
                        showActions={true}
                    />
                </div>
            </main>

            {/* Accept & E-Sign Modal */}
            <Dialog open={isSignModalOpen} onOpenChange={setIsSignModalOpen}>
                <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold flex items-center gap-2 text-white">
                            <PenTool className="w-4 h-4 text-emerald-400" />
                            Accept & Authorize Quotation
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-400">
                            Provide your electronic signature to confirm and execute quotation #{quotation.quotationNumber}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Name & Title */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-300">Full Legal Name *</Label>
                                <Input
                                    value={signatoryName}
                                    onChange={(e) => setSignatoryName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className="h-8 text-xs bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-300">Title / Designation</Label>
                                <Input
                                    value={signatoryTitle}
                                    onChange={(e) => setSignatoryTitle(e.target.value)}
                                    placeholder="e.g. Director, CTO"
                                    className="h-8 text-xs bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                />
                            </div>
                        </div>

                        {/* Signature Mode Selector */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-slate-300">Signature Method</Label>
                                <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[11px]">
                                    <button
                                        type="button"
                                        onClick={() => setSignMode('draw')}
                                        className={`px-2.5 py-0.5 rounded font-medium transition-all ${
                                            signMode === 'draw' ? 'bg-slate-700 text-white' : 'text-slate-400'
                                        }`}
                                    >
                                        Draw
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSignMode('type')}
                                        className={`px-2.5 py-0.5 rounded font-medium transition-all ${
                                            signMode === 'type' ? 'bg-slate-700 text-white' : 'text-slate-400'
                                        }`}
                                    >
                                        Type Calligraphy
                                    </button>
                                </div>
                            </div>

                            {/* Draw Canvas */}
                            {signMode === 'draw' ? (
                                <div className="relative border border-slate-700 rounded-xl overflow-hidden bg-white">
                                    <canvas
                                        ref={canvasRef}
                                        width={460}
                                        height={140}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                        className="w-full h-36 cursor-crosshair touch-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={clearCanvas}
                                        className="absolute bottom-2 right-2 px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-[10px] font-semibold flex items-center gap-1"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        Clear
                                    </button>
                                    {!hasDrawn && (
                                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-slate-400 font-medium italic">
                                            Draw your signature here with finger or mouse
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-36 rounded-xl border border-slate-700 bg-white flex flex-col items-center justify-center p-4">
                                    <p className="font-serif italic text-3xl text-[#1e3a5f] tracking-wide select-none">
                                        {signatoryName || 'Your Signature Preview'}
                                    </p>
                                    <span className="text-[10px] text-slate-400 mt-2">
                                        Generated secure cryptographic calligraphy stamp
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Optional notes */}
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-300">Client Reference / PO Notes (Optional)</Label>
                            <Input
                                value={signNotes}
                                onChange={(e) => setSignNotes(e.target.value)}
                                placeholder="e.g. PO #10928, Approved as discussed"
                                className="h-8 text-xs bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                            />
                        </div>

                        {/* Agreement Terms */}
                        <div className="flex items-start gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="termsCheckbox"
                                checked={termsAgreed}
                                onChange={(e) => setTermsAgreed(e.target.checked)}
                                className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-400"
                            />
                            <label htmlFor="termsCheckbox" className="text-xs text-slate-300 leading-snug cursor-pointer">
                                I confirm that I am authorized to approve this quotation of <strong>{CURRENCY_SYMBOLS[quotation.data?.quotation?.currency || 'INR'] || '₹'}{Number(quotation.total).toLocaleString('en-IN')}</strong> and agree to the specified terms and scope.
                            </label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsSignModalOpen(false)}
                            disabled={isSubmitting}
                            className="text-slate-400"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleAcceptAndSign}
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                        >
                            {isSubmitting ? "Authorizing..." : "Confirm & E-Sign"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Decline Dialog */}
            <Dialog open={isDeclineModalOpen} onOpenChange={setIsDeclineModalOpen}>
                <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-rose-400" />
                            Request Revisions / Decline
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-400">
                            Tell us what changes or adjustments are required for this quotation.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <Label className="text-xs text-slate-300">Feedback or Revision Notes *</Label>
                        <Textarea
                            value={declineReason}
                            onChange={(e) => setDeclineReason(e.target.value)}
                            placeholder="e.g. Please revise timeline to 45 days, or update scope item #2..."
                            rows={4}
                            className="text-xs bg-slate-800 border-slate-700 text-white resize-none"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsDeclineModalOpen(false)}
                            disabled={isSubmitting}
                            className="text-slate-400"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleDecline}
                            disabled={isSubmitting}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                        >
                            {isSubmitting ? "Submitting..." : "Send Feedback"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
