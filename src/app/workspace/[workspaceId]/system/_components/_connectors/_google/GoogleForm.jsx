'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Trash2,
    Zap,
    RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    testGoogleAction,
    saveGoogleAction,
    deleteGoogleAction
} from './_actions/googleActions';

export default function GoogleForm({ initialData, onSuccess }) {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [isTesting, setIsTesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        profileName: initialData?.profileName || '',
        apiKey: initialData?.details?.apiKey || '',
        searchEngineId: initialData?.details?.searchEngineId || '',
        accessToken: initialData?.details?.accessToken || '',
        clientId: initialData?.details?.clientId || '',
        clientSecret: initialData?.details?.clientSecret || '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                profileName: initialData.profileName || '',
                apiKey: initialData.details?.apiKey || '',
                searchEngineId: initialData.details?.searchEngineId || '',
                accessToken: initialData.details?.accessToken || '',
                clientId: initialData.details?.clientId || '',
                clientSecret: initialData.details?.clientSecret || '',
            });
        }
    }, [initialData]);

    useEffect(() => {
        // Handle successful connection from OAuth redirect
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('googleConnect') === 'success') {
            toast.success('Google account connected successfully!');
            // Clean up URL
            const url = new URL(window.location);
            url.searchParams.delete('googleConnect');
            window.history.replaceState({}, '', url);
            onSuccess?.();
        }
    }, []);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isFormValid = formData.profileName && (formData.apiKey || formData.accessToken || (formData.clientId && formData.clientSecret));

    const handleTestConnection = async () => {
        if (!workspaceId) return;
        setIsTesting(true);
        const toastId = toast.loading("Testing Google connection...");

        try {
            const result = await testGoogleAction(workspaceId, initialData?.id || 'new', formData);

            if (result.success) {
                const info = result.data?.email || result.data?.profileName || result.data?.clientId || result.message;
                const userMsg = result.data?.email ? `Connected as ${result.data.email}` : `Success: ${info}`;
                toast.success(userMsg, { id: toastId });
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
            const result = await saveGoogleAction(workspaceId, initialData?.id, formData);

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
            const result = await deleteGoogleAction(workspaceId, initialData.id);
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
                    <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Account Name</Label>
                    <Input
                        placeholder="e.g. Google Cloud Project"
                        value={formData.profileName}
                        onChange={(e) => handleChange('profileName', e.target.value)}
                        className=" border-white/10 text-xs h-9 focus:border-primary/50"
                    />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Google API Key</Label>
                    <Input
                        type="password"
                        placeholder="AIzaSy..."
                        value={formData.apiKey}
                        onChange={(e) => handleChange('apiKey', e.target.value)}
                        className=" border-white/10 text-xs h-9 focus:border-primary/50"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Client ID</Label>
                    <Input
                        placeholder="0123-abc.apps.googleusercontent.com"
                        value={formData.clientId}
                        onChange={(e) => handleChange('clientId', e.target.value)}
                        className=" border-white/10 text-xs h-9 focus:border-primary/50"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Client Secret</Label>
                    <Input
                        type="password"
                        placeholder="GOCSPX-..."
                        value={formData.clientSecret}
                        onChange={(e) => handleChange('clientSecret', e.target.value)}
                        className=" border-white/10 text-xs h-9 focus:border-primary/50"
                    />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Search Engine ID (CX) - Optional</Label>
                    <Input
                        placeholder="0123456789..."
                        value={formData.searchEngineId}
                        onChange={(e) => handleChange('searchEngineId', e.target.value)}
                        className=" border-white/10 text-xs h-9 focus:border-primary/50"
                    />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">OAuth Access Token (Alternative)</Label>
                    <Input
                        type="password"
                        placeholder="ya29.a0AfH6N..."
                        value={formData.accessToken}
                        onChange={(e) => handleChange('accessToken', e.target.value)}
                        className=" border-white/10 text-xs h-9 focus:border-primary/50"
                    />
                </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
                <Button 
                    onClick={() => {
                        const returnTo = window.location.pathname;
                        window.location.href = `/api/connect/google?workspaceId=${workspaceId}&returnTo=${encodeURIComponent(returnTo)}`;
                    }}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 h-10 transition-all group"
                >
                    <div className="p-1 bg-white rounded-sm group-hover:scale-110 transition-transform">
                        <svg width="14" height="14" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                    </div>
                    <span className="text-sm font-medium">Connect with Google Account</span>
                </Button>

                <div className="flex items-center gap-2">
                    <Button
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
