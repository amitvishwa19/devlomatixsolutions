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
    Key,
    Save
} from 'lucide-react';

// Tab Components
import GeneralTab from './_components/GeneralTab';
import AutomationTab from './_components/AutomationTab';
import WebhooksTab from './_components/WebhooksTab';
import MessagingTab from './_components/MessagingTab';
import NotificationsTab from './_components/NotificationsTab';
import SecurityTab from './_components/SecurityTab';
import MetaCloudTab from './_components/MetaCloudTab';
import DynamicIcon from './_components/DynamicIcon';

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

    // Meta Cloud — Card 2: Display Names
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
                            <MessageSquare className="w-6 h-6 text-primary" />
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
                                className="rounded-lg px-6 py-2.5 text-xs font-bold capitalize data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-primary/20 data-[state=active]:shadow-lg transition-all border border-transparent hover:bg-muted/10 opacity-70 data-[state=active]:opacity-100 flex items-center gap-2"
                            >
                                <DynamicIcon name={tab} className="w-3.5 h-3.5" />
                                {tab.replace('-', ' ')}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* GENERAL TAB */}
                    <TabsContent value="general" className="flex-1 space-y-8 outline-none custom-scrollbar overflow-y-auto pr-2">
                        <GeneralTab 
                            cloudCreds={cloudCreds}
                            testState={testState}
                            onAddAccount={() => setIsCredsModalOpen(true)}
                            onSetDefault={handleSetDefaultAccount}
                            onTestConnection={handleTestConnection}
                            onEditAccount={(cred) => {
                                setTempCreds(cred);
                                setIsCredsModalOpen(true);
                            }}
                            onDeleteAccount={(cred) => {
                                setAccountToDelete(cred);
                                setIsDeleteModalOpen(true);
                            }}
                            copyToClipboard={copyToClipboard}
                            // Analytics
                            analyticsWabaId={analyticsWabaId}
                            setAnalyticsWabaId={setAnalyticsWabaId}
                            analyticsDateRange={analyticsDateRange}
                            setAnalyticsDateRange={setAnalyticsDateRange}
                            analyticsGranularity={analyticsGranularity}
                            setAnalyticsGranularity={setAnalyticsGranularity}
                            metaCloudVersion={metaCloudVersion}
                            analyticsMsgTesting={analyticsMsgTesting}
                            handleFetchMsgAnalytics={handleFetchMsgAnalytics}
                            analyticsMsgResult={analyticsMsgResult}
                            analyticsMsgOpen={analyticsMsgOpen}
                            setAnalyticsMsgOpen={setAnalyticsMsgOpen}
                            analyticsConvTesting={analyticsConvTesting}
                            handleFetchConvAnalytics={handleFetchConvAnalytics}
                            analyticsConvResult={analyticsConvResult}
                            analyticsConvOpen={analyticsConvOpen}
                            setAnalyticsConvOpen={setAnalyticsConvOpen}
                        />
                    </TabsContent>

                    {/* AUTOMATION TAB */}
                    <TabsContent value="automation" className="flex-1 space-y-6 outline-none custom-scrollbar overflow-y-auto">
                        <AutomationTab 
                            metadata={metadata}
                            onSaveMetadata={handleSaveMetadata}
                            setMetadata={setMetadata}
                            testNumberInput={testNumberInput}
                            setTestNumberInput={setTestNumberInput}
                            onAddTestNumber={handleAddTestNumber}
                            onRemoveTestNumber={handleRemoveTestNumber}
                        />
                    </TabsContent>

                    {/* WEBHOOKS TAB */}
                    <TabsContent value="webhooks" className="flex-1 space-y-6 outline-none custom-scrollbar overflow-y-auto">
                        <WebhooksTab 
                            metadata={metadata}
                            onSaveMetadata={handleSaveMetadata}
                            setMetadata={setMetadata}
                            webhookUrl={webhookUrl}
                            showWebhookSecret={showWebhookSecret}
                            setShowWebhookSecret={setShowWebhookSecret}
                            copyToClipboard={copyToClipboard}
                        />
                    </TabsContent>

                    {/* MESSAGING TAB */}
                    <TabsContent value="messaging" className="flex-1 space-y-6 outline-none custom-scrollbar overflow-y-auto">
                        <MessagingTab 
                            metadata={metadata}
                            onSaveMetadata={handleSaveMetadata}
                        />
                    </TabsContent>

                    {/* NOTIFICATIONS TAB */}
                    <TabsContent value="notifications" className="flex-1 space-y-6 outline-none custom-scrollbar overflow-y-auto">
                        <NotificationsTab 
                            metadata={metadata}
                            setMetadata={setMetadata}
                            onSaveMetadata={handleSaveMetadata}
                        />
                    </TabsContent>

                    {/* SECURITY TAB */}
                    <TabsContent value="security" className="flex-1 space-y-6 outline-none custom-scrollbar overflow-y-auto">
                        <SecurityTab 
                            metadata={metadata}
                        />
                    </TabsContent>


                    {/* META CLOUD API TAB */}
                    <TabsContent value="meta-cloud" className="flex-1 outline-none custom-scrollbar overflow-y-auto">
                        <MetaCloudTab 
                            metaCloudVersion={metaCloudVersion}
                            setMetaCloudVersion={setMetaCloudVersion}
                            metaCloudAccessToken={metaCloudAccessToken}
                            setMetaCloudAccessToken={setMetaCloudAccessToken}
                            metaCloudTesting={metaCloudTesting}
                            handleTestMetaCloud={handleTestMetaCloud}
                            metaCloudResult={metaCloudResult}
                            metaCloudResultOpen={metaCloudResultOpen}
                            setMetaCloudResultOpen={setMetaCloudResultOpen}
                            displayNamesPhoneId={displayNamesPhoneId}
                            setDisplayNamesPhoneId={setDisplayNamesPhoneId}
                            displayNamesTesting={displayNamesTesting}
                            handleGetDisplayNames={handleGetDisplayNames}
                            displayNamesResult={displayNamesResult}
                            displayNamesResultOpen={displayNamesResultOpen}
                            setDisplayNamesResultOpen={setDisplayNamesResultOpen}
                            obaPhoneId={obaPhoneId}
                            setObaPhoneId={setObaPhoneId}
                            obaStatusTesting={obaStatusTesting}
                            handleCheckObaStatus={handleCheckObaStatus}
                            obaStatusResult={obaStatusResult}
                            obaStatusResultOpen={obaStatusResultOpen}
                            setObaStatusResultOpen={setObaStatusResultOpen}
                            obaWebsiteUrl={obaWebsiteUrl}
                            setObaWebsiteUrl={setObaWebsiteUrl}
                            obaParentBusiness={obaParentBusiness}
                            setObaParentBusiness={setObaParentBusiness}
                            obaCountry={obaCountry}
                            setObaCountry={setObaCountry}
                            obaLanguage={obaLanguage}
                            setObaLanguage={setObaLanguage}
                            obaAdditionalInfo={obaAdditionalInfo}
                            setObaAdditionalInfo={setObaAdditionalInfo}
                            obaTesting={obaTesting}
                            handleObaStatus={handleObaStatus}
                            obaResult={obaResult}
                            obaResultOpen={obaResultOpen}
                            setObaResultOpen={setObaResultOpen}
                            qrMessage={qrMessage}
                            setQrMessage={setQrMessage}
                            qrFormat={qrFormat}
                            setQrFormat={setQrFormat}
                            qrTesting={qrTesting}
                            handleCreateQR={handleCreateQR}
                            qrResult={qrResult}
                            qrResultOpen={qrResultOpen}
                            setQrResultOpen={setQrResultOpen}
                            qrListTesting={qrListTesting}
                            handleListQR={handleListQR}
                            qrListResult={qrListResult}
                            qrListResultOpen={qrListResultOpen}
                            setQrListResultOpen={setQrListResultOpen}
                            qrUpdateCodeId={qrUpdateCodeId}
                            setQrUpdateCodeId={setQrUpdateCodeId}
                            qrUpdateMessage={qrUpdateMessage}
                            setQrUpdateMessage={setQrUpdateMessage}
                            qrUpdateFormat={qrUpdateFormat}
                            setQrUpdateFormat={setQrUpdateFormat}
                            qrUpdateTesting={qrUpdateTesting}
                            handleUpdateQR={handleUpdateQR}
                            qrUpdateResult={qrUpdateResult}
                            qrUpdateResultOpen={qrUpdateResultOpen}
                            setQrUpdateResultOpen={setQrUpdateResultOpen}
                            qrDeleteCodeId={qrDeleteCodeId}
                            setQrDeleteCodeId={setQrDeleteCodeId}
                            qrDeleteTesting={qrDeleteTesting}
                            handleDeleteQR={handleDeleteQR}
                            qrDeleteResult={qrDeleteResult}
                            qrDeleteResultOpen={qrDeleteResultOpen}
                            setQrDeleteResultOpen={setQrDeleteResultOpen}
                        />
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

