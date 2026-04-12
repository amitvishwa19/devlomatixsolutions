'use client';

import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Search, 
    Smartphone, 
    MessageSquare, 
    Loader2, 
    LayoutGrid, 
    List, 
    RefreshCw 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useModal } from '@/hooks/useModal';
import { DynamicIcon } from 'lucide-react/dynamic';

// Modular Components
import TemplateBuilder from './_components/TemplateBuilder';
import { TemplatePreviewCard, TemplateListRow } from './_components/TemplateItems';
import TestTemplateDialog from './_components/TestTemplateDialog';

export default function TemplatePage() {
    const params = useParams();
    const workspaceId = params.workspaceId;
    const { onOpen } = useModal();
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('my_templates');
    const [viewMode, setViewMode] = useState('list');

    // Builder & Dialog State
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSubmittingId, setIsSubmittingId] = useState(null);
    const [isDeletingId, setIsDeletingId] = useState(null);
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

    const [testRecipient, setTestRecipient] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [testingTemplate, setTestingTemplate] = useState(null);
    const [allContacts, setAllContacts] = useState([]);
    const [selectedContactIds, setSelectedContactIds] = useState([]);
    const [contactSearch, setContactSearch] = useState('');
    const [isFetchingContacts, setIsFetchingContacts] = useState(false);
    const [variableMappings, setVariableMappings] = useState({});
    const [detectedVariables, setDetectedVariables] = useState([]);
    const { data: session } = useSession();
    const userId = session?.user?.userId || session?.user?.id;

    // Fetch Templates directly from API
    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/wa/templates');
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            if (data.success) {
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
            }
        } catch (error) {
            console.error("Error fetching templates:", error);
            toast.error("Failed to load templates.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchTemplates();
            fetchContacts();
        }
    }, [userId, session]);

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
            toast.error(error.message || "Failed to sync templates from Meta.");
        } finally {
            setIsSyncing(false);
        }
    };

    // UI Handlers
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
                    listSections: [{ title: 'Options', rows: [{ title: '', description: '' }] }]
                }
            });
            setEditingId(null);
        }
        setIsBuilderOpen(true);
    };

    const handleSave = async (shouldSubmit = false) => {
        if (!formData.name || !formData.body) {
            toast.error("Name and Body are required");
            return;
        }
        setIsSaving(true);
        try {
            const res = await fetch('/api/wa/template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, id: editingId, platform: formData.platform || 'WHATSAPP_CLOUD' })
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || "Failed to save");

            toast.success(editingId ? "Template updated!" : "Template created!");
            
            if (shouldSubmit && data.template?.id) {
                await handleSubmitToMeta(data.template.id);
            }

            setIsBuilderOpen(false);
            fetchTemplates();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setIsDeletingId(id);
        try {
            const res = await fetch(`/api/wa/template?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Template deleted");
            setTemplates(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsDeletingId(null);
        }
    };

    const handleClone = (template) => {
        setFormData({
            ...template,
            id: null,
            name: `${template.name} Copy`,
            templateName: `${template.templateName || template.name}_copy`.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
            isDefault: false,
            status: 'DRAFT'
        });
        setEditingId(null);
        setIsBuilderOpen(true);
    };

    const openTestModal = (template) => {
        setTestingTemplate(template);
        const vars = [...(template.body || "").matchAll(/{{(\d+)}}/g)].map(m => m[1]);
        const uniqueVars = Array.from(new Set(vars)).sort((a, b) => parseInt(a) - parseInt(b));
        setDetectedVariables(uniqueVars);
        const initialMapping = {};
        uniqueVars.forEach(v => initialMapping[v] = '');
        setVariableMappings(initialMapping);
        setIsTestModalOpen(true);
    };

    const fetchContacts = async () => {
        if (!userId) return;
        setIsFetchingContacts(true);
        try {
            const res = await fetch(`/api/wa/contacts?workspaceId=${workspaceId}`);
            const data = await res.json();
            setAllContacts(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsFetchingContacts(false);
        }
    };

    const handleSendTest = async () => {
        const manualNumbers = testRecipient.split(',').map(n => n.trim()).filter(n => n);
        const contactNumbers = allContacts.filter(c => selectedContactIds.includes(c.id)).map(c => c.phone);
        const recipients = Array.from(new Set([...manualNumbers, ...contactNumbers]));

        if (recipients.length === 0) {
            toast.error("No recipients selected");
            return;
        }

        setIsTesting(true);
        try {
            // Prepare components if there are variables
            const components = [];
            if (detectedVariables.length > 0) {
                components.push({
                    type: 'body',
                    parameters: detectedVariables.map(v => ({
                        type: 'text',
                        text: variableMappings[v] || ''
                    }))
                });
            }

            for (const to of recipients) {
                await fetch('/api/wa/send-cloud-api', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        to, 
                        type: 'template',
                        template: {
                            name: testingTemplate.templateName || testingTemplate.name,
                            language: { code: testingTemplate.language || 'en_US' },
                            components
                        }
                    })
                });
            }
            toast.success(`Sent to ${recipients.length} recipients`);
            setIsTestModalOpen(false);
        } catch (error) {
            console.error("Test send error:", error);
            toast.error("Failed to send test");
        } finally {
            setIsTesting(false);
        }
    };

    const handleSubmitToMeta = async (templateId) => {
        setIsSubmittingId(templateId);
        try {
            const res = await fetch('/api/wa/template/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId })
            });
            if (res.ok) toast.success("Submitted for review!");
        } finally {
            setIsSubmittingId(null);
        }
    };

    const handleCheckStatus = async (templateId) => {
        setIsSubmittingId(templateId);
        try {
            const res = await fetch(`/api/wa/template/status?templateId=${templateId}`);
            const data = await res.json();
            if (data.success) {
                toast.success(`Status: ${data.status}`);
                fetchTemplates();
            }
        } finally {
            setIsSubmittingId(null);
        }
    };

    const filteredTemplates = templates.filter((t) => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.body.toLowerCase().includes(searchTerm.toLowerCase());
        if (filterType === 'my_templates') return matchesSearch && !t.isDefault;
        if (filterType === 'cloud_api') return matchesSearch && t.platform === 'WHATSAPP_CLOUD' && t.isDefault;
        return matchesSearch;
    });

    return (
        <TooltipProvider>
            <div className="flex flex-col h-full gap-2 p-2 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex border border-border items-center justify-between bg-card p-2 rounded-md shadow-sm">
                    <div className="flex flex-row gap-2 items-center">
                        <DynamicIcon name='layout-template' className="w-8 h-8 text-primary" />
                        <div className='flex flex-col'>
                            <h2 className="text-xl font-bold text-foreground">Message Templates</h2>
                            <p className="text-xs text-muted-foreground">Comprehensive WhatsApp template management.</p>
                        </div>
                    </div>
                    <div className='flex flex-row gap-2'>
                        <Button onClick={handleSyncCloud} variant="outline" className="border-primary/20 text-primary hover:bg-primary/5 shadow-sm gap-2" disabled={isSyncing}>
                            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> Sync Meta
                        </Button>
                        <Button onClick={() => handleOpenBuilder()} className="bg-primary hover:bg-primary/90 shadow-sm gap-2">
                            <Plus className="w-4 h-4 " /> Create Template
                        </Button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-card p-2 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center border border-border/50">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search templates..." className="pl-9 bg-background/50 border-border h-10 ring-offset-background" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="flex gap-1 bg-muted/40 p-1 rounded-lg border border-border h-10">
                            <Button variant="ghost" size="sm" className={`h-full px-3 ${filterType === 'my_templates' ? 'bg-background shadow-sm text-primary font-bold' : 'text-muted-foreground'}`} onClick={() => setFilterType('my_templates')}>My Templates</Button>
                            <Button variant="ghost" size="sm" className={`h-full px-3 ${filterType === 'cloud_api' ? 'bg-background shadow-sm text-primary font-bold' : 'text-muted-foreground'}`} onClick={() => setFilterType('cloud_api')}>All Templates</Button>
                        </div>
                        <div className="flex gap-1 bg-muted/30 p-1 rounded-lg border border-border/50 h-10 ml-auto">
                            <Button variant={viewMode === 'grid' ? "secondary" : "ghost"} size="icon" className="w-8 h-8" onClick={() => setViewMode('grid')}><LayoutGrid className="w-4 h-4" /></Button>
                            <Button variant={viewMode === 'list' ? "secondary" : "ghost"} size="icon" className="w-8 h-8" onClick={() => setViewMode('list')}><List className="w-4 h-4" /></Button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-4 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center h-64 opacity-50"><Loader2 className="w-10 h-10 animate-spin text-primary mb-4" /><p className="text-sm font-medium">Loading templates...</p></div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 border-2 border-dashed border-border rounded-xl bg-card/10"><MessageSquare className="w-16 h-16 text-muted-foreground/20 mb-6" /><h3 className="text-xl font-bold text-foreground">No templates found</h3><Button onClick={() => handleOpenBuilder()} className="mt-8 gap-2"><Plus className="w-4 h-4" /> Create Custom Template</Button></div>
                    ) : (
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12" : "flex flex-col gap-3 pb-12"}>
                            {filteredTemplates.map((template) => (
                                viewMode === 'grid' ? (
                                    <TemplatePreviewCard 
                                        key={template.id} 
                                        template={template} 
                                        onEdit={handleOpenBuilder} 
                                        onDelete={handleDelete} 
                                        onClone={handleClone} 
                                        onTest={openTestModal} 
                                        onSubmit={handleSubmitToMeta} 
                                        onCheckStatus={handleCheckStatus}
                                        isSubmittingId={isSubmittingId}
                                        isDeletingId={isDeletingId}
                                    />
                                ) : (
                                    <TemplateListRow 
                                        key={template.id} 
                                        template={template} 
                                        onEdit={handleOpenBuilder} 
                                        onDelete={handleDelete} 
                                        onClone={handleClone} 
                                        onTest={openTestModal} 
                                        onSubmit={handleSubmitToMeta} 
                                        onCheckStatus={handleCheckStatus}
                                        isSubmittingId={isSubmittingId}
                                        isDeletingId={isDeletingId}
                                    />
                                )
                            ))}
                        </div>
                    )}
                </div>

                {/* Modals & Builder */}
                <TemplateBuilder
                    isOpen={isBuilderOpen}
                    onClose={() => setIsBuilderOpen(false)}
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSave}
                    editingId={editingId}
                    isSaving={isSaving}
                    isSubmittingId={isSubmittingId}
                    workspaceId={workspaceId}
                />

                <TestTemplateDialog
                    isOpen={isTestModalOpen}
                    onClose={() => setIsTestModalOpen(false)}
                    template={testingTemplate}
                    onSend={handleSendTest}
                    isTesting={isTesting}
                    contacts={allContacts}
                    isFetchingContacts={isFetchingContacts}
                    testRecipient={testRecipient}
                    setTestRecipient={setTestRecipient}
                    selectedContactIds={selectedContactIds}
                    setSelectedContactIds={setSelectedContactIds}
                    contactSearch={contactSearch}
                    setContactSearch={setContactSearch}
                    detectedVariables={detectedVariables}
                    variableMappings={variableMappings}
                    setVariableMappings={setVariableMappings}
                />
            </div>
        </TooltipProvider>
    );
}