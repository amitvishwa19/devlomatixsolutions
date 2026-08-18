'use client';

import React, { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    FormInput,
    Plus,
    Trash2,
    GripVertical,
    Save,
    Type,
    Mail,
    Phone,
    List,
    Star,
    FileUp,
    Calendar,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { updateFormFields } from '../_actions/formcraft-actions';

export function FormFieldBuilderModal({ open, onOpenChange, workspaceId, form, onFieldsUpdated }) {
    if (!form) return null;

    const [saving, setSaving] = useState(false);
    const [fields, setFields] = useState([]);
    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldType, setNewFieldType] = useState('Text');

    useEffect(() => {
        if (form?.fields) {
            setFields(form.fields.map((f, idx) => {
                if (typeof f === 'string') {
                    return { id: `f-${idx}`, label: f, type: 'Text', required: true };
                }
                return f;
            }));
        }
    }, [form]);

    const handleAddField = () => {
        if (!newFieldName.trim()) return toast.error("Enter a field label");
        setFields([
            ...fields,
            {
                id: `f-${Date.now()}`,
                label: newFieldName.trim(),
                type: newFieldType,
                required: false
            }
        ]);
        setNewFieldName('');
        toast.success(`Field "${newFieldName}" added!`);
    };

    const handleRemoveField = (id) => {
        if (fields.length <= 1) return toast.info("Form must contain at least 1 field");
        setFields(fields.filter(f => f.id !== id));
    };

    const handleToggleRequired = (id) => {
        setFields(fields.map(f => f.id === id ? { ...f, required: !f.required } : f));
    };

    const handleSave = async () => {
        setSaving(true);
        const fieldLabels = fields.map(f => f.label);
        const res = await updateFormFields(workspaceId, form.id, fieldLabels);
        if (res.success) {
            toast.success(`Saved ${fields.length} fields schema for "${form.title}"!`);
            onOpenChange(false);
            if (onFieldsUpdated) onFieldsUpdated(res.data);
        } else {
            toast.error(res.error || "Failed to update form fields");
        }
        setSaving(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl bg-card border-border/80 p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <DialogHeader className="p-4 border-b border-border/60 bg-amber-500/10">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                            <FormInput className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Form Schema Builder: {form.title}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Configure input questions, validation constraints, and capture fields.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                    {/* Add Field Bar */}
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 space-y-2">
                        <Label className="text-xs font-semibold text-foreground">Add New Form Field</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                            <div className="sm:col-span-6">
                                <Input
                                    placeholder="Question or Field Label (e.g. Budget Range)..."
                                    value={newFieldName}
                                    onChange={(e) => setNewFieldName(e.target.value)}
                                    className="h-8 text-xs bg-card border-border/80"
                                />
                            </div>
                            <div className="sm:col-span-4">
                                <Select value={newFieldType} onValueChange={setNewFieldType}>
                                    <SelectTrigger className="h-8 text-xs bg-card border-border/80">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Text">Short Text</SelectItem>
                                        <SelectItem value="Email">Email Address</SelectItem>
                                        <SelectItem value="Phone">Phone Number</SelectItem>
                                        <SelectItem value="Number">Number</SelectItem>
                                        <SelectItem value="Textarea">Long Paragraph</SelectItem>
                                        <SelectItem value="Dropdown">Dropdown Selector</SelectItem>
                                        <SelectItem value="Rating">Star Rating (1-5)</SelectItem>
                                        <SelectItem value="File">File Attachment</SelectItem>
                                        <SelectItem value="Date">Date Picker</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="sm:col-span-2">
                                <Button
                                    type="button"
                                    onClick={handleAddField}
                                    size="sm"
                                    className="w-full h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1"
                                >
                                    <Plus className="w-3 h-3" /> Add
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Field Schema List */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-semibold">
                            <span>Form Questions ({fields.length})</span>
                            <span>Required?</span>
                        </div>

                        <div className="space-y-2">
                            {fields.map((f, index) => (
                                <div
                                    key={f.id || index}
                                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/20 border border-border/40 hover:border-border/80 transition-colors"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <GripVertical className="w-3.5 h-3.5 text-muted-foreground cursor-grab" />
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[10px] font-mono bg-secondary/60">
                                                #{index + 1}
                                            </Badge>
                                            <span className="font-semibold text-xs text-foreground">{f.label}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[11px] text-muted-foreground">{f.required ? 'Required' : 'Optional'}</span>
                                            <Switch
                                                checked={f.required}
                                                onCheckedChange={() => handleToggleRequired(f.id)}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveField(f.id)}
                                            className="h-7 w-7 text-muted-foreground hover:text-rose-500"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-border/60 bg-secondary/15 flex items-center justify-between gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-xs"
                    >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Form Schema
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
