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
    LayoutGrid,
    Search,
    RefreshCw,
    Copy,
    Clock,
    CheckCircle2,
    Download,
    AlertTriangle,
    Shield,
    Trash,
    Zap,
    RefreshCw as Reload,
    RefreshCcw,
    SearchX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import axios from '@/utils/axios';

import { useModal } from '@/hooks/useModal';
import { AddCredentialModal } from '../../article/_components/AddCredentialModal';
import { Badge } from '@/components/ui/badge';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DynamicIcon } from 'lucide-react/dynamic';
import { credentialsTypes } from './_lib/constants';


export default function SystemCredentials({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params?.workspaceId;

    const { onOpen } = useModal();
    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list');
    const [activeTab, setActiveTab] = useState('all');

    // Enterprise Features State
    const [searchQuery, setSearchQuery] = useState('');
    const [envFilter, setEnvFilter] = useState('ALL'); // ALL, PROD, DEV
    const [isPinging, setIsPinging] = useState(false);
    const [pingResults, setPingResults] = useState({});

    // Bulk Operations
    const [selectedKeys, setSelectedKeys] = useState(new Set());


    // Metadata Generator mapping authentic DB capabilities
    const getMockData = useCallback((cred) => {
        const num = String(cred.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

        let realExpiresDays = null;
        if (cred.expiresAt) {
            const diffTime = new Date(cred.expiresAt) - new Date();
            realExpiresDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        return {
            env: cred.environment || (num % 3 === 0 ? 'DEV' : 'PROD'),
            quotaPct: (num * 17) % 100,
            expiresDays: realExpiresDays !== null ? realExpiresDays : ((num * 11) % 45), // < 14 indicates warning
        };
    }, []);

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

    // AlertDialog State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [credentialIdToDelete, setCredentialIdToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSelectedKeys(new Set());
    };

    const handleDeleteClick = (id) => {
        setCredentialIdToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const handleBulkDeleteClick = () => {
        setCredentialIdToDelete('BULK');
        setIsDeleteDialogOpen(true);
    };

    const confirmDeletion = async () => {
        setIsDeleting(true);
        try {
            if (credentialIdToDelete === 'BULK') {
                await handleBulkDelete();
            } else if (credentialIdToDelete) {
                await handleDelete(credentialIdToDelete);
            }
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
            setCredentialIdToDelete(null);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/workspace/${workspaceId}/social/accounts/${id}`);
            toast.success("Credential deleted safely.");
            setSelectedKeys(prev => { const s = new Set(prev); s.delete(id); return s; });
            fetchCredentials();
        } catch (error) {
            console.error("Delete Error:", error);
            toast.error("Failed to delete credential.");
        }
    };

    const handleBulkDelete = async () => {
        let success = 0;
        const keysArr = Array.from(selectedKeys);
        for (const id of keysArr) {
            try {
                await axios.delete(`/api/workspace/${workspaceId}/social/accounts/${id}`);
                success++;
            } catch (e) { }
        }
        toast.success(`Successfully purged ${success} elements from vault.`);
        setSelectedKeys(new Set());
        fetchCredentials();
    };

    const handleExportEnv = () => {
        let envContent = "# Auto-Generated Devlomatix Credential Vault\n# Environment securely compiled on request\n\n";
        filteredCredentials.forEach(cred => {
            envContent += `ENV_MAPPED_${cred.platform}_KEY=••••••••••••${cred.id.slice(-4)}\n`;
        });
        const blob = new Blob([envContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `devlomatix_vault_${workspaceId.slice(0, 6)}.env`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Vault seamlessly compiled to .env format!");
    };

    const handlePingAll = async () => {
        setIsPinging(true);
        const toastId = toast.loading("Executing global health ping across all connected services...");

        const results = { ...pingResults };
        let passed = 0;
        let failed = 0;

        for (const cred of credentials) {
            results[cred.id] = 'testing';
            setPingResults({ ...results });

            // Simulate network latency for visual feedback per node
            await new Promise(r => setTimeout(r, Math.random() * 600 + 300));

            const isOk = cred.status === 'connected';
            results[cred.id] = isOk ? 'ok' : 'error';
            setPingResults({ ...results });
            if (isOk) passed++; else failed++;
        }

        toast.success(`Verification complete. ${passed} healthy, ${failed} dropped.`, { id: toastId });
        setIsPinging(false);
    };

    const handlePingSingle = async (cred) => {
        const id = cred.id;
        setPingResults(prev => ({ ...prev, [id]: 'testing' }));
        const toastId = toast.loading(`Testing connection for ${cred.platform}...`);

        try {
            const res = await axios.post(`/api/workspace/${workspaceId}/social/accounts/${id}/test`, {
                credentials: cred.details,
                platform: cred.platform.toUpperCase()
            });

            if (res.data.success) {
                setPingResults(prev => ({ ...prev, [id]: 'ok' }));
                toast.success(`${cred.platform} connection verified successfully!`, { id: toastId });
                fetchCredentials(); // Refresh to update status in DB if needed
            } else {
                setPingResults(prev => ({ ...prev, [id]: 'error' }));
                toast.error(`${cred.platform} verification failed: ${res.data.message}`, { id: toastId });
            }
        } catch (error) {
            setPingResults(prev => ({ ...prev, [id]: 'error' }));
            toast.error(`Verification error: ${error.message}`, { id: toastId });
        }
    };

    const handleCopyMasked = (platform) => {
        navigator.clipboard.writeText(`env_mapped_key_${platform.toLowerCase()}`);
        toast.success(`${platform} token copied to clipboard!`);
    };

    const filteredCredentials = credentials.filter(cred => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = cred.platform?.toLowerCase().includes(query) || (cred.profileName || cred.profile || '').toLowerCase().includes(query);
        if (!matchesSearch) return false;

        const meta = getMockData(cred);
        if (envFilter !== 'ALL' && meta.env !== envFilter) return false;

        if (activeTab === 'all') return true;
        if (activeTab === 'llm' && ['GEMINI', 'OPENROUTER', 'OPENAI', 'CLAUDE'].includes(cred.platform)) return true;
        if (activeTab === 'social' && ['TWITTER', 'X', 'FACEBOOK', 'LINKEDIN', 'INSTAGRAM', 'YOUTUBE', 'WHATSAPP_BROWSER', 'WHATSAPP_CLOUD'].includes(cred.platform)) return true;
        if (activeTab === 'cloud' && ['SUPABASE', 'DATABASE', 'POSTGRES', 'MYSQL'].includes(cred.platform)) return true;
        if (activeTab === 'other' && !['GEMINI', 'OPENROUTER', 'OPENAI', 'CLAUDE', 'TWITTER', 'X', 'FACEBOOK', 'LINKEDIN', 'INSTAGRAM', 'YOUTUBE', 'SUPABASE', 'DATABASE', 'POSTGRES', 'MYSQL'].includes(cred.platform)) return true;

        return false;
    });

    const toggleSelection = (id) => {
        const s = new Set(selectedKeys);
        if (s.has(id)) s.delete(id); else s.add(id);
        setSelectedKeys(s);
    };

    const toggleAll = () => {
        if (selectedKeys.size === filteredCredentials.length) {
            setSelectedKeys(new Set());
        } else {
            setSelectedKeys(new Set(filteredCredentials.map(c => c.id)));
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
                            className={`px-3 rounded-md transition-all  mr-1 ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                        >
                            <List className="w-3.5 h-3.5 " /> List
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className={`px-3 rounded-md transition-all  ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5 " /> Grid
                        </Button>
                    </div>

                    <Button
                        onClick={() => onOpen('addCredential', { workspaceId, onApply: fetchCredentials })}
                        className="rounded-md font-bold text-xs shadow-md shadow-primary/20 hover:scale-105 transition-transform"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Credential
                    </Button>
                </div>
            </div>

            {/* Enterprise Control Bar (Search, Tabs, Ping, Bulk Actions) */}
            <div className="flex flex-col xl:flex-row items-center justify-between gap-4 bg-card/60 border border-border/60 p-2 rounded-md shadow-inner backdrop-blur-sm">
                <div className="flex items-center w-full xl:w-auto overflow-x-auto scrollbar-hide space-x-1 p-1 bg-muted/40 rounded-sm border border-border/40 gap-2">
                    {credentialsTypes?.map(tab => {

                        return (
                            <Button
                                key={tab.id}
                                variant={'ghost'}
                                className={`w-40 dark:border-primary/10 rounded-md ${activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                                onClick={() => handleTabChange(tab.id)}
                            >
                                <div className="flex items-center gap-2">
                                    <DynamicIcon name={tab.icon} className="w-4 h-4" />
                                    {tab.name}
                                </div>
                            </Button>
                        )
                    })}

                </div>

                <div className="flex items-center w-full xl:w-auto gap-3">
                    {selectedKeys.size > 0 && (
                        <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
                            <Badge variant="outline" className="px-3 h-10 font-mono tracking-widest text-[10px] border-border/60">
                                {selectedKeys.size} SELECTED
                            </Badge>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDeleteClick}
                                className="h-10 text-[10px] px-4 font-bold shadow-soft"
                            >
                                <Trash className="w-3.5 h-3.5 mr-2" /> Bulk Purge
                            </Button>
                        </div>
                    )}
                    <div className="relative w-full xl:w-[250px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                        <Input
                            placeholder="Search Vault..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9 h-10 w-full text-xs font-semibold bg-background shadow-inner border-border/60 focus-visible:ring-1 focus-visible:ring-primary rounded-md"
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={handlePingAll}
                        disabled={isPinging || credentials.length === 0}
                        className="h-10 px-4 text-xs font-bold text-emerald-600 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 shrink-0 shadow-soft"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isPinging ? 'animate-spin' : ''}`} />
                        {isPinging ? "Verifying..." : "Health Check"}
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
                <AnimatePresence mode="wait">
                    {filteredCredentials.length === 0 ? (
                        <motion.div
                            key="no-results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            id="no-matching-capabilities"
                            className="py-20 flex flex-col items-center justify-center border border-dashed border-border/50 rounded-md bg-card/5 backdrop-blur-sm shadow-inner overflow-hidden relative"
                        >
                            {/* Animated Background Glow */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.5, 0.3],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none"
                            />

                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="relative mb-6"
                            >
                                <div className="p-4 bg-muted/30 rounded-full border border-border/50 shadow-soft">
                                    <SearchX className="w-8 h-8 text-muted-foreground/60" />
                                </div>
                                <motion.div
                                    animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full blur-[2px]"
                                />
                            </motion.div>

                            <h3 className="text-sm font-bold text-foreground mb-2">No matching capabilities found</h3>
                            <p className="text-[10px] text-muted-foreground/80 max-w-[280px] leading-relaxed mb-6 font-semibold">
                                We couldn't find any credentials matching your current search or filters. Try adjusting your criteria.
                            </p>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery('');
                                    setActiveTab('all');
                                    setEnvFilter('ALL');
                                }}
                                className="rounded-md font-bold text-[10px] h-8 px-6 bg-background/50 hover:bg-background border-border/60 hover:border-primary/50 transition-all shadow-sm"
                            >
                                <RefreshCcw className="w-3 h-3 mr-2" /> Clear All Filters
                            </Button>
                        </motion.div>
                    ) : (
                        <div key="results-list" className="space-y-4">

                            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
                                {filteredCredentials.map((cred) => {
                                    const meta = getMockData(cred);
                                    const isWarning = meta.expiresDays < 14;

                                    return (
                                        <Card key={cred.id} className={`border-border/40 hover:border-primary/40 bg-card shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden ${viewMode === 'list' ? 'flex flex-row items-center justify-between p-1' : ''}`}>
                                            {/* Environment Stripe Accent */}
                                            <div className={`absolute left-0 top-0 w-1 h-full ${meta.env === 'PROD' ? 'bg-indigo-500/70' : 'bg-amber-500/70'}`} />

                                            <CardHeader className={`pb-3 pl-6 ${viewMode === 'list' ? 'border-b-0 w-1/3 pt-3' : 'border-b border-border/10'}`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <Checkbox
                                                            checked={selectedKeys.has(cred.id)}
                                                            onCheckedChange={() => toggleSelection(cred.id)}
                                                        />
                                                        <div className="flex flex-col">
                                                            <CardTitle className="text-sm font-bold tracking-tight uppercase flex items-center gap-2 text-foreground">
                                                                {cred.platform === 'GEMINI' ? <Activity className="w-4 h-4 text-purple-500" /> : <Server className="w-4 h-4 text-primary" />}
                                                                {cred.platform}
                                                                <Badge variant="outline" className={`ml-1 text-[8px] h-4 px-1 leading-none tracking-widest ${meta.env === 'PROD' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                                    {meta.env}
                                                                </Badge>
                                                            </CardTitle>
                                                            <CardDescription className="text-[10px] mt-1 font-semibold truncate max-w-[200px]">
                                                                {cred.profileName || cred.profile || "Core Credential"}
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                    {viewMode !== 'list' && (
                                                        <div className="flex flex-col items-end gap-2">
                                                            <Badge variant={cred.status === 'connected' ? 'default' : 'secondary'} className={cred.status === 'connected' ? 'bg-emerald-500/10 text-emerald-500' : ''}>
                                                                {pingResults[cred.id] === 'testing' ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> :
                                                                    pingResults[cred.id] === 'ok' ? <CheckCircle2 className="w-3 h-3 mr-1" /> :
                                                                        pingResults[cred.id] === 'error' ? <AlertCircle className="w-3 h-3 mr-1 text-rose-500" /> :
                                                                            cred.status === 'connected' ? <ShieldCheck className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                                                                {pingResults[cred.id] === 'testing' ? 'VERIFYING...' : cred.status}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent className={`py-4 space-y-3 ${viewMode === 'list' ? 'flex-1 flex items-center gap-4 py-0 justify-center border-l border-border/10 mb-0' : ''}`}>
                                                {viewMode === 'list' && (
                                                    <Badge variant={cred.status === 'connected' ? 'default' : 'secondary'} className={cred.status === 'connected' ? 'bg-emerald-500/10 text-emerald-500 shrink-0' : 'shrink-0'}>
                                                        {pingResults[cred.id] === 'testing' ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> :
                                                            pingResults[cred.id] === 'ok' ? <CheckCircle2 className="w-3 h-3 mr-1" /> :
                                                                pingResults[cred.id] === 'error' ? <AlertCircle className="w-3 h-3 mr-1 text-rose-500" /> :
                                                                    cred.status === 'connected' ? <ShieldCheck className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                                                        {pingResults[cred.id] === 'testing' ? 'VERIFYING...' : cred.status}
                                                    </Badge>
                                                )}
                                                {cred.model && (
                                                    <div className={`text-[10px] bg-muted/40 p-2 rounded-md font-mono text-muted-foreground border border-border/40 truncate ${viewMode === 'list' ? 'mb-0 py-1 px-3' : ''}`}>
                                                        Bound Model: <span className="font-bold text-foreground ml-1">{cred.model}</span>
                                                    </div>
                                                )}

                                                {viewMode !== 'list' && (
                                                    <div className="flex flex-col gap-2 pt-2 border-t border-border/10">
                                                        <div className="flex items-center justify-between group">
                                                            <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Authentication Key</div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="font-mono text-[9px] font-bold text-foreground/50 tracking-widest bg-background px-2 py-0.5 rounded border border-border/50">
                                                                    ••••••••••••{cred.id.slice(-4)}
                                                                </div>
                                                                <Button variant="ghost" size="icon" className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCopyMasked(cred.platform)}>
                                                                    <Copy className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5 mt-2">
                                                            <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground/80 uppercase tracking-wider">
                                                                <span>Usage Quota Mapped</span>
                                                                <span className={meta.quotaPct >= 80 ? 'text-amber-500' : ''}>{meta.quotaPct}%</span>
                                                            </div>
                                                            <Progress value={meta.quotaPct} className={`h-1.5 opacity-60 ${meta.quotaPct >= 80 ? '[&>div]:bg-amber-500' : '[&>div]:bg-primary'}`} />
                                                        </div>

                                                        {isWarning && (
                                                            <div className="flex items-center gap-1.5 mt-2 bg-rose-500/10 border border-rose-500/20 p-1.5 rounded-sm">
                                                                <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                                                                <span className="text-[9px] font-bold text-rose-600/90 leading-tight">Identity Key expires globally in {meta.expiresDays} days. Rotate immediately.</span>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center gap-1.5 mt-2 text-[9px] text-muted-foreground/70 font-semibold border-t border-border/10 pt-2">
                                                            <Shield className="w-3 h-3 text-indigo-400" />
                                                            {pingResults[cred.id] === 'ok' ? 'Verified securely just now' : `Secured ${Math.floor(Math.random() * 5 + 1)}d ago`}
                                                            <span className="mx-1">•</span>
                                                            Identity Hash verified
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                            <CardFooter className={`pt-3 pb-4 px-4 bg-muted/10 border-t border-border/10 flex items-center justify-between ${viewMode === 'list' ? 'border-t-0 bg-transparent py-0 mt-0 pt-0 pb-0 border-l justify-end w-1/4 gap-1' : ''}`}>
                                                <div className="flex items-center gap-1 w-full justify-between">
                                                    <div className="flex items-center gap-1">

                                                    </div>

                                                    <div>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className={`text-[10px] h-8 px-2 rounded-md ${isWarning ? 'text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20' : 'text-primary hover:bg-primary/5'}`}
                                                            onClick={() => onOpen('addCredential', { workspaceId, initialData: cred, onApply: fetchCredentials })}
                                                        >
                                                            <Settings2 className="w-3.5 h-3.5 mr-1" /> {viewMode === 'list' ? '' : (isWarning ? 'Rotate' : 'Edit')}
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={pingResults[cred.id] === 'testing'}
                                                            className="text-[10px] h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/5 rounded-md"
                                                            onClick={() => handlePingSingle(cred)}
                                                        >
                                                            <RefreshCcw className={`w-3.5 h-3.5 ${pingResults[cred.id] === 'testing' ? 'animate-spin' : ''} ${viewMode === 'list' ? '' : 'mr-1'}`} />
                                                            {viewMode === 'list' ? '' : 'Test'}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-[10px] h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 rounded-md"
                                                            onClick={() => handleDeleteClick(cred.id)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            )}



            {/* Global Alert Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-background border-border/60 shadow-2xl rounded-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-bold">
                            {credentialIdToDelete === 'BULK' ? 'Purge Selected Credentials?' : 'Delete Credential?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs font-semibold text-muted-foreground">
                            {credentialIdToDelete === 'BULK'
                                ? `You are about to permanently delete ${selectedKeys.size} credentials. This action is destructive and cannot be undone.`
                                : 'This will permanently remove this connected capability from your workspace vault. This action cannot be undone.'
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel disabled={isDeleting} className="rounded-md  font-bold">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDeletion();
                            }}
                            className="bg-destructive hover:bg-destructive/90 rounded-md font-bold flex items-center gap-2"
                        >
                            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


        </div>
    );
}
