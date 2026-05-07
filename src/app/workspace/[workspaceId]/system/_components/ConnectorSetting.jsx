'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Key,
    Database,
    Plus,
    Loader2,
    ShieldCheck,
    AlertCircle,
    RefreshCw,
    Copy,
    Settings2,
    Brain,
    ScanFace,
    Cloud,
    Plug,
    CheckCircle2,
    Trash2,
    Zap,
    ExternalLink,
    Search,
    ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { useModal } from '@/hooks/useModal';
import { credentialsTypes } from '../credential/_lib/constants';

const CONNECTOR_ICONS = {
    'settings-2': Settings2,
    'brain': Brain,
    'scan-face': ScanFace,
    'cloud': Cloud,
    'database': Database,
};

const CONNECTOR_COLORS = {
    llm: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: 'text-purple-500', badge: 'bg-purple-500/20 text-purple-400' },
    social: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'text-blue-500', badge: 'bg-blue-500/20 text-blue-400' },
    cloud: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: 'text-amber-500', badge: 'bg-amber-500/20 text-amber-400' },
    other: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-500', badge: 'bg-emerald-500/20 text-emerald-400' },
    all: { bg: 'bg-primary/10', border: 'border-primary/20', icon: 'text-primary', badge: 'bg-primary/20 text-primary' },
};

const PLATFORM_GROUPS = {
    llm: ['openai', 'gemini', 'anthropic', 'openrouter', 'groq', 'mistral', 'deepseek', 'cohere', 'other'],
    social: ['facebook', 'instagram', 'twitter', 'x', 'linkedin', 'youtube', 'pinterest', 'tiktok', 'reddit', 'google'],
    cloud: ['aws', 'gcp', 'azure', 'supabase', 'firebase', 'vercel', 'digitalocean', 'cloudflare'],
    other: ['resend', 'gmail', 'google_places', 'whatsapp_cloud', 'whatsapp_browser', 'discord', 'slack', 'telegram'],
};

