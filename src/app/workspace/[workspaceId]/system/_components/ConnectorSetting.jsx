import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Plus,
    Loader2,
    Settings2,
    Brain,
    ScanFace,
    Cloud,
    Plug,
    Trash2,
    ChevronRight,
    ExternalLink,
    MessageSquare,
    Zap,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { fetchCredentialsAction } from './_connectors/_actions/actions';

import WhatsappCloudForm from './_connectors/_whatsapp_cloud/WhatsappCloudForm';
import SupabaseForm from './_connectors/_supabase/SupabaseForm';
import GoogleForm from './_connectors/_google/GoogleForm';
import SocialMediaForm from './_connectors/_social/SocialMediaForm';

const CONNECTOR_ICONS = {
    'settings-2': Settings2,
    'brain': Brain,
    'scan-face': ScanFace,
    'cloud': Cloud,
};
const CONNECTOR_COLORS = {
    llm: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: 'text-purple-500', badge: 'bg-purple-500/20 text-purple-400' },
    social: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'text-blue-500', badge: 'bg-blue-500/20 text-blue-400' },
    cloud: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: 'text-amber-500', badge: 'bg-amber-500/20 text-amber-400' },
    other: { bg: 'bg-primary-500/10', border: 'border-primary/20', icon: 'text-primary-500', badge: 'bg-primary-500/20 text-primary-400' },
};

const PLATFORM_GROUPS = {
    llm: ['openai', 'gemini', 'anthropic', 'openrouter', 'groq', 'mistral', 'deepseek', 'cohere'],
    social: ['facebook', 'instagram', 'twitter', 'x', 'linkedin', 'youtube', 'pinterest', 'tiktok', 'reddit', 'google'],
    cloud: ['aws', 'gcp', 'azure', 'supabase', 'firebase', 'vercel', 'digitalocean', 'cloudflare'],
    other: ['resend', 'gmail', 'google_places', 'whatsapp_cloud', 'whatsapp_browser', 'discord', 'slack', 'telegram'],
};

const CREDENTIAL_TYPES = [
    { id: 'llm', name: 'LLM', icon: 'brain', description: 'Large Language Models' },
    { id: 'social', name: 'Social', icon: 'scan-face', description: 'Social Media Accounts' },
    { id: 'cloud', name: 'Cloud', icon: 'cloud', description: 'Cloud Services' },
    { id: 'other', name: 'Other', icon: 'settings-2', description: 'Other Credentials' },
];

