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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useModal } from '@/hooks/useModal';
import { DynamicIcon } from 'lucide-react/dynamic';
import { DeleteConfirmDialog } from '@/app/workspace/_components/DeleteConfirmDialog';

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
import { MediaLibraryModal } from "../../article/_components/MediaLibraryModal";
import { getContacts as getContactsAction } from "../contacts/_actions/get-contacts";
import { sendMessage as sendMessageAction } from "../chats/_actions/send-message";
import { getWaMetadata } from "../settings/_actions/get-wa-metadata";
import AccountSwitcher from '../_components/AccountSwitcher';
import ShareTemplateDialog from './_components/ShareTemplateDialog';

export default function TemplatePage() {
    const params = useParams();
    const workspaceId = params.workspaceId;
    const { onOpen } = useModal();
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
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
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [selectedShareTemplate, setSelectedShareTemplate] = useState(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [deleteTargetTemplate, setDeleteTargetTemplate] = useState(null);
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

        const handleAccountSwitch = () => {
            fetchTemplates();
            fetchContacts();
            fetchMetadata();
        };

        window.addEventListener('wa-account-switched', handleAccountSwitch);
        return () => window.removeEventListener('wa-account-switched', handleAccountSwitch);
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
        onSuccess: (data, context) => {
            toast.success(editingId ? "Template updated!" : "Template created!");
            setIsBuilderOpen(false);
            executeGetTemplates({ workspaceId });
            setIsSaving(false);

            if (context?.shouldSubmit && data.template?.id) {
                toast.loading("Submitting template to Meta...", { id: "submit-toast" });
                setIsSubmittingId(data.template.id);
                executeSubmitTemplate({ workspaceId, templateId: data.template.id });
            }
        },
        onError: (error) => {
            toast.error(error);
            setIsSaving(false);
        }
    });

    const { execute: executeDeleteTemplate } = useAction(deleteTemplate, {
        onSuccess: (data) => {
            const msg = data.metaDeleted ? "Template deleted from Meta and local" : "Template deleted locally";
            toast.success(msg, { id: "delete-toast" });
            setIsDeletingId(null);
            fetchTemplates();
        },
        onError: (error) => {
            toast.error(error, { id: "delete-toast" });
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
            setAllContacts(Array.isArray(data) ? data : []);
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
            setFormData({ ...template, type: (template.type || 'text').toLowerCase() });
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
        if (!formData.name || ((formData.type || '').toLowerCase() !== 'carousel' && !formData.body)) {
            toast.error("Name and Body are required");
            return;
        }
        setIsSaving(true);

        executeSaveTemplate({
            workspaceId,
            id: editingId || undefined,
            ...formData,
            status: 'DRAFT',
            platform: formData.platform || 'WHATSAPP_CLOUD'
        }, { shouldSubmit });
    };

    const handleDelete = (id) => {
        const template = templates.find(t => t.id === id);
        setDeleteTargetId(id);
        setDeleteTargetTemplate(template || null);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteTargetId) return;
        setIsDeletingId(deleteTargetId);
        setIsDeleteConfirmOpen(false);
        toast.loading("Deleting template...", { id: "delete-toast" });
        executeDeleteTemplate({ workspaceId, id: deleteTargetId });
        setDeleteTargetId(null);
        setDeleteTargetTemplate(null);
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
            templateId: null,
            type: (template.type || 'text').toLowerCase()
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


    const handleShare = (template) => {
        setSelectedShareTemplate(template);
        setIsShareDialogOpen(true);
    };

    const handleShareUpdate = () => {
        fetchTemplates();
    };

    const handleSendTest = async () => {
        const manualNumbers = testRecipient.split(',').map(n => n.trim()).filter(n => n);
        const contactRecipients = allContacts.filter(c => selectedContactIds.includes(c.id));

        const recipientList = [];

        // Prioritize CRM contacts so they have their context attached
        contactRecipients.forEach(contact => {
            if (!recipientList.find(r => r.phone === contact.phone)) {
                recipientList.push({ phone: contact.phone, contact });
            }
        });

        // Add manual numbers, looking up CRM contact if possible
        manualNumbers.forEach(phone => {
            if (!recipientList.find(r => r.phone === phone)) {
                const existingContact = allContacts.find(c => c.phone === phone);
                recipientList.push({ phone, contact: existingContact || null });
            }
        });

        if (recipientList.length === 0) {
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

        // Add validation for media templates
        if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(testingTemplate.type?.toUpperCase())) {
            const finalMediaUrl = mediaUrl || testingTemplate.metadata?.mediaUrl;
            if (!finalMediaUrl || finalMediaUrl.trim() === '') {
                toast.error(`Please provide a Media URL for the ${testingTemplate.type} header.`);
                return;
            }
        }

        const buildComponents = (recipientContext) => {
            const interpolate = (val) => {
                if (!val) return '-';
                let interpolated = val;
                if (recipientContext?.contact) {
                    interpolated = val.replace(/\{\{contact\.([a-zA-Z0-9_]+)\}\}/g, (match, field) => {
                        return recipientContext.contact[field] || '-';
                    });
                } else {
                    interpolated = val.replace(/\{\{contact\.([a-zA-Z0-9_]+)\}\}/g, '-');
                }
                return interpolated.trim() === '' ? '-' : interpolated;
            };

            const components = [];

            if (testingTemplate.type?.toLowerCase() === 'carousel' && testingTemplate.metadata?.cards) {
                const carouselCards = [];
                const cardsData = testingTemplate.metadata.cards;
                const fallbackImageUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=800";

                cardsData.forEach((card, index) => {
                    const cardComps = [];

                    const cMediaUrl = card.mediaUrl || fallbackImageUrl;
                    const isHandle = /^\d+$/.test(cMediaUrl.toString()) || cMediaUrl.toString().startsWith('4');
                    cardComps.push({
                        type: 'header',
                        parameters: [
                            {
                                type: 'image',
                                image: isHandle ? { id: cMediaUrl } : { link: cMediaUrl }
                            }
                        ]
                    });

                    carouselCards.push({
                        card_index: index,
                        components: cardComps
                    });
                });

                // Duplicate the first card if only 1 exists, as Meta expects at least 2 cards for carousels
                if (carouselCards.length === 1) {
                    carouselCards.push({
                        card_index: 1,
                        components: JSON.parse(JSON.stringify(carouselCards[0].components))
                    });
                }

                components.push({
                    type: 'carousel',
                    cards: carouselCards
                });

                // Handle top-level body variables for carousel
                if (bodyVars.length > 0) {
                    components.push({
                        type: 'body',
                        parameters: bodyVars.map(v => ({ type: 'text', text: interpolate(variableMappings[v] || '') }))
                    });
                }

                return components;
            }

            // Handle Standard Templates
            // Handle Header (Text or Media)
            if (headerVars.length > 0) {
                components.push({
                    type: 'header',
                    parameters: headerVars.map(v => ({ type: 'text', text: interpolate(variableMappings[v] || '') }))
                });
            } else if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(testingTemplate.type?.toUpperCase())) {
                const finalMediaUrl = mediaUrl || testingTemplate.metadata?.mediaUrl;
                if (finalMediaUrl) {
                    const mediaType = testingTemplate.type.toLowerCase();
                    const isHandle = /^\d+$/.test(finalMediaUrl.toString()) || finalMediaUrl.toString().startsWith('4');

                    components.push({
                        type: 'header',
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
                    type: 'body',
                    parameters: bodyVars.map(v => ({ type: 'text', text: interpolate(variableMappings[v] || '') }))
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

        // Let's build a sample for logging using the first recipient
        console.log("[TEMPLATE_TEST_PAYLOAD_SAMPLE]", {
            template: testingTemplate.templateName || testingTemplate.name,
            language: testingTemplate.language || 'en_US',
            components: buildComponents(recipientList[0])
        });

        const sendPromises = recipientList.map(async (recipient) => {
            const components = buildComponents(recipient);
            const result = await sendMessageAction({
                workspaceId,
                to: recipient.phone,
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
            loading: `Sending test to ${recipientList.length} recipients...`,
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
        return t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.body.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <TooltipProvider>
            <div className="flex flex-col h-full gap-2 p-2 animate-in fade-in duration-500">
                <MediaLibraryModal />
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
                        <AccountSwitcher />
                        <Button onClick={handleSyncCloud} variant="outline" className="border-primary/20 text-primary  shadow-sm gap-2" disabled={isSyncing}>
                            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> Sync Meta
                        </Button>
                        <Button onClick={() => handleOpenBuilder()} className="bg-primary hover:bg-primary/90 shadow-sm gap-2">
                            <Plus className="w-4 h-4 " /> Create Template
                        </Button>

                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-card p-2 rounded-xl shadow-sm flex flex-row gap-4 justify-between items-center border border-border/50">
                    <div className="relative flex-1 max-w-xs md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search templates..." className="pl-9 bg-background/50 border-border h-10 ring-offset-background" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="flex gap-1 bg-muted/30 p-1 rounded-lg border border-border/50 h-10">
                        <Button variant={viewMode === 'grid' ? "secondary" : "ghost"} size="icon" className="w-8 h-8" onClick={() => setViewMode('grid')}><LayoutGrid className="w-4 h-4" /></Button>
                        <Button variant={viewMode === 'list' ? "secondary" : "ghost"} size="icon" className="w-8 h-8" onClick={() => setViewMode('list')}><List className="w-4 h-4" /></Button>
                    </div>
                </div>

                {/* Content Area */}
                <ScrollArea className="flex-1 h-full">
                    <div className="space-y-4 pr-4">
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
                                            onShare={handleShare}
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
                                            onShare={handleShare}
                                            isSubmittingId={isSubmittingId}
                                            isDeletingId={isDeletingId}
                                        />
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                </ScrollArea>

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

                <ShareTemplateDialog
                    isOpen={isShareDialogOpen}
                    onOpenChange={setIsShareDialogOpen}
                    template={selectedShareTemplate}
                    workspaceId={workspaceId}
                    currentUserId={userId}
                    onShareUpdate={handleShareUpdate}
                />

                <DeleteConfirmDialog
                    isOpen={isDeleteConfirmOpen}
                    onClose={() => {
                        setIsDeleteConfirmOpen(false);
                        setDeleteTargetTemplate(null);
                        setDeleteTargetId(null);
                    }}
                    onConfirm={confirmDelete}
                    title="Delete Template"
                    entityName={deleteTargetTemplate?.name || deleteTargetTemplate?.templateName}
                    description={
                        deleteTargetTemplate?.templateId ? (
                            <>
                                Are you sure you want to delete <span className="font-bold text-foreground">{deleteTargetTemplate?.name || deleteTargetTemplate?.templateName}</span>?
                                This will remove the template from your workspace and submit a deletion request to <strong>Meta Cloud API</strong>. This action cannot be undone.
                            </>
                        ) : (
                            <>
                                Are you sure you want to delete <span className="font-bold text-foreground">{deleteTargetTemplate?.name || deleteTargetTemplate?.templateName}</span>?
                                This action cannot be undone and will permanently remove this draft template.
                            </>
                        )
                    }
                    confirmText="Delete Template"
                    isDeleting={isDeletingId === deleteTargetId}
                />
            </div>
        </TooltipProvider>
    );
}