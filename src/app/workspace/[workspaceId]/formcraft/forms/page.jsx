'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    FormInput,
    Plus,
    Search,
    Share2,
    Edit,
    CheckCircle2,
    Eye,
    Trash2,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getForms, toggleFormStatus, deleteForm } from '../_actions/formcraft-actions';
import { CreateFormModal } from '../_components/CreateFormModal';
import { FormFieldBuilderModal } from '../_components/FormFieldBuilderModal';
import { FormShareEmbedModal } from '../_components/FormShareEmbedModal';
import { FormPreviewModal } from '../_components/FormPreviewModal';

export default function FormCraftFormsPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedFormForBuilder, setSelectedFormForBuilder] = useState(null);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [selectedFormForShare, setSelectedFormForShare] = useState(null);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [selectedFormForPreview, setSelectedFormForPreview] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const res = await getForms(workspaceId);
        if (res.success) setForms(res.data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const handleToggle = async (id) => {
        const res = await toggleFormStatus(workspaceId, id);
        if (res.success) {
            toast.success(`Form status set to ${res.data.status}`);
            loadData();
        }
    };

    const handleDelete = async (id) => {
        const res = await deleteForm(workspaceId, id);
        if (res.success) {
            toast.success("Form removed successfully");
            loadData();
        }
    };

    const filtered = forms.filter(f =>
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <FormInput className="w-4 h-4 text-amber-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Custom Forms & Dynamic Fields</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Manage active response collection forms, surveys, and embedded lead capture widgets.</p>
                </div>

                <Button
                    size="sm"
                    onClick={() => setIsCreateOpen(true)}
                    className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-xs"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Create Form
                </Button>
            </div>

            <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                    placeholder="Search forms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs bg-secondary/30 border-border/80"
                />
            </div>

            {loading ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" /> Loading forms...
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                    No custom forms found
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {filtered.map((form) => (
                        <Card key={form.id} className="bg-card border-border/80 hover:border-amber-500/40 transition-all shadow-xs flex flex-col justify-between">
                            <CardHeader className="py-2 px-3.5 border-b border-border/40 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-sm text-foreground">{form.title}</span>
                                    <div className="flex items-center gap-1.5">
                                        <Badge
                                            variant="outline"
                                            onClick={() => handleToggle(form.id)}
                                            className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full cursor-pointer ${
                                                form.status === 'Live'
                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                    : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                            }`}
                                        >
                                            {form.status}
                                        </Badge>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">{form.description}</p>
                            </CardHeader>
                            <CardContent className="p-3.5 pt-2.5 space-y-3">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Configured Fields:</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {form.fields && form.fields.map((f, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-[10px] bg-secondary/60">
                                                {typeof f === 'string' ? f : f.label}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground gap-1"
                                            onClick={() => {
                                                setSelectedFormForPreview(form);
                                                setIsPreviewOpen(true);
                                            }}
                                        >
                                            <Eye className="w-3 h-3" />
                                            Preview
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground gap-1"
                                            onClick={() => {
                                                setSelectedFormForShare(form);
                                                setIsShareOpen(true);
                                            }}
                                        >
                                            <Share2 className="w-3 h-3" />
                                            Share
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setSelectedFormForBuilder(form);
                                                setIsBuilderOpen(true);
                                            }}
                                            className="h-7 text-xs bg-secondary hover:bg-secondary/80 text-foreground border border-border/60 gap-1"
                                        >
                                            <Edit className="w-3 h-3" />
                                            Fields
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(form.id)}
                                            className="h-7 w-7 text-rose-500 hover:bg-rose-500/10"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Form Modal */}
            <CreateFormModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                workspaceId={workspaceId}
                onFormCreated={() => loadData()}
            />

            {/* Form Field Builder Modal */}
            <FormFieldBuilderModal
                open={isBuilderOpen}
                onOpenChange={setIsBuilderOpen}
                workspaceId={workspaceId}
                form={selectedFormForBuilder}
                onFieldsUpdated={() => loadData()}
            />

            {/* Form Share & Embed Modal */}
            <FormShareEmbedModal
                open={isShareOpen}
                onOpenChange={setIsShareOpen}
                form={selectedFormForShare}
            />

            {/* Form Live Preview Modal */}
            <FormPreviewModal
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                workspaceId={workspaceId}
                form={selectedFormForPreview}
                onSubmitted={() => loadData()}
            />
        </div>
    );
}
