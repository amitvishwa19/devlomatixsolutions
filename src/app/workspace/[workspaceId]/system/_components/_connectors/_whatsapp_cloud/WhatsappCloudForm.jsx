'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Trash2,
    Zap,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    testWhatsAppCloudAction,
    saveWhatsAppCloudAction,
    deleteWhatsAppCloudAction
} from './_actions/whatsappActions';

export default function WhatsappCloudForm({ initialData, onSuccess }) {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [isTesting, setIsTesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        profileName: initialData?.profileName || '',
        accessToken: initialData?.details?.accessToken || '',
        phoneNumberId: initialData?.details?.phoneNumberId || '',
        wabaId: initialData?.details?.wabaId || '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                profileName: initialData.profileName || '',
                accessToken: initialData.details?.accessToken || '',
                phoneNumberId: initialData.details?.phoneNumberId || '',
                wabaId: initialData.details?.wabaId || '',
            });
        }
    }, [initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isFormValid = formData.profileName && formData.accessToken && formData.phoneNumberId && formData.wabaId;

    const handleTestConnection = async () => {
        if (!workspaceId) return;
        setIsTesting(true);
        const toastId = toast.loading('Testing WhatsApp Cloud connection...');

        try {
            const result = await testWhatsAppCloudAction(workspaceId, initialData?.id || 'new', {
                accessToken: formData.accessToken,
                phoneNumberId: formData.phoneNumberId,
                wabaId: formData.wabaId
            });

            if (result.success) {
                toast.success(result.message || "Connection successful", { id: toastId });
                onSuccess?.();
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
        const toastId = toast.loading('Saving WhatsApp Cloud credentials...');

        try {
            const result = await saveWhatsAppCloudAction(workspaceId, initialData?.id, formData);

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
        if (!confirm('Are you sure you want to delete WhatsApp Cloud credentials?')) return;

        setIsDeleting(true);
        try {
            const result = await deleteWhatsAppCloudAction(workspaceId, initialData.id);
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
                    <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Connection Name</Label>
                    <Input
                        placeholder="e.g. My Marketing WhatsApp"
                        value={formData.profileName}
                        onChange={(e) => handleChange('profileName', e.target.value)}
                        className=" border-white/10 text-xs h-9 focus:border-primary/50"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Phone Number ID</Label>
                    <Input
                        placeholder="10923..."
                        value={formData.phoneNumberId}
                        onChange={(e) => handleChange('phoneNumberId', e.target.value)}
                        className=" border-white/10 text-xs h-9 focus:border-primary/50"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">WhatsApp Business Account ID (WABA ID)</Label>
                    <Input
                        placeholder="12345..."
                        value={formData.wabaId}
                        onChange={(e) => handleChange('wabaId', e.target.value)}
                        className=" border-white/10 text-xs h-9 focus:border-primary/50"
                    />
                </div>
                <div className="space-y-1.5  md:col-span-2">
                    <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Access Token</Label>
                    <Input
                        type="password"
                        placeholder="EAAB..."
                        value={formData.accessToken}
                        onChange={(e) => handleChange('accessToken', e.target.value)}
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
                        className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10   h-8"
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
