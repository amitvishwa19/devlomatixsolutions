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
import {
    Workflow,
    Zap,
    Bot,
    MessageSquare,
    ShoppingBag,
    CheckCircle2,
    Play,
    Plus,
    Layers,
    ArrowRight,
    Sparkles,
    Settings,
    Clock,
    Database,
    Shield
} from 'lucide-react';
import { toast } from 'sonner';

export function WorkflowCanvasModal({ open, onOpenChange, workflow }) {
    const [runningTest, setRunningTest] = useState(false);
    const [selectedNode, setSelectedNode] = useState(0);

    const nodes = [
        {
            id: 'node-1',
            title: workflow?.trigger || 'Inbound Trigger Event',
            type: 'Trigger Node',
            desc: 'Listens for real-time payload events and extracts event variables.',
            icon: Zap,
            color: 'text-amber-500 bg-amber-500/10 border-amber-500/30'
        },
        {
            id: 'node-2',
            title: 'FlowGenix AI Intelligence & Router',
            type: 'AI Decision Step',
            desc: 'Evaluates customer intent, scores urgency, and generates personalized responses.',
            icon: Bot,
            color: 'text-purple-500 bg-purple-500/10 border-purple-500/30'
        },
        {
            id: 'node-3',
            title: 'KonnectX WhatsApp Dispatcher',
            type: 'Action Step',
            desc: 'Sends WhatsApp interactive message template with dynamic variables.',
            icon: MessageSquare,
            color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
        },
        {
            id: 'node-4',
            title: 'Workspace Database & Audit Log',
            type: 'Storage Step',
            desc: 'Updates contact timeline, appends order state, and writes to audit logs.',
            icon: Database,
            color: 'text-sky-500 bg-sky-500/10 border-sky-500/30'
        }
    ];

    const handleRunTest = () => {
        setRunningTest(true);
        toast.info("Executing simulated pipeline run across all 4 nodes...");
        setTimeout(() => {
            setRunningTest(false);
            toast.success("Simulation passed! All 4 nodes executed in 240ms (200 OK).");
        }, 1200);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl bg-card border-border/80 p-0 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <DialogHeader className="p-4 border-b border-border/60 bg-secondary/15 flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                                <Workflow className="w-4 h-4" />
                            </div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                {workflow?.name || 'Workflow Topology Canvas'}
                            </DialogTitle>
                            <Badge variant="outline" className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 border-emerald-500/20">
                                {workflow?.status || 'active'}
                            </Badge>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Visual pipeline orchestration with FlowGenix AI logic and multi-channel connectors.
                        </DialogDescription>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleRunTest}
                            disabled={runningTest}
                            className="h-7 text-xs border border-border/60 gap-1 hover:bg-emerald-500/10 hover:text-emerald-500"
                        >
                            <Play className={`w-3 h-3 ${runningTest ? 'animate-spin' : ''}`} />
                            {runningTest ? 'Testing...' : 'Test Run'}
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                toast.success("Workflow canvas topology saved!");
                                onOpenChange(false);
                            }}
                            className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                        >
                            Save Changes
                        </Button>
                    </div>
                </DialogHeader>

                {/* Canvas Workspace */}
                <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
                    {/* Visual Topology Diagram */}
                    <div className="md:col-span-2 p-6 bg-secondary/10 overflow-y-auto space-y-4 border-r border-border/40 flex flex-col justify-center items-center">
                        <div className="w-full max-w-md space-y-3">
                            {nodes.map((node, index) => (
                                <React.Fragment key={node.id}>
                                    <div
                                        onClick={() => setSelectedNode(index)}
                                        className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                                            selectedNode === index
                                                ? 'bg-card border-indigo-500 ring-2 ring-indigo-500/20'
                                                : 'bg-card/70 border-border/60 hover:bg-card hover:border-border'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`p-2 rounded-lg border shrink-0 ${node.color}`}>
                                                    <node.icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-semibold font-mono uppercase text-muted-foreground block">{node.type}</span>
                                                    <span className="font-semibold text-xs text-foreground">{node.title}</span>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] font-mono">Step {index + 1}</Badge>
                                        </div>
                                    </div>
                                    {index < nodes.length - 1 && (
                                        <div className="flex justify-center my-0.5">
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono bg-secondary/60 px-2 py-0.5 rounded-full border border-border/40">
                                                <ArrowRight className="w-2.5 h-2.5 rotate-90 text-indigo-500" /> Pass Payload
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Node Config Inspector Panel */}
                    <div className="p-4 space-y-4 bg-card overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-border/40 pb-3">
                            <div>
                                <span className="text-[10px] font-semibold uppercase text-muted-foreground">Node Properties</span>
                                <h4 className="font-bold text-xs text-foreground">{nodes[selectedNode]?.title}</h4>
                            </div>
                            <Badge variant="secondary" className="text-[9px]">{nodes[selectedNode]?.type}</Badge>
                        </div>

                        <div className="space-y-3 text-xs">
                            <p className="text-muted-foreground leading-relaxed">
                                {nodes[selectedNode]?.desc}
                            </p>

                            <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 space-y-2">
                                <span className="text-[10px] font-semibold uppercase text-muted-foreground block">Simulated Output Schema</span>
                                <pre className="font-mono text-[10px] text-foreground bg-background/80 p-2 rounded border border-border/40 overflow-x-auto">
{`{
  "status": "success",
  "step": "${nodes[selectedNode]?.id}",
  "timestamp": "${new Date().toISOString()}",
  "latencyMs": 42
}`}
                                </pre>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toast.info(`Configuring parameters for ${nodes[selectedNode]?.title}`)}
                                className="w-full h-8 text-xs border-border/80 gap-1.5 shadow-xs"
                            >
                                <Settings className="w-3.5 h-3.5" />
                                Configure Node Settings
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
