'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
    FormInput,
    FileEdit,
    Inbox,
    Copy,
    ExternalLink,
    Plus,
    Search,
    BarChart3,
    CheckCircle2,
    Eye,
    Sparkles,
    Share2,
    Layers,
    Code,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getForms } from './_actions/formcraft-actions';
import { CreateFormModal } from './_components/CreateFormModal';
import { FormFieldBuilderModal } from './_components/FormFieldBuilderModal';
import { FormShareEmbedModal } from './_components/FormShareEmbedModal';
import { FormPreviewModal } from './_components/FormPreviewModal';

export default function FormCraftDashboard() {
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

    const totalSubmissions = forms.reduce((acc, f) => acc + (f.submissionsCount || 0), 0);
    const totalViews = forms.reduce((acc, f) => acc + (f.viewsCount || 0), 0);

    const stats = [
        { label: 'Published Forms', value: `${forms.length}`, change: '+2 active this month', icon: FormInput, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
        { label: 'Total Submissions', value: `${totalSubmissions.toLocaleString()}`, change: '+24% conversion rate', icon: Inbox, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
        { label: 'Avg Completion Rate', value: '78.4%', change: '+5.2% vs industry avg', icon: BarChart3, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
        { label: 'Form Views (30d)', value: `${totalViews.toLocaleString()}`, change: '8.2s avg time spent', icon: Eye, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' }
    ];

    const filtered = forms.filter(f =>
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-primary/5 to-transparent p-5 rounded-2xl border border-border/80">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <FormInput className="w-5 h-5 text-amber-500" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">FormCraft Builder & Surveys</h1>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px] font-mono">
                            NO-CODE FORMS
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-xl">
                        Create custom dynamic forms, surveys, and polls. Collect responses directly into Contacts and automate follow-ups.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/workspace/${workspaceId}/formcraft/templates`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs border-border/80 gap-1.5 shadow-xs">
                            <Layers className="w-3.5 h-3.5" />
                            Templates
                        </Button>
                    </Link>
                    <Button
                        size="sm"
                        onClick={() => setIsCreateOpen(true)}
                        className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Create Form
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className="bg-card border-border/80 shadow-xs hover:border-border transition-colors">
                            <CardHeader className="py-0 px-3 border-b border-border/40 space-y-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                                    <div className={`w-7 h-7 rounded-md flex items-center justify-center border shrink-0 ${stat.color}`}>
                                        <stat.icon className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 pt-2">
                                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                                <span className="text-[10px] text-muted-foreground">{stat.change}</span>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Forms List Header & Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <FileEdit className="w-4 h-4 text-amber-500" />
                    <h2 className="text-sm font-bold text-foreground">Your Forms & Polls</h2>
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
            </div>

            {/* Forms Grid */}
            {loading ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" /> Loading forms...
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                    No forms found matching your query
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {filtered.map((form) => (
                        <Card key={form.id} className="bg-card border-border/80 hover:border-amber-500/40 transition-all shadow-xs flex flex-col justify-between">
                            <CardHeader className="py-2 px-3.5 border-b border-border/40 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-sm text-foreground">{form.title}</span>
                                    <Badge
                                        variant="outline"
                                        className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                                            form.status === 'Live'
                                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                        }`}
                                    >
                                        {form.status}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">{form.description}</p>
                            </CardHeader>
                            <CardContent className="p-3.5 pt-2.5 space-y-3">
                                <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-lg bg-secondary/30 border border-border/40 text-center">
                                    <div>
                                        <span className="text-[10px] text-muted-foreground block">Submissions</span>
                                        <span className="font-bold text-xs text-foreground">{form.submissionsCount || 0}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-muted-foreground block">Views</span>
                                        <span className="font-bold text-xs text-foreground">{form.viewsCount || 0}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-muted-foreground block">Conversion</span>
                                        <span className="font-bold text-xs text-emerald-500">{form.conversion || '0%'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-1">
                                    <span className="text-[10px] text-muted-foreground">Updated {form.updatedAt}</span>
                                    <div className="flex items-center gap-1.5 flex-wrap">
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
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs px-2.5 border-border/80 gap-1"
                                            onClick={() => {
                                                setSelectedFormForShare(form);
                                                setIsShareOpen(true);
                                            }}
                                        >
                                            <Share2 className="w-3 h-3" />
                                            Share
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setSelectedFormForBuilder(form);
                                                setIsBuilderOpen(true);
                                            }}
                                            className="h-7 text-xs bg-secondary hover:bg-secondary/80 text-foreground border border-border/60"
                                        >
                                            Edit Fields
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
