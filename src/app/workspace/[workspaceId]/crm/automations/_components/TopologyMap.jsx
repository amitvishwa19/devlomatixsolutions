'use client';

import React from 'react';
import {
    Zap,
    MessageCircle,
    Receipt,
    Sparkles,
    Activity,
    Briefcase,
    Workflow,
    ArrowRight,
    CheckCircle2,
    Layers,
    Share2,
    ShieldCheck
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function TopologyMap() {
    const modules = [
        {
            id: 'crm',
            name: 'Enterprise CRM Core',
            desc: 'Deals, 360° Contacts, Pipelines & Activity Stream',
            icon: Layers,
            color: 'from-blue-600 to-indigo-600',
            textColor: 'text-blue-500',
            badge: 'Central Orchestrator'
        },
        {
            id: 'konnectx',
            name: 'KonnectX WhatsApp Cloud',
            desc: 'Real-time 2-way messaging, proposal templates & drip sequences',
            icon: MessageCircle,
            color: 'from-emerald-500 to-green-600',
            textColor: 'text-emerald-500',
            badge: 'Active Synced'
        },
        {
            id: 'payflow',
            name: 'PayFlow Invoicing & Billing',
            desc: 'Automatic GST invoices, payment links & customer LTV sync',
            icon: Receipt,
            color: 'from-cyan-500 to-blue-600',
            textColor: 'text-cyan-500',
            badge: 'Connected'
        },
        {
            id: 'hireflow',
            name: 'Hireflow ATS & Talent Hub',
            desc: 'Candidate conversion to CRM deals and placement tracking',
            icon: Briefcase,
            color: 'from-violet-500 to-purple-600',
            textColor: 'text-violet-500',
            badge: 'Bridged'
        },
        {
            id: 'flowgenix',
            name: 'FlowGenix AI Gateway',
            desc: 'Predictive win scoring, stalled deal detection & smart copy',
            icon: Sparkles,
            color: 'from-amber-500 to-orange-600',
            textColor: 'text-amber-500',
            badge: 'AI Powered'
        },
        {
            id: 'flowforge',
            name: 'FlowForge Workflow Engine',
            desc: 'State machine execution, node chains & webhook relays',
            icon: Workflow,
            color: 'from-rose-500 to-pink-600',
            textColor: 'text-rose-500',
            badge: 'Live State Machine'
        }
    ];

    const flows = [
        {
            from: 'CRM (Stage: Proposal Sent)',
            to: 'KonnectX WhatsApp',
            action: 'Auto-dispatches proposal summary & document link with 0 latency.',
            type: 'Outreach'
        },
        {
            from: 'CRM (Stage: Closed Won)',
            to: 'PayFlow Billing',
            action: 'Generates official GST draft invoice with client details & full deal value.',
            type: 'Finance'
        },
        {
            from: 'Hireflow (Candidate Placed)',
            to: 'CRM Pipeline',
            action: 'Instantly provisions a won deal in the Talent Placement pipeline.',
            type: 'Recruitment'
        },
        {
            from: 'FlowGenix (Risk Detected)',
            to: 'FlowForge Webhooks',
            action: 'Alerts deal owners and creates high-priority recovery task.',
            type: 'Automation'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Grid of Integrated Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {modules.map((mod) => {
                    const Icon = mod.icon;
                    return (
                        <div
                            key={mod.id}
                            className="p-5 rounded-3xl bg-card border border-border/80 relative overflow-hidden transition-all duration-200 hover:border-primary/40 shadow-xs group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${mod.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <Badge className="bg-muted text-foreground text-[10px] border-border/80">
                                    <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-emerald-500" />
                                    {mod.badge}
                                </Badge>
                            </div>
                            <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                                {mod.name}
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {mod.desc}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Cross-Module Event Bus Streams */}
            <div className="p-6 rounded-3xl bg-card border border-border/80 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <div>
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span>Live Cross-Module Event Bus Routes</span>
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Active event routes orchestrated via FlowForge Bridge without manual intervention.
                        </p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[11px] font-semibold">
                        4 Active Routes
                    </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {flows.map((flow, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-muted/20 border border-border/70 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center">
                                        {idx + 1}
                                    </span>
                                    {flow.from}
                                </span>
                                <Badge variant="outline" className="text-[10px] uppercase font-bold">
                                    {flow.type}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                                <span>Bridge:</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                                <span>{flow.to}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {flow.action}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
