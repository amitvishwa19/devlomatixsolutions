'use client';

import React, { useState, useEffect } from 'react';
import {
    Layout as LayoutIcon,
    Plus,
    Trash2,
    Settings,
    Play,
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
    ExternalLink,
    X,
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
import { toast } from 'sonner';
import { generateFlowDSL } from "../_lib/flow-utils";

const COMPONENT_TYPES = [
    { id: 'TextHeading', label: 'Heading', icon: Type, default: { text: 'New Heading' } },
    { id: 'TextBody', label: 'Body Text', icon: Type, default: { text: 'Body text content' } },
    { id: 'TextCaption', label: 'Caption', icon: Type, default: { text: 'Small caption text' } },
    { id: 'TextInput', label: 'Text Input', icon: ArrowRight, default: { label: 'Label', name: 'input_1', required: true, placeholder: '' } },
    { id: 'Select', label: 'Dropdown', icon: List, default: { label: 'Select Option', name: 'select_1', options: [{ label: 'Option 1', value: 'opt1' }] } },
    { id: 'RadioButtons', label: 'Radio Buttons', icon: CircleDot, default: { label: 'Choose One', name: 'radio_1', options: [{ label: 'Option 1', value: 'opt1' }] } },
    { id: 'CheckboxGroup', label: 'Checkboxes', icon: CheckSquare, default: { label: 'Choose Multiple', name: 'check_1', options: [{ label: 'Option 1', value: 'opt1' }] } },
    { id: 'DatePicker', label: 'Date Picker', icon: Calendar, default: { label: 'Select Date', name: 'date_1', required: true } },
    { id: 'TimePicker', label: 'Time Picker', icon: Clock, default: { label: 'Select Time', name: 'time_1', required: true } },
    { id: 'FileInput', label: 'File Upload', icon: FileIcon, default: { label: 'Upload File', name: 'file_1', required: false, accept: '*/*', multiple: false } },
    { id: 'LocationPicker', label: 'Location', icon: MapPin, default: { label: 'Pick Location', name: 'location_1', required: true } },
    { id: 'ConsentCheckbox', label: 'Consent', icon: Check, default: { label: 'I agree to the terms', name: 'consent_1', required: true } },
    { id: 'APIAction', label: 'API Action', icon: Database, default: { label: 'Submit Data', name: 'api_1', dataSourceUrl: '', requestBody: '{}', responseKey: 'result' } },
    { id: 'DataGrid', label: 'Data Table', icon: Code, default: { label: 'Data', name: 'grid_1', columns: [{ key: 'col1', label: 'Column 1', type: 'text' }] } },
];

const ACTION_TYPES = [
    { id: 'navigate', label: 'Navigate to Screen' },
    { id: 'complete', label: 'Complete Flow' },
    { id: 'data_exchange', label: 'Data Exchange (API)' },
    { id: 'open_url', label: 'Open URL' },
    { id: 'close', label: 'Close Flow' },
];

const FlowBuilder = ({ initialScreens = [], onSave, endpointUrl = '' }) => {
    const [screens, setScreens] = useState(initialScreens.length > 0 ? initialScreens : [
        { id: 'SCREEN_1', title: 'Welcome', children: [], footerAction: { type: 'navigate', label: 'Next', screen: 'SCREEN_2' } }
    ]);
    const [activeScreenId, setActiveScreenId] = useState(screens[0]?.id);
    const [selectedComponentId, setSelectedComponentId] = useState(null);
    const [viewMode, setViewMode] = useState('design');
    const [activeSidebarTab, setActiveSidebarTab] = useState('library');

    const activeScreen = screens.find(s => s.id === activeScreenId);
    const selectedComponent = activeScreen?.children.find(c => c.id === selectedComponentId);

    useEffect(() => {
        setSelectedComponentId(null);
    }, [activeScreenId]);

    const addScreen = () => {
        const idx = screens.length + 1;
        const newId = `SCREEN_${idx}`;
        const nextId = `SCREEN_${idx + 1}`;
        setScreens([...screens, {
            id: newId,
            title: `New Screen ${idx}`,
            children: [],
            footerAction: { type: 'navigate', label: 'Next', screen: nextId }
        }]);
        setActiveScreenId(newId);
    };

    const removeScreen = (id) => {
        if (screens.length <= 1) { toast.error('Need at least one screen'); return; }
        const filtered = screens.filter(s => s.id !== id);
        setScreens(filtered);
        if (activeScreenId === id) setActiveScreenId(filtered[0]?.id);
    };

    const addComponent = (type) => {
        if (!activeScreenId) return;
        const compInfo = COMPONENT_TYPES.find(c => c.id === type);
        const newComp = {
            id: `comp_${Math.random().toString(36).substr(2, 9)}`,
            type,
            ...JSON.parse(JSON.stringify(compInfo.default))
        };
        setScreens(screens.map(s => s.id === activeScreenId ? { ...s, children: [...s.children, newComp] } : s));
        setSelectedComponentId(newComp.id);
        setActiveSidebarTab('inspector');
    };

    const updateComponent = (compId, updates) => {
        setScreens(screens.map(s => {
            if (s.id === activeScreenId) {
                return { ...s, children: s.children.map(c => c.id === compId ? { ...c, ...updates } : c) };
            }
            return s;
        }));
    };

    const deleteComponent = (compId) => {
        setScreens(screens.map(s => {
            if (s.id === activeScreenId) {
                return { ...s, children: s.children.filter(c => c.id !== compId) };
            }
            return s;
        }));
        if (selectedComponentId === compId) setSelectedComponentId(null);
    };

    const updateFooterAction = (updates) => {
        setScreens(screens.map(s => s.id === activeScreenId ? { ...s, footerAction: { ...s.footerAction, ...updates } } : s));
    };

    const updateScreenTitle = (title) => {
        setScreens(screens.map(s => s.id === activeScreenId ? { ...s, title } : s));
    };

    const generateFlowJson = () => {
        const flow = generateFlowDSL(screens, { endpointUrl });
        return JSON.stringify(flow, null, 4);
    };

    const renderComponentPreview = (c) => {
        switch (c.type) {
            case 'TextHeading':
                return <p className="text-base font-bold pointer-events-none">{c.text}</p>;
            case 'TextBody':
                return <p className="text-sm text-muted-foreground pointer-events-none">{c.text}</p>;
            case 'TextCaption':
                return <p className="text-xs text-muted-foreground/60 italic pointer-events-none">{c.text}</p>;
            case 'Select':
                return (
                    <div className="space-y-2 pointer-events-none">
                        <Label className="text-xs font-bold text-primary/80">{c.label} {c.required && '*'}</Label>
                        <div className="h-10 border border-dashed rounded-lg bg-card/50 flex items-center px-3 text-[11px] text-muted-foreground italic">
                            {c.options?.length || 0} option(s)
                        </div>
                    </div>
                );
            case 'FileInput':
                return (
                    <div className="space-y-2 pointer-events-none">
                        <Label className="text-xs font-bold text-primary/80">{c.label} {c.required && '*'}</Label>
                        <div className="h-10 border border-dashed rounded-lg bg-muted/30 flex items-center justify-center px-3 text-[11px] text-muted-foreground italic gap-2">
                            <FileIcon className="w-3.5 h-3.5" /> {c.accept || '*/*'}
                        </div>
                    </div>
                );
            case 'LocationPicker':
                return (
                    <div className="space-y-2 pointer-events-none">
                        <Label className="text-xs font-bold text-primary/80">{c.label} {c.required && '*'}</Label>
                        <div className="h-10 border border-dashed rounded-lg bg-muted/30 flex items-center justify-center px-3 text-[11px] text-muted-foreground italic gap-2">
                            <MapPin className="w-3.5 h-3.5" /> Pick location
                        </div>
                    </div>
                );
            case 'TimePicker':
                return (
                    <div className="space-y-2 pointer-events-none">
                        <Label className="text-xs font-bold text-primary/80">{c.label} {c.required && '*'}</Label>
                        <div className="h-10 border border-dashed rounded-lg bg-card/50 flex items-center px-3 text-[11px] text-muted-foreground italic gap-2">
                            <Clock className="w-3.5 h-3.5" /> {c.name}
                        </div>
                    </div>
                );
            case 'ConsentCheckbox':
                return (
                    <div className="flex items-start gap-3 pointer-events-none">
                        <div className="w-5 h-5 rounded border-2 border-primary/40 mt-0.5 shrink-0 flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground">{c.label}</span>
                    </div>
                );
            case 'APIAction':
                return (
                    <div className="space-y-2 pointer-events-none">
                        <Label className="text-xs font-bold text-blue-500/80">{c.label}</Label>
                        <div className="h-10 border border-dashed rounded-lg bg-blue-500/5 flex items-center px-3 text-[11px] text-muted-foreground italic gap-2">
                            <Database className="w-3.5 h-3.5 text-blue-500" />
                            {c.dataSourceUrl || 'No endpoint set'}
                        </div>
                    </div>
                );
            case 'DataGrid':
                return (
                    <div className="space-y-2 pointer-events-none">
                        <Label className="text-xs font-bold text-primary/80">{c.label}</Label>
                        <div className="border border-dashed rounded-lg bg-card/50 p-2">
                            <div className="flex gap-2 text-[10px] font-mono text-muted-foreground border-b pb-1 mb-1">
                                {c.columns?.map((col, i) => (
                                    <span key={i} className="flex-1">{col.label}</span>
                                ))}
                            </div>
                            <div className="text-[10px] text-muted-foreground italic text-center py-2">Data rows</div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="space-y-2 pointer-events-none">
                        <Label className="text-xs font-bold text-primary/80">{c.label} {c.required && '*'}</Label>
                        <div className="h-10 border border-dashed rounded-lg bg-card/50 flex items-center px-3 text-[11px] text-muted-foreground italic">
                            {c.name}
                        </div>
                    </div>
                );
        }
    };

    const renderComponentInspector = () => {
        if (!selectedComponent) return null;
        const c = selectedComponent;
        const isInput = ['TextInput', 'Select', 'RadioButtons', 'CheckboxGroup', 'DatePicker', 'TimePicker', 'FileInput', 'LocationPicker', 'ConsentCheckbox'].includes(c.type);
        const hasOptions = ['Select', 'RadioButtons', 'CheckboxGroup'].includes(c.type);

        return (
            <Card className="border-primary/20 shadow-sm">
                <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between border-b pb-2 mb-2">
                        <Badge variant="outline" className="text-[9px] uppercase tracking-tighter bg-primary/5">{c.type}</Badge>
                        <span className="text-[9px] font-mono opacity-40">{c.id}</span>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[11px]">Text / Content</Label>
                        <Textarea
                            value={c.text || c.label || ''}
                            onChange={(e) => updateComponent(c.id, { [c.type.startsWith('Text') ? 'text' : 'label']: e.target.value })}
                            className="min-h-[60px] text-xs"
                        />
                    </div>

                    {isInput && (
                        <>
                            <div className="space-y-1.5">
                                <Label className="text-[11px]">System Name (Key)</Label>
                                <Input
                                    value={c.name || ''}
                                    onChange={(e) => updateComponent(c.id, { name: e.target.value })}
                                    className="h-8 text-xs font-mono"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="req-toggle"
                                    checked={c.required ?? true}
                                    onChange={(e) => updateComponent(c.id, { required: e.target.checked })}
                                    className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                                />
                                <Label htmlFor="req-toggle" className="text-[11px] font-medium cursor-pointer">Required</Label>
                            </div>
                        </>
                    )}

                    {c.type === 'TextInput' && (
                        <div className="space-y-1.5">
                            <Label className="text-[11px]">Placeholder</Label>
                            <Input
                                value={c.placeholder || ''}
                                onChange={(e) => updateComponent(c.id, { placeholder: e.target.value })}
                                className="h-8 text-xs"
                            />
                        </div>
                    )}

                    {c.type === 'FileInput' && (
                        <>
                            <div className="space-y-1.5">
                                <Label className="text-[11px]">Accept (MIME type)</Label>
                                <Input
                                    value={c.accept || '*/*'}
                                    onChange={(e) => updateComponent(c.id, { accept: e.target.value })}
                                    className="h-8 text-xs font-mono"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="multi-toggle"
                                    checked={c.multiple || false}
                                    onChange={(e) => updateComponent(c.id, { multiple: e.target.checked })}
                                    className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                                />
                                <Label htmlFor="multi-toggle" className="text-[11px] font-medium cursor-pointer">Allow Multiple Files</Label>
                            </div>
                        </>
                    )}

                    {c.type === 'APIAction' && (
                        <>
                            <div className="space-y-1.5">
                                <Label className="text-[11px]">Endpoint URL</Label>
                                <Input
                                    value={c.dataSourceUrl || ''}
                                    onChange={(e) => updateComponent(c.id, { dataSourceUrl: e.target.value })}
                                    className="h-8 text-xs font-mono"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px]">Request Body (JSON)</Label>
                                <Textarea
                                    value={c.requestBody || '{}'}
                                    onChange={(e) => updateComponent(c.id, { requestBody: e.target.value })}
                                    className="min-h-[60px] text-xs font-mono"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px]">Response Key</Label>
                                <Input
                                    value={c.responseKey || ''}
                                    onChange={(e) => updateComponent(c.id, { responseKey: e.target.value })}
                                    className="h-8 text-xs font-mono"
                                />
                            </div>
                        </>
                    )}

                    {c.type === 'DataGrid' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-[11px] font-bold">Columns</Label>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-primary"
                                    onClick={() => {
                                        const cols = [...(c.columns || []), { key: `col${(c.columns?.length || 0) + 1}`, label: `Column ${(c.columns?.length || 0) + 1}`, type: 'text' }];
                                        updateComponent(c.id, { columns: cols });
                                    }}>
                                    <Plus className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                            {c.columns?.map((col, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <Input value={col.key} onChange={(e) => { const cols = [...c.columns]; cols[idx].key = e.target.value; updateComponent(c.id, { columns: cols }); }}
                                        className="h-7 text-[10px] font-mono w-20" placeholder="Key" />
                                    <Input value={col.label} onChange={(e) => { const cols = [...c.columns]; cols[idx].label = e.target.value; updateComponent(c.id, { columns: cols }); }}
                                        className="h-7 text-[10px] flex-1" placeholder="Label" />
                                    <Select value={col.type || 'text'} onValueChange={(val) => { const cols = [...c.columns]; cols[idx].type = val; updateComponent(c.id, { columns: cols }); }}>
                                        <SelectTrigger className="h-7 w-20 text-[10px]"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text">text</SelectItem>
                                            <SelectItem value="number">number</SelectItem>
                                            <SelectItem value="date">date</SelectItem>
                                            <SelectItem value="currency">currency</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                                        onClick={() => { const cols = c.columns.filter((_, i) => i !== idx); updateComponent(c.id, { columns: cols }); }}>
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {hasOptions && (
                        <div className="space-y-3 pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <Label className="text-[11px] font-bold">Choices</Label>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-primary"
                                    onClick={() => {
                                        const newOpts = [...(c.options || []), { label: `Option ${(c.options?.length || 0) + 1}`, value: `opt${(c.options?.length || 0) + 1}` }];
                                        updateComponent(c.id, { options: newOpts });
                                    }}>
                                    <Plus className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                            {c.options?.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <Input value={opt.label} onChange={(e) => { const newOpts = [...c.options]; newOpts[idx].label = e.target.value; updateComponent(c.id, { options: newOpts }); }}
                                        className="flex-1 h-7 text-[10px]" placeholder="Label" />
                                    <Input value={opt.value} onChange={(e) => { const newOpts = [...c.options]; newOpts[idx].value = e.target.value; updateComponent(c.id, { options: newOpts }); }}
                                        className="w-20 h-7 text-[10px] font-mono" placeholder="Value" />
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                                        onClick={() => { const newOpts = c.options.filter((_, i) => i !== idx); updateComponent(c.id, { options: newOpts }); }}>
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Component-level action */}
                    <div className="space-y-3 pt-4 border-t">
                        <Label className="text-[11px] font-bold">On Click Action</Label>
                        <Select value={c.action?.type || ''} onValueChange={(val) => updateComponent(c.id, { action: val ? { type: val, ...(val === 'open_url' ? { url: '' } : {}) } : null })}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="None" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {ACTION_TYPES.map(a => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {c.action?.type === 'navigate' && (
                            <Select value={c.action.screen || ''} onValueChange={(val) => updateComponent(c.id, { action: { ...c.action, screen: val } })}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Target screen" /></SelectTrigger>
                                <SelectContent>
                                    {screens.filter(s => s.id !== activeScreenId).map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {c.action?.type === 'open_url' && (
                            <Input value={c.action.url || ''} onChange={(e) => updateComponent(c.id, { action: { ...c.action, url: e.target.value } })}
                                className="h-8 text-xs font-mono" placeholder="https://..." />
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="flex flex-col h-full bg-background border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-muted/20">
                <div className="flex items-center gap-4">
                    <Tabs value={viewMode} onValueChange={setViewMode} className="w-[200px]">
                        <TabsList className="grid grid-cols-2 h-9">
                            <TabsTrigger value="design" className="text-xs">Design</TabsTrigger>
                            <TabsTrigger value="code" className="text-xs">JSON</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => onSave(screens, generateFlowJson())}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Flow
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Screen Sidebar */}
                <div className="w-64 border-r bg-muted/10 flex flex-col">
                    <div className="p-4 border-b flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Screens</span>
                        <Button variant="ghost" size="icon" onClick={addScreen} className="h-6 w-6"><Plus className="w-4 h-4" /></Button>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            {screens.map(s => (
                                <div key={s.id} className="group flex items-center gap-1">
                                    <button
                                        onClick={() => setActiveScreenId(s.id)}
                                        className={`flex-1 text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${activeScreenId === s.id ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/5'}`}
                                    >
                                        <span className="truncate">{s.title}</span>
                                        <Badge variant="outline" className={`text-[10px] ${activeScreenId === s.id ? 'border-primary-foreground/30 text-primary-foreground' : 'opacity-60'}`}>{s.id}</Badge>
                                    </button>
                                    <button onClick={() => removeScreen(s.id)} className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Main Editor */}
                <div className="flex-1 flex overflow-hidden">
                    {viewMode === 'design' ? (
                        <>
                            <div className="flex-1 bg-muted/5 p-8 flex flex-col items-center overflow-y-auto"
                                onClick={() => setSelectedComponentId(null)}>
                                <div className="w-[360px] min-h-[600px] bg-card border-4 border-muted rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col"
                                    onClick={(e) => e.stopPropagation()}>
                                    <div className="h-14 bg-muted/50 flex items-center justify-center border-b">
                                        <div className="w-16 h-1 bg-muted-foreground/20 rounded-full" />
                                    </div>
                                    <div className="flex-1 p-6 space-y-6">
                                        <input
                                            value={activeScreen?.title || ''}
                                            onChange={(e) => updateScreenTitle(e.target.value)}
                                            className="w-full text-lg font-bold bg-transparent border-none outline-none focus:border-b focus:border-primary pb-1"
                                            placeholder="Screen Title"
                                        />
                                        <div className="space-y-4">
                                            {activeScreen?.children.map((c) => (
                                                <div key={c.id}
                                                    onClick={(e) => { e.stopPropagation(); setSelectedComponentId(c.id); setActiveSidebarTab('inspector'); }}
                                                    className={`relative group p-3 border-2 transition-all cursor-pointer rounded-xl ${selectedComponentId === c.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-transparent hover:border-primary/20 hover:bg-primary/5'}`}>
                                                    {selectedComponentId === c.id && (
                                                        <Badge className="absolute -left-2 -top-2 text-[8px] h-4 px-1 animate-pulse">EDITING</Badge>
                                                    )}
                                                    {renderComponentPreview(c)}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteComponent(c.id); }}
                                                        className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-lg transition-all z-10">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                            {activeScreen?.children.length === 0 && (
                                                <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl gap-3 text-center px-4">
                                                    <LayoutIcon className="w-8 h-8 text-muted-foreground/30" />
                                                    <p className="text-xs text-muted-foreground font-medium">Add components from the library.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-6 border-t bg-card space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Footer Action</Label>
                                            <Select value={activeScreen?.footerAction?.type || 'navigate'}
                                                onValueChange={(val) => updateFooterAction({ type: val, label: val === 'complete' ? 'Finish' : 'Next' })}>
                                                <SelectTrigger className="h-7 text-[10px] flex-1"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {ACTION_TYPES.map(a => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={activeScreen?.footerAction?.label || 'Next'}
                                                onChange={(e) => updateFooterAction({ label: e.target.value })}
                                                className="h-8 text-xs font-medium flex-1"
                                                placeholder="Button label"
                                            />
                                            {activeScreen?.footerAction?.type === 'navigate' && (
                                                <Select value={activeScreen.footerAction.screen || ''}
                                                    onValueChange={(val) => updateFooterAction({ screen: val })}>
                                                    <SelectTrigger className="h-8 text-[10px] w-32"><SelectValue placeholder="To..." /></SelectTrigger>
                                                    <SelectContent>
                                                        {screens.filter(s => s.id !== activeScreenId).map(s => (
                                                            <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                            {activeScreen?.footerAction?.type === 'data_exchange' && (
                                                <>
                                                    <Select value={activeScreen.footerAction.method || 'POST'}
                                                        onValueChange={(val) => updateFooterAction({ method: val })}>
                                                        <SelectTrigger className="h-8 text-[10px] w-20"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="POST">POST</SelectItem>
                                                            <SelectItem value="GET">GET</SelectItem>
                                                            <SelectItem value="PUT">PUT</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Input value={activeScreen.footerAction.response_key || ''}
                                                        onChange={(e) => updateFooterAction({ response_key: e.target.value })}
                                                        className="h-8 text-[10px] font-mono w-24" placeholder="Resp key" />
                                                </>
                                            )}
                                            {activeScreen?.footerAction?.type === 'open_url' && (
                                                <Input value={activeScreen.footerAction.url || ''}
                                                    onChange={(e) => updateFooterAction({ url: e.target.value })}
                                                    className="h-8 text-[10px] font-mono flex-1" placeholder="https://..." />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-80 border-l bg-card flex flex-col overflow-hidden">
                                <Tabs value={activeSidebarTab} onValueChange={setActiveSidebarTab} className="flex-1 flex flex-col">
                                    <TabsList className="w-full rounded-none h-12 border-b bg-muted/20">
                                        <TabsTrigger value="library" className="flex-1 text-xs font-bold">Library</TabsTrigger>
                                        <TabsTrigger value="inspector" className="flex-1 text-xs font-bold">Properties</TabsTrigger>
                                    </TabsList>
                                    <div className="flex-1 overflow-y-auto bg-card pointer-events-auto">
                                        <TabsContent value="library" className="m-0 p-4">
                                            <div className="grid grid-cols-2 gap-3 pb-10">
                                                {COMPONENT_TYPES.map(type => (
                                                    <button key={type.id}
                                                        onClick={() => addComponent(type.id)}
                                                        className="flex flex-col items-center justify-center p-4 border rounded-xl hover:border-primary hover:bg-primary/5 transition-all gap-2 group">
                                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                            <type.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                                                        </div>
                                                        <span className="text-[11px] font-bold">{type.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="inspector" className="m-0 p-6">
                                            <div className="space-y-6 pb-10">
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Screen Settings</h4>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Screen ID</Label>
                                                        <Input value={activeScreen?.id || ''}
                                                            onChange={(e) => setScreens(screens.map(s => s.id === activeScreenId ? { ...s, id: e.target.value } : s))}
                                                            className="h-8 text-xs font-mono" />
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Component Properties</h4>
                                                    {!selectedComponent ? (
                                                        <div className="py-10 text-center space-y-3">
                                                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto opacity-40">
                                                                <Settings className="w-5 h-5" />
                                                            </div>
                                                            <p className="text-xs text-muted-foreground italic px-4">Select a component on the canvas to edit its properties.</p>
                                                        </div>
                                                    ) : renderComponentInspector()}
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 bg-[#1e1e1e] p-6 font-mono text-sm overflow-auto">
                            <pre className="text-blue-300 text-[11px] whitespace-pre-wrap break-all">
                                {generateFlowJson()}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FlowBuilder;
