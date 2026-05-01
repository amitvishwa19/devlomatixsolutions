'use client';

import React, { useState, useEffect } from 'react';
import { 
    Layout, 
    Plus, 
    Trash2, 
    Settings, 
    Play, 
    Code, 
    ChevronRight, 
    Type, 
    Hash, 
    Calendar, 
    List, 
    CircleDot, 
    CheckSquare,
    Save,
    ArrowRight
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

const COMPONENT_TYPES = [
    { id: 'TextItem', label: 'Static Text', icon: Type, default: { text: 'New Text', style: 'body' } },
    { id: 'TextInput', label: 'Text Input', icon: ArrowRight, default: { label: 'Label', name: 'input_1', required: true } },
    { id: 'Select', label: 'Dropdown', icon: List, default: { label: 'Select Option', name: 'select_1', options: [{ label: 'Option 1', value: 'opt1' }] } },
    { id: 'RadioButtons', label: 'Radio Buttons', icon: CircleDot, default: { label: 'Choose One', name: 'radio_1', options: [{ label: 'Option 1', value: 'opt1' }] } },
    { id: 'CheckboxGroup', label: 'Checkboxes', icon: CheckSquare, default: { label: 'Choose Multiple', name: 'check_1', options: [{ label: 'Option 1', value: 'opt1' }] } },
    { id: 'DatePicker', label: 'Date Picker', icon: Calendar, default: { label: 'Select Date', name: 'date_1' } },
];

const FlowBuilder = ({ initialScreens = [], onSave }) => {
    const [screens, setScreens] = useState(initialScreens.length > 0 ? initialScreens : [
        { id: 'SCREEN_1', title: 'Welcome', children: [] }
    ]);
    const [activeScreenId, setActiveScreenId] = useState(screens[0]?.id);
    const [viewMode, setViewMode] = useState('design'); // design | code

    const activeScreen = screens.find(s => s.id === activeScreenId);

    const addScreen = () => {
        const newId = `SCREEN_${screens.length + 1}`;
        setScreens([...screens, { id: newId, title: `New Screen ${screens.length + 1}`, children: [] }]);
        setActiveScreenId(newId);
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
    };

    const updateComponent = (compId, updates) => {
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

    const deleteComponent = (compId) => {
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

    const generateFlowJson = () => {
        const flow = {
            version: "5.0",
            screens: screens.map(s => ({
                id: s.id,
                title: s.title,
                layout: {
                    type: "SingleColumnLayout",
                    children: [
                        ...s.children.map(c => {
                            const base = { type: c.type };
                            if (c.type === 'TextItem') {
                                return { ...base, text: c.text, style: c.style };
                            }
                            if (c.type === 'TextInput') {
                                return { ...base, label: c.label, name: c.name, required: c.required };
                            }
                            if (['Select', 'RadioButtons', 'CheckboxGroup'].includes(c.type)) {
                                return { ...base, label: c.label, name: c.name, options: c.options };
                            }
                            if (c.type === 'DatePicker') {
                                return { ...base, label: c.label, name: c.name };
                            }
                            return base;
                        }),
                        {
                            type: "Footer",
                            label: "Continue",
                            on_click_action: {
                                name: "navigate",
                                payload: {
                                    screen: screens[screens.indexOf(s) + 1]?.id || "SUCCESS"
                                }
                            }
                        }
                    ]
                }
            }))
        };
        return JSON.stringify(flow, null, 4);
    };

    return (
        <div className="flex flex-col h-full bg-background border rounded-2xl overflow-hidden">
            {/* Top Toolbar */}
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
                    <Button variant="outline" size="sm" onClick={() => toast.info("Coming soon: Real-time Preview")}>
                        <Play className="w-4 h-4 mr-2" />
                        Preview
                    </Button>
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
                        <Button variant="ghost" size="icon" onClick={addScreen} className="h-6 w-6">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            {screens.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setActiveScreenId(s.id)}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between group ${activeScreenId === s.id ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/5'}`}
                                >
                                    <span className="truncate">{s.title}</span>
                                    <Badge variant="outline" className={`text-[10px] ${activeScreenId === s.id ? 'border-primary-foreground/30 text-primary-foreground' : 'opacity-60'}`}>{s.id}</Badge>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Main Editor Area */}
                <div className="flex-1 flex overflow-hidden">
                    {viewMode === 'design' ? (
                        <>
                            {/* Canvas */}
                            <div className="flex-1 bg-muted/5 p-8 flex flex-col items-center overflow-y-auto">
                                <div className="w-[360px] min-h-[600px] bg-card border-4 border-muted rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col">
                                    {/* Phone Header Mock */}
                                    <div className="h-14 bg-muted/50 flex items-center justify-center border-b">
                                        <div className="w-16 h-1 bg-muted-foreground/20 rounded-full" />
                                    </div>

                                    {/* Screen Content */}
                                    <div className="flex-1 p-6 space-y-6">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold">{activeScreen?.title}</h3>
                                            <p className="text-xs text-muted-foreground">Screen ID: {activeScreen?.id}</p>
                                        </div>

                                        <div className="space-y-4">
                                            {activeScreen?.children.map((c) => (
                                                <div key={c.id} className="relative group p-3 border-2 border-transparent hover:border-primary/20 hover:bg-primary/5 rounded-xl transition-all">
                                                    {c.type === 'TextItem' && <p className={`text-sm ${c.style === 'heading' ? 'font-bold text-base' : 'text-muted-foreground'}`}>{c.text}</p>}
                                                    {['TextInput', 'Select', 'RadioButtons', 'CheckboxGroup', 'DatePicker'].includes(c.type) && (
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-bold text-primary/80">{c.label} {c.required && '*'}</Label>
                                                            <div className="h-10 border border-dashed rounded-lg bg-card/50 flex items-center px-3 text-[11px] text-muted-foreground italic">
                                                                {c.name} component placeholder
                                                            </div>
                                                        </div>
                                                    )}
                                                    <button 
                                                        onClick={() => deleteComponent(c.id)}
                                                        className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-lg transition-all"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}

                                            {activeScreen?.children.length === 0 && (
                                                <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl gap-3 text-center px-4">
                                                    <Layout className="w-8 h-8 text-muted-foreground/30" />
                                                    <p className="text-xs text-muted-foreground font-medium">Add components from the library to build this screen.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Phone Footer Mock */}
                                    <div className="p-6 border-t bg-card">
                                        <Button className="w-full h-11 font-bold rounded-xl">Continue</Button>
                                    </div>
                                </div>
                            </div>

                            {/* Library/Inspector Sidebar */}
                            <div className="w-80 border-l bg-card flex flex-col overflow-hidden">
                                <Tabs defaultValue="library" className="flex-1 flex flex-col">
                                    <TabsList className="w-full rounded-none h-12 border-b bg-muted/20">
                                        <TabsTrigger value="library" className="flex-1 text-xs font-bold">Library</TabsTrigger>
                                        <TabsTrigger value="inspector" className="flex-1 text-xs font-bold">Properties</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="library" className="flex-1 m-0">
                                        <ScrollArea className="h-full">
                                            <div className="p-4 grid grid-cols-2 gap-3">
                                                {COMPONENT_TYPES.map(type => (
                                                    <button
                                                        key={type.id}
                                                        onClick={() => addComponent(type.id)}
                                                        className="flex flex-col items-center justify-center p-4 border rounded-xl hover:border-primary hover:bg-primary/5 transition-all gap-2 group"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                            <type.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                                                        </div>
                                                        <span className="text-[11px] font-bold">{type.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>

                                    <TabsContent value="inspector" className="flex-1 m-0">
                                        <ScrollArea className="h-full">
                                            <div className="p-6 space-y-6">
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Screen Settings</h4>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Screen Title</Label>
                                                        <Input 
                                                            value={activeScreen?.title || ''} 
                                                            onChange={(e) => setScreens(screens.map(s => s.id === activeScreenId ? { ...s, title: e.target.value } : s))}
                                                            className="h-9"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Component Properties</h4>
                                                    {activeScreen?.children.length === 0 ? (
                                                        <p className="text-xs text-muted-foreground italic">Select a component on the canvas to edit its properties.</p>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            {activeScreen?.children.map(c => (
                                                                <Card key={c.id} className="border-primary/10">
                                                                    <CardContent className="p-4 space-y-4">
                                                                        <div className="flex items-center justify-between">
                                                                            <Badge variant="secondary" className="text-[9px] uppercase tracking-tighter">{c.type}</Badge>
                                                                            <span className="text-[9px] font-mono opacity-40">{c.id}</span>
                                                                        </div>
                                                                        
                                                                        {c.type === 'TextItem' && (
                                                                            <div className="space-y-3">
                                                                                <div className="space-y-1.5">
                                                                                    <Label className="text-[11px]">Content</Label>
                                                                                    <Textarea 
                                                                                        value={c.text} 
                                                                                        onChange={(e) => updateComponent(c.id, { text: e.target.value })}
                                                                                        className="text-xs min-h-[60px]"
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-1.5">
                                                                                    <Label className="text-[11px]">Style</Label>
                                                                                    <Select value={c.style} onValueChange={(val) => updateComponent(c.id, { style: val })}>
                                                                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                                                        <SelectContent>
                                                                                            <SelectItem value="body">Body</SelectItem>
                                                                                            <SelectItem value="heading">Heading</SelectItem>
                                                                                            <SelectItem value="caption">Caption</SelectItem>
                                                                                        </SelectContent>
                                                                                    </Select>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {['TextInput', 'Select', 'RadioButtons', 'CheckboxGroup', 'DatePicker'].includes(c.type) && (
                                                                            <div className="space-y-3">
                                                                                <div className="space-y-1.5">
                                                                                    <Label className="text-[11px]">Label</Label>
                                                                                    <Input 
                                                                                        value={c.label} 
                                                                                        onChange={(e) => updateComponent(c.id, { label: e.target.value })}
                                                                                        className="h-8 text-xs"
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-1.5">
                                                                                    <Label className="text-[11px]">System Name (Key)</Label>
                                                                                    <Input 
                                                                                        value={c.name} 
                                                                                        onChange={(e) => updateComponent(c.id, { name: e.target.value })}
                                                                                        className="h-8 text-xs font-mono"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </CardContent>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 bg-[#1e1e1e] p-6 font-mono text-sm">
                            <ScrollArea className="h-full">
                                <pre className="text-blue-300">
                                    {generateFlowJson()}
                                </pre>
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FlowBuilder;
