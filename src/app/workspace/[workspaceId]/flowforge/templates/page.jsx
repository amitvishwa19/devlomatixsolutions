'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Layers,
    Sparkles,
    ShoppingBag,
    MessageSquare,
    Bot,
    Mail,
    ArrowUpRight,
    Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { CreateWorkflowSheet } from '../_components/CreateWorkflowSheet';

export default function FlowForgeTemplatesPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const templates = [
        {
            title: 'AI WhatsApp Order Confirmation & Tracking',
            category: 'eCommerce',
            trigger: 'eCommerce Order Created',
            description: 'Triggers on Shopify/eCommerce order, creates tracking link, and dispatches rich interactive WhatsApp notification.',
            icon: ShoppingBag,
            color: 'text-amber-500 bg-amber-500/10',
            badge: 'Most Popular',
            stepsCount: 4
        },
        {
            title: 'Candidate Resume AI Screening & Stage Transition',
            category: 'HR & Hiring',
            trigger: 'HireFlow New Application',
            description: 'Ingests applicant CV from HireFlow, evaluates technical skills with FlowGenix, tags scorecard and sends interview invite.',
            icon: Bot,
            color: 'text-purple-500 bg-purple-500/10',
            badge: 'AI Powered',
            stepsCount: 5
        },
        {
            title: 'Form Lead Intent Scoring & Instant WhatsApp Welcome',
            category: 'Marketing',
            trigger: 'FormCraft Response Submitted',
            description: 'Scores B2B form submission, enriches email domain, creates Contact and assigns sales agent in DeskFlow.',
            icon: MessageSquare,
            color: 'text-emerald-500 bg-emerald-500/10',
            badge: 'High Conversion',
            stepsCount: 6
        },
        {
            title: 'Daily KPI Snapshot to Executive Email & Telegram',
            category: 'Operations',
            trigger: 'Scheduled Cron Timer',
            description: 'Runs every midnight, aggregates eCommerce sales, WhatsApp engagement and sends rich PDF digest.',
            icon: Mail,
            color: 'text-sky-500 bg-sky-500/10',
            badge: 'Reporting',
            stepsCount: 3
        }
    ];

    const handleUseTemplate = (tpl) => {
        setSelectedTemplate({
            name: tpl.title,
            description: tpl.description,
            category: tpl.category,
            trigger: tpl.trigger
        });
        setIsSheetOpen(true);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <Layers className="w-4 h-4 text-indigo-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Automation Blueprints & Templates</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Pre-engineered multi-step automation templates ready to deploy in 1 click.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((tpl) => (
                    <Card key={tpl.title} className="bg-card border-border/80 hover:border-indigo-500/40 transition-all p-4 space-y-3 shadow-xs flex flex-col justify-between">
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg ${tpl.color}`}>
                                        <tpl.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">{tpl.category}</span>
                                </div>
                                <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20">{tpl.badge}</Badge>
                            </div>
                            <div>
                                <h3 className="font-semibold text-xs text-foreground">{tpl.title}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{tpl.description}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/40">
                            <span className="text-[11px] font-mono text-muted-foreground">{tpl.stepsCount} Node Steps</span>
                            <Button
                                size="sm"
                                onClick={() => handleUseTemplate(tpl)}
                                className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1 shadow-xs"
                            >
                                <Zap className="w-3 h-3" /> Use Blueprint
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Create Workflow Sheet Modal */}
            <CreateWorkflowSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                workspaceId={workspaceId}
                initialData={selectedTemplate}
                onWorkflowCreated={() => {
                    toast.success("Workflow deployed from blueprint!");
                }}
            />
        </div>
    );
}
