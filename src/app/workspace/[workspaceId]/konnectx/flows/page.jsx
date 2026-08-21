'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    RefreshCw,
    Plus,
    Search,
    ChevronRight,
    ExternalLink,
    Pencil,
    Copy,
    Trash2,
    Settings,
    Layers,
    Info,
    AlertCircle,
    CheckCircle2,
    Clock,
    Layout,
    ArrowLeft,
    Eye,
    Globe,
    FileCode,
    AlertTriangle,
    MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAction } from "@/hooks/use-action";
import { testMetaApi } from "../settings/_actions/test-meta-api";
import { getDecryptedCredentials } from "../settings/_actions/get-decrypted-credentials";

// Local Actions
import { getFlows } from "./_actions/get-flows";
import { saveFlow } from "./_actions/save-flow";
import { deleteFlow } from "./_actions/delete-flow";
import { pushFlowToMeta } from "./_actions/push-flow";
import { publishMetaFlow } from "./_actions/publish-meta-flow";
import { syncMetaFlows } from "./_actions/sync-meta-flows";
import { cloneFlow } from "./_actions/clone-flow";

// Components
import FlowBuilder from "./_components/FlowBuilder";
import AccountSwitcher from "../_components/AccountSwitcher";

export default function FlowsPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;

    const [metaCloudVersion, setMetaCloudVersion] = useState('v25.0');
    const [metaCloudAccessToken, setMetaCloudAccessToken] = useState('');
    const [wabaId, setWabaId] = useState('');

    const [localFlows, setLocalFlows] = useState([]);
    const [metaFlows, setMetaFlows] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('list'); // list | builder
    const [activeTab, setActiveTab] = useState('local'); // local | meta

    const [selectedFlow, setSelectedFlow] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [newFlowName, setNewFlowName] = useState('');
    const [newFlowCategory, setNewFlowCategory] = useState('OTHER');
    const [newFlowEndpoint, setNewFlowEndpoint] = useState('');

    const FLOW_CATEGORIES = [
        { value: 'OTHER', label: 'Other' },
        { value: 'APPOINTMENT_BOOKING', label: 'Appointment Booking' },
        { value: 'AUTO_REPLY', label: 'Auto Reply' },
        { value: 'CUSTOMER_SUPPORT', label: 'Customer Support' },
        { value: 'FEEDBACK', label: 'Feedback' },
        { value: 'LEAD_GENERATION', label: 'Lead Generation' },
        { value: 'ORDER_STATUS', label: 'Order Status' },
        { value: 'SIGN_UP', label: 'Sign Up' },
        { value: 'SURVEY', label: 'Survey' },
    ];

    // Inline rename state
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState('');

    // --- Actions ---

    const { execute: executeGetLocal } = useAction(getFlows, {
        onSuccess: (data) => setLocalFlows(data.flows || []),
        onError: (err) => toast.error(err)
    });

    const { execute: executeSaveLocal } = useAction(saveFlow, {
        onSuccess: (data) => {
            toast.success(selectedFlow ? "Flow updated" : "Flow created");
            setIsCreateModalOpen(false);
            executeGetLocal({ workspaceId });
            if (!selectedFlow) {
                // If it was a new flow, open builder
                handleEditLocal(data.flow);
            }
        },
        onError: (err) => toast.error(err),
        onComplete: () => setIsUpdating(false)
    });

    const { execute: executeDeleteLocal } = useAction(deleteFlow, {
        onSuccess: () => {
            toast.success("Flow deleted");
            executeGetLocal({ workspaceId });
        }
    });

    const { execute: executePush, isLoading: isPushing } = useAction(pushFlowToMeta, {
        onSuccess: (data) => {
            toast.success("Flow pushed to Meta successfully");
            executeGetLocal({ workspaceId });
        },
        onError: (error) => toast.error(error)
    });

    const { execute: executePublish, isLoading: isPublishing } = useAction(publishMetaFlow, {
        onSuccess: (data) => {
            toast.success("Flow published on Meta");
            executeGetLocal({ workspaceId });
        },
        onError: (error) => toast.error(error)
    });

    const { execute: executeSync, isLoading: isSyncing } = useAction(syncMetaFlows, {
        onSuccess: (data) => {
            toast.success(`Synced ${data.count} flows from Meta`);
            executeGetLocal({ workspaceId });
        },
        onError: (error) => toast.error(error)
    });

    const { execute: executeClone, isLoading: isCloning } = useAction(cloneFlow, {
        onSuccess: () => {
            toast.success('Flow cloned successfully');
            executeGetLocal({ workspaceId });
        },
        onError: (error) => toast.error(error)
    });

    const { execute: executeGetDecrypted } = useAction(getDecryptedCredentials, {
        onSuccess: (data) => {
            const token = data?.accessToken || data.data?.accessToken;
            const wid = data?.wabaId ? data.wabaId.toString() : data.data?.wabaId?.toString();
            if (token) setMetaCloudAccessToken(token);
            if (wid) {
                setWabaId(wid);
                fetchMetaFlows(token, wid);
            }
        }
    });

    const { execute: executeApi } = useAction(testMetaApi, {
        onSuccess: (data, context) => {
            if (data.success) {
                if (context.type === 'meta_flows_list') {
                    setMetaFlows(data.apiData.data || []);
                }
            }
            setIsFetching(false);
        }
    });

    // --- Effects ---

    useEffect(() => {
        if (workspaceId) {
            executeGetLocal({ workspaceId });
            executeGetDecrypted({ workspaceId });
        }

        const handleAccountSwitch = () => {
            executeGetLocal({ workspaceId });
            executeGetDecrypted({ workspaceId });
        };

        window.addEventListener('wa-account-switched', handleAccountSwitch);
        return () => window.removeEventListener('wa-account-switched', handleAccountSwitch);
    }, [workspaceId]);

    // --- Handlers ---

    const fetchMetaFlows = (tokenOverride, widOverride) => {
        const activeToken = tokenOverride || metaCloudAccessToken;
        const activeWid = widOverride || wabaId;
        if (!activeToken || !activeWid) return;

        setIsFetching(true);
        executeApi({
            workspaceId,
            url: `https://graph.facebook.com/${metaCloudVersion}/${activeWid}/flows?fields=id,name,status,categories,preview_url`,
            headers: { 'Authorization': `Bearer ${activeToken}` }
        }, { type: 'meta_flows_list' });
    };

    const handleCreateLocal = () => {
        if (!newFlowName.trim()) return;
        setIsUpdating(true);
        executeSaveLocal({
            workspaceId,
            name: newFlowName.trim(),
            categories: [newFlowCategory],
            endpointUrl: newFlowEndpoint.trim() || null,
            screens: []
        });
        setNewFlowCategory('OTHER');
        setNewFlowEndpoint('');
    };

    const handleEditLocal = (flow) => {
        setSelectedFlow(flow);
        setView('builder');
    };

    const handleSaveFromBuilder = (screens, definitionJson) => {
        if (!selectedFlow) return;
        toast.promise(
            executeSaveLocal({
                workspaceId,
                id: selectedFlow.id,
                name: selectedFlow.name,
                screens,
                definition: JSON.parse(definitionJson)
            }),
            {
                loading: 'Saving flow definitions...',
                success: 'Flow saved successfully',
                error: 'Failed to save flow'
            }
        );
    };

    const flowValidationErrors = (flow) => {
        return flow.validationErrors || flow.metaValidationErrors || [];
    };

    const getStatusBadge = (status) => {
        switch (status?.toUpperCase()) {
            case 'PUBLISHED':
                return (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0 h-4.5 gap-1 font-medium shadow-none">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Published
                    </Badge>
                );
            case 'DRAFT':
                return (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] px-1.5 py-0 h-4.5 gap-1 font-medium shadow-none">
                        <Clock className="w-2.5 h-2.5" /> Draft
                    </Badge>
                );
            case 'DEPRECATED':
                return (
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] px-1.5 py-0 h-4.5 gap-1 font-medium shadow-none">
                        <AlertCircle className="w-2.5 h-2.5" /> Deprecated
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4.5 font-medium">
                        {status || 'Draft'}
                    </Badge>
                );
        }
    };

    if (view === 'builder') {
        return (
            <div className="flex flex-col h-full bg-background animate-in slide-in-from-right duration-500">
                <div className="flex items-center justify-between p-4 border-b bg-card/50">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setView('list')} className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex flex-col">
                            {isEditingName ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        autoFocus
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        onBlur={() => {
                                            if (tempName.trim() && tempName !== selectedFlow.name) {
                                                executeSaveLocal({
                                                    workspaceId,
                                                    id: selectedFlow.id,
                                                    name: tempName.trim()
                                                });
                                                setSelectedFlow({ ...selectedFlow, name: tempName.trim() });
                                            }
                                            setIsEditingName(false);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') e.currentTarget.blur();
                                            if (e.key === 'Escape') {
                                                setTempName(selectedFlow.name);
                                                setIsEditingName(false);
                                            }
                                        }}
                                        className="text-sm font-bold bg-transparent border-b border-primary outline-none px-0 py-0.5 min-w-[200px]"
                                    />
                                </div>
                            ) : (
                                <h2
                                    className="text-sm font-bold cursor-pointer hover:text-primary transition-colors flex items-center gap-2 group"
                                    onClick={() => {
                                        setTempName(selectedFlow.name);
                                        setIsEditingName(true);
                                    }}
                                >
                                    {selectedFlow?.name}
                                    <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                                </h2>
                            )}
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Visual Flow Designer</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden p-4">
                    <FlowBuilder
                        initialScreens={selectedFlow?.screens || []}
                        onSave={handleSaveFromBuilder}
                        endpointUrl={selectedFlow?.endpointUrl || ''}
                    />
                </div>
            </div>
        );
    }

    const currentFlows = activeTab === 'local' ? localFlows : metaFlows;
    const filteredFlows = currentFlows.filter(flow =>
        flow.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flow.id?.includes(searchTerm)
    );

    return (
        <div className="flex flex-col h-full  animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-border/40  backdrop-blur-md sticky top-0 z-20 gap-4">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                        <Layers className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-foreground">WhatsApp Flows</h1>
                        <p className="text-xs text-muted-foreground">Build and manage multi-screen interactive form experiences.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <AccountSwitcher />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => executeSync({ workspaceId })}
                        disabled={isSyncing}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing || isFetching ? 'animate-spin' : ''}`} />
                        Sync Meta
                    </Button>
                    <Button
                        className="gap-2 shadow-lg shadow-primary/20"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus className="w-4 h-4" />
                        Design New Flow
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex flex-col p-6 space-y-6 overflow-hidden">
                {/* Search and Tabs */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <Input
                            placeholder="Search flows..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 bg-card shadow-sm border-muted-foreground/10 rounded-md"
                        />
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                        <TabsList className="bg-muted/30 p-1 h-11 rounded-lg border">
                            <TabsTrigger value="local" className="rounded-md gap-2 text-sm font-bold px-5">
                                <Layout className="w-3.5 h-3.5" />
                                Local Drafts
                            </TabsTrigger>
                            <TabsTrigger value="meta" className="rounded-md gap-2 text-sm font-bold px-5">
                                <Globe className="w-3.5 h-3.5" />
                                Synced from Meta
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
                        {filteredFlows.length > 0 ? (
                            filteredFlows.map((flow) => {
                                const screenCount = flow.screens?.length || 0;
                                const errs = (() => {
                                    try {
                                        const raw = flow.metaValidationErrors;
                                        if (Array.isArray(raw)) return raw;
                                        if (typeof raw === 'string') return JSON.parse(raw);
                                        return [];
                                    } catch { return []; }
                                })();

                                return (
                                    <Card 
                                        key={flow.id} 
                                        className="group border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-200 bg-card/60 backdrop-blur-sm relative rounded-xl overflow-hidden flex flex-col justify-between"
                                    >
                                        <div className="p-3.5 space-y-2.5 min-w-0">
                                            {/* Header: Title + Status */}
                                            <div className="flex items-start justify-between gap-2 min-w-0">
                                                <div className="min-w-0 flex-1">
                                                    <h3 
                                                        className="text-sm font-semibold text-foreground break-words whitespace-normal leading-snug group-hover:text-primary transition-colors cursor-pointer"
                                                        title={flow.name}
                                                        onClick={() => activeTab === 'local' && handleEditLocal(flow)}
                                                    >
                                                        {flow.name}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                                                        <span className="text-[10px] font-mono text-muted-foreground/70 truncate">
                                                            {activeTab === 'local' ? `ID: ${flow.id.slice(-8)}` : `Meta: ${flow.id}`}
                                                        </span>
                                                        {activeTab === 'local' && (
                                                            <span className="text-[10px] text-muted-foreground/60 shrink-0">
                                                                • {screenCount} {screenCount === 1 ? 'screen' : 'screens'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="shrink-0">
                                                    {getStatusBadge(flow.status)}
                                                </div>
                                            </div>

                                            {/* Categories & Badges */}
                                            {flow.categories && flow.categories.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {flow.categories.map((cat) => (
                                                        <Badge 
                                                            key={cat} 
                                                            variant="outline" 
                                                            className="text-[9px] font-medium px-1.5 py-0 h-4 bg-muted/20 border-border/40 text-muted-foreground rounded"
                                                        >
                                                            {cat}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Validation Errors Banner */}
                                            {errs.length > 0 && (
                                                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2 space-y-0.5">
                                                    {errs.slice(0, 1).map((err, i) => (
                                                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-destructive leading-tight">
                                                            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                                                            <span className="truncate flex-1" title={err.message || JSON.stringify(err)}>
                                                                {err.message || JSON.stringify(err)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {errs.length > 1 && (
                                                        <p className="text-[10px] text-destructive/80 font-medium pl-4.5">
                                                            +{errs.length - 1} more issue{errs.length - 1 === 1 ? '' : 's'}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Compact Footer Actions */}
                                        <div className="px-3.5 py-2.5 bg-muted/10 border-t border-border/40 flex items-center justify-between gap-1.5">
                                            {activeTab === 'local' ? (
                                                <>
                                                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="h-7 px-3 text-xs font-medium gap-1.5 rounded-md flex-1 min-w-0 truncate"
                                                            onClick={() => handleEditLocal(flow)}
                                                        >
                                                            <Pencil className="w-3 h-3 shrink-0" />
                                                            <span className="truncate">Design</span>
                                                        </Button>

                                                        {!flow.flowId ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 px-2.5 text-xs font-medium gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20 rounded-md shrink-0"
                                                                onClick={() => executePush({ workspaceId, id: flow.id })}
                                                                disabled={isPushing}
                                                                title="Push flow to Meta"
                                                            >
                                                                <Globe className={`w-3 h-3 ${isPushing ? 'animate-spin' : ''}`} />
                                                                <span>Push</span>
                                                            </Button>
                                                        ) : flow.status === 'DRAFT' ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 px-2.5 text-xs font-medium gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 rounded-md shrink-0"
                                                                onClick={() => executePublish({ workspaceId, id: flow.id })}
                                                                disabled={isPublishing}
                                                                title="Publish live to Meta"
                                                            >
                                                                <CheckCircle2 className={`w-3 h-3 ${isPublishing ? 'animate-spin' : ''}`} />
                                                                <span>Publish</span>
                                                            </Button>
                                                        ) : null}
                                                    </div>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground shrink-0"
                                                            >
                                                                <MoreVertical className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-36">
                                                            <DropdownMenuItem
                                                                className="text-xs gap-2 cursor-pointer"
                                                                onClick={() => executeClone({ workspaceId, id: flow.id })}
                                                                disabled={isCloning}
                                                            >
                                                                <Copy className="w-3.5 h-3.5" />
                                                                Clone
                                                            </DropdownMenuItem>
                                                            {flow.flowId && (
                                                                <DropdownMenuItem
                                                                    className="text-xs gap-2 cursor-pointer"
                                                                    onClick={() => executePush({ workspaceId, id: flow.id })}
                                                                    disabled={isPushing}
                                                                >
                                                                    <Globe className="w-3.5 h-3.5" />
                                                                    Re-push
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-xs gap-2 text-destructive focus:text-destructive cursor-pointer"
                                                                onClick={() => executeDeleteLocal({ workspaceId, id: flow.id })}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-between w-full gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 h-7 text-xs font-medium gap-1.5 text-foreground hover:bg-primary/5 hover:text-primary rounded-md truncate"
                                                        onClick={() => window.open(`https://business.facebook.com/wa/manage/flows/${flow.id}`, '_blank')}
                                                    >
                                                        <ExternalLink className="w-3 h-3 shrink-0" />
                                                        <span className="truncate">Meta Manager</span>
                                                    </Button>
                                                    {flow.preview_url && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground shrink-0"
                                                            onClick={() => window.open(flow.preview_url, '_blank')}
                                                            title="Preview Flow"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-24 bg-card border border-dashed rounded-3xl gap-4 text-center">
                                <div className="p-4 bg-primary/5 rounded-full border border-primary/10 text-primary/40">
                                    {activeTab === 'local' ? <Layout className="w-8 h-8" /> : <Globe className="w-8 h-8" />}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-foreground">
                                        {activeTab === 'local' ? "No local drafts" : "No flows found on Meta"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                        {activeTab === 'local'
                                            ? "Click 'Design New Flow' to start building your interactive experience."
                                            : "Make sure your WhatsApp credentials are correctly configured in Settings."}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Create Local Flow Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[480px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>New Flow Draft</DialogTitle>
                        <DialogDescription>Set up your flow details before designing screens.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Flow Name</Label>
                            <Input
                                value={newFlowName}
                                onChange={(e) => setNewFlowName(e.target.value)}
                                placeholder="e.g., Customer Feedback Form"
                                className="h-11 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={newFlowCategory} onValueChange={setNewFlowCategory}>
                                <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {FLOW_CATEGORIES.map(cat => (
                                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                                Endpoint URL
                                <span className="text-[10px] text-muted-foreground font-normal">(for data_exchange actions)</span>
                            </Label>
                            <Input
                                value={newFlowEndpoint}
                                onChange={(e) => setNewFlowEndpoint(e.target.value)}
                                placeholder="https://your-api.com/webhook"
                                className="h-11 rounded-xl font-mono text-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateLocal} disabled={isUpdating || !newFlowName.trim()} className="rounded-xl gap-2 px-6">
                            {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Create Draft
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
