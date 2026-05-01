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
    FileCode
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
        onSettled: () => setIsUpdating(false)
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
            screens: []
        });
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

    const getStatusBadge = (status) => {
        switch (status?.toUpperCase()) {
            case 'PUBLISHED':
                return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 gap-1"><CheckCircle2 className="w-3 h-3" /> Published</Badge>;
            case 'DRAFT':
                return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1"><Clock className="w-3 h-3" /> Draft</Badge>;
            case 'DEPRECATED':
                return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 gap-1"><AlertCircle className="w-3 h-3" /> Deprecated</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
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
                                                setSelectedFlow({...selectedFlow, name: tempName.trim()});
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
        <div className="flex flex-col h-full bg-background animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-20 gap-4">
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
                            className="pl-10 h-11 bg-card shadow-sm border-muted-foreground/10 rounded-xl"
                        />
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                        <TabsList className="bg-muted/30 p-1 h-11 rounded-xl">
                            <TabsTrigger value="local" className="rounded-lg gap-2 text-xs font-bold px-5">
                                <Layout className="w-3.5 h-3.5" />
                                Local Drafts
                            </TabsTrigger>
                            <TabsTrigger value="meta" className="rounded-lg gap-2 text-xs font-bold px-5">
                                <Globe className="w-3.5 h-3.5" />
                                Synced from Meta
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                        {filteredFlows.length > 0 ? (
                            filteredFlows.map((flow) => (
                                <Card key={flow.id} className="group border shadow-sm hover:border-primary/20 transition-all overflow-hidden bg-card/50 backdrop-blur-sm relative">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1 min-w-0">
                                                <CardTitle className="text-base font-bold truncate group-hover:text-primary transition-colors">{flow.name}</CardTitle>
                                                <CardDescription className="text-[10px] font-mono uppercase opacity-60">
                                                    {activeTab === 'local' ? `Local ID: ${flow.id.slice(-8)}` : `Meta ID: ${flow.id}`}
                                                </CardDescription>
                                            </div>
                                            {getStatusBadge(flow.status)}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex flex-wrap gap-1.5 min-h-[20px]">
                                            {flow.categories?.map((cat) => (
                                                <Badge key={cat} variant="outline" className="text-[9px] font-bold py-0 h-5 bg-muted/20 border-muted-foreground/10">{cat}</Badge>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                                            {activeTab === 'local' ? (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="flex-1 h-9 rounded-lg text-xs font-bold gap-2 text-primary hover:bg-primary/5 transition-all"
                                                        onClick={() => handleEditLocal(flow)}
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                        Design
                                                    </Button>

                                                    {!flow.flowId ? (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="h-9 px-3 rounded-lg text-xs font-bold gap-2 bg-blue-500/5 text-blue-600 border-blue-500/20 hover:bg-blue-500/10"
                                                            onClick={() => executePush({ workspaceId, id: flow.id })}
                                                            disabled={isPushing}
                                                        >
                                                            <Globe className={`w-3.5 h-3.5 ${isPushing ? 'animate-spin' : ''}`} />
                                                            Push
                                                        </Button>
                                                    ) : flow.status === 'DRAFT' ? (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="h-9 px-3 rounded-lg text-xs font-bold gap-2 bg-green-500/5 text-green-600 border-green-500/20 hover:bg-green-500/10"
                                                            onClick={() => executePublish({ workspaceId, id: flow.id })}
                                                            disabled={isPublishing}
                                                        >
                                                            <CheckCircle2 className={`w-3.5 h-3.5 ${isPublishing ? 'animate-spin' : ''}`} />
                                                            Publish
                                                        </Button>
                                                    ) : null}

                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="h-9 px-3 rounded-lg text-xs font-bold gap-2 bg-purple-500/5 text-purple-600 border-purple-500/20 hover:bg-purple-500/10"
                                                        onClick={() => executeClone({ workspaceId, id: flow.id })}
                                                        disabled={isCloning}
                                                    >
                                                        <Copy className={`w-3.5 h-3.5 ${isCloning ? 'animate-spin' : ''}`} />
                                                        Clone
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-red-500/5 hover:text-red-500 transition-all"
                                                        onClick={() => executeDeleteLocal({ workspaceId, id: flow.id })}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="flex-1 h-9 rounded-lg text-xs font-bold gap-2 text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all"
                                                        onClick={() => window.open(`https://business.facebook.com/wa/manage/flows/${flow.id}`, '_blank')}
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                        Open in Meta
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all"
                                                        onClick={() => window.open(flow.preview_url, '_blank')}
                                                        disabled={!flow.preview_url}
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
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
                <DialogContent className="sm:max-w-[425px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>New Flow Draft</DialogTitle>
                        <DialogDescription>Give your flow a name to start designing screens.</DialogDescription>
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
