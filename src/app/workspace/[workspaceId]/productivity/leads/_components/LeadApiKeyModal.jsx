'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import axios from "@/utils/axios";
import { toast } from "sonner";
import {
    Key,
    Shield,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Eye,
    EyeOff,
    ExternalLink,
    Zap,
    Trash2
} from "lucide-react";

export default function LeadApiKeyModal({ open, setOpen, workspaceId, onKeySaved }) {
    const [apiKey, setApiKey] = useState('');
    const [profileName, setProfileName] = useState('Google Places API');
    const [showKey, setShowKey] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }
    const [existingCredId, setExistingCredId] = useState(null);

    // Fetch existing Google Places credential on modal open
    useEffect(() => {
        if (open && workspaceId) {
            fetchExistingCredential();
        } else {
            setTestResult(null);
        }
    }, [open, workspaceId]);

    const fetchExistingCredential = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`/api/workspace/${workspaceId}/social/accounts`);
            const accounts = res.data || [];
            const placesCred = accounts.find(a => 
                a.platform?.toUpperCase() === 'GOOGLE_PLACES' || 
                a.platform?.toUpperCase() === 'GOOGLE PLACES'
            );

            if (placesCred) {
                setExistingCredId(placesCred.id);
                setProfileName(placesCred.profileName || placesCred.profile || 'Google Places API');
                const key = placesCred.details?.apiKey || placesCred.details?.['api-key'] || placesCred.details?.api_key || '';
                setApiKey(key);
            } else {
                setExistingCredId(null);
                setApiKey('');
                setProfileName('Google Places API');
            }
        } catch (error) {
            console.error("[LEAD_API_KEY_MODAL] Failed to fetch credentials:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTest = async () => {
        if (!apiKey.trim()) {
            toast.error("Please enter an API Key to test");
            return;
        }

        setIsTesting(true);
        setTestResult(null);
        const toastId = toast.loading("Verifying Google Places API Key...");

        try {
            const res = await axios.post(`/api/workspace/${workspaceId}/social/accounts/${existingCredId || 'new'}/test`, {
                platform: 'GOOGLE_PLACES',
                credentials: {
                    apiKey: apiKey.trim(),
                    profileName: profileName.trim() || 'Google Places API'
                }
            });

            if (res.data?.success) {
                setTestResult({
                    success: true,
                    message: res.data.message || "Google Places API connection verified successfully!"
                });
                toast.success("Google Places API Key is valid and working!", { id: toastId });
            } else {
                setTestResult({
                    success: false,
                    message: res.data?.message || "Verification failed. Check your API key and permissions."
                });
                toast.error(res.data?.message || "Google Places API verification failed", { id: toastId });
            }
        } catch (error) {
            const errMsg = error.response?.data?.message || error.message || "Failed to verify API key";
            setTestResult({
                success: false,
                message: errMsg
            });
            toast.error(errMsg, { id: toastId });
        } finally {
            setIsTesting(false);
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();

        if (!apiKey.trim()) {
            toast.error("API Key is required");
            return;
        }

        setIsSaving(true);
        const toastId = toast.loading("Saving API Key to Credentials Vault...");

        try {
            const payload = {
                platform: 'GOOGLE_PLACES',
                credentials: {
                    apiKey: apiKey.trim(),
                    profileName: profileName.trim() || 'Google Places API'
                },
                profile: profileName.trim() || 'Google Places API',
                status: 'connected',
                type: 'other',
                environment: 'PROD'
            };

            if (existingCredId) {
                await axios.patch(`/api/workspace/${workspaceId}/social/accounts/${existingCredId}`, payload);
                toast.success("Google Places credentials updated successfully in Credentials Vault!", { id: toastId });
            } else {
                const res = await axios.post(`/api/workspace/${workspaceId}/social/accounts`, payload);
                if (res.data?.id) setExistingCredId(res.data.id);
                toast.success("Google Places credentials saved to Credentials Vault!", { id: toastId });
            }

            onKeySaved?.(apiKey.trim());
            setOpen(false);
        } catch (error) {
            console.error("[LEAD_API_KEY_SAVE_ERROR]", error);
            toast.error(error.response?.data?.message || "Failed to save API key to credentials module", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!existingCredId) return;
        if (!confirm("Are you sure you want to remove this API Key from your Credentials Vault?")) return;

        setIsDeleting(true);
        const toastId = toast.loading("Deleting credentials...");
        try {
            await axios.delete(`/api/workspace/${workspaceId}/social/accounts/${existingCredId}`);
            toast.success("Google Places API credentials removed from Vault", { id: toastId });
            setExistingCredId(null);
            setApiKey('');
            setTestResult(null);
            onKeySaved?.(null);
            setOpen(false);
        } catch (error) {
            toast.error("Failed to delete credentials", { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[540px] bg-card/95 border-border/60 shadow-2xl backdrop-blur-2xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-3 border-b border-border/20 bg-muted/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
                                <Key className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold flex items-center gap-2">
                                    LeadFinder API Key
                                    {existingCredId ? (
                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-bold">
                                            Saved in Vault
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-[10px] opacity-60">
                                            Unconfigured
                                        </Badge>
                                    )}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                    Managed via System &gt; Credentials Vault (<span className="font-mono text-primary text-[10px]">GOOGLE_PLACES</span>)
                                </DialogDescription>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-5">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            <span className="text-xs font-medium">Checking Credentials Vault...</span>
                        </div>
                    ) : (
                        <>
                            {/* API Key Input */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold text-muted-foreground">
                                        Google Places API Key <span className="text-destructive">*</span>
                                    </Label>
                                    <a
                                        href="https://console.cloud.google.com/google/maps-apis/credentials"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1"
                                    >
                                        Get API Key <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                </div>
                                <div className="relative">
                                    <Input
                                        type={showKey ? "text" : "password"}
                                        placeholder="AIzaSy..."
                                        value={apiKey}
                                        onChange={(e) => {
                                            setApiKey(e.target.value);
                                            if (testResult) setTestResult(null);
                                        }}
                                        className="pr-10 bg-background/50 border-border/60 text-xs font-mono h-11 focus-visible:ring-1 focus-visible:ring-primary"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowKey(!showKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-1"
                                    >
                                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-muted-foreground/70">
                                    Your key is encrypted with AES-256-CBC and stored securely in the system credentials vault.
                                </p>
                            </div>

                            {/* Profile Name (Optional) */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground">
                                    Credential Label / Name
                                </Label>
                                <Input
                                    type="text"
                                    placeholder="e.g. Google Places Leads API"
                                    value={profileName}
                                    onChange={(e) => setProfileName(e.target.value)}
                                    className="bg-background/50 border-border/60 text-xs h-10 font-medium"
                                />
                            </div>

                            {/* Test Status Feedback Card */}
                            {testResult && (
                                <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 animate-in fade-in duration-300 ${
                                    testResult.success 
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                        : 'bg-destructive/10 border-destructive/30 text-destructive'
                                }`}>
                                    {testResult.success ? (
                                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-destructive" />
                                    )}
                                    <div className="space-y-0.5 flex-1">
                                        <p className="font-bold">{testResult.success ? "Connection Verified" : "Verification Failed"}</p>
                                        <p className="text-[11px] opacity-90 leading-relaxed">{testResult.message}</p>
                                    </div>
                                </div>
                            )}

                            {/* Cloud Console Requirements Guide */}
                            <div className="p-3.5 rounded-lg bg-muted/30 border border-border/30 space-y-1.5">
                                <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Google Cloud Configuration Tips
                                </p>
                                <ul className="text-[10px] text-muted-foreground/80 space-y-1 pl-4 list-disc">
                                    <li>Enable <strong>Places API</strong> and <strong>Maps JavaScript API</strong> on your Google Cloud project.</li>
                                    <li>Ensure billing is active on your Google Cloud Console.</li>
                                    <li>If restricting the key by API, select <em>Places API (New)</em> and <em>Places API</em>.</li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="p-4 bg-muted/20 border-t border-border/20 flex flex-row items-center justify-between sm:justify-between gap-2">
                    <div>
                        {existingCredId && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleDelete}
                                disabled={isDeleting || isSaving || isLoading}
                                className="text-destructive hover:bg-destructive/10 text-xs font-bold gap-1.5 h-9"
                            >
                                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                Remove
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleTest}
                            disabled={isTesting || isSaving || isLoading || !apiKey.trim()}
                            className="text-xs font-bold gap-1.5 h-9 bg-background/50 border-border/60 hover:bg-background"
                        >
                            {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                            Test Key
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving || isTesting || isLoading || !apiKey.trim()}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold h-9 px-5 shadow-lg shadow-primary/20"
                        >
                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                            Save to Vault
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
