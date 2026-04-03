'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Smartphone, Check, MessageSquare, Loader2, Image as ImageIcon, Video, Music, File, MapPin, Send, Users, X, MoreHorizontal, Sparkles, LayoutGrid, List, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useModal } from '@/hooks/useModal';
import { MediaLibraryModal } from '../../article/_components/MediaLibraryModal';
import { DynamicIcon } from 'lucide-react/dynamic';

export default function TemplatePage() {
    const params = useParams();
    const workspaceId = params.workspaceId;
    const { onOpen } = useModal();
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('my_templates');
    const [viewMode, setViewMode] = useState('list');

    // Fetch Templates directly from API
    const fetchTemplates = async (isForce = false) => {
        setIsLoading(true);
        try {
            const endpoint = isForce ? '/api/wa/templates?forceSeed=true' : '/api/wa/templates';
            const res = await fetch(endpoint); // Ensure we call the exact route fetching all
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            if (data.success) {

                console.log('data', data)
                const parsedTemplates = data.templates.map(t => {
                    let newT = { ...t };
                    if (typeof t.metadata === 'string' && t.metadata.trim().startsWith('{')) {
                        try { newT.metadata = JSON.parse(t.metadata); } catch (e) { }
                    }
                    if (typeof t.buttons === 'string' && t.buttons.trim().startsWith('[')) {
                        try { newT.buttons = JSON.parse(t.buttons); } catch (e) { }
                    }
                    return newT;
                });
                setTemplates(parsedTemplates);
                if (isForce) {
                    localStorage.setItem('wa_templates_seeded_v1', 'true');
                }
            }
        } catch (error) {
            console.error("Error fetching templates:", error);
            toast.error("Failed to load templates from the database.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const seeded = localStorage.getItem('wa_templates_seeded_v1');
        if (!seeded) {
            fetchTemplates(true);
        } else {
            fetchTemplates();
        }
    }, []);

    // Modal & Builder State
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'UTILITY',
        language: 'en_US',
        type: 'text',
        body: '',
        footer: '',
        buttons: [''],
        metadata: {
            mediaUrl: '',
            latitude: '',
            longitude: '',
            locationName: '',
            locationAddress: '',
            listButton: 'Select Option',
            listSections: [{ title: 'Options', rows: [{ title: '', description: '' }] }]
        }
    });

    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [testRecipient, setTestRecipient] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [testingTemplate, setTestingTemplate] = useState(null);
    const [allContacts, setAllContacts] = useState([]);
    const [selectedContactIds, setSelectedContactIds] = useState([]);
    const [contactSearch, setContactSearch] = useState('');
    const [isFetchingContacts, setIsFetchingContacts] = useState(false);
    const [savedTestNumbers, setSavedTestNumbers] = useState([]);
    const { data: session } = useSession();
    const userId = session?.user?.userId || session?.user?.id;

    // Handle template builder open
    const handleOpenBuilder = (template = null) => {
        if (template) {
            setFormData({ ...template });
            setEditingId(template.id);
        } else {
            setFormData({
                name: '',
                category: 'UTILITY',
                language: 'en_US',
                type: 'text',
                body: '',
                footer: '',
                buttons: [''],
                metadata: {
                    mediaUrl: '',
                    latitude: '',
                    longitude: '',
                    locationName: '',
                    locationAddress: '',
                    listButton: 'Select Option',
                    listSections: [{ title: 'Options', rows: [{ title: '', description: '' }] }],
                    carouselCards: [{ title: '', description: '', imageUrl: '', buttonText: 'View Details' }]
                }
            });
            setEditingId(null);
        }
        setIsBuilderOpen(true);
    };

    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSubmittingId, setIsSubmittingId] = useState(null);

    // Sync from Cloud API
    const handleSyncCloud = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/wa/template/sync');
            const data = await res.json();
            if (data.success) {
                toast.success(data.message || "Sync completed successfully");
                fetchTemplates();
            } else {
                throw new Error(data.error || "Sync failed");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to sync templates from Meta.");
        } finally {
            setIsSyncing(false);
        }
    };

    // Submit Template to Meta
    const handleSubmitToMeta = async (templateId) => {
        setIsSubmittingId(templateId);
        try {
            const res = await fetch('/api/wa/template/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Submitted to Meta for approval!");
                fetchTemplates();
            } else {
                throw new Error(data.error || "Submission failed");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to submit template to Meta.");
        } finally {
            setIsSubmittingId(null);
        }
    };

    // Refresh Single Template Status
    const handleCheckStatus = async (templateId) => {
        setIsSubmittingId(templateId);
        try {
            const res = await fetch(`/api/wa/template/status?templateId=${templateId}`);
            const data = await res.json();
            if (data.success) {
                toast.success(`Current Status: ${data.status}`);
                fetchTemplates();
            } else {
                throw new Error(data.error || "Status check failed");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to check status.");
        } finally {
            setIsSubmittingId(null);
        }
    };

    // Form Handlers
    const handleSave = async (shouldSubmit = false) => {
        if (!formData.name || !formData.body) return;
        setIsSaving(true);
        try {
            const payload = { ...formData };
            if (editingId) payload.id = editingId;

            const res = await fetch('/api/wa/template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || "Failed to save template");
            }

            const templateId = data.template?.id;
            toast.success(editingId ? "Template updated!" : "Template created successfully!");
            
            if (shouldSubmit && templateId && formData.platform === 'WHATSAPP_CLOUD') {
                setIsSubmittingId(templateId);
                await handleSubmitToMeta(templateId);
            } else {
                setIsBuilderOpen(false);
                fetchTemplates();
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
            setIsSubmittingId(null);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`/api/wa/template?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete");

            toast.success("Template deleted successfully");
            setTemplates((prev) => prev.filter((t) => t.id !== id));
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleClone = (template) => {
        const baseName = template.name || template.templateName || "New Template";
        
        const clonedTemplate = {
            ...template,
            id: null,
            name: `${baseName} Copy`,
            // Exact copy of the templateName as requested
            templateName: template.templateName || template.name,
            isDefault: false,
            status: template.status || 'DRAFT'
        };
        
        setFormData(clonedTemplate);
        setEditingId(null);
        setIsBuilderOpen(true);
        toast.info("Template cloned. You can now customize and save it.");
    };

    const handleButtonChange = (index, value) => {
        const newButtons = [...formData.buttons];
        newButtons[index] = value;
        setFormData({ ...formData, buttons: newButtons });
    };

    const addButton = () => {
        if (formData.buttons.length < 3) {
            setFormData({ ...formData, buttons: [...formData.buttons, ''] });
        }
    };

    const removeButton = (index) => {
        const newButtons = formData.buttons.filter((_, i) => i !== index);
        setFormData({ ...formData, buttons: newButtons });
    };

    const fetchContacts = async () => {
        if (!userId) return;
        setIsFetchingContacts(true);
        try {
            const res = await fetch(`/api/wa/contacts?userId=${userId}`);
            if (!res.ok) throw new Error("Failed to fetch contacts");
            const data = await res.json();
            setAllContacts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsFetchingContacts(false);
        }
    };

    const handleSendTest = async () => {
        const manualNumbers = testRecipient.split(',').map((n) => n.trim()).filter((n) => n);
        const contactNumbers = allContacts.
            filter((c) => selectedContactIds.includes(c.id)).
            map((c) => c.phone);

        const allRecipients = Array.from(new Set([...manualNumbers, ...contactNumbers]));

        if (allRecipients.length === 0) {
            toast.error("Please select or enter at least one recipient.");
            return;
        }

        setIsTesting(true);
        let successCount = 0;
        let failCount = 0;

        try {
            for (const recipient of allRecipients) {
                const payload = { to: recipient, text: testingTemplate.body };

                console.log('testingTemplate', testingTemplate)


                // Map based on type
                if (testingTemplate.type === 'image') payload.image = { url: testingTemplate.metadata?.mediaUrl };
                if (testingTemplate.type === 'video') payload.video = { url: testingTemplate.metadata?.mediaUrl };
                if (testingTemplate.type === 'audio') payload.audio = { url: testingTemplate.metadata?.mediaUrl };
                if (testingTemplate.type === 'document') payload.document = { url: testingTemplate.metadata?.mediaUrl };
                if (testingTemplate.type === 'location') {
                    const lat = parseFloat(testingTemplate.metadata?.latitude);
                    const lon = parseFloat(testingTemplate.metadata?.longitude);
                    if (!isNaN(lat) && !isNaN(lon)) {
                        payload.location = {
                            degreesLatitude: lat,
                            degreesLongitude: lon,
                            name: testingTemplate.metadata?.locationName || "location",
                            address: testingTemplate.metadata?.locationAddress || "location address"
                        };
                    }
                }

                if (testingTemplate.type === 'interactive-button') {
                    payload.interactive = {
                        type: "list",
                        body: { text: testingTemplate.body },
                        footer: testingTemplate.footer ? { text: testingTemplate.footer } : undefined,
                        action: {
                            button: "Options",
                            sections: [{
                                title: "Quick Balance",
                                rows: (testingTemplate.buttons || []).map((btn) => ({ id: btn, title: btn }))
                            }]
                        }
                    };
                }

                if (testingTemplate.type === 'interactive-group') {
                    payload.interactive = {
                        type: "list",
                        body: { text: testingTemplate.body },
                        footer: testingTemplate.footer ? { text: testingTemplate.footer } : undefined,
                        action: {
                            button: testingTemplate.metadata?.listButton || "Select Option",
                            sections: (testingTemplate.metadata?.listSections || []).map((section) => ({
                                title: section.title,
                                rows: section.rows.map((row) => ({
                                    id: row.title.toLowerCase().replace(/\s+/g, '_'),
                                    title: row.title,
                                    description: row.description
                                }))
                            }))
                        }
                    };
                }

                if (testingTemplate.type === 'carousel') {
                    payload.text = testingTemplate.body; // Fallback
                    payload.interactive = {
                        header: { title: testingTemplate.name, hasMediaAttachment: false },
                        body: { text: testingTemplate.body },
                        footer: testingTemplate.footer ? { text: testingTemplate.footer } : undefined,
                        carouselMessage: {
                            cards: (testingTemplate.metadata?.carouselCards || []).map((card, idx) => ({
                                header: {
                                    imageMessage: card.imageUrl ? { url: card.imageUrl } : undefined,
                                    hasMediaAttachment: !!card.imageUrl
                                },
                                body: { text: card.description || " " },
                                footer: { text: card.title || " " },
                                nativeFlowMessage: {
                                    buttons: [
                                        {
                                            name: "quick_reply",
                                            buttonParamsJson: JSON.stringify({
                                                display_text: card.buttonText || "View",
                                                id: `card_${idx}`
                                            })
                                        }
                                    ]
                                }
                            }))
                        }
                    };
                }

                const isCloud = testingTemplate.platform === 'WHATSAPP_CLOUD';
                const endpoint = isCloud ? '/api/wa/send-cloud-api' : '/api/wa/send-browser';

                // For Cloud API, we should ONLY send as a 'template' if it's an approved template
                // otherwise it only works if a conversation is already open (24h window)
                if (isCloud && testingTemplate.status === 'APPROVED' && testingTemplate.type !== 'interactive-group' && testingTemplate.type !== 'interactive-button') {
                    payload.type = 'template';
                    payload.template = {
                        // Use the new official templateName field if available, fallback to slugified name
                        name: testingTemplate.templateName || testingTemplate.name.toLowerCase().replace(/\s+/g, '_'),
                        language: { code: testingTemplate.language || 'en_US' },
                        components: []
                    };

                    // Add header component if there's media
                    if (['image', 'video', 'document'].includes(testingTemplate.type)) {
                        payload.template.components.push({
                            type: 'header',
                            parameters: [
                                {
                                    type: testingTemplate.type,
                                    [testingTemplate.type]: {
                                        link: testingTemplate.metadata?.mediaUrl
                                    }
                                }
                            ]
                        });
                    }

                    // For now, we don't have complex variable mapping, so we send empty body components
                    // unless we want to support variables {{1}}, {{2}} in the future.
                } else {
                    payload.type = testingTemplate.type;
                }

                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) successCount++; else
                    failCount++;
            }

            if (successCount > 0) {
                toast.success(`Sent to ${successCount} recipients! ${failCount > 0 ? `(${failCount} failed)` : ''}`);
                setIsTestModalOpen(false);
                setTestRecipient('');
                setSelectedContactIds([]);
            } else {
                toast.error("Failed to send to all recipients.");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsTesting(false);
        }
    };

    const openTestModal = async (template) => {
        setTestingTemplate(template);
        setIsTestModalOpen(true);
        fetchContacts();

        // Fetch saved test numbers from settings metadata
        try {
            const res = await fetch('/api/wa/auth');
            const data = await res.json();
            if (data.metadata?.testNumbers) {
                setSavedTestNumbers(data.metadata.testNumbers);
            }
        } catch (error) {
            console.error("Failed to fetch saved test numbers:", error);
        }
    };

    const toggleContact = (id) => {
        setSelectedContactIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const filteredContacts = allContacts.filter((c) =>
        c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.phone.includes(contactSearch)
    );

    const filteredTemplates = templates.filter((t) => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.body.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterType === 'browser') return matchesSearch && t.platform === 'WHATSAPP_BROWSER';
        if (filterType === 'cloud_api') return matchesSearch && t.platform === 'WHATSAPP_CLOUD' && t.isDefault;
        if (filterType === 'my_templates') return matchesSearch && !t.isDefault; // Only user-created content
        return matchesSearch;
    });

    const TemplatePreviewCard = ({ template: initialTemplate }) => {
        const template = { ...initialTemplate };
        if (typeof template.metadata === 'string' && template.metadata.trim().startsWith('{')) {
            try { template.metadata = JSON.parse(template.metadata); } catch (e) { }
        }
        if (typeof template.buttons === 'string' && template.buttons.trim().startsWith('[')) {
            try { template.buttons = JSON.parse(template.buttons); } catch (e) { }
        }

        return (
            <div className="group relative flex flex-col h-full bg-card/50  hover:bg-card border  hover:border-primary/30 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                {/* WhatsApp Bubble Preview */}
                <div className="flex-1 p-4 bg-muted/20 flex items-center justify-center relative min-h-[300px]">
                    <div className="w-full max-w-[280px] bg-background border border-border shadow-md rounded-md rounded-tl-none overflow-hidden flex flex-col relative z-10 transition-transform duration-300 group-hover:scale-[1.02]">
                        {/* Source Peak */}
                        <div className="absolute -left-[6px] top-0 w-0 h-0 border-t-8 border-t-background border-l-8 border-l-transparent" />

                        {/* Media Section */}
                        {['image', 'video', 'document', 'audio'].includes(template.type) && (
                            <div className="aspect-video bg-muted/30 flex items-center justify-center border-b border-border/10 relative overflow-hidden">
                                {template.type === 'image' && (
                                    template.metadata?.mediaUrl ?
                                        <img src={template.metadata.mediaUrl} className="w-full h-full object-cover" alt="preview" /> :
                                        <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                                )}
                                {template.type === 'video' && <Video className="w-10 h-10 text-muted-foreground/30" />}
                                {template.type === 'document' && <File className="w-10 h-10 text-blue-500/30" />}
                                {template.type === 'audio' && <Music className="w-10 h-10 text-muted-foreground/30" />}
                            </div>
                        )}

                        {/* Content Section */}
                        <div className="p-3 pb-1">
                            <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                                {template.body}
                            </div>
                            {template.footer && (
                                <div className="text-xs text-muted-foreground mt-2 italic">
                                    {template.footer}
                                </div>
                            )}
                            <div className="flex justify-end mt-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    {new Date(template.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    <Check className="w-3 h-3 text-blue-400" />
                                </span>
                            </div>
                        </div>

                        {/* Buttons Section */}
                        {(template.buttons && template.buttons.length > 0 && template.buttons[0] !== '') && (
                            <div className="border-t border-border/10 bg-muted/10 divide-y divide-border/10">
                                {template.buttons.filter(b => b).map((btn, idx) => (
                                    <div key={idx} className="p-2.5 text-center text-sm font-medium text-blue-500 hover:bg-muted/30 transition-colors flex items-center justify-center gap-2">
                                        <MessageSquare className="w-3.5 h-3.5 opacity-60" />
                                        {typeof btn === 'object' ? (btn.text || btn.url || "Button") : btn}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Interactive List Link */}
                        {template.type === 'interactive-group' && (
                            <div className="border-t border-border/10 bg-muted/10 p-2.5 text-center text-sm font-medium text-blue-400 hover:bg-muted/30 transition-colors uppercase tracking-tight">
                                {template.metadata?.listButton || 'View Options'}
                            </div>
                        )}
                    </div>

                    {/* Fake Background Patterns */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00ff00 0.5px, transparent 0.5px)', backgroundSize: '15px 15px' }} />
                </div>

                {/* Actions Footer */}
                <div className="px-5 py-4 bg-background border-t border-border/50 flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-foreground truncate">{template.name}</span>
                            {template.platform === 'WHATSAPP_CLOUD' && (
                                <Badge
                                    className={`h-4 text-[9px] px-1.5 uppercase tracking-tighter border-0 font-bold ${
                                        template.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30' :
                                        (template.status === 'PENDING_APPROVAL' || template.status === 'PENDING' || template.status === 'IN_APPEAL') ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30' :
                                        template.status === 'REJECTED' ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' :
                                        'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {template.status === 'APPROVED' ? "Approved" : 
                                     (template.status === 'PENDING_APPROVAL' || template.status === 'PENDING' || template.status === 'IN_APPEAL') ? "In Review" :
                                     template.status === 'REJECTED' ? "Rejected" : "Draft"}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center">
                            <code className="text-[10px] font-mono text-muted-foreground/60 truncate bg-muted/40 px-1.5 py-0.5 rounded border border-border/20 max-w-full">
                                {template.templateName || template.name.toLowerCase().replace(/\s+/g, '_')}
                            </code>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground uppercase opacity-60 tracking-wider font-semibold">
                                {template.category}
                            </span>
                            <span className="text-[10px] text-muted-foreground/40">•</span>
                            <span className="text-[10px] text-muted-foreground uppercase opacity-60 tracking-wider font-semibold">
                                {template.type}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1 pt-3 border-t border-border/50">
                        {template.isDefault ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-primary/5 border-primary/20 hover:bg-primary  text-primary h-8 text-xs gap-1.5 transition-all"
                                onClick={() => handleClone(template)}
                            >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                Clone Template
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-8 text-xs gap-1.5 border-border hover:border-primary/50"
                                    onClick={() => handleOpenBuilder(template)}
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    Edit
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                                    onClick={() => handleDelete(template.id)}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </>
                        )}
                        {template.platform === 'WHATSAPP_CLOUD' && (
                            <>
                                {(!template.status || template.status === 'DRAFT') ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-[10px] px-2 gap-1 border-primary/30 text-primary hover:bg-primary/5"
                                        onClick={() => handleSubmitToMeta(template.id)}
                                        disabled={isSubmittingId === template.id}
                                    >
                                        {isSubmittingId === template.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                        Submit for Review
                                    </Button>
                                ) : (template.status === 'PENDING_APPROVAL' || template.status === 'PENDING' || template.status === 'IN_APPEAL') ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-[10px] px-2 gap-1 border-orange-500/30 text-orange-500 hover:bg-orange-500/5"
                                        onClick={() => handleCheckStatus(template.id)}
                                        disabled={isSubmittingId === template.id}
                                    >
                                        {isSubmittingId === template.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Loader2 className="w-3 h-3" />}
                                        Refresh
                                    </Button>
                                ) : null}
                            </>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-emerald-500 transition-colors shrink-0"
                            onClick={() => openTestModal(template)}
                        >
                            <Send className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    const TemplateListRow = ({ template: initialTemplate }) => {
        const template = { ...initialTemplate };
        if (typeof template.metadata === 'string' && template.metadata.trim().startsWith('{')) {
            try { template.metadata = JSON.parse(template.metadata); } catch (e) { }
        }
        if (typeof template.buttons === 'string' && template.buttons.trim().startsWith('[')) {
            try { template.buttons = JSON.parse(template.buttons); } catch (e) { }
        }

        return (
            <div className="group relative flex items-center gap-4 p-3 bg-card/50 hover:bg-card border border-border/50 hover:border-primary/30 rounded-xl transition-all duration-200">
                {/* Mini Preview Icon */}
                <div className="w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center shrink-0 border border-border/10 overflow-hidden">
                    {template.type === 'image' && template.metadata?.mediaUrl ? (
                        <img src={template.metadata.mediaUrl} className="w-full h-full object-cover" alt="mini" />
                    ) : template.type === 'video' ? <Video className="w-5 h-5 text-muted-foreground/40" />
                        : template.type === 'document' ? <File className="w-5 h-5 text-blue-500/40" />
                            : <MessageSquare className="w-5 h-5 text-primary/40" />}
                </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-foreground truncate">{template.name}</span>
                        {template.platform === 'WHATSAPP_CLOUD' && (
                            <Badge
                                className={`h-3.5 text-[8px] px-1.5 uppercase tracking-tighter border-0 font-bold ${
                                    template.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30' :
                                    (template.status === 'PENDING_APPROVAL' || template.status === 'PENDING' || template.status === 'IN_APPEAL') ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30' :
                                    template.status === 'REJECTED' ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' :
                                    'bg-muted text-muted-foreground'
                                }`}
                            >
                                {template.status === 'APPROVED' ? "Approved" : 
                                 (template.status === 'PENDING_APPROVAL' || template.status === 'PENDING' || template.status === 'IN_APPEAL') ? "In Review" :
                                 template.status === 'REJECTED' ? "Rejected" : "Draft"}
                            </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground/40 hidden sm:inline">• {template.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate opacity-70">
                        {template.body.substring(0, 100)}{template.body.length > 100 ? '...' : ''}
                    </p>
                </div>

                {/* Meta / Official Name */}
                <div className="hidden md:flex flex-col items-end shrink-0 px-4 border-l border-border/20">
                    <code className="text-[9px] font-mono text-muted-foreground/50 bg-muted/20 px-1 rounded whitespace-nowrap overflow-hidden">
                        {template.templateName || template.name.toLowerCase().replace(/\s+/g, '_')}
                    </code>
                    <span className="text-[10px] text-muted-foreground/40 uppercase mt-1 tracking-tight">
                        {template.category}
                    </span>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1 shrink-0 ml-auto">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={() => (template.isDefault ? handleClone(template) : handleOpenBuilder(template))}>
                                {template.isDefault ? <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> : <Edit2 className="w-3.5 h-3.5" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            {template.isDefault ? "Clone Template" : "Edit Template"}
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:text-emerald-500" onClick={() => openTestModal(template)}>
                                <Send className="w-3.5 h-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            Send Test Message
                        </TooltipContent>
                    </Tooltip>

                    {template.platform === 'WHATSAPP_CLOUD' && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                {(!template.status || template.status === 'DRAFT') ? (
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="w-8 h-8 rounded-full text-primary hover:bg-primary/10" 
                                        onClick={() => handleSubmitToMeta(template.id)}
                                        disabled={isSubmittingId === template.id}
                                    >
                                        {isSubmittingId === template.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                    </Button>
                                ) : (template.status === 'PENDING_APPROVAL' || template.status === 'PENDING' || template.status === 'IN_APPEAL') ? (
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="w-8 h-8 rounded-full text-orange-500 hover:bg-orange-500/10" 
                                        onClick={() => handleCheckStatus(template.id)}
                                        disabled={isSubmittingId === template.id}
                                    >
                                        <Loader2 className={`w-3.5 h-3.5 ${isSubmittingId === template.id ? 'animate-spin' : ''}`} />
                                    </Button>
                                ) : null}
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                {template.status === 'PENDING_APPROVAL' ? "Refresh Approval Status" : "Submit for Approval"}
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {!template.isDefault && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:text-destructive" onClick={() => handleDelete(template.id)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                Delete Template
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>
        );
    };


    // The GetTemplates function you had was a skeleton, 
    // I've replaced it with handleSyncCloud used in the header below.

    return (
        <TooltipProvider>
            <div className="flex flex-col h-full gap-2 p-2 animate-in fade-in duration-500">

                {/* Main Content Area */}
                <div className="flex-1 space-y-4 overflow-y-auto transition-all duration-300">

                    {/* Header */}
                    <div className="flex border border-border items-center justify-between bg-card p-2 rounded-md shadow-sm">
                        <div className="flex flex-row gap-2 items-center">
                            <DynamicIcon name='layout-template' className="w-8 h-8 text-primary" />
                            <div className='flex flex-col'>
                                <h2 className="text-xl font-bold text-foreground">Message Templates</h2>
                                <p className="text-xs text-muted-foreground">Create and manage reusable WhatsApp messages.</p>
                            </div>
                        </div>
                        <div className='flex flex-row gap-2'>
                            <Button 
                                onClick={handleSyncCloud} 
                                variant="outline"
                                className="border-primary/20 text-primary hover:bg-primary/5 shadow-sm gap-2"
                                disabled={isSyncing}
                            >
                                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                                Sync from Cloud
                            </Button>
                            <Button onClick={() => handleOpenBuilder()} className="bg-primary hover:bg-primary/90 shadow-sm gap-2">
                                <Plus className="w-4 h-4 " />
                                Create Template
                            </Button>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="bg-card p-2 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center border border-border/50 bg-gradient-to-r from-card to-muted/20">
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search templates..."
                                    className="pl-9 bg-background/50 border-border h-10 ring-offset-background focus-visible:ring-1 focus-visible:ring-primary/20"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>

                            <div className="flex gap-1 bg-muted/40 p-1 rounded-lg border border-border h-10">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={` h-full px-3 transition-all ${filterType === 'my_templates' ? 'bg-background shadow-sm text-primary font-bold' : 'text-muted-foreground'}`}
                                    onClick={() => setFilterType('my_templates')}
                                >
                                    My Templates
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={` h-full px-3 transition-all ${filterType === 'browser' ? 'bg-background shadow-sm text-primary font-bold' : 'text-muted-foreground'}`}
                                    onClick={() => setFilterType('browser')}
                                >
                                    Browser
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-full px-3 transition-all ${filterType === 'cloud_api' ? 'bg-background shadow-sm text-primary font-bold' : 'text-muted-foreground'}`}
                                    onClick={() => setFilterType('cloud_api')}
                                >
                                    Cloud API
                                </Button>
                            </div>

                            <div className="flex gap-1 bg-muted/30 p-1 rounded-lg border border-border/50 h-10 ml-auto">
                                <Button
                                    variant={viewMode === 'grid' ? "secondary" : "ghost"}
                                    size="icon"
                                    className="w-8 h-8"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? "secondary" : "ghost"}
                                    size="icon"
                                    className="w-8 h-8"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-bold tracking-widest bg-background/50 px-3 py-1.5 rounded-full border border-border/30">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Live Previews Active
                        </div>
                    </div>

                    {/* Templates Grid / List */}
                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center h-64 grayscale opacity-50">
                            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                            <p className="text-sm font-medium">Fetching high-fidelity previews...</p>
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 border-2 border-dashed border-border rounded-xl bg-card/10">
                            <MessageSquare className="w-16 h-16 text-muted-foreground/20 mb-6 drop-shadow-sm" />
                            <h3 className="text-xl font-bold text-foreground">No templates found</h3>
                            <p className="text-muted-foreground text-center max-w-xs mt-2">Adjust your filters or create your first custom template to get started.</p>
                            <Button onClick={() => handleOpenBuilder()} className="mt-8 gap-2 shadow-lg shadow-primary/20">
                                <Plus className="w-4 h-4" /> Create Custom Template
                            </Button>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                                    {filteredTemplates.map((template) => (
                                        <TemplatePreviewCard key={template.id} template={template} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3 pb-12">
                                    {filteredTemplates.map((template) => (
                                        <TemplateListRow key={template.id} template={template} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Footer Counts Bar */}
                    <div className="mt-8 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground font-bold bg-muted/20 px-4 py-3 rounded-xl border border-border/50 shadow-inner">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2.5 group">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                <span>Total <span className="text-foreground ml-1">{templates.length}</span></span>
                            </div>
                            <div className="flex items-center gap-2.5 group">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500/40 group-hover:bg-blue-500 transition-colors" />
                                <span>My Templates <span className="text-foreground ml-1">{templates.filter(t => !t.isDefault).length}</span></span>
                            </div>
                            <div className="flex items-center gap-2.5 group">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/40 group-hover:bg-emerald-500 transition-colors" />
                                <span>Cloud API <span className="text-foreground ml-1">{templates.filter(t => t.platform === 'WHATSAPP_CLOUD').length}</span></span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground/40 italic normal-case tracking-normal font-medium">
                            <Smartphone className="w-3 h-3" />
                            Meta API v17.0 Ready
                        </div>
                    </div>
                </div>

                {/* Right Side Builder Panel (Now Sheet Modal) */}
                <Sheet open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
                    <SheetContent className="w-[620px] sm:max-w-[620px] p-0 flex flex-col gap-0 border-l border-border bg-card shadow-2xl">
                        <div className='flex flex-col h-full'>
                            {/* Panel Header */}
                            <SheetHeader className="px-6 py-4 border-b border-border bg-muted/30 text-left">
                                <SheetTitle className="text-lg font-semibold text-foreground">
                                    {editingId ? 'Edit Template' : 'Create Template'}
                                </SheetTitle>
                                <SheetDescription className="text-xs text-muted-foreground">
                                    Configure your WhatsApp message template content and interactive elements.
                                </SheetDescription>
                            </SheetHeader>

                            <ScrollArea className='h-[85%]'>
                                {/* Main Form Area */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-border">

                                    {/* Basic Info */}
                                    <div className="space-y-4">
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-foreground mb-1.5 block">Display Name</label>
                                                <Input
                                                    placeholder="e.g. Welcome Message"
                                                    value={formData.name || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        const updates = { name: value };
                                                        // Automatically update templateName for new templates
                                                        if (!editingId) {
                                                            updates.templateName = value.toLowerCase().replace(/[^a-z0-9_]/g, '_');
                                                        }
                                                        setFormData({ ...formData, ...updates });
                                                    }}
                                                    className="bg-background border-border" />
                                            </div>

                                            <div>
                                                <label className="text-sm font-semibold text-foreground mb-1.5 block">API Name (Meta)</label>
                                                <Input
                                                    placeholder="welcome_message"
                                                    value={formData.templateName || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_');
                                                        setFormData({ ...formData, templateName: value });
                                                    }}
                                                    className="bg-background border-border font-mono text-xs" />
                                                <p className="text-[10px] text-muted-foreground mt-1 italic">Used for Cloud API identification.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-semibold text-foreground mb-1.5 block">Category</label>
                                                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                                    <SelectTrigger className="bg-background border-border">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="UTILITY">Utility</SelectItem>
                                                        <SelectItem value="MARKETING">Marketing</SelectItem>
                                                        <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-foreground mb-1.5 block">Language</label>
                                                <Select value={formData.language} onValueChange={(v) => setFormData({ ...formData, language: v })}>
                                                    <SelectTrigger className="bg-background border-border">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="en_US">English (US)</SelectItem>
                                                        <SelectItem value="en_GB">English (UK)</SelectItem>
                                                        <SelectItem value="es">Spanish</SelectItem>
                                                        <SelectItem value="fr">French</SelectItem>
                                                        <SelectItem value="hi">Hindi</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-semibold text-foreground mb-1.5 block">Message Type</label>
                                            <Select
                                                value={formData.type}
                                                onValueChange={(v) => {
                                                    let newMetadata = { ...formData.metadata };
                                                    if (v === 'interactive-group' && (!newMetadata.listSections || newMetadata.listSections.length === 0)) {
                                                        newMetadata.listSections = [{ title: 'Options', rows: [{ title: '', description: '' }] }];
                                                        newMetadata.listButton = 'Select Option';
                                                    }
                                                    setFormData({ ...formData, type: v, metadata: newMetadata });
                                                }}>

                                                <SelectTrigger className="bg-background border-border">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="text">Standard Text</SelectItem>
                                                    <SelectItem value="image">Image</SelectItem>
                                                    <SelectItem value="video">Video</SelectItem>
                                                    <SelectItem value="audio">Audio</SelectItem>
                                                    <SelectItem value="document">Document / PDF</SelectItem>
                                                    <SelectItem value="location">Location</SelectItem>
                                                    <SelectItem value="contact">Contact (vCard)</SelectItem>
                                                    <SelectItem value="interactive-button">Interactive (Buttons)</SelectItem>
                                                    <SelectItem value="interactive-group">Interactive (Group)</SelectItem>
                                                    <SelectItem value="carousel">Template / Carousel (Advanced)</SelectItem>
                                                    <SelectItem value="view_once">Disappearing / View Once</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>


                                    </div>

                                    <hr className="border-border" />

                                    {/* Conditional Media / Location Inputs */}
                                    {['image', 'video', 'audio', 'document'].includes(formData.type) &&
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-semibold text-foreground">
                                                    {formData.type.charAt(0).toUpperCase() + formData.type.slice(1).toLowerCase()} URL
                                                </label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 text-[10px] text-primary hover:bg-primary/5 uppercase font-bold"
                                                    onClick={() => onOpen('mediaLibrary', {
                                                        workspaceId,
                                                        onSelect: (url) => setFormData({
                                                            ...formData,
                                                            metadata: { ...formData.metadata, mediaUrl: url }
                                                        })
                                                    })}
                                                >
                                                    <Sparkles className="w-3 h-3 mr-1.5" /> Choose from Media Hub
                                                </Button>
                                            </div>
                                            <Input
                                                placeholder={`https://example.com/my-${formData.type.toLowerCase()}.ext`}
                                                value={formData.metadata?.mediaUrl || ''}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    metadata: { ...formData.metadata, mediaUrl: e.target.value }
                                                })}
                                                className="bg-background border-border" />

                                            <p className="text-[11px] text-muted-foreground">Ensure the link is publicly accessible.</p>
                                        </div>
                                    }

                                    {formData.type === 'location' &&
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-semibold text-foreground mb-1 block">Latitude</label>
                                                    <Input
                                                        placeholder="e.g. 18.5204"
                                                        value={formData.metadata?.latitude || ''}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            metadata: { ...formData.metadata, latitude: e.target.value }
                                                        })} />

                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-foreground mb-1 block">Longitude</label>
                                                    <Input
                                                        placeholder="e.g. 73.8567"
                                                        value={formData.metadata?.longitude || ''}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            metadata: { ...formData.metadata, longitude: e.target.value }
                                                        })} />

                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-foreground mb-1 block">Location Name</label>
                                                <Input
                                                    placeholder="e.g. Central Park"
                                                    value={formData.metadata?.locationName || ''}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        metadata: { ...formData.metadata, locationName: e.target.value }
                                                    })} />

                                            </div>
                                        </div>
                                    }

                                    {/* Message Content */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-semibold text-foreground mb-1.5 flex justify-between">
                                                Message Body
                                                <span className="text-xs text-muted-foreground font-normal">Use {"{{1}}"} for variables</span>
                                            </label>
                                            <Textarea
                                                placeholder="Hello {{1}}, your order {{2}} is ready..."
                                                className="min-h-[120px] resize-none bg-background border-border"
                                                value={formData.body || ''}
                                                onChange={(e) => setFormData({ ...formData, body: e.target.value })} />

                                        </div>

                                        <div>
                                            <label className="text-sm font-semibold text-foreground mb-1.5 block">Footer (Optional)</label>
                                            <Input
                                                placeholder="e.g. Reply STOP to unsubscribe"
                                                className="text-sm bg-background border-border"
                                                value={formData.footer || ''}
                                                onChange={(e) => setFormData({ ...formData, footer: e.target.value })} />

                                        </div>

                                        {/* List Configuration (Interactive Group) */}
                                        {formData.type === 'interactive-group' &&
                                            <div className="bg-muted/30 p-4 rounded-md border border-border space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-foreground">List Button Label</label>
                                                    <Input
                                                        placeholder="e.g. View Menu"
                                                        value={formData.metadata?.listButton || ''}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            metadata: { ...formData.metadata, listButton: e.target.value }
                                                        })}
                                                        maxLength={20} />

                                                </div>                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-semibold text-foreground">Options Groups</label>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 text-xs gap-1.5 px-2 border"
                                                            onClick={() => {
                                                                const newSections = [...(formData.metadata?.listSections || [])];
                                                                if (newSections.length < 3) {
                                                                    newSections.push({ title: `Group ${newSections.length + 1}`, rows: [{ title: '', description: '' }] });
                                                                    setFormData({ ...formData, metadata: { ...formData.metadata, listSections: newSections } });
                                                                }
                                                            }}
                                                            disabled={(formData.metadata?.listSections || []).length >= 3}>

                                                            <Plus className="w-3 h-3" />
                                                            Add Group
                                                        </Button>
                                                    </div>

                                                    {(formData.metadata?.listSections || []).map((section, sIdx) =>
                                                        <div key={sIdx} className="bg-background/50 p-3 rounded-md border border-border space-y-3 relative group/section">
                                                            <div className="flex items-center gap-2">
                                                                <Input
                                                                    placeholder="Section Title (e.g. Beverages)"
                                                                    className="h-8 font-medium bg-muted/20"
                                                                    value={section.title}
                                                                    onChange={(e) => {
                                                                        const newSections = [...formData.metadata.listSections];
                                                                        newSections[sIdx].title = e.target.value;
                                                                        setFormData({ ...formData, metadata: { ...formData.metadata, listSections: newSections } });
                                                                    }}
                                                                    maxLength={24} />

                                                                {formData.metadata.listSections.length > 1 &&
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                                        onClick={() => {
                                                                            const newSections = formData.metadata.listSections.filter((_, i) => i !== sIdx);
                                                                            setFormData({ ...formData, metadata: { ...formData.metadata, listSections: newSections } });
                                                                        }}>

                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                }
                                                            </div>

                                                            <div className="space-y-2 pl-2 border-l-2 border-primary/20">
                                                                {(section.rows || []).map((row, rIdx) =>
                                                                    <div key={rIdx} className="space-y-2 p-3 bg-background border border-border rounded-md relative group/row">
                                                                        <Input
                                                                            placeholder={`Option Title (e.g. Option ${rIdx + 1})`}
                                                                            className="h-8 text-sm"
                                                                            value={row.title}
                                                                            onChange={(e) => {
                                                                                const newSections = [...formData.metadata.listSections];
                                                                                newSections[sIdx].rows[rIdx].title = e.target.value;
                                                                                setFormData({ ...formData, metadata: { ...formData.metadata, listSections: newSections } });
                                                                            }}
                                                                            maxLength={24} />

                                                                        <Input
                                                                            placeholder="Description (optional)"
                                                                            className="h-7 text-xs"
                                                                            value={row.description}
                                                                            onChange={(e) => {
                                                                                const newSections = [...formData.metadata.listSections];
                                                                                newSections[sIdx].rows[rIdx].description = e.target.value;
                                                                                setFormData({ ...formData, metadata: { ...formData.metadata, listSections: newSections } });
                                                                            }}
                                                                            maxLength={72} />

                                                                        {(section.rows.length > 1 || formData.metadata.listSections.length > 1) &&
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover/row:opacity-100 transition-opacity"
                                                                                onClick={() => {
                                                                                    const newSections = [...formData.metadata.listSections];
                                                                                    newSections[sIdx].rows = newSections[sIdx].rows.filter((_, i) => i !== rIdx);
                                                                                    setFormData({ ...formData, metadata: { ...formData.metadata, listSections: newSections } });
                                                                                }}>

                                                                                <X className="h-3 w-3" />
                                                                            </Button>
                                                                        }
                                                                    </div>
                                                                )}

                                                                {section.rows.length < 10 &&
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="w-full text-xs h-7 dashed"
                                                                        onClick={() => {
                                                                            const newSections = [...formData.metadata.listSections];
                                                                            newSections[sIdx].rows.push({ title: '', description: '' });
                                                                            setFormData({ ...formData, metadata: { ...formData.metadata, listSections: newSections } });
                                                                        }}>

                                                                        <Plus className="w-3 h-3" />
                                                                        Add Option
                                                                    </Button>
                                                                }
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        }                                    {/* Interactive Buttons Config */}
                                        {formData.type === 'interactive-button' &&
                                            <div className="bg-muted/30 p-4 rounded-md border border-border space-y-3">
                                                <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                                                    Quick Reply Buttons
                                                    {formData.buttons.length < 3 &&
                                                        <Button variant="ghost" size="sm" onClick={addButton} className="px-2 text-xs text-primary bg-primary/10 hover:bg-primary/20">
                                                            <Plus className="w-3 h-3 mr-1" /> Add Button
                                                        </Button>
                                                    }
                                                </label>
                                                {formData.buttons.map((btn, idx) =>
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <Input
                                                            placeholder={`Button ${idx + 1} text`}
                                                            value={btn || ''}
                                                            onChange={(e) => handleButtonChange(idx, e.target.value)}
                                                            className="bg-background border-border"
                                                            maxLength={20} />
                                                        {formData.buttons.length > 1 &&
                                                            <Button variant="ghost" size="icon" onClick={() => removeButton(idx)} className="text-muted-foreground hover:text-destructive shrink-0">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        }

                                        {/* Carousel Config */}
                                        {formData.type === 'carousel' &&
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                        Carousel Cards
                                                        <span className="text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase">
                                                            {formData.metadata?.carouselCards?.length || 0} / 10
                                                        </span>
                                                    </label>
                                                    {(formData.metadata?.carouselCards?.length || 0) < 10 &&
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 text-xs border-dashed"
                                                            onClick={() => {
                                                                const newCards = [...(formData.metadata.carouselCards || [])];
                                                                newCards.push({ title: '', description: '', imageUrl: '', buttonText: 'View Details' });
                                                                setFormData({ ...formData, metadata: { ...formData.metadata, carouselCards: newCards } });
                                                            }}
                                                        >
                                                            <Plus className="w-3 h-3 mr-1" /> Add Card
                                                        </Button>
                                                    }
                                                </div>

                                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {formData.metadata?.carouselCards?.map((card, cIdx) => (
                                                        <div key={cIdx} className="p-3 bg-muted/30 rounded-md border border-border relative group/card">
                                                            <div className="grid gap-3">
                                                                <div className="space-y-1.5">
                                                                    <div className="flex items-center justify-between">
                                                                        <label className="text-[11px] font-bold uppercase text-muted-foreground">Card {cIdx + 1} Image</label>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-5 text-[9px] text-primary hover:bg-primary/5 uppercase font-bold"
                                                                            onClick={() => onOpen('mediaLibrary', {
                                                                                workspaceId,
                                                                                onSelect: (url) => {
                                                                                    const newCards = [...formData.metadata.carouselCards];
                                                                                    newCards[cIdx].imageUrl = url;
                                                                                    setFormData({ ...formData, metadata: { ...formData.metadata, carouselCards: newCards } });
                                                                                }
                                                                            })}
                                                                        >
                                                                            <Sparkles className="w-2.5 h-2.5 mr-1" /> Choose Image
                                                                        </Button>
                                                                    </div>
                                                                    <Input
                                                                        placeholder="Image URL"
                                                                        value={card.imageUrl}
                                                                        onChange={(e) => {
                                                                            const newCards = [...formData.metadata.carouselCards];
                                                                            newCards[cIdx].imageUrl = e.target.value;
                                                                            setFormData({ ...formData, metadata: { ...formData.metadata, carouselCards: newCards } });
                                                                        }}
                                                                        className="h-8 text-xs"
                                                                    />
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div className="space-y-1.5">
                                                                        <label className="text-[11px] font-bold uppercase text-muted-foreground">Title</label>
                                                                        <Input
                                                                            placeholder="Card Title"
                                                                            value={card.title}
                                                                            onChange={(e) => {
                                                                                const newCards = [...formData.metadata.carouselCards];
                                                                                newCards[cIdx].title = e.target.value;
                                                                                setFormData({ ...formData, metadata: { ...formData.metadata, carouselCards: newCards } });
                                                                            }}
                                                                            className="h-8 text-xs"
                                                                            maxLength={24}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <label className="text-[11px] font-bold uppercase text-muted-foreground">Button Text</label>
                                                                        <Input
                                                                            placeholder="Button Text"
                                                                            value={card.buttonText}
                                                                            onChange={(e) => {
                                                                                const newCards = [...formData.metadata.carouselCards];
                                                                                newCards[cIdx].buttonText = e.target.value;
                                                                                setFormData({ ...formData, metadata: { ...formData.metadata, carouselCards: newCards } });
                                                                            }}
                                                                            className="h-8 text-xs"
                                                                            maxLength={20}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-1.5">
                                                                    <label className="text-[11px] font-bold uppercase text-muted-foreground">Description</label>
                                                                    <Textarea
                                                                        placeholder="Short description..."
                                                                        value={card.description}
                                                                        onChange={(e) => {
                                                                            const newCards = [...formData.metadata.carouselCards];
                                                                            newCards[cIdx].description = e.target.value;
                                                                            setFormData({ ...formData, metadata: { ...formData.metadata, carouselCards: newCards } });
                                                                        }}
                                                                        className="text-xs min-h-[60px]"
                                                                        maxLength={72}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {formData.metadata.carouselCards.length > 1 &&
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover/card:opacity-100 transition-opacity shadow-sm"
                                                                    onClick={() => {
                                                                        const newCards = formData.metadata.carouselCards.filter((_, i) => i !== cIdx);
                                                                        setFormData({ ...formData, metadata: { ...formData.metadata, carouselCards: newCards } });
                                                                    }}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            }
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        }
                                    </div>

                                    {/* Live Preview UI */}
                                    <div className="mt-8 pt-6 border-t border-border">
                                        <div className="bg-muted/30 p-4 border border-border rounded-md shadow-inner min-h-[250px] flex flex-col max-w-[320px] mx-auto relative overflow-hidden">
                                            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4 flex items-center gap-2">
                                                <Smartphone className="w-4 h-4" /> Preview
                                            </h3>

                                            {/* Preview Content Toggle */}
                                            {formData.type === 'carousel' ? (
                                                <div className="space-y-3">
                                                    {/* Header Body Footer */}
                                                    <div className="bg-background border border-border rounded-md rounded-tl-none p-3 shadow-sm text-[14.5px] self-start w-full max-w-[280px]">
                                                        <div className="body-text">{formData.body || <span className="text-muted-foreground italic">Body content...</span>}</div>
                                                        {formData.footer && <div className="text-[12px] text-muted-foreground mt-2">{formData.footer}</div>}
                                                    </div>

                                                    {/* Horizontal Cards */}
                                                    <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x snap-mandatory">
                                                        {(formData.metadata?.carouselCards || []).map((card, idx) => (
                                                            <div key={idx} className="min-w-[220px] bg-background border border-border rounded-lg overflow-hidden shadow-md snap-center flex flex-col">
                                                                <div className="aspect-video bg-muted/30 flex items-center justify-center relative">
                                                                    {card.imageUrl ? (
                                                                        <img src={card.imageUrl} className="w-full h-full object-cover" alt="card" />
                                                                    ) : (
                                                                        <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                                                                    )}
                                                                </div>
                                                                <div className="p-3 flex-1 flex flex-col">
                                                                    <h4 className="text-sm font-bold text-foreground truncate">{card.title || 'Untitled Card'}</h4>
                                                                    <p className="text-[12px] text-muted-foreground line-clamp-2 mt-1 flex-1">
                                                                        {card.description || 'No description...'}
                                                                    </p>
                                                                    <div className="mt-3 pt-3 border-t border-border text-center text-primary font-bold text-[13px]">
                                                                        {card.buttonText || 'View Details'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {(!formData.metadata?.carouselCards || formData.metadata.carouselCards.length === 0) && (
                                                            <div className="min-w-[220px] h-[200px] bg-muted/20 border-dashed border border-border rounded-lg flex items-center justify-center text-muted-foreground text-xs">
                                                                No cards added...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Standard Bubble Preview */
                                                <div className="relative z-10 bg-background border border-border rounded-md rounded-tl-none p-0 overflow-hidden shadow-sm max-w-[95%] text-[14.5px] text-foreground break-words whitespace-pre-wrap leading-relaxed mt-2 self-start w-full">
                                                    {/* Media Rendering */}
                                                    {formData.type === 'image' &&
                                                        <div className="aspect-video bg-muted/50 flex items-center justify-center border-b border-border">
                                                            {formData.metadata?.mediaUrl ?
                                                                <img src={formData.metadata.mediaUrl} className="w-full h-full object-cover" alt="preview" onError={(e) => { e.target.style.display = 'none'; }} /> :
                                                                <ImageIcon className="w-8 h-8 text-muted-foreground/40" />}
                                                        </div>
                                                    }
                                                    {formData.type === 'video' &&
                                                        <div className="aspect-video bg-black/80 flex items-center justify-center border-b border-border text-white">
                                                            <Video className="w-10 opacity-70" />
                                                        </div>
                                                    }
                                                    {formData.type === 'audio' &&
                                                        <div className="p-3 bg-muted/20 border-b border-border flex items-center gap-3">
                                                            <div className="w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                                                <Music className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1 h-3 bg-muted/50 rounded-full relative">
                                                                <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-primary/40 rounded-full"></div>
                                                            </div>
                                                        </div>
                                                    }
                                                    {formData.type === 'document' &&
                                                        <div className="p-3 bg-muted/20 border-b border-border flex items-center gap-3">
                                                            <div className="w-10 bg-blue-500/10 rounded-md flex items-center justify-center text-blue-500">
                                                                <File className="w-6 h-6" />
                                                            </div>
                                                            <div className="flex-1 overflow-hidden">
                                                                <div className="text-sm font-medium truncate">Document.pdf</div>
                                                                <div className="text-xs text-muted-foreground">1.2 MB • PDF</div>
                                                            </div>
                                                        </div>
                                                    }
                                                    {formData.type === 'location' &&
                                                        <div className="aspect-video bg-muted/10 border-b border-border relative flex flex-col items-center justify-center p-4 text-center">
                                                            <div className="w-10 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2">
                                                                <MapPin className="w-6 h-6" />
                                                            </div>
                                                            <div className="text-sm font-semibold">{formData.metadata?.locationName || 'Select Location'}</div>
                                                            <div className="text-[11px] text-muted-foreground">Click to view on maps</div>
                                                            <div className="absolute bottom-0 right-0 p-1 opacity-10">
                                                                <Smartphone className="w-16 h-16 rotate-12" />
                                                            </div>
                                                        </div>
                                                    }

                                                    <div className="p-3">
                                                        {formData.body || <span className="text-muted-foreground italic">Body content...</span>}
                                                        {formData.footer && <div className="text-[12px] text-muted-foreground mt-2">{formData.footer}</div>}
                                                        <div className="text-[10px] text-muted-foreground text-right mt-1 ml-4 flex justify-end items-center gap-1">
                                                            10:42 AM <Check className="w-3 h-3 text-primary" />
                                                        </div>
                                                    </div>

                                                    {/* Interactive Group Button */}
                                                    {formData.type === 'interactive-group' &&
                                                        <div className="mx-0 mb-0 border-t border-border bg-muted/10 p-3">
                                                            <div className="flex items-center justify-center gap-2 py-2 w-full bg-background border border-border rounded-md text-primary text-sm font-medium shadow-sm">
                                                                <MessageSquare className="w-4 h-4" />
                                                                {formData.metadata?.listButton || 'Select Option'}
                                                            </div>
                                                        </div>
                                                    }

                                                    {/* Interactive Quick Reply Buttons */}
                                                    {formData.type === 'interactive-button' && formData.buttons.filter((b) => b).length > 0 &&
                                                        <div className="mx-0 mb-0 flex flex-col border-t border-border bg-muted/10">
                                                            {formData.buttons.map((btn, idx) => btn ?
                                                                <div key={idx} className={`py-2.5 text-center text-primary font-medium text-[15px] ${idx > 0 ? 'border-t border-border' : ''}`}>
                                                                    {btn}
                                                                </div> :
                                                                null)}
                                                        </div>
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>

                            <SheetFooter className="p-2 border-t border-border bg-card flex flex-row items-center justify-end gap-3 shrink-0">
                                <Button variant="ghost" onClick={() => openTestModal(formData)} disabled={!formData.body} className="mr-auto text-primary">
                                    <Send className="w-4 h-4 mr-2" /> Test
                                </Button>
                                <Button variant="outline" onClick={() => setIsBuilderOpen(false)}>Cancel</Button>
                                {formData.platform === 'WHATSAPP_CLOUD' && (!formData.status || formData.status === 'DRAFT') && (
                                    <Button 
                                        variant="outline" 
                                        onClick={() => handleSave(true)} 
                                        disabled={!formData.name || !formData.body || isSaving || isSubmittingId === editingId} 
                                        className="border-primary/50 text-primary hover:bg-primary/5"
                                    >
                                        {(isSaving || isSubmittingId) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        <Sparkles className="w-3.5 h-3.5 mr-2" />
                                        Save & Submit for Review
                                    </Button>
                                )}
                                <Button onClick={() => handleSave(false)} disabled={!formData.name || !formData.body || isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                    {(isSaving && !isSubmittingId) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {editingId ? 'Save Changes' : 'Create Template'}
                                </Button>
                            </SheetFooter>
                        </div>

                    </SheetContent>
                </Sheet>

                {/* Test Message Dialog */}
                <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Send className="w-5 h-5 text-primary" /> Send Test Message
                            </DialogTitle>
                            <DialogDescription>
                                Send a preview of this template to selected contacts or custom numbers.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-2 space-y-4">

                            {/* Manual Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <Smartphone className="w-4 h-4" /> Manual Numbers
                                </label>
                                <Input
                                    placeholder="919876543210, 919000000000"
                                    value={testRecipient || ''}
                                    onChange={(e) => setTestRecipient(e.target.value)} />

                                {savedTestNumbers.length > 0 && (
                                    <div className="flex flex-wrap gap-2 border-t border-border/50 mt-3 pt-3">
                                        <p className="w-full text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-1">Quick Select Saved Numbers:</p>
                                        {savedTestNumbers.map((num) => (
                                            <Badge
                                                key={num}
                                                variant="outline"
                                                className={`cursor-pointer px-2 py-1 transition-all hover:bg-emerald-500/10 hover:border-emerald-500/30 ${testRecipient.includes(num) ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500 font-bold' : 'text-muted-foreground'}`}
                                                onClick={() => {
                                                    if (testRecipient.includes(num)) {
                                                        setTestRecipient(prev => prev.split(',').map(s => s.trim()).filter(s => s !== num).join(', '));
                                                    } else {
                                                        setTestRecipient(prev => prev ? `${prev}, ${num}` : num);
                                                    }
                                                }}
                                            >
                                                {num}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                <p className="text-[10px] text-muted-foreground italic">Comma separated for multiple numbers.</p>
                            </div>

                            {/* Contacts Selection */}
                            <div className="space-y-3 pt-2 border-t border-border">
                                <label className="text-xs font-semibold flex items-center justify-between gap-2">
                                    <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Select Contacts</span>
                                    {selectedContactIds.length > 0 &&
                                        <Badge variant="secondary" className="font-normal">
                                            {selectedContactIds.length} Selected
                                        </Badge>
                                    }
                                </label>

                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search contacts..."
                                        className="pl-9 h-9 text-sm"
                                        value={contactSearch}
                                        onChange={(e) => setContactSearch(e.target.value)} />

                                </div>

                                <ScrollArea className="h-[200px] border rounded-md p-1 bg-muted/10">
                                    {isFetchingContacts ?
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                        </div> :
                                        filteredContacts.length > 0 ?
                                            <div className="space-y-1">
                                                {filteredContacts.map((contact) =>
                                                    <div
                                                        key={contact.id}
                                                        className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
                                                        onClick={() => toggleContact(contact.id)}>

                                                        <Checkbox checked={selectedContactIds.includes(contact.id)} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium truncate">{contact.name}</p>
                                                            <p className="text-[11px] text-muted-foreground">{contact.phone}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div> :

                                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs py-10">
                                                <Users className="w-8 h-8 mb-2 opacity-20" />
                                                <p>No contacts found.</p>
                                            </div>
                                    }
                                </ScrollArea>
                            </div>

                        </div>

                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setIsTestModalOpen(false)}>Cancel</Button>
                            <Button
                                onClick={handleSendTest}
                                disabled={isTesting || selectedContactIds.length === 0 && !testRecipient}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground">

                                {isTesting ?
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sending...
                                    </> :

                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Send to {selectedContactIds.length + testRecipient.split(',').filter((n) => n.trim()).length} Recipients
                                    </>
                                }
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <MediaLibraryModal />
            </div>
        </TooltipProvider>
    );
}