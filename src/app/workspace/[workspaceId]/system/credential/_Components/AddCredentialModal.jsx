'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useModal } from "@/hooks/useModal";
import axios from "@/utils/axios";
import { toast } from "sonner";
import { credentialsTypes } from "../_lib/constants";
import {
    Loader2,
    Shield,
    Key,
    Plus,
    Trash2,
    Database,
    Tag,
    User,
    Activity,
    Zap,
    Sparkles,
    Bot
} from "lucide-react";

const PLATFORM_CONFIG = {
    FACEBOOK: ['accessToken', 'pageId'],
    INSTAGRAM: ['accessToken', 'igUserId'],
    TWITTER: ['apiKey', 'apiSecret', 'accessToken', 'accessSecret'],
    X: ['apiKey', 'apiSecret', 'accessToken', 'accessSecret'],
    LINKEDIN: ['accessToken', 'organizationUrn'],
    WHATSAPP_BROWSER: ['phoneNumber'],
    WHATSAPP_CLOUD: ['accessToken', 'phoneNumberId', 'wabaId'],
    GOOGLE_PLACES: ['apiKey'],
    YOUTUBE: ['apiKey'],
    GMAIL: ['clientId', 'secret'],
    GOOGLE: ['clientId', 'secret'],
    GEMINI: ['apiKey'],
    OPENROUTER: ['apiKey'],
    RESEND: ['apiKey'],
    SUPABASE: ['supabaseUrl', 'supabaseKey'],
};



