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
  Loader2,
  PieChart,
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

        // Handle success notification
        if (searchParams.get('success')) {
          toast.success("Gmail link active!");
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Cloud Sync Interrupted");
    } finally {
      setLoading(false);
    }
  }, [workspaceId, activeFolder, search, searchParams, selectedAccountId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

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
      toast.success(`Conversation ${action}ed`);
      fetchMessages();
      if (selectedMessageId === messageId) setSelectedMessageId(null);
    } catch (error) {
      toast.error(`Failed to ${action} thread`);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] p-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="relative mb-12 group">
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-150 animate-pulse group-hover:bg-primary/30 transition-all"></div>
          <div className="relative bg-card/10 backdrop-blur-3xl border border-white/5 p-12 rounded-[4rem] shadow-2xl flex flex-col items-center max-w-md text-center group-hover:bg-card/20 transition-all">
            <div className="bg-primary/15 w-28 h-28 rounded-[2.5rem] flex items-center justify-center mb-10 rotate-6 group-hover:rotate-0 transition-transform duration-700 ring-2 ring-primary/20 shadow-inner">
              <Mail className="w-14 h-14 text-primary group-hover:scale-110 transition-transform shadow-glow shadow-primary/40" />
            </div>
            <h1 className="text-4xl font-black mb-5 tracking-tightest">Crystal Mail</h1>
            <p className="text-xs text-muted-foreground font-bold leading-relaxed mb-12 opacity-60 max-w-[280px]">
              Sync your Google Workspace directly to your dashboard for managed cloud communication.
            </p>
            <Button
              onClick={handleConnect}
              className="w-full h-16 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] tracking-[0.3em] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 uppercase"
            >
              <Plus className="w-5 h-5 mr-3" /> Connect Gmail Account
            </Button>
            <div className="mt-12 pt-8 border-t border-white/5 w-full flex flex-col items-center gap-6 opacity-30 group-hover:opacity-60 transition-opacity">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase"><RefreshCw className="w-3.5 h-3.5" /> High Sync</div>
                <Separator orientation="vertical" className="h-4 bg-white/10" />
                <div className="flex items-center gap-2 text-[9px] font-black uppercase"><Settings className="w-3.5 h-3.5" /> RSA SECURE</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-card/5 backdrop-blur-[100px] border border-white/5 animate-in fade-in zoom-in-98 duration-1000">
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
      <div className="w-[400px] flex flex-col h-full bg-background/5 border-r border-white/5 group transition-all duration-500 hover:bg-background/10">
        <MailList
          messages={messages}
          selectedId={selectedMessageId}
          onSelect={setSelectedMessageId}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          onRefresh={() => fetchMessages()}
        />
      </div>

      {/* Message Detail Pane */}
      <div className="flex-1 flex flex-col h-full bg-background/5 overflow-hidden transition-all duration-700">
        <MailDisplay
          messageId={selectedMessageId}
          accountId={selectedAccountId}
          onAction={handleAction}
        />
      </div>
    </div>
  );
}