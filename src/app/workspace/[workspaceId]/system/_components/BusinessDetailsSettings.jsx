'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSettings } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    Receipt,
    MapPin,
    Mail,
    Phone,
    Globe,
    CreditCard,
    FileText,
    CheckCircle2,
    Copy,
    Check,
    RotateCcw,
    Sparkles,
    Eye,
    ShieldCheck,
    AlertCircle,
    Building,
    Landmark,
    Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import { StickySaveBar } from './StickySaveBar';

const ENTITY_TYPES = [
    { value: 'pvt_ltd', label: 'Private Limited Company (Pvt. Ltd.)' },
    { value: 'llp', label: 'Limited Liability Partnership (LLP)' },
    { value: 'proprietorship', label: 'Sole Proprietorship' },
    { value: 'partnership', label: 'Partnership Firm' },
    { value: 'public_ltd', label: 'Public Limited Company' },
    { value: 'opc', label: 'One Person Company (OPC)' },
    { value: 'ngo', label: 'Non-Profit / Section 8 / Trust' },
    { value: 'other', label: 'Other Enterprise' }
];

const ACCOUNT_TYPES = [
    { value: 'current', label: 'Current Account' },
    { value: 'savings', label: 'Savings Account' },
    { value: 'od_cc', label: 'Cash Credit (CC) / Overdraft (OD)' },
    { value: 'escrow', label: 'Escrow Account' }
];

const INITIAL_BUSINESS_STATE = {
    // 1. Legal Entity
    legalName: '',
    tradeName: '',
    businessType: '',
    cin: '',
    incorporationDate: '',
    tagline: '',

    // 2. Tax & Compliance
    gstin: '',
    pan: '',
    tan: '',
    msme: '',
    stateCode: '',
    lutNumber: '',

    // 3. Registered Office Address
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: '',

    // Operating / Dispatch Address
    isSameAsRegistered: true,
    branchAddressLine1: '',
    branchAddressLine2: '',
    branchCity: '',
    branchState: '',
    branchPincode: '',
    branchCountry: '',

    // 4. Official Contacts
    email: '',
    billingEmail: '',
    phone: '',
    mobile: '',
    whatsapp: '',
    website: '',

    // 5. Banking Details
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    accountType: '',
    ifsc: '',
    branch: '',
    upiId: '',

    // 6. Invoicing & Document Presets
    quotationPrefix: '',
    invoicePrefix: '',
    defaultPaymentTerms: '',
    jurisdictionCity: '',
    signatoryName: '',
    signatoryDesignation: '',
    defaultTerms: '',
    defaultNotes: ''
};

