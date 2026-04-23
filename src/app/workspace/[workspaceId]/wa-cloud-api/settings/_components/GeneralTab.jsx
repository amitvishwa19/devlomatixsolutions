'use client';

import React, { useState, useEffect } from 'react';
import {
    Globe,
    Plus,
    MessageSquare,
    CheckCircle2,
    AlertCircle,
    Star,
    Zap,
    RefreshCw,
    Info,
    Settings,
    Trash2,
    Copy,
    Database,
    LayoutDashboard,
    ChevronRight,
    MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAction } from "@/hooks/use-action";
import { getCredentials } from "../_actions/get-credentials";
import { saveCloudCredentials } from "../_actions/save-cloud-credentials";
import { deleteCredential } from "../_actions/delete-credential";
import { setDefaultCredential } from "../_actions/set-default-credential";
import { testCredential } from "../_actions/test-credential";
import { syncTemplates } from "../../template/_actions/sync-templates";
import { getTemplates } from "../../template/_actions/get-templates";

import { testMetaApi } from "../_actions/test-meta-api";
import { getDecryptedCredentials } from "../_actions/get-decrypted-credentials";

import { CloudAccountModal } from './CloudAccountModal';
import { DeleteAccountModal } from './DeleteAccountModal';

export function GeneralTab({ workspaceId, metaCloudVersion }) {
    const [cloudCreds, setCloudCreds] = useState([]);
    const [cloudLoading, setCloudLoading] = useState(false);
    const [testState, setTestState] = useState({});
    const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState(null);
    const [tempCreds, setTempCreds] = useState({
        id: null,
        profile: '',
        phoneNumberId: '',
        wabaId: '',
        accessToken: ''
    });

    // Analytics States (Moved here from page.jsx for modularity)
    const [analyticsWabaId, setAnalyticsWabaId] = useState('');
    const [analyticsGranularity, setAnalyticsGranularity] = useState('DAY');
    const [analyticsSince, setAnalyticsSince] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [analyticsUntil, setAnalyticsUntil] = useState(new Date().toISOString().split('T')[0]);
    const [analyticsMsgTesting, setAnalyticsMsgTesting] = useState(false);
    const [analyticsMsgResult, setAnalyticsMsgResult] = useState(null);
    const [analyticsMsgOpen, setAnalyticsMsgOpen] = useState(true);
    const [analyticsConvTesting, setAnalyticsConvTesting] = useState(false);
    const [analyticsConvResult, setAnalyticsConvResult] = useState(null);
    const [analyticsConvOpen, setAnalyticsConvOpen] = useState(true);
    const [metaCloudAccessToken, setMetaCloudAccessToken] = useState('');

    const { execute: executeGetCreds } = useAction(getCredentials, {
        onSuccess: (data) => {
            setCloudCreds(data.credentials || []);
            setCloudLoading(false);
            // Auto-set WABA ID if there's a default account
            const defaultAcc = data.credentials?.find(c => c.isDefault);
            if (defaultAcc && !analyticsWabaId) setAnalyticsWabaId(defaultAcc.wabaId);
        },
        onError: () => setCloudLoading(false)
    });

    const { execute: executeSaveCreds } = useAction(saveCloudCredentials, {
        onSuccess: () => {
            toast.success(tempCreds.id ? 'Account updated' : 'New account added');
            setIsCredsModalOpen(false);
            fetchCloudCreds();
            setTempCreds({ id: null, profile: '', phoneNumberId: '', wabaId: '', accessToken: '' });
        },
        onError: (error) => {
            toast.error(error);
            setCloudLoading(false);
        }
    });

    const { execute: executeSetDefault } = useAction(setDefaultCredential, {
        onSuccess: () => {
            toast.success('Default account updated');
            fetchCloudCreds();
        },
        onError: (error) => {
            toast.error(error);
        }
    });

    const { execute: executeRemoveCred } = useAction(deleteCredential, {
        onSuccess: () => {
            toast.success('Account removed successfully');
            setIsDeleteModalOpen(false);
            setAccountToDelete(null);
            fetchCloudCreds();
        },
        onError: () => setCloudLoading(false)
    });

    const { execute: executeTestCred } = useAction(testCredential, {
        onSuccess: (data, id) => {
            toast.success('Connection verified!');
            setTestState(prev => ({ ...prev, [id]: 'success' }));
            fetchCloudCreds();
        },
        onError: (error, id) => {
            toast.error(error);
            setTestState(prev => ({ ...prev, [id]: 'error' }));
        }
    });

    const { execute: executeGetDecrypted } = useAction(getDecryptedCredentials, {
        onSuccess: (data) => {
            if (data.data?.accessToken) setMetaCloudAccessToken(data.data.accessToken);
            if (data.data?.wabaId && !analyticsWabaId) setAnalyticsWabaId(data.data.wabaId);
        }
    });

    const { execute: executeTestApi } = useAction(testMetaApi, {
        onSuccess: (data, context) => {
            if (context.type === 'meta_analytics_msg') {
                setAnalyticsMsgResult(data.apiData);
                setAnalyticsMsgOpen(true);
                setAnalyticsMsgTesting(false);
            } else if (context.type === 'meta_analytics_conv') {
                setAnalyticsConvResult(data.apiData);
                setAnalyticsConvOpen(true);
                setAnalyticsConvTesting(false);
            }
            if (data.success) toast.success("Analytics fetched successfully");
            else toast.error(data.error || "Operation failed");
        },
        onError: (error, context) => {
            toast.error(error);
            if (context.type === 'meta_analytics_msg') setAnalyticsMsgTesting(false);
            else if (context.type === 'meta_analytics_conv') setAnalyticsConvTesting(false);
        }
    });

    const fetchCloudCreds = () => {
        setCloudLoading(true);
        executeGetCreds({ workspaceId });
    };

    useEffect(() => {
        if (workspaceId) {
            fetchCloudCreds();
            executeGetDecrypted({ workspaceId });
        }
    }, [workspaceId]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const handleSetDefaultAccount = (id) => {
        executeSetDefault({ workspaceId, id });
    };

    const handleTestConnection = (id) => {
        setTestState(prev => ({ ...prev, [id]: 'loading' }));
        executeTestCred({ workspaceId, id }, id);
    };

    const handleSaveCloudCreds = () => {
        if (!tempCreds.phoneNumberId || !tempCreds.wabaId || (!tempCreds.id && !tempCreds.accessToken)) {
            toast.error("Please fill in all required fields");
            return;
        }
        setCloudLoading(true);
        executeSaveCreds({
            workspaceId,
            ...tempCreds
        });
    };

    const handleDeleteCloudCred = () => {
        if (!accountToDelete) return;
        setCloudLoading(true);
        executeRemoveCred({ workspaceId, id: accountToDelete.id });
    };

    const handleFetchMsgAnalytics = () => {
        if (!analyticsWabaId?.trim()) { toast.error('WABA ID required.'); return; }
        if (!metaCloudAccessToken?.trim()) { toast.error('Access Token required.'); return; }

        const start = Math.floor(new Date(analyticsSince).getTime() / 1000);
        const end = Math.floor(new Date(analyticsUntil).getTime() / 1000);
        const url = `https://graph.facebook.com/${metaCloudVersion}/${analyticsWabaId.trim()}/analytics?start=${start}&end=${end}&granularity=${analyticsGranularity}&phone_numbers=[]`;

        setAnalyticsMsgTesting(true);
        executeTestApi({
            workspaceId,
            url,
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken.trim()}` },
        }, { type: 'meta_analytics_msg' });
    };

    const handleFetchConvAnalytics = () => {
        if (!analyticsWabaId?.trim()) { toast.error('WABA ID required.'); return; }
        if (!metaCloudAccessToken?.trim()) { toast.error('Access Token required.'); return; }

        const start = Math.floor(new Date(analyticsSince).getTime() / 1000);
        const end = Math.floor(new Date(analyticsUntil).getTime() / 1000);
        const cats = encodeURIComponent('["MARKETING","UTILITY","AUTHENTICATION","SERVICE"]');
        const dims = encodeURIComponent('["CONVERSATION_CATEGORY","CONVERSATION_TYPE"]');
        const url = `https://graph.facebook.com/${metaCloudVersion}/${analyticsWabaId.trim()}/conversation_analytics?start=${start}&end=${end}&granularity=${analyticsGranularity}&phone_numbers=[]&conversation_categories=${cats}&dimensions=${dims}`;

        setAnalyticsConvTesting(true);
        executeTestApi({
            workspaceId,
            url,
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken.trim()}` },
        }, { type: 'meta_analytics_conv' });
    };

    return (
        <div className="flex-1 outline-none custom-scrollbar overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">


                {/* Main Content (Left) */}
                <div className="md:col-span-8 space-y-6">
                    <Card className="border shadow-sm relative">
                        <CardHeader className="flex flex-row items-center justify-between pb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/5 rounded-lg border border-primary/10">
                                    <Globe className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-semibold">Cloud API Integration</CardTitle>
                                    <CardDescription className="text-xs font-medium">Meta Business Platform Connectivity</CardDescription>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs px-4"
                                onClick={() => {
                                    setTempCreds({ id: null, profile: '', phoneNumberId: '', wabaId: '', accessToken: '' });
                                    setIsCredsModalOpen(true);
                                }}
                            >
                                <Plus className="w-3.5 h-3.5 mr-2" /> Add Account
                            </Button>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {cloudCreds.map((cred) => (
                                <div key={cred.id} className="p-5 bg-card rounded-lg border shadow-sm hover:border-primary/20 transition-all group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-card border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all shadow-sm">
                                                <MessageCircle className="w-5 h-5 text-green-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold">{cred.profile || 'WhatsApp Account'}</span>
                                                    {cred.verified ? (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>Verified Node</TooltipContent>
                                                        </Tooltip>
                                                    ) : (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>Needs Re-verification</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    {!!cred.isDefault && (
                                                        <Badge variant="secondary" className="h-4 text-[9px] font-semibold bg-green-500/10 text-green-600 border-none">
                                                            DEFAULT
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium mt-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="opacity-60 font-semibold">Phone ID:</span>
                                                        <span className="font-mono bg-muted/50 px-2 py-0.5 rounded text-[10px] text-foreground/80">{cred.phoneNumberId || '••••••••'}</span>
                                                        <Copy size={12} className="hover:text-primary cursor-pointer transition-colors opacity-40 hover:opacity-100" onClick={() => copyToClipboard(cred.phoneNumberId)} />
                                                    </div>
                                                    <Separator orientation="vertical" className="h-3 bg-border/40" />
                                                    <div className="flex items-center gap-2">
                                                        <span className="opacity-60 font-semibold">WABA ID:</span>
                                                        <span className="font-mono bg-muted/50 px-2 py-0.5 rounded text-[10px] text-foreground/80">{cred.wabaId || '••••••••'}</span>
                                                        <Copy size={12} className="hover:text-primary cursor-pointer transition-colors opacity-40 hover:opacity-100" onClick={() => copyToClipboard(cred.wabaId)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={`h-9 w-9 rounded-xl transition-all ${!!cred.isDefault ? 'bg-green-500/10 border border-green-500/20 text-green-600 shadow-sm' : 'text-muted-foreground hover:bg-muted/30 hover:text-primary'}`}
                                                        onClick={() => handleSetDefaultAccount(cred.id)}
                                                    >
                                                        <Star className={`w-4 h-4 ${!!cred.isDefault ? 'fill-green-500 text-green-500' : ''}`} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {cred.isDefault ? 'Current Default Account' : 'Set as Default Account'}
                                                </TooltipContent>
                                            </Tooltip>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 px-4 rounded-lg text-xs font-medium transition-all flex items-center gap-2 border border-border/20"
                                                onClick={() => handleTestConnection(cred.id)}
                                                disabled={testState[cred.id] === 'loading'}
                                            >
                                                {testState[cred.id] === 'loading' ? (
                                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Zap size={13} className={testState[cred.id] === 'success' ? 'fill-green-500 text-green-500' : 'text-primary'} />
                                                )}
                                                {testState[cred.id] === 'loading' ? 'Verifying...' : testState[cred.id] === 'success' ? 'Verified' : 'Test'}
                                            </Button>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help opacity-40 hover:opacity-100 transition-opacity" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-[200px] text-[10px] rounded-lg border-border/20 p-3 leading-relaxed">
                                                    Sends a direct text message.
                                                    <br />
                                                    <b className="text-primary">Important:</b> Recipient must have messaged you in the last 24h.
                                                </TooltipContent>
                                            </Tooltip>

                                            <Separator orientation="vertical" className="h-6 mx-1 bg-border/20" />

                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-all" onClick={() => {
                                                setTempCreds({ ...cred, accessToken: '' });
                                                setIsCredsModalOpen(true);
                                            }}>
                                                <Settings size={15} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all" onClick={() => {
                                                setAccountToDelete(cred);
                                                setIsDeleteModalOpen(true);
                                            }}>
                                                <Trash2 size={15} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {cloudCreds.length === 0 && (
                                <div className="text-center py-16 bg-muted/5 border border-dashed border-border/40 rounded-2xl flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-muted/10 flex items-center justify-center">
                                        <Globe className="w-6 h-6 text-muted-foreground/30" />
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium">No Cloud API accounts linked yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-between text-[10px] px-3 font-medium text-muted-foreground/60">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                            <span>System nodes online</span>
                        </div>
                        <span className="italic opacity-60">Engine v3.4.0 (Enterprise)</span>
                    </div>
                </div>

                {/* Sidebar Stats (Right) */}
                <div className="md:col-span-4 space-y-6">
                    <Card className="border shadow-sm p-6 space-y-5">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="p-2 bg-muted/10 rounded-lg">
                                <Database size={14} className="text-foreground/60" />
                            </div>
                            <span className="text-xs font-semibold">Instance Health</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs font-medium">
                                <span className="text-muted-foreground">App Security</span>
                                <Badge variant="secondary" className="text-[10px] font-semibold h-5 bg-green-500/10 text-green-600 border-none">High</Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs font-medium">
                                <span className="text-muted-foreground">Latency</span>
                                <span className="font-semibold text-foreground">0.4ms</span>
                            </div>
                            <div className="pt-2">
                                <div className="w-full h-1 bg-muted/20 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "98%" }}
                                        className="h-full bg-primary/60"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>



                    {/* Analytics Section moved into General Tab */}
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/5 rounded-xl border border-primary/10">
                                <LayoutDashboard className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold">Account Analytics</h3>
                                <p className="text-[10px] text-muted-foreground font-medium">On-demand via Meta Graph API</p>
                            </div>
                        </div>

                        <Card className="border shadow-sm">
                            <CardContent className="pt-5 space-y-4">
                                <div className="flex flex-wrap gap-3 items-end">
                                    <div className="space-y-1.5 flex-1 min-w-[160px]">
                                        <Label className="text-xs font-medium text-muted-foreground ml-1">WABA ID</Label>
                                        <Input
                                            placeholder="waba_id"
                                            className="bg-muted/5 h-11 text-sm font-mono border-border/40 rounded-xl px-4"
                                            value={analyticsWabaId}
                                            onChange={(e) => setAnalyticsWabaId(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5 flex-1 min-w-[200px]">
                                        <Label className="text-xs font-medium text-muted-foreground ml-1">Date Range</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="date"
                                                className="bg-muted/5 h-11 text-sm border-border/40 rounded-xl px-4 flex-1"
                                                value={analyticsSince}
                                                onChange={(e) => setAnalyticsSince(e.target.value)}
                                            />
                                            <Input
                                                type="date"
                                                className="bg-muted/5 h-11 text-sm border-border/40 rounded-xl px-4 flex-1"
                                                value={analyticsUntil}
                                                onChange={(e) => setAnalyticsUntil(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 w-32">
                                        <Label className="text-xs font-medium text-muted-foreground ml-1">Granularity</Label>
                                        <Select value={analyticsGranularity} onValueChange={setAnalyticsGranularity}>
                                            <SelectTrigger className="h-11 bg-muted/5 text-sm border-border/40 rounded-xl px-4"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-xl border-border/20">
                                                <SelectItem value="DAY" className="text-sm">Day</SelectItem>
                                                <SelectItem value="WEEK" className="text-sm">Week</SelectItem>
                                                <SelectItem value="MONTH" className="text-sm">Month</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Tabs defaultValue="messages" className="w-full">
                                    <TabsList className="bg-muted/5 w-fit justify-start rounded-xl h-auto p-1 gap-1 border border-border/40 mb-4">
                                        <TabsTrigger value="messages" className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                            <MessageSquare size={14} />
                                            Messages
                                        </TabsTrigger>
                                        <TabsTrigger value="conversations" className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                            <LayoutDashboard size={14} />
                                            Conversations
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="messages" className="space-y-3 mt-0">
                                        <div className="px-3 py-2 bg-muted/10 border border-border/20 rounded-md text-[10px] font-mono text-muted-foreground/60 break-all">
                                            GET https://graph.facebook.com/{metaCloudVersion}/{analyticsWabaId || '<waba_id>'}/analytics...
                                        </div>
                                        <Button className="px-6 rounded-md text-xs gap-2" onClick={handleFetchMsgAnalytics} disabled={analyticsMsgTesting || !analyticsWabaId?.trim()}>
                                            {analyticsMsgTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                            {analyticsMsgTesting ? 'Fetching...' : 'Fetch Message Analytics'}
                                        </Button>
                                    </TabsContent>

                                    <TabsContent value="conversations" className="space-y-3 mt-0">
                                        <Button className="px-6 rounded-md text-xs gap-2" onClick={handleFetchConvAnalytics} disabled={analyticsConvTesting || !analyticsWabaId?.trim()}>
                                            {analyticsConvTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                            {analyticsConvTesting ? 'Fetching...' : 'Fetch Conversation Analytics'}
                                        </Button>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <CloudAccountModal
                open={isCredsModalOpen}
                onOpenChange={setIsCredsModalOpen}
                tempCreds={tempCreds}
                setTempCreds={setTempCreds}
                onSave={handleSaveCloudCreds}
                loading={cloudLoading}
            />

            <DeleteAccountModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                accountName={accountToDelete?.profile}
                onDelete={handleDeleteCloudCred}
                loading={cloudLoading}
            />
        </div>
    );
}
