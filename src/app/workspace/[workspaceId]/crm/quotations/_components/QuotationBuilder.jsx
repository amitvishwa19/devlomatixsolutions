'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from 'next/link';
import {
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    FileText,
    Eye,
    Building2,
    User,
    Calendar,
    Sparkles,
    Check,
    Loader2,
    ExternalLink
} from 'lucide-react';

import QuotationDocumentPreview, { CURRENCY_SYMBOLS } from './QuotationDocumentPreview';
import { saveCrmQuotationAction } from '../../_actions/quotation-actions';
import { getCrmContactsAction } from '../../_actions/contact-actions';
import { getAccountsAction } from '../../_actions/account-actions';
import { getDealsAction } from '../../_actions/deal-actions';
import { useSettings } from '@/providers/WorkspaceProvider';

const DEFAULT_TERMS = `1. Validity: This quotation is valid for 30 calendar days from the date of issue.
2. Payment Terms: 50% advance upon project sign-off; 50% upon milestone completion.
3. Delivery: Delivery timelines commence after receipt of advance and scope confirmation.
4. Taxes: All statutory duties and taxes are charged as applicable at the time of invoice.`;

const DEFAULT_NOTES = `Thank you for the opportunity to partner with your organization. This proposal reflects our mutual discussions regarding scope, deliverables, and service standards.`;

