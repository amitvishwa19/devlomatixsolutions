import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAction } from "@/hooks/use-action";
import { waCloudApiInfo } from "../_actions/wa-cloud-api-info";
import { getDecryptedCredentials } from "../_actions/get-decrypted-credentials";
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

// Workspace-scoped cache to prevent re-fetching on tab remounts
const workspaceCache = new Map();

export function WhatsAppMetaCloudInfo({ workspaceId, metaCloudVersion = 'v25.0' }) {
    // Local state for UI reactivity
    const [appInfoResult, setAppInfoResult] = useState(null);
    const [appInfoTesting, setAppInfoTesting] = useState(false);
    const [displayNamesResult, setDisplayNamesResult] = useState(null);
    const [displayNamesTesting, setDisplayNamesTesting] = useState(false);
    const [obaStatusResult, setObaStatusResult] = useState(null);
    const [obaStatusTesting, setObaStatusTesting] = useState(false);
    const [displayNamesPhoneId, setDisplayNamesPhoneId] = useState('');
    const [metaCloudAccessToken, setMetaCloudAccessToken] = useState('');

    const isOverallLoading = appInfoTesting || displayNamesTesting || obaStatusTesting;

    // Consolidated App Info Fetcher
    const { execute: executeApiInfo } = useAction(waCloudApiInfo, {
        onSuccess: (data) => {
            if (data.success) {
                const results = {
                    appInfo: { success: data.appInfo.success, apiData: data.appInfo, error: data.appInfo.error },
                    displayNames: data.displayNames ? { success: data.displayNames.success, apiData: data.displayNames.data, error: data.displayNames.error } : null,
                    obaStatus: data.obaStatus ? { success: data.obaStatus.success, apiData: data.obaStatus.data, error: data.obaStatus.error } : null
                };

                // Update UI
                setAppInfoResult(results.appInfo);
                setDisplayNamesResult(results.displayNames);
                setObaStatusResult(results.obaStatus);

                // Update Cache
                const current = workspaceCache.get(workspaceId) || {};
                workspaceCache.set(workspaceId, { ...current, ...results, loaded: true });
            }
            setAppInfoTesting(false);
            setDisplayNamesTesting(false);
            setObaStatusTesting(false);
        },
        onError: (error) => {
            setAppInfoTesting(false);
            setDisplayNamesTesting(false);
            setObaStatusTesting(false);
            toast.error(error);
        }
    });

    const { execute: executeGetDecrypted } = useAction(getDecryptedCredentials, {
        onSuccess: (data) => {
            const token = data?.accessToken || data.data?.accessToken;
            const phoneId = data?.phoneNumberId ? data.phoneNumberId.toString() : data.data?.phoneNumberId?.toString();

            if (token) setMetaCloudAccessToken(token);
            if (phoneId) setDisplayNamesPhoneId(phoneId);

            // Sync with cache
            workspaceCache.set(workspaceId, {
                ...(workspaceCache.get(workspaceId) || {}),
                token,
                phoneId
            });

            if (token) {
                setAppInfoTesting(true);
                if (phoneId) {
                    setDisplayNamesTesting(true);
                    setObaStatusTesting(true);
                }
                executeApiInfo({
                    workspaceId,
                    accessToken: token,
                    phoneNumberId: phoneId,
                    version: metaCloudVersion
                });
            }
        }
    });

    useEffect(() => {
        if (!workspaceId) return;

        const cached = workspaceCache.get(workspaceId);
        if (cached && cached.loaded) {
            // Restore from cache
            setAppInfoResult(cached.appInfo);
            setDisplayNamesResult(cached.displayNames);
            setObaStatusResult(cached.obaStatus);
            setMetaCloudAccessToken(cached.token);
            setDisplayNamesPhoneId(cached.phoneId);
        } else {
            // Fetch fresh
            executeGetDecrypted({ workspaceId });
        }
    }, [workspaceId]);

    return (
        <ScrollArea className="h-full p-0">
            <Card id="meta-cloud-app-info" className="border shadow-sm w-full">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-semibold">Developer App Information</CardTitle>
                            <CardDescription className="text-xs">Meta API authentication and versioning</CardDescription>
                        </div>
                        {isOverallLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
                        {appInfoResult && !isOverallLoading && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${appInfoResult.success ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'
                                }`}>
                                {appInfoResult.success ? 'Token Valid' : 'Invalid Token'}
                            </span>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {appInfoResult?.success && appInfoResult?.apiData?.data && !isOverallLoading && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-x-2">
                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">App Name</Label>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary/8 text-primary border border-primary/15">
                                    {appInfoResult.apiData.data.application || 'N/A'}
                                </span>
                            </div>
                            <div className="space-x-2">
                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">App ID</Label>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono bg-primary/8 text-primary border border-primary/15">
                                    {appInfoResult.apiData.data.app_id || 'N/A'}
                                </span>
                            </div>
                            <div className="space-x-2">
                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">User ID</Label>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono bg-primary/8 text-primary border border-primary/15">
                                    {appInfoResult.apiData.data.user_id || 'N/A'}
                                </span>
                            </div>
                            <div className="space-x-2">
                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Token Type</Label>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary/8 text-primary border border-primary/15">
                                    {appInfoResult.apiData.data.type || 'N/A'}
                                </span>
                            </div>
                            <div className="space-x-2">
                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Status</Label>
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium border ${appInfoResult.apiData.data.is_valid ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${appInfoResult.apiData.data.is_valid ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`} />
                                    {appInfoResult.apiData.data.is_valid ? 'Live / Connected' : 'Invalid'}
                                </span>
                            </div>
                            <div className="space-x-2">
                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Token Expiry</Label>
                                {(() => {
                                    const exp = appInfoResult.apiData.data.expires_at;
                                    if (!exp || exp === 0) return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-green-500/10 text-green-600 border border-green-500/20">Never</span>;
                                    const date = new Date(exp * 1000);
                                    const isExpired = date < new Date();
                                    return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${isExpired ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-primary/8 text-primary border-primary/15'}`}>{date.toLocaleString()}{isExpired && ' (Expired)'}</span>;
                                })()}
                            </div>
                            <div className="space-x-2">
                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Data Access Expiry</Label>
                                {(() => {
                                    const exp = appInfoResult.apiData.data.data_access_expires_at;
                                    if (!exp || exp === 0) return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-green-500/10 text-green-600 border border-green-500/20">Never</span>;
                                    const date = new Date(exp * 1000);
                                    const isExpired = date < new Date();
                                    return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${isExpired ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-primary/8 text-primary border-primary/15'}`}>{date.toLocaleString()}{isExpired && ' (Expired)'}</span>;
                                })()}
                            </div>
                            {appInfoResult?.apiData?.data?.scopes?.length > 0 && (
                                <div className="col-span-2 space-y-2 pt-1 border-t border-border/20">
                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Granted Scopes</Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {appInfoResult.apiData.data.scopes.map((scope, i) => (
                                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary/8 text-primary border border-primary/15">{scope}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {displayNamesResult?.success && displayNamesResult?.apiData && (
                                <div className="col-span-2 border-t border-border/20 pt-3 space-y-2">
                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Phone Number</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-x-2">
                                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Verified Name</Label>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary/8 text-primary border border-primary/15">
                                                {displayNamesResult.apiData.verified_name || displayNamesResult.apiData.name || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="space-x-2">
                                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Name Status</Label>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${(displayNamesResult.apiData.name_status || obaStatusResult?.apiData?.name_status) === 'APPROVED' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'}`}>
                                                {displayNamesResult.apiData.name_status || obaStatusResult?.apiData?.name_status || 'Unknown'}
                                            </span>
                                        </div>
                                        <div className="space-x-2">
                                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Phone Number ID</Label>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono bg-primary/8 text-primary border border-primary/15">
                                                {displayNamesResult.apiData.id || displayNamesPhoneId || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="space-x-2">
                                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Verification Status</Label>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${obaStatusResult?.apiData?.code_verification_status === 'VERIFIED' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'}`}>
                                                {obaStatusResult?.apiData?.code_verification_status || 'Fetching...'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {isOverallLoading && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                            <RefreshCw className="w-3 h-3 animate-spin" /> Loading app info...
                        </div>
                    )}
                    {appInfoResult?.error && !isOverallLoading && (
                        <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                            <div className="text-xs text-red-600 font-medium">{appInfoResult.error}</div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </ScrollArea>
    );
}
