'use client';

import React, { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Workflow,
    Zap,
    ShoppingBag,
    MessageSquare,
    Bot,
    Clock,
    Globe,
    Sparkles,
    ArrowRight,
    Loader2,
    Layers,
    Sliders,
    Check,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { createWorkflow } from '../_actions/workflow-actions';

const TRIGGER_OPTIONS = [
    {
        id: 'ecommerce_order',
        title: 'eCommerce Order Created',
        desc: 'Triggers when a customer places an order or completes checkout',
        category: 'eCommerce',
        icon: ShoppingBag,
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    },
    {
        id: 'whatsapp_inbound',
        title: 'Inbound WhatsApp Message',
        desc: 'Triggers on keywords, button reply, or WhatsApp Flow submission in KonnectX',
        category: 'WhatsApp',
        icon: MessageSquare,
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    },
    {
        id: 'form_submission',
        title: 'FormCraft Response Submitted',
        desc: 'Triggers on lead capture, CSAT survey, or custom form responses',
        category: 'Forms',
        icon: Layers,
        color: 'text-sky-500 bg-sky-500/10 border-sky-500/20'
    },
    {
        id: 'hireflow_application',
        title: 'HireFlow New Application',
        desc: 'Triggers when a candidate applies or changes hiring pipeline stage',
        category: 'HR & ATS',
        icon: Bot,
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
    },
    {
        id: 'cron_schedule',
        title: 'Scheduled Cron Timer',
        desc: 'Triggers on a recurring schedule (e.g. hourly, daily midnight digest)',
        category: 'Time-based',
        icon: Clock,
        color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
    },
    {
        id: 'custom_webhook',
        title: 'Custom Inbound Webhook',
        desc: 'Triggers when an external service sends an HTTP POST request with JSON payload',
        category: 'Developer',
        icon: Globe,
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
    }
];

export function CreateWorkflowSheet({ open, onOpenChange, workspaceId, onWorkflowCreated, initialData = null }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Marketing');
    const [selectedTrigger, setSelectedTrigger] = useState(TRIGGER_OPTIONS[0].title);
    const [enableAi, setEnableAi] = useState(true);
    const [autoRetry, setAutoRetry] = useState(true);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (initialData && open) {
            setName(initialData.name || '');
            setDescription(initialData.description || '');
            setCategory(initialData.category || 'Marketing');
            if (initialData.trigger) {
                setSelectedTrigger(initialData.trigger);
            }
        }
    }, [initialData, open]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            return toast.error("Please enter a workflow name");
        }

        setLoading(true);
        try {
            const res = await createWorkflow(workspaceId, {
                name,
                description: description || `Automated ${selectedTrigger} pipeline`,
                trigger: selectedTrigger,
                category,
                enableAi,
                autoRetry
            });

            if (res.success) {
                toast.success("Workflow pipeline created successfully!");
                setName('');
                setDescription('');
                onOpenChange(false);
                if (onWorkflowCreated) {
                    onWorkflowCreated(res.data);
                }
            } else {
                toast.error(res.error || "Failed to create workflow");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col bg-background border-l border-border/80 z-50">
                {/* Header */}
                <SheetHeader className="p-4 border-b border-border/60 bg-secondary/15 space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                            <Workflow className="w-5 h-5" />
                        </div>
                        <div>
                            <SheetTitle className="text-base font-bold text-foreground">Create Automation Workflow</SheetTitle>
                            <SheetDescription className="text-xs text-muted-foreground">
                                Configure triggers, AI routing logic, and multi-channel automated actions.
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                {/* Form Body with Scroll */}
                <form id="create-workflow-form" onSubmit={handleCreate} className="flex-1 overflow-y-auto">
                    <div className="p-5 space-y-5">
                        {/* Basic Information */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">1. General Information</Label>
                                <Badge variant="outline" className="text-[9px] font-mono">FLOWFORGE v1.0</Badge>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="wf-name" className="text-xs font-medium">Workflow Name <span className="text-rose-500">*</span></Label>
                                <Input
                                    id="wf-name"
                                    placeholder="e.g. Abandoned Cart WhatsApp Recovery"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-8 text-xs bg-secondary/30 border-border/80"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">Category</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Marketing">Marketing</SelectItem>
                                            <SelectItem value="eCommerce">eCommerce</SelectItem>
                                            <SelectItem value="Customer Support">Customer Support</SelectItem>
                                            <SelectItem value="HR & Hiring">HR & Hiring</SelectItem>
                                            <SelectItem value="Finance & Billing">Finance & Billing</SelectItem>
                                            <SelectItem value="Operations">Operations</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">Execution Mode</Label>
                                    <div className="h-8 px-2.5 rounded-md bg-secondary/30 border border-border/80 flex items-center justify-between text-xs text-foreground font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <Zap className="w-3.5 h-3.5 text-amber-500" /> Real-Time Event
                                        </span>
                                        <span className="text-[10px] text-emerald-500 font-semibold font-mono">ACTIVE</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="wf-desc" className="text-xs font-medium">Description & Purpose</Label>
                                <Textarea
                                    id="wf-desc"
                                    rows={2}
                                    placeholder="Brief explanation of what this automation accomplishes..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="text-xs bg-secondary/30 border-border/80 resize-none min-h-[56px]"
                                />
                            </div>
                        </div>

                        {/* Trigger Selection */}
                        <div className="space-y-3 pt-2 border-t border-border/40">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">2. Select Starting Trigger</Label>
                                <span className="text-[11px] text-muted-foreground">Choose what activates this workflow</span>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                {TRIGGER_OPTIONS.map((t) => {
                                    const isSelected = selectedTrigger === t.title;
                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => setSelectedTrigger(t.title)}
                                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                                                isSelected
                                                    ? 'bg-indigo-500/10 border-indigo-500/60 shadow-xs'
                                                    : 'bg-card border-border/60 hover:bg-secondary/40'
                                            }`}
                                        >
                                            <div className={`p-2 rounded-lg border shrink-0 ${t.color}`}>
                                                <t.icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-xs text-foreground">{t.title}</span>
                                                    <Badge variant="outline" className="text-[8px] font-mono px-1.5 py-0">{t.category}</Badge>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{t.desc}</p>
                                            </div>
                                            {isSelected && (
                                                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 self-center">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Automation Options & AI Engine */}
                        <div className="space-y-3 pt-2 border-t border-border/40">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">3. Intelligence & Fault Tolerance</Label>

                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/40">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                                            <span className="text-xs font-semibold text-foreground">FlowGenix AI Pipeline Intelligence</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">
                                            Enables smart text classification, sentiment scoring, and dynamic message personalization.
                                        </p>
                                    </div>
                                    <Switch checked={enableAi} onCheckedChange={setEnableAi} />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/40">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <Sliders className="w-3.5 h-3.5 text-sky-500" />
                                            <span className="text-xs font-semibold text-foreground">Automated Retry on API Rate Limits</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">
                                            Automatically retries failed WhatsApp/Webhook nodes with exponential backoff.
                                        </p>
                                    </div>
                                    <Switch checked={autoRetry} onCheckedChange={setAutoRetry} />
                                </div>
                            </div>
                        </div>

                        {/* Visual Step Preview */}
                        <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500/5 via-primary/5 to-transparent border border-indigo-500/20 space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                <Workflow className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Initial Pipeline Topology Preview</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground overflow-x-auto py-1">
                                <span className="px-2 py-1 rounded bg-secondary/60 border border-border/60 font-semibold text-foreground shrink-0 truncate max-w-[140px]">
                                    {selectedTrigger}
                                </span>
                                <ArrowRight className="w-3 h-3 text-indigo-500 shrink-0" />
                                {enableAi && (
                                    <>
                                        <span className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-600 font-semibold shrink-0">
                                            AI Evaluator
                                        </span>
                                        <ArrowRight className="w-3 h-3 text-indigo-500 shrink-0" />
                                    </>
                                )}
                                <span className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 font-semibold shrink-0">
                                    Dispatch Action
                                </span>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <SheetFooter className="p-4 border-t border-border/60 bg-secondary/15 flex flex-row items-center justify-end gap-2 shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="h-8 text-xs border-border/80"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="create-workflow-form"
                        size="sm"
                        disabled={loading}
                        className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-xs"
                    >
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                        Create Workflow Pipeline
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
