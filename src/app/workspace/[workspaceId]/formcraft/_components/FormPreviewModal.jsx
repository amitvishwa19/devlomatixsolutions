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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Eye,
    Send,
    CheckCircle2,
    Sparkles,
    Star,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { submitFormData } from '../_actions/formcraft-actions';

export function FormPreviewModal({ open, onOpenChange, workspaceId, form, onSubmitted }) {
    if (!form) return null;

    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({});
    const [isComplete, setIsComplete] = useState(false);

    const fields = form.fields || ['Full Name', 'Email Address', 'Message'];

    const handleChange = (field, val) => {
        setFormData({ ...formData, [field]: val });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const res = await submitFormData(workspaceId, form.id, formData);
        if (res.success) {
            setIsComplete(true);
            toast.success("Test response recorded successfully!");
            if (onSubmitted) onSubmitted(res.data);
        } else {
            toast.error(res.error || "Failed to submit form");
        }
        setSubmitting(false);
    };

    const handleReset = () => {
        setFormData({});
        setIsComplete(false);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) handleReset();
            onOpenChange(val);
        }}>
            <DialogContent className="sm:max-w-xl bg-card border-border/80 p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <DialogHeader className="p-4 border-b border-border/60 bg-amber-500/10 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                            <Eye className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Form Live Simulator: {form.title}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Test interactive response flow exactly as respondents see it.
                            </DialogDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/30">
                        PREVIEW MODE
                    </Badge>
                </DialogHeader>

                <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
                    {isComplete ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-bold text-foreground">Thank you for your response!</h3>
                                <p className="text-xs text-muted-foreground max-w-sm">
                                    Your answers have been ingested into Devlomatix FormCraft and routed to team notifications.
                                </p>
                            </div>
                            <Button size="sm" onClick={handleReset} variant="outline" className="h-7 text-xs border-border/80 mt-2">
                                Submit Another Response
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1 border-b border-border/40 pb-3">
                                <h2 className="text-base font-bold text-foreground">{form.title}</h2>
                                <p className="text-xs text-muted-foreground">{form.description || 'Please fill out the fields below.'}</p>
                            </div>

                            <div className="space-y-3">
                                {fields.map((f, idx) => {
                                    const fieldLabel = typeof f === 'string' ? f : f.label;
                                    const isTextArea = fieldLabel.toLowerCase().includes('message') ||
                                                       fieldLabel.toLowerCase().includes('feedback') ||
                                                       fieldLabel.toLowerCase().includes('comment') ||
                                                       fieldLabel.toLowerCase().includes('description');
                                    const isEmail = fieldLabel.toLowerCase().includes('email');
                                    const isRating = fieldLabel.toLowerCase().includes('rating');

                                    return (
                                        <div key={idx} className="space-y-1">
                                            <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                                                <span>{fieldLabel}</span>
                                                <span className="text-[10px] text-muted-foreground font-normal">Required</span>
                                            </Label>

                                            {isRating ? (
                                                <div className="flex items-center gap-1.5 py-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => handleChange(fieldLabel, `${star} Stars`)}
                                                            className={`p-1.5 rounded-md border transition-colors ${
                                                                formData[fieldLabel] >= `${star}`
                                                                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-500'
                                                                    : 'bg-secondary/30 border-border/60 text-muted-foreground hover:text-foreground'
                                                            }`}
                                                        >
                                                            <Star className="w-4 h-4 fill-current" />
                                                        </button>
                                                    ))}
                                                    <span className="ml-2 text-xs font-semibold text-amber-500">
                                                        {formData[fieldLabel] || 'Select rating'}
                                                    </span>
                                                </div>
                                            ) : isTextArea ? (
                                                <Textarea
                                                    rows={3}
                                                    placeholder={`Enter your ${fieldLabel.toLowerCase()}...`}
                                                    value={formData[fieldLabel] || ''}
                                                    onChange={(e) => handleChange(fieldLabel, e.target.value)}
                                                    className="text-xs bg-secondary/30 border-border/80 resize-none font-normal"
                                                    required
                                                />
                                            ) : (
                                                <Input
                                                    type={isEmail ? 'email' : 'text'}
                                                    placeholder={`Enter ${fieldLabel.toLowerCase()}...`}
                                                    value={formData[fieldLabel] || ''}
                                                    onChange={(e) => handleChange(fieldLabel, e.target.value)}
                                                    className="h-8 text-xs bg-secondary/30 border-border/80"
                                                    required
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="pt-2 border-t border-border/40 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-xs"
                                >
                                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                    Submit Form Response
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
