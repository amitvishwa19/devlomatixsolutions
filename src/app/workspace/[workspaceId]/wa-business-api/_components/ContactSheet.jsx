'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Loader2, User, Phone, Mail, Tag, Palette, Folder,
    Sparkles, RefreshCw, CheckCircle2,
    Upload, Layout, ClipboardList,
    FileDown, FileSpreadsheet, X as CloseIcon,
    FileIcon, AlertCircle
} from 'lucide-react';
import { useAction } from '@/hooks/use-action';
import { saveContact } from '../_actions/save-contact';
import { checkNumber } from '../_actions/check-number';
import { importContacts } from '../_actions/import-contacts';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import ReviewImportDialog from './ReviewImportDialog';

export default function ContactSheet({
    isOpen,
    onOpenChange,
    activeContact,
    categories,
    userId,
    workspaceId,
    onSave
}) {
    const [contactForm, setContactForm] = useState({
        name: '',
        phone: '',
        email: '',
        categoryId: '',
        category: '',
        tags: [],
        tagsStr: '',
        color: '#3b82f6',
        info: ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [activeMode, setActiveMode] = useState('form'); // 'form', 'bulk', 'copypaste'
    const [importReviewData, setImportReviewData] = useState([]);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [rawPasteText, setRawPasteText] = useState('');

    const { execute: executeSave } = useAction(saveContact, {
        onSuccess: () => {
            toast.success(activeContact ? "Contact updated" : "Contact created", { id: 'save-contact' });
            setIsSaving(false);
            onSave();
            onOpenChange(false);
        },
        onError: (err) => {
            const errorMsg = typeof err === 'string' ? err : (err?.message || "Failed to save contact");
            toast.error(errorMsg, { id: 'save-contact' });
            setIsSaving(false);
        }
    });

    const { execute: executeImport } = useAction(importContacts, {
        onSuccess: (data) => {
            toast.success(data.message || "Import completed", { id: 'import-contacts' });
            setIsReviewOpen(false);
            setIsImporting(false);
            setImportReviewData([]);
            onSave();
            onOpenChange(false);
        },
        onError: (err) => {
            toast.error(err, { id: 'import-contacts' });
            setIsImporting(false);
        }
    });

    const { execute: executeCheckNumber, isLoading: isChecking } = useAction(checkNumber, {
        onSuccess: (data) => {
            if (data.exists) {
                toast.success(data.name ? `WhatsApp Node: ${data.name}` : "WhatsApp Active Node Found", { id: 'check-number' });
                // Only override name if it's currently empty to avoid overwriting user intent
                if (data.name && (!contactForm.name || contactForm.name === '')) {
                    setContactForm(prev => ({ ...prev, name: data.name }));
                }
            } else {
                toast.error("Node not detected on WhatsApp", { id: 'check-number' });
            }
        },
        onError: (err) => {
            toast.error(err || "Handshake failed", { id: 'check-number' });
        }
    });

    useEffect(() => {
        if (activeContact) {
            setContactForm({
                name: activeContact.name,
                phone: activeContact.phone,
                email: activeContact.email || '',
                categoryId: activeContact.categoryId || '',
                category: activeContact.category || '',
                tags: activeContact.tags || [],
                tagsStr: activeContact.tags?.join(', ') || '',
                color: activeContact.color || '#3b82f6',
                info: activeContact.info || ''
            });
        } else {
            setContactForm({
                name: '',
                phone: '',
                email: '',
                categoryId: '',
                category: '',
                tags: [],
                tagsStr: '',
                color: '#3b82f6',
                info: ''
            });
        }
    }, [activeContact, isOpen]);

    const normalizePhone = (phoneStr) => {
        const clean = String(phoneStr).replace(/[^\d]/g, '');
        if (clean.length < 10) return null;
        if (clean.length === 10 || clean.length === 11) return `+91${clean}`;
        if (clean.length >= 12) return `+${clean}`;
        return `+${clean}`;
    };

    const handleCheckNumber = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const formatted = normalizePhone(contactForm.phone);
        if (!formatted) {
            toast.error("Valid phone (min 10 digits) required", { id: 'check-number' });
            return;
        }
        toast.loading("Testing node availability...", { id: 'check-number' });
        executeCheckNumber({ phone: formatted, workspaceId });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const formattedPhone = normalizePhone(contactForm.phone);
        if (!formattedPhone) {
            toast.error("Invalid phone number. Minimum 10 digits required.", { id: 'save-contact' });
            return;
        }

        setIsSaving(true);
        toast.loading(activeContact ? "Updating contact..." : "Creating contact...", { id: 'save-contact' });
        executeSave({
            ...contactForm,
            phone: formattedPhone,
            tags: contactForm.tagsStr.split(',').map(t => t.trim()).filter(Boolean),
            id: activeContact?.id,
            userId,
            workspaceId
        });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const rawData = XLSX.utils.sheet_to_json(ws);

                if (rawData.length === 0) {
                    toast.error("File is empty");
                    return;
                }

                // Map to standard format
                const parsed = rawData.map(row => {
                    // Try to find columns by common names
                    const name = row.name || row.Name || row['Full Name'] || '';
                    const rawPhone = String(row.phone || row.Phone || row['Mobile Number'] || row.Mobile || '');
                    const phone = normalizePhone(rawPhone);
                    const email = row.email || row.Email || '';
                    const category = row.category || row.Category || row.Group || '';
                    const tags = row.tags || row.Tags || '';

                    return { name, phone, email, category, tags };
                }).filter(c => c.phone);

                if (parsed.length === 0) {
                    toast.error("No valid contacts found (missing phone numbers)");
                    return;
                }

                setImportReviewData(parsed);
                setIsReviewOpen(true);
            } catch (err) {
                console.error("Parse error:", err);
                toast.error("Failed to parse file. Ensure it is a valid Excel or CSV.");
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = '';
    };

    const downloadTemplate = (format = 'xlsx') => {
        const headers = [['Full Name', 'Mobile Number', 'Email', 'Category', 'Tags']];
        const sample = [['John Doe', '+1234567890', 'john@example.com', 'VIP', 'lead, test']];
        const data = [...headers, ...sample];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Contacts Template");

        if (format === 'csv') {
            const csvOutput = XLSX.utils.sheet_to_csv(ws);
            const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "contacts_template.csv";
            link.click();
        } else {
            XLSX.writeFile(wb, "contacts_template.xlsx");
        }
        toast.info("Template downloaded!");
    };

    const runImport = () => {
        setIsImporting(true);
        executeImport({ contacts: importReviewData, workspaceId, userId });
    };

    const handleProcessPaste = () => {
        if (!rawPasteText || rawPasteText.trim() === '') {
            toast.error("Please enter some numbers first");
            return;
        }

        // Split by lines, commas, or semicolons
        const lines = rawPasteText.split(/[\n,;]/);
        const parsed = lines.map(line => {
            const formatted = normalizePhone(line.trim());
            if (!formatted) return null;
            return {
                name: '', // User will map/add names in review
                phone: formatted,
                email: '',
                category: '',
                tags: ''
            };
        }).filter(Boolean);

        if (parsed.length === 0) {
            toast.error("No valid phone numbers detected in text");
            return;
        }

        setImportReviewData(parsed);
        setRawPasteText('');
        setIsReviewOpen(true);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-card border-border shadow-2xl">
                <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                    {/* Left Branding/Info Panel */}
                    <div className="hidden md:flex flex-col justify-between w-[280px] bg-muted/20 p-6 border-r border-border/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />

                        <div className="relative z-10 space-y-6">
                            <div>
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 shadow-inner">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">Contact Node</h3>
                                <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed opacity-80">
                                    Define the identity and categorization attributes for this contact to enable seamless CRM filtering.
                                </p>
                            </div>

                            {/* Section: Quick Actions sidebar */}
                            <div className="space-y-2 pt-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-1">Quick Actions</span>
                                <div className="grid grid-cols-1 gap-1.5">
                                    <Button
                                        variant={activeMode === 'form' ? 'secondary' : 'outline'}
                                        size="sm"
                                        className={`w-full justify-start gap-2.5 h-10 px-3 transition-all ${activeMode === 'form' ? 'ring-1 ring-primary/20' : 'border-transparent'}`}
                                        onClick={() => setActiveMode('form')}
                                    >
                                        <div className={`p-1 rounded bg-background border shadow-xs ${activeMode === 'form' ? 'text-primary' : ''}`}><User className="w-3 h-3" /></div>
                                        <span className="text-xs font-semibold">Single Identity</span>
                                    </Button>
                                    <Button
                                        variant={activeMode === 'bulk' ? 'secondary' : 'outline'}
                                        size="sm"
                                        className={`w-full justify-start gap-2.5 h-10 px-3 transition-all ${activeMode === 'bulk' ? 'ring-1 ring-primary/20' : 'border-transparent'}`}
                                        onClick={() => setActiveMode('bulk')}
                                    >
                                        <div className={`p-1 rounded bg-background border shadow-xs ${activeMode === 'bulk' ? 'text-primary' : ''}`}><Upload className="w-3 h-3" /></div>
                                        <span className="text-xs font-semibold">Bulk Upload (Import)</span>
                                    </Button>

                                    <Button
                                        variant={activeMode === 'copypaste' ? 'secondary' : 'outline'}
                                        size="sm"
                                        className={`w-full justify-start gap-2.5 h-10 px-3 transition-all ${activeMode === 'copypaste' ? 'ring-1 ring-primary/20' : 'border-transparent'}`}
                                        onClick={() => setActiveMode('copypaste')}
                                    >
                                        <div className={`p-1 rounded bg-background border shadow-xs ${activeMode === 'copypaste' ? 'text-primary' : ''}`}><ClipboardList className="w-3 h-3" /></div>
                                        <span className="text-xs font-semibold">Copy Paste Mode</span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10 mt-12">
                            <div className="p-3 bg-background/50 backdrop-blur-sm rounded-xl border border-white/5 shadow-sm">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[10px] font-bold  text-muted-foreground uppercase tracking-tighter">Sync Active</span>
                                </div>
                                <p className="text-[10px] text-foreground/70 font-medium leading-tight">Data will instantly sync with active WhatsApp message routing.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Content View */}
                    <div className="flex-1 flex flex-col p-8 overflow-y-auto">
                        {activeMode === 'form' ? (
                            <>
                                <DialogHeader className="pb-6">
                                    <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                                        {activeContact ? 'Edit Identity' : 'New Identity'}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs">
                                        Configure the primary details for this audience member.
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleSave} className="flex-1 flex flex-col gap-8">
                                    {/* ... existing form sections ... */}
                                    {/* Section: Basic Details */}
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                                            <div className="p-1 rounded-md bg-primary/10"><User className="w-3.5 h-3.5 text-primary" /></div>
                                            <h4 className="text-sm font-semibold tracking-tight text-foreground/90">Basic Information</h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2 md:col-span-2">
                                                <Label className=" text-muted-foreground">Full Name</Label>
                                                <Input
                                                    placeholder=""
                                                    value={contactForm.name}
                                                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                                                    required
                                                    className="bg-muted/10  border focus-visible:ring-primary/20 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className=" text-muted-foreground">Mobile Number</Label>
                                                <div className="relative group">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-sm bg-background border shadow-sm group-focus-within:border-primary/30 transition-colors">
                                                        <Phone className="w-3 h-3 text-muted-foreground/70" />
                                                    </div>
                                                    <Input
                                                        placeholder="+123456789"
                                                        value={contactForm.phone}
                                                        onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                                                        required
                                                        className="bg-muted/10  pl-11 pr-12 font-mono text-sm border focus-visible:ring-primary/20 transition-all"
                                                    />
                                                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                                                            onClick={handleCheckNumber}
                                                            disabled={isChecking}
                                                            title="Sync with WhatsApp"
                                                        >
                                                            {isChecking ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                                            ) : (
                                                                <RefreshCw className="w-3.5 h-3.5" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className=" text-muted-foreground">Email Address</Label>
                                                <div className="relative group">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-sm bg-background border shadow-sm group-focus-within:border-primary/30 transition-colors">
                                                        <Mail className="w-3 h-3 text-muted-foreground/70" />
                                                    </div>
                                                    <Input
                                                        placeholder="user@cloud.com"
                                                        value={contactForm.email}
                                                        onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                                                        className="bg-muted/10  pl-11 border focus-visible:ring-primary/20 transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section: Categorization */}
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                                            <div className="p-1 rounded-md bg-emerald-500/10"><Folder className="w-3.5 h-3.5 text-emerald-500" /></div>
                                            <h4 className="text-sm font-semibold tracking-tight text-foreground/90">Meta & Classification</h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label className=" text-muted-foreground">Text Category</Label>
                                                <Input
                                                    placeholder="e.g. VIP, Partner, Supplier"
                                                    value={contactForm.category}
                                                    onChange={e => setContactForm({ ...contactForm, category: e.target.value })}
                                                    className="bg-muted/10  border focus-visible:ring-primary/20 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className=" text-muted-foreground">Brand Color</Label>
                                                <div className="relative group">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-sm bg-background border shadow-sm group-focus-within:border-primary/30 transition-colors pointer-events-none">
                                                        <Palette className="w-3 h-3 text-muted-foreground/70" />
                                                    </div>
                                                    <Input
                                                        type="color"
                                                        value={contactForm.color}
                                                        onChange={e => setContactForm({ ...contactForm, color: e.target.value })}
                                                        className=" pl-11 w-full p-1 cursor-pointer bg-muted/10 border focus-visible:ring-primary/20 rounded-md transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label className=" text-muted-foreground">Tags (Comma Separated)</Label>
                                                <div className="relative group">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-sm bg-background border shadow-sm group-focus-within:border-primary/30 transition-colors">
                                                        <Tag className="w-3 h-3 text-muted-foreground/70" />
                                                    </div>
                                                    <Input
                                                        placeholder="vip, lead, internal..."
                                                        value={contactForm.tagsStr}
                                                        onChange={e => setContactForm({ ...contactForm, tagsStr: e.target.value })}
                                                        className="bg-muted/10  pl-11 border focus-visible:ring-primary/20 transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section: Logical Association */}
                                    <div className="space-y-3">
                                        <Label className=" text-muted-foreground mb-1 block">Visual Board Category</Label>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                            {categories.map(cat => (
                                                <div
                                                    key={cat.id}
                                                    onClick={() => setContactForm({ ...contactForm, categoryId: contactForm.categoryId === cat.id ? '' : cat.id })}
                                                    className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${contactForm.categoryId === cat.id ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/20' : 'hover:bg-muted/40 border-border/40 opacity-70 hover:opacity-100 hover:border-border/80'}`}
                                                >
                                                    <div className="w-3 h-3 rounded-full shadow-sm ring-1 ring-black/10 dark:ring-white/10" style={{ backgroundColor: cat.color }} />
                                                    <span className="text-[12px] font-semibold truncate text-foreground/90">{cat.name}</span>
                                                </div>
                                            ))}
                                            {categories.length === 0 && (
                                                <div className="col-span-full py-6 text-center border rounded-xl border-dashed bg-muted/5 text-muted-foreground text-xs italic">
                                                    No visual categories defined in workspace.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-6 mt-auto">
                                        <Button type="submit" disabled={isSaving} className="w-full h-12 text-sm font-bold  shadow-xl shadow-primary/10 hover:shadow-primary/20 transition-all gap-2 rounded-lg">
                                            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                            {activeContact ? (isSaving ? 'Updating Node...' : 'Save Changes') : (isSaving ? 'Initializing...' : 'Initialize Contact Node')}
                                        </Button>
                                    </div>
                                </form>
                            </>
                        ) : activeMode === 'bulk' ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="space-y-2">
                                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto border border-primary/20 shadow-xl">
                                        <FileSpreadsheet className="w-8 h-8 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight">Bulk Audience Onboarding</h2>
                                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                        Upload your spreadsheet to instantly initialize multiple contact nodes with full metadata support.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                    <div
                                        className="p-8 border-2 border-dashed border-border/60 rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group relative"
                                        onClick={() => document.getElementById('bulk-xls-upload').click()}
                                    >
                                        <input
                                            type="file"
                                            id="bulk-xls-upload"
                                            className="hidden"
                                            accept=".xlsx,.xls,.csv"
                                            onChange={handleFileUpload}
                                        />
                                        <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        <h4 className="text-sm font-bold mb-1">Select Spreadsheet</h4>
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">XLSX, XLS or CSV</p>
                                    </div>

                                    <div
                                        className="p-8 border-2 border-dashed border-border/60 rounded-2xl hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all cursor-pointer group"
                                        onClick={() => downloadTemplate('xlsx')}
                                    >
                                        <FileDown className="w-10 h-10 mx-auto mb-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                                        <h4 className="text-sm font-bold mb-1">Get Template</h4>
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Excel format (Standard)</p>
                                    </div>
                                </div>

                                <div className="w-full p-4 bg-muted/20 rounded-xl border flex items-start gap-3 text-left">
                                    <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold uppercase tracking-tight">Import Guidelines</p>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            Ensure your file includes columns for <b>Full Name</b> and <b>Mobile Number</b> (with country code).
                                            Optional metadata like Emails, Categories, and Tags will be automatically mapped.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <Button variant="ghost" className="text-xs transition-all hover:gap-3" onClick={() => setActiveMode('form')}>
                                        <CloseIcon className="w-3.5 h-3.5 mr-2" /> Cancel and Return to Single Entry
                                    </Button>
                                </div>
                            </div>
                        ) : activeMode === 'copypaste' ? (
                            <div className="flex-1 flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                                            <ClipboardList className="w-4 h-4 text-primary" />
                                        </div>
                                        <h2 className="text-lg font-bold tracking-tight">Fast Entry Port</h2>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Paste raw data from any source. The engine will automatically isolate phone numbers and prepare them for your audience library.
                                    </p>
                                </div>

                                <div className="flex-1 flex flex-col space-y-3">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center justify-between">
                                        <span>Phone Numbers (one per line)</span>
                                        <span className="text-[10px] lowercase font-normal opacity-60 italic">Separated by lines or commas</span>
                                    </Label>
                                    <Textarea
                                        placeholder={"Enter phone numbers, one per line:\n+1234567890\n+0987654321\n..."}
                                        value={rawPasteText}
                                        onChange={(e) => setRawPasteText(e.target.value)}
                                        className="flex-1 min-h-[300px] bg-muted/10 border-2 border-border/40 focus:border-primary/50 focus:ring-primary/20 text-sm font-mono leading-relaxed p-4 resize-none transition-all shadow-inner"
                                    />
                                </div>

                                <div className="pt-4 flex items-center justify-between gap-4">
                                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setRawPasteText(''); setActiveMode('form'); }}>
                                        <CloseIcon className="w-3.5 h-3.5 mr-2" /> Discard Entry
                                    </Button>
                                    <Button size="lg" className="px-8 shadow-xl shadow-primary/20 font-bold" onClick={handleProcessPaste}>
                                        <Sparkles className="w-4 h-4 mr-2" /> Process & Review Logic
                                    </Button>
                                </div>

                                <div className="p-3 bg-muted/20 rounded-lg border border-dashed text-center">
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest leading-loose">
                                        Tip: You can paste messy contact lists—the system filters out names and emails to find digits.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                                <p className="text-sm font-bold uppercase tracking-widest">Mode {activeMode} Coming Soon</p>
                                <Button variant="link" onClick={() => setActiveMode('form')}>Go Back</Button>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>

            <ReviewImportDialog
                isOpen={isReviewOpen}
                onOpenChange={setIsReviewOpen}
                data={importReviewData}
                setData={setImportReviewData}
                onImport={runImport}
                isImporting={isImporting}
            />
        </Dialog>
    );
}