export const AddCredentialModal = () => {
    const { isOpen, onClose, type, data, activeModals } = useModal();
    const isModalOpen = !!activeModals["addCredential"];
    const modalData = activeModals["addCredential"] || {};
    const { workspaceId, onApply, initialData } = modalData;

    const [isLoading, setIsLoading] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form States
    const [platform, setPlatform] = useState('');
    const [customPlatform, setCustomPlatform] = useState('');
    const [profileName, setProfileName] = useState('');
    const [status, setStatus] = useState('disconnected');
    const [fields, setFields] = useState([{ key: '', value: '' }]);
    const [geminiModel, setGeminiModel] = useState('gemini-2.0-flash');
    const [openRouterModel, setOpenRouterModel] = useState('google/gemini-2.0-flash-exp:free');
    const [credentialType, setCredentialType] = useState(undefined);
    const [activePlatforms, setActivePlatforms] = useState([]);

    const isEdit = !!initialData?.id;

    // Populate form for editing
    useEffect(() => {
        if (isEdit && initialData) {
            const platformKey = initialData.platform?.toUpperCase();
            const isPreset = !!PLATFORM_CONFIG[platformKey];

            setPlatform(isPreset ? platformKey : 'CUSTOM');
            if (!isPreset) setCustomPlatform(initialData.platform || '');

            setProfileName(initialData.profileName || '');
            setStatus(initialData.status || 'disconnected');

            // Map details to fields, excluding profileName and model (handled separately)
            if (initialData.details) {
                // Extract model for Gemini
                if (platformKey === 'GEMINI' && initialData.details.model) {
                    setGeminiModel(initialData.details.model);
                }

                // Extract model for OpenRouter
                if (platformKey === 'OPENROUTER' && initialData.details.model) {
                    setOpenRouterModel(initialData.details.model);
                }

                setCredentialType(initialData.type || undefined);
                const dynamicFields = Object.entries(initialData.details)
                    .filter(([key]) => key !== 'profileName' && key !== 'model')
                    .map(([key, value]) => ({ key, value }));

                setFields(dynamicFields.length > 0 ? dynamicFields : [{ key: '', value: '' }]);
            }
        } else {
            setPlatform('');
            setCustomPlatform('');
            setProfileName('');
            setStatus('disconnected');
            setFields([{ key: '', value: '' }]);
            setGeminiModel('gemini-2.0-flash');
            setCredentialType(undefined);
        }
    }, [isEdit, initialData, isModalOpen]);

    // Handle dynamic platforms based on type
    useEffect(() => {
        const typeData = credentialsTypes.find(t => t.id === credentialType);
        const platformsList = typeData?.plattforms || [];
        setActivePlatforms(platformsList);

        // Reset platform if it's not in the new list and not CUSTOM
        // Only do this if it's not the initial load of an edit modal
        if (platform && platform !== 'CUSTOM') {
            const isPlatformInList = platformsList.some(p => p.toUpperCase() === platform.toUpperCase());
            if (!isPlatformInList && !isEdit) {
                setPlatform('');
            }
        }
    }, [credentialType, isEdit]);

    // Update fields when platform changes (for new credentials)
    const handlePlatformChange = (val) => {
        setPlatform(val);
        if (!isEdit) {
            if (val === 'CUSTOM') {
                setFields([{ key: '', value: '' }]);
                setCustomPlatform('');
            } else {
                const config = PLATFORM_CONFIG[val.toUpperCase()];
                if (config) {
                    setFields(config.map(key => ({ key, value: '' })));
                } else {
                    setFields([{ key: '', value: '' }]);
                }
            }
        }
    };

    const addField = () => {
        setFields([...fields, { key: '', value: '' }]);
    };

    const removeField = (index) => {
        if (fields.length > 1) {
            setFields(fields.filter((_, i) => i !== index));
        }
    };

    const updateField = (index, part, val) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], [part]: val };
        setFields(newFields);
    };

    const onDelete = async () => {
        if (!confirm("Are you sure you want to delete this credential?")) return;

        setIsDeleting(true);
        try {
            await axios.delete(`/api/workspace/${workspaceId}/social/accounts/${initialData.id}`);
            toast.success(`${platform} credentials deleted successfully`);
            onApply?.();
            handleClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete credentials");
        } finally {
            setIsDeleting(false);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const finalPlatform = platform === 'CUSTOM' ? customPlatform : platform;

        if (!finalPlatform) {
            toast.error("Please provide a platform name");
            return;
        }

        const validFields = fields.filter(f => f.key.trim() !== '');
        if (validFields.length === 0) {
            toast.error("Please provide at least one credential key and value");
            return;
        }

        const hasEmptyValues = validFields.some(f => !f.value.trim());
        if (hasEmptyValues) {
            toast.error("All credential fields must have a value");
            return;
        }

        setIsLoading(true);
        try {
            const credentialsObject = {};
            // We still store profileName in JSON for backward compatibility, 
            // but the API also saves it to the'profile'column.
            if (profileName) credentialsObject.profileName = profileName;

            validFields.forEach(f => {
                credentialsObject[f.key.trim()] = f.value;
            });

            // Store selected model for Gemini
            if (finalPlatform.toUpperCase() === 'GEMINI' && geminiModel) {
                credentialsObject.model = geminiModel;
            }

            // Store selected model for OpenRouter
            if (finalPlatform.toUpperCase() === 'OPENROUTER') {
                credentialsObject.model = openRouterModel;
            }

            const payload = {
                platform: finalPlatform.toUpperCase(),
                credentials: credentialsObject,
                profile: profileName,
                status: status,
                type: credentialType,
                environment: initialData?.environment || "PROD",
                expiresAt: initialData?.expiresAt || null
            };

            if (isEdit) {
                await axios.patch(`/api/workspace/${workspaceId}/social/accounts/${initialData.id}`, payload);
                toast.success(`${finalPlatform} credentials updated successfully`);
            } else {
                await axios.post(`/api/workspace/${workspaceId}/social/accounts`, payload);
                toast.success(`${finalPlatform} credentials saved successfully`);
            }

            onApply?.();
            handleClose();
        } catch (error) {
            console.error(error);
            toast.error(isEdit ? "Failed to update credentials" : "Failed to save credentials");
        } finally {
            setIsLoading(false);
            setIsTesting(false);
        }
    };

    const handleClose = () => {
        if (!isEdit) {
            setPlatform('');
            setCustomPlatform('');
            setProfileName('');
            setStatus('connected');
            setFields([{ key: '', value: '' }]);
            setGeminiModel('gemini-2.0-flash');
            setOpenRouterModel('google/gemini-2.0-flash-exp:free');
            setCredentialType(undefined);
            setIsDeleting(false);
        }
        onClose("addCredential");
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className=" bg-background border border-border/100 rounded-md shadow-2xl p-2 ">
                <form onSubmit={onSubmit} className="flex flex-col max-h-[85vh]">
                    <DialogHeader className="p-2 pb-4">
                        <DialogTitle className="text-md font-bold text-foreground flex items-center gap-2">
                            <Database className="text-primary h-5 w-5" /> {isEdit ? "Edit Credentials" : "Add Credentials"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto scrollbar-hide p-2 mr-2 pt-0 space-y-4">
                        <div className="p-4 bg-primary/5 border border-primary/10 rounded-md flex items-start gap-3">
                            <Shield className="text-primary h-5 w-5 mt-0.5 shrink-0" />
                            <p className="text-xs font-bold text-muted-foreground leading-relaxed text-left">
                                Provide the <span className="text-primary font-bold">API credentials</span> for your platform. These will be stored securely and used for multi-channel publishing.
                            </p>
                        </div>

                        {/* Top Info */}
                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground opacity-70 ml-1 flex items-center gap-2">
                                    <Database className="w-3 h-3" /> CREDENTIAL TYPE
                                </label>
                                <Select value={credentialType} onValueChange={setCredentialType} disabled={isLoading}>
                                    <SelectTrigger className="bg-muted/30 border border-primary/20 rounded-md  focus:ring-0.5 focus:ring-primary">
                                        <SelectValue placeholder="Select Credential Type" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-md border-border/20 shadow-2xl">
                                        {credentialsTypes.filter(t => t.id !== 'all').map(t => (
                                            <SelectItem key={t.id} value={t.id} className="">{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground opacity-70 ml-1 flex items-center gap-2">
                                    <Tag className="w-3 h-3" /> PLATFORM
                                </label>
                                <Select value={platform} onValueChange={handlePlatformChange} disabled={isLoading}>
                                    <SelectTrigger className="bg-muted/30 border border-primary/20 rounded-md  focus:ring-0.5 focus:ring-primary">
                                        <SelectValue placeholder="Select Platform" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-md border-border/20 text-sm shadow-2xl">
                                        {activePlatforms.map(p => {
                                            return (
                                                <SelectItem key={p} value={p} className=" capitalize  d">
                                                    {p}
                                                </SelectItem>
                                            );
                                        })}
                                        <SelectItem value="custom" className=" capitalize  d">Custom/Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-left">
                            {platform === 'CUSTOM' ? (
                                <div className="space-y-2 animate-in fade-in slide-in-from-left-2 transition-all">
                                    <label className="text-[10px] font-bold text-primary ml-1 flex items-center gap-2">
                                        <Zap className="w-3 h-3" /> CUSTOM PLATFORM NAME
                                    </label>
                                    <Input
                                        disabled={isLoading}
                                        placeholder="e.g. TIKTOK, REDDIT"
                                        value={customPlatform}
                                        onChange={(e) => setCustomPlatform(e.target.value)}
                                        className="bg-muted/30 border border-primary/20 rounded-md focus:ring-0.5 focus:ring-primary  font-bold text-xs"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground opacity-70 ml-1 flex items-center gap-2">
                                        <User className="w-3 h-3" /> PROFILE NAME
                                    </label>
                                    <Input
                                        disabled={isLoading}
                                        placeholder="e.g. Personal Account"
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                        className="bg-muted/30 border border-primary/20 rounded-md focus:ring-0.5 focus:ring-primary "
                                    />
                                </div>
                            )}

                            {platform === 'CUSTOM' && (
                                <div className="space-y-2 text-left animate-in fade-in slide-in-from-top-2">
                                    <label className="text-[10px] font-bold text-muted-foreground opacity-70 ml-1 flex items-center gap-2">
                                        <User className="w-3 h-3" /> PROFILE NAME
                                    </label>
                                    <Input
                                        disabled={isLoading}
                                        placeholder="e.g. Personal Account"
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                        className="bg-muted/30 border border-primary/20 rounded-md focus:ring-0.5 focus:ring-primary  font-bold"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Gemini Model Selector */}
                        {platform === 'GEMINI' && (
                            <div className="space-y-2 text-left animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-bold text-purple-500 ml-1 flex items-center gap-2  tracking-wider opacity-80">
                                    <Sparkles className="w-3 h-3 text-purple-500" /> GEMINI AI MODEL
                                </label>
                                <Input
                                    disabled={isLoading}
                                    placeholder="e.g. gemini-2.0-flash"
                                    value={geminiModel}
                                    onChange={(e) => setGeminiModel(e.target.value)}
                                    className="bg-muted/30 border border-primary/20 rounded-md focus:ring-0.5 focus:ring-primary  font-bold text-xs"
                                />
                                <p className="text-[9px] text-muted-foreground italic px-1 opacity-70">
                                    Enter specific Gemini model ID (e.g. gemini-2.5-flash)
                                </p>
                            </div>
                        )}

                        {/* OpenRouter Model Selector */}
                        {platform === 'OPENROUTER' && (
                            <div className="space-y-2 text-left animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-bold text-blue-500 ml-1 flex items-center gap-2  tracking-wider opacity-80">
                                    <Bot className="w-3 h-3 text-blue-500" /> OPENROUTER AI MODEL
                                </label>
                                <Input
                                    disabled={isLoading}
                                    placeholder="e.g. google/gemini-2.0-flash-exp:free"
                                    value={openRouterModel}
                                    onChange={(e) => setOpenRouterModel(e.target.value)}
                                    className="bg-muted/30 border border-primary/20 rounded-md focus:ring-0.5 focus:ring-primary  font-bold text-xs"
                                />
                                <p className="text-[9px] text-muted-foreground italic px-1 opacity-70">
                                    Find model IDs at <a href="https://openrouter.ai/models" target="_blank" rel="noreferrer" className="text-blue-500 underline">openrouter.ai/models</a>
                                </p>
                            </div>
                        )}

                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-bold text-muted-foreground opacity-70 ml-1 flex items-center gap-2">
                                <Activity className="w-3 h-3" /> CONNECTION STATUS
                            </label>
                            <Select value={status} onValueChange={setStatus} disabled={isLoading}>
                                <SelectTrigger className="bg-muted/30 border border-primary/20 rounded-md  focus:ring-0.5 focus:ring-primary font-bold text-xs">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-md border-border/20 shadow-2xl">
                                    <SelectItem value="connected" className="font-bold text-[10px] py-3">Connected</SelectItem>
                                    <SelectItem value="disconnected" className="font-bold text-[10px] py-3 text-muted-foreground">Disconnected</SelectItem>
                                    <SelectItem value="error" className="font-bold text-[10px] py-3 text-rose-500">Error / Expired</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Usage Monitor */}
                        {isEdit && (platform === 'GEMINI' || platform === 'OPENROUTER') && initialData?.details?.usage && (
                            <div className="space-y-3 p-4 bg-muted/20 border border-border/50 rounded-md animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-muted-foreground opacity-70 flex items-center gap-2">
                                        <Activity className="w-3 h-3" /> USAGE MONITOR
                                    </label>
                                    <span className="text-[9px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full ">
                                        Today
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-xl font-black text-foreground">{initialData.details.usage.dailyCount || 0}</span>
                                            <span className="text-[9px] text-muted-foreground font-bold  tracking-tighter">Requests Made Today</span>
                                        </div>
                                        {initialData.details.usage.quotaReached && (
                                            <div className="flex items-center gap-1.5 text-rose-500 animate-pulse">
                                                <Zap className="w-3.5 h-3.5 fill-rose-500" />
                                                <span className="text-[10px] font-black  italic">Quota Reached</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${initialData.details.usage.quotaReached ? 'bg-rose-500' : 'bg-primary'}`}
                                            style={{ width: `${Math.min(((initialData.details.usage.dailyCount || 0) / 20) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-[9px] text-muted-foreground italic opacity-60">
                                        * Tracking resets every 24 hours. (Estimated limit: ~20/day)
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Dynamic Fields */}
                        <div className="space-y-4 text-left">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-muted-foreground opacity-70 ml-1 flex items-center gap-2">
                                    <Key className="w-3 h-3" /> CREDENTIAL FIELDS
                                </label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addField}
                                    className="text-[9px] font-bold rounded-md"
                                >
                                    <Plus className="w-3 h-3 mr-1" /> ADD FIELD
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={index} className="flex gap-2 items-end group animate-in slide-in-from-top-2 duration-300 min-w-0 w-full overflow-hidden">
                                        <div className="flex-1 space-y-1 min-w-0">
                                            <Input
                                                placeholder="Key (e.g. api_key)"
                                                value={field.key}
                                                onChange={(e) => updateField(index, 'key', e.target.value)}
                                                className="bg-muted/30 border border-primary/20 rounded-md focus:ring-0.5 focus:ring-primary text-[10px] font-bold"
                                            />
                                        </div>
                                        <div className="flex-[3] space-y-1 min-w-0">
                                            <Input
                                                placeholder="Value"
                                                value={field.value}
                                                onChange={(e) => updateField(index, 'value', e.target.value)}
                                                className="bg-muted/30 border border-primary/20 rounded-md focus:ring-0.5 focus:ring-primary text-[10px] font-mono"
                                            />
                                        </div>
                                        {fields.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeField(index)}
                                                className="w-10 text-muted-foreground/30 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-4 bg-muted/10 border-t border-border/10 flex flex-wrap items-center justify-end gap-2 sm:gap-4">
                        {isEdit && (
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={isLoading || isTesting || isDeleting}
                                onClick={onDelete}
                                className="px-6 rounded-md text-sm bg-rose-500/10  hover:bg-rose-500 hover:text-white border border-rose-500/20"
                            >
                                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-1.5" />}
                                {isDeleting ? "Deleting..." : "Delete Connection"}
                            </Button>
                        )}

                        <div className="flex-1" />

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="px-6 rounded-md text-sm"
                        >
                            Cancel
                        </Button>

                        {isEdit && (
                            <Button
                                type="button"
                                disabled={isTesting || isLoading}
                                onClick={async () => {
                                    setIsTesting(true);
                                    const toastId = toast.loading(`Testing ${platform} connection...`);
                                    try {
                                        const credentialsObject = {};
                                        fields.forEach(f => {
                                            if (f.key.trim()) credentialsObject[f.key.trim()] = f.value;
                                        });
                                        if (profileName) credentialsObject.profileName = profileName;
                                        // Include selected Gemini model so the backend tests with the right one
                                        if (platform === 'GEMINI' && geminiModel) {
                                            credentialsObject.model = geminiModel;
                                        }

                                        // Include selected OpenRouter model
                                        if (platform === 'OPENROUTER') {
                                            credentialsObject.model = openRouterModel;
                                        }

                                        const finalPlatform = platform === 'CUSTOM' ? customPlatform : platform;
                                        const testId = initialData?.id || 'new';

                                        const res = await axios.post(`/api/workspace/${workspaceId}/social/accounts/${testId}/test`, {
                                            credentials: credentialsObject,
                                            platform: finalPlatform.toUpperCase()
                                        });
                                        if (res.data.success) {
                                            toast.success(res.data.message, { id: toastId });
                                        } else {
                                            const errorData = res.data.data;
                                            console.error("[TEST_FAILED]", res.data);
                                            const detailedMsg = res.data.message || "Connection failed";
                                            const description = errorData?.message || (errorData?.error?.message) || (errorData?.serviceErrorCode ? `Code: ${errorData.serviceErrorCode}` : undefined);

                                            toast.error(detailedMsg, {
                                                id: toastId,
                                                description: description
                                            });
                                        }
                                    } catch (err) {
                                        toast.error(err?.response?.data?.message || 'Test failed', { id: toastId });
                                    } finally {
                                        setIsTesting(false);
                                    }
                                }}
                                className="px-6 rounded-md text-sm border border-amber-500/30  hover:bg-amber-500/10 transition-all"
                            >
                                {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                                Test Connection
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={isLoading || isTesting}
                            className="px-8 bg-primary hover:bg-primary/90  rounded-md font-semibold  shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : isEdit ? "Update Credentials" : "Save Credentials"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
