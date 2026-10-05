'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Zap,
    MessageCircle,
    Receipt,
    Sparkles,
    Activity,
    Plus,
    Trash2,
    ArrowRight,
    Loader2,
    Layers,
    Share2,
    CheckCircle2
} from 'lucide-react';
import { toast } from "sonner";
import { createCrmAutomationRuleAction } from '../../_actions/crm-automation-actions';

const TRIGGER_TYPES = [
    {
        id: 'DEAL_STAGE_CHANGED',
        label: 'Deal Stage Changed',
        desc: 'Fires when a deal transitions into a specific pipeline stage (e.g. Proposal Sent)',
        icon: Layers,
        badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    },
    {
        id: 'DEAL_WON',
        label: 'Deal Closed Won (100% Win)',
        desc: 'Fires when a deal reaches the won stage, triggering invoicing & celebrations',
        icon: CheckCircle2,
        badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    },
    {
        id: 'LEAD_CREATED',
        label: 'New Lead / Contact Created',
        desc: 'Fires when a prospective lead is added to CRM or captured from forms',
        icon: Zap,
        badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    },
    {
        id: 'CANDIDATE_PLACED',
        label: 'Hireflow ATS Placement',
        desc: 'Fires when an applicant is placed and converted to a candidate deal',
        icon: Sparkles,
        badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    },
    {
        id: 'DEAL_RISK_FLAGGED',
        label: 'FlowGenix AI Risk Detected',
        desc: 'Fires when AI flags a deal as stalled or having critical churn risk',
        icon: Activity,
        badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
    }
];

const ACTION_MODULES = [
    {
        type: 'KONNECT_X_WHATSAPP',
        name: 'Send WhatsApp Template (KonnectX)',
        module: 'KonnectX',
        color: 'emerald',
        icon: MessageCircle,
        defaultConfig: {
            template: 'Hello {{contact_name}}, regarding {{deal_title}} (Valued at {{deal_currency}} {{deal_value}}), we are pleased to share your update!'
        }
    },
    {
        type: 'PAYFLOW_INVOICE',
        name: 'Create Draft Invoice (PayFlow)',
        module: 'PayFlow',
        color: 'blue',
        icon: Receipt,
        defaultConfig: {
            taxRate: 18,
            notes: 'Generated automatically by FlowForge CRM Bridge.'
        }
    },
    {
        type: 'CRM_TIMELINE_LOG',
        name: 'Log Timeline Event & Task',
        module: 'CRM Core',
        color: 'purple',
        icon: Activity,
        defaultConfig: {
            activityType: 'NOTE',
            title: 'Automated CRM Task Triggered'
        }
    },
    {
        type: 'FLOWGENIX_AI_SCORE',
        name: 'FlowGenix AI Lead Scoring',
        module: 'FlowGenix',
        color: 'indigo',
        icon: Sparkles,
        defaultConfig: {
            autoTag: true
        }
    },
    {
        type: 'WEBHOOK_DISPATCH',
        name: 'Outbound Webhook (FlowForge)',
        module: 'FlowForge',
        color: 'amber',
        icon: Share2,
        defaultConfig: {
            endpoint: 'https://api.yourdomain.com/crm/webhook',
            method: 'POST'
        }
    }
];

