import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Globe, LayoutGrid, Palette, Image as ImageIcon, UploadCloud, Info, Link2, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export const GeneralSettings = () => {
    const { settings, updateSettings, saving } = useSettings();
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

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

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validations
        if (!file.type.startsWith('image/')) {
            return toast.error("Please upload an image file");
        }
        if (file.size > 2 * 1024 * 1024) {
            return toast.error("Logo must be less than 2MB");
        }

        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${Date.now()}.${fileExt}`;
            const filePath = `branding/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('system')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('system')
                .getPublicUrl(filePath);

            setLocalBranding(prev => ({ ...prev, logoUrl: publicUrl }));
            
            // Auto-save branding after upload
            updateSettings({ 
                branding: { ...localBranding, logoUrl: publicUrl } 
            });

            toast.success("App logo updated successfully");
        } catch (error) {
            console.error("Logo upload error:", error);
            toast.error("Failed to upload logo");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Workspace Identity */}
            <Card className="rounded-md border border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center border border-primary/20 shadow-inner">
                            <LayoutGrid className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Workspace Identity</CardTitle>
                            <CardDescription className="text-sm font-medium opacity-70">
                                Customize how your workspace appears to you and your team.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-3">
                        <Label className="text-[10px] font-bold opacity-70">Workspace Name</Label>
                        <Input
                            value={localGeneral.name}
                            onChange={(e) => setLocalGeneral(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter workspace name"
                            className="rounded-md border border-border h-11 bg-background shadow-inner font-medium"
                        />
                    </div>
                    <div className="grid gap-3">
                        <Label className="text-[10px] font-bold opacity-70">Description</Label>
                        <Textarea
                            rows={2}
                            value={localGeneral.description}
                            onChange={(e) => setLocalGeneral(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe what this workspace is for..."
                            className="rounded-md border border-border bg-background shadow-inner font-medium resize-none"
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t border-border/10 bg-muted/20 p-6 flex justify-end">
                    <Button
                        onClick={handleSaveGeneral}
                        disabled={saving}
                        className="rounded-md font-bold px-8 shadow-soft bg-primary hover:bg-primary/90"
                    >
                        {saving ? "Saving..." : "Save Workspace Identity"}
                    </Button>
                </CardFooter>
            </Card>

            {/* App Identity */}
            <Card className="rounded-md border border-border/40 shadow-xl shadow-indigo-500/5 bg-card/60 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-md flex items-center justify-center border border-indigo-500/20 shadow-inner">
                                <Sparkles className="w-6 h-6 text-indigo-500" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-xl font-bold">App Identity</CardTitle>
                                    <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-500/20">GLOBAL</span>
                                </div>
                                <CardDescription className="text-sm font-medium opacity-70">
                                    This reflects system-wide branding for all users and emails.
                                </CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">
                    <div className="grid gap-3">
                        <Label className="text-[10px] font-bold opacity-70 ml-1">App Name</Label>
                        <Input
                            value={localBranding.appName}
                            onChange={(e) => setLocalBranding(prev => ({ ...prev, appName: e.target.value }))}
                            placeholder="e.g. HealthFine Platform"
                            className="rounded-md border border-border/50 h-12 bg-background/50 shadow-inner font-bold text-sm focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                    <div className="grid gap-3">
                        <Label className="text-[10px] font-bold opacity-70 ml-1">App Description</Label>
                        <Input
                            value={localBranding.appDescription}
                            onChange={(e) => setLocalBranding(prev => ({ ...prev, appDescription: e.target.value }))}
                            placeholder="A brief tagline for your app"
                            className="rounded-md border border-border/50 h-12 bg-background/50 shadow-inner font-bold text-sm focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t border-border/10 bg-indigo-500/5 p-6 flex justify-end">
                    <Button
                        onClick={handleSaveBranding}
                        disabled={saving}
                        className="rounded-md font-bold px-8 shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white transition-all transform hover:scale-[1.02]"
                    >
                        {saving ? "Saving..." : "Save App Identity"}
                    </Button>
                </CardFooter>
            </Card>

            {/* Visual Identity */}
            <Card className="rounded-md border border-border shadow-soft bg-card/100">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="w-10 bg-blue-500/10 rounded-md flex items-center justify-center mb-2 border border-blue-500/20">
                                <Palette className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-xl font-bold">Visual Identity</CardTitle>
                                <span className="text-[10px] font-bold bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full border border-blue-500/20">GLOBAL</span>
                            </div>
                        </div>
                    </div>
                    <CardDescription className="text-sm font-medium opacity-70">
                        Set your brand color and logo to personalize your workspace experience globally.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div
                            onClick={() => !uploading && fileInputRef.current?.click()}
                            className={`relative w-32 h-32 bg-muted/30 rounded-md border-2 border-dashed border-border/60 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-primary/40 transition-all shrink-0 overflow-hidden ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {localBranding.logoUrl ? (
                                <img src={localBranding.logoUrl} alt="Logo" className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform" />
                            ) : (
                                <>
                                    <UploadCloud className="w-8 h-8 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                                    <span className="text-[10px] font-bold text-muted-foreground/40 group-hover:text-primary/60">Upload Logo</span>
                                </>
                            )}

                            {uploading && (
                                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                </div>
                            )}

                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleLogoUpload}
                            accept="image/*"
                            className="hidden"
                        />

                        <div className="flex-1 space-y-6 w-full">
                            <div className="grid gap-3">
                                <Label className="text-[10px] font-bold opacity-70">Primary Workspace Color</Label>
                                <div className="flex gap-4 items-center">
                                    <div
                                        className="w-11 h-11 rounded-md shadow-soft border-2 border-background ring-1 ring-border"
                                        style={{ backgroundColor: localBranding.primaryColor }}
                                    />
                                    <Input
                                        type="text"
                                        value={localBranding.primaryColor}
                                        onChange={(e) => setLocalBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                                        className="rounded-md border border-border h-11 bg-background shadow-inner font-mono font-bold text-xs flex-1"
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
                        className="rounded-md font-bold px-8 shadow-soft bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {saving ? "Saving..." : "Save Visual Identity"}
                    </Button>
                </CardFooter>
            </Card>

            {/* Custom Domain */}
            <Card className="rounded-md border border-border/40 shadow-xl shadow-amber-500/5 bg-card/60 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-md flex items-center justify-center border border-amber-500/20 shadow-inner">
                            <Globe className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Custom Domain</CardTitle>
                            <CardDescription className="text-sm font-medium opacity-70">
                                Bind your own domain to this workspace for a professional look.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="grid gap-3 flex-1">
                            <Label className="text-[10px] font-bold opacity-70 ml-1">Domain Name</Label>
                            <Input
                                placeholder="e.g. workspace.yourdomain.com"
                                className="rounded-md border border-border/50 h-12 bg-background/50 shadow-inner font-bold text-sm focus:ring-2 focus:ring-amber-500/20"
                            />
                        </div>
                        <Button variant="outline" className="rounded-md font-bold h-12 px-6 border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-600 transition-all">
                            Check DNS
                        </Button>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-md border border-border/40 space-y-3">
                        <div className="flex justify-between items-center text-[10px] opacity-50">
                            <span>Type</span>
                            <span>Host</span>
                            <span>Value</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold">
                            <span className="bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded text-[10px]">CNAME</span>
                            <span className="font-mono">@</span>
                            <span className="font-mono">cname.devlomatix.com</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t border-border/10 bg-amber-500/5 p-6 flex justify-end">
                    <p className="text-[10px] font-bold text-amber-600/70 mr-auto flex items-center gap-2">
                        <Info className="w-3 h-3" />
                        Domain propagation can take up to 24 hours.
                    </p>
                    <Button
                        disabled
                        className="rounded-md font-bold px-8 shadow-xl shadow-amber-500/20 bg-amber-600 hover:bg-amber-700 text-white transition-all transform opacity-50 grayscale cursor-not-allowed"
                    >
                        Connect Domain
                    </Button>
                </CardFooter>
            </Card>

            {/* Workspace URL */}
            <Card className="rounded-md border border-border/40 shadow-xl shadow-emerald-500/5 bg-card/60 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-md flex items-center justify-center border border-emerald-500/20 shadow-inner">
                            <Link2 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Access URL</CardTitle>
                            <CardDescription className="text-xs font-medium opacity-70">
                                Your workspace is accessible at the following permanent address.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="flex items-center gap-2 p-4 bg-background/50 rounded-md border border-border/40 shadow-inner group">
                        <code className="text-sm text-foreground/80 flex-1 truncate">
                            {typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/workspace/${settings?.general?.inviteCode || '...'}` : 'Loading...'}
                        </code>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-md h-9 w-9 border border-border/40 hover:bg-emerald-500/10 transition-colors"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.host + '/workspace/' + settings.general.inviteCode);
                                    toast.success("Copied to clipboard");
                                }}
                            >
                                <UploadCloud className="w-4 h-4 text-emerald-500 rotate-90" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-md h-9 w-9 border border-border/40 hover:bg-emerald-500/10 transition-colors"
                                onClick={() => window.open(`${window.location.protocol}//${window.location.host}/workspace/${settings?.general?.inviteCode}`, '_blank')}
                            >
                                <ExternalLink className="w-4 h-4 text-emerald-500" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="p-4 bg-blue-500/5 rounded-md border border-blue-500/10 flex gap-4 items-start">
                <div className="p-2 bg-blue-500/10 rounded-md mt-0.5">
                    <Info className="w-4 h-4 text-blue-500" />
                </div>
                <div className="space-y-1">
                    <p className="text-[11px] font-bold text-blue-600 tracking-wide">Audit History</p>
                    <p className="text-xs text-blue-500/80 font-medium">
                        Workspace general identity changes are logged in the System Logs for security audit purposes.
                    </p>
                </div>
            </div>
        </div>
    );
};