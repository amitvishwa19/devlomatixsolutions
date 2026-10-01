'use client';

// WhatsApp Interactive Flow Builder Component
import React, { useState, useEffect, useMemo } from 'react';
import {
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
    File as FileIcon,
    Check,
    X,
    Search,
    Play,
    Copy,
    Download,
    Upload,
    ChevronUp,
    ChevronDown,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    FileCode,
    GripVertical,
    MoreVertical,
    HelpCircle,
    Info,
    Image as ImageIcon,
    Sliders,
    Layers,
    Lock,
    ExternalLink
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function FlowBuilder({
    initialScreens = [],
    onSave,
    onCancel,
    endpointUrl = '',
    flowName = 'Your form'
}) {
    // 1. Screens state
    const [screens, setScreens] = useState(() => {
        if (initialScreens && initialScreens.length > 0) {
            return initialScreens;
        }
        return [
            {
                id: 'WELCOME',
                title: 'Your form',
                terminal: false,
                children: [
                    {
                        id: 'comp_body_default',
                        type: 'TextBody',
                        text: "Select 'Add content' to start building your form. To add new screens, select 'Add new' in the 'Screens' panel."
                    }
                ],
                footerAction: { type: 'navigate', label: 'Continue', screen: '' }
            }
        ];
    });

    const [activeScreenId, setActiveScreenId] = useState(screens[0]?.id || 'WELCOME');
    const [expandedSections, setExpandedSections] = useState({
        screen_title: true,
        button_action: true
    });
    const [expandedCompIds, setExpandedCompIds] = useState({});
    const [activeTabMode, setActiveTabMode] = useState('builder'); // 'builder' | 'json' | 'simulator'
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importJsonText, setImportJsonText] = useState('');

    // Simulator State
    const [simScreenId, setSimScreenId] = useState(screens[0]?.id || 'WELCOME');
    const [simFormData, setSimFormData] = useState({});
    const [simErrors, setSimErrors] = useState({});
    const [isSimResultOpen, setIsSimResultOpen] = useState(false);
    const [simResultPayload, setSimResultPayload] = useState(null);

    // Drag & Drop State
    const [draggedScreenIdx, setDraggedScreenIdx] = useState(null);
    const [dragOverScreenIdx, setDragOverScreenIdx] = useState(null);
    const [draggedCompIdx, setDraggedCompIdx] = useState(null);
    const [dragOverCompIdx, setDragOverCompIdx] = useState(null);

    const activeScreen = screens.find(s => s.id === activeScreenId) || screens[0];
    const activeScreenIndex = screens.findIndex(s => s.id === activeScreenId);

    // Validation Report
    const validationReport = useMemo(() => {
        return validateFlowScreens(screens);
    }, [screens]);

    // Flow JSON string
    const flowJsonString = useMemo(() => {
        try {
            const dsl = generateFlowDSL(screens, { endpointUrl });
            return JSON.stringify(dsl, null, 2);
        } catch (e) {
            return "// Error generating Flow JSON";
        }
    }, [screens, endpointUrl]);

    // --- Screen Operations ---

    const handleSelectScreen = (id) => {
        setActiveScreenId(id);
    };

    const handleDropScreen = (targetIdx) => {
        if (draggedScreenIdx === null || draggedScreenIdx === targetIdx) {
            setDraggedScreenIdx(null);
            setDragOverScreenIdx(null);
            return;
        }
        const copy = [...screens];
        const [draggedItem] = copy.splice(draggedScreenIdx, 1);
        copy.splice(targetIdx, 0, draggedItem);
        setScreens(copy);
        setDraggedScreenIdx(null);
        setDragOverScreenIdx(null);
        toast.success(`Screen moved to position ${targetIdx + 1}`);
    };

    const handleDropComponent = (targetIdx) => {
        if (draggedCompIdx === null || draggedCompIdx === targetIdx) {
            setDraggedCompIdx(null);
            setDragOverCompIdx(null);
            return;
        }
        if (!activeScreen) return;
        const children = [...activeScreen.children];
        const [draggedItem] = children.splice(draggedCompIdx, 1);
        children.splice(targetIdx, 0, draggedItem);
        setScreens(screens.map(s => s.id === activeScreenId ? { ...s, children } : s));
        setDraggedCompIdx(null);
        setDragOverCompIdx(null);
        toast.success('Field reordered');
    };

    const handleAddNewScreen = () => {
        const nextNum = screens.length + 1;
        const newId = sanitizeScreenId(`SCREEN_${nextNum}`, nextNum);
        const newScreen = {
            id: newId,
            title: `Screen ${nextNum}`,
            terminal: false,
            children: [
                {
                    id: `comp_head_${Date.now()}`,
                    type: 'TextHeading',
                    text: `Screen ${nextNum}`
                }
            ],
            footerAction: { type: 'navigate', label: 'Continue', screen: '' }
        };

        setScreens([...screens, newScreen]);
        setActiveScreenId(newId);
        toast.success(`Added ${newScreen.title}`);
    };

    const handleDeleteScreen = (screenId, e) => {
        if (e) e.stopPropagation();
        if (screens.length <= 1) {
            toast.error('Flow must contain at least one screen');
            return;
        }
        const remaining = screens.filter(s => s.id !== screenId);
        setScreens(remaining);
        if (activeScreenId === screenId) {
            setActiveScreenId(remaining[0]?.id);
        }
        toast.success('Screen removed');
    };

    const handleMoveScreen = (index, direction, e) => {
        if (e) e.stopPropagation();
        const target = index + direction;
        if (target < 0 || target >= screens.length) return;
        const copy = [...screens];
        const temp = copy[index];
        copy[index] = copy[target];
        copy[target] = temp;
        setScreens(copy);
    };

    // --- Component Operations ---

    const handleAddContent = (type, extraProps = {}) => {
        if (!activeScreenId) return;

        let newComp = null;
        const count = activeScreen?.children?.length || 0;
        const compId = `comp_${type.toLowerCase()}_${Date.now()}`;

        switch (type) {
            case 'TextHeading':
                newComp = { id: compId, type: 'TextHeading', text: 'Heading Text' };
                break;
            case 'TextSubheading':
                newComp = { id: compId, type: 'TextSubheading', text: 'Subheading Text' };
                break;
            case 'TextBody':
                newComp = { id: compId, type: 'TextBody', text: 'Body text content description...' };
                break;
            case 'TextCaption':
                newComp = { id: compId, type: 'TextCaption', text: 'Caption or disclaimer text' };
                break;
            case 'Image':
                newComp = { id: compId, type: 'Image', src: 'https://via.placeholder.com/600x300.png', altText: 'Banner Image' };
                break;
            case 'TextInput': {
                const defaultLabel = extraProps.label || 'Short text';
                newComp = {
                    id: compId,
                    type: 'TextInput',
                    name: sanitizeIdentifier(defaultLabel, `field_${count + 1}`, false),
                    label: defaultLabel,
                    placeholder: extraProps.placeholder || 'Enter text...',
                    inputType: extraProps.inputType || 'text',
                    required: true,
                    helperText: ''
                };
                break;
            }
            case 'TextArea': {
                const defaultLabel = extraProps.label || 'Multi-line Text';
                newComp = {
                    id: compId,
                    type: 'TextArea',
                    name: sanitizeIdentifier(defaultLabel, `notes_${count + 1}`, false),
                    label: defaultLabel,
                    placeholder: 'Type your message...',
                    required: false,
                    helperText: ''
                };
                break;
            }
            case 'Select': {
                const defaultLabel = extraProps.label || 'Choose Option';
                newComp = {
                    id: compId,
                    type: 'Select',
                    name: sanitizeIdentifier(defaultLabel, `select_${count + 1}`, false),
                    label: defaultLabel,
                    required: true,
                    options: [
                        { label: 'Option 1', value: 'opt_1', description: '' },
                        { label: 'Option 2', value: 'opt_2', description: '' }
                    ]
                };
                break;
            }
            case 'RadioButtons': {
                const defaultLabel = extraProps.label || 'Select One';
                newComp = {
                    id: compId,
                    type: 'RadioButtons',
                    name: sanitizeIdentifier(defaultLabel, `radio_${count + 1}`, false),
                    label: defaultLabel,
                    required: true,
                    options: [
                        { label: 'Option A', value: 'opt_a' },
                        { label: 'Option B', value: 'opt_b' }
                    ]
                };
                break;
            }
            case 'CheckboxGroup': {
                const defaultLabel = extraProps.label || 'Select Multiple';
                newComp = {
                    id: compId,
                    type: 'CheckboxGroup',
                    name: sanitizeIdentifier(defaultLabel, `checkbox_${count + 1}`, false),
                    label: defaultLabel,
                    required: false,
                    options: [
                        { label: 'Feature 1', value: 'f1' },
                        { label: 'Feature 2', value: 'f2' }
                    ]
                };
                break;
            }
            case 'DatePicker': {
                const defaultLabel = extraProps.label || 'Select Date';
                newComp = {
                    id: compId,
                    type: 'DatePicker',
                    name: sanitizeIdentifier(defaultLabel, `date_${count + 1}`, false),
                    label: defaultLabel,
                    required: true
                };
                break;
            }
            case 'ConsentCheckbox': {
                const defaultLabel = extraProps.label || 'I agree to the terms and privacy policy';
                newComp = {
                    id: compId,
                    type: 'ConsentCheckbox',
                    name: sanitizeIdentifier('terms_consent', `terms_${count + 1}`, false),
                    label: defaultLabel,
                    required: true
                };
                break;
            }
            default:
                newComp = { id: compId, type: 'TextBody', text: 'New content' };
        }

        // If the only element was the default placeholder, remove it
        let updatedChildren = [...(activeScreen?.children || [])];
        if (updatedChildren.length === 1 && updatedChildren[0].id === 'comp_body_default') {
            updatedChildren = [];
        }

        updatedChildren.push(newComp);

        setScreens(screens.map(s => s.id === activeScreenId ? { ...s, children: updatedChildren } : s));
        setExpandedCompIds(prev => ({ ...prev, [compId]: true }));
        toast.success(`Added ${newComp.label || newComp.type}`);
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

    const handleDeleteComponent = (compId, e) => {
        if (e) e.stopPropagation();
        setScreens(screens.map(s => {
            if (s.id === activeScreenId) {
                return {
                    ...s,
                    children: s.children.filter(c => c.id !== compId)
                };
            }
            return s;
        }));
    };

    const handleMoveComponent = (index, direction, e) => {
        if (e) e.stopPropagation();
        if (!activeScreen) return;
        const children = [...activeScreen.children];
        const target = index + direction;
        if (target < 0 || target >= children.length) return;
        const temp = children[index];
        children[index] = children[target];
        children[target] = temp;
        setScreens(screens.map(s => s.id === activeScreenId ? { ...s, children } : s));
    };

    const toggleComponentExpand = (compId) => {
        setExpandedCompIds(prev => ({
            ...prev,
            [compId]: !prev[compId]
        }));
    };

    // --- Screen Settings Updates ---

    const handleUpdateScreenTitle = (title) => {
        setScreens(screens.map(s => s.id === activeScreenId ? { ...s, title } : s));
    };

    const handleUpdateFooterAction = (updates) => {
        setScreens(screens.map(s => {
            if (s.id === activeScreenId) {
                const isTerminal = updates.type === 'complete';
                return {
                    ...s,
                    terminal: isTerminal ? true : s.terminal,
                    footerAction: { ...s.footerAction, ...updates }
                };
            }
            return s;
        }));
    };

    // --- Save & Submit ---

    const handleSave = () => {
        if (!validationReport.valid) {
            toast.error(validationReport.errors[0] || 'Please fix validation errors');
            return;
        }
        onSave(screens, flowJsonString);
    };

    const handleImportJson = () => {
        try {
            const parsed = JSON.parse(importJsonText);
            const imported = parseFlowDSL(parsed);
            if (!imported || imported.length === 0) {
                toast.error("Could not parse valid WhatsApp Flow screens from JSON");
                return;
            }
            setScreens(imported);
            setActiveScreenId(imported[0]?.id);
            setIsImportModalOpen(false);
            setImportJsonText('');
            toast.success(`Successfully imported ${imported.length} screens`);
        } catch (e) {
            toast.error(`JSON Parse Error: ${e.message}`);
        }
    };

    // --- Simulator Navigation ---

    const handleSimulatorContinue = (currScreen) => {
        const errors = {};
        (currScreen.children || []).forEach(c => {
            if (c.required) {
                const val = simFormData[c.name];
                if (val === undefined || val === null || (typeof val === 'string' && !val.trim()) || (Array.isArray(val) && val.length === 0)) {
                    errors[c.name] = `${c.label || 'This field'} is required`;
                }
            }
        });

        if (Object.keys(errors).length > 0) {
            setSimErrors(errors);
            toast.error("Please fill in required fields");
            return;
        }

        setSimErrors({});

        const isTerminal = currScreen.terminal || currScreen.footerAction?.type === 'complete';

        if (isTerminal) {
            setSimResultPayload({
                flow_token: "mock_token_" + Date.now(),
                submitted_data: simFormData,
                timestamp: new Date().toISOString()
            });
            setIsSimResultOpen(true);
        } else {
            const targetScreenId = currScreen.footerAction?.screen;
            const next = screens.find(s => s.id === targetScreenId) || screens[screens.indexOf(currScreen) + 1] || screens[0];
            setSimScreenId(next.id);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background border border-border/80 rounded-2xl shadow-xl overflow-hidden animate-in fade-in duration-300">

            {/* 1. MODAL HEADER (Meta Style) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-card">
                <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold text-foreground">Create Flow</h2>
                    <Badge variant="outline" className="text-[10px] font-mono py-0 h-5 border-border bg-muted/30">
                        v{FLOW_VERSION}
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    {/* View mode switcher */}
                    <div className="flex items-center bg-muted/50 p-0.5 rounded-lg border border-border/50 text-xs mr-2">
                        <button
                            onClick={() => setActiveTabMode('builder')}
                            className={`px-3 py-1 rounded-md font-semibold transition-all ${activeTabMode === 'builder' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Builder
                        </button>
                        <button
                            onClick={() => setActiveTabMode('simulator')}
                            className={`px-3 py-1 rounded-md font-semibold transition-all ${activeTabMode === 'simulator' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Test Simulator
                        </button>
                        <button
                            onClick={() => setActiveTabMode('json')}
                            className={`px-3 py-1 rounded-md font-semibold transition-all ${activeTabMode === 'json' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            JSON Code
                        </button>
                    </div>

                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* 2. THREE-COLUMN META FLOW WORKSPACE */}
            {activeTabMode === 'builder' && (
                <div className="flex-1 grid grid-cols-12 overflow-hidden min-h-0 h-full">

                    {/* --- COLUMN 1: SCREENS (~20% width = 3 cols) --- */}
                    <div className="col-span-12 md:col-span-3 lg:col-span-3 min-w-0 min-h-0 h-full border-r border-border/70 bg-card/30 flex flex-col p-4 overflow-hidden">
                        <h3 className="text-sm font-bold text-foreground mb-3 px-1 shrink-0">Screens</h3>

                        <ScrollArea className="flex-1 min-h-0 h-[40vh] pr-1">
                            <div className="space-y-1.5 w-full min-w-0">
                                {screens.map((screen, idx) => {
                                    const isSelected = activeScreenId === screen.id;
                                    const isDragging = draggedScreenIdx === idx;
                                    const isDragOver = dragOverScreenIdx === idx && draggedScreenIdx !== idx;

                                    return (
                                        <div
                                            key={screen.id}
                                            draggable
                                            onDragStart={(e) => {
                                                setDraggedScreenIdx(idx);
                                                e.dataTransfer.effectAllowed = 'move';
                                            }}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                if (dragOverScreenIdx !== idx) setDragOverScreenIdx(idx);
                                            }}
                                            onDragLeave={() => {
                                                if (dragOverScreenIdx === idx) setDragOverScreenIdx(null);
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                handleDropScreen(idx);
                                            }}
                                            onDragEnd={() => {
                                                setDraggedScreenIdx(null);
                                                setDragOverScreenIdx(null);
                                            }}
                                            onClick={() => handleSelectScreen(screen.id)}
                                            className={`group flex items-start justify-between p-2.5 rounded-lg border transition-all cursor-grab active:cursor-grabbing select-none w-full min-w-0 ${isDragging ? 'opacity-30 scale-[0.98] border-dashed border-primary' : ''
                                                } ${isDragOver ? 'border-t-2 border-t-[#1a73e8] bg-primary/10' : ''
                                                } ${isSelected && !isDragging
                                                    ? 'bg-[#e8f0fe] dark:bg-[#1a365d] border-[#1a73e8] text-[#1967d2] dark:text-[#90cdf4] font-bold shadow-xs'
                                                    : !isDragging ? 'bg-card hover:bg-muted/40 border-border/60 text-foreground' : ''
                                                }`}
                                        >
                                            <div className="flex items-start gap-2 min-w-0 flex-1">
                                                <GripVertical className="w-4 h-4 text-muted-foreground/60 shrink-0 group-hover:text-foreground mt-0.5" />
                                                <span className="text-xs break-words whitespace-normal leading-snug min-w-0 flex-1">
                                                    {screen.title || `Screen ${idx + 1}`}
                                                </span>
                                            </div>

                                            {/* Hover Actions */}
                                            <div className="hidden group-hover:flex items-center gap-0.5 shrink-0 ml-1 mt-0.5">
                                                <button
                                                    onClick={(e) => handleMoveScreen(idx, -1, e)}
                                                    disabled={idx === 0}
                                                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20"
                                                    title="Move Up"
                                                >
                                                    <ChevronUp className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleMoveScreen(idx, 1, e)}
                                                    disabled={idx === screens.length - 1}
                                                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20"
                                                    title="Move Down"
                                                >
                                                    <ChevronDown className="w-3 h-3" />
                                                </button>
                                                {screens.length > 1 && (
                                                    <button
                                                        onClick={(e) => handleDeleteScreen(screen.id, e)}
                                                        className="p-1 text-muted-foreground hover:text-destructive"
                                                        title="Delete Screen"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleAddNewScreen}
                                className="flex items-center gap-1.5 text-xs font-semibold text-[#1a73e8] dark:text-[#8ab4f8] hover:underline mt-4 px-2 py-1"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add new
                            </button>
                        </ScrollArea>
                    </div>

                    {/* --- COLUMN 2: EDIT CONTENT (~45% width = 5 cols) --- */}
                    <div className="col-span-12 md:col-span-5 lg:col-span-5 min-w-0 min-h-0 h-full border-r border-border/70 bg-background flex flex-col p-5 overflow-hidden">
                        <h3 className="text-sm font-bold text-foreground mb-3 shrink-0">Edit content</h3>

                        <ScrollArea className="flex-1 min-h-0 h-full pr-2 w-full">
                            <div className="space-y-3 pb-8 w-full min-w-0">

                                {/* 1. Screen Title Accordion Card */}
                                <div className="border border-border/80 rounded-lg bg-card overflow-hidden shadow-2xs w-full min-w-0">
                                    <div
                                        onClick={() => setExpandedSections(prev => ({ ...prev, screen_title: !prev.screen_title }))}
                                        className="flex items-start justify-between px-4 py-3 cursor-pointer select-none bg-card hover:bg-muted/20 gap-2"
                                    >
                                        <div className="flex items-start gap-2 min-w-0 flex-1">
                                            <span className="text-xs font-bold text-foreground shrink-0 mt-0.5">Screen title</span>
                                            <span className="text-xs text-muted-foreground font-normal min-w-0 flex-1 break-words whitespace-normal leading-snug">
                                                · {activeScreen?.title || 'Untitled Screen'}
                                            </span>
                                        </div>
                                        {expandedSections.screen_title ? (
                                            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                        )}
                                    </div>
                                    {expandedSections.screen_title && (
                                        <div className="p-4 pt-1 border-t border-border/50 w-full min-w-0 space-y-1.5">
                                            <Label className="text-xs font-semibold">Title text</Label>
                                            <Input
                                                value={activeScreen?.title || ''}
                                                onChange={(e) => handleUpdateScreenTitle(e.target.value)}
                                                placeholder="Your form title..."
                                                className="h-9 text-xs rounded-lg font-medium border-border w-full"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* 2. Body Component Blocks */}
                                {(activeScreen?.children || []).map((comp, cIdx) => {
                                    const isExpanded = expandedCompIds[comp.id] ?? false;
                                    const titlePreview = comp.label || comp.text || comp.name || comp.type;
                                    const isDragging = draggedCompIdx === cIdx;
                                    const isDragOver = dragOverCompIdx === cIdx && draggedCompIdx !== cIdx;

                                    return (
                                        <div
                                            key={comp.id}
                                            draggable
                                            onDragStart={(e) => {
                                                setDraggedCompIdx(cIdx);
                                                e.dataTransfer.effectAllowed = 'move';
                                            }}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                if (dragOverCompIdx !== cIdx) setDragOverCompIdx(cIdx);
                                            }}
                                            onDragLeave={() => {
                                                if (dragOverCompIdx === cIdx) setDragOverCompIdx(null);
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                handleDropComponent(cIdx);
                                            }}
                                            onDragEnd={() => {
                                                setDraggedCompIdx(null);
                                                setDragOverCompIdx(null);
                                            }}
                                            className={`border rounded-lg bg-card overflow-hidden shadow-2xs transition-all w-full min-w-0 ${isDragging ? 'opacity-30 scale-[0.98] border-dashed border-primary' : 'border-border/80'
                                                } ${isDragOver ? 'border-t-2 border-t-[#1a73e8] bg-primary/5' : ''
                                                }`}
                                        >
                                            <div
                                                onClick={() => toggleComponentExpand(comp.id)}
                                                className="flex items-start justify-between px-3.5 py-3 cursor-pointer select-none hover:bg-muted/20 gap-2 min-w-0 w-full"
                                            >
                                                <div className="flex items-start gap-2 min-w-0 flex-1 cursor-grab active:cursor-grabbing">
                                                    <GripVertical className="w-4 h-4 text-muted-foreground/60 shrink-0 hover:text-foreground mt-0.5" />
                                                    <span className="text-xs font-bold text-foreground shrink-0 mt-0.5">
                                                        {getComponentCategoryLabel(comp.type)}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground font-normal min-w-0 flex-1 break-words whitespace-normal leading-snug">
                                                        · {titlePreview}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0 ml-1 mt-0.5">
                                                    <button
                                                        onClick={(e) => handleMoveComponent(cIdx, -1, e)}
                                                        disabled={cIdx === 0}
                                                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20"
                                                        title="Move Up"
                                                    >
                                                        <ChevronUp className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleMoveComponent(cIdx, 1, e)}
                                                        disabled={cIdx === (activeScreen.children?.length || 0) - 1}
                                                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20"
                                                        title="Move Down"
                                                    >
                                                        <ChevronDown className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteComponent(comp.id, e)}
                                                        className="p-1 text-muted-foreground hover:text-destructive"
                                                        title="Delete Element"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-4 h-4 text-muted-foreground ml-1 shrink-0" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 text-muted-foreground ml-1 shrink-0" />
                                                    )}
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div
                                                    onDragStart={(e) => e.stopPropagation()}
                                                    className="p-4 pt-2 border-t border-border/50 space-y-3 bg-muted/5 w-full min-w-0"
                                                >
                                                    {renderComponentFieldEditor(comp, handleUpdateComponent)}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* 3. Button Action Accordion Card */}
                                <div className="border border-border/80 rounded-lg bg-card overflow-hidden shadow-2xs w-full min-w-0">
                                    <div
                                        onClick={() => setExpandedSections(prev => ({ ...prev, button_action: !prev.button_action }))}
                                        className="flex items-start justify-between px-4 py-3 cursor-pointer select-none hover:bg-muted/20 gap-2 min-w-0 w-full"
                                    >
                                        <div className="flex items-start gap-2 min-w-0 flex-1">
                                            <span className="text-xs font-bold text-foreground shrink-0 mt-0.5">Button</span>
                                            <span className="text-xs text-muted-foreground font-normal min-w-0 flex-1 break-words whitespace-normal leading-snug">
                                                · {activeScreen?.footerAction?.label || 'Continue'}
                                            </span>
                                        </div>
                                        {expandedSections.button_action ? (
                                            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                        )}
                                    </div>
                                    {expandedSections.button_action && (
                                        <div className="p-4 pt-2 border-t border-border/50 space-y-3 w-full min-w-0">
                                            <div className="space-y-1.5 w-full min-w-0">
                                                <Label className="text-xs font-semibold">Button Text</Label>
                                                <Input
                                                    value={activeScreen?.footerAction?.label || 'Continue'}
                                                    onChange={(e) => handleUpdateFooterAction({ label: e.target.value })}
                                                    className="h-9 text-xs w-full"
                                                    placeholder="Button label..."
                                                />
                                            </div>

                                            <div className="space-y-1.5 w-full min-w-0">
                                                <Label className="text-xs font-semibold">Action</Label>
                                                <Select
                                                    value={activeScreen?.terminal ? 'complete' : (activeScreen?.footerAction?.type || 'navigate')}
                                                    onValueChange={(val) => {
                                                        if (val === 'complete') {
                                                            handleUpdateFooterAction({ type: 'complete' });
                                                        } else {
                                                            handleUpdateFooterAction({ type: 'navigate' });
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className="h-9 text-xs w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="navigate">Navigate to screen</SelectItem>
                                                        <SelectItem value="complete">Complete flow (Submit)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {activeScreen?.footerAction?.type === 'navigate' && !activeScreen?.terminal && (
                                                <div className="space-y-1.5 w-full min-w-0">
                                                    <Label className="text-xs font-semibold">Destination Screen</Label>
                                                    <Select
                                                        value={activeScreen?.footerAction?.screen || ''}
                                                        onValueChange={(val) => handleUpdateFooterAction({ screen: val })}
                                                    >
                                                        <SelectTrigger className="h-9 text-xs w-full">
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
                                    )}
                                </div>

                                {/* 4. + Add content Flyout Dropdown Menu (Exact Meta WhatsApp Style) */}
                                <div className="pt-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-muted/40  text-foreground font-semibold text-xs border-border/80 gap-1.5 px-3.5 h-9 rounded-lg shadow-2xs"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add content
                                                <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-70" />
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent align="start" className="w-56 p-1.5 shadow-xl border-border/80 rounded-lg">
                                            {/* Aa Text Submenu */}
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger className="text-xs py-2 px-2.5 font-medium gap-2 cursor-pointer">
                                                    <span className="font-bold text-muted-foreground w-4">Aa</span>
                                                    <span>Text</span>
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent className="w-48 p-1.5 shadow-xl rounded-lg">
                                                    <DropdownMenuItem onClick={() => handleAddContent('TextHeading')} className="text-xs py-2 cursor-pointer font-medium">
                                                        Heading
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAddContent('TextSubheading')} className="text-xs py-2 cursor-pointer font-medium">
                                                        Subheading
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAddContent('TextBody')} className="text-xs py-2 cursor-pointer font-medium">
                                                        Body text
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAddContent('TextCaption')} className="text-xs py-2 cursor-pointer font-medium">
                                                        Caption text
                                                    </DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuSub>

                                            {/* Media Submenu */}
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger className="text-xs py-2 px-2.5 font-medium gap-2 cursor-pointer">
                                                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                                    <span>Media</span>
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent className="w-48 p-1.5 shadow-xl rounded-lg">
                                                    <DropdownMenuItem onClick={() => handleAddContent('Image')} className="text-xs py-2 cursor-pointer font-medium">
                                                        Image Banner
                                                    </DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuSub>

                                            {/* Text Answer Submenu */}
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger className="text-xs py-2 px-2.5 font-medium gap-2 cursor-pointer">
                                                    <span className="font-mono text-muted-foreground w-4 text-[13px]">⌨</span>
                                                    <span>Text Answer</span>
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent className="w-48 p-1.5 shadow-xl rounded-lg">
                                                    <DropdownMenuItem onClick={() => handleAddContent('TextInput', { label: 'Short text', placeholder: 'Enter text...', inputType: 'text' })} className="text-xs py-2 cursor-pointer font-medium">
                                                        Short text
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAddContent('TextInput', { label: 'Email address', placeholder: 'name@example.com', inputType: 'email' })} className="text-xs py-2 cursor-pointer font-medium">
                                                        Email address
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAddContent('TextInput', { label: 'Phone number', placeholder: '+1 234 567 8900', inputType: 'phone' })} className="text-xs py-2 cursor-pointer font-medium">
                                                        Phone number
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAddContent('TextInput', { label: 'Number', placeholder: '0', inputType: 'number' })} className="text-xs py-2 cursor-pointer font-medium">
                                                        Number
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAddContent('TextArea')} className="text-xs py-2 cursor-pointer font-medium">
                                                        Paragraph / Text Area
                                                    </DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuSub>

                                            {/* Selection Submenu */}
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger className="text-xs py-2 px-2.5 font-medium gap-2 cursor-pointer">
                                                    <List className="w-4 h-4 text-muted-foreground" />
                                                    <span>Selection</span>
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent className="w-52 p-1.5 shadow-xl rounded-lg">
                                                    <DropdownMenuItem onClick={() => handleAddContent('Select')} className="text-xs py-2 cursor-pointer font-medium">
                                                        Dropdown list
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAddContent('RadioButtons')} className="text-xs py-2 cursor-pointer font-medium">
                                                        Radio buttons (Single Choice)
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAddContent('CheckboxGroup')} className="text-xs py-2 cursor-pointer font-medium">
                                                        Checkbox group (Multiple Choice)
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAddContent('DatePicker')} className="text-xs py-2 cursor-pointer font-medium">
                                                        Date picker
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAddContent('ConsentCheckbox')} className="text-xs py-2 cursor-pointer font-medium">
                                                        Opt-in / Terms checkbox
                                                    </DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuSub>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>

                    {/* --- COLUMN 3: PREVIEW (~35% width = 4 cols) --- */}
                    <div className="col-span-12 md:col-span-4 lg:col-span-4 min-w-0 min-h-0 h-full bg-muted/10 flex flex-col p-5 overflow-hidden">
                        <div className="flex items-center justify-between mb-3 px-1 shrink-0">
                            <h3 className="text-sm font-bold text-foreground">Preview</h3>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg border-border/80">
                                        <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 text-xs">
                                    <DropdownMenuItem onClick={() => setActiveTabMode('simulator')} className="cursor-pointer gap-2">
                                        <Play className="w-3.5 h-3.5 text-emerald-500" /> Test Live Form
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setActiveTabMode('json')} className="cursor-pointer gap-2">
                                        <FileCode className="w-3.5 h-3.5" /> View Flow JSON
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setIsImportModalOpen(true)} className="cursor-pointer gap-2">
                                        <Upload className="w-3.5 h-3.5" /> Import JSON
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* WhatsApp Mobile Mockup Card (Meta Style) */}
                        <div className="flex-1 flex flex-col items-center min-h-0 w-full overflow-hidden">
                            <div className="w-full max-w-[340px] flex-1 min-h-0 bg-card border border-border/80 rounded-2xl shadow-lg overflow-hidden flex flex-col transition-all">

                                {/* WhatsApp Header Green Pill Top */}
                                <div className="h-2 bg-[#008069] dark:bg-[#1f2c34] w-full shrink-0" />

                                {/* Flow Nav Bar inside phone */}
                                <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between bg-card shrink-0">
                                    <X className="w-4 h-4 text-muted-foreground cursor-pointer" />
                                    <span className="text-xs font-bold text-foreground truncate max-w-[220px]">
                                        {activeScreen?.title || 'Your form'}
                                    </span>
                                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                </div>

                                {/* Flow Body Live Rendering */}
                                <ScrollArea className="flex-1 min-h-0 bg-background/50">
                                    <div className="p-4 space-y-4">
                                        {(!activeScreen?.children || activeScreen.children.length === 0) ? (
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Select 'Add content' to start building your form. To add new screens, select 'Add new' in the 'Screens' panel.
                                            </p>
                                        ) : (
                                            activeScreen.children.map((c) => (
                                                <div
                                                    key={c.id}
                                                    onClick={() => {
                                                        setExpandedCompIds(prev => ({ ...prev, [c.id]: true }));
                                                    }}
                                                    className="cursor-pointer hover:ring-1 hover:ring-primary/40 rounded-lg p-1 transition-all"
                                                >
                                                    {renderPreviewComponent(c)}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>

                                {/* CTA Button & Managed Note */}
                                <div className="p-4 pt-2.5 border-t border-border/40 bg-card space-y-2 mt-auto shrink-0">
                                    <button className="w-full h-10 rounded-full bg-[#1da851] hover:bg-[#189647] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer">
                                        {activeScreen?.footerAction?.label || (activeScreen?.terminal ? 'Finish' : 'Continue')}
                                    </button>
                                    <p className="text-[10px] text-center text-muted-foreground/80 font-normal">
                                        Managed by the business. <span className="text-[#1a73e8] underline cursor-pointer">Learn more</span>
                                    </p>
                                </div>
                            </div>

                            <p className="text-[11px] text-muted-foreground text-center mt-2 shrink-0 flex items-center justify-center gap-1">
                                <span>Rendering and interaction varies based on device.</span>
                                <Info className="w-3.5 h-3.5" />
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SIMULATOR TEST MODE --- */}
            {activeTabMode === 'simulator' && (
                <div className="flex-1 bg-muted/20 flex flex-col items-center justify-center p-6 min-h-0 overflow-hidden">
                    {(() => {
                        const simScreen = screens.find(s => s.id === simScreenId) || screens[0];
                        const isTerminal = simScreen.terminal || simScreen.footerAction?.type === 'complete';

                        return (
                            <div className="w-full max-w-[360px] max-h-full bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-0">
                                <div className="h-2 bg-[#008069] w-full shrink-0" />
                                <div className="px-4 py-3 border-b flex items-center justify-between bg-card shrink-0">
                                    <button
                                        onClick={() => {
                                            const idx = screens.findIndex(s => s.id === simScreenId);
                                            if (idx > 0) setSimScreenId(screens[idx - 1].id);
                                        }}
                                        disabled={screens.findIndex(s => s.id === simScreenId) === 0}
                                        className="text-xs text-muted-foreground disabled:opacity-30 hover:text-foreground"
                                    >
                                        Back
                                    </button>
                                    <span className="text-xs font-bold text-foreground truncate max-w-[200px]">{simScreen.title}</span>
                                    <button
                                        onClick={() => {
                                            setSimScreenId(screens[0]?.id);
                                            setSimFormData({});
                                            setSimErrors({});
                                        }}
                                        className="text-[10px] text-muted-foreground hover:text-foreground"
                                    >
                                        Reset
                                    </button>
                                </div>

                                <ScrollArea className="flex-1 min-h-0 max-h-[500px]">
                                    <div className="p-5 space-y-4">
                                        {simScreen.children?.map(c => (
                                            <div key={c.id}>
                                                {renderInteractiveField(c, simFormData, setSimFormData, simErrors)}
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>

                                <div className="p-4 border-t bg-card shrink-0">
                                    <Button
                                        className="w-full h-10 rounded-full bg-[#1da851] hover:bg-[#189647] text-white font-bold text-xs shadow-sm cursor-pointer"
                                        onClick={() => handleSimulatorContinue(simScreen)}
                                    >
                                        {simScreen.footerAction?.label || (isTerminal ? 'Submit Form' : 'Continue')}
                                    </Button>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* --- JSON CODE TAB --- */}
            {activeTabMode === 'json' && (
                <div className="flex-1 flex flex-col bg-[#1e1e1e] text-gray-200 overflow-hidden">
                    <div className="p-3 bg-[#2d2d2d] border-b border-[#404040] flex items-center justify-between px-6">
                        <span className="text-xs font-mono text-gray-300">flow.json (Meta Flows Schema v{FLOW_VERSION})</span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    navigator.clipboard.writeText(flowJsonString);
                                    toast.success("JSON copied to clipboard");
                                }}
                                className="h-7 text-xs text-gray-300 hover:text-white"
                            >
                                <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    const blob = new Blob([flowJsonString], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `flow_${Date.now()}.json`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                                className="h-7 text-xs text-gray-300 hover:text-white"
                            >
                                <Download className="w-3.5 h-3.5 mr-1" /> Download
                            </Button>
                        </div>
                    </div>
                    <ScrollArea className="flex-1 p-6">
                        <pre className="text-xs font-mono text-blue-300 leading-relaxed">
                            {flowJsonString}
                        </pre>
                    </ScrollArea>
                </div>
            )}

            {/* 3. MODAL FOOTER (Exact Meta Style) */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3.5 border-t border-border/80 bg-card gap-3">
                <p className="text-xs text-muted-foreground">
                    Once your Message Template is created, this Flow cannot be edited.
                </p>

                <div className="flex items-center gap-2">
                    {onCancel && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCancel}
                            className="h-9 px-4 text-xs font-semibold rounded-lg border-border"
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        size="sm"
                        onClick={handleSave}
                        className="h-9 px-5 text-xs font-bold rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-xs"
                    >
                        Save
                    </Button>
                </div>
            </div>

            {/* Import JSON Modal */}
            <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                <DialogContent className="sm:max-w-[540px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold">Import Meta Flow JSON</DialogTitle>
                        <DialogDescription className="text-xs">
                            Paste valid WhatsApp Flow JSON to load screens and components directly.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={importJsonText}
                        onChange={(e) => setImportJsonText(e.target.value)}
                        placeholder='{\n  "version": "7.3",\n  "screens": [...]\n}'
                        className="min-h-[260px] font-mono text-xs"
                    />
                    <DialogFooter>
                        <Button variant="ghost" size="sm" onClick={() => setIsImportModalOpen(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleImportJson}>Import</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Simulator Output Modal */}
            <Dialog open={isSimResultOpen} onOpenChange={setIsSimResultOpen}>
                <DialogContent className="sm:max-w-[480px] rounded-2xl text-center">
                    <div className="py-3 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold">Flow Completed!</h3>
                        <p className="text-xs text-muted-foreground">Response payload received from user submission:</p>
                        <ScrollArea className="max-h-[220px] rounded-lg border bg-muted/60 text-left p-3">
                            <pre className="text-[11px] font-mono whitespace-pre-wrap break-all">
                                {JSON.stringify(simResultPayload, null, 2)}
                            </pre>
                        </ScrollArea>
                    </div>
                    <DialogFooter className="sm:justify-center">
                        <Button size="sm" onClick={() => setIsSimResultOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}

// --- Component Category Label Helper ---
function getComponentCategoryLabel(type) {
    switch (type) {
        case 'TextHeading': return 'Heading';
        case 'TextSubheading': return 'Subheading';
        case 'TextBody': return 'Body';
        case 'TextCaption': return 'Caption';
        case 'Image': return 'Image';
        case 'TextInput': return 'Text Answer';
        case 'TextArea': return 'Paragraph';
        case 'Select': return 'Dropdown';
        case 'RadioButtons': return 'Radio buttons';
        case 'CheckboxGroup': return 'Checkboxes';
        case 'DatePicker': return 'Date picker';
        case 'ConsentCheckbox': return 'Opt-in';
        default: return 'Content';
    }
}

// --- Component Property Editor in Column 2 ---
function renderComponentFieldEditor(comp, onUpdate) {
    if (['TextHeading', 'TextSubheading', 'TextBody', 'TextCaption'].includes(comp.type)) {
        return (
            <div className="space-y-1.5 w-full min-w-0">
                <Label className="text-xs font-semibold">Text content</Label>
                <Textarea
                    rows={5}
                    value={comp.text || ''}
                    onChange={(e) => onUpdate(comp.id, { text: e.target.value })}
                    className="text-xs font-normal w-full resize-y break-words whitespace-pre-wrap leading-relaxed border-border/80"
                    placeholder="Enter text..."
                />
            </div>
        );
    }

    if (comp.type === 'Image') {
        return (
            <div className="space-y-2 w-full min-w-0">
                <div className="space-y-1 w-full min-w-0">
                    <Label className="text-xs font-semibold">Image URL</Label>
                    <Input
                        value={comp.src || ''}
                        onChange={(e) => onUpdate(comp.id, { src: e.target.value })}
                        className="h-8 text-xs font-mono w-full"
                        placeholder="https://..."
                    />
                </div>
                <div className="space-y-1 w-full min-w-0">
                    <Label className="text-xs font-semibold">Alt Text</Label>
                    <Input
                        value={comp.altText || ''}
                        onChange={(e) => onUpdate(comp.id, { altText: e.target.value })}
                        className="h-8 text-xs w-full"
                        placeholder="Image description"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 w-full min-w-0">
            <div className="space-y-1 w-full min-w-0">
                <Label className="text-xs font-semibold">Label</Label>
                <Input
                    value={comp.label || ''}
                    onChange={(e) => {
                        const newLabel = e.target.value;
                        const derivedName = sanitizeIdentifier(newLabel, 'field', false);
                        onUpdate(comp.id, {
                            label: newLabel,
                            name: derivedName
                        });
                    }}
                    className="h-9 text-xs font-medium w-full"
                    placeholder="Field label..."
                />
            </div>

            <div className="space-y-1 w-full min-w-0">
                <Label className="text-xs font-semibold">System Name (Payload Key)</Label>
                <Input
                    value={comp.name || ''}
                    onChange={(e) => onUpdate(comp.id, { name: sanitizeIdentifier(e.target.value, 'field', false) })}
                    className="h-8 text-xs font-mono w-full"
                    placeholder="e.g. user_name"
                />
            </div>

            {comp.type === 'TextInput' && (
                <div className="space-y-1 w-full min-w-0">
                    <Label className="text-xs font-semibold">Input Type</Label>
                    <Select
                        value={comp.inputType || 'text'}
                        onValueChange={(val) => onUpdate(comp.id, { inputType: val })}
                    >
                        <SelectTrigger className="h-8 text-xs w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="text">Short text</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Phone number</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="password">Password</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {comp.placeholder !== undefined && (
                <div className="space-y-1 w-full min-w-0">
                    <Label className="text-xs font-semibold">Placeholder Text</Label>
                    <Input
                        value={comp.placeholder || ''}
                        onChange={(e) => onUpdate(comp.id, { placeholder: e.target.value })}
                        className="h-8 text-xs w-full"
                        placeholder="Placeholder text..."
                    />
                </div>
            )}

            {/* Options manager for choices */}
            {['Select', 'RadioButtons', 'CheckboxGroup'].includes(comp.type) && (
                <div className="space-y-2 pt-1 border-t w-full min-w-0">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold">Options</Label>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[11px] text-[#1a73e8] font-bold p-0"
                            onClick={() => {
                                const current = comp.options || [];
                                const count = current.length + 1;
                                onUpdate(comp.id, {
                                    options: [...current, { label: `Option ${count}`, value: `opt_${count}`, description: '' }]
                                });
                            }}
                        >
                            + Add option
                        </Button>
                    </div>

                    <ScrollArea className="max-h-64 w-full pr-1">
                        <div className="space-y-2 w-full min-w-0 pr-1">
                            {(comp.options || []).map((opt, i) => (
                                <div key={i} className="flex items-center gap-1.5 p-1.5 bg-card border rounded-lg w-full min-w-0">
                                    <Input
                                        value={opt.label || ''}
                                        onChange={(e) => {
                                            const newOptLabel = e.target.value;
                                            const opts = [...comp.options];
                                            opts[i] = {
                                                ...opts[i],
                                                label: newOptLabel,
                                                value: sanitizeIdentifier(newOptLabel, `opt_${i + 1}`, false)
                                            };
                                            onUpdate(comp.id, { options: opts });
                                        }}
                                        className="h-8 text-xs flex-1 min-w-0"
                                        placeholder="Option Title"
                                    />
                                    <Input
                                        value={opt.value || ''}
                                        onChange={(e) => {
                                            const opts = [...comp.options];
                                            opts[i].value = sanitizeIdentifier(e.target.value, 'opt', false);
                                            onUpdate(comp.id, { options: opts });
                                        }}
                                        className="h-8 text-[10px] font-mono w-24 shrink-0"
                                        placeholder="Value"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive shrink-0"
                                        onClick={() => {
                                            const opts = comp.options.filter((_, idx) => idx !== i);
                                            onUpdate(comp.id, { options: opts });
                                        }}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}

            {comp.required !== undefined && (
                <div className="flex items-center gap-2 pt-1 w-full min-w-0">
                    <input
                        type="checkbox"
                        id={`req_${comp.id}`}
                        checked={Boolean(comp.required)}
                        onChange={(e) => onUpdate(comp.id, { required: e.target.checked })}
                        className="rounded border-border text-primary h-3.5 w-3.5"
                    />
                    <Label htmlFor={`req_${comp.id}`} className="text-xs font-medium cursor-pointer">
                        Required
                    </Label>
                </div>
            )}
        </div>
    );
}

// --- Preview Component Rendering in Column 3 ---
function renderPreviewComponent(c) {
    switch (c.type) {
        case 'TextHeading':
            return <h3 className="text-sm font-bold text-foreground break-words whitespace-pre-wrap leading-snug">{c.text || 'Heading'}</h3>;
        case 'TextSubheading':
            return <h4 className="text-xs font-semibold text-foreground break-words whitespace-pre-wrap leading-snug">{c.text || 'Subheading'}</h4>;
        case 'TextBody':
            return <p className="text-xs text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">{c.text || 'Body text content'}</p>;
        case 'TextCaption':
            return <p className="text-[11px] text-muted-foreground italic break-words whitespace-pre-wrap">{c.text || 'Caption'}</p>;
        case 'Image':
            return (
                <div className="rounded-lg overflow-hidden border border-border/40 w-full">
                    <img src={c.src || 'https://via.placeholder.com/600x300.png'} alt={c.altText || 'Image'} className="w-full h-28 object-cover" />
                </div>
            );
        case 'TextInput':
            return (
                <div className="space-y-1 w-full min-w-0">
                    <div className="flex items-start justify-between text-xs font-semibold text-foreground gap-1">
                        <span className="break-words whitespace-normal leading-snug">{c.label || 'Text Field'} {c.required && <span className="text-destructive">*</span>}</span>
                    </div>
                    <div className="h-9 border border-border/80 rounded-lg bg-card px-3 flex items-center text-xs text-muted-foreground/60 overflow-hidden truncate">
                        {c.placeholder || 'Type here...'}
                    </div>
                </div>
            );
        case 'TextArea':
            return (
                <div className="space-y-1 w-full min-w-0">
                    <div className="text-xs font-semibold text-foreground">
                        <span className="break-words whitespace-normal leading-snug">{c.label || 'Paragraph'} {c.required && <span className="text-destructive">*</span>}</span>
                    </div>
                    <div className="h-16 border border-border/80 rounded-lg bg-card p-2 text-xs text-muted-foreground/60 overflow-hidden break-words whitespace-pre-wrap">
                        {c.placeholder || 'Type message...'}
                    </div>
                </div>
            );
        case 'Select':
            return (
                <div className="space-y-1 w-full min-w-0">
                    <div className="text-xs font-semibold text-foreground">
                        <span className="break-words whitespace-normal leading-snug">{c.label || 'Select'} {c.required && <span className="text-destructive">*</span>}</span>
                    </div>
                    <div className="h-9 border border-border/80 rounded-lg bg-card px-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="truncate">{c.options?.[0]?.label || 'Select option...'}</span>
                        <ChevronDown className="w-4 h-4 shrink-0" />
                    </div>
                </div>
            );
        case 'RadioButtons':
            return (
                <div className="space-y-1.5 w-full min-w-0">
                    <div className="text-xs font-semibold text-foreground">
                        <span className="break-words whitespace-normal leading-snug">{c.label || 'Choose one'} {c.required && <span className="text-destructive">*</span>}</span>
                    </div>
                    <div className="space-y-1 w-full min-w-0">
                        {(c.options || [{ label: 'Option 1' }]).map((opt, i) => (
                            <div key={i} className="flex items-start gap-2 p-1.5 text-xs text-foreground">
                                <div className={`w-3.5 h-3.5 rounded-full border shrink-0 mt-0.5 ${i === 0 ? 'border-[#1da851] bg-[#1da851]' : 'border-muted-foreground/60'}`} />
                                <span className="break-words whitespace-normal leading-snug">{opt.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'CheckboxGroup':
            return (
                <div className="space-y-1.5 w-full min-w-0">
                    <div className="text-xs font-semibold text-foreground">
                        <span className="break-words whitespace-normal leading-snug">{c.label || 'Choose multiple'} {c.required && <span className="text-destructive">*</span>}</span>
                    </div>
                    <div className="space-y-1 w-full min-w-0">
                        {(c.options || [{ label: 'Option 1' }]).map((opt, i) => (
                            <div key={i} className="flex items-start gap-2 p-1.5 text-xs text-foreground">
                                <div className={`w-3.5 h-3.5 rounded border shrink-0 mt-0.5 ${i === 0 ? 'border-[#1da851] bg-[#1da851] text-white' : 'border-muted-foreground/60'} flex items-center justify-center`}>
                                    {i === 0 && <Check className="w-2.5 h-2.5" />}
                                </div>
                                <span className="break-words whitespace-normal leading-snug">{opt.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'DatePicker':
            return (
                <div className="space-y-1 w-full min-w-0">
                    <div className="text-xs font-semibold text-foreground">
                        <span className="break-words whitespace-normal leading-snug">{c.label || 'Date'} {c.required && <span className="text-destructive">*</span>}</span>
                    </div>
                    <div className="h-9 border border-border/80 rounded-lg bg-card px-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Select date...</span>
                        <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                </div>
            );
        case 'ConsentCheckbox':
            return (
                <div className="flex items-start gap-2 pt-1 text-xs w-full min-w-0">
                    <div className="w-3.5 h-3.5 rounded border border-[#1da851] bg-[#1da851] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-foreground/90 font-medium break-words whitespace-normal leading-snug">{c.label}</span>
                </div>
            );
        default:
            return <div className="text-xs break-words">{c.label || c.type}</div>;
    }
}

// --- Interactive Field in Test Simulator ---
function renderInteractiveField(c, formData, setFormData, errors) {
    const val = formData[c.name];
    const err = errors[c.name];

    switch (c.type) {
        case 'TextHeading': return <h3 className="text-sm font-bold text-foreground break-words whitespace-pre-wrap">{c.text}</h3>;
        case 'TextSubheading': return <h4 className="text-xs font-semibold text-foreground break-words whitespace-pre-wrap">{c.text}</h4>;
        case 'TextBody': return <p className="text-xs text-muted-foreground break-words whitespace-pre-wrap leading-relaxed">{c.text}</p>;
        case 'TextCaption': return <p className="text-[11px] text-muted-foreground italic break-words whitespace-pre-wrap">{c.text}</p>;
        case 'TextInput':
            return (
                <div className="space-y-1 w-full min-w-0">
                    <Label className="text-xs font-semibold break-words whitespace-normal leading-snug">{c.label} {c.required && <span className="text-destructive">*</span>}</Label>
                    <Input
                        type={c.inputType || 'text'}
                        value={val || ''}
                        onChange={(e) => setFormData({ ...formData, [c.name]: e.target.value })}
                        placeholder={c.placeholder || 'Type here...'}
                        className={`h-9 text-xs rounded-lg ${err ? 'border-destructive' : ''}`}
                    />
                    {err && <p className="text-[10px] text-destructive font-semibold">{err}</p>}
                </div>
            );
        case 'TextArea':
            return (
                <div className="space-y-1 w-full min-w-0">
                    <Label className="text-xs font-semibold break-words whitespace-normal leading-snug">{c.label} {c.required && <span className="text-destructive">*</span>}</Label>
                    <Textarea
                        value={val || ''}
                        onChange={(e) => setFormData({ ...formData, [c.name]: e.target.value })}
                        placeholder={c.placeholder || 'Type message...'}
                        className={`min-h-[70px] text-xs rounded-lg break-words whitespace-pre-wrap ${err ? 'border-destructive' : ''}`}
                    />
                    {err && <p className="text-[10px] text-destructive font-semibold">{err}</p>}
                </div>
            );
        case 'Select':
            return (
                <div className="space-y-1 w-full min-w-0">
                    <Label className="text-xs font-semibold break-words whitespace-normal leading-snug">{c.label} {c.required && <span className="text-destructive">*</span>}</Label>
                    <Select value={val || ''} onValueChange={(v) => setFormData({ ...formData, [c.name]: v })}>
                        <SelectTrigger className={`h-9 text-xs rounded-lg ${err ? 'border-destructive' : ''}`}>
                            <SelectValue placeholder="Select option..." />
                        </SelectTrigger>
                        <SelectContent>
                            {(c.options || []).map(opt => (
                                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {err && <p className="text-[10px] text-destructive font-semibold">{err}</p>}
                </div>
            );
        case 'RadioButtons':
            return (
                <div className="space-y-1.5 w-full min-w-0">
                    <Label className="text-xs font-semibold break-words whitespace-normal leading-snug">{c.label} {c.required && <span className="text-destructive">*</span>}</Label>
                    <div className="space-y-1 w-full min-w-0">
                        {(c.options || []).map(opt => (
                            <div
                                key={opt.value}
                                onClick={() => setFormData({ ...formData, [c.name]: opt.value })}
                                className="flex items-start gap-2 p-1.5 text-xs rounded-lg hover:bg-muted/40 cursor-pointer"
                            >
                                <div className={`w-3.5 h-3.5 rounded-full border shrink-0 mt-0.5 ${val === opt.value ? 'border-[#1da851] bg-[#1da851]' : 'border-muted-foreground/60'}`} />
                                <span className="break-words whitespace-normal leading-snug">{opt.label}</span>
                            </div>
                        ))}
                    </div>
                    {err && <p className="text-[10px] text-destructive font-semibold">{err}</p>}
                </div>
            );
        case 'CheckboxGroup': {
            const currentSelected = Array.isArray(val) ? val : [];
            return (
                <div className="space-y-1.5 w-full min-w-0">
                    <Label className="text-xs font-semibold break-words whitespace-normal leading-snug">{c.label} {c.required && <span className="text-destructive">*</span>}</Label>
                    <div className="space-y-1 w-full min-w-0">
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
                                    className="flex items-start gap-2 p-1.5 text-xs rounded-lg hover:bg-muted/40 cursor-pointer"
                                >
                                    <div className={`w-3.5 h-3.5 rounded border shrink-0 mt-0.5 ${isChecked ? 'border-[#1da851] bg-[#1da851] text-white' : 'border-muted-foreground/60'} flex items-center justify-center`}>
                                        {isChecked && <Check className="w-2.5 h-2.5" />}
                                    </div>
                                    <span className="break-words whitespace-normal leading-snug">{opt.label}</span>
                                </div>
                            );
                        })}
                    </div>
                    {err && <p className="text-[10px] text-destructive font-semibold">{err}</p>}
                </div>
            );
        }
        case 'DatePicker':
            return (
                <div className="space-y-1">
                    <Label className="text-xs font-semibold">{c.label} {c.required && <span className="text-destructive">*</span>}</Label>
                    <Input
                        type="date"
                        value={val || ''}
                        onChange={(e) => setFormData({ ...formData, [c.name]: e.target.value })}
                        className={`h-9 text-xs rounded-lg ${err ? 'border-destructive' : ''}`}
                    />
                    {err && <p className="text-[10px] text-destructive font-semibold">{err}</p>}
                </div>
            );
        case 'ConsentCheckbox':
            return (
                <div
                    onClick={() => setFormData({ ...formData, [c.name]: !val })}
                    className="flex items-start gap-2 pt-1 text-xs cursor-pointer select-none"
                >
                    <div className={`w-3.5 h-3.5 rounded border ${val ? 'border-[#1da851] bg-[#1da851] text-white' : 'border-muted-foreground/60'} flex items-center justify-center shrink-0 mt-0.5`}>
                        {val && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span className="font-medium text-foreground">{c.label} {c.required && <span className="text-destructive">*</span>}</span>
                </div>
            );
        default:
            return null;
    }
}
