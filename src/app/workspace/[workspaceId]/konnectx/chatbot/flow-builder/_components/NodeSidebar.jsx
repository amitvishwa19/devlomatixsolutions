'use client';

import React, { useState } from 'react';
import { getWaNodesByCategory } from "../_lib/node-registry";
import { cn } from "@/lib/utils";
import { Search, Info } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

export const NodeSidebar = () => {
    const categories = getWaNodesByCategory();
    const [search, setSearch] = useState('');

    const onDragStart = (event, node) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify({
            type: node.type,
            subType: node.name,
            label: node.displayName,
            properties: node.properties || []
        }));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="w-72 h-full border-r  bg-card flex flex-col">
            <div className="px-4 border-b ">
                <h2 className="text-xl font-semibold mb-1">Nodes Palette</h2>
                <p className="text-xs text-muted-foreground primary font-medium ">WhatsApp Automation</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                <Accordion type="multiple" className="w-full space-y-2">
                    {categories.map((cat, idx) => {
                        const filteredItems = cat.items.filter(item =>
                            item.displayName.toLowerCase().includes(search.toLowerCase())
                        );

                        if (search && filteredItems.length === 0) return null;

                        return (
                            <AccordionItem key={idx} value={cat.category} className="border-0">
                                <AccordionTrigger className="px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group">
                                    <span className="text-xs font-semibold">
                                        {cat.category}
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-2">
                                    <div className="grid grid-cols-1 gap-2 pl-1 pt-1">
                                        {filteredItems.map((node, nIdx) => (
                                            <div
                                                key={nIdx}
                                                className={cn(
                                                    "group flex items-center gap-3 p-2 rounded-md border ",
                                                    "hover:bg-white/[0.05] hover:border-primary/30 transition-all cursor-grab active:scale-95 active:cursor-grabbing"
                                                )}
                                                onDragStart={(event) => onDragStart(event, node)}
                                                draggable
                                            >
                                                <div className="p-2 rounded-lg group-hover:bg-primary/10 transition-colors">
                                                    <node.icon size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-semibold truncate">{node.displayName}</div>
                                                    <div className="text-xs text-muted-foreground line-clamp-1">{node.description}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </div>

            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <Info size={12} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-primary/80 leading-relaxed">
                        Drag nodes onto the canvas to build your flow. Connect them to define the conversation sequence.
                    </p>
                </div>
            </div>
        </div>
    );
};