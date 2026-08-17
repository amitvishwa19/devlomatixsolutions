import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { LayoutGrid, Palette, UploadCloud, Info, Loader2, Sparkles, Facebook, Twitter, Instagram, Linkedin, Youtube, Share2, Github } from 'lucide-react';
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

    const handleSaveGeneral = () => {
        updateSettings({ general: localGeneral });
    };

    const handleSaveBranding = () => {
        updateSettings({ branding: localBranding });
    };

    const handleSocialChange = (platform, field, value) => {
        setLocalBranding(prev => ({
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

            const updatedBranding = { ...localBranding, logoUrl: publicUrl };
            setLocalBranding(updatedBranding);

            updateSettings({
                branding: updatedBranding
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
        { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600' },
        { id: 'github', label: 'GitHub', icon: Github, color: 'text-slate-400' }
    ];

    return (
        <div className="space-y-3">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-3"
            >
                {/* Workspace Identity */}
                <Card className="bg-card border-border/50 transition-colors shadow-xs">
                    <CardHeader className="p-3 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-md border border-primary/20">
                                <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xs font-bold text-white">Workspace Identity</CardTitle>
                                <CardDescription className="text-[10px] text-zinc-500">
                                    Global identification for this workspace.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2.5 p-3 pt-2.5">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Workspace Name</Label>
                            <Input
                                value={localGeneral.name}
                                onChange={(e) => setLocalGeneral(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter workspace name"
                                className="bg-white/5 border-white/10 text-white text-xs h-8"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Description</Label>
                            <Textarea
                                rows={2}
                                value={localGeneral.description}
                                onChange={(e) => setLocalGeneral(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe what this workspace is for..."
                                className="bg-white/5 border-white/10 text-white text-xs resize-none min-h-[56px] py-1.5"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t border-white/5 p-2.5">
                        <Button
                            onClick={handleSaveGeneral}
                            disabled={saving}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-xs h-8"
                        >
                            {saving ? "Saving..." : "Update Identity"}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Social Presence */}
                <Card className="bg-card border-border/50 transition-colors shadow-xs">
                    <CardHeader className="p-3 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">
                                <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xs font-bold text-white">Social Presence</CardTitle>
                                <CardDescription className="text-[10px] text-zinc-500">
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
                                    className="flex items-center gap-2 p-1.5 px-2 rounded-md bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                                >
                                    <div className={`w-6 h-6 bg-white/10 rounded-sm flex items-center justify-center border border-white/10 shrink-0 ${platform.color}`}>
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
                    <CardFooter className="border-t border-white/5 p-2.5">
                        <Button
                            onClick={handleSaveBranding}
                            disabled={saving}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8"
                        >
                            {saving ? "Saving..." : "Update Socials"}
                        </Button>
                    </CardFooter>
                </Card>

                {/* App Identity */}
                <Card className="bg-card border-border/50 transition-colors shadow-xs">
                    <CardHeader className="p-3 pb-2 border-b border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-amber-500/10 rounded-md border border-amber-500/20">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-xs font-bold text-white">App Identity</CardTitle>
                                    <CardDescription className="text-[10px] text-zinc-500">Platform branding titles.</CardDescription>
                                </div>
                            </div>
                            <span className="text-[8px] font-bold bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-full border border-amber-500/30 uppercase">Global</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2.5 p-3 pt-2.5">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">App Name</Label>
                            <Input
                                value={localBranding.appName}
                                onChange={(e) => setLocalBranding(prev => ({ ...prev, appName: e.target.value }))}
                                placeholder="e.g. Devlomatix Platform"
                                className="bg-white/5 border-white/10 text-white text-xs h-8"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">App Tagline</Label>
                            <Input
                                value={localBranding.appDescription}
                                onChange={(e) => setLocalBranding(prev => ({ ...prev, appDescription: e.target.value }))}
                                placeholder="A brief tagline for your app"
                                className="bg-white/5 border-white/10 text-white text-xs h-8"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t border-white/5 p-2.5">
                        <Button
                            onClick={handleSaveBranding}
                            disabled={saving}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-8"
                        >
                            {saving ? "Saving..." : "Update Branding"}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Visual Identity */}
                <Card className="bg-card border-border/50 transition-colors shadow-xs">
                    <CardHeader className="p-3 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-500/10 rounded-md border border-blue-500/20">
                                <Palette className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xs font-bold text-white">Visual Identity</CardTitle>
                                <CardDescription className="text-[10px] text-zinc-500">
                                    Brand colors and logo.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2.5 p-3 pt-2.5">
                        <div className="flex gap-3 items-center">
                            <div
                                onClick={() => !uploading && fileInputRef.current?.click()}
                                className={`relative w-14 h-14 rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-0.5 group cursor-pointer hover:border-primary/50 transition-all shrink-0 overflow-hidden ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {localBranding.logoUrl ? (
                                    <img src={localBranding.logoUrl} alt="Logo" className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform" />
                                ) : (
                                    <>
                                        <UploadCloud className="w-4 h-4 text-zinc-500 group-hover:text-primary transition-colors" />
                                        <span className="text-[8px] font-semibold text-zinc-500">Logo</span>
                                    </>
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                                        <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                                    </div>
                                )}
                            </div>

                            <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />

                            <div className="flex-1 space-y-1">
                                <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Brand Color</Label>
                                <div className="flex gap-2 items-center">
                                    <div className="w-8 h-8 rounded-md border border-white/10 shrink-0 shadow-xs" style={{ backgroundColor: localBranding.primaryColor }} />
                                    <Input
                                        value={localBranding.primaryColor}
                                        onChange={(e) => setLocalBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                                        className="bg-white/5 border-white/10 text-white font-mono text-xs h-8"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t border-white/5 p-2.5">
                        <Button
                            onClick={handleSaveBranding}
                            disabled={saving}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8"
                        >
                            {saving ? "Saving..." : "Update Visuals"}
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>

            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 flex gap-2 items-center text-xs text-zinc-400">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <span>Workspace identity changes are recorded in the system audit logs.</span>
            </div>
        </div>
    );
};
