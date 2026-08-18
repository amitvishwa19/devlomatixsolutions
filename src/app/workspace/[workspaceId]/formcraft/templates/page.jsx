'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    LayoutTemplate,
    Sparkles,
    UserCheck,
    MessageSquare,
    Star,
    CheckCircle2,
    Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { createForm } from '../_actions/formcraft-actions';
import { TemplatePreviewModal } from '../_components/TemplatePreviewModal';

export default function FormCraftTemplatesPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const templates = [
        {
            title: 'B2B Enterprise Lead Capture',
            category: 'Sales & Marketing',
            fieldsCount: 5,
            fields: ['Full Name', 'Company Name', 'Work Email', 'Estimated AI Tokens/Mo', 'Project Timeline'],
            description: 'Captures company size, estimated budget, product requirements, and routes to WhatsApp sales team.',
            icon: UserCheck,
            color: 'text-amber-500 bg-amber-500/10'
        },
        {
            title: 'Customer CSAT & Net Promoter Score (NPS)',
            category: 'Customer Success',
            fieldsCount: 5,
            fields: ['Customer Name', 'Product Rating (1-5)', 'Delivery Experience', 'Would you recommend us?', 'Additional Feedback'],
            description: '1-10 rating scale with dynamic conditional follow-up questions based on rating score.',
            icon: Star,
            color: 'text-emerald-500 bg-emerald-500/10'
        },
        {
            title: 'Software Engineer Application Questionnaire',
            category: 'HireFlow & HR',
            fieldsCount: 5,
            fields: ['Candidate Name', 'Email Address', 'GitHub / Portfolio URL', 'Years of Experience', 'Expected CTC / Notice Period'],
            description: 'Multi-step pre-screening form for engineering applicants with resume upload and portfolio link.',
            icon: Sparkles,
            color: 'text-purple-500 bg-purple-500/10'
        },
        {
            title: 'Product Feature Voting & Community Poll',
            category: 'Product Feedback',
            fieldsCount: 4,
            fields: ['User Name', 'Top Feature Request', 'Urgency Level', 'Use Case Description'],
            description: 'Interactive choice selection poll to let users vote on upcoming roadmap milestones.',
            icon: MessageSquare,
            color: 'text-sky-500 bg-sky-500/10'
        }
    ];

    const handleUse = async (tpl) => {
        const res = await createForm(workspaceId, {
            title: tpl.title,
            description: tpl.description,
            fields: tpl.fields
        });
        if (res.success) {
            toast.success(`Form "${tpl.title}" created from blueprint!`);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <LayoutTemplate className="w-4 h-4 text-amber-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Form & Survey Blueprints</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Ready-to-use form layouts designed for high completion rates and lead conversion.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((tpl) => (
                    <Card key={tpl.title} className="bg-card border-border/80 hover:border-amber-500/40 transition-all p-4 space-y-3 shadow-xs flex flex-col justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg ${tpl.color}`}>
                                        <tpl.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">{tpl.category}</span>
                                </div>
                                <Badge variant="secondary" className="text-[9px] font-mono">{tpl.fieldsCount} Fields</Badge>
                            </div>
                            <div>
                                <h3 className="font-semibold text-xs text-foreground">{tpl.title}</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">{tpl.description}</p>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSelectedTemplate(tpl);
                                    setIsPreviewOpen(true);
                                }}
                                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                            >
                                <Eye className="w-3 h-3" />
                                Preview Schema
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleUse(tpl)}
                                className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1 shadow-xs"
                            >
                                <Sparkles className="w-3 h-3" />
                                Use Blueprint
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Template Preview Modal */}
            <TemplatePreviewModal
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                template={selectedTemplate}
                onUseTemplate={(tpl) => handleUse(tpl)}
            />
        </div>
    );
}
