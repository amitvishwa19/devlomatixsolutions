// @ts-nocheck
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Shield,
    Smartphone,
    RefreshCcw,
    CheckCircle2,
    AlertCircle,
    LogOut,
    QrCode,
    Plus,
    Trash2,
    Send,
    Settings,
    Zap,
    Globe,
    Lock,
    Terminal,
    Clock,
    User,
    Copy,
    Check,
    Bot,
    Server,
    ExternalLink,
    ChevronRight,
    Cpu,
    Star,
    RefreshCw,
    LayoutDashboard,
    Bell,
    ShieldCheck,
    Info,
    Share2,
    Database,
    Link,
    Eye,
    EyeOff,
    Mail,
    BellRing,
    History,
    Key
} from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import SonarLoader from '@/components/global/SonarLoader';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useAction } from "@/hooks/use-action";
import { updateTestNumbers } from "../_actions/update-test-numbers";
import { getCredentials } from "../_actions/get-credentials";
import { saveCloudCredentials } from "../_actions/save-cloud-credentials";
import { deleteCredential } from "../_actions/delete-credential";
import { setDefaultCredential } from "../_actions/set-default-credential";
import { testCredential } from "../_actions/test-credential";
import { getTemplates } from "../template/_actions/get-templates";
import { syncTemplates } from "../template/_actions/sync-templates";
import { testMetaApi } from "../_actions/test-meta-api";
import { updateWaMetadata } from "../_actions/update-wa-metadata";
import { getDecryptedCredentials } from "../_actions/get-decrypted-credentials";
import { useParams } from 'next/navigation';
import { getWaMetadata } from "../_actions/get-wa-metadata";

