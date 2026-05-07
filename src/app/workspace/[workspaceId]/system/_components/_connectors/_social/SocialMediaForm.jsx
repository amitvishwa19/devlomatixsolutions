'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Trash2,
    Zap,
    RefreshCw,
    Facebook,
    Twitter,
    Linkedin,
    Instagram,
    Youtube,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    testSocialAction,
    saveSocialAction,
    deleteSocialAction
} from './_actions/socialActions';

const SOCIAL_PLATFORMS = [
    { id: 'FACEBOOK', name: 'Facebook', icon: Facebook },
    { id: 'INSTAGRAM', name: 'Instagram', icon: Instagram },
    { id: 'TWITTER', name: 'X / Twitter', icon: Twitter },
    { id: 'LINKEDIN', name: 'LinkedIn', icon: Linkedin },
    { id: 'YOUTUBE', name: 'YouTube', icon: Youtube },
];

export default function SocialMediaForm({ initialData, onSuccess }) {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [isTesting, setIsTesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [platform, setPlatform] = useState(initialData?.platform || 'FACEBOOK');
    const [formData, setFormData] = useState({
        profileName: initialData?.profileName || '',
        apiKey: initialData?.details?.apiKey || initialData?.details?.accessToken || initialData?.details?.token || '',
        apiSecret: initialData?.details?.apiSecret || initialData?.details?.pageId || initialData?.details?.secret || '',
    });

    useEffect(() => {
        if (initialData) {
            setPlatform(initialData.platform);
            setFormData({
                profileName: initialData.profileName || '',
                apiKey: initialData.details?.apiKey || initialData.details?.accessToken || initialData.details?.token || '',
                apiSecret: initialData.details?.apiSecret || initialData.details?.pageId || initialData.details?.secret || '',
            });
        }
    }, [initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isFormValid = formData.profileName && formData.apiKey && (platform === 'TWITTER' || platform === 'LINKEDIN' || platform === 'YOUTUBE' ? true : formData.apiSecret);

    const handleTestConnection = async () => {
        if (!workspaceId) return;
        setIsTesting(true);
        const toastId = toast.loading(`Testing ${platform} connection...`);

        try {
            const result = await testSocialAction(workspaceId, initialData?.id || 'new', platform, {
                apiKey: formData.apiKey,
                apiSecret: formData.apiSecret
            });

            if (result.success) {
                toast.success(result.message || "Connection successful", { id: toastId });
            } else {
                toast.error(result.message || "Connection failed", { id: toastId });
            }
        } catch (err) {
            toast.error(err?.message || 'Test failed', { id: toastId });
        } finally {
            setIsTesting(false);
        }
    };

    const handleSave = async () => {
        if (!workspaceId) return;
        setIsSaving(true);
        const toastId = toast.loading('Saving credentials...');

        try {
            const result = await saveSocialAction(workspaceId, initialData?.id, platform, formData);

            if (result.success) {
                toast.success('Credentials saved successfully', { id: toastId });
                onSuccess?.();
            } else {
                toast.error(result.message || "Failed to save credentials", { id: toastId });
            }
        } catch (error) {
            toast.error("An error occurred while saving", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData?.id || !workspaceId) return;
        if (!confirm('Are you sure you want to delete these credentials?')) return;

        setIsDeleting(true);
        try {
            const result = await deleteSocialAction(workspaceId, initialData.id);
            if (result.success) {
                toast.success('Credentials deleted');
                onSuccess?.();
            } else {
                toast.error(result.message || "Failed to delete credential");
            }
        } catch (e) {
            toast.error("An error occurred while deleting");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Platform</Label>
                    <Select value={platform} onValueChange={setPlatform} disabled={!!initialData}>
                        <SelectTrigger className="border-white/10 text-xs h-9 focus:ring-0">
                            <SelectValue placeholder="Select Platform" />
                        </SelectTrigger>
                        <SelectContent>
                            {SOCIAL_PLATFORMS.map((p) => (
                                <SelectItem key={p.id} value={p.id} className="text-xs">
                                    <div className="flex items-center gap-2">
                                        <p.icon className="w-3.5 h-3.5" />
                                        {p.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Account Name</Label>
                    <Input
                        placeholder="e.g. Company Facebook Page"
                        value={formData.profileName}
                        onChange={(e) => handleChange('profileName', e.target.value)}
                        className=" border-white/10 text-xs h-9 focus:border-primary/50"
                    />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">
                        {platform === 'FACEBOOK' ? 'Page Access Token' : 
                         platform === 'INSTAGRAM' ? 'Instagram Access Token' : 
                         platform === 'LINKEDIN' ? 'LinkedIn Access Token' : 'API Key / Access Token'}
                    </Label>
                    <Input
                        type="password"
                        placeholder={platform === 'FACEBOOK' || platform === 'INSTAGRAM' || platform === 'LINKEDIN' ? 'AQ...' : 'Enter key or token'}
                        value={formData.apiKey}
                        onChange={(e) => handleChange('apiKey', e.target.value)}
                        className=" border-white/10 text-xs h-9 focus:border-primary/50"
                    />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">
                        {platform === 'FACEBOOK' ? 'Page ID' : 
                         platform === 'INSTAGRAM' ? 'Instagram User ID' : 
                         platform === 'LINKEDIN' ? 'Organization URN (Optional)' : 'API Secret (Optional)'}
                    </Label>
                    <Input
                        type={platform === 'FACEBOOK' || platform === 'INSTAGRAM' || platform === 'LINKEDIN' ? 'text' : 'password'}
                        placeholder={platform === 'FACEBOOK' || platform === 'INSTAGRAM' ? '123456789...' : 
                                     platform === 'LINKEDIN' ? 'urn:li:organization:12345' : 'Enter secret if required'}
                        value={formData.apiSecret}
                        onChange={(e) => handleChange('apiSecret', e.target.value)}
                        className=" border-white/10 text-xs h-9 focus:border-primary/50"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between pt-2">
                {initialData && (
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={isDeleting}
                        onClick={handleDelete}
                        className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 h-8"
                    >
                        {isDeleting ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-1.5" />}
                        Remove Connection
                    </Button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!isFormValid || isTesting || isSaving}
                        onClick={handleTestConnection}
                        className=" border-white/10"
                    >
                        {isTesting ? <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" /> : <Zap className="w-3 h-3 mr-1.5" />}
                        Test Connection
                    </Button>
                    <Button
                        size="sm"
                        variant="default"
                        disabled={!isFormValid || isSaving}
                        onClick={handleSave}
                        className=" px-4"
                    >
                        {isSaving ? <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" /> : null}
                        {initialData ? 'Update Settings' : 'Save Connection'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
