'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Shield,
    Smartphone,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Copy,
    Plus,
    Trash2,
    Pencil,
    Send,
    ExternalLink,
    Key,
    Star,
    Check,
    Zap,
    Globe,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    Info
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    getWhatsAppCloudSettingsAction,
    saveWhatsAppCloudAccountAction,
    setDefaultWhatsAppCloudAction,
    deleteWhatsAppCloudAccountAction,
    testWhatsAppCloudConnectionAction,
    sendTestWhatsAppMessageAction
} from '../_actions/whatsapp-cloud-actions';

export function WhatsAppCloudSettings() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState([]);
    const [workspaceDefault, setWorkspaceDefault] = useState(null);
    const [globalDefault, setGlobalDefault] = useState(null);
    const [webhookVerifyToken, setWebhookVerifyToken] = useState('devlomatix_whatsapp_verify_token');

    // Add / Edit Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [showToken, setShowToken] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);

    const [formData, setFormData] = useState({
        profileName: '',
        phoneNumberId: '',
        wabaId: '',
        accessToken: '',
        apiVersion: 'v22.0',
        setAsDefault: true,
        makeGlobalDefault: true
    });

    // Test Message State
    const [testRecipient, setTestRecipient] = useState('');
    const [testMessage, setTestMessage] = useState('🔔 Hello! This is a live test message from Devlomatix WhatsApp Cloud API integration.');
    const [selectedTestPhoneId, setSelectedTestPhoneId] = useState('');
    const [isSendingTest, setIsSendingTest] = useState(false);

    // Copy to clipboard helper
    const [copiedKey, setCopiedKey] = useState(null);
    const copyToClipboard = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopiedKey(null), 2000);
    };

    // Load Settings
    const loadSettings = useCallback(async () => {
        if (!workspaceId) return;
        setLoading(true);
        try {
            const res = await getWhatsAppCloudSettingsAction(workspaceId);
            if (res.success && res.data) {
                setAccounts(res.data.accounts || []);
                setWorkspaceDefault(res.data.workspaceDefault || null);
                setGlobalDefault(res.data.globalDefault || null);
                if (res.data.webhookVerifyToken) {
                    setWebhookVerifyToken(res.data.webhookVerifyToken);
                }
                if (res.data.accounts?.length > 0 && !selectedTestPhoneId) {
                    const defaultAcc = res.data.accounts.find(a => a.isDefault) || res.data.accounts[0];
                    setSelectedTestPhoneId(defaultAcc.phoneNumberId);
                }
            } else {
                toast.error(res.error || "Failed to load WhatsApp settings");
            }
        } catch (error) {
            console.error("[LOAD_WHATSAPP_SETTINGS]", error);
            toast.error("Error loading WhatsApp Cloud settings");
        } finally {
            setLoading(false);
        }
    }, [workspaceId, selectedTestPhoneId]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    // Open Modal for New Account
    const handleAddNew = () => {
        setEditingAccount(null);
        setFormData({
            profileName: '',
            phoneNumberId: '',
            wabaId: '',
            accessToken: '',
            apiVersion: 'v22.0',
            setAsDefault: accounts.length === 0,
            makeGlobalDefault: true
        });
        setShowToken(false);
        setTestResult(null);
        setIsModalOpen(true);
    };

    // Open Modal for Edit
    const handleEdit = (acc) => {
        setEditingAccount(acc);
        setFormData({
            profileName: acc.profileName || '',
            phoneNumberId: acc.phoneNumberId || '',
            wabaId: acc.wabaId || '',
            accessToken: acc.maskedToken || '',
            apiVersion: acc.apiVersion || 'v22.0',
            setAsDefault: acc.isDefault,
            makeGlobalDefault: true
        });
        setShowToken(false);
        setTestResult(null);
        setIsModalOpen(true);
    };

    // Test Connection in Modal
    const handleTestConnection = async () => {
        if (!formData.phoneNumberId || !formData.accessToken) {
            toast.error("Please enter Phone Number ID and Access Token to test");
            return;
        }

        setIsTesting(true);
        setTestResult(null);
        try {
            const res = await testWhatsAppCloudConnectionAction(workspaceId, {
                phoneNumberId: formData.phoneNumberId,
                accessToken: formData.accessToken,
                wabaId: formData.wabaId,
                apiVersion: formData.apiVersion
            });

            if (res.success) {
                setTestResult(res.data);
                toast.success("Meta API Connection Successful!");
            } else {
                setTestResult({ error: res.error });
                toast.error(res.error || "Connection failed");
            }
        } catch (error) {
            setTestResult({ error: error.message });
            toast.error("Test connection failed");
        } finally {
            setIsTesting(false);
        }
    };

    // Save Account
    const handleSaveAccount = async (e) => {
        e.preventDefault();
        if (!formData.phoneNumberId || !formData.wabaId) {
            toast.error("Phone Number ID and WABA ID are required");
            return;
        }

        if (!editingAccount && !formData.accessToken) {
            toast.error("Access Token is required");
            return;
        }

        setIsSaving(true);
        try {
            const res = await saveWhatsAppCloudAccountAction(workspaceId, {
                id: editingAccount?.id || 'new',
                ...formData
            });

            if (res.success) {
                toast.success(editingAccount ? "Account updated successfully" : "WhatsApp Cloud account added successfully");
                setIsModalOpen(false);
                loadSettings();
            } else {
                toast.error(res.error || "Failed to save account");
            }
        } catch (error) {
            console.error("[SAVE_WHATSAPP_ACCOUNT]", error);
            toast.error("Failed to save WhatsApp account");
        } finally {
            setIsSaving(false);
        }
    };

    // Set as Default
    const handleSetDefault = async (credentialId) => {
        const toastId = toast.loading("Updating default production account...");
        try {
            const res = await setDefaultWhatsAppCloudAction(workspaceId, credentialId, true);
            if (res.success) {
                toast.success("Default WhatsApp account updated globally", { id: toastId });
                loadSettings();
            } else {
                toast.error(res.error || "Failed to set default", { id: toastId });
            }
        } catch (error) {
            toast.error("Failed to set default account", { id: toastId });
        }
    };

    // Delete Account
    const handleDeleteAccount = async (credentialId, name) => {
        if (!confirm(`Are you sure you want to remove "${name}"?`)) return;

        const toastId = toast.loading("Deleting account...");
        try {
            const res = await deleteWhatsAppCloudAccountAction(workspaceId, credentialId);
            if (res.success) {
                toast.success("Account removed", { id: toastId });
                loadSettings();
            } else {
                toast.error(res.error || "Failed to delete", { id: toastId });
            }
        } catch (error) {
            toast.error("Failed to delete account", { id: toastId });
        }
    };

    // Send Live Test Message
    const handleSendTestMessage = async () => {
        if (!testRecipient || testRecipient.replace(/[^\d]/g, '').length < 10) {
            toast.error("Please enter a valid 10+ digit recipient phone number with country code (e.g. 919876543210)");
            return;
        }

        const selectedAcc = accounts.find(a => a.phoneNumberId === selectedTestPhoneId) || accounts.find(a => a.isDefault) || accounts[0];
        if (!selectedAcc) {
            toast.error("No WhatsApp Cloud account found to send from");
            return;
        }

        setIsSendingTest(true);
        const toastId = toast.loading("Sending test WhatsApp message...");
        try {
            // Fetch decrypted token or use action
            const res = await sendTestWhatsAppMessageAction(workspaceId, {
                phoneNumberId: selectedAcc.phoneNumberId,
                accessToken: formData.accessToken || '', // Action can resolve if empty
                recipientPhone: testRecipient,
                message: testMessage,
                apiVersion: selectedAcc.apiVersion || 'v22.0'
            });

            if (res.success) {
                toast.success(`Message sent successfully! (ID: ${res.data?.messageId || 'OK'})`, { id: toastId });
            } else {
                toast.error(res.error || "Failed to deliver message", { id: toastId });
            }
        } catch (error) {
            toast.error("Test send error: " + error.message, { id: toastId });
        } finally {
            setIsSendingTest(false);
        }
    };

    const webhookUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/api/webhook/whatsapp`
        : 'https://yourdomain.com/api/webhook/whatsapp';

    const activeDefaultAcc = accounts.find(a => a.isDefault) || accounts[0];

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-500 shadow-sm">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-foreground">WhatsApp Cloud API (Meta)</h2>
                            <Badge className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5">
                                Official Meta API
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Manage workspace and global WhatsApp sender credentials for Hireflow, Campaigns, and Notifications.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadSettings}
                        disabled={loading}
                        className="h-8 text-xs font-bold border-border/60"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleAddNew}
                        className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Add Cloud Account
                    </Button>
                </div>
            </div>

            {/* Global Safeguard Alert */}
            <div className="p-3.5 rounded-lg bg-card/60 border border-primary/20 backdrop-blur-xl flex items-start gap-3 shadow-xs">
                <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed space-y-1">
                    <span className="font-bold text-foreground">Global Production Sender Safeguard</span>
                    <p className="text-muted-foreground text-[11px]">
                        Setting the default account here establishes the permanent production sender for <strong>Hireflow ATS</strong>, <strong>Transactional Alerts</strong>, and <strong>Automations</strong>. Switching accounts in individual KonnectX chat windows will not override this production credential.
                    </p>
                </div>
            </div>

            {/* Active Production Default Banner */}
            {activeDefaultAcc && (
                <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-xs overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                <CardTitle className="text-xs font-bold text-foreground">Active Production Default</CardTitle>
                            </div>
                            <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                                SYSTEM PRODUCTION SENDER
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div className="p-2.5 rounded-md bg-card/80 border border-border/50">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-0.5">Profile Name</span>
                                <span className="font-semibold text-foreground">{activeDefaultAcc.profileName}</span>
                            </div>
                            <div className="p-2.5 rounded-md bg-card/80 border border-border/50">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-0.5">Phone Number ID</span>
                                <span className="font-mono text-foreground">{activeDefaultAcc.phoneNumberId}</span>
                            </div>
                            <div className="p-2.5 rounded-md bg-card/80 border border-border/50">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-0.5">WABA ID</span>
                                <span className="font-mono text-foreground">{activeDefaultAcc.wabaId}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Configured Accounts List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Configured Meta Cloud Accounts ({accounts.length})
                    </h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center bg-card/40 rounded-xl border border-border/40">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2" />
                        <p className="text-xs text-muted-foreground">Loading WhatsApp credentials...</p>
                    </div>
                ) : accounts.length === 0 ? (
                    <Card className="border-dashed border-border/60 bg-card/20 p-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-3">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-foreground">No WhatsApp Cloud Accounts Configured</h4>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                            Connect your Meta WhatsApp Business Cloud API account to enable 2-way candidate chat, candidate updates, and transactional notifications.
                        </p>
                        <Button
                            onClick={handleAddNew}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                        >
                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                            Add Your First Account
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {accounts.map((acc) => (
                            <Card
                                key={acc.id}
                                className={`border transition-all ${
                                    acc.isDefault
                                        ? 'border-emerald-500/40 bg-emerald-500/[0.02] shadow-sm'
                                        : 'border-border/60 bg-card/40 hover:border-border'
                                }`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1.5 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="text-sm font-bold text-foreground">{acc.profileName}</h4>
                                                {acc.isDefault && (
                                                    <Badge className="bg-emerald-500 text-white text-[9px] font-bold gap-1 py-0 px-2">
                                                        <Star className="w-2.5 h-2.5 fill-current" /> Default Sender
                                                    </Badge>
                                                )}
                                                <Badge variant="outline" className="text-[9px] font-mono border-border/60">
                                                    {acc.apiVersion || 'v22.0'}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-semibold text-foreground/70">Phone ID:</span>
                                                    <code className="bg-secondary/50 px-1.5 py-0.5 rounded text-[11px] font-mono text-foreground">
                                                        {acc.phoneNumberId}
                                                    </code>
                                                    <button
                                                        onClick={() => copyToClipboard(acc.phoneNumberId, `phone-${acc.id}`)}
                                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {copiedKey === `phone-${acc.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-semibold text-foreground/70">WABA ID:</span>
                                                    <code className="bg-secondary/50 px-1.5 py-0.5 rounded text-[11px] font-mono text-foreground">
                                                        {acc.wabaId}
                                                    </code>
                                                    <button
                                                        onClick={() => copyToClipboard(acc.wabaId, `waba-${acc.id}`)}
                                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {copiedKey === `waba-${acc.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {!acc.isDefault && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleSetDefault(acc.id)}
                                                    className="h-8 text-xs font-bold text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                                                >
                                                    <Star className="w-3 h-3 mr-1" />
                                                    Set Default
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(acc)}
                                                className="h-8 text-xs font-bold border-border/60"
                                            >
                                                <Pencil className="w-3 h-3 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteAccount(acc.id, acc.profileName)}
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Live Message Tester & Webhook Helper Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Live Message Ping Tester */}
                <Card className="border-border/60 bg-card/40 backdrop-blur-xl">
                    <CardHeader className="p-4 pb-2">
                        <div className="flex items-center gap-2">
                            <Send className="w-4 h-4 text-emerald-500" />
                            <CardTitle className="text-xs font-bold text-foreground">Live Delivery Diagnostic</CardTitle>
                        </div>
                        <CardDescription className="text-[11px]">
                            Send an immediate test WhatsApp message to verify API token authentication and delivery.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-muted-foreground uppercase">Recipient Phone Number</Label>
                            <Input
                                placeholder="e.g. 919876543210 (Country code + Number)"
                                value={testRecipient}
                                onChange={(e) => setTestRecipient(e.target.value)}
                                className="h-9 text-xs font-mono"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-muted-foreground uppercase">Test Message Body</Label>
                            <Textarea
                                value={testMessage}
                                onChange={(e) => setTestMessage(e.target.value)}
                                rows={2}
                                className="text-xs font-medium resize-none"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-end">
                        <Button
                            size="sm"
                            onClick={handleSendTestMessage}
                            disabled={isSendingTest || accounts.length === 0}
                            className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {isSendingTest ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <Send className="w-3 h-3 mr-1.5" />}
                            Send Test Ping
                        </Button>
                    </CardFooter>
                </Card>

                {/* Webhook Configuration Card */}
                <Card className="border-border/60 bg-card/40 backdrop-blur-xl">
                    <CardHeader className="p-4 pb-2">
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-primary" />
                            <CardTitle className="text-xs font-bold text-foreground">Meta Webhook Configuration</CardTitle>
                        </div>
                        <CardDescription className="text-[11px]">
                            Copy these endpoints into your Meta App Dashboard under WhatsApp &gt; Configuration.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-muted-foreground uppercase">Callback URL</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={webhookUrl}
                                    readOnly
                                    className="h-9 text-xs font-mono bg-secondary/30"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => copyToClipboard(webhookUrl, 'webhook-url')}
                                    className="h-9 w-9 shrink-0"
                                >
                                    {copiedKey === 'webhook-url' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-muted-foreground uppercase">Verify Token</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={webhookVerifyToken}
                                    readOnly
                                    className="h-9 text-xs font-mono bg-secondary/30"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => copyToClipboard(webhookVerifyToken, 'verify-token')}
                                    className="h-9 w-9 shrink-0"
                                >
                                    {copiedKey === 'verify-token' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add / Edit Account Dialog Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[560px] bg-card border-border/80 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-emerald-500" />
                            {editingAccount ? 'Edit WhatsApp Cloud Account' : 'Add WhatsApp Cloud API Account'}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Enter credentials from your Meta Business Manager and Meta Developer App.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveAccount} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Connection Profile Name</Label>
                            <Input
                                placeholder="e.g. Official Production WhatsApp"
                                value={formData.profileName}
                                onChange={(e) => setFormData(prev => ({ ...prev, profileName: e.target.value }))}
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold">Phone Number ID *</Label>
                                <Input
                                    placeholder="e.g. 1092837465..."
                                    value={formData.phoneNumberId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                                    className="h-9 text-xs font-mono"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold">WABA ID *</Label>
                                <Input
                                    placeholder="e.g. 1928374650..."
                                    value={formData.wabaId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, wabaId: e.target.value }))}
                                    className="h-9 text-xs font-mono"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold">Permanent System User Access Token *</Label>
                                <button
                                    type="button"
                                    onClick={() => setShowToken(!showToken)}
                                    className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                                >
                                    {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    {showToken ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            <Input
                                type={showToken ? 'text' : 'password'}
                                placeholder={editingAccount ? 'Leave blank to keep existing token' : 'EAAG...'}
                                value={formData.accessToken}
                                onChange={(e) => setFormData(prev => ({ ...prev, accessToken: e.target.value }))}
                                className="h-9 text-xs font-mono"
                                required={!editingAccount}
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Generated from Meta Business Manager &gt; Users &gt; System Users with <code className="text-emerald-500">whatsapp_business_messaging</code> permissions.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold">Graph API Version</Label>
                                <Select
                                    value={formData.apiVersion}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, apiVersion: val }))}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Select API version" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="v22.0">v22.0 (Latest)</SelectItem>
                                        <SelectItem value="v21.0">v21.0</SelectItem>
                                        <SelectItem value="v20.0">v20.0</SelectItem>
                                        <SelectItem value="v19.0">v19.0</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border/40 mt-5">
                                <Label className="text-xs font-bold cursor-pointer" htmlFor="set-default-toggle">
                                    Set as Default
                                </Label>
                                <Switch
                                    id="set-default-toggle"
                                    checked={formData.setAsDefault}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, setAsDefault: checked }))}
                                />
                            </div>
                        </div>

                        {/* Test Connection Button & Live Feedback */}
                        <div className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleTestConnection}
                                disabled={isTesting}
                                className="w-full h-8 text-xs font-bold border-border/80"
                            >
                                {isTesting ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <Zap className="w-3 h-3 mr-1.5 text-amber-500" />}
                                Test Meta API Connection
                            </Button>

                            {testResult && (
                                <div className={`mt-2 p-2.5 rounded-lg text-xs border ${
                                    testResult.error
                                        ? 'bg-destructive/10 border-destructive/30 text-destructive'
                                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                }`}>
                                    {testResult.error ? (
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span>{testResult.error}</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 font-bold">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>Verified: {testResult.verifiedName}</span>
                                            </div>
                                            <div className="text-[11px] opacity-80 flex gap-3">
                                                <span>Number: {testResult.displayPhoneNumber}</span>
                                                <span>Quality: {testResult.qualityRating}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="pt-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsModalOpen(false)}
                                className="h-9 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : null}
                                Save Account
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