export default function SettingsPage() {
    const [metadata, setMetadata] = useState({});
    const [newNumber, setNewNumber] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [waUser, setWaUser] = useState(null);

    // Cloud API States
    const [cloudCreds, setCloudCreds] = useState([]);
    const [cloudLoading, setCloudLoading] = useState(false);
    const [testState, setTestState] = useState({}); // { id: 'loading' | 'success' | 'error' | null }
    const [templates, setTemplates] = useState([]);
    const [syncingTemplates, setSyncingTemplates] = useState({}); // { id: true/false }

    // Meta Cloud API Tab States
    const [metaCloudName, setMetaCloudName] = useState('');
    const [metaCloudUrl, setMetaCloudUrl] = useState('');
    const [metaCloudVersion, setMetaCloudVersion] = useState('v25.0');
    const [metaCloudAccessToken, setMetaCloudAccessToken] = useState('');
    const [metaCloudTesting, setMetaCloudTesting] = useState(false);
    const [metaCloudResult, setMetaCloudResult] = useState(null);
    const [metaCloudResultOpen, setMetaCloudResultOpen] = useState(true);

    // Meta Cloud â€” Card 2: Display Names
    const [displayNamesPhoneId, setDisplayNamesPhoneId] = useState('');
    const [displayNamesTesting, setDisplayNamesTesting] = useState(false);
    const [displayNamesResult, setDisplayNamesResult] = useState(null);
    const [displayNamesResultOpen, setDisplayNamesResultOpen] = useState(true);

    // Meta Cloud - Card 3: OBA Status
    const [obaPhoneId, setObaPhoneId] = useState('');
    const [obaWebsiteUrl, setObaWebsiteUrl] = useState('');
    const [obaParentBusiness, setObaParentBusiness] = useState('');
    const [obaCountry, setObaCountry] = useState('');
    const [obaLanguage, setObaLanguage] = useState('English');
    const [obaAdditionalInfo, setObaAdditionalInfo] = useState('');
    const [obaTesting, setObaTesting] = useState(false);
    const [obaResult, setObaResult] = useState(null);
    const [obaResultOpen, setObaResultOpen] = useState(true);
    const [obaStatusTesting, setObaStatusTesting] = useState(false);
    const [obaStatusResult, setObaStatusResult] = useState(null);
    const [obaStatusResultOpen, setObaStatusResultOpen] = useState(true);

    // Meta Cloud — Card 5: Create QR Code
    const [qrMessage, setQrMessage] = useState('');
    const [qrFormat, setQrFormat] = useState('SVG');
    const [qrTesting, setQrTesting] = useState(false);
    const [qrResult, setQrResult] = useState(null);
    const [qrResultOpen, setQrResultOpen] = useState(true);
    // QR — Get List tab
    const [qrListTesting, setQrListTesting] = useState(false);
    const [qrListResult, setQrListResult] = useState(null);
    const [qrListResultOpen, setQrListResultOpen] = useState(true);
    // QR — Update tab
    const [qrUpdateCodeId, setQrUpdateCodeId] = useState('');
    const [qrUpdateMessage, setQrUpdateMessage] = useState('');
    const [qrUpdateFormat, setQrUpdateFormat] = useState('SVG');
    const [qrUpdateTesting, setQrUpdateTesting] = useState(false);
    const [qrUpdateResult, setQrUpdateResult] = useState(null);
    const [qrUpdateResultOpen, setQrUpdateResultOpen] = useState(true);
    // QR — Delete tab
    const [qrDeleteCodeId, setQrDeleteCodeId] = useState('');
    const [qrDeleteTesting, setQrDeleteTesting] = useState(false);
    const [qrDeleteResult, setQrDeleteResult] = useState(null);
    const [qrDeleteResultOpen, setQrDeleteResultOpen] = useState(true);


    // Analytics
    const [analyticsWabaId, setAnalyticsWabaId] = useState('');
    const [analyticsGranularity, setAnalyticsGranularity] = useState('DAY');
    const [analyticsDateRange, setAnalyticsDateRange] = useState('30d');
    const [analyticsMsgTesting, setAnalyticsMsgTesting] = useState(false);
    const [analyticsMsgResult, setAnalyticsMsgResult] = useState(null);
    const [analyticsMsgOpen, setAnalyticsMsgOpen] = useState(true);
    const [analyticsConvTesting, setAnalyticsConvTesting] = useState(false);
    const [analyticsConvResult, setAnalyticsConvResult] = useState(null);
    const [analyticsConvOpen, setAnalyticsConvOpen] = useState(true);

    // Shared States
    const [webhookUrl, setWebhookUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [showWebhookSecret, setShowWebhookSecret] = useState(false);
    const [testNumberInput, setTestNumberInput] = useState('');
    const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);

    // Cloud Modal States
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

    const params = useParams();
    const workspaceId = params?.workspaceId;

    const { execute: executeUpdateMetadata } = useAction(updateWaMetadata, {
        onSuccess: (data) => {
            toast.success('Settings updated');
            setMetadata(data.metadata);
        },
        onError: (err) => toast.error(err || 'Failed to save settings')
    });

    const { execute: executeGetDecrypted } = useAction(getDecryptedCredentials, {
        onSuccess: (data) => {
            if (data.data?.accessToken) setMetaCloudAccessToken(data.data.accessToken);
            if (data.data?.phoneNumberId) {
                setDisplayNamesPhoneId(data.data.phoneNumberId);
                setObaPhoneId(data.data.phoneNumberId);
            }
            if (data.data?.wabaId) setAnalyticsWabaId(data.data.wabaId);
        }
    });


    const { execute: executeGetMetadata } = useAction(getWaMetadata, {
        onSuccess: (data) => {
            setMetadata(data.metadata || {});
            setLoading(false);
        },
        onError: () => setLoading(false)
    });

    const { execute: executeGetCreds } = useAction(getCredentials, {
        onSuccess: (data) => {
            setCloudCreds(data.credentials || []);
            setCloudLoading(false);
        },
        onError: () => setCloudLoading(false)
    });

    const { execute: executeGetTemplates } = useAction(getTemplates, {
        onSuccess: (data) => setTemplates(data.templates || []),
    });

    const { execute: executeSyncTemplates } = useAction(syncTemplates, {
        onSuccess: (data, id) => {
            toast.success(data.message || 'Templates synced!');
            executeGetTemplates({ workspaceId });
            setSyncingTemplates(prev => ({ ...prev, [id]: false }));
        },
        onError: (error, id) => {
            toast.error(error || 'Sync failed');
            setSyncingTemplates(prev => ({ ...prev, [id]: false }));
        }
    });

    const { execute: executeSaveCreds } = useAction(saveCloudCredentials, {
        onSuccess: () => {
            toast.success(tempCreds.id ? 'Account updated' : 'New account added');
            setIsCredsModalOpen(false);
            executeGetCreds({ workspaceId });
            setCloudLoading(false);
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
            executeGetCreds({ workspaceId });
            setTimeout(() => setIsSwitchingAccount(false), 800);
        },
        onError: (error) => {
            toast.error(error);
            setIsSwitchingAccount(false);
        }
    });

    const { execute: executeRemoveCred } = useAction(deleteCredential, {
        onSuccess: () => {
            toast.success('Account removed successfully');
            setIsDeleteModalOpen(false);
            setAccountToDelete(null);
            executeGetCreds({ workspaceId });
            setCloudLoading(false);
        },
        onError: () => setCloudLoading(false)
    });

    const { execute: executeTestCred } = useAction(testCredential, {
        onSuccess: (data, id) => {
            toast.success('Connection verified!');
            setTestState(prev => ({ ...prev, [id]: 'success' }));
            executeGetCreds({ workspaceId });
        },
        onError: (error, id) => {
            toast.error(error);
            setTestState(prev => ({ ...prev, [id]: 'error' }));
        }
    });

    const { execute: executeTestApi } = useAction(testMetaApi, {
        onSuccess: (data, context) => {
            if (context.type === 'meta_test') {
                setMetaCloudResult(data.apiData);
                setMetaCloudResultOpen(true);
            } else if (context.type === 'display_names') {
                setDisplayNamesResult(data.apiData);
                setDisplayNamesResultOpen(true);
            } else if (context.type === 'oba_apply') {
                setObaResult(data.apiData);
                setObaResultOpen(true);
            } else if (context.type === 'oba_status') {
                setObaStatusResult(data.apiData);
                setObaStatusResultOpen(true);
            } else if (context.type === 'qr_create') {
                setQrResult(data.apiData);
                setQrResultOpen(true);
            } else if (context.type === 'qr_list') {
                setQrListResult(data.apiData);
                setQrListResultOpen(true);
            } else if (context.type === 'qr_update') {
                setQrUpdateResult(data.apiData);
                setQrUpdateResultOpen(true);
            } else if (context.type === 'qr_delete') {
                setQrDeleteResult(data.apiData);
                setQrDeleteResultOpen(true);
            } else if (context.type === 'meta_analytics_msg') {
                setAnalyticsMsgResult(data.apiData);
                setAnalyticsMsgOpen(true);
            } else if (context.type === 'meta_analytics_conv') {
                setAnalyticsConvResult(data.apiData);
                setAnalyticsConvOpen(true);
            }
            
            if (data.success) toast.success("Operation successful");
            else toast.error(data.error || "Operation failed");
            
            // Stop relevant loading states
            if (context.type === 'meta_test') setMetaCloudTesting(false);
            else if (context.type === 'display_names') setDisplayNamesTesting(false);
            else if (context.type === 'oba_apply') setObaTesting(false);
            else if (context.type === 'oba_status') setObaStatusTesting(false);
            else if (context.type === 'qr_create') setQrTesting(false);
            else if (context.type === 'qr_list') setQrListTesting(false);
            else if (context.type === 'qr_update') setQrUpdateTesting(false);
            else if (context.type === 'qr_delete') setQrDeleteTesting(false);
            else if (context.type === 'meta_analytics_msg') setAnalyticsMsgTesting(false);
            else if (context.type === 'meta_analytics_conv') setAnalyticsConvTesting(false);
        },
        onError: (error, context) => {
            toast.error(error);
            if (context.type === 'meta_test') setMetaCloudTesting(false);
            else if (context.type === 'display_names') setDisplayNamesTesting(false);
            else if (context.type === 'oba_apply') setObaTesting(false);
            else if (context.type === 'oba_status') setObaStatusTesting(false);
            else if (context.type === 'qr_create') setQrTesting(false);
            else if (context.type === 'qr_list') setQrListTesting(false);
            else if (context.type === 'qr_update') setQrUpdateTesting(false);
            else if (context.type === 'qr_delete') setQrDeleteTesting(false);
            else if (context.type === 'meta_analytics_msg') setAnalyticsMsgTesting(false);
            else if (context.type === 'meta_analytics_conv') setAnalyticsConvTesting(false);
        }
    });


    const fetchCloudCreds = () => {
        setCloudLoading(true);
        executeGetCreds({ workspaceId });
    };

    const fetchTemplatesList = () => {
        executeGetTemplates({ workspaceId });
    };

    const fetchMetadata = () => {
        setLoading(true);
        executeGetMetadata({ workspaceId });
    };

    useEffect(() => {
        if (workspaceId) {
            fetchMetadata();
            fetchCloudCreds();
            fetchTemplatesList();
        }
    }, [workspaceId]);

    const handleSyncTemplates = (id) => {
        setSyncingTemplates(prev => ({ ...prev, [id]: true }));
        executeSyncTemplates({ workspaceId, id }, id);
    };

    const handleSaveCloudCreds = () => {
        if (!tempCreds.phoneNumberId || !tempCreds.wabaId || !tempCreds.accessToken) {
            toast.error('Required fields: Phone ID, WABA ID, and Access Token');
            return;
        }
        setCloudLoading(true);
        executeSaveCreds({
            workspaceId,
            profileName: tempCreds.profile || 'New Account',
            credentials: {
                accessToken: tempCreds.accessToken,
                phoneNumberId: tempCreds.phoneNumberId,
                wabaId: tempCreds.wabaId
            }
        });
    };

    const handleSetDefaultAccount = (id) => {
        setIsSwitchingAccount(true);
        executeSetDefault({ workspaceId, id });
    };

    const handleTestConnection = (id) => {
        setTestState(prev => ({ ...prev, [id]: 'loading' }));
        const testNumber = metadata.testNumbers?.[0];
        executeTestCred({ workspaceId, id, testNumber }, id);
    };

    const handleDeleteCloudCred = () => {
        if (!accountToDelete) return;
        setCloudLoading(true);
        executeRemoveCred({ workspaceId, id: accountToDelete.id });
    };

    const handleTestMetaCloud = () => {
        if (!metaCloudAccessToken.trim()) {
            toast.error('Please enter an Access Token.');
            return;
        }
        const builtUrl = `https://graph.facebook.com/${metaCloudVersion}/debug_token?input_token=${metaCloudAccessToken.trim()}`;
        setMetaCloudTesting(true);
        executeTestApi({
            workspaceId,
            url: builtUrl,
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken.trim()}` },
        }, { type: 'meta_test' });
    };

    const handleGetDisplayNames = () => {
        if (!displayNamesPhoneId.trim()) {
            toast.error('Please enter a Phone Number ID.');
            return;
        }
        if (!metaCloudAccessToken.trim()) {
            toast.error('Please enter an Access Token.');
            return;
        }
        const builtUrl = `https://graph.facebook.com/${metaCloudVersion}/${displayNamesPhoneId.trim()}?fields=verified_name,name_status`;
        setDisplayNamesTesting(true);
        executeTestApi({
            workspaceId,
            url: builtUrl,
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken.trim()}` },
        }, { type: 'display_names' });
    };

    const handleObaStatus = () => {
        if (!obaPhoneId.trim()) { toast.error('Please enter a Phone Number ID.'); return; }
        if (!metaCloudAccessToken.trim()) { toast.error('Please enter an Access Token.'); return; }
        const builtUrl = `https://graph.facebook.com/${metaCloudVersion}/${obaPhoneId.trim()}/official_business_account`;
        setObaTesting(true);
        executeTestApi({
            workspaceId,
            url: builtUrl,
            method: 'POST',
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken.trim()}` },
            body: {
                additional_supporting_information: obaAdditionalInfo,
                business_website_url: obaWebsiteUrl,
                parent_business_or_brand: obaParentBusiness,
                primary_country_of_operation: obaCountry,
                primary_language: obaLanguage,
            }
        }, { type: 'oba_apply' });
    };

    const handleCheckObaStatus = () => {
        if (!obaPhoneId.trim()) { toast.error('Please enter a Phone Number ID.'); return; }
        if (!metaCloudAccessToken.trim()) { toast.error('Please enter an Access Token.'); return; }
        const builtUrl = `https://graph.facebook.com/${metaCloudVersion}/${obaPhoneId.trim()}?fields=name_status,code_verification_status`;
        setObaStatusTesting(true);
        executeTestApi({
            workspaceId,
            url: builtUrl,
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken.trim()}` },
        }, { type: 'oba_status' });
    };

    const handleCreateQR = () => {
        if (!obaPhoneId.trim()) { toast.error('Please enter a Phone Number ID.'); return; }
        if (!qrMessage.trim()) { toast.error('Please enter a prefilled message.'); return; }
        if (!metaCloudAccessToken.trim()) { toast.error('Please enter an Access Token.'); return; }
        const builtUrl = `https://graph.facebook.com/${metaCloudVersion}/${obaPhoneId.trim()}/message_qrdls`;
        setQrTesting(true);
        executeTestApi({
            workspaceId,
            url: builtUrl,
            method: 'POST',
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken.trim()}` },
            body: { prefilled_message: qrMessage.trim(), generate_qr_image: qrFormat }
        }, { type: 'qr_create' });
    };

    const handleListQR = () => {
        if (!metaCloudAccessToken.trim()) { toast.error('Access Token required.'); return; }
        const url = `https://graph.facebook.com/${metaCloudVersion}/${obaPhoneId.trim()}/message_qrdls`;
        setQrListTesting(true);
        executeTestApi({
            workspaceId,
            url,
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken.trim()}` }
        }, { type: 'qr_list' });
    };

    const handleUpdateQR = () => {
        if (!qrUpdateCodeId.trim()) { toast.error('QR Code ID required.'); return; }
        if (!metaCloudAccessToken.trim()) { toast.error('Access Token required.'); return; }
        const url = `https://graph.facebook.com/${metaCloudVersion}/${obaPhoneId.trim()}/message_qrdls`;
        setQrUpdateTesting(true);
        executeTestApi({
            workspaceId,
            url,
            method: 'POST',
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken.trim()}` },
            body: { code: qrUpdateCodeId.trim(), prefilled_message: qrUpdateMessage.trim(), generate_qr_image: qrUpdateFormat }
        }, { type: 'qr_update' });
    };

    const handleDeleteQR = () => {
        if (!qrDeleteCodeId.trim()) { toast.error('QR Code ID required.'); return; }
        if (!metaCloudAccessToken.trim()) { toast.error('Access Token required.'); return; }
        const url = `https://graph.facebook.com/${metaCloudVersion}/${obaPhoneId.trim()}/message_qrdls/${qrDeleteCodeId.trim()}`;
        setQrDeleteTesting(true);
        executeTestApi({
            workspaceId,
            url,
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken.trim()}` }
        }, { type: 'qr_delete' });
    };

    useEffect(() => {
        fetchMetadata();
        fetchCloudCreds();
        fetchTemplatesList();

        // Pre-fill all Meta Cloud inputs from the default credential account
        // Pre-fill Meta Cloud inputs
        executeGetDecrypted({ workspaceId });

        if (typeof window !== 'undefined') {
            setWebhookUrl(`${window.location.origin}/api/wa/webhook`);
        }
    }, [workspaceId]);


    const handleSaveMetadata = (updates) => {
        executeUpdateMetadata({ workspaceId, metadata: updates });
    };

    const getDateRangeTimestamps = (range) => {
        const now = Math.floor(Date.now() / 1000);
        const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
        return { start: now - days * 86400, end: now };
    };

    const handleFetchMsgAnalytics = () => {
        if (!analyticsWabaId.trim()) { toast.error('WABA ID required.'); return; }
        if (!metaCloudAccessToken.trim()) { toast.error('Access Token required.'); return; }
        const { start, end } = getDateRangeTimestamps(analyticsDateRange);
        const url = `https://graph.facebook.com/${metaCloudVersion}/${analyticsWabaId.trim()}/analytics?start=${start}&end=${end}&granularity=${analyticsGranularity}&phone_numbers=[]`;
        setAnalyticsMsgTesting(true);
        executeTestApi({
            workspaceId,
            url,
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken.trim()}` },
        }, { type: 'meta_analytics_msg' });
    };

    const handleFetchConvAnalytics = () => {
        if (!analyticsWabaId.trim()) { toast.error('WABA ID required.'); return; }
        if (!metaCloudAccessToken.trim()) { toast.error('Access Token required.'); return; }
        const { start, end } = getDateRangeTimestamps(analyticsDateRange);
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


    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAddTestNumber = () => {
        const cleanNumber = testNumberInput.replace(/[^\d+]/g, '');
        if (!cleanNumber) {
            toast.error('Invalid number');
            return;
        }
        const currentTestNumbers = metadata.testNumbers || [];
        if (currentTestNumbers.includes(cleanNumber)) {
            toast.error('Number already added');
            return;
        }
        if (currentTestNumbers.length >= 5) {
            toast.error('Maximum 5 test numbers allowed');
            return;
        }

        handleSaveMetadata({ testNumbers: [...currentTestNumbers, cleanNumber] });
        setTestNumberInput('');
    };

    const handleRemoveTestNumber = (num) => {
        const currentTestNumbers = metadata.testNumbers || [];
        handleSaveMetadata({ testNumbers: currentTestNumbers.filter(n => n !== num) });
    };


    return (
        <TooltipProvider>
            <SonarLoader show={isSwitchingAccount} text="Switching account..." />
            <div className="flex flex-col h-full text-foreground overflow-hidden">

                {/* Header Section */}
                <div className="flex items-center justify-between p-6 border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                            <DynamicIcon name="whatsapp" className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">WhatsApp Instance</h1>
                                <Badge variant="outline" className="h-5 px-2 text-[9px] font-bold uppercase tracking-widest border-primary/20 text-primary bg-primary/5">
                                    Cloud API Engine
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage your Meta API configuration and instance health.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-primary/5 border border-primary/10 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">
                            {cloudCreds.length} Active Cloud Nodes
                        </span>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <Tabs defaultValue="general" className="flex-1 flex flex-col p-2 overflow-hidden">
                    <TabsList className="bg-muted/5 w-full justify-start rounded-xl h-auto p-1.5 gap-2 mb-6 border border-border/20 backdrop-blur-sm">
                        {['general', 'automation', 'webhooks', 'messaging', 'notifications', 'security', 'meta-cloud'].map((tab) => (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className="rounded-lg px-6 py-2.5 text-xs font-bold capitalize data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-primary/20 data-[state=active]:shadow-lg transition-all border border-transparent hover:bg-muted/10 opacity-70 data-[state=active]:opacity-100"
                            >
                                {tab.replace('_', ' ')}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* STATUS TAB */}
                    <TabsContent value="general" className="flex-1 outline-none custom-scrollbar overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            {/* Main Content (Left) */}
                            <div className="md:col-span-8 space-y-6">
                                <Card className="glass-card shadow-none border-none relative">
                                    <CardHeader className="flex flex-row items-center justify-between pb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
                                                <Globe className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base font-bold tracking-tight">Cloud API Integration</CardTitle>
                                                <CardDescription className="text-xs font-medium">Meta Business Platform Connectivity</CardDescription>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="h-8 text-xs px-4 rounded-lg font-bold"
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
                                            <div key={cred.id} className="p-5 bg-background/40 backdrop-blur-sm rounded-xl border border-border/20 hover:border-primary/30 transition-all group shadow-sm">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all shadow-inner">
                                                            <MessageSquare className="w-6 h-6" />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-bold tracking-tight">{cred.profile || 'WhatsApp Account'}</span>
                                                                {cred.verified ? (
                                                                    <Tooltip shrink>
                                                                        <TooltipTrigger asChild>
                                                                            <CheckCircle2 className="w-4 h-4 text-green-500 fill-green-500/10" />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Verified Node</TooltipContent>
                                                                    </Tooltip>
                                                                ) : (
                                                                    <Tooltip shrink>
                                                                        <TooltipTrigger asChild>
                                                                            <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Needs Re-verification</TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                                {cred.isDefault && (
                                                                    <Badge className="h-4 text-[9px] font-black tracking-widest bg-primary/20 text-primary border-primary/20">
                                                                        DEFAULT
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                                                                <span className="opacity-40 uppercase font-bold">Phone ID:</span>
                                                                <span className="tracking-widest">{cred.phoneNumberId}</span>
                                                                <Copy size={11} className="hover:text-primary cursor-pointer transition-colors" onClick={() => copyToClipboard(cred.phoneNumberId)} />
                                                                <Separator orientation="vertical" className="h-3 bg-border/40" />
                                                                <span className="opacity-40 uppercase font-bold">WABA ID:</span>
                                                                <span className="tracking-widest">{cred.wabaId}</span>
                                                                <Copy size={11} className="hover:text-primary cursor-pointer transition-colors" onClick={() => copyToClipboard(cred.wabaId)} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <Tooltip shrink>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className={`h-9 w-9 rounded-xl transition-all ${cred.isDefault ? 'bg-primary/20 border border-primary/30 text-primary' : 'text-muted-foreground hover:bg-muted/30 hover:text-primary'}`}
                                                                    onClick={() => handleSetDefaultAccount(cred.id)}
                                                                >
                                                                    <Star className={`w-4 h-4 ${cred.isDefault ? 'fill-current' : ''}`} />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {cred.isDefault ? 'Current Default Account' : 'Set as Default Account'}
                                                            </TooltipContent>
                                                        </Tooltip>

                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-border/20 shadow-sm"
                                                            onClick={() => handleTestConnection(cred.id)}
                                                            disabled={testState[cred.id] === 'loading'}
                                                        >
                                                            {testState[cred.id] === 'loading' ? (
                                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <Zap size={13} className={testState[cred.id] === 'success' ? 'fill-green-500 text-green-500' : 'text-primary'} />
                                                            )}
                                                            {testState[cred.id] === 'loading' ? 'Testing...' : 'Test'}
                                                        </Button>

                                                        <Tooltip shrink>
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

                                <div className="flex items-center justify-between text-[10px] px-3 font-bold tracking-widest uppercase text-muted-foreground/40">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                                        <span>Active Nodes Online</span>
                                    </div>
                                    <span className="italic">VWA-Engine v3.4.0 (Enterprise)</span>
                                </div>
                            </div>

                            {/* Sidebar Stats (Right) */}
                            <div className="md:col-span-4 space-y-6">
                                <Card className="glass-card border-none p-6 space-y-5">
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
                                            <Database size={14} className="text-primary" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Instance Health</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-xs font-medium">
                                            <span className="opacity-60 uppercase tracking-tighter">App Security</span>
                                            <Badge variant="outline" className="text-[9px] font-black h-5 border-green-500/20 text-green-500 bg-green-500/5 tracking-widest uppercase">High</Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-xs font-medium">
                                            <span className="opacity-60 uppercase tracking-tight">Latency</span>
                                            <span className="font-black text-primary tracking-tighter">0.4ms</span>
                                        </div>
                                        <div className="pt-2">
                                            <div className="w-full h-1 bg-muted/20 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: "98%" }}
                                                    className="h-full bg-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="bg-primary/5 border-primary/10 p-6 space-y-4 shadow-[inset_0_0_20px_rgba(var(--primary-rgb),0.05)] rounded-2xl">
                                    <div className="flex items-center gap-3 text-primary">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Zap size={14} className="fill-current" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Priority Mode</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed opacity-80">
                                        System is running on a high-availability node for zero-latency delivery. Node: <span className="text-primary font-bold">AWS-MUM-01</span>
                                    </p>
                                </Card>

                        {/* Analytics Section — full width below the grid */}
                        <div className="mt-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                                    <LayoutDashboard className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold tracking-tight">Account Analytics</h3>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-60">On-demand via Meta Graph API</p>
                                </div>
                            </div>

                            <Card className="glass-card border-none shadow-none">
                                <CardContent className="pt-5 space-y-4">

                                    {/* Controls Row */}
                                    <div className="flex flex-wrap gap-3 items-end">
                                        <div className="space-y-1.5 flex-1 min-w-[160px]">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">WABA ID</Label>
                                            <Input
                                                placeholder="WhatsApp Business Account ID"
                                                value={analyticsWabaId ?? ''}
                                                onChange={(e) => setAnalyticsWabaId(e.target.value)}
                                                className="bg-background/40 text-xs font-mono font-medium border rounded-md px-3 shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-1.5 w-32">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Date Range</Label>
                                            <Select value={analyticsDateRange} onValueChange={setAnalyticsDateRange}>
                                                <SelectTrigger className="h-9 bg-background/40 text-xs font-bold border rounded-md px-3 shadow-inner"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="7d" className="text-xs">Last 7 days</SelectItem>
                                                    <SelectItem value="30d" className="text-xs">Last 30 days</SelectItem>
                                                    <SelectItem value="90d" className="text-xs">Last 90 days</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5 w-28">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Granularity</Label>
                                            <Select value={analyticsGranularity} onValueChange={setAnalyticsGranularity}>
                                                <SelectTrigger className="h-9 bg-background/40 text-xs font-bold border rounded-md px-3 shadow-inner"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="DAY" className="text-xs">Day</SelectItem>
                                                    <SelectItem value="WEEK" className="text-xs">Week</SelectItem>
                                                    <SelectItem value="MONTH" className="text-xs">Month</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Analytics Tabs */}
                                    <Tabs defaultValue="messages" className="w-full">
                                        <TabsList className="bg-muted/5 w-full justify-start rounded-lg h-auto p-1 gap-1 border border-border/20 mb-3">
                                            <TabsTrigger value="messages" className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                                                Messages
                                            </TabsTrigger>
                                            <TabsTrigger value="conversations" className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                                                Conversations
                                            </TabsTrigger>
                                        </TabsList>

                                        {/* Messages Analytics */}
                                        <TabsContent value="messages" className="space-y-3 mt-0">
                                            <div className="px-3 py-2 bg-muted/10 border border-border/20 rounded-md text-[10px] font-mono text-muted-foreground/60 break-all">
                                                GET https://graph.facebook.com/<span className="text-primary/80">{metaCloudVersion}</span>/<span className="text-primary/80">{analyticsWabaId || '<waba_id>'}</span>/analytics?granularity=<span className="text-primary/80">{analyticsGranularity}</span>&start=...&end=...
                                            </div>
                                            <Button className="px-6 rounded-md text-xs gap-2" onClick={handleFetchMsgAnalytics} disabled={analyticsMsgTesting || !analyticsWabaId.trim()}>
                                                {analyticsMsgTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                                {analyticsMsgTesting ? 'Fetching...' : 'Fetch Message Analytics'}
                                            </Button>

                                            {analyticsMsgResult && (
                                                <div className="border border-border/20 rounded-lg overflow-hidden animate-in fade-in">
                                                    {/* Summary metric cards */}
                                                    {analyticsMsgResult.success && analyticsMsgResult.data?.data?.[0] && (() => {
                                                        const d = analyticsMsgResult.data.data[0];
                                                        const metrics = [
                                                            { label: 'Sent', value: d.sent ?? '–', color: 'text-blue-400' },
                                                            { label: 'Delivered', value: d.delivered ?? '–', color: 'text-green-400' },
                                                            { label: 'Read', value: d.read ?? '–', color: 'text-primary' },
                                                            { label: 'Failed', value: d.failed ?? '–', color: 'text-red-400' },
                                                        ];
                                                        return (
                                                            <div className="grid grid-cols-4 gap-2 p-3 bg-muted/5 border-b border-border/20">
                                                                {metrics.map(m => (
                                                                    <div key={m.label} className="text-center space-y-1 p-2 bg-background/40 rounded-lg">
                                                                        <div className={`text-lg font-black ${m.color}`}>{typeof m.value === 'number' ? m.value.toLocaleString() : m.value}</div>
                                                                        <div className="text-[9px] uppercase tracking-widest text-muted-foreground/60">{m.label}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    })()}
                                                    <button onClick={() => setAnalyticsMsgOpen(v => !v)} className="w-full flex items-center gap-2 px-3 py-2 bg-muted/10 hover:bg-muted/20 transition-colors">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${analyticsMsgResult.success ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                            {analyticsMsgResult.success ? '✓ Success' : '✗ Failed'}
                                                        </span>
                                                        {analyticsMsgResult.status && <span className="text-[10px] font-mono text-muted-foreground">{analyticsMsgResult.status} {analyticsMsgResult.statusText}</span>}
                                                        <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200 ${analyticsMsgOpen ? 'rotate-90' : ''}`} />
                                                    </button>
                                                    {analyticsMsgOpen && (
                                                        <pre className="text-[10px] font-mono bg-muted/5 p-3 overflow-x-auto max-h-56 text-muted-foreground whitespace-pre-wrap break-all">
                                                            {analyticsMsgResult.error ? analyticsMsgResult.error : JSON.stringify(analyticsMsgResult.data, null, 2)}
                                                        </pre>
                                                    )}
                                                </div>
                                            )}
                                        </TabsContent>

                                        {/* Conversation Analytics */}
                                        <TabsContent value="conversations" className="space-y-3 mt-0">
                                            <div className="px-3 py-2 bg-muted/10 border border-border/20 rounded-md text-[10px] font-mono text-muted-foreground/60 break-all">
                                                GET https://graph.facebook.com/<span className="text-primary/80">{metaCloudVersion}</span>/<span className="text-primary/80">{analyticsWabaId || '<waba_id>'}</span>/conversation_analytics?granularity=<span className="text-primary/80">{analyticsGranularity}</span>&...
                                            </div>
                                            <Button className="px-6 rounded-md text-xs gap-2" onClick={handleFetchConvAnalytics} disabled={analyticsConvTesting || !analyticsWabaId.trim()}>
                                                {analyticsConvTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                                {analyticsConvTesting ? 'Fetching...' : 'Fetch Conversation Analytics'}
                                            </Button>

                                            {analyticsConvResult && (
                                                <div className="border border-border/20 rounded-lg overflow-hidden animate-in fade-in">
                                                    {/* Conversation breakdown */}
                                                    {analyticsConvResult.success && analyticsConvResult.data?.data && (() => {
                                                        const cats = {};
                                                        analyticsConvResult.data.data.forEach(item => {
                                                            if (item.conversation_category) {
                                                                cats[item.conversation_category] = (cats[item.conversation_category] || 0) + (item.conversation_count || 0);
                                                            }
                                                        });
                                                        const catColors = { MARKETING: 'text-purple-400', UTILITY: 'text-blue-400', AUTHENTICATION: 'text-yellow-400', SERVICE: 'text-green-400' };
                                                        const entries = Object.entries(cats);
                                                        if (entries.length === 0) return null;
                                                        return (
                                                            <div className="grid grid-cols-2 gap-2 p-3 bg-muted/5 border-b border-border/20">
                                                                {entries.map(([cat, count]) => (
                                                                    <div key={cat} className="text-center space-y-1 p-2 bg-background/40 rounded-lg">
                                                                        <div className={`text-base font-black ${catColors[cat] || 'text-primary'}`}>{count.toLocaleString()}</div>
                                                                        <div className="text-[9px] uppercase tracking-widest text-muted-foreground/60">{cat}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    })()}
                                                    <button onClick={() => setAnalyticsConvOpen(v => !v)} className="w-full flex items-center gap-2 px-3 py-2 bg-muted/10 hover:bg-muted/20 transition-colors">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${analyticsConvResult.success ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                            {analyticsConvResult.success ? '✓ Success' : '✗ Failed'}
                                                        </span>
                                                        {analyticsConvResult.status && <span className="text-[10px] font-mono text-muted-foreground">{analyticsConvResult.status} {analyticsConvResult.statusText}</span>}
                                                        <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200 ${analyticsConvOpen ? 'rotate-90' : ''}`} />
                                                    </button>
                                                    {analyticsConvOpen && (
                                                        <pre className="text-[10px] font-mono bg-muted/5 p-3 overflow-x-auto max-h-56 text-muted-foreground whitespace-pre-wrap break-all">
                                                            {analyticsConvResult.error ? analyticsConvResult.error : JSON.stringify(analyticsConvResult.data, null, 2)}
                                                        </pre>
                                                    )}
                                                </div>
                                            )}
                                        </TabsContent>
                                    </Tabs>

                                </CardContent>
                            </Card>
                        </div>

                            </div>
                        </div>
                    </TabsContent>

                    {/* AUTOMATION TAB */}
                    <TabsContent value="automation" className="flex-1 space-y-6 outline-none custom-scrollbar overflow-y-auto">
                        <div className="max-w-3xl space-y-6">
                            <Card className="glass-card border-none shadow-none">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
                                                <Bot className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <CardTitle className="text-base font-bold tracking-tight">Auto-Responder</CardTitle>
                                                <CardDescription className="text-[10px] font-medium uppercase tracking-widest opacity-60">Message Handlers</CardDescription>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={metadata.autoResponderEnabled || false}
                                            onCheckedChange={(checked) => handleSaveMetadata({ autoResponderEnabled: checked })}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between p-5 bg-background/40 backdrop-blur-sm rounded-xl border border-border/20 shadow-sm">
                                        <div className="space-y-1">
                                            <Label className="text-xs font-bold tracking-tight">AI Synthesis Hub</Label>
                                            <p className="text-[10px] text-muted-foreground font-medium">Use AI to analyze intent before replying.</p>
                                        </div>
                                        <Switch
                                            checked={metadata.aiAssistantEnabled || false}
                                            onCheckedChange={(checked) => handleSaveMetadata({ aiAssistantEnabled: checked })}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-1">Default Welcome Message</Label>
                                        <Textarea
                                            rows={6}
                                            className="min-h-[120px] bg-background/40 backdrop-blur-sm text-xs font-medium focus:border-primary/40 rounded-xl border-border/20 shadow-inner p-4 leading-relaxed"
                                            placeholder="Hello! How can we help you today?"
                                            value={metadata.welcomeMessage || ''}
                                            onChange={(e) => setMetadata({ ...metadata, welcomeMessage: e.target.value })}
                                            onBlur={(e) => handleSaveMetadata({ welcomeMessage: e.target.value })}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="glass-card border-none shadow-none">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
                                            <Smartphone className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <CardTitle className="text-base font-bold tracking-tight text-primary">Test Audience</CardTitle>
                                            <CardDescription className="text-[10px] font-medium uppercase tracking-widest opacity-60">Internal QA Node</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40">
                                                <Plus size={16} />
                                            </div>
                                            <Input
                                                placeholder="Enter phone with country code (e.g. +919712340450)"
                                                className="pl-11 bg-background/40 backdrop-blur-sm h-11 text-xs font-medium border-border/20 rounded-xl shadow-inner px-4"
                                                value={testNumberInput}
                                                onChange={e => setTestNumberInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleAddTestNumber()}
                                            />
                                        </div>
                                        <Button size="sm" onClick={handleAddTestNumber} className="h-11 px-6 rounded-xl font-bold">Add Number</Button>
                                    </div>

                                    <div className="grid gap-3">
                                        {(metadata.testNumbers || []).map((num) => (
                                            <div key={num} className="flex items-center justify-between p-4 rounded-xl border border-border/20 bg-background/40 backdrop-blur-sm hover:border-primary/20 transition-all group shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center border border-border/40 shadow-inner">
                                                        <User className="w-4 h-4 text-muted-foreground/60" />
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold font-mono tracking-tight">{num}</span>
                                                        <Badge variant="outline" className="text-[8px] font-black tracking-widest h-4 border-primary/20 text-primary bg-primary/5 py-0 px-1.5">VERIFIED</Badge>
                                                        <Tooltip shrink>
                                                            <TooltipTrigger asChild>
                                                                <Info className="w-3 h-3 text-muted-foreground cursor-help opacity-40 hover:opacity-100 transition-opacity" />
                                                            </TooltipTrigger>
                                                            <TooltipContent className="text-[10px] rounded-lg p-2 leading-relaxed">
                                                                Ensure this number is also added to 'Test Numbers' in Meta Dev Console.
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                                    onClick={() => handleRemoveTestNumber(num)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        ))}
                                        {(metadata.testNumbers || []).length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 bg-muted/5 border border-dashed border-border/40 rounded-2xl">
                                                <div className="p-3 bg-muted/10 rounded-full">
                                                    <Smartphone className="w-6 h-6 text-muted-foreground/30" />
                                                </div>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest italic">No test numbers defined yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* WEBHOOKS TAB */}
                    <TabsContent value="webhooks" className="flex-1 space-y-6 outline-none custom-scrollbar overflow-y-auto">
                        <div className="max-w-3xl space-y-6">
                            <Card className="glass-card border-none shadow-none">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
                                            <Link className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <CardTitle className="text-base font-bold tracking-tight text-primary">Webhook Configuration</CardTitle>
                                            <CardDescription className="text-[10px] font-medium uppercase tracking-widest opacity-60">Event Bridge</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-1">Webhook Payload URL</Label>
                                        <div className="flex gap-3">
                                            <Input readOnly value={webhookUrl} className="bg-background/40 backdrop-blur-sm h-11 text-xs font-mono font-bold border-border/20 rounded-xl shadow-inner px-4 text-primary/80" />
                                            <Button variant="outline" size="icon" className="h-11 w-11 shrink-0 rounded-xl border-border/20 hover:bg-muted/10" onClick={() => copyToClipboard(webhookUrl)}>
                                                <Copy size={16} />
                                            </Button>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground font-medium ml-1 flex items-center gap-2">
                                            <Info size={12} className="text-primary/60" />
                                            Configure this URL in your Meta Developer Portal Webhooks section.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-1">Verify Token</Label>
                                        <div className="flex gap-3">
                                            <div className="relative flex-1">
                                                <Input
                                                    type={showWebhookSecret ? "text" : "password"}
                                                    value={metadata.webhookSecret || 'devlomatix_secret'}
                                                    onChange={(e) => setMetadata({ ...metadata, webhookSecret: e.target.value })}
                                                    onBlur={(e) => handleSaveMetadata({ webhookSecret: e.target.value })}
                                                    className="bg-background/40 backdrop-blur-sm h-11 text-xs font-mono font-bold border-border/20 rounded-xl shadow-inner px-4 pr-12"
                                                />
                                                <button
                                                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showWebhookSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                            <Button variant="outline" size="icon" className="h-11 w-11 shrink-0 rounded-xl border-border/20 hover:bg-muted/10" onClick={() => copyToClipboard(metadata.webhookSecret || 'devlomatix_secret')}>
                                                <Copy size={16} />
                                            </Button>
                                        </div>
                                    </div>

                                    <Separator className="bg-border/20" />

                                    <div className="space-y-5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-1">Event Subscriptions</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: 'Message Events', key: 'hook_messages' },
                                                { label: 'Status Updates', key: 'hook_status' },
                                                { label: 'Delivery Reports', key: 'hook_delivery' },
                                                { label: 'Error Notifications', key: 'hook_errors' }
                                            ].map((evt) => (
                                                <div key={evt.key} className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-border/20 rounded-xl shadow-sm">
                                                    <span className="text-[11px] font-bold tracking-tight">{evt.label}</span>
                                                    <Switch
                                                        checked={metadata[evt.key] !== false}
                                                        onCheckedChange={(c) => handleSaveMetadata({ [evt.key]: c })}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* MESSAGING TAB */}
                    <TabsContent value="messaging" className="flex-1 space-y-6 outline-none custom-scrollbar overflow-y-auto">
                        <div className="max-w-3xl space-y-6">
                            <Card className="glass-card border-none shadow-none">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
                                            <Send className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <CardTitle className="text-base font-bold tracking-tight text-primary">Messaging Standards</CardTitle>
                                            <CardDescription className="text-[10px] font-medium uppercase tracking-widest opacity-60">Engine Preferences</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-1">Message Retention</Label>
                                            <Select
                                                value={metadata.retention || '90'}
                                                onValueChange={(v) => handleSaveMetadata({ retention: v })}
                                            >
                                                <SelectTrigger className="h-11 bg-background/40 backdrop-blur-sm text-xs font-bold border-border/20 rounded-xl shadow-inner px-4">
                                                    <SelectValue placeholder="Select period" />
                                                </SelectTrigger>
                                                <SelectContent className="glass-card border-border/20 rounded-xl">
                                                    <SelectItem value="30" className="text-xs">30 Days</SelectItem>
                                                    <SelectItem value="90" className="text-xs">90 Days</SelectItem>
                                                    <SelectItem value="365" className="text-xs">1 Year</SelectItem>
                                                    <SelectItem value="0" className="text-xs">Indefinite</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-1">Media Quality</Label>
                                            <Select
                                                value={metadata.mediaQuality || 'standard'}
                                                onValueChange={(v) => handleSaveMetadata({ mediaQuality: v })}
                                            >
                                                <SelectTrigger className="h-11 bg-background/40 backdrop-blur-sm text-xs font-bold border-border/20 rounded-xl shadow-inner px-4">
                                                    <SelectValue placeholder="Select quality" />
                                                </SelectTrigger>
                                                <SelectContent className="glass-card border-border/20 rounded-xl">
                                                    <SelectItem value="standard" className="text-xs">Standard (Comp.)</SelectItem>
                                                    <SelectItem value="hd" className="text-xs">High Definition</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <Separator className="bg-border/20" />

                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-border/20 rounded-xl shadow-sm">
                                            <div className="space-y-0.5">
                                                <Label className="text-xs font-bold tracking-tight">Auto-Sync Templates</Label>
                                                <p className="text-[10px] text-muted-foreground font-medium">Automatically download Meta templates every hour.</p>
                                            </div>
                                            <Switch
                                                checked={metadata.autoSyncTemplates || false}
                                                onCheckedChange={(c) => handleSaveMetadata({ autoSyncTemplates: c })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* NOTIFICATIONS TAB */}
                    <TabsContent value="notifications" className="flex-1 space-y-6 outline-none custom-scrollbar overflow-y-auto">
                        <div className="max-w-3xl space-y-6">
                            <Card className="glass-card border-none shadow-none">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
                                            <BellRing className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <CardTitle className="text-base font-bold tracking-tight text-primary">Alert Center</CardTitle>
                                            <CardDescription className="text-[10px] font-medium uppercase tracking-widest opacity-60">System Stability</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-5 bg-background/40 backdrop-blur-sm border border-border/20 rounded-xl shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center border border-border/40 shadow-inner">
                                                    <Mail className="w-4 h-4 text-muted-foreground/60" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <span className="text-xs font-bold tracking-tight">Disconnect Alerts</span>
                                                    <p className="text-[10px] text-muted-foreground font-medium">Email notification when a session drops unexpectedly.</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={metadata.notifyDisconnect || false}
                                                onCheckedChange={(c) => handleSaveMetadata({ notifyDisconnect: c })}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-5 bg-background/40 backdrop-blur-sm border border-border/20 rounded-xl shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center border border-border/40 shadow-inner">
                                                    <AlertCircle className="w-4 h-4 text-muted-foreground/60" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <span className="text-xs font-bold tracking-tight">Delivery Failures</span>
                                                    <p className="text-[10px] text-muted-foreground font-medium">Alert when a template or broadcast fails to deliver.</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={metadata.notifyFailure || false}
                                                onCheckedChange={(c) => handleSaveMetadata({ notifyFailure: c })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-1">Admin Alert Email</Label>
                                        <Input
                                            placeholder="admin@example.com"
                                            className="h-11 bg-background/40 backdrop-blur-sm text-xs font-bold border-border/20 rounded-xl shadow-inner px-4"
                                            value={metadata.alertEmail || ''}
                                            onChange={(e) => setMetadata({ ...metadata, alertEmail: e.target.value })}
                                            onBlur={(e) => handleSaveMetadata({ alertEmail: e.target.value })}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* SECURITY TAB */}
                    <TabsContent value="security" className="flex-1 space-y-6 outline-none custom-scrollbar overflow-y-auto">
                        <div className="max-w-3xl space-y-6">
                            <Card className="glass-card border-none shadow-none">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
                                            <ShieldCheck className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <CardTitle className="text-base font-bold tracking-tight text-primary">Encryption & Governance</CardTitle>
                                            <CardDescription className="text-[10px] font-medium uppercase tracking-widest opacity-60">Security Manifests</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 bg-background/40 backdrop-blur-sm border border-border/20 rounded-xl shadow-sm space-y-3">
                                            <div className="flex items-center gap-3 text-[10px] font-black uppercase text-primary tracking-widest">
                                                <Lock size={13} className="text-primary/60" /> Cipher Status
                                            </div>
                                            <p className="text-xs font-black font-mono tracking-tight text-foreground">AES-256-GCM</p>
                                            <p className="text-[9px] text-muted-foreground font-medium leading-tight opacity-70">All session keys are salted and encrypted before DB persistence.</p>
                                        </div>
                                        <div className="p-5 bg-background/40 backdrop-blur-sm border border-border/20 rounded-xl shadow-sm space-y-3">
                                            <div className="flex items-center gap-3 text-[10px] font-black uppercase text-primary tracking-widest">
                                                <Shield size={13} className="text-primary/60" /> Security Node
                                            </div>
                                            <p className="text-xs font-black font-mono tracking-tight text-primary">AUTHORIZED</p>
                                            <p className="text-[9px] text-muted-foreground font-medium leading-tight opacity-70">Cloud API sessions are monitored for suspicious activity.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-muted-foreground opacity-60 ml-1">
                                            <History size={13} /> Recent Connection Audit
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { event: 'Session Refreshed', status: 'OK', color: 'text-green-500', bg: 'bg-green-500/10', time: '12m ago' },
                                                { event: 'Credential Check', status: 'PASS', color: 'text-green-500', bg: 'bg-green-500/10', time: '4h ago' },
                                                { event: 'Key Handshake', status: 'SYNC', color: 'text-blue-500', bg: 'bg-blue-500/10', time: 'Yesterday' }
                                            ].map((log, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm rounded-xl border border-border/20 shadow-sm">
                                                    <span className="text-xs font-bold tracking-tight text-foreground">{log.event}</span>
                                                    <div className="flex items-center gap-4">
                                                        <Badge variant="outline" className={`text-[9px] font-black tracking-widest h-5 ${log.color} ${log.bg} border-0 px-2`}>{log.status}</Badge>
                                                        <span className="text-[10px] text-muted-foreground font-black font-mono opacity-50 uppercase tracking-tighter">{log.time}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0 pb-8 px-8 justify-end">
                                    <Button variant="ghost" size="sm" className="text-destructive text-[10px] font-black uppercase tracking-widest hover:bg-destructive/10 rounded-xl px-6">
                                        Revoke All Remote Access
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </TabsContent>


                    {/* META CLOUD API TAB */}
                    <TabsContent value="meta-cloud" className="flex-1 outline-none custom-scrollbar overflow-y-auto">
                        <ScrollArea className=" h-[72vh] space-y-6 p-4">


                            <div id='all-test-container' className='flex flex-col gap-2'>
                                {/* Card 1 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Developer App Info */}
                                <Card className="glass-card border-none shadow-none w-full">
                                    <CardContent className="flex flex-col gap-4 pt-5">

                                        {/* Title */}
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            <Label className="text-sm font-bold tracking-tight">Developer App Info</Label>
                                            <span className="text-[10px] text-muted-foreground/50 font-mono ml-auto">GET /debug_token</span>
                                        </div>

                                        {/* Inputs Row */}
                                        <div className="flex gap-3">
                                            {/* API Version */}
                                            <div className="space-y-1.5 w-28 shrink-0">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Version</Label>
                                                <Input
                                                    value={metaCloudVersion ?? ''}
                                                    onChange={(e) => setMetaCloudVersion(e.target.value)}
                                                    className="bg-background/40 text-xs font-mono font-bold border rounded-md px-3 shadow-inner"
                                                />
                                            </div>
                                            {/* Access Token */}
                                            <div className="space-y-1.5 flex-1">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Access Token</Label>
                                                <Input
                                                    type="password"
                                                    placeholder="EAAG..."
                                                    value={metaCloudAccessToken ?? ''}
                                                    onChange={(e) => setMetaCloudAccessToken(e.target.value)}
                                                    className="bg-background/40 text-xs font-mono font-medium border rounded-md px-3 shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        {/* Computed URL Preview */}
                                        <div className="px-3 py-2 bg-muted/10 border border-border/20 rounded-md text-[10px] font-mono text-muted-foreground/60 break-all">
                                            GET https://graph.facebook.com/<span className="text-primary/80">{metaCloudVersion || '<API_VERSION>'}</span>/debug_token?input_token=<span className="text-primary/80">{metaCloudAccessToken ? 'ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢' : '<ACCESS_TOKEN>'}</span>
                                            <br />
                                            <span className="opacity-50">Authorization: Bearer {metaCloudAccessToken ? 'ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢' : '<ACCESS_TOKEN>'}</span>
                                        </div>

                                        {/* Get Info Button */}
                                        <div>
                                            <Button
                                                className="px-8 rounded-md text-xs gap-2"
                                                onClick={handleTestMetaCloud}
                                                disabled={metaCloudTesting || !metaCloudAccessToken.trim()}
                                            >
                                                {metaCloudTesting
                                                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                                                    : <Zap className="w-4 h-4" />
                                                }
                                                {metaCloudTesting ? 'Getting Info...' : 'Get Info'}
                                            </Button>
                                        </div>

                                        {/* Response Panel */}
                                        {metaCloudResult && (
                                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 border border-border/20 rounded-lg overflow-hidden">
                                                {/* Collapsible Header */}
                                                <button
                                                    onClick={() => setMetaCloudResultOpen(v => !v)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 bg-muted/10 hover:bg-muted/20 transition-colors"
                                                >
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${metaCloudResult.success
                                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                        }`}>
                                                        {metaCloudResult.success ? '&#x2713; Success' : '&#x2717; Failed'}
                                                    </span>
                                                    {metaCloudResult.status && (
                                                        <span className="text-[10px] font-mono text-muted-foreground">
                                                            {metaCloudResult.status} {metaCloudResult.statusText}
                                                        </span>
                                                    )}
                                                    <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200 ${metaCloudResultOpen ? 'rotate-90' : ''}`} />
                                                </button>
                                                {/* Collapsible Body */}
                                                {metaCloudResultOpen && (
                                                    <pre className="text-[10px] font-mono bg-muted/5 p-3 overflow-x-auto max-h-72 text-muted-foreground leading-relaxed whitespace-pre-wrap break-all">
                                                        {metaCloudResult.error
                                                            ? metaCloudResult.error
                                                            : JSON.stringify(metaCloudResult.data, null, 2)
                                                        }
                                                    </pre>
                                                )}
                                            </div>
                                        )}

                                    </CardContent>
                                </Card>

                                {/* Card 2 — Get Display Names */}
                                <Card className="glass-card border-none shadow-none w-full">
                                    <CardContent className="flex flex-col gap-4 pt-5">

                                        {/* Title */}
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            <Label className="text-sm font-bold tracking-tight">Get Display Names</Label>
                                            <span className="text-[10px] text-muted-foreground/50 font-mono ml-auto">GET /{'{' + 'phone_id' + '}'}?fields=verified_name,name_status</span>
                                        </div>

                                        {/* Phone Number ID input */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Phone Number ID</Label>
                                            <Input
                                                placeholder="106540352242922"
                                                value={displayNamesPhoneId ?? ''}
                                                onChange={(e) => setDisplayNamesPhoneId(e.target.value)}
                                                className="bg-background/40 text-xs font-mono font-medium border rounded-md px-3 shadow-inner"
                                            />
                                        </div>

                                        {/* Shared token note */}
                                        <p className="text-[10px] text-muted-foreground/40 ml-1">Uses <span className="text-primary/60 font-bold">Version</span> and <span className="text-primary/60 font-bold">Access Token</span> from card above.</p>

                                        {/* URL Preview */}
                                        <div className="px-3 py-2 bg-muted/10 border border-border/20 rounded-md text-[10px] font-mono text-muted-foreground/60 break-all">
                                            GET https://graph.facebook.com/<span className="text-primary/80">{metaCloudVersion || '<version>'}</span>/<span className="text-primary/80">{displayNamesPhoneId || '<phone_number_id>'}</span>?fields=verified_name,name_status
                                            <br />
                                            <span className="opacity-50">Authorization: Bearer {metaCloudAccessToken ? '••••••••' : '<ACCESS_TOKEN>'}</span>
                                        </div>

                                        {/* Button */}
                                        <div>
                                            <Button
                                                className="px-8 rounded-md text-xs gap-2"
                                                onClick={handleGetDisplayNames}
                                                disabled={displayNamesTesting || !displayNamesPhoneId.trim() || !metaCloudAccessToken.trim()}
                                            >
                                                {displayNamesTesting
                                                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                                                    : <Zap className="w-4 h-4" />
                                                }
                                                {displayNamesTesting ? 'Fetching...' : 'Get Display Names'}
                                            </Button>
                                        </div>

                                        {/* Collapsible Result */}
                                        {displayNamesResult && (
                                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 border border-border/20 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => setDisplayNamesResultOpen(v => !v)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 bg-muted/10 hover:bg-muted/20 transition-colors"
                                                >
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${displayNamesResult.success ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                        {displayNamesResult.success ? '✓ Success' : '✗ Failed'}
                                                    </span>
                                                    {displayNamesResult.status && (
                                                        <span className="text-[10px] font-mono text-muted-foreground">
                                                            {displayNamesResult.status} {displayNamesResult.statusText}
                                                        </span>
                                                    )}
                                                    <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200 ${displayNamesResultOpen ? 'rotate-90' : ''}`} />
                                                </button>
                                                {displayNamesResultOpen && (
                                                    <pre className="text-[10px] font-mono bg-muted/5 p-3 overflow-x-auto max-h-72 text-muted-foreground leading-relaxed whitespace-pre-wrap break-all">
                                                        {displayNamesResult.error ? displayNamesResult.error : JSON.stringify(displayNamesResult.data, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        )}

                                    </CardContent>
                                </Card>

                                {/* Card 3 - OBA Status Check */}
                                <Card className="glass-card border-none shadow-none w-full">
                                    <CardContent className="flex flex-col gap-4 pt-5">

                                        {/* Title */}
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            <Label className="text-sm font-bold tracking-tight">OBA Status</Label>
                                            <span className="text-[10px] text-muted-foreground/50 font-mono ml-auto">GET /{'{' + 'phone_id' + '}'}?fields=name_status,code_verification_status</span>
                                        </div>

                                        {/* Shared inputs note */}
                                        <p className="text-[10px] text-muted-foreground/40 ml-1">Uses <span className="text-primary/60 font-bold">Phone Number ID</span>, <span className="text-primary/60 font-bold">Version</span> and <span className="text-primary/60 font-bold">Access Token</span> from cards above.</p>

                                        {/* URL Preview */}
                                        <div className="px-3 py-2 bg-muted/10 border border-border/20 rounded-md text-[10px] font-mono text-muted-foreground/60 break-all">
                                            GET https://graph.facebook.com/<span className="text-primary/80">{metaCloudVersion || '<version>'}</span>/<span className="text-primary/80">{obaPhoneId || '<phone_id>'}</span>?fields=name_status,code_verification_status
                                            <br />
                                            <span className="opacity-50">Authorization: Bearer {metaCloudAccessToken ? '••••••••' : '<ACCESS_TOKEN>'}</span>
                                        </div>

                                        {/* Button */}
                                        <div>
                                            <Button className="px-8 rounded-md text-xs gap-2" onClick={handleCheckObaStatus} disabled={obaStatusTesting || !obaPhoneId.trim() || !metaCloudAccessToken.trim()}>
                                                {obaStatusTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                                {obaStatusTesting ? 'Checking...' : 'Check OBA Status'}
                                            </Button>
                                        </div>

                                        {/* Collapsible Result */}
                                        {obaStatusResult && (
                                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 border border-border/20 rounded-lg overflow-hidden">
                                                <button onClick={() => setObaStatusResultOpen(v => !v)} className="w-full flex items-center gap-2 px-3 py-2 bg-muted/10 hover:bg-muted/20 transition-colors">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${obaStatusResult.success ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                        {obaStatusResult.success ? '✓ Success' : '✗ Failed'}
                                                    </span>
                                                    {obaStatusResult.status && <span className="text-[10px] font-mono text-muted-foreground">{obaStatusResult.status} {obaStatusResult.statusText}</span>}
                                                    <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200 ${obaStatusResultOpen ? 'rotate-90' : ''}`} />
                                                </button>
                                                {obaStatusResultOpen && (
                                                    <pre className="text-[10px] font-mono bg-muted/5 p-3 overflow-x-auto max-h-72 text-muted-foreground leading-relaxed whitespace-pre-wrap break-all">
                                                        {obaStatusResult.error ? obaStatusResult.error : JSON.stringify(obaStatusResult.data, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        )}

                                    </CardContent>
                                </Card>

                                {/* Card 3 - OBA Status */}
                                <Card className="glass-card border-none shadow-none w-full">
                                    <CardContent className="flex flex-col gap-4 pt-5">

                                        {/* Title */}
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            <Label className="text-sm font-bold tracking-tight">OBA Status</Label>
                                            <span className="text-[10px] text-muted-foreground/50 font-mono ml-auto">POST /{'{' + 'phone_id' + '}'}/official_business_account</span>
                                        </div>

                                        {/* Phone Number ID */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Phone Number ID</Label>
                                            <Input placeholder="106540352242922" value={obaPhoneId ?? ''} onChange={(e) => setObaPhoneId(e.target.value)} className="bg-background/40 text-xs font-mono font-medium border rounded-md px-3 shadow-inner" />
                                        </div>

                                        {/* Business fields in 2-col grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Business Website URL</Label>
                                                <Input placeholder="https://yourbusiness.com" value={obaWebsiteUrl ?? ''} onChange={(e) => setObaWebsiteUrl(e.target.value)} className="bg-background/40 text-xs font-mono font-medium border rounded-md px-3 shadow-inner" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Parent Business / Brand</Label>
                                                <Input placeholder="Lucky Shrub LLC" value={obaParentBusiness ?? ''} onChange={(e) => setObaParentBusiness(e.target.value)} className="bg-background/40 text-xs font-medium border rounded-md px-3 shadow-inner" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Primary Country</Label>
                                                <Input placeholder="United States of America" value={obaCountry ?? ''} onChange={(e) => setObaCountry(e.target.value)} className="bg-background/40 text-xs font-medium border rounded-md px-3 shadow-inner" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Primary Language</Label>
                                                <Input placeholder="English" value={obaLanguage ?? ''} onChange={(e) => setObaLanguage(e.target.value)} className="bg-background/40 text-xs font-medium border rounded-md px-3 shadow-inner" />
                                            </div>
                                        </div>

                                        {/* Additional Info */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Additional Supporting Information</Label>
                                            <textarea
                                                rows={2}
                                                placeholder="We are also featured in..." 
                                                value={obaAdditionalInfo ?? ''}
                                                onChange={(e) => setObaAdditionalInfo(e.target.value)}
                                                className="w-full bg-background/40 text-xs font-medium border border-input rounded-md px-3 py-2 shadow-inner resize-none outline-none focus:border-primary/20"
                                            />
                                        </div>

                                        {/* Shared token note */}
                                        <p className="text-[10px] text-muted-foreground/40 ml-1">Uses <span className="text-primary/60 font-bold">Version</span> and <span className="text-primary/60 font-bold">Access Token</span> from card above.</p>

                                        {/* URL Preview */}
                                        <div className="px-3 py-2 bg-muted/10 border border-border/20 rounded-md text-[10px] font-mono text-muted-foreground/60 break-all">
                                            POST https://graph.facebook.com/<span className="text-primary/80">{metaCloudVersion || '<version>'}</span>/<span className="text-primary/80">{obaPhoneId || '<phone_id>'}</span>/official_business_account
                                            <br />
                                            <span className="opacity-50">Authorization: Bearer {metaCloudAccessToken ? '••••••••' : '<ACCESS_TOKEN>'}</span>
                                        </div>

                                        {/* Button */}
                                        <div>
                                            <Button className="px-8 rounded-md text-xs gap-2" onClick={handleObaStatus} disabled={obaTesting || !obaPhoneId.trim() || !metaCloudAccessToken.trim()}>
                                                {obaTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                                {obaTesting ? 'Submitting...' : 'Submit OBA Request'}
                                            </Button>
                                        </div>

                                        {/* Collapsible Result */}
                                        {obaResult && (
                                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 border border-border/20 rounded-lg overflow-hidden">
                                                <button onClick={() => setObaResultOpen(v => !v)} className="w-full flex items-center gap-2 px-3 py-2 bg-muted/10 hover:bg-muted/20 transition-colors">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${obaResult.success ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                        {obaResult.success ? '✓ Success' : '✗ Failed'}
                                                    </span>
                                                    {obaResult.status && <span className="text-[10px] font-mono text-muted-foreground">{obaResult.status} {obaResult.statusText}</span>}
                                                    <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200 ${obaResultOpen ? 'rotate-90' : ''}`} />
                                                </button>
                                                {obaResultOpen && (
                                                    <pre className="text-[10px] font-mono bg-muted/5 p-3 overflow-x-auto max-h-72 text-muted-foreground leading-relaxed whitespace-pre-wrap break-all">
                                                        {obaResult.error ? obaResult.error : JSON.stringify(obaResult.data, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        )}

                                    </CardContent>
                                </Card>

                                {/* Card 5 — QR Codes */}
                                <Card className="glass-card border-none shadow-none w-full">
                                    <CardContent className="flex flex-col gap-4 pt-5">

                                        {/* Card Title */}
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            <Label className="text-sm font-bold tracking-tight">QR Codes</Label>
                                            <span className="text-[10px] text-muted-foreground/50 font-mono ml-auto">/message_qrdls</span>
                                        </div>

                                        {/* Inner Tabs */}
                                        <Tabs defaultValue="create" className="w-full">
                                            <TabsList className="bg-muted/5 w-full justify-start rounded-lg h-auto p-1 gap-1 border border-border/20 mb-3">
                                                {[
                                                    { value: 'create', label: 'Create', method: 'POST' },
                                                    { value: 'list',   label: 'Get List', method: 'GET' },
                                                    { value: 'update', label: 'Update', method: 'POST' },
                                                    { value: 'delete', label: 'Delete', method: 'DEL' },
                                                ].map(({ value, label, method }) => (
                                                    <TabsTrigger key={value} value={value} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                                                        <span className={`text-[8px] font-black px-1 py-0.5 rounded ${method === 'GET' ? 'bg-blue-500/10 text-blue-400' : method === 'DEL' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>{method}</span>
                                                        {label}
                                                    </TabsTrigger>
                                                ))}
                                            </TabsList>

                                            {/* ── CREATE ── */}
                                            <TabsContent value="create" className="space-y-3 mt-0">
                                                <div className="flex gap-3">
                                                    <div className="space-y-1.5 flex-1">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Prefilled Message</Label>
                                                        <Input placeholder="e.g. Cyber Monday" value={qrMessage ?? ''} onChange={(e) => setQrMessage(e.target.value)} className="bg-background/40 text-xs font-medium border rounded-md px-3 shadow-inner" />
                                                    </div>
                                                    <div className="space-y-1.5 w-28 shrink-0">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Format</Label>
                                                        <Select value={qrFormat} onValueChange={setQrFormat}>
                                                            <SelectTrigger className="h-9 bg-background/40 text-xs font-bold border rounded-md px-3 shadow-inner"><SelectValue /></SelectTrigger>
                                                            <SelectContent><SelectItem value="SVG" className="text-xs">SVG</SelectItem><SelectItem value="PNG" className="text-xs">PNG</SelectItem></SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="px-3 py-2 bg-muted/10 border border-border/20 rounded-md text-[10px] font-mono text-muted-foreground/60 break-all">
                                                    POST https://graph.facebook.com/<span className="text-primary/80">{metaCloudVersion}</span>/<span className="text-primary/80">{obaPhoneId || '<phone_id>'}</span>/message_qrdls
                                                </div>
                                                <Button className="px-6 rounded-md text-xs gap-2" onClick={handleCreateQR} disabled={qrTesting || !obaPhoneId.trim() || !qrMessage.trim() || !metaCloudAccessToken.trim()}>
                                                    {qrTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                                    {qrTesting ? 'Generating...' : 'Create QR Code'}
                                                </Button>
                                                {qrResult && (
                                                    <div className="border border-border/20 rounded-lg overflow-hidden animate-in fade-in">
                                                        <button onClick={() => setQrResultOpen(v => !v)} className="w-full flex items-center gap-2 px-3 py-2 bg-muted/10 hover:bg-muted/20 transition-colors">
                                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${qrResult.success ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{qrResult.success ? '✓ Success' : '✗ Failed'}</span>
                                                            {qrResult.status && <span className="text-[10px] font-mono text-muted-foreground">{qrResult.status} {qrResult.statusText}</span>}
                                                            <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200 ${qrResultOpen ? 'rotate-90' : ''}`} />
                                                        </button>
                                                        {qrResultOpen && (
                                                            <div className="p-3 space-y-3">
                                                                {qrResult.data?.qr_image_url && (
                                                                    <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg">
                                                                        <img src={qrResult.data.qr_image_url} alt="QR Code" className="w-40 h-40 object-contain" />
                                                                        {qrResult.data?.deep_link_url && <a href={qrResult.data.deep_link_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary font-mono underline break-all">{qrResult.data.deep_link_url}</a>}
                                                                    </div>
                                                                )}
                                                                <pre className="text-[10px] font-mono bg-muted/5 overflow-x-auto max-h-48 text-muted-foreground whitespace-pre-wrap break-all">{qrResult.error ? qrResult.error : JSON.stringify(qrResult.data, null, 2)}</pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </TabsContent>

                                            {/* ── GET LIST ── */}
                                            <TabsContent value="list" className="space-y-3 mt-0">
                                                <div className="px-3 py-2 bg-muted/10 border border-border/20 rounded-md text-[10px] font-mono text-muted-foreground/60 break-all">
                                                    GET https://graph.facebook.com/<span className="text-primary/80">{metaCloudVersion}</span>/<span className="text-primary/80">{obaPhoneId || '<phone_id>'}</span>/message_qrdls
                                                </div>
                                                <Button className="px-6 rounded-md text-xs gap-2" onClick={handleListQR} disabled={qrListTesting || !obaPhoneId.trim() || !metaCloudAccessToken.trim()}>
                                                    {qrListTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                                    {qrListTesting ? 'Fetching...' : 'Get QR Codes'}
                                                </Button>
                                                {qrListResult && (
                                                    <div className="border border-border/20 rounded-lg overflow-hidden animate-in fade-in">
                                                        <button onClick={() => setQrListResultOpen(v => !v)} className="w-full flex items-center gap-2 px-3 py-2 bg-muted/10 hover:bg-muted/20 transition-colors">
                                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${qrListResult.success ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{qrListResult.success ? '✓ Success' : '✗ Failed'}</span>
                                                            {qrListResult.status && <span className="text-[10px] font-mono text-muted-foreground">{qrListResult.status} {qrListResult.statusText}</span>}
                                                            <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200 ${qrListResultOpen ? 'rotate-90' : ''}`} />
                                                        </button>
                                                        {qrListResultOpen && <pre className="text-[10px] font-mono bg-muted/5 p-3 overflow-x-auto max-h-64 text-muted-foreground whitespace-pre-wrap break-all">{qrListResult.error ? qrListResult.error : JSON.stringify(qrListResult.data, null, 2)}</pre>}
                                                    </div>
                                                )}
                                            </TabsContent>

                                            {/* ── UPDATE ── */}
                                            <TabsContent value="update" className="space-y-3 mt-0">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">QR Code ID</Label>
                                                    <Input placeholder="e.g. 4O4YGZEG3" value={qrUpdateCodeId ?? ''} onChange={(e) => setQrUpdateCodeId(e.target.value)} className="bg-background/40 text-xs font-mono font-medium border rounded-md px-3 shadow-inner" />
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="space-y-1.5 flex-1">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">New Prefilled Message</Label>
                                                        <Input placeholder="e.g. Black Friday" value={qrUpdateMessage ?? ''} onChange={(e) => setQrUpdateMessage(e.target.value)} className="bg-background/40 text-xs font-medium border rounded-md px-3 shadow-inner" />
                                                    </div>
                                                    <div className="space-y-1.5 w-28 shrink-0">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Format</Label>
                                                        <Select value={qrUpdateFormat} onValueChange={setQrUpdateFormat}>
                                                            <SelectTrigger className="h-9 bg-background/40 text-xs font-bold border rounded-md px-3 shadow-inner"><SelectValue /></SelectTrigger>
                                                            <SelectContent><SelectItem value="SVG" className="text-xs">SVG</SelectItem><SelectItem value="PNG" className="text-xs">PNG</SelectItem></SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="px-3 py-2 bg-muted/10 border border-border/20 rounded-md text-[10px] font-mono text-muted-foreground/60 break-all">
                                                    POST https://graph.facebook.com/<span className="text-primary/80">{metaCloudVersion}</span>/<span className="text-primary/80">{obaPhoneId || '<phone_id>'}</span>/message_qrdls
                                                    <br /><span className="opacity-60">{'{'} code: "<span className="text-primary/80">{qrUpdateCodeId || '<code_id>'}</span>", prefilled_message: "..." {'}'}</span>
                                                </div>
                                                <Button className="px-6 rounded-md text-xs gap-2" onClick={handleUpdateQR} disabled={qrUpdateTesting || !qrUpdateCodeId.trim() || !metaCloudAccessToken.trim()}>
                                                    {qrUpdateTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                                    {qrUpdateTesting ? 'Updating...' : 'Update QR Code'}
                                                </Button>
                                                {qrUpdateResult && (
                                                    <div className="border border-border/20 rounded-lg overflow-hidden animate-in fade-in">
                                                        <button onClick={() => setQrUpdateResultOpen(v => !v)} className="w-full flex items-center gap-2 px-3 py-2 bg-muted/10 hover:bg-muted/20 transition-colors">
                                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${qrUpdateResult.success ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{qrUpdateResult.success ? '✓ Success' : '✗ Failed'}</span>
                                                            {qrUpdateResult.status && <span className="text-[10px] font-mono text-muted-foreground">{qrUpdateResult.status} {qrUpdateResult.statusText}</span>}
                                                            <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200 ${qrUpdateResultOpen ? 'rotate-90' : ''}`} />
                                                        </button>
                                                        {qrUpdateResultOpen && <pre className="text-[10px] font-mono bg-muted/5 p-3 overflow-x-auto max-h-48 text-muted-foreground whitespace-pre-wrap break-all">{qrUpdateResult.error ? qrUpdateResult.error : JSON.stringify(qrUpdateResult.data, null, 2)}</pre>}
                                                    </div>
                                                )}
                                            </TabsContent>

                                            {/* ── DELETE ── */}
                                            <TabsContent value="delete" className="space-y-3 mt-0">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">QR Code ID</Label>
                                                    <Input placeholder="e.g. 4O4YGZEG3" value={qrDeleteCodeId ?? ''} onChange={(e) => setQrDeleteCodeId(e.target.value)} className="bg-background/40 text-xs font-mono font-medium border rounded-md px-3 shadow-inner" />
                                                </div>
                                                <div className="px-3 py-2 bg-muted/10 border border-border/20 rounded-md text-[10px] font-mono text-muted-foreground/60 break-all">
                                                    DELETE https://graph.facebook.com/<span className="text-primary/80">{metaCloudVersion}</span>/<span className="text-primary/80">{obaPhoneId || '<phone_id>'}</span>/message_qrdls/<span className="text-red-400">{qrDeleteCodeId || '<code_id>'}</span>
                                                </div>
                                                <Button variant="destructive" className="px-6 rounded-md text-xs gap-2" onClick={handleDeleteQR} disabled={qrDeleteTesting || !qrDeleteCodeId.trim() || !metaCloudAccessToken.trim()}>
                                                    {qrDeleteTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                    {qrDeleteTesting ? 'Deleting...' : 'Delete QR Code'}
                                                </Button>
                                                {qrDeleteResult && (
                                                    <div className="border border-border/20 rounded-lg overflow-hidden animate-in fade-in">
                                                        <button onClick={() => setQrDeleteResultOpen(v => !v)} className="w-full flex items-center gap-2 px-3 py-2 bg-muted/10 hover:bg-muted/20 transition-colors">
                                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${qrDeleteResult.success ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{qrDeleteResult.success ? '✓ Success' : '✗ Failed'}</span>
                                                            {qrDeleteResult.status && <span className="text-[10px] font-mono text-muted-foreground">{qrDeleteResult.status} {qrDeleteResult.statusText}</span>}
                                                            <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200 ${qrDeleteResultOpen ? 'rotate-90' : ''}`} />
                                                        </button>
                                                        {qrDeleteResultOpen && <pre className="text-[10px] font-mono bg-muted/5 p-3 overflow-x-auto max-h-48 text-muted-foreground whitespace-pre-wrap break-all">{qrDeleteResult.error ? qrDeleteResult.error : JSON.stringify(qrDeleteResult.data, null, 2)}</pre>}
                                                    </div>
                                                )}
                                            </TabsContent>

                                        </Tabs>

                                    </CardContent>
                                </Card>

                            </div>


                        </ScrollArea>
                    </TabsContent>



                </Tabs>
                {/* MODALS */}
                <Dialog open={isCredsModalOpen} onOpenChange={setIsCredsModalOpen}>
                    <DialogContent className="sm:max-w-[480px] bg-background/80 backdrop-blur-xl border-border/20 p-0 rounded-2xl shadow-2xl overflow-hidden glass-card">
                        <div className="p-8 space-y-8">
                            <DialogHeader>
                                <div className="p-3 bg-primary/10 w-fit rounded-2xl mb-4">
                                    <Cpu className="w-6 h-6 text-primary" />
                                </div>
                                <DialogTitle className="text-2xl font-black tracking-tighter">Meta Engine Config</DialogTitle>
                                <DialogDescription className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Link your official Meta Node</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-2">
                                <div className="grid gap-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Account Nickname</Label>
                                    <Input className="bg-background/40 backdrop-blur-sm h-12 text-sm font-bold rounded-xl px-4 border-border/20 shadow-inner" value={tempCreds.profile} onChange={(e) => setTempCreds({ ...tempCreds, profile: e.target.value })} placeholder="e.g. Sales Primary" />
                                </div>
                                <div className="grid gap-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Phone Number ID</Label>
                                    <Input className="bg-background/40 backdrop-blur-sm h-12 text-sm font-bold rounded-xl px-4 border-border/20 shadow-inner" value={tempCreds.phoneNumberId} onChange={(e) => setTempCreds({ ...tempCreds, phoneNumberId: e.target.value })} placeholder="10492..." />
                                </div>
                                <div className="grid gap-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Business Account ID</Label>
                                    <Input className="bg-background/40 backdrop-blur-sm h-12 text-sm font-bold rounded-xl px-4 border-border/20 shadow-inner font-mono" value={tempCreds.wabaId} onChange={(e) => setTempCreds({ ...tempCreds, wabaId: e.target.value })} placeholder="92837..." />
                                </div>
                                <div className="grid gap-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">System Access Token</Label>
                                    <Input className="bg-background/40 backdrop-blur-sm h-12 text-sm font-bold rounded-xl px-4 border-border/20 shadow-inner font-mono" type="password" value={tempCreds.accessToken} onChange={(e) => setTempCreds({ ...tempCreds, accessToken: e.target.value })} placeholder="EAAG..." />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-muted/5 border-t border-border/20 flex items-center justify-between gap-4">
                            <Button variant="ghost" className="font-black text-[10px] uppercase tracking-widest h-12 rounded-xl px-6 hover:bg-muted/10" onClick={() => setIsCredsModalOpen(false)}>Cancel Action</Button>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-black uppercase tracking-widest h-12 px-10 rounded-xl shadow-lg shadow-primary/20 flex-1" onClick={handleSaveCloudCreds} disabled={cloudLoading}>
                                {cloudLoading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : (tempCreds.id ? 'Push Updates' : 'Activate Node')}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent className="sm:max-w-[400px] bg-[#0E141B] border-border/50 rounded-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-destructive flex items-center gap-3 text-xl tracking-tight">
                                <Trash2 className="w-6 h-6" /> Purge Credentials?
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium py-2 leading-relaxed">This will permanently terminate the cloud bridge and stop all automated handlers for <span className="text-foreground tracking-tight">"{accountToDelete?.profile}"</span>.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-8 gap-3">
                            <Button variant="ghost" className="font-bold h-12 rounded-xl flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                            <Button variant="destructive" className="text-[11px] tracking-widest h-12 px-8 rounded-xl shadow-lg shadow-destructive/20 flex-1" onClick={handleDeleteCloudCred} disabled={cloudLoading}>
                                Confirm Purge
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}

function DynamicIcon({ name, className }) {
    if (name === 'whatsapp') {
        return (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
        );
    }
    return <Key className={className} />;
}
