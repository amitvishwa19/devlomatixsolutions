'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
    Settings2,
    ShieldAlert,
    Smartphone,
    QrCode,
    Power,
    Save,
    CheckCircle2,
    AlertCircle,
    Sliders,
    Bell,
    Globe,
    RotateCcw,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
    getKonnectSettingsAction,
    saveKonnectSettingsAction
} from '../_actions/settings-actions';
import { disconnectWhatsAppAction } from '../_actions/connection-actions';
import WhatsAppConnectionModal from '../_components/WhatsAppConnectionModal';

export default function KonnectSettingsPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);

    // Settings state
    const [connectionStatus, setConnectionStatus] = useState({ status: 'DISCONNECTED' });
    const [settings, setSettings] = useState({
        minDelaySeconds: 3,
        maxDelaySeconds: 8,
        simulateTyping: true,
        batchCooldownMinutes: 2,
        batchSize: 50,
        autoReadIncoming: false,
        dailySafetyLimit: 500,
        webhookUrl: ''
    });

    const loadSettings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getKonnectSettingsAction(workspaceId);
            if (res.success) {
                setSettings(res.settings);
                setConnectionStatus(res.connectionStatus);
            } else {
                toast.error(res.error || "Failed to load settings");
            }
        } catch (e) {
            toast.error("Network error loading settings");
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await saveKonnectSettingsAction(workspaceId, settings);
            if (res.success) {
                toast.success("Anti-ban and safety settings saved!");
            } else {
                toast.error(res.error || "Failed to save settings");
            }
        } catch (e) {
            toast.error("Error saving settings");
        } finally {
            setSaving(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm("Are you sure you want to disconnect this WhatsApp session? You will need to scan QR again.")) return;
        setDisconnecting(true);
        try {
            const res = await disconnectWhatsAppAction(workspaceId);
            if (res.success) {
                toast.success("WhatsApp device session disconnected");
                setConnectionStatus({ status: 'DISCONNECTED' });
            } else {
                toast.error(res.error || "Disconnect failed");
            }
        } catch (e) {
            toast.error("Error disconnecting session");
        } finally {
            setDisconnecting(false);
        }
    };

    if (loading) {
        return (
            <div className="py-24 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-500" />
                Loading device settings and anti-ban safeguards...
            </div>
        );
    }

    const isConnected = connectionStatus?.status === 'CONNECTED';

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-emerald-500" />
                        Device & Anti-Ban Safeguard Settings
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Configure WhatsApp multi-device pairing credentials, jitter delays, typing simulations, and safety thresholds.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        <span>Save Settings</span>
                    </Button>
                </div>
            </div>

            {/* Device Pairing Hero Card */}
            <Card className="bg-card/40 border-border/40 backdrop-blur-sm p-4 rounded-[16px]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${isConnected ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                            <Smartphone className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-foreground">
                                    WhatsApp Multi-Device Link
                                </h3>
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] px-1.5 py-0 font-medium ${
                                        isConnected
                                            ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5'
                                            : 'border-amber-500/30 text-amber-500 bg-amber-500/5'
                                    }`}
                                >
                                    {isConnected ? 'LIVE CONNECTED' : 'DISCONNECTED'}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {isConnected
                                    ? `Linked Phone: +${connectionStatus.phoneNumber || 'Ready'} (Multi-Device Baileys Protocol)`
                                    : 'No phone linked. Click below to display the pairing QR code.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isConnected ? (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setIsQrModalOpen(true)}
                                    className="h-8 text-xs gap-1.5 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                                >
                                    <QrCode className="h-3.5 w-3.5" />
                                    <span>Pairing Status</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={disconnecting}
                                    onClick={handleDisconnect}
                                    className="h-8 text-xs gap-1.5"
                                >
                                    {disconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Power className="h-3.5 w-3.5" />}
                                    <span>Disconnect</span>
                                </Button>
                            </>
                        ) : (
                            <Button
                                size="sm"
                                onClick={() => setIsQrModalOpen(true)}
                                className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <QrCode className="h-3.5 w-3.5" />
                                <span>Scan QR Code</span>
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left 6 cols: Anti-Ban Pacing & Human Emulation */}
                    <div className="lg:col-span-6 space-y-4">
                        <Card className="bg-card/40 border-border/40 backdrop-blur-sm p-4 rounded-[16px] space-y-4">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 text-emerald-500" />
                                <h3 className="text-xs font-semibold text-foreground">
                                    Anti-Ban Pacing & Jitter Controls
                                </h3>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Prevent WhatsApp automated spam detection by inserting organic human-like delay intervals between messages.
                            </p>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="space-y-1">
                                    <Label className="text-xs">Min Delay (Seconds)</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={settings.minDelaySeconds}
                                        onChange={(e) => setSettings(p => ({ ...p, minDelaySeconds: Number(e.target.value) }))}
                                        className="h-8 text-xs font-mono"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Max Delay (Seconds)</Label>
                                    <Input
                                        type="number"
                                        min={2}
                                        max={60}
                                        value={settings.maxDelaySeconds}
                                        onChange={(e) => setSettings(p => ({ ...p, maxDelaySeconds: Number(e.target.value) }))}
                                        className="h-8 text-xs font-mono"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-card/20">
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-semibold">Simulate Human Typing</Label>
                                    <p className="text-[10px] text-muted-foreground">
                                        Broadcasts a WhatsApp "typing..." presence packet before delivering message text.
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.simulateTyping}
                                    onCheckedChange={(val) => setSettings(p => ({ ...p, simulateTyping: val }))}
                                />
                            </div>

                            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-card/20">
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-semibold">Auto-Read Incoming Messages</Label>
                                    <p className="text-[10px] text-muted-foreground">
                                        Send blue double checkmarks immediately when a customer message is received.
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.autoReadIncoming}
                                    onCheckedChange={(val) => setSettings(p => ({ ...p, autoReadIncoming: val }))}
                                />
                            </div>
                        </Card>
                    </div>

                    {/* Right 6 cols: Batch Cooldown & Safety Caps */}
                    <div className="lg:col-span-6 space-y-4">
                        <Card className="bg-card/40 border-border/40 backdrop-blur-sm p-4 rounded-[16px] space-y-4">
                            <div className="flex items-center gap-2">
                                <Sliders className="h-4 w-4 text-blue-500" />
                                <h3 className="text-xs font-semibold text-foreground">
                                    Batch Cooldown & Volume Limits
                                </h3>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Split large broadcasts into batches with mandatory resting periods to mimic natural personal usage.
                            </p>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="space-y-1">
                                    <Label className="text-xs">Batch Size (Messages)</Label>
                                    <Input
                                        type="number"
                                        min={10}
                                        max={500}
                                        value={settings.batchSize}
                                        onChange={(e) => setSettings(p => ({ ...p, batchSize: Number(e.target.value) }))}
                                        className="h-8 text-xs font-mono"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Cooldown Pause (Minutes)</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={30}
                                        value={settings.batchCooldownMinutes}
                                        onChange={(e) => setSettings(p => ({ ...p, batchCooldownMinutes: Number(e.target.value) }))}
                                        className="h-8 text-xs font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Daily Safety Broadcast Threshold</Label>
                                <Input
                                    type="number"
                                    min={50}
                                    max={2000}
                                    value={settings.dailySafetyLimit}
                                    onChange={(e) => setSettings(p => ({ ...p, dailySafetyLimit: Number(e.target.value) }))}
                                    className="h-8 text-xs font-mono"
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Recommended: Keep under 500/day for numbers younger than 3 months.
                                </p>
                            </div>

                            <div className="space-y-1 pt-2 border-t border-border/30">
                                <Label className="text-xs flex items-center gap-1.5">
                                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                                    Outbound Webhook URL (Optional)
                                </Label>
                                <Input
                                    type="url"
                                    placeholder="https://api.yourdomain.com/whatsapp-incoming"
                                    value={settings.webhookUrl}
                                    onChange={(e) => setSettings(p => ({ ...p, webhookUrl: e.target.value }))}
                                    className="h-8 text-xs font-mono"
                                />
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button
                        type="submit"
                        disabled={saving}
                        className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        <span>Save All Configuration</span>
                    </Button>
                </div>
            </form>

            <WhatsAppConnectionModal
                isOpen={isQrModalOpen}
                onClose={() => setIsQrModalOpen(false)}
                workspaceId={workspaceId}
                initialStatus={isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                onConnected={() => {
                    setConnectionStatus({ status: 'CONNECTED' });
                    loadSettings();
                }}
            />
        </div>
    );
}
