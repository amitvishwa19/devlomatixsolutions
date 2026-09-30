'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Layout as LayoutIcon,
    Plus,
    Trash2,
    Settings,
    Save,
    Type,
    ArrowRight,
    Calendar,
    List,
    CircleDot,
    CheckSquare,
    Clock,
    File as FileIcon,
    MapPin,
    Check,
    Database,
    Code,
    X,
    Search,
    Play,
    Copy,
    Download,
    Upload,
    ChevronUp,
    ChevronDown,
    Smartphone,
    Eye,
    Sliders,
    Layers,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    RefreshCw,
    Share2,
    FileCode,
    ArrowLeft,
    CheckCheck,
    HelpCircle,
    Info,
    ChevronRight,
    ShieldCheck,
    Lock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from 'sonner';

import {
    generateFlowDSL,
    parseFlowDSL,
    validateFlowScreens,
    sanitizeIdentifier,
    sanitizeScreenId,
    FLOW_VERSION
} from "../_lib/flow-utils";

// Component Palette Definitions
const COMPONENT_PALETTE = [
    {
        id: 'TextHeading',
        label: 'Heading',
        category: 'Typography',
        icon: Type,
        description: 'Large prominent title text (20px)',
        default: { text: 'Welcome to our Service' }
    },
    {
        id: 'TextSubheading',
        label: 'Subheading',
        category: 'Typography',
        icon: Type,
        description: 'Medium subtitle text (16px)',
        default: { text: 'Please fill out the form below' }
    },
    {
        id: 'TextBody',
        label: 'Body Text',
        category: 'Typography',
        icon: Type,
        description: 'Standard paragraph text content (14px)',
        default: { text: 'We need a few details to get started with your request.' }
    },
    {
        id: 'TextCaption',
        label: 'Caption',
        category: 'Typography',
        icon: Type,
        description: 'Small helper or disclaimer text (12px)',
        default: { text: 'Your information is protected under our privacy policy.' }
    },
    {
        id: 'TextInput',
        label: 'Text Input',
        category: 'Input Fields',
        icon: ArrowRight,
        description: 'Single-line text, email, phone or number',
        default: {
            label: 'Full Name',
            name: 'full_name',
            required: true,
            placeholder: 'e.g. Alex Johnson',
            helperText: '',
            inputType: 'text'
        }
    },
    {
        id: 'TextArea',
        label: 'Text Area',
        category: 'Input Fields',
        icon: FileIcon,
        description: 'Multi-line expanded text box',
        default: {
            label: 'Additional Notes',
            name: 'notes',
            required: false,
            placeholder: 'Type your message or special requirements...',
            helperText: ''
        }
    },
    {
        id: 'Select',
        label: 'Dropdown Select',
        category: 'Choices & Selection',
        icon: List,
        description: 'Single-select choice sheet',
        default: {
            label: 'Select Service',
            name: 'selected_service',
            required: true,
            options: [
                { label: 'Consultation', value: 'consultation', description: '30-min strategy session' },
                { label: 'Standard Support', value: 'support', description: 'Technical assistance' },
                { label: 'Custom Quote', value: 'quote', description: 'Tailored enterprise pricing' }
            ]
        }
    },
    {
        id: 'RadioButtons',
        label: 'Radio Buttons',
        category: 'Choices & Selection',
        icon: CircleDot,
        description: 'Single choice from visible radio list',
        default: {
            label: 'Preferred Contact Method',
            name: 'contact_pref',
            required: true,
            options: [
                { label: 'WhatsApp Chat', value: 'whatsapp' },
                { label: 'Phone Call', value: 'phone' },
                { label: 'Email', value: 'email' }
            ]
        }
    },
    {
        id: 'CheckboxGroup',
        label: 'Checkbox Group',
        category: 'Choices & Selection',
        icon: CheckSquare,
        description: 'Multi-select options list',
        default: {
            label: 'Interested Topics',
            name: 'topics',
            required: false,
            options: [
                { label: 'Product Updates', value: 'updates' },
                { label: 'Special Offers & Discounts', value: 'offers' },
                { label: 'Community Webinars', value: 'webinars' }
            ]
        }
    },
    {
        id: 'DatePicker',
        label: 'Date Picker',
        category: 'Pickers & Controls',
        icon: Calendar,
        description: 'Calendar date selection field',
        default: {
            label: 'Preferred Date',
            name: 'booking_date',
            required: true
        }
    },
    {
        id: 'ConsentCheckbox',
        label: 'Opt-in / Consent',
        category: 'Pickers & Controls',
        icon: Check,
        description: 'Mandatory agreement checkbox',
        default: {
            label: 'I agree to the Terms of Service & Privacy Policy',
            name: 'terms_agreed',
            required: true
        }
    }
];

const SCREEN_TEMPLATES = [
    {
        id: 'blank',
        label: 'Blank Screen',
        create: (idx) => ({
            id: `SCREEN_${idx}`,
            title: `Screen ${idx}`,
            children: [
                { id: `comp_head_${Date.now()}`, type: 'TextHeading', text: `Screen ${idx}` }
            ],
            footerAction: { type: 'navigate', label: 'Next' }
        })
    },
    {
        id: 'lead_capture',
        label: 'Lead Capture Form',
        create: (idx) => ({
            id: `LEAD_FORM_${idx}`,
            title: 'Contact Details',
            children: [
                { id: `comp_1_${Date.now()}`, type: 'TextHeading', text: 'Get Started' },
                { id: `comp_2_${Date.now()}`, type: 'TextBody', text: 'Please enter your information to proceed.' },
                { id: `comp_3_${Date.now()}`, type: 'TextInput', name: 'name', label: 'Full Name', required: true, placeholder: 'Alex Johnson' },
                { id: `comp_4_${Date.now()}`, type: 'TextInput', name: 'email', label: 'Email Address', inputType: 'email', required: true, placeholder: 'alex@example.com' },
                { id: `comp_5_${Date.now()}`, type: 'TextInput', name: 'phone', label: 'Phone Number', inputType: 'phone', required: false, placeholder: '+1 234 567 890' }
            ],
            footerAction: { type: 'navigate', label: 'Continue' }
        })
    },
    {
        id: 'feedback',
        label: 'Feedback & Rating',
        create: (idx) => ({
            id: `FEEDBACK_${idx}`,
            title: 'Your Feedback',
            children: [
                { id: `comp_1_${Date.now()}`, type: 'TextHeading', text: 'How was your experience?' },
                {
                    id: `comp_2_${Date.now()}`,
                    type: 'RadioButtons',
                    name: 'satisfaction',
                    label: 'Overall Satisfaction',
                    required: true,
                    options: [
                        { label: '⭐️⭐️⭐️⭐️⭐️ Excellent', value: '5' },
                        { label: '⭐️⭐️⭐️⭐️ Good', value: '4' },
                        { label: '⭐️⭐️⭐️ Average', value: '3' },
                        { label: '⭐️⭐️ Needs Improvement', value: '2' }
                    ]
                },
                { id: `comp_3_${Date.now()}`, type: 'TextArea', name: 'comments', label: 'What could we do better?', required: false, placeholder: 'Share your thoughts...' }
            ],
            footerAction: { type: 'complete', label: 'Submit Feedback' }
        })
    },
    {
        id: 'confirmation',
        label: 'Success / Confirmation',
        create: (idx) => ({
            id: `SUCCESS_${idx}`,
            title: 'Thank You!',
            terminal: true,
            children: [
                { id: `comp_1_${Date.now()}`, type: 'TextHeading', text: 'All Set!' },
                { id: `comp_2_${Date.now()}`, type: 'TextBody', text: 'Thank you for your response. Our team will contact you shortly.' },
                { id: `comp_3_${Date.now()}`, type: 'TextCaption', text: 'You can close this window now.' }
            ],
            footerAction: { type: 'complete', label: 'Finish' }
        })
    }
];

