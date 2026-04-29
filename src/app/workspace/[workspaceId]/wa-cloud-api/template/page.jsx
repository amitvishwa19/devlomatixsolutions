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
import TemplatePreview from './_components/TemplatePreview';
import { useAction } from "@/hooks/use-action";
import { getTemplates } from "./_actions/get-templates";
import { saveTemplate } from "./_actions/save-template";
import { syncTemplates } from "./_actions/sync-templates-v2";
import { deleteTemplate } from "./_actions/delete-template";
import { submitTemplate } from "./_actions/submit-template";
import { checkTemplateStatus } from "./_actions/check-template-status";
import { getContacts as getContactsAction } from "../contacts/_actions/get-contacts";
import { sendMessage as sendMessageAction } from "../chats/_actions/send-message";
import { getWaMetadata } from "../settings/_actions/get-wa-metadata";

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
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState(null);
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
    const [testingTemplate, setTestingTemplate] = useState(null);
    const [allContacts, setAllContacts] = useState([]);
    const [selectedContactIds, setSelectedContactIds] = useState([]);
    const [contactSearch, setContactSearch] = useState('');
    const [isFetchingContacts, setIsFetchingContacts] = useState(false);
    const [variableMappings, setVariableMappings] = useState({});
    const [detectedVariables, setDetectedVariables] = useState([]);
    const [mediaUrl, setMediaUrl] = useState('');
    const [metadata, setMetadata] = useState({});
    const { data: session } = useSession();
    const userId = session?.user?.userId || session?.user?.id;

    // Server Action Hooks
    const { execute: executeGetTemplates } = useAction(getTemplates, {
        onSuccess: (data) => {
            const parsedTemplates = (data.templates || []).map(t => {
                let newT = { ...t };
                if (typeof t.metadata === 'string' && t.metadata.trim().startsWith('{')) {
                    try { newT.metadata = JSON.parse(t.metadata); } catch (e) { }
                }
                if (typeof t.buttons === 'string' && t.buttons.trim().startsWith('[')) {
                    try { newT.buttons = JSON.parse(t.buttons); } catch (e) { }
                }
                return newT;
            });
            console.log(`[Template Page] Received ${parsedTemplates.length} templates:`, parsedTemplates.map(t => ({ name: t.name, isDefault: t.isDefault, platform: t.platform })));
            setTemplates(parsedTemplates);
            setIsLoading(false);
        },
        onError: (error) => {
            console.error("Error fetching templates:", error);
            toast.error("Failed to load templates.");
            setIsLoading(false);
        }
    });

    const fetchTemplates = () => {
        setIsLoading(true);
        if (workspaceId) {
            executeGetTemplates({ workspaceId });
        }
    };

    const { execute: executeGetMetadata } = useAction(getWaMetadata, {
        onSuccess: (data) => {
            setMetadata(data.metadata || {});
        }
    });

    const fetchMetadata = () => {
        if (workspaceId) {
            executeGetMetadata({ workspaceId });
        }
    };

    useEffect(() => {
        if (workspaceId) {
            fetchTemplates();
            fetchContacts();
            fetchMetadata();
        }
    }, [workspaceId]);

    const { execute: executeSync } = useAction(syncTemplates, {
        onSuccess: (data) => {
            toast.success(data.message || "Template sync completed!", { id: "sync-toast" });
            fetchTemplates();
            setIsSyncing(false);
        },
        onError: (error) => {
            toast.error(error || "Failed to sync templates", { id: "sync-toast" });
            setIsSyncing(false);
        }
    });

    const handleSyncCloud = () => {
        setIsSyncing(true);
        toast.loading("Syncing all templates from Meta Cloud...", { id: "sync-toast" });
        executeSync({ workspaceId });
    };

    const { execute: executeSaveTemplate } = useAction(saveTemplate, {
        onSuccess: (data) => {
            toast.success(editingId ? "Template updated!" : "Template created!");
            setIsBuilderOpen(false);
            executeGetTemplates({ workspaceId });
            setIsSaving(false);
        },
        onError: (error) => {
            toast.error(error);
            setIsSaving(false);
        }
    });

    const { execute: executeDeleteTemplate } = useAction(deleteTemplate, {
        onSuccess: () => {
            toast.success("Template deleted");
            setIsDeletingId(null);
            fetchTemplates();
        },
        onError: (error) => {
            toast.error(error);
            setIsDeletingId(null);
        }
    });

    const { execute: executeSubmitTemplate } = useAction(submitTemplate, {
        onSuccess: () => {
            toast.success("Submitted for review!", { id: "submit-toast" });
            fetchTemplates();
            setIsSubmittingId(null);
        },
        onError: (error) => {
            toast.error(error, { id: "submit-toast" });
            setIsSubmittingId(null);
        }
    });

    const { execute: executeCheckStatus } = useAction(checkTemplateStatus, {
        onSuccess: (data) => {
            toast.success(`Status updated: ${data.status}`, { id: "status-toast" });
            fetchTemplates();
            setIsSubmittingId(null);
        },
        onError: (error) => {
            toast.error(error, { id: "status-toast" });
            setIsSubmittingId(null);
        }
    });

    const { execute: executeGetContacts } = useAction(getContactsAction, {
        onSuccess: (data) => {
            setAllContacts(Array.isArray(data.contacts) ? data.contacts : []);
            setIsFetchingContacts(false);
        },
        onError: () => setIsFetchingContacts(false)
    });

    const { execute: executeSendTest, isLoading: isSendingTest } = useAction(sendMessageAction, {
        onSuccess: () => {
             // We need to track successes for multiple recipients
        },
        onError: (err) => toast.error(err || "Failed to send test message")
    });

    const fetchContacts = () => {
        if (!workspaceId) return;
        setIsFetchingContacts(true);
        executeGetContacts({ workspaceId });
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
                platform: 'WHATSAPP_CLOUD',
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
        
        executeSaveTemplate({
            workspaceId,
            id: editingId,
            ...formData,
            status: 'DRAFT',
            platform: formData.platform || 'WHATSAPP_CLOUD'
        });
    };

    const handleDelete = (id) => {
        setIsDeletingId(id);
        executeDeleteTemplate({ workspaceId, id });
    };

    const handleClone = (template) => {
        setFormData({
            ...template,
            id: null,
            name: `${template.name} Copy`,
            templateName: `${template.templateName || template.name}_copy`.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
            isDefault: false,
            status: 'DRAFT',
            approved: false,
            templateId: null
        });
        setEditingId(null);
        setIsBuilderOpen(true);
    };

    const openTestModal = (template) => {
        setTestingTemplate(template);
        setTestRecipient("");
        setSelectedContactIds([]);
        setMediaUrl(template.metadata?.mediaUrl || '');
        
        // Detect variables from body and header
        const bodyVars = [...(template.body || "").matchAll(/{{(\d+)}}/g)].map(m => m[1]);
        const headerText = template.metadata?.headerText || "";
        const headerVars = [...headerText.matchAll(/{{(\d+)}}/g)].map(m => m[1]);
        
        // Detect variables in buttons
        let buttonVars = [];
        if (template.buttons && Array.isArray(template.buttons)) {
            template.buttons.forEach(btn => {
                const btnText = typeof btn === 'string' ? btn : (btn.text || "");
                const vars = [...btnText.matchAll(/{{(\d+)}}/g)].map(m => m[1]);
                buttonVars = [...buttonVars, ...vars];
            });
        }
        
        const uniqueVars = Array.from(new Set([...headerVars, ...bodyVars, ...buttonVars])).sort((a, b) => parseInt(a) - parseInt(b));
        setDetectedVariables(uniqueVars);
        
        const initialMapping = {};
        uniqueVars.forEach(v => initialMapping[v] = '');
        setVariableMappings(initialMapping);
        setIsTestModalOpen(true);
    };

    const openPreviewModal = (template) => {
        setSelectedPreviewTemplate(template);
        setIsPreviewModalOpen(true);
    };


    const handleSendTest = async () => {
        const manualNumbers = testRecipient.split(',').map(n => n.trim()).filter(n => n);
        const contactNumbers = allContacts.filter(c => selectedContactIds.includes(c.id)).map(c => c.phone);
        const recipients = Array.from(new Set([...manualNumbers, ...contactNumbers]));

        if (recipients.length === 0) {
            toast.error("No recipients selected");
            return;
        }

        const headerText = testingTemplate.metadata?.headerText || '';
        const headerVars = [...headerText.matchAll(/{{(\d+)}}/g)].map(m => m[1]);
        const bodyVars = [...(testingTemplate.body || "").matchAll(/{{(\d+)}}/g)].map(m => m[1]);
        const allRequiredVars = [...new Set([...headerVars, ...bodyVars])];

        for (const v of allRequiredVars) {
            const val = variableMappings[v];
            if (val === undefined || val === null || val.toString().trim() === "") {
                toast.error(`Please fill in a value for variable {{${v}}}`);
                return;
            }
        }

        const buildComponents = () => {
            const components = [];
            
            // Handle Header (Text or Media)
            if (headerVars.length > 0) {
                components.push({
                    type: 'HEADER',
                    parameters: headerVars.map(v => ({ type: 'TEXT', text: variableMappings[v] || '' }))
                });
            } else if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(testingTemplate.type?.toUpperCase())) {
                const finalMediaUrl = mediaUrl || testingTemplate.metadata?.mediaUrl;
                if (finalMediaUrl) {
                    const mediaType = testingTemplate.type.toLowerCase();
                    const isHandle = /^\d+$/.test(finalMediaUrl.toString()) || finalMediaUrl.toString().startsWith('4'); // Meta IDs/Handles are usually digits or start with 4
                    
                    components.push({
                        type: 'HEADER',
                        parameters: [
                            {
                                type: mediaType,
                                [mediaType]: isHandle 
                                    ? { id: finalMediaUrl } 
                                    : { link: finalMediaUrl }
                            }
                        ]
                    });
                }
            } else if (testingTemplate.metadata?.headerText && !headerVars.length) {
                 // Static text header - usually doesn't need component parameter if no variables
            }

            // Handle Body
            if (bodyVars.length > 0) {
                components.push({
                    type: 'BODY',
                    parameters: bodyVars.map(v => ({ type: 'TEXT', text: variableMappings[v] || '' }))
                });
            }

            // Handle Buttons (Specifically Flow buttons if they exist)
            if (testingTemplate.buttons && Array.isArray(testingTemplate.buttons)) {
                testingTemplate.buttons.forEach((btn, idx) => {
                    if (btn.type === 'FLOW') {
                        components.push({
                            type: 'button',
                            sub_type: 'flow',
                            index: idx.toString(),
                            parameters: [
                                {
                                    type: 'action',
                                    action: {
                                        flow_token: "test_token_" + Date.now()
                                    }
                                }
                            ]
                        });
                    }
                });
            }

            return components;
        };

        const components = buildComponents();
        
        console.log("[TEMPLATE_TEST_PAYLOAD]", {
            template: testingTemplate.templateName || testingTemplate.name,
            language: testingTemplate.language || 'en_US',
            components
        });

        const sendPromises = recipients.map(async (to) => {
            const result = await sendMessageAction({
                workspaceId,
                to,
                type: 'template',
                template: {
                    name: testingTemplate.templateName || testingTemplate.name,
                    language: { code: testingTemplate.language || 'en_US' },
                    components
                }
            });
            if (result.error) {
                throw new Error(result.error);
            }
            return result.data;
        });

        toast.promise(Promise.all(sendPromises), {
            loading: `Sending test to ${recipients.length} recipients...`,
            success: "Test messages dispatched!",
            error: (err) => `Error: ${err.message || "Failed to send"}`
        });
        
        setIsTestModalOpen(false);
    };

    const handleSubmitToMeta = (templateId) => {
        setIsSubmittingId(templateId);
        toast.loading("Submitting template to Meta for review...", { id: "submit-toast" });
        executeSubmitTemplate({ workspaceId, templateId });
    };

    const handleCheckStatus = (templateId) => {
        setIsSubmittingId(templateId);
        toast.loading("Fetching latest status from Meta...", { id: "status-toast" });
        executeCheckStatus({ workspaceId, templateId });
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
                                        onPreview={openPreviewModal}
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
                                        onPreview={openPreviewModal}
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
                    isTesting={isSendingTest}
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
                    testNumbers={metadata.testNumbers || []}
                    mediaUrl={mediaUrl}
                    setMediaUrl={setMediaUrl}
                />

                <TemplatePreview 
                    isModal={true}
                    isOpen={isPreviewModalOpen}
                    onClose={() => setIsPreviewModalOpen(false)}
                    template={selectedPreviewTemplate}
                />
            </div>
        </TooltipProvider>
    );
}