export default function ConnectorSetting() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingAccount, setEditingAccount] = useState(null); // null or account object
    const [showNewFormFor, setShowNewFormFor] = useState(null); // null or 'WHATSAPP_CLOUD', 'SUPABASE', 'SOCIAL'

    const fetchCredentials = async () => {
        if (!workspaceId) return;
        setLoading(true);
        try {
            const data = await fetchCredentialsAction(workspaceId);
            setCredentials(data || []);
        } catch (error) {
            console.error("Failed to fetch credentials:", error);
            toast.error("Failed to load credentials");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (workspaceId) {
            fetchCredentials();
        }
    }, [workspaceId]);

    const handleSuccess = () => {
        fetchCredentials();
        setEditingAccount(null);
        setShowNewFormFor(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const whatsappCloudAccounts = credentials.filter(c => c.platform?.toUpperCase() === 'WHATSAPP_CLOUD');
    const supabaseAccounts = credentials.filter(c => c.platform?.toUpperCase() === 'SUPABASE');
    const googleAccounts = credentials.filter(c => c.platform?.toUpperCase() === 'GOOGLE');
    const socialAccounts = credentials.filter(c => c.type?.toLowerCase() === 'social');

    return (
        <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full space-y-2">
                {/* Whatsapp Cloud API */}
                <AccordionItem value="whatsapp-cloud" className="border border-white/10 rounded-lg bg-background/10 overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-card transition-all">
                        <div className="flex items-center gap-3 w-full">
                            <div className="p-2 bg-primary-500/10 rounded-lg border border-primary/20">
                                <MessageSquare className="w-4 h-4 text-primary-500" />
                            </div>
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="text-sm font-bold text-white">
                                    Whatsapp Cloud API
                                </span>
                                <span className="text-xs text-zinc-500">Connect to Meta Business Platform</span>
                            </div>
                            <div className="ml-auto mr-4">
                                {whatsappCloudAccounts.length > 0 ? (
                                    <Badge className="bg-primary-500/10 text-primary-500 border-primary/20 text-xs">
                                        {whatsappCloudAccounts.length} {whatsappCloudAccounts.length === 1 ? 'Account' : 'Accounts'} Connected
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-xs opacity-50">Not Configured</Badge>
                                )}
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2 border-t border-white/5">
                        <div className="space-y-4">
                            {showNewFormFor !== 'WHATSAPP_CLOUD' && (!editingAccount || editingAccount.platform !== 'WHATSAPP_CLOUD') ? (
                                <div className="space-y-3">
                                    {whatsappCloudAccounts.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-2">
                                            {whatsappCloudAccounts.map((account) => (
                                                <div
                                                    key={account.id}
                                                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-primary/30 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <MessageSquare className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-white">{account.profileName}</div>
                                                            <div className="text-[10px] text-zinc-500 uppercase tracking-tight">
                                                                {account.details?.phoneNumberId || 'WhatsApp Business'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={account.status === 'connected' ? 'default' : 'destructive'} className="text-[10px] h-5">
                                                            {account.status}
                                                        </Badge>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-zinc-400 hover:text-white"
                                                            onClick={() => setEditingAccount(account)}
                                                        >
                                                            <Settings2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-xl">
                                            <p className="text-xs text-zinc-500 mb-4">No WhatsApp accounts connected yet.</p>
                                        </div>
                                    )}

                                    <Button
                                        variant="outline"
                                        className="w-full border-dashed border-white/20 hover:border-primary/50 text-xs h-9"
                                        onClick={() => setShowNewFormFor('WHATSAPP_CLOUD')}
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-2" />
                                        Connect New Account
                                    </Button>
                                </div>
                            ) : (showNewFormFor === 'WHATSAPP_CLOUD' || (editingAccount && editingAccount.platform === 'WHATSAPP_CLOUD')) && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                            {editingAccount ? 'Edit Account' : 'New Connection'}
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-[10px] hover:bg-white/5"
                                            onClick={() => {
                                                setShowNewFormFor(null);
                                                setEditingAccount(null);
                                            }}
                                        >
                                            Back to List
                                        </Button>
                                    </div>
                                    <WhatsappCloudForm
                                        initialData={editingAccount}
                                        onSuccess={handleSuccess}
                                    />
                                </div>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Supabase */}
                <AccordionItem value="supabase" className="border border-white/10 rounded-lg bg-background/10 overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-card transition-all">
                        <div className="flex items-center gap-3 w-full">
                            <div className="p-2 bg-primary-500/10 rounded-lg border border-primary/20">
                                <Cloud className="w-4 h-4 text-primary-500" />
                            </div>
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="text-sm font-bold text-white">
                                    Supabase
                                </span>
                                <span className="text-xs text-zinc-500">Cloud Database & Authentication</span>
                            </div>
                            <div className="ml-auto mr-4">
                                {supabaseAccounts.length > 0 ? (
                                    <Badge className="bg-primary-500/10 text-primary-500 border-primary/20 text-xs">
                                        {supabaseAccounts.length} {supabaseAccounts.length === 1 ? 'Account' : 'Accounts'} Connected
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-xs opacity-50">Not Configured</Badge>
                                )}
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2 border-t border-white/5">
                        <div className="space-y-4">
                            {showNewFormFor !== 'SUPABASE' && (!editingAccount || editingAccount.platform !== 'SUPABASE') ? (
                                <div className="space-y-3">
                                    {supabaseAccounts.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-2">
                                            {supabaseAccounts.map((account) => (
                                                <div
                                                    key={account.id}
                                                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-primary/30 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <Cloud className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-white">{account.profileName}</div>
                                                            <div className="text-[10px] text-zinc-500 truncate max-w-[200px]">
                                                                {account.details?.supabaseUrl}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={account.status === 'connected' ? 'default' : 'destructive'} className="text-[10px] h-5">
                                                            {account.status}
                                                        </Badge>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-zinc-400 hover:text-white"
                                                            onClick={() => setEditingAccount(account)}
                                                        >
                                                            <Settings2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-xl">
                                            <p className="text-xs text-zinc-500 mb-4">No Supabase accounts connected yet.</p>
                                        </div>
                                    )}

                                    <Button
                                        variant="outline"
                                        className="w-full border-dashed border-white/20 hover:border-primary/50 text-xs h-9"
                                        onClick={() => setShowNewFormFor('SUPABASE')}
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-2" />
                                        Connect New Account
                                    </Button>
                                </div>
                            ) : (showNewFormFor === 'SUPABASE' || (editingAccount && editingAccount.platform === 'SUPABASE')) && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                            {editingAccount ? 'Edit Account' : 'New Connection'}
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-[10px] hover:bg-white/5"
                                            onClick={() => {
                                                setShowNewFormFor(null);
                                                setEditingAccount(null);
                                            }}
                                        >
                                            Back to List
                                        </Button>
                                    </div>
                                    <SupabaseForm
                                        initialData={editingAccount}
                                        onSuccess={handleSuccess}
                                    />
                                </div>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Social Media */}
                <AccordionItem value="social" className="border border-white/10 rounded-lg bg-background/10 overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-card transition-all">
                        <div className="flex items-center gap-3 w-full">
                            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <ScanFace className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="text-sm font-bold text-white">
                                    Social Media
                                </span>
                                <span className="text-xs text-zinc-500">Facebook, Twitter, LinkedIn & more</span>
                            </div>
                            <div className="ml-auto mr-4">
                                {socialAccounts.length > 0 ? (
                                    <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-xs">
                                        {socialAccounts.length} {socialAccounts.length === 1 ? 'Account' : 'Accounts'} Connected
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-xs opacity-50">Not Configured</Badge>
                                )}
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2 border-t border-white/5">
                        <div className="space-y-4">
                            {showNewFormFor !== 'SOCIAL' && (!editingAccount || editingAccount.type !== 'social') ? (
                                <div className="space-y-3">
                                    {socialAccounts.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-2">
                                            {socialAccounts.map((account) => (
                                                <div
                                                    key={account.id}
                                                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-primary/30 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                            <ScanFace className="w-4 h-4 text-blue-500" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-white">{account.profileName}</div>
                                                            <div className="text-[10px] text-zinc-500 uppercase tracking-tight">
                                                                {account.platform}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={account.status === 'connected' ? 'default' : 'destructive'} className="text-[10px] h-5">
                                                            {account.status}
                                                        </Badge>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-zinc-400 hover:text-white"
                                                            onClick={() => setEditingAccount(account)}
                                                        >
                                                            <Settings2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-xl">
                                            <p className="text-xs text-zinc-500 mb-4">No social media accounts connected yet.</p>
                                        </div>
                                    )}

                                    <Button
                                        variant="outline"
                                        className="w-full border-dashed border-white/20 hover:border-primary/50 text-xs h-9"
                                        onClick={() => setShowNewFormFor('SOCIAL')}
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-2" />
                                        Connect New Social Account
                                    </Button>
                                </div>
                            ) : (showNewFormFor === 'SOCIAL' || (editingAccount && editingAccount.type === 'social')) && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                            {editingAccount ? 'Edit Account' : 'New Social Connection'}
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-[10px] hover:bg-white/5"
                                            onClick={() => {
                                                setShowNewFormFor(null);
                                                setEditingAccount(null);
                                            }}
                                        >
                                            Back to List
                                        </Button>
                                    </div>
                                    <SocialMediaForm
                                        initialData={editingAccount}
                                        onSuccess={handleSuccess}
                                    />
                                </div>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Google Connector */}
                <AccordionItem value="google" className="border border-white/10 rounded-lg bg-background/10 overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-card transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-rose-500/10 text-rose-500">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.9 3.34-2.12 4.36-1.5 1.26-3.86 2.12-7.72 2.12-6.14 0-10.92-4.96-10.92-11.1s4.78-11.1 10.92-11.1c3.32 0 5.72 1.3 7.5 3.02l2.32-2.32c-2.02-1.92-4.92-3.44-9.82-3.44-8.98 0-16.34 7.36-16.34 16.34s7.36 16.34 16.34 16.34c4.84 0 8.52-1.6 11.38-4.54 2.86-2.86 3.76-6.88 3.76-10.3 0-.98-.08-1.92-.24-2.82h-14.92z"/>
                                </svg>
                            </div>
                            <div className="text-left">
                                <h2 className="text-sm font-semibold tracking-tight">Google Connector</h2>
                                <p className="text-xs text-zinc-500">Google Cloud, Search, and API credentials</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2">
                        <div className="space-y-4 pt-2">
                            {showNewFormFor === 'GOOGLE' || (editingAccount && editingAccount.platform === 'GOOGLE') ? (
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                            {editingAccount ? 'Edit Account' : 'New Google Connection'}
                                        </h3>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-7 text-[10px] hover:bg-white/5"
                                            onClick={() => {
                                                setShowNewFormFor(null);
                                                setEditingAccount(null);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                    <GoogleForm 
                                        initialData={editingAccount} 
                                        onSuccess={() => {
                                            setShowNewFormFor(null);
                                            setEditingAccount(null);
                                            fetchCredentials();
                                        }} 
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {googleAccounts.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-2">
                                            {googleAccounts.map((account) => (
                                                <div 
                                                    key={account.id}
                                                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-primary/30 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                                                            <div className="text-[10px] font-bold text-rose-500">G</div>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-zinc-200">{account.profile}</p>
                                                            <p className="text-[10px] text-zinc-500">Google Cloud Platform</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={account.status === 'connected' ? 'default' : 'destructive'} className="text-[10px] h-5">
                                                            {account.status}
                                                        </Badge>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-zinc-400 hover:text-white"
                                                            onClick={() => setEditingAccount(account)}
                                                        >
                                                            <Settings2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 px-4 rounded-xl border border-dashed border-white/10 bg-white/5">
                                            <p className="text-xs text-zinc-500 mb-4">No Google accounts connected yet.</p>
                                        </div>
                                    )}
                                    
                                    <Button 
                                        variant="outline" 
                                        className="w-full border-dashed border-white/20 hover:border-primary/50 text-xs h-9"
                                        onClick={() => setShowNewFormFor('GOOGLE')}
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-2" />
                                        Add New Google Account
                                    </Button>
                                </div>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>


        </div>
    );
}
