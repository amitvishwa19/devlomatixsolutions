'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
    Workflow,
    Plus,
    Trash2,
    Edit,
    Check,
    Send,
    Smartphone,
    RotateCcw,
    Layers,
    GitBranch,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
    getKonnectFlowsAction,
    saveKonnectFlowAction,
    toggleKonnectFlowAction,
    deleteKonnectFlowAction
} from '../_actions/flows-actions';

export default function KonnectFlowsPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;

    const [flows, setFlows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFlow, setSelectedFlow] = useState(null);

    // Modal
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form data
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [triggerKeyword, setTriggerKeyword] = useState('HI');
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [steps, setSteps] = useState([]);

    // Phone simulator state
    const [simulatorMessages, setSimulatorMessages] = useState([
        { text: "Type 'HI' to start the interactive decision tree", fromMe: false, time: '10:00 AM' }
    ]);
    const [simInput, setSimInput] = useState('');

    const loadFlows = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getKonnectFlowsAction(workspaceId);
            if (res.success) {
                setFlows(res.flows);
                if (res.flows.length > 0) {
                    setSelectedFlow(res.flows[0]);
                }
            } else {
                toast.error(res.error || "Failed to load flows");
            }
        } catch (e) {
            toast.error("Network error loading flows");
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        loadFlows();
    }, [loadFlows]);

    const handleOpenEdit = (flow = null) => {
        if (flow) {
            setName(flow.name);
            setDescription(flow.description || '');
            setTriggerKeyword(flow.triggerKeyword || 'HI');
            setWelcomeMessage(flow.welcomeMessage || '');
            setSteps(flow.steps || []);
        } else {
            setName('New WhatsApp Menu');
            setDescription('Numbered interactive branch workflow');
            setTriggerKeyword('MENU');
            setWelcomeMessage('👋 Welcome! Choose an option:\n1️⃣ Sales\n2️⃣ Support');
            setSteps([
                { option: '1', response: '🚀 Connecting you with our sales team!' },
                { option: '2', response: '🛠️ Our support team has been notified.' }
            ]);
        }
        setIsEditOpen(true);
    };

    const handleSaveFlow = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await saveKonnectFlowAction(workspaceId, {
                id: selectedFlow?.id,
                name,
                description,
                triggerKeyword,
                welcomeMessage,
                steps,
                active: selectedFlow?.active ?? true
            });

            if (res.success) {
                toast.success("Workflow saved!");
                setIsEditOpen(false);
                loadFlows();
            } else {
                toast.error(res.error || "Failed to save workflow");
            }
        } catch (err) {
            toast.error("Error saving workflow");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (flowId, active) => {
        try {
            await toggleKonnectFlowAction(workspaceId, flowId, active);
            setFlows(prev => prev.map(f => f.id === flowId ? { ...f, active } : f));
            if (selectedFlow?.id === flowId) {
                setSelectedFlow(p => ({ ...p, active }));
            }
            toast.success(active ? "Flow activated" : "Flow paused");
        } catch (e) {
            toast.error("Failed to toggle status");
        }
    };

    const handleDeleteFlow = async (flowId) => {
        if (!confirm("Are you sure you want to delete this flow?")) return;
        try {
            const res = await deleteKonnectFlowAction(workspaceId, flowId);
            if (res.success) {
                toast.success("Flow deleted");
                setFlows(prev => prev.filter(f => f.id !== flowId));
                setSelectedFlow(flows[0] || null);
            }
        } catch (e) {
            toast.error("Error deleting flow");
        }
    };

    // Simulator logic
    const handleSimSend = (e) => {
        e.preventDefault();
        if (!simInput.trim() || !selectedFlow) return;

        const userMsg = simInput.trim();
        const newSim = [
            ...simulatorMessages,
            { text: userMsg, fromMe: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ];

        setSimulatorMessages(newSim);
        setSimInput('');

        // Evaluate flow logic
        setTimeout(() => {
            if (userMsg.toUpperCase() === selectedFlow.triggerKeyword.toUpperCase()) {
                setSimulatorMessages(p => [
                    ...p,
                    { text: selectedFlow.welcomeMessage, fromMe: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                ]);
            } else {
                const matchStep = selectedFlow.steps?.find(s => s.option === userMsg);
                if (matchStep) {
                    setSimulatorMessages(p => [
                        ...p,
                        { text: matchStep.response, fromMe: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                    ]);
                } else {
                    setSimulatorMessages(p => [
                        ...p,
                        { text: `⚠️ Invalid option. Please reply with a number from the menu or '${selectedFlow.triggerKeyword}' to restart.`, fromMe: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                    ]);
                }
            }
        }, 600);
    };

    const handleResetSim = () => {
        setSimulatorMessages([
            { text: `Type '${selectedFlow?.triggerKeyword || 'HI'}' to test the interactive tree`, fromMe: false, time: '10:00 AM' }
        ]);
    };

    const handleAddStep = () => {
        const nextNum = String(steps.length + 1);
        setSteps(p => [...p, { option: nextNum, response: `Response for option ${nextNum}` }]);
    };

    const handleRemoveStep = (idx) => {
        setSteps(p => p.filter((_, i) => i !== idx));
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Workflow className="h-5 w-5 text-emerald-500" />
                        Interactive Decision Trees & Menus
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Build automated conversational branching menus (1 for Sales, 2 for Support) that work on standard WhatsApp numbers.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={() => handleOpenEdit(null)}
                        className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Create Decision Tree</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left 4 cols: Flow List */}
                <div className="lg:col-span-4 space-y-3">
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider text-muted-foreground">
                        Active Decision Flows ({flows.length})
                    </h3>
                    {loading ? (
                        <div className="py-8 text-center text-muted-foreground text-xs">
                            <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1 text-emerald-500" />
                            Loading flows...
                        </div>
                    ) : (
                        flows.map((flow) => {
                            const isSelected = selectedFlow?.id === flow.id;
                            return (
                                <Card
                                    key={flow.id}
                                    onClick={() => setSelectedFlow(flow)}
                                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                                        isSelected
                                            ? 'border-emerald-500/50 bg-emerald-500/5 shadow-sm'
                                            : 'bg-card/40 border-border/40 hover:border-border'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                                                KEY: {flow.triggerKeyword}
                                            </Badge>
                                        </div>
                                        <Switch
                                            checked={flow.active}
                                            onClick={(e) => e.stopPropagation()}
                                            onCheckedChange={(checked) => handleToggleActive(flow.id, checked)}
                                            className="scale-75"
                                        />
                                    </div>
                                    <h4 className="text-xs font-semibold text-foreground">{flow.name}</h4>
                                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                        {flow.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20 text-[10px] text-muted-foreground">
                                        <span>{flow.steps?.length || 0} Decision Branches</span>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenEdit(flow);
                                                }}
                                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                            >
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteFlow(flow.id);
                                                }}
                                                className="h-6 w-6 text-rose-500 hover:text-rose-400"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Middle 4 cols: Tree Visual Inspection */}
                <div className="lg:col-span-4 space-y-4">
                    {selectedFlow ? (
                        <Card className="bg-card/40 border-border/40 backdrop-blur-sm p-4 rounded-[16px] space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <GitBranch className="h-4 w-4 text-emerald-500" />
                                    Workflow Architecture
                                </h3>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenEdit(selectedFlow)}
                                    className="h-6 text-[11px] px-2"
                                >
                                    Edit Steps
                                </Button>
                            </div>

                            {/* Node 1: Trigger */}
                            <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-xs space-y-1">
                                <span className="text-[10px] uppercase font-bold text-emerald-500">Node 1: Trigger Keyword</span>
                                <p className="font-mono text-xs font-semibold">User sends: "{selectedFlow.triggerKeyword}"</p>
                            </div>

                            {/* Node 2: Welcome Prompt */}
                            <div className="p-2.5 rounded-lg border border-border/40 bg-card/30 text-xs space-y-1">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Node 2: Menu Response</span>
                                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{selectedFlow.welcomeMessage}</p>
                            </div>

                            {/* Node 3: Branches */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Node 3: Decision Branches</span>
                                {selectedFlow.steps?.map((step, idx) => (
                                    <div key={idx} className="p-2 rounded border border-border/30 bg-muted/20 text-xs space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <Badge variant="secondary" className="text-[10px] px-1 py-0 font-bold">
                                                Option {step.option}
                                            </Badge>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">{step.response}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ) : (
                        <Card className="bg-card/40 border-border/40 p-8 text-center text-muted-foreground text-xs">
                            Select a flow to view structure
                        </Card>
                    )}
                </div>

                {/* Right 4 cols: Interactive Phone Simulator */}
                <div className="lg:col-span-4 space-y-4">
                    <Card className="bg-card/40 border-border/40 backdrop-blur-sm p-3.5 rounded-[16px] space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Smartphone className="h-4 w-4 text-emerald-500" />
                                Interactive Flow Simulator
                            </h3>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleResetSim}
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                title="Reset Simulator"
                            >
                                <RotateCcw className="h-3 w-3" />
                            </Button>
                        </div>

                        {/* Phone Container Screen */}
                        <div className="rounded-xl border border-border/40 bg-zinc-950 p-2.5 h-[340px] flex flex-col justify-between">
                            {/* Messages viewport */}
                            <div className="space-y-2 overflow-y-auto pr-1 text-xs flex-1">
                                {simulatorMessages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex flex-col ${msg.fromMe ? 'items-end' : 'items-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-xl px-2.5 py-1.5 shadow-sm text-xs whitespace-pre-wrap ${
                                                msg.fromMe
                                                    ? 'bg-emerald-600 text-white rounded-tr-none'
                                                    : 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700/50'
                                            }`}
                                        >
                                            {msg.text}
                                        </div>
                                        <span className="text-[9px] text-zinc-500 mt-0.5 px-1">{msg.time}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Simulator Input */}
                            <form onSubmit={handleSimSend} className="flex items-center gap-1.5 pt-2 border-t border-zinc-800">
                                <Input
                                    placeholder="Type message or option..."
                                    value={simInput}
                                    onChange={(e) => setSimInput(e.target.value)}
                                    className="h-7 text-xs bg-zinc-900 border-zinc-700 text-white"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="h-7 w-7 bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0"
                                >
                                    <Send className="h-3 w-3" />
                                </Button>
                            </form>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Edit Flow Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                            <Workflow className="h-4 w-4 text-emerald-500" />
                            Edit WhatsApp Decision Tree
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveFlow} className="space-y-3 py-2">
                        <div className="space-y-1">
                            <Label className="text-xs">Tree Name</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Trigger Keyword (e.g. START, MENU, HI)</Label>
                            <Input
                                value={triggerKeyword}
                                onChange={(e) => setTriggerKeyword(e.target.value)}
                                required
                                className="h-8 text-xs font-mono uppercase"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Welcome Menu Message</Label>
                            <Textarea
                                rows={3}
                                value={welcomeMessage}
                                onChange={(e) => setWelcomeMessage(e.target.value)}
                                required
                                className="text-xs"
                            />
                        </div>

                        {/* Step Branches */}
                        <div className="space-y-2 pt-2 border-t border-border/30">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold">Decision Options</Label>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={handleAddStep}
                                    className="h-6 text-[10px] px-2 gap-1"
                                >
                                    <Plus className="h-3 w-3" />
                                    <span>Add Option</span>
                                </Button>
                            </div>
                            {steps.map((st, idx) => (
                                <div key={idx} className="flex items-start gap-2 p-2 rounded border border-border/40 bg-muted/20">
                                    <Input
                                        value={st.option}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setSteps(p => p.map((s, i) => i === idx ? { ...s, option: val } : s));
                                        }}
                                        className="w-16 h-7 text-xs font-mono text-center"
                                        placeholder="Option"
                                    />
                                    <Textarea
                                        value={st.response}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setSteps(p => p.map((s, i) => i === idx ? { ...s, response: val } : s));
                                        }}
                                        rows={2}
                                        className="text-xs flex-1"
                                        placeholder="Response message..."
                                    />
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleRemoveStep(idx)}
                                        className="h-7 w-7 text-rose-500"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditOpen(false)}
                                className="h-8 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={saving}
                                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                                Save Workflow
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