export default function ConnectorSetting() {
    const { onOpen } = useModal();
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState('all');
    const [expandedConnector, setExpandedConnector] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCredentials = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/workspace/${workspaceId}/social/accounts`);
            setCredentials(res.data || []);
        } catch (error) {
            console.error("Failed to fetch credentials:", error);
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        if (workspaceId) {
            fetchCredentials();
        }
    }, [fetchCredentials, workspaceId]);

    const getCredentialsCount = (typeId) => {
        if (typeId === 'all') return credentials.length;
        const platforms = PLATFORM_GROUPS[typeId] || [];
        return credentials.filter(c => platforms.includes(c.platform?.toLowerCase())).length;
    };

    const getConnectorCredentials = (typeId) => {
        if (typeId === 'all') return credentials;
        const platforms = PLATFORM_GROUPS[typeId] || [];
        return credentials.filter(c => platforms.includes(c.platform?.toLowerCase()));
    };

    const filteredConnectors = searchQuery
        ? Object.entries(PLATFORM_GROUPS).flatMap(([type, platforms]) =>
            platforms.filter(p => p.toLowerCase().includes(searchQuery.toLowerCase())).map(p => ({ platform: p, type }))
        )
        : null;

    const handleAddConnector = (type) => {
        onOpen('addCredential', { workspaceId, onApply: fetchCredentials });
    };

    const handleCopyMasked = (cred) => {
        navigator.clipboard.writeText(`env_mapped_key_${cred.platform.toLowerCase()}`);
        toast.success(`${cred.platform} token copied to clipboard!`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                    <Plug className="w-4 h-4 text-primary" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white">Connectors</h3>
                    <p className="text-[10px] text-zinc-500">Manage API keys and platform connections</p>
                </div>
            </div>

            <div className="relative mb-3">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Search connectors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary/50"
                />
            </div>

            <ScrollArea className="h-[calc(80vh-100px)]">
                {filteredConnectors ? (
                    <div className="grid grid-cols-2 gap-2">
                        {filteredConnectors.map((item) => (
                            <ConnectorCard
                                key={item.platform}
                                platform={item.platform}
                                type={item.type}
                                isExpanded={expandedConnector === item.platform}
                                onToggle={() => setExpandedConnector(expandedConnector === item.platform ? null : item.platform)}
                                onAdd={() => handleAddConnector(item.type)}
                                credentials={getConnectorCredentials(item.type).filter(c => c.platform?.toLowerCase() === item.platform)}
                                onCopy={handleCopyMasked}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {credentialsTypes.filter(t => t.id !== 'all').map((type) => {
                            const count = getCredentialsCount(type.id);
                            const colorScheme = CONNECTOR_COLORS[type.id] || CONNECTOR_COLORS.other;
                            const IconComponent = CONNECTOR_ICONS[type.icon] || Database;

                            return (
                                <Card key={type.id} className={`${colorScheme.bg} border ${colorScheme.border} overflow-hidden`}>
                                    <button
                                        onClick={() => setActiveType(activeType === type.id ? 'all' : type.id)}
                                        className="w-full flex items-center justify-between p-2.5 hover:opacity-80 transition-opacity"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 ${colorScheme.bg} rounded-lg border ${colorScheme.border}`}>
                                                <IconComponent className={`w-4 h-4 ${colorScheme.icon}`} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-semibold text-white">{type.name}</p>
                                                <p className="text-[10px] text-zinc-500">{type.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={`${colorScheme.badge} text-[10px] font-semibold`}>
                                                {count} connected
                                            </Badge>
                                            <RefreshCw className={`w-3 h-3 text-zinc-500 transition-transform ${activeType === type.id ? 'rotate-180' : ''}`} />
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {activeType === type.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-white/10"
                                            >
                                                <div className="p-2 space-y-1.5">
                                                    <Button
                                                        onClick={() => handleAddConnector(type.id)}
                                                        className={`w-full h-8 text-[10px] font-semibold ${colorScheme.icon.replace('text-', 'bg-').replace('-500', '/20')} hover:${colorScheme.icon.replace('text-', 'bg-').replace('-500', '/30')} border ${colorScheme.border}`}
                                                    >
                                                        <Plus className="w-3 h-3 mr-1" />
                                                        Add {type.name} Connector
                                                    </Button>

                                                    {getConnectorCredentials(type.id).length > 0 ? (
                                                        <div className="space-y-1 mt-2">
                                                            {getConnectorCredentials(type.id).map((cred) => (
                                                                <div
                                                                    key={cred.id}
                                                                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10"
                                                                >
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <div className={`w-2 h-2 rounded-full ${cred.status === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                                        <div className="min-w-0">
                                                                            <p className="text-xs font-semibold text-white truncate">{cred.platform}</p>
                                                                            <p className="text-[10px] text-zinc-500 truncate">{cred.profile || cred.profileName}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-6 w-6"
                                                                            onClick={() => handleCopyMasked(cred)}
                                                                        >
                                                                            <Copy className="w-3 h-3" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-6 w-6 text-rose-500 hover:bg-rose-500/10"
                                                                            onClick={async () => {
                                                                                try {
                                                                                    await axios.delete(`/api/workspace/${workspaceId}/social/accounts/${cred.id}`);
                                                                                    toast.success("Credential deleted");
                                                                                    fetchCredentials();
                                                                                } catch (e) {
                                                                                    toast.error("Failed to delete credential");
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Trash2 className="w-3 h-3" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-[10px] text-zinc-500 text-center py-3">No {type.name} connectors yet</p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}

function ConnectorCard({ platform, type, isExpanded, onToggle, onAdd, credentials, onCopy }) {
    const hasCredentials = credentials.length > 0;
    const colorScheme = CONNECTOR_COLORS[type] || CONNECTOR_COLORS.other;

    return (
        <Card className={`${colorScheme.bg} border ${colorScheme.border} overflow-hidden`}>
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-2.5 hover:opacity-80 transition-opacity"
            >
                <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-8 h-8 ${colorScheme.bg} rounded-lg flex items-center justify-center border ${colorScheme.border} shrink-0`}>
                        <Database className={`w-4 h-4 ${colorScheme.icon}`} />
                    </div>
                    <div className="text-left min-w-0">
                        <p className="text-xs font-semibold text-white capitalize truncate">{platform}</p>
                        <p className="text-[10px] text-zinc-500">{hasCredentials ? `${credentials.length} connected` : 'Not connected'}</p>
                    </div>
                </div>
                {hasCredentials && (
                    <div className={`w-2 h-2 rounded-full ${credentials[0]?.status === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                )}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/10"
                    >
                        <div className="p-2 space-y-1.5">
                            <Button
                                onClick={onAdd}
                                className={`w-full h-7 text-[10px] font-semibold ${colorScheme.icon.replace('text-', 'bg-').replace('-500', '/20')} hover:${colorScheme.icon.replace('text-', 'bg-').replace('-500', '/30')} border ${colorScheme.border}`}
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                Configure
                            </Button>

                            {hasCredentials ? (
                                <div className="space-y-1">
                                    {credentials.map((cred) => (
                                        <div
                                            key={cred.id}
                                            className="flex items-center justify-between p-1.5 rounded bg-white/5 border border-white/10"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] font-semibold text-white truncate">{cred.profile || cred.profileName}</p>
                                            </div>
                                            <div className="flex items-center gap-0.5">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5"
                                                    onClick={() => onCopy(cred)}
                                                >
                                                    <Copy className="w-2.5 h-2.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
