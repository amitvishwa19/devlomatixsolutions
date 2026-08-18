'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    FormInput,
    Sparkles,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { createForm } from '../_actions/formcraft-actions';

export function CreateFormModal({ open, onOpenChange, workspaceId, onFormCreated }) {
    const [creating, setCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Lead Generation');
    const [starterPreset, setStarterPreset] = useState('standard');

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!title.trim()) return toast.error("Please provide a form title");

        setCreating(true);

        let initialFields = ['Full Name', 'Email Address', 'Phone Number', 'Message'];
        if (starterPreset === 'consultation') {
            initialFields = ['Full Name', 'Company Name', 'Work Email', 'Estimated AI Tokens/Mo', 'Project Timeline'];
        } else if (starterPreset === 'survey') {
            initialFields = ['Customer Name', 'Product Rating (1-5)', 'Delivery Experience', 'Would you recommend us?', 'Additional Feedback'];
        } else if (starterPreset === 'hiring') {
            initialFields = ['Candidate Name', 'Email', 'GitHub / Portfolio URL', 'Years of Experience', 'Expected CTC / Notice Period'];
        }

        const res = await createForm(workspaceId, {
            title,
            description,
            category,
            fields: initialFields
        });

        if (res.success) {
            toast.success(`Form "${title}" created successfully!`);
            onOpenChange(false);
            setTitle('');
            setDescription('');
            if (onFormCreated) onFormCreated(res.data);
        } else {
            toast.error(res.error || "Failed to create form");
        }
        setCreating(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border/80 p-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-4 border-b border-border/60 bg-amber-500/10">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                            <FormInput className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Create New Form
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Set up an interactive form, survey, or lead capture intake widget.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleCreate} className="p-5 space-y-3.5 text-xs">
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Form Title</Label>
                        <Input
                            placeholder="e.g. Enterprise Client Onboarding Intake"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-8 text-xs bg-secondary/30 border-border/80"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Category / Purpose</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Lead Generation">Lead Generation & Sales Intake</SelectItem>
                                <SelectItem value="Customer Feedback">CSAT & Post-Purchase Feedback</SelectItem>
                                <SelectItem value="Candidate Screening">Job Application & Hiring Survey</SelectItem>
                                <SelectItem value="Support Request">Customer Support Intake</SelectItem>
                                <SelectItem value="Event Registration">Event / Webinar Registration</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Starter Field Preset</Label>
                        <Select value={starterPreset} onValueChange={setStarterPreset}>
                            <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="standard">Standard Lead Capture (Name, Email, Phone, Message)</SelectItem>
                                <SelectItem value="consultation">Enterprise SaaS (Company, Tokens, Timeline)</SelectItem>
                                <SelectItem value="survey">5-Star Feedback & CSAT Survey</SelectItem>
                                <SelectItem value="hiring">Job Pre-Screening (Portfolio, Exp, CTC)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Description / Subtitle</Label>
                        <Textarea
                            rows={2}
                            placeholder="Briefly explain what respondents will get by filling out this form..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="text-xs bg-secondary/30 border-border/80 resize-none font-normal"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                        <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={creating} className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-xs">
                            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create & Build Fields'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
