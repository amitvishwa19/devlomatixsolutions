'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSettings } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
    LayoutGrid, 
    Palette, 
    UploadCloud, 
    Info, 
    Loader2, 
    Sparkles, 
    Facebook, 
    Twitter, 
    Instagram, 
    Linkedin, 
    Youtube, 
    Share2, 
    Github,
    Eye,
    Check,
    RotateCcw,
    Sun,
    Moon,
    Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { StickySaveBar } from './StickySaveBar';

const COLOR_PRESETS = [
    { name: 'Royal Blue', hex: '#3b82f6' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Violet', hex: '#8b5cf6' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Cyan', hex: '#06b6d4' },
    { name: 'Indigo', hex: '#6366f1' },
    { name: 'Fuchsia', hex: '#d946ef' }
];

export const GeneralSettings = () => {
    const { settings, updateSettings, saving } = useSettings();
    const lightFileInputRef = useRef(null);
    const darkFileInputRef = useRef(null);
    const [uploadingMode, setUploadingMode] = useState(null); // 'light' | 'dark' | null
    const [previewTheme, setPreviewTheme] = useState('dark');

    const [localGeneral, setLocalGeneral] = useState({
        name: '',
        description: '',
        imageUrl: ''
    });

    const [localBranding, setLocalBranding] = useState({
        primaryColor: '#3b82f6',
        logoUrl: '',
        logoLightUrl: '',
        logoDarkUrl: '',
        appName: '',
        appDescription: '',
        socialLinks: {
            facebook: { url: '', active: false },
            twitter: { url: '', active: false },
            instagram: { url: '', active: false },
            linkedin: { url: '', active: false },
            youtube: { url: '', active: false },
            github: { url: '', active: false }
        }
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
                logoLightUrl: settings.branding.logoLightUrl || settings.branding.lightLogoUrl || '',
                logoDarkUrl: settings.branding.logoDarkUrl || settings.branding.darkLogoUrl || '',
                appName: settings.branding.appName || '',
                appDescription: settings.branding.appDescription || '',
                socialLinks: settings.branding.socialLinks || {
                    facebook: { url: '', active: false },
                    twitter: { url: '', active: false },
                    instagram: { url: '', active: false },
                    linkedin: { url: '', active: false },
                    youtube: { url: '', active: false },
                    github: { url: '', active: false }
                }
            });
        }
    }, [settings]);

    // Check dirty state
    const isDirty = useMemo(() => {
        if (!settings) return false;
        const generalChanged = 
            localGeneral.name !== (settings?.general?.name || '') ||
            localGeneral.description !== (settings?.general?.description || '');
        
        const brandingChanged = 
            localBranding.primaryColor !== (settings?.branding?.primaryColor || '#3b82f6') ||
            localBranding.appName !== (settings?.branding?.appName || '') ||
            localBranding.appDescription !== (settings?.branding?.appDescription || '') ||
            localBranding.logoUrl !== (settings?.branding?.logoUrl || '') ||
            localBranding.logoLightUrl !== (settings?.branding?.logoLightUrl || settings?.branding?.lightLogoUrl || '') ||
            localBranding.logoDarkUrl !== (settings?.branding?.logoDarkUrl || settings?.branding?.darkLogoUrl || '') ||
            JSON.stringify(localBranding.socialLinks) !== JSON.stringify(settings?.branding?.socialLinks || {});

        return generalChanged || brandingChanged;
    }, [localGeneral, localBranding, settings]);

    const handleSaveAll = () => {
        updateSettings({
            general: localGeneral,
            branding: localBranding
        });
        toast.success("Workspace branding and identity updated!");
    };

    const handleReset = () => {
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
                logoLightUrl: settings.branding.logoLightUrl || settings.branding.lightLogoUrl || '',
                logoDarkUrl: settings.branding.logoDarkUrl || settings.branding.darkLogoUrl || '',
                appName: settings.branding.appName || '',
                appDescription: settings.branding.appDescription || '',
                socialLinks: settings.branding.socialLinks || {}
            });
        }
    };

    const handleSocialChange = (platform, field, value) => {
        setLocalBranding(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [platform]: {
                    ...prev.socialLinks?.[platform],
                    [field]: value
                }
            }
        }));
    };

    const handleLogoUpload = async (file, mode = 'light') => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            return toast.error("Please upload an image file");
        }
        if (file.size > 2 * 1024 * 1024) {
            return toast.error("Logo must be less than 2MB");
        }

        try {
            setUploadingMode(mode);
            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${mode}-${Date.now()}.${fileExt}`;
            const filePath = `branding/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('system')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('system')
                .getPublicUrl(filePath);

            const updatedBranding = {
                ...localBranding,
                ...(mode === 'dark' ? { logoDarkUrl: publicUrl } : { logoLightUrl: publicUrl }),
                logoUrl: mode === 'light' ? publicUrl : (localBranding.logoLightUrl || publicUrl)
            };
            setLocalBranding(updatedBranding);

            updateSettings({
                branding: updatedBranding
            });

            toast.success(`${mode === 'dark' ? 'Dark' : 'Light'} mode logo updated successfully`);
        } catch (error) {
            console.error("Logo upload error:", error);
            toast.error(`Failed to upload ${mode} mode logo`);
        } finally {
            setUploadingMode(null);
        }
    };

    const handleRemoveLogo = (mode = 'light') => {
        const updatedBranding = {
            ...localBranding,
            ...(mode === 'dark' ? { logoDarkUrl: '' } : { logoLightUrl: '' })
        };
        if (mode === 'light') {
            updatedBranding.logoUrl = updatedBranding.logoDarkUrl || '';
        } else if (mode === 'dark' && !updatedBranding.logoLightUrl) {
            updatedBranding.logoUrl = '';
        }
        setLocalBranding(updatedBranding);
        updateSettings({ branding: updatedBranding });
        toast.info(`${mode === 'dark' ? 'Dark' : 'Light'} mode logo removed`);
    };

    const socialPlatforms = [
        { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
        { id: 'twitter', label: 'X (Twitter)', icon: Twitter, color: 'text-sky-500' },
        { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-rose-500' },
        { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
        { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600' },
        { id: 'github', label: 'GitHub', icon: Github, color: 'text-slate-400' }
    ];

    const activeSocialList = socialPlatforms.filter(p => localBranding.socialLinks?.[p.id]?.active);

    const previewLogo = previewTheme === 'dark'
        ? (localBranding.logoDarkUrl || localBranding.logoUrl || localBranding.logoLightUrl)
        : (localBranding.logoLightUrl || localBranding.logoUrl || localBranding.logoDarkUrl);

    return (
        <div className="space-y-3 relative pb-8">
            {/* Live Interactive Branding Preview Canvas */}
            <Card className="bg-card border-border/50 shadow-xs overflow-hidden">
                <CardHeader className="p-3 pb-2 border-b border-border/40 bg-secondary/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Eye className="w-3.5 h-3.5 text-primary" />
                            <CardTitle className="text-xs font-bold text-foreground">Live Branding Preview</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPreviewTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-border/60 bg-background/80 hover:bg-accent text-[9px] font-medium text-foreground transition-colors cursor-pointer"
                                title={`Switch preview to ${previewTheme === 'dark' ? 'Light' : 'Dark'} mode`}
                            >
                                {previewTheme === 'dark' ? (
                                    <>
                                        <Moon className="w-3 h-3 text-indigo-400" />
                                        <span>Dark Mode</span>
                                    </>
                                ) : (
                                    <>
                                        <Sun className="w-3 h-3 text-amber-500" />
                                        <span>Light Mode</span>
                                    </>
                                )}
                            </button>
                            <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0">
                                PREVIEW
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-3.5 bg-gradient-to-br from-card to-secondary/15">
                    {/* Simulated Mini App Navigation Header */}
                    <div className={`p-2.5 rounded-lg border transition-all flex items-center justify-between shadow-xs ${previewTheme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'}`}>
                        <div className="flex items-center gap-2.5">
                            {previewLogo ? (
                                <img src={previewLogo} alt="Logo" className="w-6 h-6 object-contain rounded" />
                            ) : (
                                <div 
                                    className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-black"
                                    style={{ backgroundColor: localBranding.primaryColor }}
                                >
                                    {(localBranding.appName || 'D')[0]}
                                </div>
                            )}
                            <div>
                                <span className={`text-xs font-bold block leading-none ${previewTheme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                                    {localBranding.appName || 'Devlomatix Platform'}
                                </span>
                                <span className={`text-[9px] block truncate max-w-[200px] ${previewTheme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                    {localBranding.appDescription || 'Next-Gen Workspace'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Live Badge */}
                            <span 
                                className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white shadow-xs"
                                style={{ backgroundColor: localBranding.primaryColor }}
                            >
                                PRO WORKSPACE
                            </span>

                            {/* Live Button */}
                            <button
                                style={{ backgroundColor: localBranding.primaryColor }}
                                className="px-2.5 py-1 rounded-md text-[10px] font-bold text-white shadow-xs transition-opacity hover:opacity-90 cursor-pointer"
                            >
                                Primary Action
                            </button>
                        </div>
                    </div>

                    {/* Active Social Chips Preview */}
                    {activeSocialList.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/30 text-[10px] text-muted-foreground">
                            <span className="font-semibold text-[9px] uppercase tracking-wider">Active Socials:</span>
                            <div className="flex items-center gap-1.5">
                                {activeSocialList.map(p => (
                                    <span key={p.id} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary/40 border border-border/40 text-[9px] font-mono text-foreground">
                                        <p.icon className="w-2.5 h-2.5" />
                                        <span>{p.label}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Form Cards Grid */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-3"
            >
                {/* Workspace Identity */}
                <Card className="bg-card border-border/50 transition-colors shadow-xs">
                    <CardHeader className="p-3 pb-2 border-b border-border/40">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-md border border-primary/20">
                                <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xs font-bold text-foreground">Workspace Identity</CardTitle>
                                <CardDescription className="text-[10px] text-muted-foreground">
                                    Global identification for this workspace.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2.5 p-3 pt-2.5">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Workspace Name</Label>
                            <Input
                                value={localGeneral.name}
                                onChange={(e) => setLocalGeneral(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter workspace name"
                                className="bg-secondary/30 border-border/50 text-foreground text-xs h-8"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
                            <Textarea
                                rows={2}
                                value={localGeneral.description}
                                onChange={(e) => setLocalGeneral(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe what this workspace is for..."
                                className="bg-secondary/30 border-border/50 text-foreground text-xs resize-none min-h-[56px] py-1.5"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Visual Identity & Palette Presets */}
                <Card className="bg-card border-border/50 transition-colors shadow-xs">
                    <CardHeader className="py-2.5 px-3 border-b border-border/40 space-y-0">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-500/10 rounded-md border border-blue-500/20">
                                <Palette className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xs font-bold text-foreground leading-tight">Visual Identity & Logos</CardTitle>
                                <CardDescription className="text-[10px] text-muted-foreground leading-none">
                                    Upload brand logos for light & dark modes.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 p-3 pt-2.5">
                        {/* Dual Logo Uploaders: Light & Dark Mode */}
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Mode Logos
                            </Label>
                            <div className="grid grid-cols-2 gap-2.5">
                                {/* Light Mode Logo Box */}
                                <div className="space-y-1 p-2 rounded-lg border border-border/60 bg-secondary/15">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-[11px] font-semibold text-foreground">
                                            <Sun className="w-3 h-3 text-amber-500" />
                                            <span>Light Mode</span>
                                        </div>
                                        {localBranding.logoLightUrl && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveLogo('light')}
                                                className="text-[9px] text-destructive hover:underline flex items-center gap-0.5 cursor-pointer"
                                                title="Remove light mode logo"
                                            >
                                                <Trash2 className="w-2.5 h-2.5" />
                                                <span>Clear</span>
                                            </button>
                                        )}
                                    </div>
                                    <div
                                        onClick={() => !uploadingMode && lightFileInputRef.current?.click()}
                                        className={`relative w-full h-16 rounded-md border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white flex flex-col items-center justify-center gap-0.5 group cursor-pointer hover:border-primary/60 transition-all overflow-hidden shadow-xs ${uploadingMode === 'light' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {localBranding.logoLightUrl ? (
                                            <img
                                                src={localBranding.logoLightUrl}
                                                alt="Light Logo"
                                                className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <>
                                                <UploadCloud className="w-3.5 h-3.5 text-zinc-400 group-hover:text-primary transition-colors" />
                                                <span className="text-[9px] font-medium text-zinc-600 group-hover:text-zinc-900">
                                                    Upload Light
                                                </span>
                                            </>
                                        )}
                                        {uploadingMode === 'light' && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                                                <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={lightFileInputRef}
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) handleLogoUpload(e.target.files[0], 'light');
                                            e.target.value = '';
                                        }}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>

                                {/* Dark Mode Logo Box */}
                                <div className="space-y-1 p-2 rounded-lg border border-border/60 bg-secondary/15">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-[11px] font-semibold text-foreground">
                                            <Moon className="w-3 h-3 text-indigo-400" />
                                            <span>Dark Mode</span>
                                        </div>
                                        {localBranding.logoDarkUrl && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveLogo('dark')}
                                                className="text-[9px] text-destructive hover:underline flex items-center gap-0.5 cursor-pointer"
                                                title="Remove dark mode logo"
                                            >
                                                <Trash2 className="w-2.5 h-2.5" />
                                                <span>Clear</span>
                                            </button>
                                        )}
                                    </div>
                                    <div
                                        onClick={() => !uploadingMode && darkFileInputRef.current?.click()}
                                        className={`relative w-full h-16 rounded-md border-2 border-dashed border-zinc-700 bg-zinc-950 flex flex-col items-center justify-center gap-0.5 group cursor-pointer hover:border-primary/60 transition-all overflow-hidden shadow-xs ${uploadingMode === 'dark' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {localBranding.logoDarkUrl ? (
                                            <img
                                                src={localBranding.logoDarkUrl}
                                                alt="Dark Logo"
                                                className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <>
                                                <UploadCloud className="w-3.5 h-3.5 text-zinc-500 group-hover:text-primary transition-colors" />
                                                <span className="text-[9px] font-medium text-zinc-400 group-hover:text-zinc-100">
                                                    Upload Dark
                                                </span>
                                            </>
                                        )}
                                        {uploadingMode === 'dark' && (
                                            <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center">
                                                <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={darkFileInputRef}
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) handleLogoUpload(e.target.files[0], 'dark');
                                            e.target.value = '';
                                        }}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Quick Color Palette Presets */}
                        <div className="pt-0.5">
                            <Label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">Primary Accent Color:</Label>

                            <div className='flex flex-col gap-2'>
                                <div className="flex gap-2 items-center">
                                    <div className="w-8 h-8 rounded-md border border-border/60 shrink-0 shadow-xs" style={{ backgroundColor: localBranding.primaryColor }} />
                                    <Input
                                        value={localBranding.primaryColor}
                                        onChange={(e) => setLocalBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                                        className="bg-secondary/30 border-border/50 text-foreground font-mono text-xs h-8"
                                    />
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {COLOR_PRESETS.map((p) => (
                                        <button
                                            key={p.hex}
                                            type="button"
                                            onClick={() => setLocalBranding(prev => ({ ...prev, primaryColor: p.hex }))}
                                            className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 flex items-center justify-center cursor-pointer ${localBranding.primaryColor === p.hex ? 'ring-2 ring-primary ring-offset-1 border-white' : 'border-border/60'}`}
                                            style={{ backgroundColor: p.hex }}
                                            title={p.name}
                                        >
                                            {localBranding.primaryColor === p.hex && <Check className="w-2.5 h-2.5 text-white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* App Identity */}
                <Card className="bg-card border-border/50 transition-colors shadow-xs">
                    <CardHeader className="p-3 pb-2 border-b border-border/40">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-amber-500/10 rounded-md border border-amber-500/20">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-xs font-bold text-foreground">App Identity</CardTitle>
                                    <CardDescription className="text-[10px] text-muted-foreground">Platform branding titles.</CardDescription>
                                </div>
                            </div>
                            <span className="text-[8px] font-bold bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-full border border-amber-500/30 uppercase">Global</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2.5 p-3 pt-2.5">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">App Name</Label>
                            <Input
                                value={localBranding.appName}
                                onChange={(e) => setLocalBranding(prev => ({ ...prev, appName: e.target.value }))}
                                placeholder="e.g. Devlomatix Platform"
                                className="bg-secondary/30 border-border/50 text-foreground text-xs h-8"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">App Tagline</Label>
                            <Input
                                value={localBranding.appDescription}
                                onChange={(e) => setLocalBranding(prev => ({ ...prev, appDescription: e.target.value }))}
                                placeholder="A brief tagline for your app"
                                className="bg-secondary/30 border-border/50 text-foreground text-xs h-8"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Social Presence */}
                <Card className="bg-card border-border/50 transition-colors shadow-xs">
                    <CardHeader className="p-3 pb-2 border-b border-border/40">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">
                                <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xs font-bold text-foreground">Social Presence</CardTitle>
                                <CardDescription className="text-[10px] text-muted-foreground">
                                    Public profile links.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1.5 p-3 pt-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {socialPlatforms.map((platform) => (
                                <div
                                    key={platform.id}
                                    className="flex items-center gap-2 p-1.5 px-2 rounded-md bg-secondary/30 border border-border/40 hover:border-border transition-colors"
                                >
                                    <div className={`w-6 h-6 bg-background rounded-sm flex items-center justify-center border border-border/50 shrink-0 ${platform.color}`}>
                                        <platform.icon className="w-3 h-3" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Input
                                            value={localBranding.socialLinks?.[platform.id]?.url || ''}
                                            onChange={(e) => handleSocialChange(platform.id, 'url', e.target.value)}
                                            placeholder={`${platform.label}`}
                                            className="h-6 bg-transparent border-none text-[11px] px-1 py-0"
                                        />
                                    </div>
                                    <Switch
                                        checked={localBranding.socialLinks?.[platform.id]?.active || false}
                                        onCheckedChange={(checked) => handleSocialChange(platform.id, 'active', checked)}
                                        className="scale-75 origin-right data-[state=checked]:bg-indigo-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Sticky Save Bar */}
            <StickySaveBar
                isDirty={isDirty}
                saving={saving}
                onSave={handleSaveAll}
                onReset={handleReset}
                label="Unsaved Branding & Identity Changes"
            />
        </div>
    );
};
