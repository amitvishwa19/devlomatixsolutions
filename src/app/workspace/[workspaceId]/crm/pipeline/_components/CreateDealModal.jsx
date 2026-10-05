'use client';

import React, { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Users, Building2 } from 'lucide-react';
import { toast } from "sonner";
import { createDealAction } from "../../_actions/deal-actions";
import { getAccountsAction } from "../../_actions/account-actions";

export default function CreateDealModal({ isOpen, onClose, workspaceId, pipelines = [], defaultStageId, onDealCreated }) {
    const [title, setTitle] = useState('');
    const [value, setValue] = useState('');
    const [currency, setCurrency] = useState('INR');
    const [pipelineId, setPipelineId] = useState('');
    const [stageId, setStageId] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [expectedClose, setExpectedClose] = useState('');
    const [accountId, setAccountId] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        // Set default pipeline and stage
        if (pipelines.length > 0) {
            const initialPipeline = pipelines.find(p => p.isDefault) || pipelines[0];
            setPipelineId(initialPipeline.id);
            if (defaultStageId) {
                setStageId(defaultStageId);
            } else if (initialPipeline.stages?.length > 0) {
                setStageId(initialPipeline.stages[0].id);
            }
        }

        // Fetch accounts for linkage
        async function fetchAccounts() {
            try {
                const res = await getAccountsAction(workspaceId);
                if (res.success) setAccounts(res.data);
            } catch (e) {
                console.error("Failed to load accounts:", e);
            }
        }
        fetchAccounts();
    }, [isOpen, pipelines, defaultStageId, workspaceId]);

    const activePipeline = pipelines.find(p => p.id === pipelineId);
    const availableStages = activePipeline?.stages || [];

    const handlePipelineChange = (newPipelineId) => {
        setPipelineId(newPipelineId);
        const p = pipelines.find(x => x.id === newPipelineId);
        if (p?.stages?.length > 0) {
            setStageId(p.stages[0].id);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Deal title is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await createDealAction(workspaceId, {
                title: title.trim(),
                value: parseFloat(value) || 0,
                currency,
                pipelineId,
                stageId,
                accountId: accountId && accountId !== '__none__' ? accountId : null,
                priority,
                expectedClose: expectedClose || null
            });

            if (res.success) {
                toast.success("Deal created successfully!");
                setTitle('');
                setValue('');
                setAccountId('');
                onClose();
                onDealCreated && onDealCreated(res.data);
            } else {
                toast.error(res.error || "Failed to create deal");
            }
        } catch (error) {
            toast.error("Error creating deal");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card border-border">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="p-6 pb-4 border-b border-border bg-muted/20">
                        <DialogTitle className="text-base font-bold text-foreground">Create New Deal</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Track revenue opportunities, client proposals, and placement commissions.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-4">
                        {/* Title */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Deal Title *</Label>
                            <Input
                                placeholder="e.g. Acme Corp Enterprise WhatsApp License"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="h-8 text-xs bg-background"
                                required
                            />
                        </div>

                        {/* Value & Currency */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-xs font-semibold">Deal Value</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    className="h-8 text-xs bg-background"
                                    min="0"
                                    step="any"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Currency</Label>
                                <Select value={currency} onValueChange={setCurrency}>
                                    <SelectTrigger className="h-8 text-xs bg-background">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INR">INR (₹)</SelectItem>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                        <SelectItem value="GBP">GBP (£)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Pipeline & Stage */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Pipeline</Label>
                                <Select value={pipelineId} onValueChange={handlePipelineChange}>
                                    <SelectTrigger className="h-8 text-xs bg-background">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pipelines.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Stage</Label>
                                <Select value={stageId} onValueChange={setStageId}>
                                    <SelectTrigger className="h-8 text-xs bg-background">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableStages.map(s => (
                                            <SelectItem key={s.id} value={s.id}>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                                                    <span>{s.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Company / Account Linkage */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                Associated Company (Optional)
                            </Label>
                            <Select value={accountId} onValueChange={setAccountId}>
                                <SelectTrigger className="h-8 text-xs bg-background">
                                    <SelectValue placeholder="Select or search company..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">None / Independent</SelectItem>
                                    {accounts.map(acc => (
                                        <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority & Expected Close Date */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Priority</Label>
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger className="h-8 text-xs bg-background">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                        <SelectItem value="URGENT">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Expected Close Date</Label>
                                <Input
                                    type="date"
                                    value={expectedClose}
                                    onChange={(e) => setExpectedClose(e.target.value)}
                                    className="h-8 text-xs bg-background"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-4 border-t border-border bg-muted/20">
                        <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" className="font-semibold shadow-sm" disabled={isSubmitting || !title.trim()}>
                            {isSubmitting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                            Create Deal
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
