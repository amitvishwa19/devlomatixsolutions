'use client';

import React, { useState } from 'react';
import {
    Search,
    Zap,
    Bot,
    Cpu,
    History,
    MessageSquare,
    Clock,
    Play,
    Mail,
    Database,
    Brain,
    Layers,
    Sparkles,
    MousePointer2,
    Settings2,
    SquareStack,
    Puzzle
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { WA_NODE_REGISTRY as NODE_REGISTRY } from '@/app/workspace/[workspaceId]/wa/bot-flow-builder/_lib/node-registry';

// Dynamic categories helper
const getCategories = () => {
    const categoriesMap = {};
    Object.values(NODE_REGISTRY).forEach(node => {
        if (!categoriesMap[node.group]) {
            categoriesMap[node.group] = {
                category: node.group,
                icon: node.group === 'Triggers' ? MousePointer2 :
                    node.group === 'AI Agents' ? Sparkles :
                        node.group === 'AI Models' ? Cpu :
                            node.group === 'AI Memory' ? History :
                                node.group === 'Logic & AI' ? Bot : Layers,
                items: []
            };
        }
        categoriesMap[node.group].items.push(node);
    });
    return Object.values(categoriesMap);
};

export const NodeSidebar = () => {
    const categories = getCategories();
    const [searchTerm, setSearchTerm] = useState("");

    const onDragStart = (event, node) => {
        const nodeData = {
            type: node.type,
            subType: node.name,
            label: node.displayName,
            description: node.description,
            // Pre-fill defaults from registry
            ...(Object.fromEntries((node.properties || []).map(p => [p.name, p.default])))
        };
        event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
        event.dataTransfer.effectAllowed = 'move';
    };

    const filteredCategories = categories.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            item.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <aside className="w-[300px] bg-background border-r border-border h-full flex flex-col p-6 space-y-6 z-10 shadow-2xl overflow-hidden">


            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                    placeholder="Search nodes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-muted/30 border border-border/50 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                />
            </div>

            <ScrollArea className="flex-1 -mr-4 pr-4">
                <Accordion type="multiple" className="w-full space-y-2">
                    {filteredCategories.map((section) => (
                        <AccordionItem key={section.category} value={section.category} className="border-none">
                            <AccordionTrigger className="hover:no-underline py-2 group cursor-pointer border-b border-border/10">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                        <section.icon size={12} />
                                    </div>
                                    <span className="text-[11px] font-black text-foreground uppercase tracking-wider">{section.category}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-3 pb-4">
                                <div className="grid gap-2">
                                    {section.items.map((node) => (
                                        <div
                                            key={node.name}
                                            className="group p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/30 hover:border-primary/20 cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:shadow-primary/5 active:scale-[0.98] relative overflow-hidden"
                                            onDragStart={(event) => onDragStart(event, node)}
                                            draggable
                                        >
                                            <div className="flex items-start gap-3 relative z-10">
                                                <div className="p-1.5 rounded-lg bg-primary/5 border border-primary/10 shadow-inner group-hover:bg-primary/10 transition-colors">
                                                    <node.icon size={14} className="text-primary/70" />
                                                </div>
                                                <div className="space-y-0.5 min-w-0">
                                                    <h4 className="text-[11px] font-bold text-foreground leading-none truncate">{node.displayName}</h4>
                                                    <p className="text-[8px] text-muted-foreground leading-tight line-clamp-1">{node.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </ScrollArea>

            <div className="pt-4 border-t border-border/50 mt-auto">
                <div className="bg-primary/5 rounded-xl p-3.5 space-y-2 border border-primary/10">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-primary/20 flex items-center justify-center">
                            <Zap size={10} className="text-primary" />
                        </div>
                        <span className="text-[9px] font-black text-foreground uppercase tracking-widest leading-none">n8n Pattern</span>
                    </div>
                    <p className="text-[8px] text-muted-foreground leading-relaxed">
                        Nodes are now declarative. Drag them into your workspace to build high-performance agentic workflows.
                    </p>
                </div>
            </div>
        </aside>
    );
};
