'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from '@/utils/axios';
import { MailSidebar } from './_components/MailSidebar';
import { MailList } from './_components/MailList';
import { MailDisplay } from './_components/MailDisplay';
import { Button } from '@/components/ui/button';
import { 
    Mail, 
    Link as LinkIcon, 
    RefreshCw, 
    Settings,
    LayoutGrid,
    Search,
    Plus,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function MailboxPage() {
    const params = useParams();
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();
    const workspaceId = params.workspaceId;

    const [isConnected, setIsConnected] = useState(true);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [labels, setLabels] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [activeFolder, setActiveFolder] = useState('INBOX');
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const [search, setSearch] = useState('');
    const [counts, setCounts] = useState({});

    const fetchMessages = useCallback(async (folder = activeFolder, query = search) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/workspace/${workspaceId}/productivity/mailbox`, {
                params: { 
                    label: folder, 
                    q: query,
                    accountId: selectedAccountId
                }
            });

            if (res.data.connected === false) {
                setIsConnected(false);
            } else {
                setIsConnected(true);
                if (res.data.error) {
                    toast.error(`Gmail Error: ${res.data.error}`);
                    setMessages([]);
                } else {
                    setMessages(res.data.messages || []);
                }
                
                setAccounts(res.data.accounts || []);
                setLabels(res.data.labels || []);
                if (res.data.activeAccountId && !selectedAccountId) {
                    setSelectedAccountId(res.data.activeAccountId);
                }
                
                // If success param found, show toast
                if (searchParams.get('success')) {
                    toast.success("Gmail connected successfully!");
                    // Clear search params
                    window.history.replaceState({}, '', window.location.pathname);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to sync mailbox");
        } finally {
            setLoading(false);
        }
    }, [workspaceId, activeFolder, search, searchParams, selectedAccountId]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]); // Standard practice with useCallback

    const handleConnect = () => {
        window.location.href = `/api/workspace/${workspaceId}/productivity/mailbox/auth`;
    };

    const handleAction = async (action, messageId) => {
        try {
            await axios.post(`/api/workspace/${workspaceId}/productivity/mailbox`, {
                action,
                messageId,
                accountId: selectedAccountId
            });
            toast.success(`Message ${action}ed`);
            fetchMessages();
            if (selectedMessageId === messageId) setSelectedMessageId(null);
        } catch (error) {
            toast.error(`Failed to ${action} message`);
        }
    };

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[85vh] p-8 animate-fade-in">
                <div className="relative mb-12">
                   <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                   <div className="relative bg-card/20 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-2xl flex flex-col items-center max-w-md text-center">
                        <div className="bg-primary/20 w-24 h-24 rounded-3xl flex items-center justify-center mb-8 rotate-12 group hover:rotate-0 transition-transform duration-500">
                            <Mail className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight mb-4">Connect your Gmail</h1>
                        <p className="text-sm text-muted-foreground font-bold leading-relaxed mb-10 opacity-70">
                            Sync your workspace with Gmail to manage your communications efficiently without leaving the platform.
                        </p>
                        <Button 
                            onClick={handleConnect}
                            className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <LinkIcon className="w-5 h-5 mr-3" /> Link Google Account
                        </Button>
                        <div className="mt-8 pt-8 border-t border-white/5 w-full flex flex-col items-center gap-4 opacity-40">
                             <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"><RefreshCw className="w-3 h-3" /> Real-time sync</div>
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"><Settings className="w-3 h-3" /> Secure OAuth</div>
                             </div>
                             <div className="text-[8px] font-mono text-muted-foreground break-all max-w-xs">
                                UID: {session?.user?.userId || "Loading..."}
                             </div>
                        </div>
                   </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[88vh] bg-card/5 rounded-3xl overflow-hidden border border-border/40 shadow-2xl backdrop-blur-sm animate-in zoom-in-95 duration-500">
            {/* Folder Sidebar */}
            <MailSidebar 
                activeFolder={activeFolder} 
                onFolderChange={setActiveFolder} 
                counts={counts}
                accounts={accounts}
                labels={labels}
                selectedAccountId={selectedAccountId}
                onAccountChange={setSelectedAccountId}
            />

            {/* Message List Pane */}
            <div className="w-[450px] flex flex-col h-full bg-background/20">
                <MailList 
                    messages={messages}
                    selectedId={selectedMessageId}
                    onSelect={setSelectedMessageId}
                    loading={loading}
                    search={search}
                    onSearchChange={setSearch}
                />
            </div>

            {/* Message Detail Pane */}
            <div className="flex-1 flex flex-col h-full bg-background/5 overflow-hidden">
                <MailDisplay 
                    messageId={selectedMessageId} 
                    accountId={selectedAccountId}
                    onAction={handleAction}
                />
            </div>
        </div>
    );
}