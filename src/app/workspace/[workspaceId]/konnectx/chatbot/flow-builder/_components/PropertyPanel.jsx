'use client';

import React, { useState, useEffect } from 'react';
import { WA_NODE_REGISTRY } from "../_lib/node-registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Trash2, Info, FileText, Loader2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getTemplates } from "../../../template/_actions/get-templates";

export const PropertyPanel = ({ selectedNode, updateNodeData, deleteNode, closePanel, workspaceId }) => {
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
    const [templates, setTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);

    const nodeDef = WA_NODE_REGISTRY[selectedNode?.data?.subType] || WA_NODE_REGISTRY[selectedNode?.data?.type];

    useEffect(() => {
        setConfig(sanitize(selectedNode?.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedNode?.id]);

    useEffect(() => {
        if (!workspaceId) return;
        let isMounted = true;
        setLoadingTemplates(true);
        getTemplates({ workspaceId })
            .then(res => {
                if (isMounted && res?.data?.templates) {
                    setTemplates(res.data.templates);
                }
            })
            .catch(err => console.error('[PropertyPanel] Error loading templates:', err))
            .finally(() => {
                if (isMounted) setLoadingTemplates(false);
            });
        return () => { isMounted = false; };
    }, [workspaceId]);

    if (!selectedNode || !nodeDef) return null;

    const onChange = (key, value) => {
        console.log('[PropertyPanel] onChange key:', key, 'value:', value, 'type:', typeof value);
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        updateNodeData(selectedNode.id, newConfig);
    };

    const getTemplateBodyText = (tpl) => {
        if (!tpl) return '';
        if (tpl.text) return tpl.text;
        if (tpl.body) return tpl.body;
        if (Array.isArray(tpl.components)) {
            const bodyComp = tpl.components.find(c => c.type === 'BODY' || c.type === 'body');
            if (bodyComp?.text) return bodyComp.text;
        }
        return '';
    };

    const onSelectTemplate = (template) => {
        if (!template) return;
        const bodyText = getTemplateBodyText(template);

        const newConfig = {
            ...config,
            templateId: template.id,
            templateName: template.name,
            languageCode: template.language || 'en_US',
            text: bodyText || config.text || '',
            configured: true
        };

        if (!config.label || config.label === 'Send Message' || config.label === 'Official Template' || config.label.startsWith('Template:')) {
            newConfig.label = `Template: ${template.name}`;
        }

        setConfig(newConfig);
        updateNodeData(selectedNode.id, newConfig);
    };

    const isMessageOrTemplateNode = selectedNode?.data?.type === 'messageNode' || 
        selectedNode?.data?.subType === 'templateMessage' || 
        selectedNode?.data?.subType === 'textMessage' || 
        selectedNode?.data?.subType === 'imageMessage' ||
        nodeDef?.type === 'messageNode';

    const selectedTemplateObj = templates.find(t => t.id === config.templateId || t.name === config.templateName);

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

                    {/* Select Existing Template Section */}
                    {isMessageOrTemplateNode && (
                        <div className="space-y-3 p-3.5 rounded-2xl bg-primary/5 border border-primary/15">
                            <div className="flex items-center justify-between">
                                <Label className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                                    <FileText size={13} />
                                    Select Existing Template
                                </Label>
                                {loadingTemplates && <Loader2 size={12} className="animate-spin text-primary" />}
                            </div>

                            <Select
                                value={config.templateId || (selectedTemplateObj ? selectedTemplateObj.id : '')}
                                onValueChange={(templateId) => {
                                    const found = templates.find(t => t.id === templateId || t.name === templateId);
                                    if (found) onSelectTemplate(found);
                                }}
                            >
                                <SelectTrigger className="bg-white/5 border-white/10 text-xs rounded-xl h-10">
                                    <SelectValue placeholder={loadingTemplates ? "Loading templates..." : templates.length === 0 ? "No templates available" : "Choose existing template..."} />
                                </SelectTrigger>
                                <SelectContent className="bg-background border-white/10 z-[100] max-h-60">
                                    {templates.map((tpl) => (
                                        <SelectItem key={tpl.id} value={tpl.id} className="text-xs">
                                            <div className="flex items-center justify-between gap-3 w-full">
                                                <span className="font-semibold">{tpl.name}</span>
                                                <span className="text-[10px] text-muted-foreground">({tpl.language || 'en_US'})</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {selectedTemplateObj && (
                                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-white text-xs truncate max-w-[170px]">{selectedTemplateObj.name}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                            selectedTemplateObj.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        }`}>
                                            {selectedTemplateObj.status || 'APPROVED'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                        {selectedTemplateObj.category && <span>Cat: {selectedTemplateObj.category}</span>}
                                        <span>•</span>
                                        <span>Lang: {selectedTemplateObj.language || 'en_US'}</span>
                                    </div>

                                    {getTemplateBodyText(selectedTemplateObj) && (
                                        <div className="text-[11px] text-muted-foreground line-clamp-3 italic bg-white/5 p-2 rounded-lg border border-white/5 leading-relaxed">
                                            "{getTemplateBodyText(selectedTemplateObj)}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

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