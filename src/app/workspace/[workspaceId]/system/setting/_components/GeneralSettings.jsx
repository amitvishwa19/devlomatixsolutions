import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { LayoutGrid, Palette, UploadCloud, Info, Loader2, Sparkles, Facebook, Twitter, Instagram, Linkedin, Youtube, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export const GeneralSettings = () => {
    const { settings, updateSettings, saving } = useSettings();
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const [localGeneral, setLocalGeneral] = useState({
        name: '',
        description: '',
        imageUrl: '',
        socialLinks: {
            facebook: { url: '', active: false },
            twitter: { url: '', active: false },
            instagram: { url: '', active: false },
            linkedin: { url: '', active: false },
            youtube: { url: '', active: false }
        }
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
                imageUrl: settings.general.imageUrl || '',
                socialLinks: settings.general.socialLinks || {
                    facebook: { url: '', active: false },
                    twitter: { url: '', active: false },
                    instagram: { url: '', active: false },
                    linkedin: { url: '', active: false },
                    youtube: { url: '', active: false }
                }
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

    const handleSocialChange = (platform, field, value) => {
        setLocalGeneral(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [platform]: {
                    ...prev.socialLinks[platform],
                    [field]: value
                }
            }
        }));
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

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

    const socialPlatforms = [
        { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
        { id: 'twitter', label: 'X (Twitter)', icon: Twitter, color: 'text-sky-500' },
        { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-rose-500' },
        { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
        { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600' }
    ];

    const cardClasses = "rounded-md border border-border/50 bg-transparent overflow-hidden flex flex-col hover:border-primary/20 transition-colors duration-300";

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Workspace Identity */}
                <Card className={cardClasses}>
                    <CardHeader className="p-3 border-b border-border/10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/5 rounded-md flex items-center justify-center border border-primary/10">
                                <LayoutGrid className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold">Workspace Identity</CardTitle>
                                <CardDescription className="text-[10px] font-medium opacity-60">
                                    Global identification for this workspace.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4 flex-1">
                        <div className="grid gap-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5">Workspace Name</Label>
                            <Input
                                value={localGeneral.name}
                                onChange={(e) => setLocalGeneral(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter workspace name"
                                className="rounded-md border border-border/50 h-9 bg-transparent font-medium text-xs focus:ring-1 focus:ring-primary/20"
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5">Description</Label>
                            <Textarea
                                rows={3}
                                value={localGeneral.description}
                                onChange={(e) => setLocalGeneral(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe what this workspace is for..."
                                className="rounded-md border border-border/50 bg-transparent font-medium text-xs focus:ring-1 focus:ring-primary/20 resize-none"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t border-border/10 p-3 flex justify-end bg-muted/[0.02]">
                        <Button
                            onClick={handleSaveGeneral}
                            disabled={saving}
                            size="sm"
                            className="rounded-md font-bold px-6 bg-primary hover:bg-primary/90 text-[10px] h-8"
                        >
                            {saving ? "Saving..." : "Update Identity"}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Social Presence Block */}
                <Card className={cardClasses}>
                    <CardHeader className="p-3 border-b border-border/10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-500/5 rounded-md flex items-center justify-center border border-indigo-500/10">
                                <Share2 className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold">Social Presence</CardTitle>
                                <CardDescription className="text-[10px] font-medium opacity-60">
                                    Public profile links.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2 flex-1">
                        {socialPlatforms.map((platform) => (
                            <div key={platform.id} className="flex items-center gap-2 p-1.5 rounded-md border border-border/50 bg-muted/5 group/link">
                                <div className={`w-6 h-6 bg-background rounded flex items-center justify-center border border-border/50 ${platform.color} shrink-0 group-hover/link:scale-105 transition-transform`}>
                                    <platform.icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Input
                                        value={localGeneral.socialLinks[platform.id].url}
                                        onChange={(e) => handleSocialChange(platform.id, 'url', e.target.value)}
                                        placeholder={`${platform.label} URL`}
                                        className="h-7 rounded border-none bg-transparent text-[10px] font-medium focus-visible:ring-0 px-1 placeholder:opacity-30"
                                    />
                                </div>
                                <div className="flex items-center gap-2 pr-1 border-l border-border/10 pl-2">
                                    <Switch
                                        checked={localGeneral.socialLinks[platform.id].active}
                                        onCheckedChange={(checked) => handleSocialChange(platform.id, 'active', checked)}
                                        className="scale-75"
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="border-t border-border/10 p-3 flex justify-end bg-muted/[0.02]">
                        <Button
                            onClick={handleSaveGeneral}
                            disabled={saving}
                            size="sm"
                            className="rounded-md font-bold px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] h-8"
                        >
                            {saving ? "Saving..." : "Update Socials"}
                        </Button>
                    </CardFooter>
                </Card>

                {/* App Identity */}
                <Card className={cardClasses}>
                    <CardHeader className="p-3 border-b border-border/10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-500/5 rounded-md flex items-center justify-center border border-amber-500/10">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-sm font-bold">App Identity</CardTitle>
                                    <span className="text-[8px] font-bold bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded border border-amber-500/10 uppercase">Global</span>
                                </div>
                                <CardDescription className="text-[10px] font-medium opacity-60">
                                    Public branding for all users.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4 flex-1">
                        <div className="grid gap-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5">App Name</Label>
                            <Input
                                value={localBranding.appName}
                                onChange={(e) => setLocalBranding(prev => ({ ...prev, appName: e.target.value }))}
                                placeholder="e.g. HealthFine Platform"
                                className="rounded-md border border-border/50 h-9 bg-transparent font-medium text-xs focus:ring-1 focus:ring-indigo-500/20"
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5">App Tagline</Label>
                            <Input
                                value={localBranding.appDescription}
                                onChange={(e) => setLocalBranding(prev => ({ ...prev, appDescription: e.target.value }))}
                                placeholder="A brief tagline for your app"
                                className="rounded-md border border-border/50 h-9 bg-transparent font-medium text-xs focus:ring-1 focus:ring-indigo-500/20"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t border-border/10 p-3 flex justify-end">
                        <Button
                            onClick={handleSaveBranding}
                            disabled={saving}
                            size="sm"
                            className="rounded-md font-bold px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] h-8"
                        >
                            {saving ? "Saving..." : "Update Branding"}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Visual Identity */}
                <Card className={cardClasses}>
                    <CardHeader className="p-3 border-b border-border/10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500/5 rounded-md flex items-center justify-center border border-blue-500/10">
                                <Palette className="w-4 h-4 text-blue-500" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold">Visual Identity</CardTitle>
                                <CardDescription className="text-[10px] font-medium opacity-60">
                                    Brand colors and logo.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4 flex-1">
                        <div className="flex gap-4 items-start">
                            <div
                                onClick={() => !uploading && fileInputRef.current?.click()}
                                className={`relative w-20 h-20 rounded-md border border-dashed border-border/60 flex flex-col items-center justify-center gap-1 group cursor-pointer hover:border-primary/40 transition-all shrink-0 overflow-hidden ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {localBranding.logoUrl ? (
                                    <img src={localBranding.logoUrl} alt="Logo" className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform" />
                                ) : (
                                    <>
                                        <UploadCloud className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary/60 transition-colors" />
                                        <span className="text-[8px] font-bold text-muted-foreground/30">Logo</span>
                                    </>
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                    </div>
                                )}
                            </div>

                            <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />

                            <div className="flex-1 space-y-3 w-full">
                                <div className="grid gap-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5">Brand Color</Label>
                                    <div className="flex gap-2 items-center">
                                        <div className="w-8 h-8 rounded-md border border-border/50 shadow-sm shrink-0" style={{ backgroundColor: localBranding.primaryColor }} />
                                        <Input
                                            value={localBranding.primaryColor}
                                            onChange={(e) => setLocalBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                                            className="rounded-md border border-border/50 h-8 bg-transparent font-mono font-bold text-[10px] flex-1 px-2"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t border-border/10 p-3 flex justify-end">
                        <Button
                            onClick={handleSaveBranding}
                            disabled={saving}
                            size="sm"
                            className="rounded-md font-bold px-4 bg-blue-600 hover:bg-blue-700 text-white text-[10px] h-8"
                        >
                            {saving ? "Saving..." : "Update Visuals"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="p-2.5 rounded-md border border-primary/10 flex gap-2.5 items-start bg-primary/[0.02]">
                <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Workspace identity changes are recorded in the system audit logs.
                </p>
            </div>
        </div>
    );
};