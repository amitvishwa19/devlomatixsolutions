'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    MessageSquare,
    Mail,
    Globe,
    GitMerge,
    Calendar,
    Save,
    Send,
    CheckCircle2,
    AlertCircle,
    Copy,
    ExternalLink,
    Smartphone,
    Shield,
    Sparkles,
    Check,
    Loader2,
    RefreshCw,
    Sliders,
    Users,
    Briefcase,
    Bell,
    Layers,
    Clock,
    ChevronRight,
    ArrowRight,
    Star,
    Plus,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    Lock,
    Key,
    Zap,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import Link from 'next/link';

import {
    getHireflowSettingsAction,
    saveHireflowSettingsAction,
    updateHireflowWhatsAppAction,
    testHireflowWhatsAppAction
} from './_actions/hireflow-settings-actions';

import {
    saveWhatsAppCloudAccountAction,
    deleteWhatsAppCloudAccountAction,
    testWhatsAppCloudConnectionAction
} from '@/app/workspace/[workspaceId]/system/_actions/whatsapp-cloud-actions';

export default function HireflowSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params?.workspaceId;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [workspaceInfo, setWorkspaceInfo] = useState(null);
    const [globalDefault, setGlobalDefault] = useState(null);

    // Add / Edit Account Modal State
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [showToken, setShowToken] = useState(false);
    const [isSavingAccount, setIsSavingAccount] = useState(false);
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [connectionTestResult, setConnectionTestResult] = useState(null);

    const [accountFormData, setAccountFormData] = useState({
        profileName: '',
        phoneNumberId: '',
        wabaId: '',
        accessToken: '',
        apiVersion: 'v22.0',
        setAsDefault: true,
        makeGlobalDefault: true
    });

    // Settings Form State
    const [settings, setSettings] = useState({
        whatsapp: {
            enabled: true,
            credentialId: '',
            templateName: 'new_job_application',
            autoSendOnApplication: true,
            autoSendOnInterview: true,
            autoSendOnOffer: false,
        },
        email: {
            enabled: true,
            senderName: 'Devlomatix Careers',
            senderEmail: 'careers@devlomatix.com',
            adminNotificationEmail: 'careers@devlomatix.com',
            candidateConfirmation: true,
            adminAlert: true,
        },
        careerPortal: {
            companyName: 'Devlomatix',
            portalTitle: 'Careers at Devlomatix',
            portalSubtitle: 'Join our high-performing team and build the future with us.',
            publicApplyUrl: '/career',
            allowPublicApply: true,
            requireResume: true,
            autoPublishJobs: true,
        },
        pipeline: {
            defaultStage: 'APPLIED',
            autoAdvanceOnInterview: true,
            scoringScale: '100',
            stages: [
                { id: 'APPLIED', label: 'Applied', color: 'blue' },
                { id: 'SCREENING', label: 'Screening', color: 'purple' },
                { id: 'INTERVIEW', label: 'Interview', color: 'amber' },
                { id: 'OFFER', label: 'Offer Sent', color: 'emerald' },
                { id: 'HIRED', label: 'Hired', color: 'green' },
                { id: 'REJECTED', label: 'Rejected', color: 'rose' },
            ]
        },
        interview: {
            defaultDuration: 45,
            defaultPlatform: 'Google Meet',
            timezone: 'Asia/Kolkata',
            reminderHoursBefore: 24,
        }
    });

    // Test WhatsApp State
    const [testPhone, setTestPhone] = useState('');
    const [isTestingWhatsApp, setIsTestingWhatsApp] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [copiedKey, setCopiedKey] = useState(null);

    const copyToClipboard = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopiedKey(null), 2000);
    };

    // Load initial settings
    const loadSettings = useCallback(async () => {
        if (!workspaceId) return;
        setLoading(true);
        try {
            const res = await getHireflowSettingsAction(workspaceId);
            if (res.success && res.data) {
                setSettings(res.data.settings);
                setAccounts(res.data.accounts || []);
                setTemplates(res.data.templates || []);
                setWorkspaceInfo(res.data.workspace || null);
                setGlobalDefault(res.data.globalDefault || null);
            } else {
                toast.error(res.error || "Failed to load settings");
            }
        } catch (err) {
            toast.error("Error loading settings: " + err.message);
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    // Handle Save HireFlow Settings (All sections)
    const handleSave = async (makeGlobal = false) => {
        setSaving(true);
        try {
            const res = await saveHireflowSettingsAction(workspaceId, settings, makeGlobal);
            if (res.success) {
                toast.success(res.message || "HireFlow settings saved successfully to AppSettings");
            } else {
                toast.error(res.error || "Failed to save settings");
            }
        } catch (err) {
            toast.error("Error saving settings: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Open Add Account Modal
    const handleAddNewAccount = () => {
        setEditingAccount(null);
        setAccountFormData({
            profileName: '',
            phoneNumberId: '',
            wabaId: '',
            accessToken: '',
            apiVersion: 'v22.0',
            setAsDefault: accounts.length === 0,
            makeGlobalDefault: true
        });
        setShowToken(false);
        setConnectionTestResult(null);
        setIsAccountModalOpen(true);
    };

    // Open Edit Account Modal
    const handleEditAccount = (acc) => {
        setEditingAccount(acc);
        setAccountFormData({
            profileName: acc.profileName || '',
            phoneNumberId: acc.phoneNumberId || '',
            wabaId: acc.wabaId || '',
            accessToken: '',
            apiVersion: acc.apiVersion || 'v22.0',
            setAsDefault: acc.isDefault,
            makeGlobalDefault: true
        });
        setShowToken(false);
        setConnectionTestResult(null);
        setIsAccountModalOpen(true);
    };

    // Test Connection in Modal
    const handleTestConnection = async () => {
        if (!accountFormData.phoneNumberId || !accountFormData.accessToken) {
            toast.error("Please enter Phone Number ID and Permanent Access Token to test");
            return;
        }

        setIsTestingConnection(true);
        setConnectionTestResult(null);
        try {
            const res = await testWhatsAppCloudConnectionAction(workspaceId, {
                phoneNumberId: accountFormData.phoneNumberId,
                accessToken: accountFormData.accessToken,
                wabaId: accountFormData.wabaId,
                apiVersion: accountFormData.apiVersion
            });

            if (res.success) {
                setConnectionTestResult(res.data);
                toast.success("Meta API Connection Verified!");
            } else {
                setConnectionTestResult({ error: res.error });
                toast.error(res.error || "Connection failed");
            }
        } catch (error) {
            setConnectionTestResult({ error: error.message });
            toast.error("Test connection failed");
        } finally {
            setIsTestingConnection(false);
        }
    };

    // Save WhatsApp Account
    const handleSaveAccount = async (e) => {
        e.preventDefault();
        if (!accountFormData.phoneNumberId || !accountFormData.wabaId) {
            toast.error("Phone Number ID and WABA ID are required");
            return;
        }

        if (!editingAccount && !accountFormData.accessToken) {
            toast.error("Permanent Access Token is required");
            return;
        }

        setIsSavingAccount(true);
        try {
            const res = await saveWhatsAppCloudAccountAction(workspaceId, {
                id: editingAccount?.id || 'new',
                ...accountFormData
            });

            if (res.success) {
                toast.success(editingAccount ? "WhatsApp account updated" : "WhatsApp Cloud account connected successfully");
                setIsAccountModalOpen(false);

                // Auto-sync into AppSettings (key: hireflow)
                if (res.data?.id) {
                    await updateHireflowWhatsAppAction(workspaceId, {
                        credentialId: res.data.id,
                        templateName: settings.whatsapp.templateName,
                        setAsGlobalDefault: accountFormData.setAsDefault
                    });
                }

                loadSettings();
            } else {
                toast.error(res.error || "Failed to save WhatsApp account");
            }
        } catch (error) {
            console.error("[SAVE_WHATSAPP_ACCOUNT]", error);
            toast.error("Failed to save WhatsApp account");
        } finally {
            setIsSavingAccount(false);
        }
    };

    // Select Account for HireFlow (Instantly saved to AppSettings key: 'hireflow')
    const handleSelectAccount = async (acc) => {
        const toastId = toast.loading(`Setting "${acc.profileName}" for HireFlow...`);
        try {
            const res = await updateHireflowWhatsAppAction(workspaceId, {
                credentialId: acc.id,
                templateName: settings.whatsapp.templateName,
                setAsGlobalDefault: false
            });
            if (res.success) {
                toast.success(`HireFlow sender updated to "${acc.profileName}" & saved in AppSettings`, { id: toastId });
                setSettings(prev => ({
                    ...prev,
                    whatsapp: { ...prev.whatsapp, credentialId: acc.id }
                }));
                loadSettings();
            } else {
                toast.error(res.error || "Failed to update account", { id: toastId });
            }
        } catch (err) {
            toast.error("Error selecting account: " + err.message, { id: toastId });
        }
    };

    // Set Default WhatsApp Account Globally & in AppSettings
    const handleSetDefaultAccount = async (credentialId, profileName) => {
        const toastId = toast.loading(`Setting "${profileName || 'Account'}" as Global Default...`);
        try {
            const res = await updateHireflowWhatsAppAction(workspaceId, {
                credentialId,
                templateName: settings.whatsapp.templateName,
                setAsGlobalDefault: true
            });
            if (res.success) {
                toast.success(`Default production account updated globally and saved in AppSettings (key: hireflow)`, { id: toastId });
                setSettings(prev => ({
                    ...prev,
                    whatsapp: { ...prev.whatsapp, credentialId }
                }));
                loadSettings();
            } else {
                toast.error(res.error || "Failed to set default", { id: toastId });
            }
        } catch (error) {
            toast.error("Error setting default: " + error.message, { id: toastId });
        }
    };

    // Handle Template Change (Instantly saved to AppSettings key: 'hireflow')
    const handleTemplateChange = async (newTemplate) => {
        setSettings(prev => ({
            ...prev,
            whatsapp: { ...prev.whatsapp, templateName: newTemplate }
        }));
        const toastId = toast.loading(`Saving template "${newTemplate}" to AppSettings...`);
        try {
            const targetCredId = settings.whatsapp.credentialId || (accounts.find(a => a.isDefault)?.id || accounts[0]?.id);
            const res = await updateHireflowWhatsAppAction(workspaceId, {
                credentialId: targetCredId,
                templateName: newTemplate,
                setAsGlobalDefault: false
            });
            if (res.success) {
                toast.success(`Template "${newTemplate}" saved to AppSettings (key: hireflow)`, { id: toastId });
                loadSettings();
            } else {
                toast.error(res.error || "Failed to save template", { id: toastId });
            }
        } catch (err) {
            toast.error("Error saving template: " + err.message, { id: toastId });
        }
    };

    // Delete WhatsApp Account
    const handleDeleteAccount = async (credentialId, name) => {
        if (!confirm(`Are you sure you want to remove account "${name}"?`)) return;
        const toastId = toast.loading("Removing account...");
        try {
            const res = await deleteWhatsAppCloudAccountAction(workspaceId, credentialId);
            if (res.success) {
                toast.success("Account removed", { id: toastId });
                loadSettings();
            } else {
                toast.error(res.error || "Failed to delete account", { id: toastId });
            }
        } catch (error) {
            toast.error("Error deleting account: " + error.message, { id: toastId });
        }
    };

    // Handle Test WhatsApp Send
    const handleTestWhatsApp = async () => {
        if (!testPhone || String(testPhone).trim() === '') {
            toast.error("Please enter a phone number to test");
            return;
        }

        setIsTestingWhatsApp(true);
        setTestResult(null);
        try {
            const res = await testHireflowWhatsAppAction(
                workspaceId,
                testPhone,
                'Candidate Name',
                'Software Engineer'
            );

            if (res.success) {
                setTestResult({ success: true, message: "Test WhatsApp message dispatched successfully!" });
                toast.success("Test WhatsApp message sent!");
            } else {
                setTestResult({
                    success: false,
                    message: res.error || "Failed to send message. Please verify recipient number and Meta permissions."
                });
                toast.error(res.error || "Failed to send test message");
            }
        } catch (err) {
            setTestResult({ success: false, message: err.message });
            toast.error("Test dispatch error: " + err.message);
        } finally {
            setIsTestingWhatsApp(false);
        }
    };

    const activeDefaultAcc = accounts.find(a => a.id === settings.whatsapp.credentialId) || accounts.find(a => a.isDefault) || accounts[0];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs font-medium text-muted-foreground">Loading HireFlow Settings...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground opacity-60">
                        <Link href={`/workspace/${workspaceId}/hireflow`} className="hover:text-primary transition-colors">
                            HireFlow
                        </Link>
                        <ChevronRight size={12} />
                        <span className="text-primary font-medium">Settings</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                            <Settings className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight">HireFlow ATS Settings</h1>
                                <Badge className="bg-primary/20 text-primary border border-primary/30 text-[9px] font-bold">
                                    AppSettings: hireflow
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Manage WhatsApp Cloud API sender accounts, candidate notifications, career portal branding, and pipelines.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadSettings()}
                        disabled={loading || saving}
                        className="rounded-lg h-9 border-border/40"
                    >
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                        Refresh
                    </Button>
                    <Button
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        className="rounded-lg h-9 font-semibold bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-3.5 h-3.5 mr-1.5" />
                                Save All Settings
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="whatsapp" className="space-y-6">
                <TabsList className="bg-muted/40 p-1 rounded-xl border border-border/40 inline-flex flex-wrap gap-1">
                    <TabsTrigger value="whatsapp" className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5" />
                        WhatsApp Cloud API & Sender
                    </TabsTrigger>
                    <TabsTrigger value="automations" className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5" />
                        Automations & Email
                    </TabsTrigger>
                    <TabsTrigger value="portal" className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5" />
                        Career Portal
                    </TabsTrigger>
                    <TabsTrigger value="pipeline" className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
                        <GitMerge className="w-3.5 h-3.5" />
                        Pipeline & Stages
                    </TabsTrigger>
                    <TabsTrigger value="interview" className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Interview Preferences
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: WhatsApp Cloud API & Account Selection */}
                <TabsContent value="whatsapp" className="space-y-6 animate-in fade-in duration-300">
                    {/* Active Production Default Banner */}
                    {activeDefaultAcc && (
                        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                            <div className="flex items-center gap-3.5">
                                <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-500">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-foreground">Active HireFlow Sender: {activeDefaultAcc.profileName}</h3>
                                        <Badge className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5">
                                            HIREFLOW SENDER
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Candidate application confirmations and automated interview updates are dispatched through this WhatsApp account.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-mono">
                                <span className="text-muted-foreground text-[10px] uppercase font-bold">Phone ID:</span>
                                <code className="bg-background/80 px-2 py-1 rounded-md border border-border/40 font-bold">{activeDefaultAcc.phoneNumberId}</code>
                            </div>
                        </div>
                    )}

                    {/* Meta Cloud Accounts List & Selector */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Smartphone className="w-4 h-4 text-emerald-500" />
                                    Configured WhatsApp Cloud Accounts ({accounts.length})
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Selecting an account or setting default instantly syncs with <span className="font-semibold text-foreground font-mono text-[11px]">AppSettings (key: hireflow)</span>.
                                </p>
                            </div>

                            <Button
                                onClick={handleAddNewAccount}
                                className="h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            >
                                <Plus className="w-3.5 h-3.5 mr-1.5" />
                                Add Cloud Account
                            </Button>
                        </div>

                        {accounts.length === 0 ? (
                            <Card className="border-dashed border-border/60 bg-card/20 p-8 text-center rounded-xl">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-3">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <h4 className="text-sm font-bold text-foreground">No WhatsApp Cloud Accounts Connected</h4>
                                <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                                    Connect your Meta WhatsApp Cloud API credentials to enable instant candidate application confirmations and alerts.
                                </p>
                                <Button
                                    onClick={handleAddNewAccount}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                                    Connect WhatsApp Cloud Account
                                </Button>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-3.5">
                                {accounts.map((acc) => {
                                    const isSelected = (settings.whatsapp.credentialId === acc.id) || (!settings.whatsapp.credentialId && acc.isDefault);
                                    return (
                                        <Card
                                            key={acc.id}
                                            className={`border transition-all rounded-xl ${
                                                isSelected
                                                    ? 'border-emerald-500/50 bg-emerald-500/[0.03] shadow-md shadow-emerald-500/5'
                                                    : 'border-border/60 bg-card/40 hover:border-border/80'
                                            }`}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="space-y-2 min-w-0">
                                                        <div className="flex items-center gap-2.5 flex-wrap">
                                                            <h4 className="text-sm font-bold text-foreground">{acc.profileName}</h4>
                                                            {isSelected && (
                                                                <Badge className="bg-emerald-500 text-white text-[9px] font-bold gap-1 py-0 px-2">
                                                                    <Check className="w-2.5 h-2.5" /> Selected for HireFlow
                                                                </Badge>
                                                            )}
                                                            {acc.isDefault && !isSelected && (
                                                                <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30 text-[9px] font-bold gap-1">
                                                                    <Star className="w-2.5 h-2.5 fill-current" /> Global Default
                                                                </Badge>
                                                            )}
                                                            <Badge variant="outline" className="text-[9px] font-mono border-border/60">
                                                                {acc.apiVersion || 'v22.0'}
                                                            </Badge>
                                                        </div>

                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-semibold text-foreground/70">Phone ID:</span>
                                                                <code className="bg-muted/50 px-1.5 py-0.5 rounded text-[11px] font-mono text-foreground">
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
                                                                <code className="bg-muted/50 px-1.5 py-0.5 rounded text-[11px] font-mono text-foreground">
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
                                                        {!isSelected ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleSelectAccount(acc)}
                                                                className="h-8 text-xs font-semibold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                                                            >
                                                                <Check className="w-3 h-3 mr-1" />
                                                                Select Account
                                                            </Button>
                                                        ) : (
                                                            !acc.isDefault && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleSetDefaultAccount(acc.id, acc.profileName)}
                                                                    className="h-8 text-xs font-semibold text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                                                                >
                                                                    <Star className="w-3 h-3 mr-1" />
                                                                    Set Global Default
                                                                </Button>
                                                            )
                                                        )}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEditAccount(acc)}
                                                            className="h-8 text-xs font-semibold border-border/60"
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
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Template Mapping & Live Diagnostic Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Template Selection */}
                        <Card className="border border-border/40 shadow-sm bg-card/60 backdrop-blur-xl rounded-xl">
                            <CardHeader className="p-4 pb-3">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-primary" />
                                    Candidate Application Template Mapping
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Changing the template auto-saves directly to <span className="font-semibold text-foreground font-mono text-[11px]">AppSettings (key: hireflow)</span>.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-1 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Message Template</Label>
                                    <Select
                                        value={settings.whatsapp.templateName || 'new_job_application'}
                                        onValueChange={handleTemplateChange}
                                    >
                                        <SelectTrigger className="bg-muted/30 border border-border/40 h-10 rounded-lg text-xs font-medium">
                                            <SelectValue placeholder="Select Template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new_job_application">
                                                <span className="font-semibold">new_job_application</span> (Approved - 1 Parameter: Candidate Name)
                                            </SelectItem>
                                            <SelectItem value="job_application">
                                                <span className="font-semibold">job_application</span> (Approved - Portal Link Button)
                                            </SelectItem>
                                            {templates.filter(t => t.name !== 'new_job_application' && t.name !== 'job_application').map(t => (
                                                <SelectItem key={t.id} value={t.name}>
                                                    <span className="font-semibold">{t.name}</span> ({t.category} - {t.language})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/30 text-xs space-y-1.5">
                                    <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Template Preview</span>
                                    <p className="text-muted-foreground leading-relaxed text-[11px] italic">
                                        "Dear &#123;&#123;1&#125;&#125;, Thank you for applying to Devlomatix. We have received your application successfully and appreciate your interest in joining our team..."
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Test WhatsApp Dispatcher */}
                        <Card className="border border-primary/20 shadow-md bg-primary/5 rounded-xl">
                            <CardHeader className="p-4 pb-3">
                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                                    <Send className="w-4 h-4" />
                                    Test Live WhatsApp Notification
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Send a live application confirmation to verify Meta token authentication.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-1 space-y-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Recipient Mobile Number</Label>
                                    <Input
                                        value={testPhone}
                                        onChange={(e) => setTestPhone(e.target.value)}
                                        placeholder="e.g. +91 97123 40450 or 9712340450"
                                        className="bg-background border border-border/50 h-10 rounded-lg text-xs font-mono"
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        Include country code or standard 10-digit mobile number.
                                    </p>
                                </div>

                                {testResult && (
                                    <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${testResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
                                        {testResult.success ? (
                                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        )}
                                        <span className="leading-tight">{testResult.message}</span>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                <Button
                                    onClick={handleTestWhatsApp}
                                    disabled={isTestingWhatsApp || !testPhone || accounts.length === 0}
                                    className="w-full h-9 rounded-lg font-semibold bg-primary hover:bg-primary/90 text-xs shadow-sm"
                                >
                                    {isTestingWhatsApp ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                            Dispatching...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-3.5 h-3.5 mr-2" />
                                            Send Test Message
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tab 2: Automations & Email */}
                <TabsContent value="automations" className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Notification Triggers */}
                        <Card className="border border-border/40 shadow-sm bg-card/60 backdrop-blur-xl rounded-xl">
                            <CardHeader className="p-4 pb-3">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-primary" />
                                    Automated Notification Triggers
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Toggle candidate notifications and alerts during the recruitment workflow.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-1 space-y-3.5">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-semibold">Instant Application Confirmation (WhatsApp)</p>
                                        <p className="text-[11px] text-muted-foreground">Sends acknowledgment template immediately upon candidate form submission.</p>
                                    </div>
                                    <Switch
                                        checked={settings.whatsapp.autoSendOnApplication}
                                        onCheckedChange={(val) => setSettings({
                                            ...settings,
                                            whatsapp: { ...settings.whatsapp, autoSendOnApplication: val }
                                        })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-semibold">Interview Schedule Alerts (WhatsApp)</p>
                                        <p className="text-[11px] text-muted-foreground">Sends meeting details and reminder when candidate is moved to interview stage.</p>
                                    </div>
                                    <Switch
                                        checked={settings.whatsapp.autoSendOnInterview}
                                        onCheckedChange={(val) => setSettings({
                                            ...settings,
                                            whatsapp: { ...settings.whatsapp, autoSendOnInterview: val }
                                        })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-semibold">Candidate Confirmation Email</p>
                                        <p className="text-[11px] text-muted-foreground">Sends branded HTML confirmation email via Resend to candidate.</p>
                                    </div>
                                    <Switch
                                        checked={settings.email.candidateConfirmation}
                                        onCheckedChange={(val) => setSettings({
                                            ...settings,
                                            email: { ...settings.email, candidateConfirmation: val }
                                        })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-semibold">Hiring Team Alert Email</p>
                                        <p className="text-[11px] text-muted-foreground">Sends applicant profile & resume link to internal hiring coordinators.</p>
                                    </div>
                                    <Switch
                                        checked={settings.email.adminAlert}
                                        onCheckedChange={(val) => setSettings({
                                            ...settings,
                                            email: { ...settings.email, adminAlert: val }
                                        })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Email Routing & Identity */}
                        <Card className="border border-border/40 shadow-sm bg-card/60 backdrop-blur-xl rounded-xl">
                            <CardHeader className="p-4 pb-3">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-500" />
                                    Email Routing & Branding
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Configure sender identity and notification email recipients.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-1 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Sender Display Name</Label>
                                    <Input
                                        value={settings.email.senderName}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            email: { ...settings.email, senderName: e.target.value }
                                        })}
                                        placeholder="Devlomatix Careers"
                                        className="bg-muted/30 border border-border/40 h-10 rounded-lg text-xs"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Sender Email Address</Label>
                                    <Input
                                        value={settings.email.senderEmail}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            email: { ...settings.email, senderEmail: e.target.value }
                                        })}
                                        placeholder="careers@devlomatix.com"
                                        className="bg-muted/30 border border-border/40 h-10 rounded-lg text-xs font-mono"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Hiring Team Notification Email</Label>
                                    <Input
                                        value={settings.email.adminNotificationEmail}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            email: { ...settings.email, adminNotificationEmail: e.target.value }
                                        })}
                                        placeholder="careers@devlomatix.com"
                                        className="bg-muted/30 border border-border/40 h-10 rounded-lg text-xs font-mono"
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        Applicant details and resume links will be delivered here immediately.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tab 3: Career Portal */}
                <TabsContent value="portal" className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border border-border/40 shadow-sm bg-card/60 backdrop-blur-xl rounded-xl">
                                <CardHeader className="p-4 pb-3">
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-primary" />
                                        Public Careers Portal
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Manage public job application portal branding and applicant submission rules.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-1 space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Company / Brand Name</Label>
                                        <Input
                                            value={settings.careerPortal.companyName}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                careerPortal: { ...settings.careerPortal, companyName: e.target.value }
                                            })}
                                            placeholder="Devlomatix"
                                            className="bg-muted/30 border border-border/40 h-10 rounded-lg text-xs"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Portal Hero Title</Label>
                                        <Input
                                            value={settings.careerPortal.portalTitle}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                careerPortal: { ...settings.careerPortal, portalTitle: e.target.value }
                                            })}
                                            placeholder="Careers at Devlomatix"
                                            className="bg-muted/30 border border-border/40 h-10 rounded-lg text-xs"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Portal Subtitle / Mission Statement</Label>
                                        <Textarea
                                            value={settings.careerPortal.portalSubtitle}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                careerPortal: { ...settings.careerPortal, portalSubtitle: e.target.value }
                                            })}
                                            rows={3}
                                            placeholder="Join our high-performing team and build the future with us."
                                            className="bg-muted/30 border border-border/40 rounded-lg text-xs resize-none"
                                        />
                                    </div>

                                    <Separator className="bg-border/30 my-2" />

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-semibold">Allow Public Applications</p>
                                                <p className="text-[11px] text-muted-foreground">When enabled, candidates can submit resumes directly from the public site.</p>
                                            </div>
                                            <Switch
                                                checked={settings.careerPortal.allowPublicApply}
                                                onCheckedChange={(val) => setSettings({
                                                    ...settings,
                                                    careerPortal: { ...settings.careerPortal, allowPublicApply: val }
                                                })}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-semibold">Require Resume Upload</p>
                                                <p className="text-[11px] text-muted-foreground">Mandate uploading a valid PDF or Word document before submission.</p>
                                            </div>
                                            <Switch
                                                checked={settings.careerPortal.requireResume}
                                                onCheckedChange={(val) => setSettings({
                                                    ...settings,
                                                    careerPortal: { ...settings.careerPortal, requireResume: val }
                                                })}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-semibold">Auto-Publish New Job Openings</p>
                                                <p className="text-[11px] text-muted-foreground">Automatically display new positions on the public career portal upon creation.</p>
                                            </div>
                                            <Switch
                                                checked={settings.careerPortal.autoPublishJobs}
                                                onCheckedChange={(val) => setSettings({
                                                    ...settings,
                                                    careerPortal: { ...settings.careerPortal, autoPublishJobs: val }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Portal Live URL Preview */}
                        <div>
                            <Card className="border border-border/40 shadow-sm bg-card/60 backdrop-blur-xl rounded-xl">
                                <CardHeader className="p-4 pb-3">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4 text-primary" />
                                        Live Career Page
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Your published candidate portal URL.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-1 space-y-3">
                                    <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-xs font-mono break-all flex items-center justify-between gap-2">
                                        <span>/career</span>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => {
                                                const url = `${window.location.origin}/career`;
                                                copyToClipboard(url, 'portal-url');
                                            }}
                                            className="h-8 w-8 shrink-0 rounded-md"
                                        >
                                            {copiedKey === 'portal-url' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                        </Button>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => window.open('/career', '_blank')}
                                            className="w-full h-9 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 shadow-sm"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                            Visit Portal
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Tab 4: Pipeline & Stages */}
                <TabsContent value="pipeline" className="space-y-6 animate-in fade-in duration-300">
                    <Card className="border border-border/40 shadow-sm bg-card/60 backdrop-blur-xl rounded-xl">
                        <CardHeader className="p-4 pb-3">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <GitMerge className="w-4 h-4 text-purple-500" />
                                Recruitment Pipeline Stages
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Standard workflow stages for candidate evaluation from application to hiring.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-1 space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                {settings.pipeline.stages.map((stage, idx) => (
                                    <div key={stage.id} className="p-3 rounded-xl bg-muted/30 border border-border/40 text-center space-y-1.5">
                                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                                            Step {idx + 1}
                                        </Badge>
                                        <p className="text-xs font-bold text-foreground">{stage.label}</p>
                                        <p className="text-[10px] font-mono text-muted-foreground">{stage.id}</p>
                                    </div>
                                ))}
                            </div>

                            <Separator className="bg-border/30" />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-semibold">Auto-advance Stage on Interview Schedule</p>
                                        <p className="text-[11px] text-muted-foreground">Moves candidate to 'INTERVIEW' stage automatically when a slot is booked.</p>
                                    </div>
                                    <Switch
                                        checked={settings.pipeline.autoAdvanceOnInterview}
                                        onCheckedChange={(val) => setSettings({
                                            ...settings,
                                            pipeline: { ...settings.pipeline, autoAdvanceOnInterview: val }
                                        })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Candidate Evaluation Scoring Scale</Label>
                                    <Select
                                        value={settings.pipeline.scoringScale}
                                        onValueChange={(val) => setSettings({
                                            ...settings,
                                            pipeline: { ...settings.pipeline, scoringScale: val }
                                        })}
                                    >
                                        <SelectTrigger className="bg-muted/30 border border-border/40 h-10 rounded-lg text-xs w-64">
                                            <SelectValue placeholder="Select Scale" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="100">100-Point Scorecard (0 - 100)</SelectItem>
                                            <SelectItem value="10">10-Point Scorecard (1 - 10)</SelectItem>
                                            <SelectItem value="5">5-Star Rating (1 - 5 Stars)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 5: Interview Preferences */}
                <TabsContent value="interview" className="space-y-6 animate-in fade-in duration-300">
                    <Card className="border border-border/40 shadow-sm bg-card/60 backdrop-blur-xl rounded-xl">
                        <CardHeader className="p-4 pb-3">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-amber-500" />
                                Interview & Scheduling Preferences
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Configure default meeting parameters and candidate reminder windows.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Default Interview Duration</Label>
                                    <Select
                                        value={String(settings.interview.defaultDuration)}
                                        onValueChange={(val) => setSettings({
                                            ...settings,
                                            interview: { ...settings.interview, defaultDuration: parseInt(val) }
                                        })}
                                    >
                                        <SelectTrigger className="bg-muted/30 border border-border/40 h-10 rounded-lg text-xs">
                                            <SelectValue placeholder="Duration" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="15">15 Minutes (Screening)</SelectItem>
                                            <SelectItem value="30">30 Minutes (Standard)</SelectItem>
                                            <SelectItem value="45">45 Minutes (Technical / Deep Dive)</SelectItem>
                                            <SelectItem value="60">60 Minutes (Comprehensive)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Default Meeting Platform</Label>
                                    <Select
                                        value={settings.interview.defaultPlatform}
                                        onValueChange={(val) => setSettings({
                                            ...settings,
                                            interview: { ...settings.interview, defaultPlatform: val }
                                        })}
                                    >
                                        <SelectTrigger className="bg-muted/30 border border-border/40 h-10 rounded-lg text-xs">
                                            <SelectValue placeholder="Platform" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Google Meet">Google Meet</SelectItem>
                                            <SelectItem value="Zoom">Zoom Meeting</SelectItem>
                                            <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                                            <SelectItem value="In-Person">In-Person Office Interview</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Primary Recruitment Timezone</Label>
                                    <Select
                                        value={settings.interview.timezone}
                                        onValueChange={(val) => setSettings({
                                            ...settings,
                                            interview: { ...settings.interview, timezone: val }
                                        })}
                                    >
                                        <SelectTrigger className="bg-muted/30 border border-border/40 h-10 rounded-lg text-xs">
                                            <SelectValue placeholder="Timezone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</SelectItem>
                                            <SelectItem value="America/New_York">America/New_York (EST -5:00)</SelectItem>
                                            <SelectItem value="Europe/London">Europe/London (GMT +0:00)</SelectItem>
                                            <SelectItem value="Asia/Dubai">Asia/Dubai (GST +4:00)</SelectItem>
                                            <SelectItem value="Asia/Singapore">Asia/Singapore (SGT +8:00)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Candidate Reminder Window</Label>
                                    <Select
                                        value={String(settings.interview.reminderHoursBefore)}
                                        onValueChange={(val) => setSettings({
                                            ...settings,
                                            interview: { ...settings.interview, reminderHoursBefore: parseInt(val) }
                                        })}
                                    >
                                        <SelectTrigger className="bg-muted/30 border border-border/40 h-10 rounded-lg text-xs">
                                            <SelectValue placeholder="Reminder" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="2">2 Hours Before</SelectItem>
                                            <SelectItem value="6">6 Hours Before</SelectItem>
                                            <SelectItem value="12">12 Hours Before</SelectItem>
                                            <SelectItem value="24">24 Hours Before (Recommended)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add / Edit WhatsApp Cloud Account Dialog */}
            <Dialog open={isAccountModalOpen} onOpenChange={setIsAccountModalOpen}>
                <DialogContent className="max-w-lg p-0 overflow-hidden bg-card border border-border/60 shadow-2xl rounded-2xl">
                    <DialogHeader className="p-5 pb-3 bg-muted/20 border-b border-border/40">
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-emerald-500" />
                            {editingAccount ? 'Edit WhatsApp Cloud Account' : 'Connect WhatsApp Cloud Account'}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Enter your Meta Developer App credentials to connect a WhatsApp Cloud sender.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveAccount} className="p-5 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">Account / Profile Name</Label>
                            <Input
                                placeholder="e.g. HR Production Sender"
                                value={accountFormData.profileName}
                                onChange={(e) => setAccountFormData({ ...accountFormData, profileName: e.target.value })}
                                className="h-9 text-xs"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Phone Number ID</Label>
                                <Input
                                    placeholder="e.g. 1107134799144805"
                                    value={accountFormData.phoneNumberId}
                                    onChange={(e) => setAccountFormData({ ...accountFormData, phoneNumberId: e.target.value })}
                                    className="h-9 text-xs font-mono"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">WABA ID</Label>
                                <Input
                                    placeholder="e.g. 947841051181778"
                                    value={accountFormData.wabaId}
                                    onChange={(e) => setAccountFormData({ ...accountFormData, wabaId: e.target.value })}
                                    className="h-9 text-xs font-mono"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">Permanent Access Token</Label>
                            <div className="relative">
                                <Input
                                    type={showToken ? 'text' : 'password'}
                                    placeholder={editingAccount ? '•••••••••••• (Leave blank to keep existing)' : 'EAA...'}
                                    value={accountFormData.accessToken}
                                    onChange={(e) => setAccountFormData({ ...accountFormData, accessToken: e.target.value })}
                                    className="h-9 text-xs font-mono pr-9"
                                    required={!editingAccount}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowToken(!showToken)}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                                >
                                    {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                System User Token from Meta Business Manager with <code className="font-mono">whatsapp_business_messaging</code> permissions.
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleTestConnection}
                                disabled={isTestingConnection || !accountFormData.phoneNumberId || (!accountFormData.accessToken && !editingAccount)}
                                className="h-8 text-xs font-semibold"
                            >
                                {isTestingConnection ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-500" />}
                                Test Connection
                            </Button>

                            <div className="flex items-center gap-2">
                                <Label className="text-xs font-medium">Set as Default Sender</Label>
                                <Switch
                                    checked={accountFormData.setAsDefault}
                                    onCheckedChange={(val) => setAccountFormData({ ...accountFormData, setAsDefault: val })}
                                />
                            </div>
                        </div>

                        {connectionTestResult && (
                            <div className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${connectionTestResult.error ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                                {connectionTestResult.error ? <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
                                <div>
                                    {connectionTestResult.error ? (
                                        <span>Connection failed: {connectionTestResult.error}</span>
                                    ) : (
                                        <span>Verified as <strong>{connectionTestResult.profileName || 'WhatsApp Account'}</strong> ({connectionTestResult.displayNumber})</span>
                                    )}
                                </div>
                            </div>
                        )}

                        <DialogFooter className="pt-3 border-t border-border/40">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAccountModalOpen(false)}
                                className="h-9 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSavingAccount}
                                className="h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {isSavingAccount ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                                {editingAccount ? 'Update Account' : 'Connect Account'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
