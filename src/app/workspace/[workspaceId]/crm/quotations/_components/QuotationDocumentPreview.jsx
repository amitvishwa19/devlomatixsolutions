'use client';

import React, { useRef, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Printer, FileText, Share2, Link2, CreditCard, ShieldCheck, Mail } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { useSettings } from '@/providers/WorkspaceProvider';
import { convertQuotationToPayFlowInvoiceAction } from '../../_actions/quotation-actions';
import SendQuotationEmailModal from './SendQuotationEmailModal';
import lightLogo from '@/assets/logo/light_logo.png';

export const CURRENCY_SYMBOLS = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'د.إ'
};

function formatCurrencyNumber(val) {
    const num = Number(val) || 0;
    return num.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDateLong(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

function numberToIndianWords(amount) {
    if (!amount || isNaN(amount)) return "Zero Rupees Only";
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function convertLessThanOneThousand(n) {
        let str = '';
        if (n >= 100) {
            str += ones[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        if (n >= 20) {
            str += tens[Math.floor(n / 10)] + ' ';
            n %= 10;
        }
        if (n > 0) {
            str += ones[n] + ' ';
        }
        return str.trim();
    }

    const wholePart = Math.floor(Math.abs(amount));
    let num = wholePart;
    if (num === 0) return "Zero Rupees Only";

    let words = '';

    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;

    if (crore > 0) words += convertLessThanOneThousand(crore) + ' Crore ';
    if (lakh > 0) words += convertLessThanOneThousand(lakh) + ' Lakh ';
    if (thousand > 0) words += convertLessThanOneThousand(thousand) + ' Thousand ';
    if (num > 0) words += convertLessThanOneThousand(num) + ' ';

    return words.trim() + ' Rupees Only';
}

export default function QuotationDocumentPreview({
    data,
    theme = 'modern',
    showActions = true,
    onStatusChange
}) {
    const documentRef = useRef(null);

    if (!data) return null;

    const {
        quotationNumber = 'QT-DRAFT',
        clientName = 'Client Name',
        total = 0,
        status = 'draft',
        createdAt
    } = data;

    const details = data.data || {};
    const client = details.client || {};
    const rawCompany = details.company || {};

    const { settings } = useSettings?.() || {};
    const business = settings?.business || {};

    const companyName = rawCompany.name || business.legalName || business.tradeName || settings?.branding?.appName || settings?.general?.name || "Devlomatix Solutions Pvt. Ltd.";
    const companyLogo = rawCompany.logoUrl ||
        settings?.branding?.logoLightUrl ||
        settings?.branding?.lightLogoUrl ||
        settings?.branding?.logoUrl ||
        settings?.general?.imageUrl ||
        lightLogo;
    const companyEmail = rawCompany.email || business.billingEmail || business.email || settings?.branding?.email || "sales@devlomatix.com";
    const companyPhone = rawCompany.phone || business.phone || business.mobile || settings?.branding?.phone || "+91 98765 43210";
    const companyWebsite = rawCompany.website || business.website || "www.devlomatix.com";
    const formattedBusinessAddress = [
        business.addressLine1,
        business.addressLine2,
        business.city,
        business.state,
        business.pincode,
        business.country
    ].filter(Boolean).join(', ');
    const companyAddress = rawCompany.address || formattedBusinessAddress || settings?.branding?.address || "Vadodara, Gujarat 390001, India";
    const companyTaxId = rawCompany.taxId || (business.gstin ? (business.gstin.startsWith('GSTIN:') ? business.gstin : `GSTIN: ${business.gstin}`) : "24AAAAA0000A1Z5");
    const companyCin = rawCompany.cin || business.cin || "U72900GJ2020PTC114589";
    const companyPan = rawCompany.pan || business.pan || "";

    const company = {
        ...rawCompany,
        name: companyName,
        logoUrl: companyLogo,
        email: companyEmail,
        phone: companyPhone,
        website: companyWebsite,
        address: companyAddress,
        taxId: companyTaxId,
        cin: companyCin,
        pan: companyPan,
        bankName: rawCompany.bankName || business.bankName || "",
        accountNumber: rawCompany.accountNumber || business.accountNumber || "",
        accountHolder: rawCompany.accountHolder || business.accountHolder || companyName,
        ifsc: rawCompany.ifsc || business.ifsc || "",
        upiId: rawCompany.upiId || business.upiId || "",
        signatoryName: rawCompany.signatoryName || business.signatoryName || "",
        signatoryDesignation: rawCompany.signatoryDesignation || business.signatoryDesignation || "Director / Authorized Signatory"
    };

    const quotation = details.quotation || {};
    const items = Array.isArray(details.items) ? details.items : [];
    const summary = details.summary || {};
    const currency = quotation.currency || summary.currency || 'INR';
    const symbol = CURRENCY_SYMBOLS[currency] || '₹';

    const issueDateFormatted = formatDateLong(quotation.issueDate || createdAt || new Date().toISOString());
    const validUntilFormatted = formatDateLong(quotation.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());

    // Financial calculations
    const subtotal = Number(summary.subtotal) || items.reduce((acc, i) => acc + (Number(i.quantity || 1) * Number(i.unitPrice || 0)), 0);
    const discountTotal = Number(summary.discountTotal) || 0;
    const taxableAmount = Math.max(0, subtotal - discountTotal);
    const taxTotal = Number(summary.taxTotal) || items.reduce((acc, i) => {
        const base = (Number(i.quantity || 1) * Number(i.unitPrice || 0));
        const disc = (base * (Number(i.discountPercent) || 0)) / 100;
        return acc + ((base - disc) * (Number(i.taxPercent) || 18)) / 100;
    }, 0);
    const grandTotal = Number(summary.grandTotal) || Math.round(taxableAmount + taxTotal);
    const amountInWords = numberToIndianWords(grandTotal);

    const handlePrint = () => {
        const printArea = document.getElementById('quotation-print-area');
        if (!printArea) {
            window.print();
            return;
        }

        // Create an isolated iframe so ONLY the quotation sheet appears in the browser print preview
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.style.zIndex = '-9999';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow?.document;
        if (!iframeDoc) {
            window.print();
            return;
        }

        // Copy all parent stylesheets for exact fonts, colors, and layout
        const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map(el => el.outerHTML)
            .join('\n');

        iframeDoc.open();
        iframeDoc.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />
                <title>Quotation_${quotationNumber}</title>
                ${styleTags}
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 8mm;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        box-sizing: border-box;
                    }
                    html, body {
                        background: #ffffff !important;
                        color: #0f172a !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    }
                    #quotation-print-area {
                        box-shadow: none !important;
                        border: none !important;
                        padding: 0 !important;
                        margin: 0 auto !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        min-height: auto !important;
                    }
                </style>
            </head>
            <body>
                <div style="width: 100%; max-width: 800px; margin: 0 auto; background: #ffffff;">
                    ${printArea.outerHTML}
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.focus();
                            window.print();
                            setTimeout(function() {
                                try {
                                    window.frameElement.remove();
                                } catch (e) {}
                            }, 1000);
                        }, 200);
                    };
                </script>
            </body>
            </html>
        `);
        iframeDoc.close();
    };

    const handleDownloadPDF = async () => {
        if (!documentRef.current) return;
        const toastId = toast.loading("Generating quotation PDF...");

        // Offscreen canvas context to convert CSS Color 4 functions (lab, oklch, etc.) to standard RGB
        const cCanvas = document.createElement('canvas');
        cCanvas.width = 1;
        cCanvas.height = 1;
        const ctx = cCanvas.getContext('2d');

        const sanitizeColorString = (str) => {
            if (!str || typeof str !== 'string') return str;
            if (!str.includes('lab(') && !str.includes('oklch(') && !str.includes('oklab(') && !str.includes('color(')) {
                return str;
            }
            return str.replace(/(lab|oklch|oklab|color)\(([^()]|\([^()]*\))*\)/gi, (match) => {
                try {
                    if (ctx) {
                        ctx.fillStyle = '#010203';
                        ctx.fillStyle = match;
                        if (ctx.fillStyle !== '#010203' && ctx.fillStyle !== 'rgb(1, 2, 3)') {
                            return ctx.fillStyle;
                        }
                    }
                } catch (e) { }
                if (match.includes('bg') || match.includes('background')) return '#ffffff';
                return '#0f172a';
            });
        };

        const createSanitizedStyleProxy = (style) => {
            return new Proxy(style, {
                get(target, prop) {
                    if (prop === 'getPropertyValue') {
                        return function (propertyName) {
                            const raw = target.getPropertyValue(propertyName);
                            return sanitizeColorString(raw);
                        };
                    }
                    let val;
                    try {
                        val = target[prop];
                    } catch {
                        val = undefined;
                    }
                    if (typeof val === 'function') {
                        return val.bind(target);
                    }
                    if (typeof val === 'string') {
                        return sanitizeColorString(val);
                    }
                    return val;
                }
            });
        };

        // Temporarily patch global window.getComputedStyle so html2canvas never sees unparsed lab()/oklch()
        const origWindowGetComputedStyle = window.getComputedStyle;
        window.getComputedStyle = function (el, pseudo) {
            const style = origWindowGetComputedStyle.call(window, el, pseudo);
            return createSanitizedStyleProxy(style);
        };

        try {
            const element = documentRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 1200,
                onclone: (clonedDoc) => {
                    const clonedWin = clonedDoc.defaultView;
                    if (clonedWin && clonedWin !== window) {
                        const origClonedGetComputedStyle = clonedWin.getComputedStyle;
                        clonedWin.getComputedStyle = function (el, pseudo) {
                            const style = origClonedGetComputedStyle.call(clonedWin, el, pseudo);
                            return createSanitizedStyleProxy(style);
                        };
                    }

                    // Also sanitize any inline styles in clonedDoc
                    const allEls = clonedDoc.querySelectorAll('*');
                    allEls.forEach((el) => {
                        try {
                            if (el.style && el.style.cssText) {
                                el.style.cssText = sanitizeColorString(el.style.cssText);
                            }
                        } catch (e) { }
                    });
                }
            });

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const pageHeightPx = pdfHeight / ratio;
            const totalPages = Math.ceil(imgHeight / pageHeightPx);

            for (let page = 0; page < totalPages; page++) {
                if (page > 0) pdf.addPage();

                const sourceY = page * pageHeightPx;
                const sourceHeight = Math.min(pageHeightPx, imgHeight - sourceY);

                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = imgWidth;
                pageCanvas.height = sourceHeight;
                const ctxPage = pageCanvas.getContext('2d');

                if (ctxPage) {
                    ctxPage.drawImage(
                        canvas,
                        0, sourceY,
                        imgWidth, sourceHeight,
                        0, 0,
                        imgWidth, sourceHeight
                    );

                    const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
                    const pageScaledHeight = sourceHeight * ratio;
                    pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pageScaledHeight);
                }
            }

            const cleanClient = (clientName || 'Client').replace(/[^a-zA-Z0-9]/g, '_');
            pdf.save(`Quotation_${quotationNumber}_${cleanClient}.pdf`);
            toast.success("PDF downloaded successfully!", { id: toastId });
        } catch (error) {
            console.error("PDF generation error:", error);
            toast.error("Failed to generate PDF. Please try again.", { id: toastId });
        } finally {
            window.getComputedStyle = origWindowGetComputedStyle;
        }
    };

    const [isConvertingInvoice, setIsConvertingInvoice] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    const handleCopyPublicLink = () => {
        if (!data?.id) {
            toast.info("Please save the quotation first to generate a public link");
            return;
        }
        const url = `${window.location.origin}/quotations/view/${data.id}`;
        navigator.clipboard.writeText(url);
        toast.success("Client link copied to clipboard!");
    };

    const handleConvertToInvoice = async () => {
        const workspaceId = data?.workspaceId;
        if (!data?.id || !workspaceId) {
            toast.error("Unable to identify quotation workspace");
            return;
        }
        setIsConvertingInvoice(true);
        const toastId = toast.loading("Converting quotation to PayFlow invoice...");
        try {
            const res = await convertQuotationToPayFlowInvoiceAction(workspaceId, data.id);
            if (res.success && res.data) {
                toast.success(`Invoice #${res.data.invoice.id} created successfully!`, { id: toastId });
                if (onStatusChange) onStatusChange('invoiced', res.data.quotation);
            } else {
                toast.error(res.error || "Failed to convert to invoice", { id: toastId });
            }
        } catch (e) {
            console.error(e);
            toast.error("An error occurred during invoice conversion", { id: toastId });
        } finally {
            setIsConvertingInvoice(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            {showActions && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-muted/40 rounded-xl border border-border/80 text-xs print:hidden">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="font-bold text-foreground">Preview: {quotationNumber}</span>
                        <Badge variant="outline" className={`text-[10px] font-bold uppercase ${status === 'accepted' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                status === 'invoiced' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' :
                                status === 'sent' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                                status === 'declined' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                'bg-muted text-muted-foreground'
                            }`}>
                            {status}
                        </Badge>
                        {details.invoice && (
                            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-[10px] font-mono">
                                #{details.invoice.id}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {data?.id && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleCopyPublicLink}
                                className="h-8 text-xs font-semibold"
                                title="Copy public link to send to client"
                            >
                                <Share2 className="w-3.5 h-3.5 mr-1 text-cyan-500" />
                                Share Link
                            </Button>
                        )}
                        {status === 'accepted' && !details.invoice && (
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleConvertToInvoice}
                                disabled={isConvertingInvoice}
                                className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                                <CreditCard className="w-3.5 h-3.5 mr-1" />
                                {isConvertingInvoice ? "Converting..." : "Create Invoice"}
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEmailModalOpen(true)}
                            className="h-8 text-xs font-semibold"
                            title="Send quotation via email with PDF attached"
                        >
                            <Mail className="w-3.5 h-3.5 mr-1 text-blue-500" />
                            Send Email
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            className="h-8 text-xs font-semibold"
                        >
                            <Printer className="w-3.5 h-3.5 mr-1" />
                            Print
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleDownloadPDF}
                            className="h-8 text-xs font-semibold bg-[#1e3a5f] text-white hover:bg-[#162c48]"
                        >
                            <Download className="w-3.5 h-3.5 mr-1" />
                            Download PDF
                        </Button>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                    #quotation-print-area {
                        background-color: #ffffff !important;
                        color: #0f172a !important;
                    }
                    #quotation-print-area p,
                    #quotation-print-area span,
                    #quotation-print-area td,
                    #quotation-print-area th,
                    #quotation-print-area li,
                    #quotation-print-area div,
                    #quotation-print-area table {
                        color: inherit;
                    }
                    #quotation-print-area .text-slate-900, #quotation-print-area [class*="text-[#0f172a]"] { color: #0f172a !important; }
                    #quotation-print-area .text-slate-800, #quotation-print-area [class*="text-[#1e293b]"] { color: #1e293b !important; }
                    #quotation-print-area .text-slate-700, #quotation-print-area [class*="text-[#334155]"] { color: #334155 !important; }
                    #quotation-print-area .text-slate-600, #quotation-print-area [class*="text-[#475569]"] { color: #475569 !important; }
                    #quotation-print-area .text-slate-500, #quotation-print-area [class*="text-[#64748b]"] { color: #64748b !important; }
                    #quotation-print-area .text-slate-400, #quotation-print-area [class*="text-[#94a3b8]"] { color: #94a3b8 !important; }
                    #quotation-print-area .text-emerald-600, #quotation-print-area [class*="text-[#059669]"] { color: #059669 !important; }
                    #quotation-print-area .text-white { color: #ffffff !important; }
                    #quotation-print-area .bg-white { background-color: #ffffff !important; }
                    #quotation-print-area .border-slate-300, #quotation-print-area [class*="border-[#cbd5e1]"] { border-color: #cbd5e1 !important; }
                    #quotation-print-area .border-slate-200, #quotation-print-area [class*="border-[#e2e8f0]"] { border-color: #e2e8f0 !important; }
                    #quotation-print-area .border-slate-400, #quotation-print-area [class*="border-[#94a3b8]"] { border-color: #94a3b8 !important; }
                    #quotation-print-area .bg-slate-50, #quotation-print-area [class*="bg-[#f8fafc]"] { background-color: #f8fafc !important; }

                    @media print {
                        body {
                            background: white !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        body * {
                            visibility: hidden !important;
                        }
                        #quotation-print-area, #quotation-print-area * {
                            visibility: visible !important;
                        }
                        #quotation-print-area {
                            position: fixed !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                            max-width: 100% !important;
                            margin: 0 !important;
                            padding: 10mm !important;
                            box-shadow: none !important;
                            border: none !important;
                            min-height: auto !important;
                            background: white !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }
                `
            }} />

            {/* Printable Document Sheet Container */}
            <div className="overflow-x-auto bg-muted/20 p-2 sm:p-4 rounded-2xl border border-border/60 flex justify-center">
                <div
                    ref={documentRef}
                    id="quotation-print-area"
                    className="w-full max-w-3xl bg-white text-[#0f172a] p-8 sm:p-10 rounded-xl border border-[#cbd5e1] font-sans"
                    style={{ minHeight: '1050px' }}
                >
                    {/* Top Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-4">
                        {/* Left: Organization Details */}
                        <div className="space-y-1">
                            {companyLogo ? (
                                <img
                                    src={typeof companyLogo === 'string' ? companyLogo : (companyLogo?.src || companyLogo)}
                                    alt={companyName}
                                    crossOrigin="anonymous"
                                    className="h-12 max-h-14 w-auto max-w-[240px] object-contain shrink-0 mb-1"
                                />
                            ) : (
                                <h1 className="text-2xl font-black text-[#1e3a5f] tracking-tight uppercase">
                                    {companyName}
                                </h1>
                            )}
                            <div className="w-48 h-0.5 bg-[#1e3a5f] my-1.5" />

                            <div className="text-[11px] text-[#334155] leading-relaxed space-y-0.5">
                                {companyAddress && <p>{companyAddress}</p>}
                                <table className="text-[11px] text-[#334155] mt-1">
                                    <tbody>
                                        {companyPhone && (
                                            <tr>
                                                <td className="pr-2 text-[#64748b] font-medium w-16">Phone</td>
                                                <td className="pr-1 text-[#64748b]">:</td>
                                                <td className="font-medium text-[#1e293b]">{companyPhone}</td>
                                            </tr>
                                        )}
                                        {companyEmail && (
                                            <tr>
                                                <td className="pr-2 text-[#64748b] font-medium">Email</td>
                                                <td className="pr-1 text-[#64748b]">:</td>
                                                <td className="text-[#1e293b]">{companyEmail}</td>
                                            </tr>
                                        )}
                                        {companyWebsite && (
                                            <tr>
                                                <td className="pr-2 text-[#64748b] font-medium">Website</td>
                                                <td className="pr-1 text-[#64748b]">:</td>
                                                <td className="text-[#1e293b]">{companyWebsite}</td>
                                            </tr>
                                        )}
                                        {companyTaxId && (
                                            <tr>
                                                <td className="pr-2 text-[#64748b] font-medium">GSTIN</td>
                                                <td className="pr-1 text-[#64748b]">:</td>
                                                <td className="font-mono font-medium text-[#0f172a]">{companyTaxId}</td>
                                            </tr>
                                        )}
                                        {/* {companyCin && (
                                            <tr>
                                                <td className="pr-2 text-[#64748b] font-medium">CIN</td>
                                                <td className="pr-1 text-[#64748b]">:</td>
                                                <td className="font-mono text-[#1e293b]">{companyCin}</td>
                                            </tr>
                                        )} */}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Right: Quotation Badge Box */}
                        <div className="w-full sm:w-72 rounded-xl border border-[#1e3a5f] overflow-hidden shrink-0">
                            <div className="bg-[#1e3a5f] text-white py-2 text-center font-black tracking-widest text-lg uppercase">
                                QUOTATION
                            </div>
                            <div className="p-3 bg-white text-[11px] text-[#1e293b]">
                                <table className="w-full">
                                    <tbody className="space-y-1.5">
                                        <tr>
                                            <td className="font-bold text-[#334155] py-0.5">Quotation No.</td>
                                            <td className="px-1 text-[#64748b]">:</td>
                                            <td className="font-mono font-bold text-[#0f172a] text-right">{quotationNumber}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-bold text-[#334155] py-0.5">Quotation Date</td>
                                            <td className="px-1 text-[#64748b]">:</td>
                                            <td className="text-[#1e293b] text-right">{issueDateFormatted}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-bold text-[#334155] py-0.5">Valid Until</td>
                                            <td className="px-1 text-[#64748b]">:</td>
                                            <td className="text-[#1e293b] text-right">{validUntilFormatted}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Horizontal Divider Line */}
                    <div className="border-t border-[#cbd5e1] my-4" />

                    {/* Cards: Quote To & Subject / Reference */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                        {/* Card 1: QUOTE TO */}
                        <div className="p-4 rounded-xl border border-[#cbd5e1] bg-white text-[11px] text-[#334155] space-y-1">
                            <span className="text-[10px] font-bold tracking-wider text-[#64748b] uppercase block mb-1.5">
                                QUOTE TO
                            </span>
                            <p className="font-bold text-xs text-[#0f172a]">
                                {client.company || clientName || 'Client Company Pvt. Ltd.'}
                            </p>
                            {client.name && (
                                <p className="text-[#334155] font-medium">
                                    {client.name}{client.title ? `, ${client.title}` : ''}
                                </p>
                            )}
                            {client.address && (
                                <p className="text-[#475569] leading-relaxed text-[10px] whitespace-pre-line">
                                    {client.address}
                                </p>
                            )}
                            <table className="text-[10px] text-[#334155] pt-1">
                                <tbody>
                                    {client.phone && (
                                        <tr>
                                            <td className="pr-2 text-[#64748b] font-medium w-16">Phone</td>
                                            <td className="pr-1 text-[#64748b]">:</td>
                                            <td className="font-mono text-[#1e293b]">{client.phone}</td>
                                        </tr>
                                    )}
                                    {client.email && (
                                        <tr>
                                            <td className="pr-2 text-[#64748b] font-medium">Email</td>
                                            <td className="pr-1 text-[#64748b]">:</td>
                                            <td className="text-[#1e293b]">{client.email}</td>
                                        </tr>
                                    )}
                                    {(client.taxId || client.gstin) && (
                                        <tr>
                                            <td className="pr-2 text-[#64748b] font-medium">Client GSTIN</td>
                                            <td className="pr-1 text-[#64748b]">:</td>
                                            <td className="font-mono font-medium text-[#0f172a]">{client.taxId || client.gstin}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Card 2: SUBJECT / REFERENCE */}
                        <div className="p-4 rounded-xl border border-[#cbd5e1] bg-white text-[11px] text-[#334155] space-y-2">
                            <span className="text-[10px] font-bold tracking-wider text-[#64748b] uppercase block mb-1.5">
                                SUBJECT / REFERENCE
                            </span>
                            <table className="text-[11px] text-[#334155] w-full">
                                <tbody>
                                    <tr>
                                        <td className="pr-2 text-[#64748b] font-medium w-20 align-top">Subject</td>
                                        <td className="pr-1 text-[#64748b] align-top">:</td>
                                        <td className="font-semibold text-[#0f172a] align-top">
                                            {quotation.title || 'Service quotation'}
                                        </td>
                                    </tr>
                                    {quotation.reference && (
                                        <tr>
                                            <td className="pr-2 text-[#64748b] font-medium w-20 align-top pt-2">Reference</td>
                                            <td className="pr-1 text-[#64748b] align-top pt-2">:</td>
                                            <td className="text-[#334155] align-top pt-2">
                                                {quotation.reference}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="my-5 border border-[#cbd5e1] rounded-lg overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-[#1e3a5f] text-white font-bold text-[10px] tracking-wider uppercase">
                                    <th className="py-2.5 px-3 text-center w-10 border-r border-[#2b4c77]">#</th>
                                    <th className="py-2.5 px-3 border-r border-[#2b4c77]">DESCRIPTION</th>
                                    <th className="py-2.5 px-3 text-center w-14 border-r border-[#2b4c77]">QTY</th>
                                    <th className="py-2.5 px-3 text-right w-28 border-r border-[#2b4c77]">UNIT PRICE ({currency})</th>
                                    <th className="py-2.5 px-3 text-center w-16 border-r border-[#2b4c77]">GST</th>
                                    <th className="py-2.5 px-3 text-right w-32">AMOUNT ({currency})</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e2e8f0] text-[#1e293b] text-[11px]">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-[#94a3b8] italic">
                                            No line items added yet.
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item, index) => {
                                        const qty = Number(item.quantity) || 1;
                                        const rate = Number(item.unitPrice) || 0;
                                        const lineTotal = Number(item.total) || (qty * rate);

                                        return (
                                            <tr key={item.id || index} className="border-b border-[#e2e8f0]">
                                                <td className="py-2.5 px-3 text-center text-[#475569] font-medium border-r border-[#e2e8f0] align-top">
                                                    {index + 1}
                                                </td>
                                                <td className="py-2.5 px-3 border-r border-[#e2e8f0] align-top">
                                                    <p className="font-bold text-[#0f172a]">{item.name}</p>
                                                    {item.description && (
                                                        <p className="text-[10px] text-[#64748b] mt-0.5 whitespace-pre-line leading-relaxed">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-center font-medium border-r border-[#e2e8f0] align-top">
                                                    {qty}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono border-r border-[#e2e8f0] align-top">
                                                    {symbol}{formatCurrencyNumber(rate)}
                                                </td>
                                                <td className="py-2.5 px-3 text-center font-medium border-r border-[#e2e8f0] align-top">
                                                    {item.taxPercent ? `${item.taxPercent}%` : '18%'}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-bold font-mono text-[#0f172a] align-top">
                                                    {symbol}{formatCurrencyNumber(lineTotal)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Financial Summary Breakdown */}
                    <div className="flex flex-col items-end my-4">
                        <div className="w-full sm:w-96 border border-[#cbd5e1] rounded-lg overflow-hidden text-xs">
                            <table className="w-full border-collapse">
                                <tbody className="divide-y divide-[#e2e8f0] text-[#1e293b] text-[11px]">
                                    <tr>
                                        <td className="py-1.5 px-3 font-bold uppercase text-[#334155] bg-[#f8fafc]">SUBTOTAL</td>
                                        <td className="py-1.5 px-3 text-right font-mono font-medium text-[#0f172a]">
                                            {symbol}{formatCurrencyNumber(subtotal)}
                                        </td>
                                    </tr>
                                    {discountTotal > 0 && (
                                        <tr>
                                            <td className="py-1.5 px-3 font-bold uppercase text-[#334155] bg-[#f8fafc]">DISCOUNT</td>
                                            <td className="py-1.5 px-3 text-right font-mono font-medium text-[#059669]">
                                                -{symbol}{formatCurrencyNumber(discountTotal)}
                                            </td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td className="py-1.5 px-3 font-bold uppercase text-[#334155] bg-[#f8fafc]">TAXABLE AMOUNT</td>
                                        <td className="py-1.5 px-3 text-right font-mono font-medium text-[#0f172a]">
                                            {symbol}{formatCurrencyNumber(taxableAmount)}
                                        </td>
                                    </tr>
                                    {/* GST Breakdown */}
                                    <tr>
                                        <td className="py-1.5 px-3 font-bold uppercase text-[#334155] bg-[#f8fafc] align-top">
                                            GST BREAKDOWN
                                        </td>
                                        <td className="p-0">
                                            <table className="w-full border-collapse">
                                                <tbody className="divide-y divide-[#e2e8f0] text-[11px]">
                                                    <tr>
                                                        <td className="py-1 px-3 text-[#475569] border-r border-[#e2e8f0]">CGST (9%)</td>
                                                        <td className="py-1 px-3 text-right font-mono text-[#0f172a]">{symbol}{formatCurrencyNumber(taxTotal / 2)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="py-1 px-3 text-[#475569] border-r border-[#e2e8f0]">SGST (9%)</td>
                                                        <td className="py-1 px-3 text-right font-mono text-[#0f172a]">{symbol}{formatCurrencyNumber(taxTotal / 2)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                    {/* Grand Total Bar */}
                                    <tr className="bg-[#1e3a5f] text-white">
                                        <td className="py-2.5 px-3 font-black text-xs uppercase tracking-wide">
                                            GRAND TOTAL ({currency})
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono font-black text-sm">
                                            {symbol}{formatCurrencyNumber(grandTotal)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-[11px] italic text-[#475569] mt-2 text-right">
                            Amount in Words: {amountInWords}
                        </p>
                    </div>

                    {/* Footer 3 Columns: Terms, Payment Terms, Notes & Signature */}
                    <div className="border-t border-[#cbd5e1] mt-8 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-[10px] text-[#334155] leading-relaxed">
                        {/* Column 1: TERMS & CONDITIONS */}
                        <div>
                            <h4 className="font-bold text-[11px] uppercase text-[#0f172a] mb-2">
                                TERMS & CONDITIONS
                            </h4>
                            <ol className="list-decimal list-inside space-y-1 text-[#475569]">
                                <li>This quotation is valid for the period mentioned above from the quotation date.</li>
                                <li>Prices are in {currency} and inclusive of applicable taxes.</li>
                                <li>Delivery will be as per mutually agreed timelines.</li>
                                <li>Any additional work outside the quoted scope will be chargeable extra.</li>
                            </ol>
                        </div>

                        {/* Column 2: PAYMENT TERMS & BANK DETAILS */}
                        <div>
                            <h4 className="font-bold text-[11px] uppercase text-[#0f172a] mb-2">
                                PAYMENT TERMS
                            </h4>
                            <p className="text-[#475569] mb-2 text-[10px]">
                                {business.defaultPaymentTerms || "50% Advance on project confirmation, 50% upon delivery / milestone completion."}
                            </p>
                            {company.bankName && company.accountNumber && (
                                <div className="mt-2.5 p-2 rounded bg-slate-50 border border-slate-200 text-[10px] space-y-0.5">
                                    <p className="font-bold text-[#0f172a] mb-1 border-b border-slate-200 pb-0.5">Direct Bank Wire (NEFT/RTGS):</p>
                                    <p><span className="text-[#64748b]">Bank:</span> <strong className="text-[#1e293b]">{company.bankName}</strong></p>
                                    <p><span className="text-[#64748b]">A/C No:</span> <strong className="font-mono text-[#0f172a]">{company.accountNumber}</strong></p>
                                    <p><span className="text-[#64748b]">IFSC:</span> <strong className="font-mono text-[#0f172a]">{company.ifsc}</strong></p>
                                    {company.upiId && <p><span className="text-[#64748b]">UPI:</span> <strong className="font-mono text-[#0f172a]">{company.upiId}</strong></p>}
                                </div>
                            )}
                        </div>

                        {/* Column 3: NOTES & AUTHORIZED SIGNATURE */}
                        <div>
                            <h4 className="font-bold text-[11px] uppercase text-[#0f172a] mb-2">
                                NOTES
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-[#475569]">
                                <li>Thank you for the opportunity to quote.</li>
                                <li>We look forward to working with you.</li>
                            </ul>

                            <div className="mt-5 pt-3">
                                <p className="font-bold text-xs text-[#0f172a]">For {companyName}</p>
                                <div className="w-48 border-b border-[#94a3b8] my-6" />
                                <p className="font-bold text-[#1e293b] text-[11px]">Authorized Signature</p>
                                <table className="text-[10px] text-[#475569] mt-1">
                                    <tbody>
                                        <tr>
                                            <td className="pr-2 font-medium">Name</td>
                                            <td className="pr-1">:</td>
                                            <td className="text-[#1e293b] font-semibold">{company.signatoryName || 'Authorized Signatory'}</td>
                                        </tr>
                                        <tr>
                                            <td className="pr-2 font-medium">Designation</td>
                                            <td className="pr-1">:</td>
                                            <td className="text-[#334155]">{company.signatoryDesignation || 'Director - Sales'}</td>
                                        </tr>
                                        <tr>
                                            <td className="pr-2 font-medium">Date</td>
                                            <td className="pr-1">:</td>
                                            <td className="text-[#334155]">{issueDateFormatted}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {details.clientSignature && (
                                <div className="mt-4 p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/70 text-[10px]">
                                    <div className="flex items-center gap-1 font-bold text-emerald-800 mb-1">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>CLIENT E-SIGNATURE & AUTHORIZATION</span>
                                    </div>
                                    {details.clientSignature.signatureDataUrl && (
                                        <div className="bg-white p-1 rounded border border-emerald-200 my-1 inline-block">
                                            <img src={details.clientSignature.signatureDataUrl} alt="Client Signature" className="h-8 max-w-[140px] object-contain" />
                                        </div>
                                    )}
                                    <p className="font-bold text-[#0f172a]">{details.clientSignature.signatoryName}</p>
                                    <p className="text-[#475569]">{details.clientSignature.signatoryDesignation} • {formatDateLong(details.clientSignature.acceptedAt)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-[#cbd5e1] mt-8" />
                </div>
            </div>

            {showActions && (
                <SendQuotationEmailModal
                    isOpen={isEmailModalOpen}
                    onClose={() => setIsEmailModalOpen(false)}
                    workspaceId={data.workspaceId}
                    quotation={data}
                    targetElementRef={documentRef}
                    onSuccess={(updated) => {
                        if (onStatusChange) onStatusChange('sent', updated);
                    }}
                />
            )}
        </div>
    );
}