export default function FlowBuilder({ initialScreens = [], onSave, endpointUrl = '' }) {
    // 1. Initialize screens
    const [screens, setScreens] = useState(() => {
        if (initialScreens && initialScreens.length > 0) {
            return initialScreens;
        }
        return [
            {
                id: 'WELCOME',
                title: 'Welcome',
                terminal: false,
                children: [
                    { id: 'head_1', type: 'TextHeading', text: 'Welcome to Our Service' },
                    { id: 'body_1', type: 'TextBody', text: 'Please fill out a few details to get started.' },
                    { id: 'input_name', type: 'TextInput', name: 'full_name', label: 'Full Name', required: true, placeholder: 'Alex Johnson' }
                ],
                footerAction: { type: 'navigate', label: 'Next Screen', screen: 'DETAILS' }
            },
            {
                id: 'DETAILS',
                title: 'Service Options',
                terminal: true,
                children: [
                    { id: 'head_2', type: 'TextHeading', text: 'Select Your Service' },
                    {
                        id: 'select_service',
                        type: 'Select',
                        name: 'service_type',
                        label: 'Preferred Plan',
                        required: true,
                        options: [
                            { label: 'Standard Plan', value: 'standard', description: 'Essential features' },
                            { label: 'Pro Plan', value: 'pro', description: 'Advanced tools & support' },
                            { label: 'Enterprise', value: 'enterprise', description: 'Custom integrations' }
                        ]
                    },
                    { id: 'opt_terms', type: 'ConsentCheckbox', name: 'agreed_to_terms', label: 'I agree to the terms and privacy policy', required: true }
                ],
                footerAction: { type: 'complete', label: 'Submit Request' }
            }
        ];
    });

    const [activeScreenId, setActiveScreenId] = useState(screens[0]?.id || 'WELCOME');
    const [selectedComponentId, setSelectedComponentId] = useState(null);
    const [builderMode, setBuilderMode] = useState('design'); // 'design' | 'simulator' | 'code'
    const [activeSidebarTab, setActiveSidebarTab] = useState('palette'); // 'palette' | 'inspector' | 'routing'
    const [searchPalette, setSearchPalette] = useState('');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importJsonText, setImportJsonText] = useState('');
    const [validationReport, setValidationReport] = useState({ valid: true, errors: [], warnings: [] });

    // Simulator State
    const [simScreenId, setSimScreenId] = useState(screens[0]?.id || 'WELCOME');
    const [simFormData, setSimFormData] = useState({});
    const [simErrors, setSimErrors] = useState({});
    const [simSubmittedPayload, setSimSubmittedPayload] = useState(null);
    const [isSimSubmittedOpen, setIsSimSubmittedOpen] = useState(false);

    const activeScreen = screens.find(s => s.id === activeScreenId) || screens[0];
    const selectedComponent = activeScreen?.children?.find(c => c.id === selectedComponentId);

    // Re-validate screens whenever they change
    useEffect(() => {
        const report = validateFlowScreens(screens);
        setValidationReport(report);
    }, [screens]);

    // Reset simulator when switching to simulator mode
    useEffect(() => {
        if (builderMode === 'simulator') {
            setSimScreenId(screens[0]?.id || 'WELCOME');
            setSimFormData({});
            setSimErrors({});
            setSimSubmittedPayload(null);
        }
    }, [builderMode, screens]);

    // --- Screen Operations ---

    const handleSelectScreen = (id) => {
        setActiveScreenId(id);
        setSelectedComponentId(null);
    };

    const handleAddScreen = (templateType = 'blank') => {
        const idx = screens.length + 1;
        const template = SCREEN_TEMPLATES.find(t => t.id === templateType) || SCREEN_TEMPLATES[0];
        const newScreen = template.create(idx);
        
        // Ensure unique ID
        let candidateId = newScreen.id;
        let counter = idx;
        while (screens.some(s => s.id === candidateId)) {
            counter++;
            candidateId = `SCREEN_${counter}`;
        }
        newScreen.id = candidateId;

        setScreens([...screens, newScreen]);
        setActiveScreenId(newScreen.id);
        setSelectedComponentId(null);
        toast.success(`Added screen: ${newScreen.title}`);
    };

    const handleDuplicateScreen = (screenToDup) => {
        const newId = sanitizeScreenId(`${screenToDup.id}_COPY`, screens.length + 1);
        const duplicated = {
            ...JSON.parse(JSON.stringify(screenToDup)),
            id: newId,
            title: `${screenToDup.title} (Copy)`
        };
        setScreens([...screens, duplicated]);
        setActiveScreenId(newId);
        toast.success(`Duplicated screen as ${newId}`);
    };

    const handleRemoveScreen = (id) => {
        if (screens.length <= 1) {
            toast.error('Flow must contain at least one screen');
            return;
        }
        const filtered = screens.filter(s => s.id !== id);
        setScreens(filtered);
        if (activeScreenId === id) {
            setActiveScreenId(filtered[0]?.id);
            setSelectedComponentId(null);
        }
        toast.success('Screen removed');
    };

    const handleMoveScreen = (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= screens.length) return;
        const newScreens = [...screens];
        const temp = newScreens[index];
        newScreens[index] = newScreens[targetIndex];
        newScreens[targetIndex] = temp;
        setScreens(newScreens);
    };

    // --- Component Operations ---

    const handleAddComponent = (type) => {
        if (!activeScreenId) return;
        const compDef = COMPONENT_PALETTE.find(c => c.id === type);
        if (!compDef) return;

        const count = activeScreen?.children?.length || 0;
        const newCompId = `comp_${type.toLowerCase()}_${Date.now()}`;
        const newComponent = {
            id: newCompId,
            type,
            ...JSON.parse(JSON.stringify(compDef.default))
        };

        // Auto-assign smart system name if input
        if (newComponent.name && activeScreen.children.some(c => c.name === newComponent.name)) {
            newComponent.name = `${newComponent.name}_${count + 1}`;
        }

        setScreens(screens.map(s => {
            if (s.id === activeScreenId) {
                return { ...s, children: [...s.children, newComponent] };
            }
            return s;
        }));

        setSelectedComponentId(newCompId);
        setActiveSidebarTab('inspector');
        toast.success(`Added ${compDef.label}`);
    };

    const handleUpdateComponent = (compId, updates) => {
        setScreens(screens.map(s => {
            if (s.id === activeScreenId) {
                return {
                    ...s,
                    children: s.children.map(c => c.id === compId ? { ...c, ...updates } : c)
                };
            }
            return s;
        }));
    };

    const handleDeleteComponent = (compId) => {
        setScreens(screens.map(s => {
            if (s.id === activeScreenId) {
                return {
                    ...s,
                    children: s.children.filter(c => c.id !== compId)
                };
            }
            return s;
        }));
        if (selectedComponentId === compId) {
            setSelectedComponentId(null);
        }
    };

    const handleMoveComponent = (compId, direction) => {
        if (!activeScreen) return;
        const children = [...activeScreen.children];
        const idx = children.findIndex(c => c.id === compId);
        if (idx === -1) return;
        const targetIdx = idx + direction;
        if (targetIdx < 0 || targetIdx >= children.length) return;

        const temp = children[idx];
        children[idx] = children[targetIdx];
        children[targetIdx] = temp;

        setScreens(screens.map(s => s.id === activeScreenId ? { ...s, children } : s));
    };

    const handleDuplicateComponent = (comp) => {
        const duplicated = {
            ...JSON.parse(JSON.stringify(comp)),
            id: `comp_${comp.type.toLowerCase()}_${Date.now()}`,
            name: comp.name ? `${comp.name}_copy` : undefined
        };

        setScreens(screens.map(s => {
            if (s.id === activeScreenId) {
                return { ...s, children: [...s.children, duplicated] };
            }
            return s;
        }));
        setSelectedComponentId(duplicated.id);
        toast.success('Component duplicated');
    };

    // --- Screen Settings Updates ---

    const handleUpdateActiveScreen = (updates) => {
        setScreens(screens.map(s => {
            if (s.id === activeScreenId) {
                return { ...s, ...updates };
            }
            return s;
        }));
    };

    const handleUpdateFooterAction = (updates) => {
        setScreens(screens.map(s => {
            if (s.id === activeScreenId) {
                return {
                    ...s,
                    footerAction: { ...s.footerAction, ...updates }
                };
            }
            return s;
        }));
    };

    // --- JSON Serialization & Export ---

    const flowJsonString = useMemo(() => {
        try {
            const dsl = generateFlowDSL(screens, { endpointUrl });
            return JSON.stringify(dsl, null, 2);
        } catch (e) {
            return "// Error generating Flow JSON";
        }
    }, [screens, endpointUrl]);

    const handleSave = () => {
        if (!validationReport.valid) {
            toast.error(`Please resolve validation errors before saving: ${validationReport.errors[0]}`);
            return;
        }
        onSave(screens, flowJsonString);
    };

    const handleCopyJson = () => {
        navigator.clipboard.writeText(flowJsonString);
        toast.success("Flow JSON copied to clipboard");
    };

    const handleDownloadJson = () => {
        const blob = new Blob([flowJsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flow_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Downloaded flow.json");
    };

    const handleImportJson = () => {
        try {
            const parsed = JSON.parse(importJsonText);
            const importedScreens = parseFlowDSL(parsed);
            if (!importedScreens || importedScreens.length === 0) {
                toast.error("Invalid WhatsApp Flow JSON structure");
                return;
            }
            setScreens(importedScreens);
            setActiveScreenId(importedScreens[0]?.id);
            setSelectedComponentId(null);
            setIsImportModalOpen(false);
            setImportJsonText('');
            toast.success(`Successfully imported ${importedScreens.length} screens from JSON`);
        } catch (err) {
            toast.error(`JSON Parse Error: ${err.message}`);
        }
    };

    // --- Simulator Navigation & Submission ---

    const handleSimulatorAction = (currentScreen) => {
        const newErrors = {};
        (currentScreen.children || []).forEach(c => {
            if (c.required) {
                const val = simFormData[c.name];
                if (val === undefined || val === null || (typeof val === 'string' && !val.trim()) || (Array.isArray(val) && val.length === 0)) {
                    newErrors[c.name] = `${c.label || 'This field'} is required`;
                }
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setSimErrors(newErrors);
            toast.error("Please fill in required fields");
            return;
        }

        setSimErrors({});

        const isTerminal = currentScreen.terminal || currentScreen.footerAction?.type === 'complete';

        if (isTerminal) {
            setSimSubmittedPayload({
                flow_token: "mock_flow_token_" + Date.now(),
                screen_id: currentScreen.id,
                response: simFormData,
                submitted_at: new Date().toISOString()
            });
            setIsSimSubmittedOpen(true);
        } else {
            const targetScreenId = currentScreen.footerAction?.screen;
            const nextScreen = screens.find(s => s.id === targetScreenId) || screens[screens.indexOf(currentScreen) + 1] || screens[0];
            setSimScreenId(nextScreen.id);
        }
    };

    // --- Filtered Palette Categories ---
    const filteredCategories = useMemo(() => {
        const query = searchPalette.toLowerCase().trim();
        const cats = ['Typography', 'Input Fields', 'Choices & Selection', 'Pickers & Controls'];

        return cats.map(cat => ({
            name: cat,
            items: COMPONENT_PALETTE.filter(c => c.category === cat && (
                !query || c.label.toLowerCase().includes(query) || c.description.toLowerCase().includes(query)
            ))
        })).filter(c => c.items.length > 0);
    }, [searchPalette]);

    return (
        <TooltipProvider>
            <div className="flex flex-col h-full bg-background border border-border/60 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
                
                {/* 1. STUDIO TOP CONTROL BAR */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-2.5 bg-card border-b border-border/60 gap-3">
                    
                    {/* Left Info & Status */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Layers className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-foreground">Visual Flow Builder</span>
                                <Badge variant="outline" className="text-[10px] font-mono py-0 h-4 bg-primary/5 text-primary border-primary/20">
                                    DSL v{FLOW_VERSION}
                                </Badge>
                                <Badge variant="secondary" className="text-[10px] font-semibold py-0 h-4">
                                    {screens.length} {screens.length === 1 ? 'Screen' : 'Screens'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Center View Tabs Switcher */}
                    <div className="flex items-center bg-muted/40 p-0.5 rounded-xl border border-border/50">
                        <Button
                            variant={builderMode === 'design' ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setBuilderMode('design')}
                            className={`h-7 px-3 text-xs font-semibold gap-1.5 rounded-lg ${builderMode === 'design' ? 'shadow-sm' : ''}`}
                        >
                            <LayoutIcon className="w-3.5 h-3.5" />
                            Canvas
                        </Button>
                        <Button
                            variant={builderMode === 'simulator' ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setBuilderMode('simulator')}
                            className={`h-7 px-3 text-xs font-semibold gap-1.5 rounded-lg ${builderMode === 'simulator' ? 'shadow-sm' : ''}`}
                        >
                            <Play className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                            Simulator
                        </Button>
                        <Button
                            variant={builderMode === 'code' ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setBuilderMode('code')}
                            className={`h-7 px-3 text-xs font-semibold gap-1.5 rounded-lg ${builderMode === 'code' ? 'shadow-sm' : ''}`}
                        >
                            <FileCode className="w-3.5 h-3.5" />
                            Flow JSON
                        </Button>
                    </div>

                    {/* Right Action Tools */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {validationReport.valid ? (
                            <Badge variant="outline" className="hidden lg:flex text-[10px] gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 py-1">
                                <CheckCircle2 className="w-3 h-3" /> Meta Valid
                            </Badge>
                        ) : (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="outline" className="text-[10px] gap-1 text-destructive bg-destructive/10 border-destructive/20 py-1 cursor-pointer">
                                        <AlertCircle className="w-3 h-3" /> {validationReport.errors.length} Issue(s)
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs text-xs space-y-1">
                                    {validationReport.errors.map((err, i) => (
                                        <div key={i}>• {err}</div>
                                    ))}
                                </TooltipContent>
                            </Tooltip>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsImportModalOpen(true)}
                            className="h-8 text-xs font-semibold gap-1.5 rounded-lg border-border/70"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            Import JSON
                        </Button>

                        <Button
                            size="sm"
                            onClick={handleSave}
                            className="h-8 text-xs font-bold gap-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                        >
                            <Save className="w-3.5 h-3.5" />
                            Save Flow
                        </Button>
                    </div>
                </div>

                {/* 2. MAIN WORKSPACE CONTAINER */}
                <div className="flex-1 flex overflow-hidden">
                    
                    {builderMode === 'design' && (
                        <>
                            {/* --- LEFT SIDEBAR: SCREENS TREE & OUTLINE --- */}
                            <div className="w-64 border-r border-border/60 bg-card/40 flex flex-col shrink-0">
                                <div className="p-3 border-b border-border/60 flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Layers className="w-3.5 h-3.5 text-primary" />
                                        Screens ({screens.length})
                                    </span>
                                    
                                    <Select onValueChange={handleAddScreen}>
                                        <SelectTrigger className="h-7 w-20 text-[10px] bg-card border-border font-bold">
                                            <Plus className="w-3 h-3 mr-1" /> Add
                                        </SelectTrigger>
                                        <SelectContent align="end">
                                            {SCREEN_TEMPLATES.map(t => (
                                                <SelectItem key={t.id} value={t.id} className="text-xs">
                                                    {t.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <ScrollArea className="flex-1 p-2">
                                    <div className="space-y-1.5">
                                        {screens.map((s, index) => {
                                            const isActive = activeScreenId === s.id;
                                            const isTerminal = s.terminal || s.footerAction?.type === 'complete';
                                            const compCount = s.children?.length || 0;

                                            return (
                                                <div
                                                    key={s.id}
                                                    onClick={() => handleSelectScreen(s.id)}
                                                    className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                                                        isActive
                                                            ? 'bg-primary/10 border-primary text-foreground shadow-sm'
                                                            : 'bg-card/70 hover:bg-card border-border/50 text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between gap-1">
                                                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                                                isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                                            }`}>
                                                                {index + 1}
                                                            </div>
                                                            <span className="text-xs font-bold truncate">
                                                                {s.title || `Screen ${index + 1}`}
                                                            </span>
                                                        </div>

                                                        {isTerminal && (
                                                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shrink-0 font-semibold">
                                                                Terminal
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                                                        <span className="truncate max-w-[120px]">{s.id}</span>
                                                        <span>{compCount} {compCount === 1 ? 'item' : 'items'}</span>
                                                    </div>

                                                    {/* Quick Hover Controls */}
                                                    <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-0.5 bg-card/90 backdrop-blur-sm border rounded-lg p-0.5 shadow-sm">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleMoveScreen(index, -1); }}
                                                            disabled={index === 0}
                                                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                                                            title="Move Up"
                                                        >
                                                            <ChevronUp className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleMoveScreen(index, 1); }}
                                                            disabled={index === screens.length - 1}
                                                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                                                            title="Move Down"
                                                        >
                                                            <ChevronDown className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDuplicateScreen(s); }}
                                                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                                                            title="Duplicate Screen"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleRemoveScreen(s.id); }}
                                                            className="p-1 hover:bg-destructive/20 rounded text-destructive"
                                                            title="Delete Screen"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>
                            </div>

                            {/* --- CENTER CANVAS: AUTHENTIC META PHONE FRAME --- */}
                            <div
                                className="flex-1 bg-muted/15 flex flex-col items-center justify-start p-6 overflow-y-auto"
                                onClick={() => setSelectedComponentId(null)}
                            >
                                {/* Phone Mockup Shell */}
                                <div
                                    className="w-[360px] sm:w-[380px] min-h-[640px] bg-card border-[6px] border-border/80 rounded-[44px] shadow-2xl relative overflow-hidden flex flex-col my-auto transition-all"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Mobile Notch & Status Bar */}
                                    <div className="bg-[#0b141a] text-white/80 px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-mono select-none">
                                        <span>9:41</span>
                                        <div className="w-20 h-4 bg-black/60 rounded-full mx-auto" />
                                        <div className="flex items-center gap-1.5">
                                            <span>5G</span>
                                            <div className="w-4 h-2.5 border border-white/60 rounded-sm p-0.5">
                                                <div className="h-full bg-white rounded-2xs" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* WhatsApp Flow Header Bar */}
                                    <div className="bg-[#008069] dark:bg-[#1f2c34] text-white px-4 py-3 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <button className="text-white hover:opacity-80 transition-opacity">
                                                <X className="w-5 h-5" />
                                            </button>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <h3 className="text-sm font-bold truncate leading-tight">WhatsApp Flow</h3>
                                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                                                </div>
                                                <p className="text-[10px] text-white/75 truncate flex items-center gap-1">
                                                    <Lock className="w-2.5 h-2.5" /> End-to-end encrypted
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-[9px] text-white/90 border-white/30 py-0 h-4 font-mono">
                                            {activeScreen?.id}
                                        </Badge>
                                    </div>

                                    {/* Screen Content Canvas */}
                                    <div className="flex-1 p-5 space-y-4 bg-background overflow-y-auto">
                                        
                                        {/* Screen Header / Title editable */}
                                        <div className="space-y-1">
                                            <input
                                                value={activeScreen?.title || ''}
                                                onChange={(e) => handleUpdateActiveScreen({ title: e.target.value })}
                                                placeholder="Enter screen title..."
                                                className="w-full text-base font-extrabold text-foreground bg-transparent border-none outline-none focus:border-b-2 focus:border-primary pb-0.5"
                                            />
                                        </div>

                                        {/* Component Elements */}
                                        <div className="space-y-3">
                                            {activeScreen?.children?.map((c, cIdx) => {
                                                const isSelected = selectedComponentId === c.id;

                                                return (
                                                    <div
                                                        key={c.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedComponentId(c.id);
                                                            setActiveSidebarTab('inspector');
                                                        }}
                                                        className={`relative group p-3 rounded-xl border-2 transition-all cursor-pointer ${
                                                            isSelected
                                                                ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                                                                : 'border-transparent hover:border-primary/40 hover:bg-muted/30'
                                                        }`}
                                                    >
                                                        {/* Floating Component Type Pill */}
                                                        {isSelected && (
                                                            <Badge className="absolute -left-2 -top-2.5 text-[9px] h-4 px-1.5 font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-sm">
                                                                {c.type}
                                                            </Badge>
                                                        )}

                                                        {/* Preview Node */}
                                                        {renderComponentLivePreview(c)}

                                                        {/* Quick Hover Tool Actions */}
                                                        <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-card/95 border border-border shadow-md rounded-lg p-0.5 z-10">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleMoveComponent(c.id, -1); }}
                                                                disabled={cIdx === 0}
                                                                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                                                                title="Move Up"
                                                            >
                                                                <ChevronUp className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleMoveComponent(c.id, 1); }}
                                                                disabled={cIdx === (activeScreen.children?.length || 0) - 1}
                                                                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                                                                title="Move Down"
                                                            >
                                                                <ChevronDown className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDuplicateComponent(c); }}
                                                                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                                                                title="Duplicate"
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteComponent(c.id); }}
                                                                className="p-1 hover:bg-destructive/20 rounded text-destructive"
                                                                title="Delete Field"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {(!activeScreen?.children || activeScreen.children.length === 0) && (
                                                <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-border/80 rounded-2xl gap-3 text-center px-4">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                        <Plus className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-foreground">No components yet</p>
                                                        <p className="text-[11px] text-muted-foreground mt-0.5">Click components in the right palette to add.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Authentic Phone Footer CTA Bar */}
                                    <div className="p-4 bg-card border-t border-border/60 space-y-2">
                                        <Button
                                            className="w-full h-11 text-xs font-bold rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white shadow-md gap-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveSidebarTab('routing');
                                            }}
                                        >
                                            <span>{activeScreen?.footerAction?.label || (activeScreen?.terminal ? 'Finish' : 'Continue')}</span>
                                            {activeScreen?.terminal ? (
                                                <CheckCircle2 className="w-4 h-4" />
                                            ) : (
                                                <ArrowRight className="w-4 h-4" />
                                            )}
                                        </Button>

                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
                                            <span>Action: <b>{activeScreen?.footerAction?.type || 'navigate'}</b></span>
                                            <span>Destination: <b>{activeScreen?.terminal ? 'Submit Flow' : (activeScreen?.footerAction?.screen || 'Next Screen')}</b></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* --- RIGHT SIDEBAR: PALETTE, INSPECTOR & ROUTING --- */}
                            <div className="w-80 border-l border-border/60 bg-card flex flex-col shrink-0">
                                <Tabs value={activeSidebarTab} onValueChange={setActiveSidebarTab} className="flex-1 flex flex-col">
                                    <TabsList className="w-full rounded-none h-11 border-b border-border/60 bg-muted/20 p-1">
                                        <TabsTrigger value="palette" className="flex-1 text-xs font-bold">Palette</TabsTrigger>
                                        <TabsTrigger value="inspector" className="flex-1 text-xs font-bold">Properties</TabsTrigger>
                                        <TabsTrigger value="routing" className="flex-1 text-xs font-bold">Routing</TabsTrigger>
                                    </TabsList>

                                    {/* PALETTE TAB */}
                                    <TabsContent value="palette" className="m-0 flex-1 overflow-y-auto p-3 space-y-4">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                                            <Input
                                                placeholder="Search components..."
                                                value={searchPalette}
                                                onChange={(e) => setSearchPalette(e.target.value)}
                                                className="h-8 text-xs pl-8 pr-7 bg-muted/30 border-border/60 rounded-xl"
                                            />
                                            {searchPalette && (
                                                <button
                                                    onClick={() => setSearchPalette('')}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-4 pb-12">
                                            {filteredCategories.map(cat => (
                                                <div key={cat.name} className="space-y-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-1">
                                                        {cat.name}
                                                    </span>
                                                    <div className="grid grid-cols-1 gap-1.5">
                                                        {cat.items.map(item => (
                                                            <button
                                                                key={item.id}
                                                                onClick={() => handleAddComponent(item.id)}
                                                                className="flex items-center gap-3 p-2.5 rounded-xl border border-border/60 hover:border-primary/50 bg-card/60 hover:bg-primary/5 transition-all text-left group shadow-none"
                                                            >
                                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                                                                    <item.icon className="w-4 h-4" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                                                                        {item.label}
                                                                    </p>
                                                                    <p className="text-[10px] text-muted-foreground truncate">
                                                                        {item.description}
                                                                    </p>
                                                                </div>
                                                                <Plus className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>

                                    {/* INSPECTOR TAB */}
                                    <TabsContent value="inspector" className="m-0 flex-1 overflow-y-auto p-4">
                                        {!selectedComponent ? (
                                            <div className="py-16 text-center space-y-3">
                                                <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground/50">
                                                    <Sliders className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-foreground">No field selected</p>
                                                    <p className="text-[11px] text-muted-foreground max-w-[200px] mx-auto mt-1">
                                                        Click any element inside the mobile preview to edit its properties.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-5 pb-12">
                                                <div className="flex items-center justify-between border-b pb-2.5">
                                                    <div>
                                                        <Badge variant="outline" className="text-[10px] font-bold uppercase bg-primary/10 text-primary border-primary/20">
                                                            {selectedComponent.type}
                                                        </Badge>
                                                        <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{selectedComponent.id}</p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteComponent(selectedComponent.id)}
                                                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>

                                                {/* Text Content for typography */}
                                                {selectedComponent.type.startsWith('Text') && (
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold">Text Content</Label>
                                                        <Textarea
                                                            value={selectedComponent.text || ''}
                                                            onChange={(e) => handleUpdateComponent(selectedComponent.id, { text: e.target.value })}
                                                            placeholder="Enter displayed text..."
                                                            className="text-xs min-h-[80px]"
                                                        />
                                                    </div>
                                                )}

                                                {/* Label for inputs */}
                                                {!selectedComponent.type.startsWith('Text') && (
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold">Visible Label</Label>
                                                        <Input
                                                            value={selectedComponent.label || ''}
                                                            onChange={(e) => handleUpdateComponent(selectedComponent.id, { label: e.target.value })}
                                                            placeholder="Field title shown to user..."
                                                            className="h-8 text-xs font-semibold"
                                                        />
                                                    </div>
                                                )}

                                                {/* System Field Name (Payload key) */}
                                                {selectedComponent.name !== undefined && (
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-xs font-semibold">System Name (Payload Key)</Label>
                                                            <span className="text-[10px] text-muted-foreground font-mono">Unique Key</span>
                                                        </div>
                                                        <Input
                                                            value={selectedComponent.name || ''}
                                                            onChange={(e) => handleUpdateComponent(selectedComponent.id, { name: sanitizeIdentifier(e.target.value, 'field', false) })}
                                                            placeholder="e.g. user_email"
                                                            className="h-8 text-xs font-mono"
                                                        />
                                                    </div>
                                                )}

                                                {/* Placeholder & Helper Text */}
                                                {selectedComponent.placeholder !== undefined && (
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold">Placeholder Text</Label>
                                                        <Input
                                                            value={selectedComponent.placeholder || ''}
                                                            onChange={(e) => handleUpdateComponent(selectedComponent.id, { placeholder: e.target.value })}
                                                            placeholder="e.g. Type your name..."
                                                            className="h-8 text-xs"
                                                        />
                                                    </div>
                                                )}

                                                {selectedComponent.helperText !== undefined && (
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold">Helper / Subtext</Label>
                                                        <Input
                                                            value={selectedComponent.helperText || ''}
                                                            onChange={(e) => handleUpdateComponent(selectedComponent.id, { helperText: e.target.value })}
                                                            placeholder="e.g. Must be a valid email"
                                                            className="h-8 text-xs"
                                                        />
                                                    </div>
                                                )}

                                                {/* Input Type for TextInput */}
                                                {selectedComponent.type === 'TextInput' && (
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold">Input Type</Label>
                                                        <Select
                                                            value={selectedComponent.inputType || 'text'}
                                                            onValueChange={(val) => handleUpdateComponent(selectedComponent.id, { inputType: val })}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="text">Single-line Text</SelectItem>
                                                                <SelectItem value="email">Email Address</SelectItem>
                                                                <SelectItem value="number">Number</SelectItem>
                                                                <SelectItem value="phone">Phone Number</SelectItem>
                                                                <SelectItem value="password">Password</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}

                                                {/* Options Editor for Select / Radio / Checkboxes */}
                                                {['Select', 'RadioButtons', 'CheckboxGroup'].includes(selectedComponent.type) && (
                                                    <div className="space-y-2.5 pt-2 border-t">
                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-xs font-bold">Choices & Options</Label>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-6 text-[10px] font-semibold gap-1"
                                                                onClick={() => {
                                                                    const current = selectedComponent.options || [];
                                                                    const count = current.length + 1;
                                                                    const newOpt = { label: `Option ${count}`, value: `opt_${count}`, description: '' };
                                                                    handleUpdateComponent(selectedComponent.id, { options: [...current, newOpt] });
                                                                }}
                                                            >
                                                                <Plus className="w-3 h-3" /> Add Choice
                                                            </Button>
                                                        </div>

                                                        <div className="space-y-2">
                                                            {(selectedComponent.options || []).map((opt, optIdx) => (
                                                                <div key={optIdx} className="p-2 border rounded-xl bg-card space-y-1.5">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Input
                                                                            value={opt.label || ''}
                                                                            onChange={(e) => {
                                                                                const opts = [...selectedComponent.options];
                                                                                opts[optIdx].label = e.target.value;
                                                                                handleUpdateComponent(selectedComponent.id, { options: opts });
                                                                            }}
                                                                            placeholder="Choice Title"
                                                                            className="h-7 text-xs flex-1 font-semibold"
                                                                        />
                                                                        <Input
                                                                            value={opt.value || ''}
                                                                            onChange={(e) => {
                                                                                const opts = [...selectedComponent.options];
                                                                                opts[optIdx].value = sanitizeIdentifier(e.target.value, 'opt', false);
                                                                                handleUpdateComponent(selectedComponent.id, { options: opts });
                                                                            }}
                                                                            placeholder="Value/ID"
                                                                            className="h-7 text-[10px] font-mono w-20"
                                                                        />
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-7 w-7 text-destructive"
                                                                            onClick={() => {
                                                                                const opts = selectedComponent.options.filter((_, i) => i !== optIdx);
                                                                                handleUpdateComponent(selectedComponent.id, { options: opts });
                                                                            }}
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </Button>
                                                                    </div>
                                                                    <Input
                                                                        value={opt.description || ''}
                                                                        onChange={(e) => {
                                                                            const opts = [...selectedComponent.options];
                                                                            opts[optIdx].description = e.target.value;
                                                                            handleUpdateComponent(selectedComponent.id, { options: opts });
                                                                        }}
                                                                        placeholder="Subtext / Description (optional)"
                                                                        className="h-6 text-[10px] text-muted-foreground"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Required Field Checkbox */}
                                                {selectedComponent.required !== undefined && (
                                                    <div className="flex items-center gap-2 pt-2 border-t">
                                                        <input
                                                            type="checkbox"
                                                            id="req-checkbox"
                                                            checked={Boolean(selectedComponent.required)}
                                                            onChange={(e) => handleUpdateComponent(selectedComponent.id, { required: e.target.checked })}
                                                            className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                                                        />
                                                        <Label htmlFor="req-checkbox" className="text-xs font-semibold cursor-pointer">
                                                            Required Field (Mandatory in WhatsApp)
                                                        </Label>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* ROUTING & SCREEN SETTINGS TAB */}
                                    <TabsContent value="routing" className="m-0 flex-1 overflow-y-auto p-4 space-y-5">
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Screen Properties</h4>
                                            
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold">Screen ID</Label>
                                                <Input
                                                    value={activeScreen?.id || ''}
                                                    onChange={(e) => handleUpdateActiveScreen({ id: sanitizeScreenId(e.target.value) })}
                                                    className="h-8 text-xs font-mono font-bold"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold">Screen Title</Label>
                                                <Input
                                                    value={activeScreen?.title || ''}
                                                    onChange={(e) => handleUpdateActiveScreen({ title: e.target.value })}
                                                    className="h-8 text-xs"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2 pt-1">
                                                <input
                                                    type="checkbox"
                                                    id="terminal-checkbox"
                                                    checked={Boolean(activeScreen?.terminal)}
                                                    onChange={(e) => handleUpdateActiveScreen({ terminal: e.target.checked })}
                                                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                                                />
                                                <Label htmlFor="terminal-checkbox" className="text-xs font-semibold cursor-pointer">
                                                    Terminal Screen (Completes & Submits Flow)
                                                </Label>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Footer CTA Action</h4>

                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold">Button Label</Label>
                                                <Input
                                                    value={activeScreen?.footerAction?.label || ''}
                                                    onChange={(e) => handleUpdateFooterAction({ label: e.target.value })}
                                                    placeholder="Continue / Submit"
                                                    className="h-8 text-xs font-bold"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold">Action Type</Label>
                                                <Select
                                                    value={activeScreen?.terminal ? 'complete' : (activeScreen?.footerAction?.type || 'navigate')}
                                                    onValueChange={(val) => {
                                                        if (val === 'complete') {
                                                            handleUpdateActiveScreen({ terminal: true });
                                                            handleUpdateFooterAction({ type: 'complete' });
                                                        } else {
                                                            handleUpdateActiveScreen({ terminal: false });
                                                            handleUpdateFooterAction({ type: val });
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="navigate">Navigate to Screen</SelectItem>
                                                        <SelectItem value="complete">Complete & Submit Flow</SelectItem>
                                                        <SelectItem value="data_exchange">Dynamic Data Exchange (API)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {activeScreen?.footerAction?.type === 'navigate' && !activeScreen?.terminal && (
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold">Target Destination Screen</Label>
                                                    <Select
                                                        value={activeScreen?.footerAction?.screen || ''}
                                                        onValueChange={(val) => handleUpdateFooterAction({ screen: val })}
                                                    >
                                                        <SelectTrigger className="h-8 text-xs">
                                                            <SelectValue placeholder="Select target screen..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {screens.filter(s => s.id !== activeScreenId).map(s => (
                                                                <SelectItem key={s.id} value={s.id}>
                                                                    {s.title} ({s.id})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </>
                    )}

                    {/* --- 3. INTERACTIVE SIMULATOR MODE --- */}
                    {builderMode === 'simulator' && (
                        <div className="flex-1 bg-muted/20 flex flex-col lg:flex-row items-center justify-center p-8 gap-8 overflow-y-auto">
                            {/* Live Interactive Mobile Frame */}
                            {(() => {
                                const currentSimScreen = screens.find(s => s.id === simScreenId) || screens[0];
                                const isTerminal = currentSimScreen.terminal || currentSimScreen.footerAction?.type === 'complete';

                                return (
                                    <div className="w-[360px] sm:w-[380px] min-h-[640px] bg-card border-[6px] border-border/80 rounded-[44px] shadow-2xl relative overflow-hidden flex flex-col">
                                        
                                        {/* Status Bar */}
                                        <div className="bg-[#0b141a] text-white/80 px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-mono select-none">
                                            <span>9:41</span>
                                            <div className="w-20 h-4 bg-black/60 rounded-full mx-auto" />
                                            <div className="flex items-center gap-1.5">
                                                <span>5G</span>
                                                <div className="w-4 h-2.5 border border-white/60 rounded-sm p-0.5">
                                                    <div className="h-full bg-white rounded-2xs" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* WhatsApp Header */}
                                        <div className="bg-[#008069] dark:bg-[#1f2c34] text-white px-4 py-3 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <button
                                                    onClick={() => {
                                                        const curIdx = screens.findIndex(s => s.id === simScreenId);
                                                        if (curIdx > 0) setSimScreenId(screens[curIdx - 1].id);
                                                    }}
                                                    disabled={screens.findIndex(s => s.id === simScreenId) === 0}
                                                    className="text-white hover:opacity-80 transition-opacity disabled:opacity-30"
                                                >
                                                    <ArrowLeft className="w-5 h-5" />
                                                </button>
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-bold truncate leading-tight">Live Flow Test</h3>
                                                    <p className="text-[10px] text-white/75 truncate">{currentSimScreen.title}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSimScreenId(screens[0]?.id);
                                                    setSimFormData({});
                                                    setSimErrors({});
                                                }}
                                                className="h-6 text-[10px] text-white hover:bg-white/10"
                                            >
                                                <RefreshCw className="w-3 h-3 mr-1" /> Reset
                                            </Button>
                                        </div>

                                        {/* Simulator Interactive Body */}
                                        <div className="flex-1 p-5 space-y-4 bg-background overflow-y-auto">
                                            <h2 className="text-base font-extrabold text-foreground">{currentSimScreen.title}</h2>

                                            <div className="space-y-4">
                                                {currentSimScreen.children?.map(c => (
                                                    <div key={c.id}>
                                                        {renderSimulatorInteractiveField(c, simFormData, setSimFormData, simErrors)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Interactive Submit Button */}
                                        <div className="p-4 bg-card border-t border-border/60">
                                            <Button
                                                className="w-full h-11 text-xs font-bold rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white shadow-md gap-2"
                                                onClick={() => handleSimulatorAction(currentSimScreen)}
                                            >
                                                <span>{currentSimScreen.footerAction?.label || (isTerminal ? 'Submit Form' : 'Continue')}</span>
                                                {isTerminal ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Simulator Real-Time Live State Output */}
                            <div className="w-full lg:w-96 space-y-4">
                                <Card className="border-border/60 shadow-md">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <span className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                                                <Play className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                                                Live Captured Payload
                                            </span>
                                            <Badge variant="outline" className="text-[10px] font-mono">
                                                {Object.keys(simFormData).length} fields
                                            </Badge>
                                        </div>
                                        <pre className="p-3 bg-muted/40 rounded-xl text-[11px] font-mono overflow-auto max-h-[300px] text-foreground/90">
                                            {JSON.stringify(simFormData, null, 2)}
                                        </pre>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* --- 4. FLOW JSON DSL CODE TAB --- */}
                    {builderMode === 'code' && (
                        <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
                            <div className="p-3 bg-[#252526] border-b border-[#333333] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-blue-600 text-white font-mono text-[10px]">flow.json</Badge>
                                    <span className="text-xs text-muted-foreground">Standard WhatsApp Meta Flows v{FLOW_VERSION} Schema</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopyJson}
                                        className="h-7 text-xs text-gray-300 hover:text-white hover:bg-white/10"
                                    >
                                        <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy JSON
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleDownloadJson}
                                        className="h-7 text-xs text-gray-300 hover:text-white hover:bg-white/10"
                                    >
                                        <Download className="w-3.5 h-3.5 mr-1.5" /> Download
                                    </Button>
                                </div>
                            </div>
                            <ScrollArea className="flex-1 p-6">
                                <pre className="text-blue-300 font-mono text-xs leading-relaxed">
                                    {flowJsonString}
                                </pre>
                            </ScrollArea>
                        </div>
                    )}
                </div>

                {/* --- IMPORT JSON MODAL --- */}
                <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                    <DialogContent className="sm:max-w-[560px] rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold flex items-center gap-2">
                                <Upload className="w-4 h-4 text-primary" />
                                Import WhatsApp Flow JSON
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Paste any valid Meta WhatsApp `flow.json` DSL structure to import screens and fields directly.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-2">
                            <Textarea
                                value={importJsonText}
                                onChange={(e) => setImportJsonText(e.target.value)}
                                placeholder='{\n  "version": "7.3",\n  "screens": [\n    ...\n  ]\n}'
                                className="min-h-[260px] font-mono text-xs"
                            />
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" size="sm" onClick={() => setIsImportModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleImportJson} className="font-semibold gap-1.5">
                                <Check className="w-4 h-4" /> Import Screens
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* --- SIMULATOR SUBMISSION MODAL --- */}
                <Dialog open={isSimSubmittedOpen} onOpenChange={setIsSimSubmittedOpen}>
                    <DialogContent className="sm:max-w-[480px] rounded-2xl text-center">
                        <div className="py-4 space-y-3">
                            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-foreground">Flow Simulation Completed!</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Here is the exact response payload that WhatsApp will return to your backend webhook.
                                </p>
                            </div>
                            <pre className="p-3 bg-muted/50 rounded-xl text-left font-mono text-[11px] overflow-auto max-h-[220px]">
                                {JSON.stringify(simSubmittedPayload, null, 2)}
                            </pre>
                        </div>
                        <DialogFooter className="sm:justify-center">
                            <Button
                                size="sm"
                                onClick={() => {
                                    setIsSimSubmittedOpen(false);
                                    setSimScreenId(screens[0]?.id);
                                    setSimFormData({});
                                }}
                                className="rounded-xl px-6"
                            >
                                Test Again
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </TooltipProvider>
    );
}

// --- Live Static Preview in Canvas ---
function renderComponentLivePreview(c) {
    switch (c.type) {
        case 'TextHeading':
            return <h2 className="text-base font-extrabold text-foreground leading-snug">{c.text || 'Heading'}</h2>;
        case 'TextSubheading':
            return <h3 className="text-sm font-bold text-foreground/90 leading-snug">{c.text || 'Subheading'}</h3>;
        case 'TextBody':
            return <p className="text-xs text-muted-foreground leading-relaxed">{c.text || 'Body text content'}</p>;
        case 'TextCaption':
            return <p className="text-[11px] text-muted-foreground/75 italic leading-tight">{c.text || 'Caption text'}</p>;
        case 'TextInput':
            return (
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-foreground">
                            {c.label || 'Text Field'} {c.required && <span className="text-destructive">*</span>}
                        </Label>
                        {c.name && <span className="text-[9px] font-mono text-muted-foreground/60">{c.name}</span>}
                    </div>
                    <div className="h-9 border border-border/80 rounded-xl bg-card px-3 flex items-center text-xs text-muted-foreground/60">
                        {c.placeholder || 'Type here...'}
                    </div>
                    {c.helperText && <p className="text-[10px] text-muted-foreground">{c.helperText}</p>}
                </div>
            );
        case 'TextArea':
            return (
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-foreground">
                            {c.label || 'Text Area'} {c.required && <span className="text-destructive">*</span>}
                        </Label>
                        {c.name && <span className="text-[9px] font-mono text-muted-foreground/60">{c.name}</span>}
                    </div>
                    <div className="h-16 border border-border/80 rounded-xl bg-card p-2 text-xs text-muted-foreground/60">
                        {c.placeholder || 'Type multiple lines...'}
                    </div>
                </div>
            );
        case 'Select':
            return (
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-foreground">
                            {c.label || 'Dropdown Choice'} {c.required && <span className="text-destructive">*</span>}
                        </Label>
                    </div>
                    <div className="h-9 border border-border/80 rounded-xl bg-card px-3 flex items-center justify-between text-xs text-foreground/80">
                        <span>{c.options?.[0]?.label || 'Select option...'}</span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                </div>
            );
        case 'RadioButtons':
            return (
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                        {c.label || 'Choose One'} {c.required && <span className="text-destructive">*</span>}
                    </Label>
                    <div className="space-y-1.5 pt-0.5">
                        {(c.options || [{ label: 'Option 1' }]).map((opt, i) => (
                            <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg border border-border/60 bg-card/60 text-xs">
                                <div className="w-4 h-4 rounded-full border-2 border-primary/60 flex items-center justify-center">
                                    {i === 0 && <div className="w-2 h-2 rounded-full bg-primary" />}
                                </div>
                                <span className="font-medium text-foreground">{opt.label || `Choice ${i + 1}`}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'CheckboxGroup':
            return (
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                        {c.label || 'Choose Multiple'} {c.required && <span className="text-destructive">*</span>}
                    </Label>
                    <div className="space-y-1.5 pt-0.5">
                        {(c.options || [{ label: 'Option 1' }]).map((opt, i) => (
                            <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg border border-border/60 bg-card/60 text-xs">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${i === 0 ? 'bg-primary border-primary text-primary-foreground' : 'border-border'}`}>
                                    {i === 0 && <Check className="w-3 h-3" />}
                                </div>
                                <span className="font-medium text-foreground">{opt.label || `Choice ${i + 1}`}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'DatePicker':
            return (
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                        {c.label || 'Select Date'} {c.required && <span className="text-destructive">*</span>}
                    </Label>
                    <div className="h-9 border border-border/80 rounded-xl bg-card px-3 flex items-center justify-between text-xs text-muted-foreground/70">
                        <span>Select date...</span>
                        <Calendar className="w-4 h-4 text-primary" />
                    </div>
                </div>
            );
        case 'ConsentCheckbox':
            return (
                <div className="flex items-start gap-2.5 pt-1">
                    <div className="w-4 h-4 rounded border-2 border-primary mt-0.5 flex items-center justify-center bg-primary/10 shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-xs text-foreground/90 leading-tight font-medium">
                        {c.label || 'I agree to the terms and privacy policy'}
                    </span>
                </div>
            );
        default:
            return <div className="text-xs text-muted-foreground">{c.label || c.type}</div>;
    }
}

// --- Interactive Simulator Form Fields ---
function renderSimulatorInteractiveField(c, formData, setFormData, errors) {
    const value = formData[c.name];
    const error = errors[c.name];

    switch (c.type) {
        case 'TextHeading':
            return <h2 className="text-base font-extrabold text-foreground leading-snug">{c.text}</h2>;
        case 'TextSubheading':
            return <h3 className="text-sm font-bold text-foreground/90 leading-snug">{c.text}</h3>;
        case 'TextBody':
            return <p className="text-xs text-muted-foreground leading-relaxed">{c.text}</p>;
        case 'TextCaption':
            return <p className="text-[11px] text-muted-foreground/75 italic leading-tight">{c.text}</p>;
        
        case 'TextInput':
            return (
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                        {c.label} {c.required && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                        type={c.inputType === 'password' ? 'password' : c.inputType === 'email' ? 'email' : 'text'}
                        value={value || ''}
                        onChange={(e) => setFormData({ ...formData, [c.name]: e.target.value })}
                        placeholder={c.placeholder || 'Type here...'}
                        className={`h-9 rounded-xl text-xs ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    {error && <p className="text-[10px] text-destructive font-semibold">{error}</p>}
                </div>
            );

        case 'TextArea':
            return (
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                        {c.label} {c.required && <span className="text-destructive">*</span>}
                    </Label>
                    <Textarea
                        value={value || ''}
                        onChange={(e) => setFormData({ ...formData, [c.name]: e.target.value })}
                        placeholder={c.placeholder || 'Type your message...'}
                        className={`min-h-[70px] rounded-xl text-xs ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    {error && <p className="text-[10px] text-destructive font-semibold">{error}</p>}
                </div>
            );

        case 'Select':
            return (
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                        {c.label} {c.required && <span className="text-destructive">*</span>}
                    </Label>
                    <Select
                        value={value || ''}
                        onValueChange={(val) => setFormData({ ...formData, [c.name]: val })}
                    >
                        <SelectTrigger className={`h-9 rounded-xl text-xs ${error ? 'border-destructive' : ''}`}>
                            <SelectValue placeholder="Select an option..." />
                        </SelectTrigger>
                        <SelectContent>
                            {(c.options || []).map(opt => (
                                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                    <div>
                                        <div className="font-semibold">{opt.label}</div>
                                        {opt.description && <div className="text-[10px] text-muted-foreground">{opt.description}</div>}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {error && <p className="text-[10px] text-destructive font-semibold">{error}</p>}
                </div>
            );

        case 'RadioButtons':
            return (
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                        {c.label} {c.required && <span className="text-destructive">*</span>}
                    </Label>
                    <div className="space-y-1.5 pt-0.5">
                        {(c.options || []).map(opt => {
                            const isSelected = value === opt.value;
                            return (
                                <div
                                    key={opt.value}
                                    onClick={() => setFormData({ ...formData, [c.name]: opt.value })}
                                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                                        isSelected ? 'border-primary bg-primary/10 font-bold' : 'border-border/60 hover:bg-muted/40'
                                    }`}
                                >
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        isSelected ? 'border-primary bg-primary text-white' : 'border-muted-foreground/50'
                                    }`}>
                                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                    <span className="text-foreground">{opt.label}</span>
                                </div>
                            );
                        })}
                    </div>
                    {error && <p className="text-[10px] text-destructive font-semibold">{error}</p>}
                </div>
            );

        case 'CheckboxGroup': {
            const currentSelected = Array.isArray(value) ? value : [];
            return (
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                        {c.label} {c.required && <span className="text-destructive">*</span>}
                    </Label>
                    <div className="space-y-1.5 pt-0.5">
                        {(c.options || []).map(opt => {
                            const isChecked = currentSelected.includes(opt.value);
                            return (
                                <div
                                    key={opt.value}
                                    onClick={() => {
                                        const next = isChecked
                                            ? currentSelected.filter(v => v !== opt.value)
                                            : [...currentSelected, opt.value];
                                        setFormData({ ...formData, [c.name]: next });
                                    }}
                                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                                        isChecked ? 'border-primary bg-primary/10 font-bold' : 'border-border/60 hover:bg-muted/40'
                                    }`}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                        isChecked ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/50'
                                    }`}>
                                        {isChecked && <Check className="w-3 h-3" />}
                                    </div>
                                    <span className="text-foreground">{opt.label}</span>
                                </div>
                            );
                        })}
                    </div>
                    {error && <p className="text-[10px] text-destructive font-semibold">{error}</p>}
                </div>
            );
        }

        case 'DatePicker':
            return (
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                        {c.label} {c.required && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                        type="date"
                        value={value || ''}
                        onChange={(e) => setFormData({ ...formData, [c.name]: e.target.value })}
                        className={`h-9 rounded-xl text-xs ${error ? 'border-destructive' : ''}`}
                    />
                    {error && <p className="text-[10px] text-destructive font-semibold">{error}</p>}
                </div>
            );

        case 'ConsentCheckbox':
            return (
                <div className="space-y-1 pt-1">
                    <div
                        onClick={() => setFormData({ ...formData, [c.name]: !value })}
                        className="flex items-start gap-2.5 cursor-pointer select-none"
                    >
                        <div className={`w-4 h-4 rounded border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                            value ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/50'
                        }`}>
                            {value && <Check className="w-3 h-3" />}
                        </div>
                        <span className="text-xs text-foreground/90 leading-tight font-medium">
                            {c.label} {c.required && <span className="text-destructive">*</span>}
                        </span>
                    </div>
                    {error && <p className="text-[10px] text-destructive font-semibold">{error}</p>}
                </div>
            );

        default:
            return null;
    }
}