export default function QuotationBuilder({
    workspaceId,
    initialData = null,
    onSaved
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const paramContactId = searchParams?.get('contactId');
    const paramAccountId = searchParams?.get('accountId');
    const paramDealId = searchParams?.get('dealId');
    const paramTitle = searchParams?.get('title');
    const paramAmount = searchParams?.get('amount');

    const isEdit = !!initialData?.id;

    // View tabs: 'editor' or 'preview' (on mobile/desktop)
    const [viewMode, setViewMode] = useState('split'); // 'split' | 'editor' | 'preview'
    const [previewTheme, setPreviewTheme] = useState('modern');
    const [isSaving, setIsSaving] = useState(false);

    // Context datasets
    const [contacts, setContacts] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [deals, setDeals] = useState([]);

    // Form States
    const [quotationNumber, setQuotationNumber] = useState(
        initialData?.quotationNumber || `QT-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`
    );
    const [title, setTitle] = useState(initialData?.data?.quotation?.title || 'Commercial & Technical Proposal');
    const [issueDate, setIssueDate] = useState(
        initialData?.data?.quotation?.issueDate || new Date().toISOString().split('T')[0]
    );
    const [validUntil, setValidUntil] = useState(
        initialData?.data?.quotation?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    const [currency, setCurrency] = useState(initialData?.data?.quotation?.currency || 'INR');
    const [status, setStatus] = useState(initialData?.status || 'draft');

    // Client Info
    const [selectedContactId, setSelectedContactId] = useState(initialData?.data?.client?.contactId || '');
    const [selectedAccountId, setSelectedAccountId] = useState(initialData?.data?.client?.accountId || '');
    const [selectedDealId, setSelectedDealId] = useState(initialData?.data?.quotation?.dealId || '');
    const [clientName, setClientName] = useState(initialData?.clientName || initialData?.data?.client?.name || '');
    const [clientCompany, setClientCompany] = useState(initialData?.data?.client?.company || '');
    const [clientEmail, setClientEmail] = useState(initialData?.data?.client?.email || '');
    const [clientPhone, setClientPhone] = useState(initialData?.data?.client?.phone || '');
    const [clientAddress, setClientAddress] = useState(initialData?.data?.client?.address || '');

    const { settings } = useSettings?.() || {};

    // Company Info
    const [companyName, setCompanyName] = useState(
        initialData?.data?.company?.name || settings?.branding?.appName || settings?.general?.name || 'Devlomatix Solutions'
    );
    const [companyLogo, setCompanyLogo] = useState(
        initialData?.data?.company?.logoUrl ||
        settings?.branding?.logoLightUrl ||
        settings?.branding?.lightLogoUrl ||
        settings?.branding?.logoUrl ||
        settings?.general?.imageUrl ||
        ''
    );
    const [companyEmail, setCompanyEmail] = useState(
        initialData?.data?.company?.email || settings?.branding?.email || 'sales@devlomatix.com'
    );
    const [companyPhone, setCompanyPhone] = useState(
        initialData?.data?.company?.phone || settings?.branding?.phone || '+91 98765 43210'
    );
    const [companyAddress, setCompanyAddress] = useState(
        initialData?.data?.company?.address || settings?.branding?.address || 'Vadodara, Gujarat, India'
    );
    const [companyTaxId, setCompanyTaxId] = useState(initialData?.data?.company?.taxId || 'GSTIN: 24AAAAA0000A1Z5');
    const [companyPan, setCompanyPan] = useState(initialData?.data?.company?.pan || '');
    const [companyCin, setCompanyCin] = useState(initialData?.data?.company?.cin || '');
    const [companyBankName, setCompanyBankName] = useState(initialData?.data?.company?.bankName || '');
    const [companyAccountNumber, setCompanyAccountNumber] = useState(initialData?.data?.company?.accountNumber || '');
    const [companyAccountHolder, setCompanyAccountHolder] = useState(initialData?.data?.company?.accountHolder || '');
    const [companyAccountType, setCompanyAccountType] = useState(initialData?.data?.company?.accountType || 'current');
    const [companyIfsc, setCompanyIfsc] = useState(initialData?.data?.company?.ifsc || '');
    const [companyBranch, setCompanyBranch] = useState(initialData?.data?.company?.branch || '');
    const [companyUpiId, setCompanyUpiId] = useState(initialData?.data?.company?.upiId || '');
    const [companySignatoryName, setCompanySignatoryName] = useState(initialData?.data?.company?.signatoryName || '');
    const [companySignatoryDesignation, setCompanySignatoryDesignation] = useState(
        initialData?.data?.company?.signatoryDesignation || 'Director / Authorized Signatory'
    );
    const [companyWebsite, setCompanyWebsite] = useState(initialData?.data?.company?.website || '');
    const [showCompanyDetailsEdit, setShowCompanyDetailsEdit] = useState(false);

    // Sync business & branding from workspace settings for new quotations
    useEffect(() => {
        if (!initialData?.id && settings) {
            const business = settings.business || {};
            const resolvedName = business.legalName || business.tradeName || settings.branding?.appName;
            if (resolvedName && (companyName === 'Devlomatix Solutions' || !companyName)) {
                setCompanyName(resolvedName);
            }
            const logo = settings.branding?.logoLightUrl ||
                settings.branding?.lightLogoUrl ||
                settings.branding?.logoUrl ||
                settings.general?.imageUrl;
            if (logo && !companyLogo) {
                setCompanyLogo(logo);
            }
            if (business.email || settings.branding?.email) {
                setCompanyEmail(business.billingEmail || business.email || settings.branding?.email);
            }
            if (business.phone || settings.branding?.phone) {
                setCompanyPhone(business.phone || business.mobile || settings.branding?.phone);
            }
            const formattedAddr = [
                business.addressLine1,
                business.addressLine2,
                business.city,
                business.state,
                business.pincode,
                business.country
            ].filter(Boolean).join(', ');
            if (formattedAddr && (companyAddress === 'Vadodara, Gujarat, India' || !companyAddress)) {
                setCompanyAddress(formattedAddr);
            }
            if (business.gstin && (companyTaxId === 'GSTIN: 24AAAAA0000A1Z5' || !companyTaxId)) {
                setCompanyTaxId(business.gstin.startsWith('GSTIN:') ? business.gstin : `GSTIN: ${business.gstin}`);
            }
            if (business.pan && !companyPan) setCompanyPan(business.pan);
            if (business.cin && !companyCin) setCompanyCin(business.cin);
            if (business.bankName && !companyBankName) setCompanyBankName(business.bankName);
            if (business.accountNumber && !companyAccountNumber) setCompanyAccountNumber(business.accountNumber);
            if (business.accountHolder && !companyAccountHolder) setCompanyAccountHolder(business.accountHolder);
            if (business.accountType && !companyAccountType) setCompanyAccountType(business.accountType);
            if (business.ifsc && !companyIfsc) setCompanyIfsc(business.ifsc);
            if (business.branch && !companyBranch) setCompanyBranch(business.branch);
            if (business.upiId && !companyUpiId) setCompanyUpiId(business.upiId);
            if (business.signatoryName && !companySignatoryName) setCompanySignatoryName(business.signatoryName);
            if (business.signatoryDesignation && (!companySignatoryDesignation || companySignatoryDesignation === 'Director / Authorized Signatory')) {
                setCompanySignatoryDesignation(business.signatoryDesignation);
            }
            if (business.website && !companyWebsite) setCompanyWebsite(business.website);
            if (business.defaultTerms && terms === DEFAULT_TERMS) {
                setTerms(business.defaultTerms);
            }
            if (business.defaultNotes && notes === DEFAULT_NOTES) {
                setNotes(business.defaultNotes);
            }
            if (business.quotationPrefix && (!initialData?.quotationNumber || initialData.quotationNumber.startsWith('QT-'))) {
                const prefix = business.quotationPrefix;
                const datePart = new Date().toISOString().slice(0, 7).replace('-', '');
                const randPart = Math.floor(1000 + Math.random() * 9000);
                setQuotationNumber(`${prefix}${datePart}-${randPart}`);
            }
        }
    }, [settings, initialData]);

    // Line items
    const [items, setItems] = useState(
        initialData?.data?.items?.length ? initialData.data.items : [
            {
                id: 'item-1',
                name: 'Custom Web & Mobile Application Development',
                description: 'Full-stack application architecture, UI/UX design, cloud deployment, and API integration.',
                quantity: 1,
                unitPrice: 75000,
                discountPercent: 0,
                taxPercent: 18,
                total: 88500
            }
        ]
    );

    // Terms & Notes
    const [terms, setTerms] = useState(initialData?.data?.terms || DEFAULT_TERMS);
    const [notes, setNotes] = useState(initialData?.data?.notes || DEFAULT_NOTES);

    // Load workspace data for dropdowns
    useEffect(() => {
        if (!workspaceId) return;

        async function loadData() {
            try {
                const [contactsRes, accountsRes, dealsRes] = await Promise.all([
                    getCrmContactsAction(workspaceId).catch(() => ({ success: false })),
                    getAccountsAction(workspaceId).catch(() => ({ success: false })),
                    getDealsAction(workspaceId).catch(() => ({ success: false }))
                ]);

                if (contactsRes.success && Array.isArray(contactsRes.data)) {
                    setContacts(contactsRes.data);
                }
                if (accountsRes.success && Array.isArray(accountsRes.data)) {
                    setAccounts(accountsRes.data);
                }
                if (dealsRes.success && Array.isArray(dealsRes.data)) {
                    setDeals(dealsRes.data);
                }
            } catch (err) {
                console.error("Error loading dropdown data:", err);
            }
        }

        loadData();
    }, [workspaceId]);

    // Handle Contact Selection
    const handleSelectContact = (contactId) => {
        setSelectedContactId(contactId);
        if (contactId === 'MANUAL') return;

        const c = contacts.find(item => item.id === contactId);
        if (c) {
            setClientName(c.name || '');
            setClientPhone(c.phone || '');
            setClientEmail(c.email || '');
            if (c.account?.name) setClientCompany(c.account.name);
            if (c.address) setClientAddress(c.address);
            if (c.accountId) setSelectedAccountId(c.accountId);
        }
    };

    // Handle Company/Account Selection
    const handleSelectAccount = (accountId) => {
        setSelectedAccountId(accountId);
        if (accountId === 'NONE') return;

        const acc = accounts.find(a => a.id === accountId);
        if (acc) {
            setClientCompany(acc.name || '');
            if (acc.phone && !clientPhone) setClientPhone(acc.phone);
            if (acc.email && !clientEmail) setClientEmail(acc.email);
            if (acc.address && !clientAddress) setClientAddress(acc.address);
        }
    };

    // Handle Pipeline Deal Selection
    const handleSelectDeal = (dealId) => {
        const dId = dealId === 'NONE' ? '' : dealId;
        setSelectedDealId(dId);
        if (!dId) return;

        const deal = deals.find(d => d.id === dId);
        if (deal) {
            if (!title || title === 'Commercial & Technical Proposal') {
                setTitle(`Proposal: ${deal.title}`);
            }
            if (deal.contactId) {
                handleSelectContact(deal.contactId);
            } else if (deal.accountId) {
                handleSelectAccount(deal.accountId);
            }
            if (deal.value && items.length === 1 && items[0].unitPrice === 75000) {
                const qty = Number(items[0].quantity) || 1;
                const price = Number(deal.value);
                const tax = Number(items[0].taxPercent) || 18;
                const total = Math.round((qty * price) + ((qty * price * tax) / 100));
                setItems([{
                    ...items[0],
                    name: deal.title,
                    unitPrice: price,
                    total
                }]);
            }
        }
    };

    // Auto-select contact from query param if provided
    useEffect(() => {
        if (paramContactId && contacts.length > 0 && !selectedContactId) {
            handleSelectContact(paramContactId);
        }
    }, [paramContactId, contacts]);

    // Auto-select account from query param if provided
    useEffect(() => {
        if (paramAccountId && accounts.length > 0 && !selectedAccountId) {
            handleSelectAccount(paramAccountId);
        }
    }, [paramAccountId, accounts]);

    // Auto-select deal from query param if provided
    useEffect(() => {
        if (paramDealId && deals.length > 0 && !selectedDealId) {
            handleSelectDeal(paramDealId);
        }
    }, [paramDealId, deals]);

    // Pre-fill title and amount if passed
    useEffect(() => {
        if (paramTitle && (!title || title === 'Commercial & Technical Proposal')) {
            setTitle(decodeURIComponent(paramTitle));
        }
        if (paramAmount && items.length === 1 && items[0].unitPrice === 75000) {
            const amt = Number(paramAmount);
            if (!isNaN(amt) && amt > 0) {
                const tax = Number(items[0].taxPercent) || 18;
                const total = Math.round(amt + ((amt * tax) / 100));
                setItems([{
                    ...items[0],
                    unitPrice: amt,
                    total
                }]);
            }
        }
    }, [paramTitle, paramAmount]);

    // Recalculate Item Line Total
    const updateItem = (index, field, value) => {
        const updated = [...items];
        const item = { ...updated[index], [field]: value };

        const qty = Number(item.quantity) || 0;
        const price = Number(item.unitPrice) || 0;
        const discount = Number(item.discountPercent) || 0;
        const tax = Number(item.taxPercent) || 0;

        const baseAmount = qty * price;
        const discountAmount = (baseAmount * discount) / 100;
        const taxableAmount = Math.max(0, baseAmount - discountAmount);
        const taxAmount = (taxableAmount * tax) / 100;

        item.total = Math.round(taxableAmount + taxAmount);
        updated[index] = item;
        setItems(updated);
    };

    const addItem = () => {
        setItems([
            ...items,
            {
                id: `item-${Date.now()}`,
                name: '',
                description: '',
                quantity: 1,
                unitPrice: 0,
                discountPercent: 0,
                taxPercent: 18,
                total: 0
            }
        ]);
    };

    const removeItem = (index) => {
        if (items.length <= 1) {
            toast.error("At least one line item is required");
            return;
        }
        setItems(items.filter((_, i) => i !== index));
    };

    // Financial Computations
    const summary = useMemo(() => {
        let subtotal = 0;
        let discountTotal = 0;
        let taxTotal = 0;

        items.forEach(item => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.unitPrice) || 0;
            const discPct = Number(item.discountPercent) || 0;
            const taxPct = Number(item.taxPercent) || 0;

            const base = qty * price;
            const disc = (base * discPct) / 100;
            const taxable = Math.max(0, base - disc);
            const tax = (taxable * taxPct) / 100;

            subtotal += base;
            discountTotal += disc;
            taxTotal += tax;
        });

        const grandTotal = Math.round(subtotal - discountTotal + taxTotal);
        return {
            subtotal: Math.round(subtotal),
            discountTotal: Math.round(discountTotal),
            taxTotal: Math.round(taxTotal),
            grandTotal,
            currency
        };
    }, [items, currency]);

    // Live document data for preview
    const previewData = useMemo(() => ({
        id: initialData?.id || 'new-quotation',
        quotationNumber,
        clientName: clientName || clientCompany || 'Client Name',
        total: summary.grandTotal,
        status,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        data: {
            client: {
                contactId: selectedContactId && selectedContactId !== 'MANUAL' && selectedContactId !== 'NONE' ? selectedContactId : null,
                accountId: selectedAccountId && selectedAccountId !== 'NONE' && selectedAccountId !== 'MANUAL' ? selectedAccountId : null,
                name: clientName,
                company: clientCompany,
                email: clientEmail,
                phone: clientPhone,
                address: clientAddress
            },
            company: {
                name: companyName,
                logoUrl: companyLogo,
                email: companyEmail,
                phone: companyPhone,
                address: companyAddress,
                taxId: companyTaxId,
                pan: companyPan,
                cin: companyCin,
                bankName: companyBankName,
                accountNumber: companyAccountNumber,
                accountHolder: companyAccountHolder,
                accountType: companyAccountType,
                ifsc: companyIfsc,
                branch: companyBranch,
                upiId: companyUpiId,
                signatoryName: companySignatoryName,
                signatoryDesignation: companySignatoryDesignation,
                website: companyWebsite
            },
            quotation: {
                title,
                issueDate,
                validUntil,
                currency,
                dealId: selectedDealId && selectedDealId !== 'NONE' && selectedDealId !== 'MANUAL' ? selectedDealId : null
            },
            items,
            summary,
            notes,
            terms
        }
    }), [
        initialData,
        quotationNumber,
        clientName,
        clientCompany,
        clientEmail,
        clientPhone,
        clientAddress,
        selectedContactId,
        selectedAccountId,
        selectedDealId,
        companyName,
        companyLogo,
        companyEmail,
        companyPhone,
        companyAddress,
        companyTaxId,
        companyPan,
        companyCin,
        companyBankName,
        companyAccountNumber,
        companyAccountHolder,
        companyAccountType,
        companyIfsc,
        companyBranch,
        companyUpiId,
        companySignatoryName,
        companySignatoryDesignation,
        companyWebsite,
        title,
        issueDate,
        validUntil,
        currency,
        items,
        summary,
        notes,
        terms,
        status
    ]);

    const handleSave = async (saveStatus = status) => {
        if (!clientName?.trim() && !clientCompany?.trim()) {
            toast.error("Please enter a client name or company");
            return;
        }

        setIsSaving(true);
        try {
            const res = await saveCrmQuotationAction(workspaceId, {
                id: initialData?.id,
                quotationNumber,
                clientName: clientName.trim() || clientCompany.trim(),
                total: summary.grandTotal,
                status: saveStatus,
                data: previewData.data
            });

            if (res.success) {
                toast.success(isEdit ? "Quotation updated successfully!" : "Quotation created successfully!");
                if (onSaved) onSaved(res.data);
                else router.push(`/workspace/${workspaceId}/crm/quotations`);
            } else {
                toast.error(res.error || "Failed to save quotation");
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("An error occurred while saving quotation");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-card rounded-2xl border border-border/80 shadow-xs">
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => router.push(`/workspace/${workspaceId}/crm/quotations`)}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-sm font-bold text-foreground">
                            {isEdit ? `Edit Quotation (${quotationNumber})` : 'New Quotation'}
                        </h1>
                        <p className="text-[11px] text-muted-foreground font-mono">
                            Grand Total: {CURRENCY_SYMBOLS[currency] || '₹'}{summary.grandTotal.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border text-xs">
                        <button
                            type="button"
                            onClick={() => setViewMode('editor')}
                            className={`px-2.5 py-1 font-semibold rounded-md transition-all ${viewMode === 'editor' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
                                } lg:hidden`}
                        >
                            Editor
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('preview')}
                            className={`px-2.5 py-1 font-semibold rounded-md transition-all ${viewMode === 'preview' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
                                } lg:hidden`}
                        >
                            Preview
                        </button>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSave('draft')}
                        disabled={isSaving}
                        className="h-8 text-xs font-semibold"
                    >
                        Save Draft
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSave(status === 'draft' ? 'draft' : status)}
                        disabled={isSaving}
                        className="h-8 text-xs font-semibold bg-primary text-primary-foreground gap-1.5"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-3.5 h-3.5" />
                                <span>{isEdit ? 'Update Quotation' : 'Save Quotation'}</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Split Screen Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
                {/* Left Side: Editor Form */}
                <div className={`lg:col-span-6 space-y-4 overflow-y-auto pr-1 ${viewMode === 'preview' ? 'hidden lg:block' : 'block'
                    }`}>
                    {/* Organization Branding & Sender */}
                    {/* Organization Branding & Sender */}
                    <div className="p-3 bg-card rounded-2xl border border-border/80 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                                {companyLogo ? (
                                    <div className="h-9 w-16 bg-white rounded-md p-1 border border-border/60 flex items-center justify-center shrink-0">
                                        <img
                                            src={typeof companyLogo === 'string' ? companyLogo : (companyLogo?.src || companyLogo)}
                                            alt="Company Logo"
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0">
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-xs font-bold text-foreground truncate">{companyName}</span>
                                        {companyTaxId && (
                                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-mono font-semibold text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                                                {companyTaxId}
                                            </Badge>
                                        )}
                                        {companyBankName && (
                                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-sky-600 bg-sky-500/10 border-sky-500/20">
                                                {companyBankName}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground truncate max-w-[280px]">
                                        {companyAddress || 'Official Sender Identity & Bank Details active'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowCompanyDetailsEdit(!showCompanyDetailsEdit)}
                                    className="h-7 text-[10px] font-semibold text-muted-foreground hover:text-foreground"
                                >
                                    {showCompanyDetailsEdit ? 'Hide Details' : 'Edit Sender'}
                                </Button>
                                <Link
                                    href={`/workspace/${workspaceId}/system/setting`}
                                    className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-1"
                                    target="_blank"
                                >
                                    <span>Settings</span>
                                    <ExternalLink className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>

                        {/* Collapsible custom company sender fields */}
                        {showCompanyDetailsEdit && (
                            <div className="pt-2.5 border-t border-border/60 space-y-2 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-medium text-muted-foreground">Legal / Display Name</Label>
                                        <Input
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            className="h-7 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-medium text-muted-foreground">GSTIN / Tax ID</Label>
                                        <Input
                                            value={companyTaxId}
                                            onChange={(e) => setCompanyTaxId(e.target.value)}
                                            className="h-7 text-xs font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-medium text-muted-foreground">Registered Office Address</Label>
                                        <Input
                                            value={companyAddress}
                                            onChange={(e) => setCompanyAddress(e.target.value)}
                                            className="h-7 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-medium text-muted-foreground">Official Email</Label>
                                        <Input
                                            value={companyEmail}
                                            onChange={(e) => setCompanyEmail(e.target.value)}
                                            className="h-7 text-xs"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-medium text-muted-foreground">Bank Name</Label>
                                        <Input
                                            value={companyBankName}
                                            onChange={(e) => setCompanyBankName(e.target.value)}
                                            className="h-7 text-xs"
                                            placeholder="Bank Name"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-medium text-muted-foreground">A/C Number</Label>
                                        <Input
                                            value={companyAccountNumber}
                                            onChange={(e) => setCompanyAccountNumber(e.target.value)}
                                            className="h-7 text-xs font-mono"
                                            placeholder="Account No."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-medium text-muted-foreground">IFSC Code</Label>
                                        <Input
                                            value={companyIfsc}
                                            onChange={(e) => setCompanyIfsc(e.target.value.toUpperCase())}
                                            className="h-7 text-xs font-mono"
                                            placeholder="IFSC"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-medium text-muted-foreground">Signatory Name</Label>
                                        <Input
                                            value={companySignatoryName}
                                            onChange={(e) => setCompanySignatoryName(e.target.value)}
                                            className="h-7 text-xs"
                                            placeholder="Authorized Signatory Name"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-medium text-muted-foreground">Signatory Title</Label>
                                        <Input
                                            value={companySignatoryDesignation}
                                            onChange={(e) => setCompanySignatoryDesignation(e.target.value)}
                                            className="h-7 text-xs"
                                            placeholder="Director / Authorized Signatory"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section 1: Client & Recipient */}
                    <div className="p-4 bg-card rounded-2xl border border-border/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-primary" />
                                Client & Recipient Information
                            </span>
                            <span className="text-[10px] text-muted-foreground">Pick CRM Contact to autofill</span>
                        </div>

                        {/* CRM Contact Selector */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-muted-foreground">Select CRM Contact</Label>
                                <Select value={selectedContactId} onValueChange={handleSelectContact}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Link CRM Contact..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MANUAL">Manual Entry (No CRM Link)</SelectItem>
                                        {contacts.map(c => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name} {c.account?.name ? `(${c.account.name})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-muted-foreground">Select Company / Account</Label>
                                <Select value={selectedAccountId} onValueChange={handleSelectAccount}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Link Account..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NONE">None / Independent</SelectItem>
                                        {accounts.map(a => (
                                            <SelectItem key={a.id} value={a.id}>
                                                {a.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold">Client Name *</Label>
                                <Input
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    placeholder="e.g. Acme Corporation or John Doe"
                                    className="h-8 text-xs"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold">Company / Organization</Label>
                                <Input
                                    value={clientCompany}
                                    onChange={(e) => setClientCompany(e.target.value)}
                                    placeholder="e.g. Acme Technologies"
                                    className="h-14 text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold">Email Address</Label>
                                <Input
                                    type="email"
                                    value={clientEmail}
                                    onChange={(e) => setClientEmail(e.target.value)}
                                    placeholder="client@example.com"
                                    className="h-8 text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold">Phone (for WhatsApp Dispatch)</Label>
                                <Input
                                    value={clientPhone}
                                    onChange={(e) => setClientPhone(e.target.value)}
                                    placeholder="+919876543210"
                                    className="h-8 text-xs font-mono"
                                />
                            </div>

                            <div className="sm:col-span-2 space-y-1">
                                <Label className="text-[11px] font-semibold">Billing Address</Label>
                                <Input
                                    value={clientAddress}
                                    onChange={(e) => setClientAddress(e.target.value)}
                                    placeholder="Street, City, State, Pincode"
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Quotation Metadata */}
                    <div className="p-4 bg-card rounded-2xl border border-border/80 shadow-xs space-y-3">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            Quotation Details
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold">Quotation Number</Label>
                                <Input
                                    value={quotationNumber}
                                    onChange={(e) => setQuotationNumber(e.target.value)}
                                    className="h-8 text-xs font-mono font-bold"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold">Issue Date</Label>
                                <Input
                                    type="date"
                                    value={issueDate}
                                    onChange={(e) => setIssueDate(e.target.value)}
                                    className="h-8 text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold">Valid Until</Label>
                                <Input
                                    type="date"
                                    value={validUntil}
                                    onChange={(e) => setValidUntil(e.target.value)}
                                    className="h-8 text-xs"
                                />
                            </div>

                            <div className="sm:col-span-2 space-y-1">
                                <Label className="text-[11px] font-semibold">Proposal Title</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Website Redesign & SEO Project"
                                    className="h-8 text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold">Currency</Label>
                                <Select value={currency} onValueChange={setCurrency}>
                                    <SelectTrigger className="h-8 text-xs font-semibold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                                        <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                                        <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                                        <SelectItem value="AED">AED (د.إ) - UAE Dirham</SelectItem>
                                        <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="sm:col-span-3 space-y-1 pt-1 border-t border-border/60">
                                <Label className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                                    <span>Link to Pipeline Deal (Optional)</span>
                                    {selectedDealId && (
                                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/20 bg-emerald-500/10 font-bold">
                                            Auto-wins deal on client e-signature
                                        </Badge>
                                    )}
                                </Label>
                                <Select value={selectedDealId || 'NONE'} onValueChange={handleSelectDeal}>
                                    <SelectTrigger className="h-8 text-xs bg-background">
                                        <SelectValue placeholder="Associate with an active deal..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NONE">No Deal Linked (Standalone Quotation)</SelectItem>
                                        {deals.map(d => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.title} (₹{Number(d.value || 0).toLocaleString()} • {d.stage?.name || 'Stage'})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Line Items */}
                    <div className="p-4 bg-card rounded-2xl border border-border/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">
                                Line Items ({items.length})
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addItem}
                                className="h-7 text-xs font-semibold text-primary"
                            >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Add Item
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div
                                    key={item.id || index}
                                    className="p-3 bg-muted/20 rounded-xl border border-border/70 space-y-2 relative group"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-[10px] font-semibold text-muted-foreground">
                                                Item #{index + 1} Name
                                            </Label>
                                            <Input
                                                value={item.name}
                                                onChange={(e) => updateItem(index, 'name', e.target.value)}
                                                placeholder="e.g. Software License, Consulting, Hardware"
                                                className="h-7 text-xs font-bold"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(index)}
                                            className="h-7 w-7 text-muted-foreground hover:text-red-500 mt-4"
                                            title="Delete item"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>

                                    <div className="space-y-1">
                                        <Input
                                            value={item.description}
                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                            placeholder="Optional description, scope, or deliverables..."
                                            className="h-7 text-[11px] text-muted-foreground"
                                        />
                                    </div>

                                    <div className="grid grid-cols-4 gap-2 pt-1">
                                        <div>
                                            <Label className="text-[10px] text-muted-foreground">Qty</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                className="h-7 text-xs text-center"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-[10px] text-muted-foreground">Unit Price</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={item.unitPrice}
                                                onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                                                className="h-7 text-xs text-right font-mono"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-[10px] text-muted-foreground">Tax %</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={item.taxPercent}
                                                onChange={(e) => updateItem(index, 'taxPercent', e.target.value)}
                                                className="h-7 text-xs text-center font-mono"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-[10px] text-muted-foreground text-right block">Total</Label>
                                            <div className="h-7 flex items-center justify-end font-mono font-bold text-xs text-foreground">
                                                {CURRENCY_SYMBOLS[currency] || '₹'}{Number(item.total || 0).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 4: Terms & Notes */}
                    <div className="p-4 bg-card rounded-2xl border border-border/80 shadow-xs space-y-3">
                        <span className="text-xs font-bold text-foreground">
                            Terms & Payment Notes
                        </span>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-muted-foreground">Terms & Conditions</Label>
                                <Textarea
                                    value={terms}
                                    onChange={(e) => setTerms(e.target.value)}
                                    rows={3}
                                    className="text-xs font-sans leading-relaxed resize-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-muted-foreground">Overview & Client Notes</Label>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    className="text-xs font-sans leading-relaxed resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Live Document Preview */}
                <div className={`lg:col-span-6 flex flex-col h-full overflow-y-auto ${viewMode === 'editor' ? 'hidden lg:flex' : 'flex'
                    }`}>
                    <QuotationDocumentPreview
                        data={previewData}
                        theme={previewTheme}
                        showActions={true}
                    />
                </div>
            </div>
        </div>
    );
}
