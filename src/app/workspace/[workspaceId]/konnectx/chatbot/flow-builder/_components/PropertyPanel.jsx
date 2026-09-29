'use client';

import React, { useState, useEffect } from 'react';
import { WA_NODE_REGISTRY, getNodeDefinition } from "../_lib/node-registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Trash2, Info, FileText, Loader2, GitBranch, Sparkles, Plus, ArrowUp, ArrowDown, CornerDownRight } from 'lucide-react';
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

    const nodeDef = getNodeDefinition(selectedNode?.data?.subType) || 
                    getNodeDefinition(selectedNode?.data?.type) || 
                    getNodeDefinition(selectedNode?.type) ||
                    WA_NODE_REGISTRY[selectedNode?.data?.subType] || 
                    WA_NODE_REGISTRY[selectedNode?.data?.type];

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
        const newConfig = { ...config, [key]: value, configured: true };
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

    const isConditionNode = nodeDef?.name === 'condition' || 
        selectedNode?.data?.subType === 'condition' || 
        selectedNode?.data?.subType === 'conditionNode';

    const selectedTemplateObj = templates.find(t => t.id === config.templateId || t.name === config.templateName);

    const conditionPresets = [
        { label: 'Incoming Message', value: 'last_response' },
        { label: 'Sender Phone', value: 'from' },
        { label: 'Order Total', value: 'order_total' },
    ];

    const BRANCH_COLORS = [
        '#10b981', '#3b82f6', '#f59e0b', '#a855f7', '#06b6d4', '#ec4899', '#84cc16', '#f97316'
    ];

    const getOperatorDisplay = (op) => {
        switch (op) {
            case 'eq': return '== (equals exactly)';
            case 'contains': return 'contains text';
            case 'starts_with': return 'starts with';
            case 'ends_with': return 'ends with';
            case 'gt': return '> (greater than)';
            case 'gte': return '>= (greater or equal)';
            case 'lt': return '< (less than)';
            case 'lte': return '<= (less or equal)';
            case 'exists': return 'is not empty / exists';
            default: return op || 'contains';
        }
    };

    const currentConditions = Array.isArray(config.conditions) && config.conditions.length > 0
        ? config.conditions
        : [
            {
                id: 'cond_1',
                label: 'Result 1 (Option A)',
                variable: config.variable || 'last_response',
                operation: config.operation || 'contains',
                value: config.value || '1'
            },
            {
                id: 'cond_2',
                label: 'Result 2 (Option B)',
                variable: config.variable || 'last_response',
                operation: 'contains',
                value: '2'
            }
        ];

    const updateConditions = (newConditions, extraFields = {}) => {
        const newConfig = {
            ...config,
            conditions: newConditions,
            variable: newConditions[0]?.variable || 'last_response',
            operation: newConditions[0]?.operation || 'contains',
            value: newConditions[0]?.value || '',
            ...extraFields,
            configured: true
        };
        setConfig(newConfig);
        updateNodeData(selectedNode.id, newConfig);
    };

    const handleAddCondition = () => {
        const nextIdx = currentConditions.length + 1;
        const newCond = {
            id: `cond_${Date.now()}_${nextIdx}`,
            label: `Result ${nextIdx}`,
            variable: currentConditions[0]?.variable || 'last_response',
            operation: 'contains',
            value: ''
        };
        updateConditions([...currentConditions, newCond]);
    };

    const handleUpdateCondition = (index, key, val) => {
        const updated = currentConditions.map((c, i) => i === index ? { ...c, [key]: val } : c);
        updateConditions(updated);
    };

    const handleRemoveCondition = (index) => {
        if (currentConditions.length <= 1) return;
        const updated = currentConditions.filter((_, i) => i !== index);
        updateConditions(updated);
    };

    const handleMoveCondition = (index, direction) => {
        const targetIdx = index + direction;
        if (targetIdx < 0 || targetIdx >= currentConditions.length) return;
        const updated = [...currentConditions];
        const temp = updated[index];
        updated[index] = updated[targetIdx];
        updated[targetIdx] = temp;
        updateConditions(updated);
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

                    {/* Condition Rule Builder for Logic & Flow -> Condition */}
                    {isConditionNode && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400">
                                        <GitBranch size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-white">Condition Branches</h4>
                                        <p className="text-[10px] text-muted-foreground">Branch execution based on multiple rules</p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={handleAddCondition}
                                    className="h-7 px-2.5 text-[11px] gap-1.5 bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:text-white"
                                >
                                    <Plus size={13} />
                                    Add Condition
                                </Button>
                            </div>

                            {/* Conditions List */}
                            <div className="space-y-3">
                                {currentConditions.map((cond, idx) => {
                                    const branchColor = BRANCH_COLORS[idx % BRANCH_COLORS.length];
                                    return (
                                        <div
                                            key={cond.id || idx}
                                            className="p-3 rounded-xl bg-card border border-white/10 space-y-2.5 relative overflow-hidden"
                                            style={{ borderLeftColor: branchColor, borderLeftWidth: '4px' }}
                                        >
                                            {/* Branch Header */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0"
                                                        style={{ backgroundColor: branchColor }}
                                                    >
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-xs font-bold text-white truncate max-w-[170px]">
                                                        {cond.label || `Branch #${idx + 1}`}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0">
                                                    {idx > 0 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-muted-foreground hover:text-white"
                                                            onClick={() => handleMoveCondition(idx, -1)}
                                                            title="Move Up"
                                                        >
                                                            <ArrowUp size={12} />
                                                        </Button>
                                                    )}
                                                    {idx < currentConditions.length - 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-muted-foreground hover:text-white"
                                                            onClick={() => handleMoveCondition(idx, 1)}
                                                            title="Move Down"
                                                        >
                                                            <ArrowDown size={12} />
                                                        </Button>
                                                    )}
                                                    {currentConditions.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300"
                                                            onClick={() => handleRemoveCondition(idx)}
                                                            title="Remove Branch"
                                                        >
                                                            <Trash2 size={12} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Branch Label */}
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-muted-foreground font-semibold">Branch Name / Label</Label>
                                                <Input
                                                    value={cond.label || ''}
                                                    onChange={(e) => handleUpdateCondition(idx, 'label', e.target.value)}
                                                    placeholder={`e.g. Result-${idx + 1}, Sales Inquiry`}
                                                    className="bg-white/5 border-white/10 text-xs rounded-lg h-8"
                                                />
                                            </div>

                                            {/* Variable to Inspect */}
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] text-muted-foreground font-semibold">Variable to Inspect</Label>
                                                <div className="flex flex-wrap gap-1 mb-1">
                                                    {conditionPresets.map(preset => (
                                                        <button
                                                            key={preset.value}
                                                            type="button"
                                                            onClick={() => handleUpdateCondition(idx, 'variable', preset.value)}
                                                            className={`px-2 py-0.5 rounded text-[9px] font-semibold transition-all ${
                                                                (cond.variable || 'last_response') === preset.value
                                                                    ? 'bg-blue-500 text-white shadow-sm'
                                                                    : 'bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10'
                                                            }`}
                                                        >
                                                            {preset.label}
                                                        </button>
                                                    ))}
                                                </div>
                                                <Input
                                                    value={cond.variable ?? 'last_response'}
                                                    onChange={(e) => handleUpdateCondition(idx, 'variable', e.target.value)}
                                                    placeholder="e.g. last_response, from, order_total"
                                                    className="bg-white/5 border-white/10 text-xs font-mono rounded-lg h-8"
                                                />
                                            </div>

                                            {/* Operator & Value Row */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-muted-foreground font-semibold">Operator</Label>
                                                    <Select
                                                        value={cond.operation || 'contains'}
                                                        onValueChange={(val) => handleUpdateCondition(idx, 'operation', val)}
                                                    >
                                                        <SelectTrigger className="bg-white/5 border-white/10 text-xs rounded-lg h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-background border-white/10 z-[100]">
                                                            <SelectItem value="contains" className="text-xs">Contains (contains)</SelectItem>
                                                            <SelectItem value="eq" className="text-xs">Equals (==)</SelectItem>
                                                            <SelectItem value="starts_with" className="text-xs">Starts With</SelectItem>
                                                            <SelectItem value="ends_with" className="text-xs">Ends With</SelectItem>
                                                            <SelectItem value="gt" className="text-xs">Greater Than (&gt;)</SelectItem>
                                                            <SelectItem value="gte" className="text-xs">Greater or Equal (&gt;=)</SelectItem>
                                                            <SelectItem value="lt" className="text-xs">Less Than (&lt;)</SelectItem>
                                                            <SelectItem value="lte" className="text-xs">Less or Equal (&lt;=)</SelectItem>
                                                            <SelectItem value="exists" className="text-xs">Is Not Empty (exists)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {cond.operation !== 'exists' && (
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] text-muted-foreground font-semibold">Value to Match</Label>
                                                        <Input
                                                            value={cond.value ?? ''}
                                                            onChange={(e) => handleUpdateCondition(idx, 'value', e.target.value)}
                                                            placeholder="e.g. 1, sales, yes"
                                                            className="bg-white/5 border-white/10 text-xs rounded-lg h-8"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Branch Rule Preview */}
                                            <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-[10px] flex items-center gap-1.5 text-muted-foreground">
                                                <CornerDownRight size={12} className="text-primary shrink-0" />
                                                <span className="truncate">
                                                    IF <span className="font-mono text-primary font-bold">{cond.variable || 'last_response'}</span>{' '}
                                                    <span className="text-blue-300 font-semibold">{getOperatorDisplay(cond.operation)}</span>{' '}
                                                    {cond.operation !== 'exists' && (
                                                        <span className="font-bold text-emerald-400">&quot;{cond.value || ''}&quot;</span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Else / Fallback Branch */}
                            <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2.5" style={{ borderLeftColor: '#f43f5e', borderLeftWidth: '4px' }}>
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-rose-500 shadow-sm shrink-0">
                                        ★
                                    </span>
                                    <div>
                                        <h5 className="text-xs font-bold text-rose-300">Else / Fallback Branch</h5>
                                        <p className="text-[10px] text-muted-foreground">Executed if none of the above conditions match</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground font-semibold">Fallback Handle Label</Label>
                                    <Input
                                        value={config.elseLabel ?? 'Else / Fallback'}
                                        onChange={(e) => {
                                            const newConfig = { ...config, elseLabel: e.target.value, configured: true };
                                            setConfig(newConfig);
                                            updateNodeData(selectedNode.id, newConfig);
                                        }}
                                        placeholder="e.g. Else / Fallback"
                                        className="bg-white/5 border-white/10 text-xs rounded-lg h-8"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Wait for Input Configuration */}
                    {(selectedNode?.data?.subType === 'waitForInput' || nodeDef?.name === 'waitForInput') && (
                        <div className="space-y-4 p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400">
                                    <Sparkles size={14} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white">Wait For Customer Reply</h4>
                                    <p className="text-[10px] text-muted-foreground">Pause flow and extract verified user responses</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] text-muted-foreground">Store Response in Variable</Label>
                                <div className="flex flex-wrap gap-1 mb-1">
                                    {['user_email', 'user_name', 'shipping_address', 'feedback'].map(v => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => onChange('variable', v)}
                                            className="px-2 py-0.5 rounded text-[9px] bg-white/5 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all font-mono"
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                                <Input
                                    value={config.variable ?? 'last_response'}
                                    onChange={(e) => onChange('variable', e.target.value)}
                                    placeholder="e.g. user_email"
                                    className="bg-white/5 border-white/10 text-xs font-mono rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] text-muted-foreground">Validation Format</Label>
                                <Select
                                    value={config.validation || 'any'}
                                    onValueChange={(val) => onChange('validation', val)}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10 text-xs rounded-xl h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background border-white/10 z-[100]">
                                        <SelectItem value="any" className="text-xs">Any Text / Message</SelectItem>
                                        <SelectItem value="email" className="text-xs">Valid Email Address (name@domain.com)</SelectItem>
                                        <SelectItem value="phone" className="text-xs">Valid Phone Number (Digits)</SelectItem>
                                        <SelectItem value="number" className="text-xs">Numeric Digits Only</SelectItem>
                                        <SelectItem value="location" className="text-xs">WhatsApp Location Pin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] text-muted-foreground">Retry Message (if invalid)</Label>
                                <Textarea
                                    value={config.retryPrompt ?? 'Please provide a valid format to proceed.'}
                                    onChange={(e) => onChange('retryPrompt', e.target.value)}
                                    placeholder="e.g. That doesn't look like a valid email. Please try again!"
                                    className="bg-white/5 border-white/10 text-xs rounded-xl min-h-[60px]"
                                />
                            </div>
                        </div>
                    )}

                    {/* Set Variable Configuration */}
                    {(selectedNode?.data?.subType === 'setVariable' || nodeDef?.name === 'setVariable') && (
                        <div className="space-y-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400">
                                    <Sparkles size={14} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white">Set Session Variable</h4>
                                    <p className="text-[10px] text-muted-foreground">Assign or calculate memory variables</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] text-muted-foreground">Variable Name</Label>
                                <Input
                                    value={config.variable ?? 'custom_var'}
                                    onChange={(e) => onChange('variable', e.target.value)}
                                    placeholder="e.g. user_tier, lead_score"
                                    className="bg-white/5 border-white/10 text-xs font-mono rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] text-muted-foreground">Value to Set</Label>
                                <div className="flex flex-wrap gap-1 mb-1">
                                    {['{{last_response}}', '{{from}}', 'VIP', 'true'].map(v => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => onChange('value', v)}
                                            className="px-2 py-0.5 rounded text-[9px] bg-white/5 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all font-mono"
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                                <Input
                                    value={config.value ?? ''}
                                    onChange={(e) => onChange('value', e.target.value)}
                                    placeholder="e.g. VIP or {{last_response}}"
                                    className="bg-white/5 border-white/10 text-xs rounded-xl"
                                />
                            </div>
                        </div>
                    )}

                    {/* AI Agent Configuration */}
                    {(selectedNode?.data?.subType === 'aiAgent' || nodeDef?.name === 'aiAgent') && (
                        <div className="space-y-4 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400">
                                    <Sparkles size={14} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white">AI Agent (Gemini RAG)</h4>
                                    <p className="text-[10px] text-muted-foreground">Dynamic answers grounded in your Knowledge Base</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] text-muted-foreground">Knowledge Base Category</Label>
                                <div className="flex flex-wrap gap-1.5 mb-1.5">
                                    {['GENERAL', 'PRODUCTS', 'PRICING', 'SUPPORT'].map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => onChange('category', cat)}
                                            className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${
                                                (config.category || 'GENERAL') === cat
                                                    ? 'bg-purple-500 text-white shadow-sm'
                                                    : 'bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                                <Input
                                    value={config.category ?? 'GENERAL'}
                                    onChange={(e) => onChange('category', e.target.value)}
                                    placeholder="e.g. GENERAL, PRODUCTS, FAQ"
                                    className="bg-white/5 border-white/10 text-xs rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] text-muted-foreground">System Persona & Prompt</Label>
                                <Textarea
                                    value={config.systemPrompt ?? 'You are a helpful customer support agent for Devlomatix. Answer questions accurately and concisely.'}
                                    onChange={(e) => onChange('systemPrompt', e.target.value)}
                                    placeholder="Instructions for how the AI should respond..."
                                    className="bg-white/5 border-white/10 text-xs rounded-xl min-h-[90px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] text-muted-foreground">Fallback Message (if unanswerable)</Label>
                                <Input
                                    value={config.fallbackText ?? 'I am not sure about that. Let me connect you with our support team.'}
                                    onChange={(e) => onChange('fallbackText', e.target.value)}
                                    placeholder="Message sent when confidence is low"
                                    className="bg-white/5 border-white/10 text-xs rounded-xl"
                                />
                            </div>
                        </div>
                    )}

                    {/* Deskflow Handoff Configuration */}
                    {(selectedNode?.data?.subType === 'deskflowHandoff' || selectedNode?.data?.subType === 'deskflow' || nodeDef?.name === 'deskflowHandoff') && (
                        <div className="space-y-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                                    <Sparkles size={14} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white">DeskFlow Human Handoff</h4>
                                    <p className="text-[10px] text-muted-foreground">Transfer bot chat to human support agents</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] text-muted-foreground">Target Department Queue</Label>
                                <div className="flex flex-wrap gap-1.5 mb-1.5">
                                    {['Support', 'Sales', 'Billing', 'VIP Desk'].map(dept => (
                                        <button
                                            key={dept}
                                            type="button"
                                            onClick={() => onChange('department', dept)}
                                            className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${
                                                (config.department || 'Support') === dept
                                                    ? 'bg-amber-500 text-black shadow-sm'
                                                    : 'bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            {dept}
                                        </button>
                                    ))}
                                </div>
                                <Input
                                    value={config.department ?? 'Support'}
                                    onChange={(e) => onChange('department', e.target.value)}
                                    placeholder="e.g. Support, Sales"
                                    className="bg-white/5 border-white/10 text-xs rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] text-muted-foreground">Handoff Notification to User</Label>
                                <Textarea
                                    value={config.handoffMessage ?? 'Connecting you with a team representative right now...'}
                                    onChange={(e) => onChange('handoffMessage', e.target.value)}
                                    placeholder="Message sent to the customer..."
                                    className="bg-white/5 border-white/10 text-xs rounded-xl min-h-[60px]"
                                />
                            </div>
                        </div>
                    )}

                    {/* CRM Tag Configuration */}
                    {(selectedNode?.data?.subType === 'crmTag' || selectedNode?.data?.subType === 'tag' || nodeDef?.name === 'crmTag') && (
                        <div className="space-y-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                                    <Sparkles size={14} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white">CRM Contact Tagging</h4>
                                    <p className="text-[10px] text-muted-foreground">Automatically label & segment customers</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] text-muted-foreground">Action</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onChange('action', 'add')}
                                        className={`py-2 rounded-xl text-xs font-bold transition-all ${
                                            (config.action || 'add') === 'add'
                                                ? 'bg-emerald-500 text-black shadow-sm'
                                                : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                                        }`}
                                    >
                                        + Add Tag
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onChange('action', 'remove')}
                                        className={`py-2 rounded-xl text-xs font-bold transition-all ${
                                            config.action === 'remove'
                                                ? 'bg-rose-500 text-white shadow-sm'
                                                : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                                        }`}
                                    >
                                        - Remove Tag
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] text-muted-foreground">Tag Name</Label>
                                <div className="flex flex-wrap gap-1 mb-1">
                                    {['VIP', 'Hot_Lead', 'Customer', 'Quote_Sent', 'Support_Pending'].map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => onChange('tag', t)}
                                            className="px-2 py-0.5 rounded text-[9px] bg-white/5 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all font-mono"
                                        >
                                            #{t}
                                        </button>
                                    ))}
                                </div>
                                <Input
                                    value={config.tag ?? 'Lead'}
                                    onChange={(e) => onChange('tag', e.target.value)}
                                    placeholder="e.g. VIP, Hot_Lead"
                                    className="bg-white/5 border-white/10 text-xs rounded-xl"
                                />
                            </div>
                        </div>
                    )}

                    {/* HTTP Request Configuration */}
                    {(selectedNode?.data?.subType === 'httpRequest' || selectedNode?.data?.subType === 'http' || nodeDef?.name === 'httpRequest') && (
                        <div className="space-y-4 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-orange-500/15 text-orange-400">
                                    <Sparkles size={14} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white">HTTP Webhook / API</h4>
                                    <p className="text-[10px] text-muted-foreground">Query or push data to external REST endpoints</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] text-muted-foreground">HTTP Method</Label>
                                <Select
                                    value={config.method || 'GET'}
                                    onValueChange={(val) => onChange('method', val)}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10 text-xs rounded-xl h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background border-white/10 z-[100]">
                                        <SelectItem value="GET" className="text-xs">GET (Fetch Data)</SelectItem>
                                        <SelectItem value="POST" className="text-xs">POST (Send Payload)</SelectItem>
                                        <SelectItem value="PUT" className="text-xs">PUT (Update Data)</SelectItem>
                                        <SelectItem value="DELETE" className="text-xs">DELETE</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] text-muted-foreground">Endpoint URL</Label>
                                <Input
                                    value={config.url ?? ''}
                                    onChange={(e) => onChange('url', e.target.value)}
                                    placeholder="https://api.yourdomain.com/v1/user"
                                    className="bg-white/5 border-white/10 text-xs font-mono rounded-xl"
                                />
                            </div>
                        </div>
                    )}

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
                                            &quot;{getTemplateBodyText(selectedTemplateObj)}&quot;
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Generic Fallback Node Properties for custom or default properties */}
                    {!isConditionNode && 
                     selectedNode?.data?.subType !== 'waitForInput' && 
                     selectedNode?.data?.subType !== 'setVariable' && 
                     selectedNode?.data?.subType !== 'aiAgent' && 
                     selectedNode?.data?.subType !== 'deskflowHandoff' && 
                     selectedNode?.data?.subType !== 'deskflow' && 
                     selectedNode?.data?.subType !== 'crmTag' && 
                     selectedNode?.data?.subType !== 'tag' && 
                     selectedNode?.data?.subType !== 'httpRequest' && 
                     selectedNode?.data?.subType !== 'http' && 
                     nodeDef.properties.length > 0 && (
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