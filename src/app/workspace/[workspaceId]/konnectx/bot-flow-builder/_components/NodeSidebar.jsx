'use client';

import React from 'react';
import { getWaNodesByCategory } from '../_lib/node-registry';
import { cn } from "@/lib/utils";
import { Search, Info } from 'lucide-react';
import { Input } from "@/components/ui/input";

export const NodeSidebar = () => {
    const categories = getWaNodesByCategory();
    const [search, setSearch] = React.useState('');

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
        <div className="w-80 h-full border-r border-white/10 bg-[#0f0f1a] flex flex-col">
            <div className="p-6 border-b border-white/5">
                <h2 className="text-xl font-bold text-white mb-1">Nodes Palette</h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-4">WhatsApp Automation</p>
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input 
                        placeholder="Search nodes..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 bg-white/5 border-white/10 text-xs rounded-xl focus:ring-primary/20"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
                {categories.map((cat, idx) => (
                    <div key={idx} className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 px-2">{cat.category}</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {cat.items.filter(item => item.displayName.toLowerCase().includes(search.toLowerCase())).map((node, nIdx) => (
                                <div
                                    key={nIdx}
                                    className={cn(
                                        "group flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]",
                                        "hover:bg-white/[0.05] hover:border-primary/30 transition-all cursor-grab active:scale-95 active:cursor-grabbing"
                                    )}
                                    onDragStart={(event) => onDragStart(event, node)}
                                    draggable
                                >
                                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/10 transition-colors">
                                        <node.icon size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-white truncate">{node.displayName}</div>
                                        <div className="text-[9px] text-muted-foreground line-clamp-1">{node.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <Info size={12} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-[10px] text-primary/80 leading-relaxed">
                        Drag nodes onto the canvas to build your flow. Connect them to define the conversation sequence.
                    </p>
                </div>
            </div>
        </div>
    );
};
