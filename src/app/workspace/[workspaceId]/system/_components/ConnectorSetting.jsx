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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const whatsappCloudCred = credentials.find(c => c.platform?.toUpperCase() === 'WHATSAPP_CLOUD');

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
                                    {whatsappCloudCred?.profileName || 'Whatsapp Cloud API'}
                                </span>
                                <span className="text-xs text-zinc-500">Connect to Meta Business Platform</span>
                            </div>
                            <div className="ml-auto mr-4">
                                {whatsappCloudCred ? (
                                    <Badge className="bg-primary-500/10 text-primary-500 border-primary/20 text-xs">Connected</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-xs opacity-50">Not Configured</Badge>
                                )}
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2 border-t border-white/5">
                        <WhatsappCloudForm
                            initialData={whatsappCloudCred}
                            onSuccess={fetchCredentials}
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
