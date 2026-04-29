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
    Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { useAction } from "@/hooks/use-action";
import { testMetaApi } from "../settings/_actions/test-meta-api";
import { getDecryptedCredentials } from "../settings/_actions/get-decrypted-credentials";

export default function FlowsPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;

    const [metaCloudVersion, setMetaCloudVersion] = useState('v25.0');
    const [metaCloudAccessToken, setMetaCloudAccessToken] = useState('');
    const [wabaId, setWabaId] = useState('');

    const [flows, setFlows] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedFlow, setSelectedFlow] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [flowName, setFlowName] = useState('');

    const { execute: executeGetDecrypted } = useAction(getDecryptedCredentials, {
        onSuccess: (data) => {
            const token = data?.accessToken || data.data?.accessToken;
            const wid = data?.wabaId ? data.wabaId.toString() : data.data?.wabaId?.toString();

            if (token) setMetaCloudAccessToken(token);
            if (wid) {
                setWabaId(wid);
                fetchFlows(token, wid);
            }
        }
    });

    const { execute: executeApi } = useAction(testMetaApi, {
        onSuccess: (data, context) => {
            if (data.success) {
                if (context.type === 'flows_list') {
                    setFlows(data.apiData.data || []);
                } else if (context.type === 'flow_update') {
                    toast.success("Flow updated successfully");
                    setIsEditModalOpen(false);
                    fetchFlows();
                } else if (context.type === 'flow_clone') {
                    toast.success("Flow cloned successfully");
                    setIsCloneModalOpen(false);
                    fetchFlows();
                }
            } else {
                toast.error(data.error || "Operation failed");
            }
            setIsFetching(false);
            setIsUpdating(false);
        },
        onError: (error) => {
            toast.error(error);
            setIsFetching(false);
            setIsUpdating(false);
        }
    });

    useEffect(() => {
        if (workspaceId) {
            executeGetDecrypted({ workspaceId });
        }
    }, [workspaceId]);

    const fetchFlows = (tokenOverride, widOverride) => {
        const activeToken = tokenOverride || metaCloudAccessToken;
        const activeWid = widOverride || wabaId;

        if (!activeToken || !activeWid) return;

        setIsFetching(true);
        executeApi({
            workspaceId,
            url: `https://graph.facebook.com/${metaCloudVersion}/${activeWid}/flows?fields=id,name,status,categories,preview_url`,
            headers: { 'Authorization': `Bearer ${activeToken}` }
        }, { type: 'flows_list' });
    };

    const handleUpdateFlow = () => {
        if (!selectedFlow || !flowName.trim()) return;
        setIsUpdating(true);
        executeApi({
            workspaceId,
            url: `https://graph.facebook.com/${metaCloudVersion}/${selectedFlow.id}`,
            method: 'POST',
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken}` },
            body: { name: flowName.trim() }
        }, { type: 'flow_update' });
    };

    const handleCloneFlow = () => {
        if (!selectedFlow || !flowName.trim()) return;
        setIsUpdating(true);
        executeApi({
            workspaceId,
            url: `https://graph.facebook.com/${metaCloudVersion}/${wabaId}/flows`,
            method: 'POST',
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken}` },
            body: {
                name: flowName.trim(),
                clone_flow_id: selectedFlow.id
            }
        }, { type: 'flow_clone' });
    };

    const filteredFlows = flows.filter(flow =>
        flow.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flow.id?.includes(searchTerm)
    );

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

    return (
        <div className="flex flex-col h-full bg-background animate-in fade-in duration-500">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-20 gap-4">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                        <Layers className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold  text-foreground">WhatsApp Flows</h1>
                        <p className="text-xs text-muted-foreground">Manage and create interactive form-based flows for your chats.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm" className=" "
                        onClick={() => fetchFlows()}
                    >
                        <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                        Refresh Flows
                    </Button>
                    <Button
                        className=" gap-2 shadow-lg shadow-primary/20"
                        onClick={() => window.open(`https://business.facebook.com/wa/manage/flows/`, '_blank')}
                    >
                        <Plus className="w-4 h-4" />
                        Create Flow
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 p-6">
                <div className="w-full space-y-4">
                    {/* Search Bar */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <Input
                            placeholder="Search flows by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 bg-card shadow-sm border-muted-foreground/10 rounded-xl"
                        />
                    </div>

                    {isFetching && flows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-card/50 border border-dashed rounded-3xl gap-4">
                            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-sm font-medium text-muted-foreground">Fetching your flows from Meta...</p>
                        </div>
                    ) : filteredFlows.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredFlows.map((flow) => (
                                <Card key={flow.id} className="group border shadow-sm hover:border-primary/20 transition-all overflow-hidden bg-card/50 backdrop-blur-sm">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1 min-w-0">
                                                <CardTitle className="text-base font-bold truncate group-hover:text-primary transition-colors">{flow.name}</CardTitle>
                                                <CardDescription className="text-[10px] font-mono uppercase text-smer opacity-60">ID: {flow.id}</CardDescription>
                                            </div>
                                            {getStatusBadge(flow.status)}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {flow.categories?.map((cat) => (
                                                <Badge key={cat} variant="outline" className="text-[9px] font-bold py-0 h-5 bg-muted/20 border-muted-foreground/10">{cat}</Badge>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex-1 h-9 rounded-lg text-xs font-bold gap-2 text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all"
                                                onClick={() => {
                                                    setSelectedFlow(flow);
                                                    setFlowName(flow.name);
                                                    setIsEditModalOpen(true);
                                                }}
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex-1 h-9 rounded-lg text-xs font-bold gap-2 text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all"
                                                onClick={() => {
                                                    setSelectedFlow(flow);
                                                    setFlowName(`${flow.name} (Copy)`);
                                                    setIsCloneModalOpen(true);
                                                }}
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                                Clone
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all"
                                                onClick={() => window.open(flow.preview_url, '_blank')}
                                                disabled={!flow.preview_url}
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 bg-card border border-dashed rounded-3xl gap-4 text-center">
                            <div className="p-4 bg-primary/5 rounded-full border border-primary/10">
                                <Layers className="w-8 h-8 text-primary/40" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-foreground">No flows found</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">Click "Create Flow" to build your first interactive WhatsApp experience.</p>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Flow Metadata</DialogTitle>
                        <DialogDescription>Update the name of your WhatsApp flow.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Flow Name</Label>
                            <Input
                                value={flowName}
                                onChange={(e) => setFlowName(e.target.value)}
                                placeholder="Enter flow name..."
                                className="h-11 rounded-xl"
                            />
                        </div>
                        <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl flex gap-3 items-start">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                            <p className="text-[11px] text-blue-600 font-medium">Note: You can only update the flow name here. To edit the flow screens and logic, use the Meta Flow Builder.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateFlow} disabled={isUpdating || !flowName.trim()} className="rounded-xl gap-2">
                            {isUpdating && <RefreshCw className="w-4 h-4 animate-spin" />}
                            Update Flow
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Clone Modal */}
            <Dialog open={isCloneModalOpen} onOpenChange={setIsCloneModalOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Clone Flow</DialogTitle>
                        <DialogDescription>Create a duplicate of this flow with a new name.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>New Flow Name</Label>
                            <Input
                                value={flowName}
                                onChange={(e) => setFlowName(e.target.value)}
                                placeholder="Enter new flow name..."
                                className="h-11 rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsCloneModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCloneFlow} disabled={isUpdating || !flowName.trim()} className="rounded-xl gap-2">
                            {isUpdating && <RefreshCw className="w-4 h-4 animate-spin" />}
                            Clone Flow
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
