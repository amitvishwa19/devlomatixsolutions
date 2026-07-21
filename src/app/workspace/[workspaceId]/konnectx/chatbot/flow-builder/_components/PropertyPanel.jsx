'use client';

import React, { useState, useEffect } from 'react';
import { WA_NODE_REGISTRY } from "../_lib/node-registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Trash2, Info } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

export const PropertyPanel = ({ selectedNode, updateNodeData, deleteNode, closePanel }) => {
    // Sanitize node data by extracting only plain, serializable values
    const sanitize = (data) => {
        if (!data) return {};
        try {
            const clean = JSON.parse(JSON.stringify(data));
            console.log('[PropertyPanel] sanitize OK:', clean);
            return clean;
        } catch (err) {
            console.error('[PropertyPanel] sanitize FAILED:', err, 'raw data:', data);
            return { ...data };
        }
    };

    const [config, setConfig] = useState(() => sanitize(selectedNode?.data));
    const nodeDef = WA_NODE_REGISTRY[selectedNode?.data?.subType] || WA_NODE_REGISTRY[selectedNode?.data?.type];

    useEffect(() => {
        setConfig(sanitize(selectedNode?.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedNode?.id]);

    if (!selectedNode || !nodeDef) return null;

    console.log('[PropertyPanel] render — selectedNode.id:', selectedNode?.id);
    console.log('[PropertyPanel] render — config:', config);
    console.log('[PropertyPanel] render — nodeDef:', nodeDef?.displayName, 'props:', nodeDef?.properties?.map(p => p.name));

    const onChange = (key, value) => {
        console.log('[PropertyPanel] onChange key:', key, 'value:', value, 'type:', typeof value);
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        updateNodeData(selectedNode.id, newConfig);
    };

    return (
        <div className="w-96 h-full border-l border-white/10 bg-background flex flex-col shadow-2xl z-20">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <nodeDef.icon size={18} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white">{nodeDef.displayName}</h2>
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Node ID: {selectedNode.id.substring(0, 8)}...</span>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={closePanel} className="rounded-full hover:bg-white/5">
                    <X size={18} className="text-muted-foreground" />
                </Button>
            </div>

            <ScrollArea className="flex-1 p-6">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/60">Core Configuration</h3>
                        <div className="space-y-2">
                            <Label className="text-[11px] text-muted-foreground">Label</Label>
                            <Input
                                value={config.label || ''}
                                onChange={(e) => onChange('label', e.target.value)}
                                className="bg-white/5 border-white/10 text-xs rounded-xl"
                            />
                        </div>
                    </div>

                    {nodeDef.properties.length > 0 && (
                        <div className="space-y-6 pt-6 border-t border-white/5">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/60">Node Properties</h3>
                            {nodeDef.properties.map((prop, idx) => (
                                <div key={idx} className="space-y-2">
                                    <Label className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                        {prop.displayName}
                                        {prop.description && (
                                            <div className="group relative">
                                                <Info size={10} className="text-white/20" />
                                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-32 p-2 bg-black text-[9px] rounded hidden group-hover:block z-50">
                                                    {prop.description}
                                                </div>
                                            </div>
                                        )}
                                    </Label>

                                    {prop.type === 'string' && (
                                        prop.typeOptions?.rows > 1 ? (
                                            <Textarea
                                                value={config[prop.name] ?? prop.default ?? ''}
                                                onChange={(e) => onChange(prop.name, e.target.value)}
                                                className="bg-white/5 border-white/10 text-xs rounded-xl min-h-[120px]"
                                            />
                                        ) : (
                                            <Input
                                                value={config[prop.name] ?? prop.default ?? ''}
                                                onChange={(e) => onChange(prop.name, e.target.value)}
                                                className="bg-white/5 border-white/10 text-xs rounded-xl"
                                                placeholder={prop.placeholder}
                                            />
                                        )
                                    )}

                                    {prop.type === 'number' && (
                                        <Input
                                            type="number"
                                            value={config[prop.name] ?? prop.default ?? ''}
                                            onChange={(e) => onChange(prop.name, parseInt(e.target.value))}
                                            className="bg-white/5 border-white/10 text-xs rounded-xl"
                                        />
                                    )}

                                    {prop.type === 'options' && (
                                        <Select
                                            value={config[prop.name] ?? prop.default ?? ''}
                                            onValueChange={(val) => onChange(prop.name, val)}
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10 text-xs rounded-xl h-10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-background border-white/10">
                                                {prop.options.map((opt, oIdx) => (
                                                    <SelectItem key={oIdx} value={opt.value} className="text-xs">
                                                        {opt.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="p-6 border-t border-white/5 bg-white/[0.02]">
                <Button
                    variant="ghost"
                    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl font-bold text-xs gap-2"
                    onClick={() => deleteNode(selectedNode.id)}
                >
                    <Trash2 size={16} /> Delete Node
                </Button>
            </div>
        </div>
    );
};