export function BusinessDetailsSettings() {
    const { settings, updateSettings, saving } = useSettings();
    const [localBusiness, setLocalBusiness] = useState(INITIAL_BUSINESS_STATE);
    const [activeSection, setActiveSection] = useState('entity'); // 'entity' | 'tax' | 'address' | 'contacts' | 'banking' | 'invoicing'
    const [showLivePreview, setShowLivePreview] = useState(false);
    const [copiedField, setCopiedField] = useState(null);

    useEffect(() => {
        if (settings?.business && Object.keys(settings.business).length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLocalBusiness({
                ...INITIAL_BUSINESS_STATE,
                ...settings.business
            });
        } else {
            // Strictly blank if database key: 'global' is empty
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLocalBusiness(INITIAL_BUSINESS_STATE);
        }
    }, [settings]);

    // Check dirty state
    const isDirty = useMemo(() => {
        if (!settings) return false;
        const currentSaved = settings.business || {};
        return Object.keys(localBusiness).some(key => {
            const currentVal = localBusiness[key] ?? '';
            const savedVal = currentSaved[key] ?? (INITIAL_BUSINESS_STATE[key] ?? '');
            return currentVal !== savedVal;
        });
    }, [localBusiness, settings]);

    const handleChange = (field, value) => {
        setLocalBusiness(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Auto-uppercase tax IDs (GSTIN, PAN, IFSC)
    const handleUpperChange = (field, value) => {
        const upper = typeof value === 'string' ? value.toUpperCase().trim() : value;
        setLocalBusiness(prev => {
            const next = { ...prev, [field]: upper };
            // Auto extract PAN from 15-char Indian GSTIN (characters 3 to 12)
            if (field === 'gstin' && upper.length === 15 && !prev.pan) {
                const derivedPan = upper.substring(2, 12);
                if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(derivedPan)) {
                    next.pan = derivedPan;
                }
            }
            // Auto extract state code from first 2 digits of GSTIN
            if (field === 'gstin' && upper.length >= 2 && !prev.stateCode) {
                const code = upper.substring(0, 2);
                if (/^[0-9]{2}$/.test(code)) {
                    next.stateCode = code;
                }
            }
            return next;
        });
    };

    const handleCopy = (text, fieldKey) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldKey);
        toast.success(`Copied ${fieldKey.toUpperCase()} to clipboard!`);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleSave = () => {
        updateSettings({
            business: localBusiness
        });
        toast.success("Business details saved to universal global key across all users!");
    };

    const handleReset = () => {
        if (settings?.business && Object.keys(settings.business).length > 0) {
            setLocalBusiness({
                ...INITIAL_BUSINESS_STATE,
                ...settings.business
            });
            toast.info("Reverted unsaved business details");
        } else {
            setLocalBusiness(INITIAL_BUSINESS_STATE);
        }
    };

    // Calculate completeness score
    const completeness = useMemo(() => {
        const coreFields = [
            'legalName',
            'gstin',
            'pan',
            'addressLine1',
            'city',
            'state',
            'pincode',
            'email',
            'phone',
            'bankName',
            'accountNumber',
            'ifsc'
        ];
        const filled = coreFields.filter(f => Boolean(localBusiness[f]?.toString().trim())).length;
        return Math.round((filled / coreFields.length) * 100);
    }, [localBusiness]);

    return (
        <div className="space-y-4 max-w-5xl mx-auto pb-12">
            {/* Top Overview & Completeness Card */}
            <Card className="bg-gradient-to-br from-card via-card to-amber-500/5 border-border/70 shadow-sm overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-sm sm:text-base font-bold text-foreground">
                                        {localBusiness.legalName || 'Registered Business Profile'}
                                    </h2>
                                    <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 font-medium flex items-center gap-1">
                                        <Globe className="w-3 h-3" />
                                        Universal Global Key
                                    </Badge>
                                    {localBusiness.gstin && (
                                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-mono">
                                            GST Registered
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Universal platform configuration (saved to global key): Legal entity identity, GSTIN, office addresses, and banking coordinates apply across all users, workspaces, and generated documents.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowLivePreview(!showLivePreview)}
                                className={`h-8 text-xs font-semibold gap-1.5 transition-all ${showLivePreview ? 'bg-primary/10 text-primary border-primary/30' : ''}`}
                            >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{showLivePreview ? 'Hide Preview' : 'Document Preview'}</span>
                            </Button>

                            <div className="flex items-center gap-2 bg-secondary/40 px-3 py-1.5 rounded-lg border border-border/60">
                                <span className="text-[10px] font-medium text-muted-foreground">Profile:</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 rounded-full ${completeness >= 80 ? 'bg-emerald-500' : completeness >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                            style={{ width: `${completeness}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold font-mono text-foreground">{completeness}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Badges Bar */}
                    {(localBusiness.gstin || localBusiness.pan || localBusiness.accountNumber) && (
                        <div className="mt-3.5 pt-3 border-t border-border/40 flex flex-wrap items-center gap-2 text-[11px]">
                            <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold mr-1">
                                Quick Copy:
                            </span>

                            {localBusiness.gstin && (
                                <button
                                    onClick={() => handleCopy(localBusiness.gstin, 'gstin')}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/50 hover:bg-secondary border border-border/50 text-foreground text-[10px] font-mono cursor-pointer transition-colors"
                                >
                                    <span className="text-muted-foreground font-sans">GSTIN:</span>
                                    <span className="font-semibold">{localBusiness.gstin}</span>
                                    {copiedField === 'gstin' ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5 text-muted-foreground" />}
                                </button>
                            )}

                            {localBusiness.pan && (
                                <button
                                    onClick={() => handleCopy(localBusiness.pan, 'pan')}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/50 hover:bg-secondary border border-border/50 text-foreground text-[10px] font-mono cursor-pointer transition-colors"
                                >
                                    <span className="text-muted-foreground font-sans">PAN:</span>
                                    <span className="font-semibold">{localBusiness.pan}</span>
                                    {copiedField === 'pan' ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5 text-muted-foreground" />}
                                </button>
                            )}

                            {localBusiness.accountNumber && (
                                <button
                                    onClick={() => handleCopy(localBusiness.accountNumber, 'acc')}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/50 hover:bg-secondary border border-border/50 text-foreground text-[10px] font-mono cursor-pointer transition-colors"
                                >
                                    <span className="text-muted-foreground font-sans">A/C:</span>
                                    <span className="font-semibold">{localBusiness.accountNumber}</span>
                                    {copiedField === 'acc' ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5 text-muted-foreground" />}
                                </button>
                            )}

                            {localBusiness.ifsc && (
                                <button
                                    onClick={() => handleCopy(localBusiness.ifsc, 'ifsc')}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/50 hover:bg-secondary border border-border/50 text-foreground text-[10px] font-mono cursor-pointer transition-colors"
                                >
                                    <span className="text-muted-foreground font-sans">IFSC:</span>
                                    <span className="font-semibold">{localBusiness.ifsc}</span>
                                    {copiedField === 'ifsc' ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5 text-muted-foreground" />}
                                </button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Live Document Preview Card (collapsible) */}
            <AnimatePresence>
                {showLivePreview && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <Card className="border border-primary/30 bg-card shadow-md">
                            <CardHeader className="p-3.5 pb-2 border-b border-border/50 bg-primary/5 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" />
                                    <CardTitle className="text-xs font-bold">
                                        Live Letterhead & Tax Invoice Header Preview
                                    </CardTitle>
                                </div>
                                <span className="text-[10px] text-muted-foreground">Auto-updates as you type</span>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 bg-white text-slate-900 rounded-b-xl font-sans">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-200">
                                    <div>
                                        <h3 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                                            {localBusiness.legalName || 'YOUR BUSINESS NAME'}
                                        </h3>
                                        {localBusiness.tradeName && localBusiness.tradeName !== localBusiness.legalName && (
                                            <p className="text-xs font-medium text-slate-500">
                                                (Trading as {localBusiness.tradeName})
                                            </p>
                                        )}
                                        {localBusiness.tagline && (
                                            <p className="text-[11px] italic text-slate-600 mt-0.5">{localBusiness.tagline}</p>
                                        )}
                                        <div className="w-32 h-0.5 bg-slate-900 my-2" />
                                        <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
                                            {[
                                                localBusiness.addressLine1,
                                                localBusiness.addressLine2,
                                                localBusiness.city,
                                                localBusiness.state,
                                                localBusiness.pincode,
                                                localBusiness.country
                                            ].filter(Boolean).join(', ') || 'Registered Office Address'}
                                        </p>
                                    </div>

                                    <div className="text-xs space-y-1 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 min-w-[240px]">
                                        <div className="flex justify-between font-mono text-[11px]">
                                            <span className="text-slate-500 font-sans">GSTIN:</span>
                                            <span className="font-bold text-slate-900">{localBusiness.gstin || '24AAAAA0000A1Z5'}</span>
                                        </div>
                                        {localBusiness.pan && (
                                            <div className="flex justify-between font-mono text-[11px]">
                                                <span className="text-slate-500 font-sans">PAN:</span>
                                                <span className="font-bold text-slate-900">{localBusiness.pan}</span>
                                            </div>
                                        )}
                                        {localBusiness.cin && (
                                            <div className="flex justify-between font-mono text-[11px]">
                                                <span className="text-slate-500 font-sans">CIN:</span>
                                                <span className="text-slate-900">{localBusiness.cin}</span>
                                            </div>
                                        )}
                                        {localBusiness.email && (
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-slate-500">Email:</span>
                                                <span className="text-slate-900">{localBusiness.email}</span>
                                            </div>
                                        )}
                                        {localBusiness.phone && (
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-slate-500">Phone:</span>
                                                <span className="text-slate-900">{localBusiness.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {localBusiness.bankName && localBusiness.accountNumber && (
                                    <div className="mt-3 pt-2 text-[11px] text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1 bg-slate-50/80 p-2 rounded border border-dashed border-slate-300">
                                        <span className="font-bold text-slate-800">Bank Details for Wire/NEFT:</span>
                                        <span>Bank: <strong className="text-slate-900">{localBusiness.bankName}</strong></span>
                                        <span>A/C No: <strong className="text-slate-900 font-mono">{localBusiness.accountNumber}</strong></span>
                                        <span>IFSC: <strong className="text-slate-900 font-mono">{localBusiness.ifsc}</strong></span>
                                        {localBusiness.upiId && <span>UPI: <strong className="text-slate-900 font-mono">{localBusiness.upiId}</strong></span>}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation Pills */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-secondary/30 rounded-xl border border-border/50 text-xs">
                {[
                    { id: 'entity', label: '1. Identity & Legal', icon: Building2 },
                    { id: 'tax', label: '2. Tax & Compliance', icon: Receipt },
                    { id: 'address', label: '3. Office Addresses', icon: MapPin },
                    { id: 'contacts', label: '4. Official Contacts', icon: Mail },
                    { id: 'banking', label: '5. Banking & Payout', icon: Landmark },
                    { id: 'invoicing', label: '6. Invoicing Presets', icon: FileText }
                ].map(tab => {
                    const isSelected = activeSection === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveSection(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                                isSelected
                                    ? 'bg-card text-foreground shadow-xs font-semibold border border-border/80'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                            }`}
                        >
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-500' : ''}`} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Section 1: Entity & Legal Identity */}
            {activeSection === 'entity' && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="space-y-4">
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="p-4 pb-3 border-b border-border/50">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Building className="w-4 h-4 text-amber-500" />
                                Corporate Identity & Legal Registration
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Legal business identity used across contracts, quotations, tax invoices, and official communications.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="legalName" className="text-xs font-semibold">
                                        Legal Entity Name <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="legalName"
                                        placeholder="e.g. Devlomatix Solutions Private Limited"
                                        value={localBusiness.legalName}
                                        onChange={(e) => handleChange('legalName', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Exact registered name as per Certificate of Incorporation / GST</p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="tradeName" className="text-xs font-semibold">
                                        Trade / Brand Name
                                    </Label>
                                    <Input
                                        id="tradeName"
                                        placeholder="e.g. Devlomatix or Devlomatix Cloud"
                                        value={localBusiness.tradeName}
                                        onChange={(e) => handleChange('tradeName', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Doing Business As (DBA) or public-facing trade name</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="businessType" className="text-xs font-semibold">
                                        Entity Constitution
                                    </Label>
                                    <Select
                                        value={localBusiness.businessType}
                                        onValueChange={(val) => handleChange('businessType', val)}
                                    >
                                        <SelectTrigger id="businessType" className="h-9 text-xs">
                                            <SelectValue placeholder="Select entity type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ENTITY_TYPES.map(type => (
                                                <SelectItem key={type.value} value={type.value} className="text-xs">
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="cin" className="text-xs font-semibold">
                                        CIN / Registration / LLPIN No.
                                    </Label>
                                    <Input
                                        id="cin"
                                        placeholder="e.g. U72900GJ2020PTC114589"
                                        value={localBusiness.cin}
                                        onChange={(e) => handleUpperChange('cin', e.target.value)}
                                        className="h-9 text-xs font-mono"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="incorporationDate" className="text-xs font-semibold">
                                        Date of Incorporation
                                    </Label>
                                    <Input
                                        id="incorporationDate"
                                        type="date"
                                        value={localBusiness.incorporationDate}
                                        onChange={(e) => handleChange('incorporationDate', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="tagline" className="text-xs font-semibold">
                                    Corporate Tagline / Slogan
                                </Label>
                                <Input
                                    id="tagline"
                                    placeholder="e.g. Engineering Tomorrow's Intelligent Business Infrastructure"
                                    value={localBusiness.tagline}
                                    onChange={(e) => handleChange('tagline', e.target.value)}
                                    className="h-9 text-xs"
                                />
                                <p className="text-[10px] text-muted-foreground">Printed beneath your company title in quotation & invoice letterheads</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Section 2: Tax & Statutory Compliance */}
            {activeSection === 'tax' && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="space-y-4">
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="p-4 pb-3 border-b border-border/50">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-emerald-500" />
                                Goods & Services Tax (GST) & Statutory Compliance
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Essential tax numbers stamped on B2B invoices for GST input tax credit (ITC) eligibility.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="gstin" className="text-xs font-semibold">
                                            GSTIN (Goods and Services Tax ID) <span className="text-rose-500">*</span>
                                        </Label>
                                        <span className="text-[10px] font-mono text-muted-foreground">
                                            {localBusiness.gstin.length}/15 chars
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="gstin"
                                            maxLength={15}
                                            placeholder="e.g. 24AAAAA0000A1Z5"
                                            value={localBusiness.gstin}
                                            onChange={(e) => handleUpperChange('gstin', e.target.value)}
                                            className="h-9 text-xs font-mono font-bold tracking-wider"
                                        />
                                        {localBusiness.gstin.length === 15 && (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-2.5 top-1/2 -translate-y-1/2" />
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        15-character statutory alphanumeric GST number. Typing will auto-fill PAN and state code.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="pan" className="text-xs font-semibold">
                                            PAN (Permanent Account Number) <span className="text-rose-500">*</span>
                                        </Label>
                                        <span className="text-[10px] font-mono text-muted-foreground">
                                            {localBusiness.pan.length}/10 chars
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="pan"
                                            maxLength={10}
                                            placeholder="e.g. AAAAA0000A"
                                            value={localBusiness.pan}
                                            onChange={(e) => handleUpperChange('pan', e.target.value)}
                                            className="h-9 text-xs font-mono font-bold tracking-wider"
                                        />
                                        {localBusiness.pan.length === 10 && (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-2.5 top-1/2 -translate-y-1/2" />
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">10-digit income tax permanent account identifier</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="stateCode" className="text-xs font-semibold">
                                        GST State Code
                                    </Label>
                                    <Input
                                        id="stateCode"
                                        maxLength={2}
                                        placeholder="e.g. 24 (Gujarat), 27 (MH)"
                                        value={localBusiness.stateCode}
                                        onChange={(e) => handleChange('stateCode', e.target.value)}
                                        className="h-9 text-xs font-mono"
                                    />
                                    <p className="text-[10px] text-muted-foreground">2-digit numeric prefix from GSTIN</p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="msme" className="text-xs font-semibold">
                                        MSME / Udyam Registration
                                    </Label>
                                    <Input
                                        id="msme"
                                        placeholder="e.g. UDYAM-GJ-01-0000000"
                                        value={localBusiness.msme}
                                        onChange={(e) => handleUpperChange('msme', e.target.value)}
                                        className="h-9 text-xs font-mono"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Helps clients comply with 45-day MSME payment terms</p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="tan" className="text-xs font-semibold">
                                        TAN (Tax Deduction Account)
                                    </Label>
                                    <Input
                                        id="tan"
                                        maxLength={10}
                                        placeholder="e.g. BRDA12345C"
                                        value={localBusiness.tan}
                                        onChange={(e) => handleUpperChange('tan', e.target.value)}
                                        className="h-9 text-xs font-mono"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Used for TDS returns and deduction certificates</p>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="lutNumber" className="text-xs font-semibold">
                                    LUT / Bond Reference (For Zero-Rated / Export Invoicing)
                                </Label>
                                <Input
                                    id="lutNumber"
                                    placeholder="e.g. AD2404240001234 (Letter of Undertaking for Export of Services without IGST)"
                                    value={localBusiness.lutNumber}
                                    onChange={(e) => handleChange('lutNumber', e.target.value)}
                                    className="h-9 text-xs font-mono"
                                />
                                <p className="text-[10px] text-muted-foreground">Optional: Include for international clients and cross-border billing</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Section 3: Registered & Operating Office Addresses */}
            {activeSection === 'address' && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="space-y-4">
                    {/* Registered Office */}
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="p-4 pb-3 border-b border-border/50">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-sky-500" />
                                Registered Office Address (Headquarters)
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Official headquarters address recorded with Ministry of Corporate Affairs and GST tax jurisdiction.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="addressLine1" className="text-xs font-semibold">
                                        Address Line 1 (Building / Suite / Flat) <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="addressLine1"
                                        placeholder="e.g. 402-404, Tech Park Tower A"
                                        value={localBusiness.addressLine1}
                                        onChange={(e) => handleChange('addressLine1', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="addressLine2" className="text-xs font-semibold">
                                        Address Line 2 (Street / Landmark / Area)
                                    </Label>
                                    <Input
                                        id="addressLine2"
                                        placeholder="e.g. Main Ring Road, Near City Center"
                                        value={localBusiness.addressLine2}
                                        onChange={(e) => handleChange('addressLine2', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="city" className="text-xs font-semibold">
                                        City / Town <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="city"
                                        placeholder="e.g. Vadodara"
                                        value={localBusiness.city}
                                        onChange={(e) => handleChange('city', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="state" className="text-xs font-semibold">
                                        State / Province <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="state"
                                        placeholder="e.g. Gujarat"
                                        value={localBusiness.state}
                                        onChange={(e) => handleChange('state', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="pincode" className="text-xs font-semibold">
                                        Postal / PIN Code <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="pincode"
                                        placeholder="e.g. 390001"
                                        value={localBusiness.pincode}
                                        onChange={(e) => handleChange('pincode', e.target.value)}
                                        className="h-9 text-xs font-mono"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="country" className="text-xs font-semibold">
                                        Country <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="country"
                                        placeholder="e.g. India"
                                        value={localBusiness.country}
                                        onChange={(e) => handleChange('country', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Operating / Dispatch Office */}
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="p-4 pb-3 border-b border-border/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <Building className="w-4 h-4 text-primary" />
                                        Operating / Dispatch Address
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Physical facility, warehouse, or secondary branch where goods/services originate.
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2 bg-secondary/30 p-1.5 px-2.5 rounded-lg border border-border/60">
                                    <Switch
                                        id="isSameAsRegistered"
                                        checked={localBusiness.isSameAsRegistered}
                                        onCheckedChange={(checked) => handleChange('isSameAsRegistered', checked)}
                                    />
                                    <Label htmlFor="isSameAsRegistered" className="text-xs font-medium cursor-pointer">
                                        Same as Registered
                                    </Label>
                                </div>
                            </div>
                        </CardHeader>
                        {!localBusiness.isSameAsRegistered && (
                            <CardContent className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="branchAddressLine1" className="text-xs font-semibold">Operating Line 1</Label>
                                        <Input
                                            id="branchAddressLine1"
                                            placeholder="Building, Unit No."
                                            value={localBusiness.branchAddressLine1}
                                            onChange={(e) => handleChange('branchAddressLine1', e.target.value)}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="branchAddressLine2" className="text-xs font-semibold">Operating Line 2</Label>
                                        <Input
                                            id="branchAddressLine2"
                                            placeholder="Area, Landmark"
                                            value={localBusiness.branchAddressLine2}
                                            onChange={(e) => handleChange('branchAddressLine2', e.target.value)}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="branchCity" className="text-xs font-semibold">City</Label>
                                        <Input
                                            id="branchCity"
                                            value={localBusiness.branchCity}
                                            onChange={(e) => handleChange('branchCity', e.target.value)}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="branchState" className="text-xs font-semibold">State</Label>
                                        <Input
                                            id="branchState"
                                            value={localBusiness.branchState}
                                            onChange={(e) => handleChange('branchState', e.target.value)}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="branchPincode" className="text-xs font-semibold">PIN Code</Label>
                                        <Input
                                            id="branchPincode"
                                            value={localBusiness.branchPincode}
                                            onChange={(e) => handleChange('branchPincode', e.target.value)}
                                            className="h-9 text-xs font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="branchCountry" className="text-xs font-semibold">Country</Label>
                                        <Input
                                            id="branchCountry"
                                            value={localBusiness.branchCountry}
                                            onChange={(e) => handleChange('branchCountry', e.target.value)}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                </motion.div>
            )}

            {/* Section 4: Official Contacts & Web */}
            {activeSection === 'contacts' && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="space-y-4">
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="p-4 pb-3 border-b border-border/50">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Mail className="w-4 h-4 text-violet-500" />
                                Official Communication & Billing Channels
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Contact information printed on customer documents and used for automated invoice deliveries.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-semibold">
                                        Official Business Email <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="e.g. info@devlomatix.com or contact@domain.com"
                                        value={localBusiness.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                    <p className="text-[10px] text-muted-foreground">General correspondence email displayed in quotation header</p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="billingEmail" className="text-xs font-semibold">
                                        Billing & Accounts Receivable Email
                                    </Label>
                                    <Input
                                        id="billingEmail"
                                        type="email"
                                        placeholder="e.g. accounts@devlomatix.com or billing@domain.com"
                                        value={localBusiness.billingEmail}
                                        onChange={(e) => handleChange('billingEmail', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Used for payment receipts, TDS certificates, and remittance slips</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone" className="text-xs font-semibold">
                                        Office Landline / Primary Desk
                                    </Label>
                                    <Input
                                        id="phone"
                                        placeholder="e.g. +91 265 2345678"
                                        value={localBusiness.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="mobile" className="text-xs font-semibold">
                                        Direct Mobile / Support Line
                                    </Label>
                                    <Input
                                        id="mobile"
                                        placeholder="e.g. +91 98765 43210"
                                        value={localBusiness.mobile}
                                        onChange={(e) => handleChange('mobile', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="whatsapp" className="text-xs font-semibold">
                                        WhatsApp Business Number
                                    </Label>
                                    <Input
                                        id="whatsapp"
                                        placeholder="e.g. +91 98765 43210"
                                        value={localBusiness.whatsapp}
                                        onChange={(e) => handleChange('whatsapp', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="website" className="text-xs font-semibold">
                                    Official Corporate Website URL
                                </Label>
                                <Input
                                    id="website"
                                    placeholder="e.g. https://devlomatix.com"
                                    value={localBusiness.website}
                                    onChange={(e) => handleChange('website', e.target.value)}
                                    className="h-9 text-xs"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Section 5: Banking & Payout Coordinates */}
            {activeSection === 'banking' && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="space-y-4">
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="p-4 pb-3 border-b border-border/50">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Landmark className="w-4 h-4 text-emerald-500" />
                                Official Banking Coordinates & Payout Instructions
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Printed on quotations and invoices so clients can initiate wire transfers, NEFT, RTGS, IMPS, or UPI payments directly.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="bankName" className="text-xs font-semibold">
                                        Bank Name <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="bankName"
                                        placeholder="e.g. HDFC Bank, ICICI Bank, State Bank of India"
                                        value={localBusiness.bankName}
                                        onChange={(e) => handleChange('bankName', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="accountHolder" className="text-xs font-semibold">
                                        Beneficiary / Account Holder Name <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="accountHolder"
                                        placeholder="e.g. Devlomatix Solutions Private Limited"
                                        value={localBusiness.accountHolder}
                                        onChange={(e) => handleChange('accountHolder', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Exact account name for bank wire clearing</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="accountNumber" className="text-xs font-semibold">
                                        Bank Account Number <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="accountNumber"
                                        placeholder="e.g. 50200012345678"
                                        value={localBusiness.accountNumber}
                                        onChange={(e) => handleChange('accountNumber', e.target.value)}
                                        className="h-9 text-xs font-mono font-bold"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="accountType" className="text-xs font-semibold">
                                        Account Type
                                    </Label>
                                    <Select
                                        value={localBusiness.accountType}
                                        onValueChange={(val) => handleChange('accountType', val)}
                                    >
                                        <SelectTrigger id="accountType" className="h-9 text-xs">
                                            <SelectValue placeholder="Account Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ACCOUNT_TYPES.map(acc => (
                                                <SelectItem key={acc.value} value={acc.value} className="text-xs">
                                                    {acc.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="ifsc" className="text-xs font-semibold">
                                            IFSC Code <span className="text-rose-500">*</span>
                                        </Label>
                                        <span className="text-[10px] font-mono text-muted-foreground">
                                            {localBusiness.ifsc.length}/11 chars
                                        </span>
                                    </div>
                                    <Input
                                        id="ifsc"
                                        maxLength={11}
                                        placeholder="e.g. HDFC0001234"
                                        value={localBusiness.ifsc}
                                        onChange={(e) => handleUpperChange('ifsc', e.target.value)}
                                        className="h-9 text-xs font-mono font-bold tracking-wider"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="branch" className="text-xs font-semibold">
                                        Bank Branch Name & City
                                    </Label>
                                    <Input
                                        id="branch"
                                        placeholder="e.g. Alkapuri Branch, Vadodara"
                                        value={localBusiness.branch}
                                        onChange={(e) => handleChange('branch', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="upiId" className="text-xs font-semibold">
                                        UPI ID / VPA (Virtual Payment Address)
                                    </Label>
                                    <Input
                                        id="upiId"
                                        placeholder="e.g. devlomatix@icici or 9876543210@paytm"
                                        value={localBusiness.upiId}
                                        onChange={(e) => handleChange('upiId', e.target.value)}
                                        className="h-9 text-xs font-mono"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Used for instant mobile QR code and UPI payments</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Section 6: Invoicing & Document Presets */}
            {activeSection === 'invoicing' && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="space-y-4">
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="p-4 pb-3 border-b border-border/50">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <FileText className="w-4 h-4 text-amber-500" />
                                Quotation & Invoicing Defaults
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Global prefixes, terms, authorized signatories, and jurisdiction disclaimers pre-loaded into new quotations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="quotationPrefix" className="text-xs font-semibold">
                                        Quotation No. Prefix
                                    </Label>
                                    <Input
                                        id="quotationPrefix"
                                        placeholder="e.g. QTN- or DEV-QT-"
                                        value={localBusiness.quotationPrefix}
                                        onChange={(e) => handleUpperChange('quotationPrefix', e.target.value)}
                                        className="h-9 text-xs font-mono font-bold"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Prefix applied to auto-generated quotation numbering</p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="invoicePrefix" className="text-xs font-semibold">
                                        Invoice No. Prefix
                                    </Label>
                                    <Input
                                        id="invoicePrefix"
                                        placeholder="e.g. INV- or DEV-INV-"
                                        value={localBusiness.invoicePrefix}
                                        onChange={(e) => handleUpperChange('invoicePrefix', e.target.value)}
                                        className="h-9 text-xs font-mono font-bold"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Prefix applied when converting quotation to invoice</p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="jurisdictionCity" className="text-xs font-semibold">
                                        Legal Jurisdiction City
                                    </Label>
                                    <Input
                                        id="jurisdictionCity"
                                        placeholder="e.g. Vadodara Jurisdiction"
                                        value={localBusiness.jurisdictionCity}
                                        onChange={(e) => handleChange('jurisdictionCity', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Dispute resolution court jurisdiction</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="signatoryName" className="text-xs font-semibold">
                                        Authorized Signatory Name
                                    </Label>
                                    <Input
                                        id="signatoryName"
                                        placeholder="e.g. Amit Vishwakarma"
                                        value={localBusiness.signatoryName}
                                        onChange={(e) => handleChange('signatoryName', e.target.value)}
                                        className="h-9 text-xs font-medium"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Printed above the official authorization stamp on documents</p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="signatoryDesignation" className="text-xs font-semibold">
                                        Signatory Designation / Title
                                    </Label>
                                    <Input
                                        id="signatoryDesignation"
                                        placeholder="e.g. Managing Director / Partner"
                                        value={localBusiness.signatoryDesignation}
                                        onChange={(e) => handleChange('signatoryDesignation', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="defaultPaymentTerms" className="text-xs font-semibold">
                                    Standard Payment Terms
                                </Label>
                                <Input
                                    id="defaultPaymentTerms"
                                    placeholder="e.g. 50% Advance, 50% upon milestone delivery"
                                    value={localBusiness.defaultPaymentTerms}
                                    onChange={(e) => handleChange('defaultPaymentTerms', e.target.value)}
                                    className="h-9 text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="defaultTerms" className="text-xs font-semibold">
                                    Default Terms & Conditions (Multi-line)
                                </Label>
                                <Textarea
                                    id="defaultTerms"
                                    rows={4}
                                    value={localBusiness.defaultTerms}
                                    onChange={(e) => handleChange('defaultTerms', e.target.value)}
                                    className="text-xs font-mono leading-relaxed"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="defaultNotes" className="text-xs font-semibold">
                                    Default Closing / Thank You Note
                                </Label>
                                <Input
                                    id="defaultNotes"
                                    placeholder="e.g. Thank you for choosing Devlomatix."
                                    value={localBusiness.defaultNotes}
                                    onChange={(e) => handleChange('defaultNotes', e.target.value)}
                                    className="h-9 text-xs"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Bottom Sticky Save Bar */}
            <StickySaveBar
                isDirty={isDirty}
                saving={saving}
                onSave={handleSave}
                onReset={handleReset}
                label="Unsaved Business Details"
            />
        </div>
    );
}
export default BusinessDetailsSettings;
