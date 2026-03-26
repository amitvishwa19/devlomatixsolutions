'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '../_provider/SettingProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Globe, LayoutGrid, Palette, Image as ImageIcon, UploadCloud, Info } from 'lucide-react';
import { toast } from 'sonner';

export const GeneralSettings = () => {
    const { settings, updateSettings, saving } = useSettings();
    
    const [localGeneral, setLocalGeneral] = useState({
        name: '',
        description: '',
        imageUrl: ''
    });

    const [localBranding, setLocalBranding] = useState({
        primaryColor: '#3b82f6',
        logoUrl: '',
        appName: '',
        appDescription: ''
    });

    useEffect(() => {
        if (settings?.general) {
            setLocalGeneral({
                name: settings.general.name || '',
                description: settings.general.description || '',
                imageUrl: settings.general.imageUrl || ''
            });
        }
        if (settings?.branding) {
            setLocalBranding({
                primaryColor: settings.branding.primaryColor || '#3b82f6',
                logoUrl: settings.branding.logoUrl || '',
                appName: settings.branding.appName || '',
                appDescription: settings.branding.appDescription || ''
            });
        }
    }, [settings]);

    const handleSaveGeneral = () => {
        updateSettings({ general: localGeneral });
    };

    const handleSaveBranding = () => {
        updateSettings({ branding: localBranding });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Workspace Identity */}
            <Card className="rounded-xl border border-border shadow-soft bg-card/100">
                <CardHeader>
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-2 border border-primary/20">
                        <LayoutGrid className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">Workspace Identity</CardTitle>
                    <CardDescription className="text-sm font-medium opacity-70">
                        Customize how your workspace appears to you and your team.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-3">
                        <Label className="text-[10px] font-bold tracking-widest uppercase opacity-70">Workspace Name</Label>
                        <Input 
                            value={localGeneral.name}
                            onChange={(e) => setLocalGeneral(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter workspace name"
                            className="rounded-xl border border-border h-11 bg-background shadow-inner font-medium"
                        />
                    </div>
                    <div className="grid gap-3">
                        <Label className="text-[10px] font-bold tracking-widest uppercase opacity-70">Description</Label>
                        <Textarea 
                            rows={2}
                            value={localGeneral.description}
                            onChange={(e) => setLocalGeneral(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe what this workspace is for..."
                            className="rounded-xl border border-border bg-background shadow-inner font-medium resize-none"
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t border-border/10 bg-muted/20 p-6 flex justify-end">
                    <Button 
                        onClick={handleSaveGeneral} 
                        disabled={saving}
                        className="rounded-xl font-bold px-8 shadow-soft bg-primary hover:bg-primary/90"
                    >
                        {saving ? "Saving..." : "Save Workspace Identity"}
                    </Button>
                </CardFooter>
            </Card>

            {/* App Identity */}
            <Card className="rounded-xl border border-border shadow-soft bg-card/100">
                <CardHeader>
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-2 border border-indigo-500/20">
                        <LayoutGrid className="w-5 h-5 text-indigo-500" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">App Identity</CardTitle>
                    <CardDescription className="text-sm font-medium opacity-70">
                        Define how your platform is identified in headers, footers, and system messages.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-3">
                        <Label className="text-[10px] font-bold tracking-widest uppercase opacity-70">App Name</Label>
                        <Input 
                            value={localBranding.appName}
                            onChange={(e) => setLocalBranding(prev => ({ ...prev, appName: e.target.value }))}
                            placeholder="e.g. HealthFine Platform"
                            className="rounded-xl border border-border h-11 bg-background shadow-inner font-medium"
                        />
                    </div>
                    <div className="grid gap-3">
                        <Label className="text-[10px] font-bold tracking-widest uppercase opacity-70">App Description</Label>
                        <Input 
                            value={localBranding.appDescription}
                            onChange={(e) => setLocalBranding(prev => ({ ...prev, appDescription: e.target.value }))}
                            placeholder="A brief tagline for your app"
                            className="rounded-xl border border-border h-11 bg-background shadow-inner font-medium"
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t border-border/10 bg-muted/20 p-6 flex justify-end">
                    <Button 
                        onClick={handleSaveBranding} 
                        disabled={saving}
                        className="rounded-xl font-bold px-8 shadow-soft bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {saving ? "Saving..." : "Save App Identity"}
                    </Button>
                </CardFooter>
            </Card>

            {/* Visual Identity */}
            <Card className="rounded-xl border border-border shadow-soft bg-card/100">
                <CardHeader>
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-2 border border-blue-500/20">
                        <Palette className="w-5 h-5 text-blue-500" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">Visual Identity</CardTitle>
                    <CardDescription className="text-sm font-medium opacity-70">
                        Set your brand color and logo to personalize your workspace experience.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-32 h-32 bg-muted/30 rounded-2xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-primary/40 transition-colors shrink-0 overflow-hidden">
                            {localBranding.logoUrl ? (
                                <img src={localBranding.logoUrl} alt="Logo" className="w-full h-full object-contain p-4" />
                            ) : (
                                <>
                                    <UploadCloud className="w-8 h-8 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                                    <span className="text-[10px] font-bold text-muted-foreground/40 group-hover:text-primary/60 tracking-widest uppercase">Upload</span>
                                </>
                            )}
                        </div>
                        <div className="flex-1 space-y-6 w-full">
                            <div className="grid gap-3">
                                <Label className="text-[10px] font-bold tracking-widest uppercase opacity-70">Primary Workspace Color</Label>
                                <div className="flex gap-4 items-center">
                                    <div 
                                        className="w-11 h-11 rounded-xl shadow-soft border-2 border-background"
                                        style={{ backgroundColor: localBranding.primaryColor }}
                                    />
                                    <Input 
                                        type="text"
                                        value={localBranding.primaryColor}
                                        onChange={(e) => setLocalBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                                        className="rounded-xl border border-border h-11 bg-background shadow-inner font-mono font-bold text-xs flex-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t border-border/10 bg-muted/20 p-6 flex justify-end">
                    <Button 
                        onClick={handleSaveBranding} 
                        disabled={saving}
                        className="rounded-xl font-bold px-8 shadow-soft bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {saving ? "Saving..." : "Save Visual Identity"}
                    </Button>
                </CardFooter>
            </Card>

            {/* Workspace URL */}
            <Card className="rounded-xl border border-border shadow-soft bg-card/100">
                <CardHeader>
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-2 border border-emerald-500/20">
                        <Globe className="w-5 h-5 text-emerald-500" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">Workspace URL</CardTitle>
                    <CardDescription className="text-sm font-medium opacity-70">
                        Your workspace is accessible at the following permanent address.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-xl border border-border/40">
                        <code className="text-[11px] font-black tracking-tight text-foreground flex-1">
                            {typeof window !== 'undefined' ? `${window.location.host}/workspace/${settings?.general?.inviteCode || '...'}` : 'Loading...'}
                        </code>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl text-[10px] font-bold tracking-widest h-8"
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.host + '/workspace/' + settings.general.inviteCode);
                                toast.success("Copied to clipboard");
                            }}
                        >
                            Copy Link
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 flex gap-4 items-start">
                <div className="p-2 bg-blue-500/10 rounded-xl mt-0.5">
                    <Info className="w-4 h-4 text-blue-500" />
                </div>
                <div className="space-y-1">
                    <p className="text-[11px] font-bold text-blue-600 tracking-wide uppercase">Audit History</p>
                    <p className="text-xs text-blue-500/80 font-medium">
                        Workspace general identity changes are logged in the System Logs for security audit purposes.
                    </p>
                </div>
            </div>
        </div>
    );
};
