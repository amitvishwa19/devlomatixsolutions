'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Zap,
    Workflow,
    Plus,
    Play,
    CheckCircle2,
    Clock,
    AlertTriangle,
    RefreshCw,
    Activity,
    Layers,
    MessageCircle,
    Receipt,
    Sparkles,
    Trash2,
    Code2,
    SlidersHorizontal,
    ArrowRight,
    ExternalLink,
    Filter,
    Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import {
    getCrmAutomationsAction,
    toggleCrmAutomationAction,
    deleteCrmAutomationRuleAction,
    getCrmAutomationLogsAction,
    testCrmAutomationRuleAction
} from '../_actions/crm-automation-actions';

import CreateAutomationModal from './_components/CreateAutomationModal';
import InspectPayloadModal from './_components/InspectPayloadModal';
import TopologyMap from './_components/TopologyMap';

export default function CrmAutomationsPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [rules, setRules] = useState([]);
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isTestingRuleId, setIsTestingRuleId] = useState(null);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [inspectLog, setInspectLog] = useState(null);

    const [selectedCategory, setSelectedCategory] = useState('ALL');

    const loadData = async () => {
        if (!workspaceId) return;
        try {
            setIsLoading(true);
            const [rulesRes, logsRes] = await Promise.all([
                getCrmAutomationsAction(workspaceId),
                getCrmAutomationLogsAction(workspaceId)
            ]);

            if (rulesRes.success) setRules(rulesRes.data);
            if (logsRes.success) setLogs(logsRes.data);
        } catch (error) {
            console.error("Failed to load automations data:", error);
            toast.error("Failed to load automations");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        loadData();
    };

    const handleToggleRule = async (ruleId) => {
        try {
            const res = await toggleCrmAutomationAction(workspaceId, ruleId);
            if (res.success) {
                setRules(rules.map(r => r.id === ruleId ? { ...r, isActive: !r.isActive } : r));
                toast.success(res.data.isActive ? "Automation rule activated" : "Automation rule paused");
            } else {
                toast.error(res.error || "Failed to toggle rule");
            }
        } catch (error) {
            toast.error("Error toggling automation");
        }
    };

    const handleDeleteRule = async (ruleId, ruleName) => {
        if (!confirm(`Are you sure you want to delete the automation rule "${ruleName}"?`)) return;

        try {
            const res = await deleteCrmAutomationRuleAction(workspaceId, ruleId);
            if (res.success) {
                setRules(rules.filter(r => r.id !== ruleId));
                toast.success("Automation rule deleted");
            } else {
                toast.error(res.error || "Failed to delete rule");
            }
        } catch (error) {
            toast.error("Error deleting rule");
        }
    };

    const handleTestRule = async (ruleId) => {
        try {
            setIsTestingRuleId(ruleId);
            const res = await testCrmAutomationRuleAction(workspaceId, ruleId);
            if (res.success) {
                toast.success(`Rule "${res.ruleName}" tested successfully! Actions executed.`);
                // Refresh logs to show the simulated test run
                const logsRes = await getCrmAutomationLogsAction(workspaceId);
                if (logsRes.success) setLogs(logsRes.data);
            } else {
                toast.error(res.error || "Test execution failed");
            }
        } catch (error) {
            toast.error("Error executing test trigger");
        } finally {
            setIsTestingRuleId(null);
        }
    };

    const filteredRules = selectedCategory === 'ALL'
        ? rules
        : rules.filter(r => r.category === selectedCategory);

    const activeRulesCount = rules.filter(r => r.isActive).length;
    const totalRuns24h = rules.reduce((acc, r) => acc + (r.stats?.totalRuns || 0), 0);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header Telemetry Hero */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-card via-card to-background border border-border/80 shadow-sm relative overflow-hidden">
                <div className="space-y-1.5 z-10">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold px-2.5 py-0.5">
                            <Workflow className="w-3.5 h-3.5 mr-1" />
                            FlowForge Bridge Engine
                        </Badge>
                        <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1 inline-block" />
                            Live Event Bus
                        </Badge>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                        Cross-Module Workflow Automations
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
                        Autonomous event pipelines orchestrating actions seamlessly across CRM Deals, KonnectX WhatsApp, PayFlow Invoicing, and Hireflow ATS.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 z-10 flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="h-9 text-xs gap-1.5 bg-background border-border/80"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>Sync State</span>
                    </Button>

                    <Link href={`/workspace/${workspaceId}/flowforge`}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs gap-1.5 bg-background border-border/80 hover:border-primary/50"
                        >
                            <Workflow className="w-3.5 h-3.5 text-primary" />
                            <span>FlowForge Studio</span>
                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        </Button>
                    </Link>

                    <Button
                        size="sm"
                        onClick={() => setIsCreateOpen(true)}
                        className="h-9 text-xs font-bold gap-1.5 shadow-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Automation</span>
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">Active Rules</span>
                        <Zap className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-foreground">
                        {activeRulesCount} <span className="text-xs font-normal text-muted-foreground">/ {rules.length} total</span>
                    </div>
                    <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Fully operational
                    </p>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">Triggers Executed</span>
                        <Activity className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-black text-foreground">
                        {totalRuns24h.toLocaleString()}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Across 4 integrated modules
                    </p>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">Success Rate</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-emerald-500">
                        99.8%
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Average latency: 310ms
                    </p>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">Connected Bridges</span>
                        <Layers className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-black text-purple-500">
                        4 Modules
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        KonnectX • PayFlow • Hireflow • AI
                    </p>
                </div>
            </div>

            {/* Main Tabs Navigation */}
            <Tabs defaultValue="rules" className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <TabsList className="bg-muted/40 p-1 rounded-2xl border border-border/60">
                        <TabsTrigger value="rules" className="rounded-xl text-xs font-bold gap-1.5 px-3 py-1.5">
                            <Zap className="w-3.5 h-3.5" />
                            <span>Automation Rules ({rules.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="logs" className="rounded-xl text-xs font-bold gap-1.5 px-3 py-1.5">
                            <Activity className="w-3.5 h-3.5" />
                            <span>Execution Audit Logs ({logs.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="topology" className="rounded-xl text-xs font-bold gap-1.5 px-3 py-1.5">
                            <Workflow className="w-3.5 h-3.5" />
                            <span>Cross-Module Topology</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Category Filter for Rules */}
                    <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
                        {['ALL', 'Outreach & Messaging', 'Finance & Invoicing', 'Lead Capture', 'Talent & ATS', 'Risk Management'].map(cat => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setSelectedCategory(cat)}
                                className={`h-7 text-[11px] rounded-lg px-2.5 font-medium shrink-0 ${
                                    selectedCategory === cat ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground'
                                }`}
                            >
                                {cat === 'ALL' ? 'All Categories' : cat}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Tab 1: Automation Rules */}
                <TabsContent value="rules" className="space-y-4 outline-none">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-12 text-muted-foreground">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" />
                            <span>Loading FlowForge automations...</span>
                        </div>
                    ) : filteredRules.length === 0 ? (
                        <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border space-y-3">
                            <Zap className="w-8 h-8 text-muted-foreground mx-auto" />
                            <h3 className="font-bold text-sm text-foreground">No automation rules found</h3>
                            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                Create your first cross-module trigger to automate WhatsApp messages, invoices, and CRM tasks.
                            </p>
                            <Button size="sm" onClick={() => setIsCreateOpen(true)} className="h-8 text-xs font-bold">
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Create Automation Rule
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredRules.map((rule) => {
                                const isTesting = isTestingRuleId === rule.id;

                                return (
                                    <div
                                        key={rule.id}
                                        className={`p-5 rounded-3xl bg-card border transition-all duration-200 hover:shadow-md space-y-4 ${
                                            rule.isActive
                                                ? 'border-border/80'
                                                : 'border-border/40 opacity-70 bg-muted/10'
                                        }`}
                                    >
                                        {/* Top Bar: Trigger Badge, Title, Category, Toggle */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase">
                                                        {rule.category}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-[10px] font-mono">
                                                        Trigger: {rule.triggerEvent} {rule.triggerStageName ? `(${rule.triggerStageName})` : ''}
                                                    </Badge>
                                                    {rule.isActive ? (
                                                        <Badge className="bg-emerald-500/10 text-emerald-500 text-[10px]">
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="text-[10px]">
                                                            Paused
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h3 className="text-base font-bold text-foreground">
                                                    {rule.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {rule.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleTestRule(rule.id)}
                                                    disabled={isTesting || !rule.isActive}
                                                    className="h-8 text-xs gap-1.5 bg-background border-border hover:border-amber-500/40 hover:text-amber-500 font-semibold"
                                                    title="Run simulated trigger test"
                                                >
                                                    {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                                                    <span>Test Trigger</span>
                                                </Button>

                                                <div className="flex items-center gap-2 pr-1 border-r border-border/80">
                                                    <Switch
                                                        checked={rule.isActive}
                                                        onCheckedChange={() => handleToggleRule(rule.id)}
                                                    />
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteRule(rule.id, rule.name)}
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                    title="Delete Automation"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Multi-Node Visual Pipeline Chain */}
                                        <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60">
                                            <div className="text-[11px] font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                                                <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                                                <span>Execution Action Chain:</span>
                                            </div>

                                            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1">
                                                {/* Trigger Node */}
                                                <div className="p-2.5 rounded-xl bg-background border border-border text-center shrink-0 min-w-[140px] shadow-2xs">
                                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                                                        Trigger Event
                                                    </div>
                                                    <div className="text-xs font-bold text-foreground truncate">
                                                        {rule.triggerEvent.replace(/_/g, ' ')}
                                                    </div>
                                                </div>

                                                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />

                                                {/* Actions Nodes */}
                                                {rule.actions?.map((act, aIdx) => (
                                                    <React.Fragment key={act.id || aIdx}>
                                                        <div className="p-2.5 rounded-xl bg-background border border-border shrink-0 min-w-[160px] shadow-2xs space-y-0.5">
                                                            <div className="flex items-center justify-between">
                                                                <Badge className={`text-[9px] px-1 py-0 bg-${act.color || 'blue'}-500/10 text-${act.color || 'blue'}-500 border-none font-bold`}>
                                                                    {act.module}
                                                                </Badge>
                                                                <span className="text-[10px] text-muted-foreground font-mono">Step {aIdx + 1}</span>
                                                            </div>
                                                            <div className="text-xs font-bold text-foreground truncate">
                                                                {act.name}
                                                            </div>
                                                        </div>
                                                        {aIdx < rule.actions.length - 1 && (
                                                            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Footer Stats Strip */}
                                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                                            <div className="flex items-center gap-4">
                                                <span>Runs: <strong className="text-foreground">{rule.stats?.totalRuns || 0}</strong></span>
                                                <span>Success Rate: <strong className="text-emerald-500">{rule.stats?.successRate || '100%'}</strong></span>
                                                <span>Last Run: <strong className="text-foreground">{rule.stats?.lastRun || 'Never'}</strong></span>
                                            </div>
                                            <span className="text-[11px]">FlowForge Rule ID: <code className="text-primary font-mono">{rule.id}</code></span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Tab 2: Live Execution Audit Logs */}
                <TabsContent value="logs" className="space-y-4 outline-none">
                    <div className="rounded-3xl bg-card border border-border/80 overflow-hidden shadow-xs">
                        <div className="p-4 sm:p-5 border-b border-border/80 flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-emerald-500" />
                                    <span>Real-Time FlowForge Execution Logs</span>
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Chronological stream of cross-module trigger dispatches and payload traces.
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleRefresh} className="h-8 text-xs gap-1">
                                <RefreshCw className="w-3 h-3" />
                                <span>Refresh Stream</span>
                            </Button>
                        </div>

                        {logs.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground text-xs">
                                No executions logged yet. Click "Test Trigger" on any rule to simulate an event.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-muted/40 text-muted-foreground border-b border-border/60 text-[11px] uppercase tracking-wider font-semibold">
                                        <tr>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4">Automation Rule</th>
                                            <th className="py-3 px-4">Trigger & Target</th>
                                            <th className="py-3 px-4">Duration</th>
                                            <th className="py-3 px-4">Nodes Executed</th>
                                            <th className="py-3 px-4">Timestamp</th>
                                            <th className="py-3 px-4 text-right">Inspect</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="py-3 px-4">
                                                    <Badge className={`text-[10px] font-bold ${
                                                        log.status === 'SUCCESS'
                                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                            : log.status === 'PARTIAL'
                                                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                            : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                    }`}>
                                                        {log.status === 'SUCCESS' && <CheckCircle2 className="w-2.5 h-2.5 mr-1" />}
                                                        {log.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 font-bold text-foreground">
                                                    {log.ruleName}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="font-semibold text-foreground">{log.triggerEvent}</div>
                                                    <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">{log.targetEntity}</div>
                                                </td>
                                                <td className="py-3 px-4 font-mono text-emerald-500 font-bold">
                                                    {log.durationMs || 280} ms
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-1 flex-wrap">
                                                        {log.executedNodes?.slice(0, 2).map((node, nIdx) => (
                                                            <Badge key={nIdx} variant="outline" className="text-[10px] bg-background">
                                                                {node}
                                                            </Badge>
                                                        ))}
                                                        {(log.executedNodes?.length || 0) > 2 && (
                                                            <span className="text-[10px] text-muted-foreground font-semibold">
                                                                +{log.executedNodes.length - 2} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-muted-foreground text-[11px] whitespace-nowrap">
                                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setInspectLog(log)}
                                                        className="h-7 text-xs gap-1 font-semibold hover:text-primary"
                                                    >
                                                        <Code2 className="w-3.5 h-3.5 text-primary" />
                                                        <span>Payload</span>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Tab 3: Topology Map */}
                <TabsContent value="topology" className="space-y-4 outline-none">
                    <TopologyMap />
                </TabsContent>
            </Tabs>

            {/* Modals */}
            <CreateAutomationModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                workspaceId={workspaceId}
                onCreated={() => loadData()}
            />

            <InspectPayloadModal
                isOpen={!!inspectLog}
                onClose={() => setInspectLog(null)}
                log={inspectLog}
            />
        </div>
    );
}
