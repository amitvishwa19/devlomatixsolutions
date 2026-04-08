'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Key,
    Database,
    Plus,
    Server,
    Loader2,
    Settings2,
    ShieldAlert,
    ShieldCheck,
    AlertCircle,
    Activity,
    Trash2,
    List,
    LayoutGrid
} from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/utils/axios';

import { useModal } from '@/hooks/useModal';
import { AddCredentialModal } from '../../article/_components/AddCredentialModal';
import { Badge } from '@/components/ui/badge';

export default function SystemCredentials({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params?.workspaceId;

    const { onOpen } = useModal();
    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list');

    const fetchCredentials = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/workspace/${workspaceId}/social/accounts`);
            setCredentials(res.data);
        } catch (error) {
            console.error("Failed to fetch credentials:", error);
            toast.error("Failed to load connected credentials.");
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchCredentials();
    }, [fetchCredentials]);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to completely delete this credential? This cannot be undone.")) return;

        try {
            await axios.delete(`/api/workspace/${workspaceId}/social/accounts/${id}`);
            toast.success("Credential deleted safely.");
            fetchCredentials();
        } catch (error) {
            console.error("Delete Error:", error);
            toast.error("Failed to delete credential.");
        }
    };

    return (
        <div className="p-6 space-y-6 animate-fade-in bg-background/50 min-h-screen">
            {/* Modal Injection */}
            <AddCredentialModal />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2 ">
                        <Key className="text-primary w-6 h-6" /> System Capabilities Vault
                    </h1>
                    <p className="text-xs text-muted-foreground font-semibold mt-1">
                        Universally manage API Keys, AI Models, and third-party Social Authentications.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-background rounded-md p-1 border border-border shadow-soft">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className={`px-3 rounded-md transition-all text-[10px] font-bold mr-1 ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                        >
                            <List className="w-3.5 h-3.5 mr-2" /> List
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className={`px-3 rounded-md transition-all text-[10px] font-bold ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5 mr-2" /> Grid
                        </Button>
                    </div>

                    <Button
                        onClick={() => onOpen('addCredential', { workspaceId, onApply: fetchCredentials })}
                        className="rounded-md font-bold text-xs shadow-md shadow-primary/20 hover:scale-105 transition-transform"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add New Capability
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="py-24 flex items-center justify-center w-full">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
            ) : credentials.length === 0 ? (
                <Card className="border-dashed border-2 border-border/50 bg-card/10">
                    <CardContent className="flex flex-col items-center justify-center p-16 text-center space-y-4">
                        <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-2">
                            <Database className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                        <h2 className="text-lg font-bold text-foreground">Vault is Empty</h2>
                        <p className="text-xs text-muted-foreground font-medium max-w-sm">
                            You have no API credentials or connected applications. Open the vault securely and link your first operational capability.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => onOpen('addCredential', { workspaceId, onApply: fetchCredentials })}
                            className="mt-4"
                        >
                            <Key className="w-4 h-4 mr-2" /> Vault Settings
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
                    {credentials.map((cred) => (
                        <Card key={cred.id} className={`border-border/40 hover:border-primary/40 bg-card shadow-sm hover:shadow-xl transition-all duration-300 ${viewMode === 'list' ? 'flex flex-row items-center justify-between p-1' : ''}`}>
                            <CardHeader className={`pb-3 ${viewMode === 'list' ? 'border-b-0 w-1/3 pt-3' : 'border-b border-border/10'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <CardTitle className="text-sm font-bold tracking-tight uppercase flex items-center gap-2 text-foreground">
                                            {cred.platform === 'GEMINI' ? <Activity className="w-4 h-4 text-purple-500" /> : <Server className="w-4 h-4 text-primary" />}
                                            {cred.platform}
                                        </CardTitle>
                                        <CardDescription className="text-[10px] mt-1 font-semibold truncate max-w-[200px]">
                                            {cred.profileName || cred.profile || "Core Credential"}
                                        </CardDescription>
                                    </div>
                                    {viewMode !== 'list' && (
                                        <Badge variant={cred.status === 'connected' ? 'default' : 'secondary'} className={cred.status === 'connected' ? 'bg-emerald-500/10 text-emerald-500' : ''}>
                                            {cred.status === 'connected' ? <ShieldCheck className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                                            {cred.status}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className={`py-4 space-y-3 ${viewMode === 'list' ? 'flex-1 flex items-center gap-4 py-0 justify-center border-l border-border/10 mb-0' : ''}`}>
                                {viewMode === 'list' && (
                                    <Badge variant={cred.status === 'connected' ? 'default' : 'secondary'} className={cred.status === 'connected' ? 'bg-emerald-500/10 text-emerald-500 shrink-0' : 'shrink-0'}>
                                        {cred.status === 'connected' ? <ShieldCheck className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                                        {cred.status}
                                    </Badge>
                                )}
                                {cred.model && (
                                    <div className={`text-[10px] bg-muted/40 p-2 rounded-md font-mono text-muted-foreground border border-border/40 truncate ${viewMode === 'list' ? 'mb-0 py-1 px-3' : ''}`}>
                                        Bound Model: <span className="font-bold text-foreground ml-1">{cred.model}</span>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className={`pt-2 pb-4 px-4 bg-muted/10 border-t border-border/10 flex items-center justify-between ${viewMode === 'list' ? 'border-t-0 bg-transparent py-0 mt-0 pt-0 pb-0 border-l justify-end w-1/5 gap-2' : ''}`}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[10px] text-primary"
                                    onClick={() => onOpen('addCredential', { workspaceId, initialData: cred, onApply: fetchCredentials })}
                                >
                                    <Settings2 className="w-3.5 h-3.5 mr-1.5" /> Reconfigure
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[10px] text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(cred.id)}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
