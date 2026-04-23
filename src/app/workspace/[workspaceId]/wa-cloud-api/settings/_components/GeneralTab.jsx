'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Plus, MessageSquare, CheckCircle2, AlertCircle, Star, Zap, RefreshCw, Info, Settings, Trash2, Copy, Database, LayoutDashboard, ChevronRight, MessageCircle, Smartphone, User, ExternalLink, ShieldCheck } from 'lucide-react';
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
import { updateTestNumbers } from "../_actions/update-test-numbers";

import { CloudAccountModal } from './CloudAccountModal';
import { DeleteAccountModal } from './DeleteAccountModal';
import { WhatsAppMetaCloudInfo } from './WhatsAppMetaCloudInfo';
import { WhatsAppAnalyticsInfo } from './WhatsAppAnalyticsInfo';

export function GeneralTab({
    workspaceId,
    metaCloudVersion,
    metadata,
    setMetadata
}) {
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

    const [testNumberInput, setTestNumberInput] = useState('');

    // Analytics States (Moved here from page.jsx for modularity)
    const [processingNumber, setProcessingNumber] = useState(null);

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

    const fetchCloudCreds = () => {
        setCloudLoading(true);
        executeGetCreds({ workspaceId });
    };

    useEffect(() => {
        if (workspaceId) {
            fetchCloudCreds();
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

    const { execute: executeUpdateTestNumbers } = useAction(updateTestNumbers, {
        onSuccess: (data) => {
            toast.success('Updated successfully', { id: 'test-numbers' });
            setMetadata(prev => ({ ...prev, testNumbers: data.testNumbers }));
            setProcessingNumber(null);
        },
        onError: (err) => {
            toast.error(err || 'Operation failed', { id: 'test-numbers' });
            setProcessingNumber(null);
        }
    });

    const handleAddTestNumber = () => {
        if (!testNumberInput?.trim()) return;
        const currentNumbers = metadata.testNumbers || [];
        if (currentNumbers.includes(testNumberInput)) {
            toast.error("Number already exists");
            return;
        }
        const updated = [...currentNumbers, testNumberInput];
        toast.loading(`Adding ${testNumberInput}...`, { id: 'test-numbers' });
        executeUpdateTestNumbers({ workspaceId, testNumbers: updated });
        setTestNumberInput('');
    };

    const handleRemoveTestNumber = (num) => {
        const updated = (metadata.testNumbers || []).filter(n => n !== num);
        setProcessingNumber(num);
        toast.loading(`Removing ${num}...`, { id: 'test-numbers' });
        executeUpdateTestNumbers({ workspaceId, testNumbers: updated });
    };

    return (
        <div className="flex-1 outline-none custom-scrollbar overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">


                {/* Main Content (Left) */}
                <div className="md:col-span-8 space-y-6">

                    {/* Developer App Information Card */}
                    <WhatsAppMetaCloudInfo
                        workspaceId={workspaceId}
                        metaCloudVersion={metaCloudVersion}
                    />

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
                                                setTempCreds({ ...cred });
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
                <div className="md:col-span-4 space-y-4">


                    <Card className="border shadow-sm overflow-hidden p-2">
                        <CardHeader className="">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/5 rounded-lg border border-primary/10">
                                    <Smartphone className="w-4 h-4 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <CardTitle className="text-base font-semibold">Test Audience</CardTitle>
                                    <CardDescription className="text-xs font-medium">Internal QA Node & Verification</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-2 flex flex-col gap-2">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40">
                                        <Plus size={14} />
                                    </div>
                                    <Input
                                        placeholder="Add test number (e.g. +91...)"
                                        className="pl-10 bg-muted/5 text-xs border rounded-md"
                                        value={testNumberInput}
                                        onChange={e => setTestNumberInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddTestNumber()}
                                    />
                                </div>
                                <Button size="sm" onClick={handleAddTestNumber} className="px-4 rounded-lg text-xs font-medium">Add</Button>
                            </div>

                            <div className="border rounded-md">
                                {(metadata.testNumbers || []).map((num) => (
                                    <div key={num} className="flex items-center justify-between p-3.5 rounded-lg border border-border/40 bg-card hover:border-primary/20 transition-all group shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-muted/5 flex items-center justify-center border border-border/40 text-muted-foreground/60 group-hover:text-primary transition-colors">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-semibold font-mono tracking-tight">{num}</span>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-[9px] font-bold h-4 bg-green-500/10 text-green-600 border-none px-1.5 uppercase tracking-wider">Verified</Badge>
                                                    <span className="text-[9px] text-muted-foreground/60 font-medium">Active QA Node</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                            onClick={() => handleRemoveTestNumber(num)}
                                            disabled={!!processingNumber}
                                        >
                                            {processingNumber === num ? (
                                                <RefreshCw size={14} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={14} />
                                            )}
                                        </Button>
                                    </div>
                                ))}
                                {(metadata.testNumbers || []).length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 bg-muted/5 border border-dashed border-border/40 rounded-xl">
                                        <div className="p-2.5 bg-muted/10 rounded-full">
                                            <Smartphone className="w-5 h-5 text-muted-foreground/30" />
                                        </div>
                                        <p className="text-[11px] text-muted-foreground font-medium italic">No test numbers defined yet.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

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