export default function CreateAutomationModal({ isOpen, onClose, workspaceId, onCreated }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Outreach & Messaging');
    const [triggerEvent, setTriggerEvent] = useState('DEAL_STAGE_CHANGED');
    const [triggerStageName, setTriggerStageName] = useState('Proposal Sent');
    const [minValue, setMinValue] = useState('0');
    const [requirePhone, setRequirePhone] = useState(true);

    const [actionsList, setActionsList] = useState([
        {
            id: 'act-new-1',
            type: 'KONNECT_X_WHATSAPP',
            name: 'Send WhatsApp Template (KonnectX)',
            module: 'KonnectX',
            color: 'emerald',
            config: {
                template: 'Hello {{contact_name}}, update regarding {{deal_title}} (Valued at {{deal_currency}} {{deal_value}}).'
            }
        },
        {
            id: 'act-new-2',
            type: 'CRM_TIMELINE_LOG',
            name: 'Log Activity in CRM',
            module: 'CRM Core',
            color: 'purple',
            config: {
                activityType: 'WHATSAPP_MSG',
                title: 'FlowForge WhatsApp Automated Outreach'
            }
        }
    ]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddAction = (actionModule) => {
        const newAct = {
            id: `act-new-${Date.now()}`,
            type: actionModule.type,
            name: actionModule.name,
            module: actionModule.module,
            color: actionModule.color,
            config: { ...actionModule.defaultConfig }
        };
        setActionsList([...actionsList, newAct]);
    };

    const handleRemoveAction = (index) => {
        setActionsList(actionsList.filter((_, i) => i !== index));
    };

    const handleUpdateActionConfig = (index, key, val) => {
        const updated = [...actionsList];
        updated[index].config = { ...updated[index].config, [key]: val };
        setActionsList(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Please provide a workflow rule name.");
            return;
        }

        if (actionsList.length === 0) {
            toast.error("Please add at least one action step to the automation.");
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await createCrmAutomationRuleAction(workspaceId, {
                name: name.trim(),
                description: description.trim() || 'Automated CRM cross-module workflow',
                category,
                triggerEvent,
                triggerStageName: triggerEvent === 'DEAL_STAGE_CHANGED' ? triggerStageName.trim() : '',
                conditions: {
                    minValue: parseFloat(minValue) || 0,
                    requirePhone
                },
                actions: actionsList
            });

            if (res.success) {
                toast.success("Workflow rule created & activated successfully!");
                if (onCreated) onCreated(res.data);
                onClose();
            } else {
                toast.error(res.error || "Failed to create automation rule");
            }
        } catch (error) {
            console.error("Create automation error:", error);
            toast.error("Error creating automation rule");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 bg-card border-border shadow-2xl">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-xl font-black text-foreground flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                            <Zap className="w-4 h-4" />
                        </div>
                        <span>Create FlowForge Automation Rule</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Configure cross-module triggers and automated multi-step actions across CRM, KonnectX, PayFlow, and Hireflow.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-3">
                    {/* Step 1: Rule Details */}
                    <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border/70">
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
                            1. Rule Overview
                        </h4>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Rule Name *</Label>
                            <Input
                                placeholder="e.g. WhatsApp Contract Sent & Invoicing Drip"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-9 text-xs bg-background"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger className="h-9 text-xs bg-background">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Outreach & Messaging">Outreach & Messaging</SelectItem>
                                        <SelectItem value="Finance & Invoicing">Finance & Invoicing</SelectItem>
                                        <SelectItem value="Lead Capture">Lead Capture</SelectItem>
                                        <SelectItem value="Talent & ATS">Talent & ATS</SelectItem>
                                        <SelectItem value="Risk Management">Risk Management</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Description</Label>
                                <Input
                                    placeholder="Brief explanation of this flow"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="h-9 text-xs bg-background"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Trigger Definition */}
                    <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border/70">
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
                            2. When this event happens (Trigger)
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {TRIGGER_TYPES.map((trig) => {
                                const Icon = trig.icon;
                                const isSelected = triggerEvent === trig.id;
                                return (
                                    <div
                                        key={trig.id}
                                        onClick={() => setTriggerEvent(trig.id)}
                                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                                            isSelected
                                                ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary'
                                                : 'bg-background/80 border-border/80 hover:border-border hover:bg-muted/40'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <span className="text-xs font-bold text-foreground">{trig.label}</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                            {trig.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Stage Specific Filter */}
                        {triggerEvent === 'DEAL_STAGE_CHANGED' && (
                            <div className="pt-2">
                                <Label className="text-xs font-medium">Target Stage Name</Label>
                                <Input
                                    placeholder="e.g. Proposal Sent, In Review, Contract Shared"
                                    value={triggerStageName}
                                    onChange={(e) => setTriggerStageName(e.target.value)}
                                    className="h-9 text-xs bg-background mt-1"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="space-y-1">
                                <Label className="text-xs font-medium">Min Deal Value (₹)</Label>
                                <Input
                                    type="number"
                                    value={minValue}
                                    onChange={(e) => setMinValue(e.target.value)}
                                    className="h-9 text-xs bg-background"
                                />
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border/60">
                                <div>
                                    <Label className="text-xs font-medium block">Require WhatsApp Number</Label>
                                    <span className="text-[10px] text-muted-foreground">Only trigger if phone exists</span>
                                </div>
                                <Switch checked={requirePhone} onCheckedChange={setRequirePhone} />
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Multi-Action Chain */}
                    <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border/70">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
                                3. Perform these Actions (Pipeline Chain)
                            </h4>
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                                {actionsList.length} Action{actionsList.length !== 1 ? 's' : ''}
                            </Badge>
                        </div>

                        {/* Actions Sequence List */}
                        <div className="space-y-2.5">
                            {actionsList.map((act, idx) => (
                                <div key={act.id} className="p-3 rounded-xl bg-background border border-border/80 space-y-2 relative shadow-xs">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-muted text-[10px] font-bold flex items-center justify-center text-muted-foreground">
                                                {idx + 1}
                                            </span>
                                            <Badge className={`text-[10px] bg-${act.color || 'blue'}-500/10 text-${act.color || 'blue'}-500 border-${act.color || 'blue'}-500/20`}>
                                                {act.module}
                                            </Badge>
                                            <span className="text-xs font-bold text-foreground">{act.name}</span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveAction(idx)}
                                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>

                                    {/* Action Config Fields */}
                                    {act.type === 'KONNECT_X_WHATSAPP' && (
                                        <div className="space-y-1 pt-1">
                                            <Label className="text-[11px] text-muted-foreground font-medium">WhatsApp Template Text (Variables: `{"{{contact_name}}"}`, `{"{{deal_title}}"}`, `{"{{deal_value}}"}`)</Label>
                                            <Textarea
                                                value={act.config.template || ''}
                                                onChange={(e) => handleUpdateActionConfig(idx, 'template', e.target.value)}
                                                rows={2}
                                                className="text-xs bg-muted/20"
                                            />
                                        </div>
                                    )}

                                    {act.type === 'PAYFLOW_INVOICE' && (
                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                            <div>
                                                <Label className="text-[11px] text-muted-foreground">GST / Tax Rate (%)</Label>
                                                <Input
                                                    type="number"
                                                    value={act.config.taxRate || 18}
                                                    onChange={(e) => handleUpdateActionConfig(idx, 'taxRate', parseInt(e.target.value))}
                                                    className="h-8 text-xs bg-muted/20"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-[11px] text-muted-foreground">Invoice Due Days</Label>
                                                <Input
                                                    type="number"
                                                    value={act.config.dueDays || 14}
                                                    onChange={(e) => handleUpdateActionConfig(idx, 'dueDays', parseInt(e.target.value))}
                                                    className="h-8 text-xs bg-muted/20"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {act.type === 'WEBHOOK_DISPATCH' && (
                                        <div className="space-y-1 pt-1">
                                            <Label className="text-[11px] text-muted-foreground">Target Webhook URL</Label>
                                            <Input
                                                value={act.config.endpoint || ''}
                                                onChange={(e) => handleUpdateActionConfig(idx, 'endpoint', e.target.value)}
                                                className="h-8 text-xs bg-muted/20"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add Action Buttons */}
                        <div className="pt-2">
                            <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                                Add Step to Flow:
                            </Label>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {ACTION_MODULES.map((mod) => {
                                    const ModIcon = mod.icon;
                                    return (
                                        <Button
                                            key={mod.type}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAddAction(mod)}
                                            className="h-8 text-xs gap-1.5 bg-background border-border/80 hover:bg-muted/50"
                                        >
                                            <ModIcon className="w-3.5 h-3.5" />
                                            <span>+ {mod.name.split(' ')[0]} {mod.module}</span>
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={onClose} className="h-9 text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="h-9 text-xs font-semibold gap-1.5 shadow-sm">
                            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                            <span>Create & Activate Automation</span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
