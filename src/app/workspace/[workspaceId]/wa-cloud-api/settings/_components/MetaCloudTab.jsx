// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import {
    Zap,
    RefreshCw,
    ChevronRight,
    Trash2,
    Info,
    Plus,
    List,
    ExternalLink,
    Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useAction } from "@/hooks/use-action";
import { testMetaApi } from "../_actions/test-meta-api";
import { getDecryptedCredentials } from "../_actions/get-decrypted-credentials";
import { Badge } from '@/components/ui/badge';

export function MetaCloudTab({ workspaceId }) {
    const [metaCloudVersion, setMetaCloudVersion] = useState('v25.0');
    const [metaCloudAccessToken, setMetaCloudAccessToken] = useState('');
    const [displayNamesPhoneId, setDisplayNamesPhoneId] = useState('');
    const [displayNamesTesting, setDisplayNamesTesting] = useState(false);
    const [displayNamesResultOpen, setDisplayNamesResultOpen] = useState(true);

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

    const { execute: executeGetDecrypted } = useAction(getDecryptedCredentials, {
        onSuccess: (data) => {
            const token = data?.accessToken || data.data?.accessToken;
            const phoneId = data?.phoneNumberId ? data.phoneNumberId.toString() : data.data?.phoneNumberId?.toString();
            if (token) setMetaCloudAccessToken(token);
            if (phoneId) {
                setDisplayNamesPhoneId(phoneId);
                setObaPhoneId(phoneId);
            }
        }
    });

    useEffect(() => {
        if (workspaceId) {
            executeGetDecrypted({ workspaceId });
        }
    }, [workspaceId]);

    const [qrMessage, setQrMessage] = useState('');
    const [qrFormat, setQrFormat] = useState('SVG');
    const [qrTesting, setQrTesting] = useState(false);
    const [qrResult, setQrResult] = useState(null);
    const [qrResultOpen, setQrResultOpen] = useState(true);

    const [qrListTesting, setQrListTesting] = useState(false);
    const [qrListResult, setQrListResult] = useState(null);
    const [qrListResultOpen, setQrListResultOpen] = useState(true);

    const [qrUpdateCodeId, setQrUpdateCodeId] = useState('');
    const [qrUpdateMessage, setQrUpdateMessage] = useState('');
    const [qrUpdateFormat, setQrUpdateFormat] = useState('SVG');
    const [qrUpdateTesting, setQrUpdateTesting] = useState(false);
    const [qrUpdateResult, setQrUpdateResult] = useState(null);
    const [qrUpdateResultOpen, setQrUpdateResultOpen] = useState(true);

    const [qrDeleteCodeId, setQrDeleteCodeId] = useState('');
    const [qrDeleteTesting, setQrDeleteTesting] = useState(false);
    const [qrDeleteResult, setQrDeleteResult] = useState(null);
    const [qrDeleteResultOpen, setQrDeleteResultOpen] = useState(true);



    const { execute: executeTestApi } = useAction(testMetaApi, {
        onSuccess: (data, context) => {
            console.log("[MetaCloudTab] Test API Success:", data, context);
            if (data.success) toast.success("Operation successful");
            else toast.error(data.error || "Operation failed");

            switch (context.type) {
                case 'oba_request':
                    setObaResult(data);
                    setObaResultOpen(true);
                    setObaTesting(false);
                    break;
                case 'qr_create':
                    setQrResult(data);
                    setQrResultOpen(true);
                    setQrTesting(false);
                    break;
                case 'qr_list':
                    setQrListResult(data);
                    setQrListResultOpen(true);
                    setQrListTesting(false);
                    break;
                case 'qr_update':
                    setQrUpdateResult(data);
                    setQrUpdateResultOpen(true);
                    setQrUpdateTesting(false);
                    break;
                case 'qr_delete':
                    setQrDeleteResult(data);
                    setQrDeleteResultOpen(true);
                    setQrDeleteTesting(false);
                    break;
            }
        },
        onError: (error, context) => {
            console.error("[MetaCloudTab] Test API Error:", error, context);
            toast.error(error);
            if (context.type === 'oba_request') setObaTesting(false);
            else if (context.type === 'qr_create') setQrTesting(false);
            else if (context.type === 'qr_list') setQrListTesting(false);
            else if (context.type === 'qr_update') setQrUpdateTesting(false);
            else if (context.type === 'qr_delete') setQrDeleteTesting(false);
        }
    });


    const handleGetDisplayNames = () => {
        setDisplayNamesTesting(true);
        executeTestApi({
            workspaceId,
            url: `https://graph.facebook.com/${metaCloudVersion}/${displayNamesPhoneId.trim()}?fields=verified_name,name_status`,
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken.trim()}` }
        }, { type: 'display_names' });
    };

    const handleCheckObaStatus = () => {
        setObaStatusTesting(true);
        executeTestApi({
            workspaceId,
            url: `https://graph.facebook.com/${metaCloudVersion}/${obaPhoneId.trim()}?fields=name_status,code_verification_status`,
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken.trim()}` }
        }, { type: 'oba_status_check' });
    };

    const handleObaStatus = () => {
        setObaTesting(true);
        executeTestApi({
            workspaceId,
            url: `https://graph.facebook.com/${metaCloudVersion}/${obaPhoneId.trim()}/official_business_account`,
            method: 'POST',
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken.trim()}` },
            body: {
                additional_supporting_information: obaAdditionalInfo,
                business_website_url: obaWebsiteUrl,
                parent_business_or_brand: obaParentBusiness,
                primary_country_of_operation: obaCountry,
                primary_language: obaLanguage,
            }
        }, { type: 'oba_request' });
    };

    const handleCreateQR = () => {
        setQrTesting(true);
        executeTestApi({
            workspaceId,
            url: `https://graph.facebook.com/${metaCloudVersion}/${obaPhoneId.trim()}/message_qrdls`,
            method: 'POST',
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken.trim()}` },
            body: { prefilled_message: qrMessage.trim(), generate_qr_image: qrFormat }
        }, { type: 'qr_create' });
    };

    const handleListQR = () => {
        setQrListTesting(true);
        executeTestApi({
            workspaceId,
            url: `https://graph.facebook.com/${metaCloudVersion}/${obaPhoneId.trim()}/message_qrdls`,
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken.trim()}` }
        }, { type: 'qr_list' });
    };

    const handleUpdateQR = () => {
        setQrUpdateTesting(true);
        executeTestApi({
            workspaceId,
            url: `https://graph.facebook.com/${metaCloudVersion}/${obaPhoneId.trim()}/message_qrdls`,
            method: 'POST',
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken.trim()}` },
            body: { code: qrUpdateCodeId.trim(), prefilled_message: qrUpdateMessage.trim(), generate_qr_image: qrUpdateFormat }
        }, { type: 'qr_update' });
    };

    const handleDeleteQR = () => {
        setQrDeleteTesting(true);
        executeTestApi({
            workspaceId,
            url: `https://graph.facebook.com/${metaCloudVersion}/${obaPhoneId.trim()}/message_qrdls/${qrDeleteCodeId.trim()}`,
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken.trim()}` }
        }, { type: 'qr_delete' });
    };

    return (
        <div className="flex-1 outline-none custom-scrollbar overflow-y-auto ">
            <ScrollArea className="h-[72vh] space-y-4">
                <div id='all-test-container' className='flex flex-col gap-4 '>





                    <div className="flex gap-4 items-stretch">


                        {/* Card 4 — QR Codes Section */}
                        <Card className="border shadow-sm w-full">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-sm font-semibold">QR Code Management</CardTitle>
                                <CardDescription className="text-xs">Create and manage deep-link QR codes</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <Tabs defaultValue="create" className="w-full">
                                    <TabsList className="bg-muted/5 w-fit justify-start rounded-md h-auto p-1 gap-1 border mb-4">
                                        {[
                                            { id: 'create', label: 'Create', icon: Plus },
                                            { id: 'list', label: 'List', icon: List },
                                            { id: 'update', label: 'Update', icon: RefreshCw },
                                            { id: 'delete', label: 'Delete', icon: Trash2 }
                                        ].map(tab => (
                                            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                                                <tab.icon size={14} />
                                                {tab.label}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>

                                    <TabsContent value="create" className="space-y-4">
                                        <div className="flex gap-3">
                                            <Input placeholder="Prefilled message" value={qrMessage} onChange={(e) => setQrMessage(e.target.value)} className="bg-muted/5 text-sm border rounded-md px-4 flex-1" />
                                            <Select value={qrFormat} onValueChange={setQrFormat}>
                                                <SelectTrigger className="w-28 text-sm border rounded-md px-4"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-md border-border/20">
                                                    <SelectItem value="SVG" className="text-sm">SVG</SelectItem>
                                                    <SelectItem value="PNG" className="text-sm">PNG</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            onClick={handleCreateQR}
                                            disabled={qrTesting || !qrMessage?.trim()}
                                            className="w-full text-xs font-medium h-10 gap-2 rounded-md"
                                        >
                                            {qrTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                            Create Deep Link
                                        </Button>
                                    </TabsContent>

                                    <TabsContent value="list" className="space-y-4">
                                        <Button onClick={handleListQR} disabled={qrListTesting || !obaPhoneId?.trim() || !metaCloudAccessToken?.trim()} className="w-full text-xs font-medium h-10 gap-2 rounded-md">
                                            {qrListTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />} List All QR Codes
                                        </Button>
                                    </TabsContent>

                                    <TabsContent value="update" className="space-y-4">
                                        <div className="space-y-3">
                                            <Input placeholder="QR Code ID" value={qrUpdateCodeId} onChange={(e) => setQrUpdateCodeId(e.target.value)} className="bg-muted/5 text-sm border-border/40 rounded-xl px-4" />
                                            <div className="flex gap-3">
                                                <Input placeholder="New Message" value={qrUpdateMessage} onChange={(e) => setQrUpdateMessage(e.target.value)} className="bg-muted/5 text-sm border-border/40 rounded-xl px-4 flex-1" />
                                                <Select value={qrUpdateFormat} onValueChange={setQrUpdateFormat}>
                                                    <SelectTrigger className="w-28 text-sm border-border/40 rounded-xl px-4"><SelectValue /></SelectTrigger>
                                                    <SelectContent className="rounded-xl border-border/20">
                                                        <SelectItem value="SVG" className="text-sm">SVG</SelectItem>
                                                        <SelectItem value="PNG" className="text-sm">PNG</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <Button onClick={handleUpdateQR} disabled={qrUpdateTesting || !qrUpdateCodeId?.trim() || !metaCloudAccessToken?.trim()} className="w-full text-xs font-medium h-10 rounded-md">
                                            Update Deep Link
                                        </Button>
                                    </TabsContent>

                                    <TabsContent value="delete" className="space-y-4">
                                        <Input placeholder="QR Code ID" value={qrDeleteCodeId} onChange={(e) => setQrDeleteCodeId(e.target.value)} className="bg-muted/5 text-sm border-border/40 rounded-xl px-4" />
                                        <Button variant="destructive" onClick={handleDeleteQR} disabled={qrDeleteTesting || !qrDeleteCodeId?.trim()} className="w-full text-xs font-medium h-10 rounded-md">
                                            Delete QR Code
                                        </Button>
                                    </TabsContent>
                                </Tabs>
                                {(qrResult || qrListResult || qrUpdateResult || qrDeleteResult) && (
                                    <div className="border border-border/40 rounded-xl p-3 bg-muted/5 flex flex-col gap-3 overflow-hidden w-full">
                                        {qrResult?.apiData && (
                                            <div className="flex flex-col gap-2 p-3 bg-background rounded-lg border border-border/40 shadow-sm overflow-hidden">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Deep Link</span>
                                                    <Badge variant="outline" className={`text-[9px] border-none ${qrResult.success ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                                                        {qrResult.success ? 'Active' : 'Error'}
                                                    </Badge>
                                                </div>
                                                <a href={qrResult.apiData.deep_link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline break-all font-mono leading-relaxed">
                                                    {qrResult.apiData.deep_link_url}
                                                </a>
                                                <div className="mt-2 flex flex-col gap-1 overflow-hidden">
                                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">QR Code ID</span>
                                                    <span className="text-xs font-mono break-all">{qrResult.apiData.code}</span>
                                                </div>
                                                {qrResult.apiData.qr_image_url && (
                                                    <div className="mt-2">
                                                        <a href={qrResult.apiData.qr_image_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[10px] font-medium text-primary hover:underline break-all">
                                                            <ExternalLink className="w-3 h-3 flex-shrink-0" /> <span className="truncate">View QR Image</span>
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="relative">
                                            <pre className="text-[10px] font-mono text-muted-foreground/80 overflow-x-auto max-h-48 leading-relaxed p-2 bg-muted/5 rounded-md whitespace-pre-wrap break-all">
                                                {JSON.stringify(qrResult?.apiData || qrListResult?.apiData || qrUpdateResult?.apiData || qrDeleteResult?.apiData, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
