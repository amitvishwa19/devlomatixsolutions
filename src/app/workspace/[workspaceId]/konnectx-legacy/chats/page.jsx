'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Search,
    Send,
    MessageSquare,
    Check,
    CheckCheck,
    Clock,
    RefreshCw,
    QrCode,
    ArrowLeft,
    Loader2,
    AlertCircle,
    MessageSquarePlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
    getChatsAction,
    getChatMessagesAction,
    sendChatMessageAction,
    syncChatHistoryAction
} from '../_actions/chat-actions';
import { getWhatsAppConnectionStatusAction } from '../_actions/connection-actions';
import WhatsAppConnectionModal from '../_components/WhatsAppConnectionModal';
import NewChatModal from '../_components/NewChatModal';
import { useKonnectxSocket } from '../_lib/use-konnectx-socket';

export default function KonnectChatsPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.workspaceId;

    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Modals
    const [isConnected, setIsConnected] = useState(false);
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);

    const messagesEndRef = useRef(null);
    const selectedChatRef = useRef(null);
    const prevMessagesCountRef = useRef(0);

    // Keep ref in sync without triggering effects
    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    // Auto-scroll to bottom only when new messages are added
    const scrollToBottom = (behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        if (messages.length > prevMessagesCountRef.current) {
            scrollToBottom('smooth');
        }
        prevMessagesCountRef.current = messages.length;
    }, [messages]);

    // Check device connection
    const checkConnection = useCallback(async () => {
        try {
            const res = await getWhatsAppConnectionStatusAction(workspaceId);
            if (res.success) {
                setIsConnected(res.status === 'CONNECTED');
            }
        } catch (_) {}
    }, [workspaceId]);

    // Load conversations list (silent for background polling to prevent flicker)
    const loadConversations = useCallback(async (silent = false) => {
        if (!silent) setLoadingChats(true);
        try {
            const res = await getChatsAction(workspaceId);
            if (res.success) {
                setConversations(res.conversations || []);
                // If no chat is currently selected, select the first thread
                if (res.conversations?.length > 0 && !selectedChatRef.current) {
                    setSelectedChat(res.conversations[0]);
                }
            }
        } catch (err) {
            console.error("[LOAD_CONVERSATIONS_ERROR]", err);
        } finally {
            if (!silent) setLoadingChats(false);
        }
    }, [workspaceId]);

    // Load message history for active chat
    const loadMessages = useCallback(async (jid, silent = false) => {
        if (!jid) return;
        if (!silent) setLoadingMessages(true);
        try {
            const res = await getChatMessagesAction(workspaceId, jid);
            if (res.success) {
                const newMessages = res.messages || [];
                setMessages(prev => {
                    // Avoid unnecessary re-renders if nothing changed
                    if (prev.length !== newMessages.length) return newMessages;
                    const prevLast = prev[prev.length - 1];
                    const nextLast = newMessages[newMessages.length - 1];
                    if (prevLast?.id !== nextLast?.id || prevLast?.status !== nextLast?.status) {
                        return newMessages;
                    }
                    return prev;
                });
            }
        } catch (err) {
            console.error("[LOAD_MESSAGES_ERROR]", err);
        } finally {
            if (!silent) setLoadingMessages(false);
        }
    }, [workspaceId]);

    // Trigger full history sync with connected phone
    const handleSyncChats = async () => {
        setIsSyncing(true);
        try {
            const res = await syncChatHistoryAction(workspaceId);
            if (res.success) {
                toast.success(res.message || "Synced successfully with phone");
                await loadConversations(false);
                if (selectedChatRef.current?.jid) {
                    await loadMessages(selectedChatRef.current.jid, false);
                }
            } else {
                toast.error(res.error || "Sync failed");
            }
        } catch (err) {
            toast.error("Failed to sync with linked device");
        } finally {
            setIsSyncing(false);
        }
    };

    // Callback when new chat is initiated via NewChatModal
    const handleChatCreated = (conversation, initialMessage) => {
        setConversations(prev => {
            const exists = prev.some(c => c.jid === conversation.jid);
            if (exists) {
                return prev.map(c => c.jid === conversation.jid ? { ...c, ...conversation } : c);
            }
            return [conversation, ...prev];
        });
        setSelectedChat(conversation);
        if (initialMessage) {
            setMessages([initialMessage]);
            prevMessagesCountRef.current = 1;
        }
    };

    // 1. Initial mount load
    useEffect(() => {
        checkConnection();
        loadConversations(false);
    }, [checkConnection, loadConversations]);

    // 2. Load messages on chat switch
    useEffect(() => {
        const jid = selectedChat?.jid;
        if (jid) {
            prevMessagesCountRef.current = 0;
            loadMessages(jid, false);
        } else {
            setMessages([]);
        }
    }, [selectedChat?.jid, loadMessages]);

    // 3. Real-time WhatsApp events via WebSockets (Eliminates 4.5s & 10s polling!)
    useKonnectxSocket({
        workspaceId,
        onStatusUpdate: (data) => {
            setIsConnected(data.status === 'CONNECTED');
        },
        onNewMessage: (data) => {
            const incomingMsg = data?.message;
            if (!incomingMsg) return;

            // 1. If incoming message belongs to currently open chat, append to messages
            if (data.jid === selectedChatRef.current?.jid) {
                setMessages(prev => {
                    const exists = prev.some(m =>
                        (m.id && m.id === incomingMsg.id) ||
                        (m.waId && incomingMsg.waId && m.waId === incomingMsg.waId) ||
                        (m.fromMe && incomingMsg.fromMe && m.text === incomingMsg.text && Math.abs((m.timestamp || 0) - (incomingMsg.timestamp || 0)) < 10000)
                    );
                    if (exists) {
                        return prev.map(m =>
                            (m.id === incomingMsg.id || (m.waId && incomingMsg.waId && m.waId === incomingMsg.waId))
                                ? { ...m, ...incomingMsg }
                                : m
                        );
                    }
                    return [...prev, incomingMsg];
                });
            }

            // 2. Update conversation thread in left sidebar & bump to top
            setConversations(prev => {
                const targetJid = data.jid;
                const existingIndex = prev.findIndex(c => c.jid === targetJid);
                const isCurrentlySelected = selectedChatRef.current?.jid === targetJid;

                if (existingIndex !== -1) {
                    const existingChat = prev[existingIndex];
                    const updatedChat = {
                        ...existingChat,
                        lastMessage: incomingMsg.text || existingChat.lastMessage,
                        timestamp: incomingMsg.timestamp || Date.now(),
                        unreadCount: isCurrentlySelected ? 0 : ((existingChat.unreadCount || 0) + (incomingMsg.fromMe ? 0 : 1))
                    };
                    const withoutExisting = prev.filter((_, idx) => idx !== existingIndex);
                    return [updatedChat, ...withoutExisting];
                }

                // New conversation thread
                const cleanPhone = targetJid.replace('@s.whatsapp.net', '').replace('@g.us', '');
                const newChat = {
                    jid: targetJid,
                    name: incomingMsg.name || `+${cleanPhone}`,
                    phone: cleanPhone,
                    lastMessage: incomingMsg.text || '',
                    timestamp: incomingMsg.timestamp || Date.now(),
                    unreadCount: isCurrentlySelected ? 0 : (incomingMsg.fromMe ? 0 : 1)
                };
                return [newChat, ...prev];
            });
        },
        onMessageStatus: (data) => {
            if (!data?.messageId || !data?.status) return;
            setMessages(prev =>
                prev.map(m =>
                    (m.id === data.messageId || m.waId === data.messageId)
                        ? { ...m, status: data.status }
                        : m
                )
            );
        }
    });

    // Send Message
    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!inputText.trim() || !selectedChat?.jid || isSending) return;

        const textToSend = inputText.trim();
        setInputText('');
        setIsSending(true);

        // Optimistic UI update
        const tempMsg = {
            id: `temp_${Date.now()}`,
            jid: selectedChat.jid,
            text: textToSend,
            fromMe: true,
            status: 'PENDING',
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            const res = await sendChatMessageAction(workspaceId, {
                jid: selectedChat.jid,
                text: textToSend
            });

            if (!res.success) throw new Error(res.error);

            // Replace temp message with server response
            setMessages(prev =>
                prev.map(m => m.id === tempMsg.id ? res.message : m)
            );

            // Update conversation snippet in sidebar
            setConversations(prev =>
                prev.map(c =>
                    c.jid === selectedChat.jid
                        ? { ...c, lastMessage: textToSend, timestamp: Date.now() }
                        : c
                )
            );
        } catch (err) {
            toast.error(err.message || "Failed to send message");
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
        } finally {
            setIsSending(false);
        }
    };

    // Filter conversations
    const filteredConversations = conversations.filter(c =>
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-background">
            {/* Top Bar with Device Connection Alert if Disconnected */}
            {!isConnected && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-amber-400 font-medium">
                        <AlertCircle size={15} className="shrink-0" />
                        <span>Phone not connected: Link your WhatsApp account via QR code to enable 2-way real-time messaging.</span>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => setIsConnectModalOpen(true)}
                        className="h-7 text-xs bg-amber-500 hover:bg-amber-600 text-black font-bold gap-1 px-3 shrink-0 rounded-lg"
                    >
                        <QrCode size={13} />
                        Link WhatsApp Device
                    </Button>
                </div>
            )}

            <div className="flex-1 flex overflow-hidden">
                {/* Left Pane: Conversations List */}
                <div className="w-80 md:w-96 border-r border-border/40 bg-card/20 flex flex-col shrink-0">
                    {/* Header & Quick Action Buttons */}
                    <div className="p-3 border-b border-border/20 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    onClick={() => router.push(`/workspace/${workspaceId}/konnectx-legacy`)}
                                    title="Back to Konnect Suite"
                                >
                                    <ArrowLeft size={15} />
                                </Button>
                                <h1 className="text-sm font-bold text-foreground">Live Chats</h1>
                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                    {conversations.length}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    onClick={handleSyncChats}
                                    disabled={isSyncing}
                                    title="Sync phone messages and contacts"
                                >
                                    <RefreshCw size={13} className={isSyncing || loadingChats ? "animate-spin text-emerald-400" : ""} />
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setIsNewChatOpen(true)}
                                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1 px-2.5 rounded-lg shadow-sm"
                                    title="Start new conversation"
                                >
                                    <MessageSquarePlus size={13} />
                                    <span>New Chat</span>
                                </Button>
                            </div>
                        </div>

                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8 pl-8 text-xs bg-background/50 border-border/40 rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Chat List Items */}
                    <ScrollArea className="flex-1">
                        {loadingChats ? (
                            <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                                <Loader2 size={18} className="animate-spin text-emerald-400" />
                                <span>Loading conversation threads...</span>
                            </div>
                        ) : filteredConversations.length > 0 ? (
                            <div className="divide-y divide-border/10">
                                {filteredConversations.map((chat) => {
                                    const isSelected = selectedChat?.jid === chat.jid;
                                    return (
                                        <div
                                            key={chat.jid}
                                            onClick={() => setSelectedChat(chat)}
                                            className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                                                isSelected ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-muted/10'
                                            }`}
                                        >
                                            <Avatar className="h-9 w-9 border border-primary/20 shrink-0">
                                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                                    {chat.name.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-xs font-bold text-foreground truncate">{chat.name}</h4>
                                                    <span className="text-[10px] text-muted-foreground font-mono">
                                                        {chat.timestamp && !isNaN(new Date(chat.timestamp).getTime()) ? new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                                    {chat.lastMessage || 'No messages yet'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-6 text-center text-xs text-muted-foreground space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-muted/20 border border-border/30 mx-auto flex items-center justify-center text-muted-foreground/60">
                                    <MessageSquare size={20} />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold text-foreground text-xs">No active conversations found</p>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        Send a new message to any number or sync your linked phone history.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 pt-1">
                                    <Button
                                        size="sm"
                                        onClick={() => setIsNewChatOpen(true)}
                                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 rounded-xl shadow-xs"
                                    >
                                        <MessageSquarePlus size={13} />
                                        <span>Start First Chat</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSyncChats}
                                        disabled={isSyncing}
                                        className="h-8 text-xs border-border/50 text-foreground gap-1.5 rounded-xl"
                                    >
                                        <RefreshCw size={12} className={isSyncing ? "animate-spin text-emerald-400" : ""} />
                                        <span>Sync Phone Messages</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsConnectModalOpen(true)}
                                        className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-xl"
                                    >
                                        <QrCode size={12} />
                                        <span>Re-link WhatsApp / Fresh QR</span>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Main Pane: Active Conversation & Bubble Stream */}
                {selectedChat ? (
                    <div className="flex-1 flex flex-col bg-card/10 overflow-hidden">
                        {/* Conversation Header */}
                        <div className="p-3.5 border-b border-border/20 bg-background/50 backdrop-blur-md flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border border-primary/20">
                                    <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                                        {selectedChat.name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-bold text-foreground">{selectedChat.name}</h3>
                                        <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                            Linked WhatsApp
                                        </Badge>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-mono">+{selectedChat.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => loadMessages(selectedChat.jid)}
                                    className="h-7 text-xs border-border/40 gap-1 text-muted-foreground hover:text-foreground rounded-lg"
                                >
                                    <RefreshCw size={12} className={loadingMessages ? "animate-spin" : ""} />
                                    <span>Sync</span>
                                </Button>
                            </div>
                        </div>

                        {/* Message Bubble Stream */}
                        <ScrollArea className="flex-1 p-4 space-y-3">
                            {messages.length > 0 ? (
                                <div className="space-y-3 max-w-3xl mx-auto">
                                    {messages.map((msg, idx) => {
                                        const isMe = msg.fromMe;
                                        return (
                                            <div
                                                key={msg.id || idx}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 shadow-xs text-xs space-y-1 ${
                                                        isMe
                                                            ? 'bg-emerald-600 text-white rounded-tr-none'
                                                            : 'bg-card border border-border/40 text-foreground rounded-tl-none'
                                                    }`}
                                                >
                                                    <p className="leading-relaxed whitespace-pre-wrap select-text">{msg.text}</p>
                                                    <div className={`flex items-center justify-end gap-1 text-[9px] ${
                                                        isMe ? 'text-emerald-100/80' : 'text-muted-foreground'
                                                    }`}>
                                                        <span>{msg.timestamp && !isNaN(new Date(msg.timestamp).getTime()) ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                                        {isMe && (
                                                            msg.status === 'READ' ? <CheckCheck size={12} className="text-cyan-300" /> :
                                                            msg.status === 'DELIVERED' ? <CheckCheck size={12} /> :
                                                            msg.status === 'SENT' ? <Check size={12} /> :
                                                            <Clock size={10} className="animate-spin" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground text-xs space-y-2">
                                    <MessageSquare size={32} className="text-muted-foreground/40" />
                                    <p className="font-semibold text-foreground text-xs">No message history yet</p>
                                    <p className="text-[11px] max-w-sm">Type a message below to initiate communication with this contact from your linked mobile phone.</p>
                                </div>
                            )}
                        </ScrollArea>

                        {/* Input Composer Bar */}
                        <form
                            onSubmit={handleSendMessage}
                            className="p-3 border-t border-border/20 bg-background/50 backdrop-blur-md flex items-center gap-2"
                        >
                            <Input
                                placeholder="Type a message (Enter to send)..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="h-9 text-xs bg-background/60 border-border/50 rounded-xl"
                                disabled={!isConnected}
                            />
                            <Button
                                type="submit"
                                size="sm"
                                disabled={!inputText.trim() || isSending || !isConnected}
                                className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md gap-1.5"
                            >
                                {isSending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                                <span>Send</span>
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground text-xs space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-muted/20 border border-border/40 text-muted-foreground flex items-center justify-center">
                            <MessageSquare size={26} />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Select a Conversation</h3>
                        <p className="text-[11px] max-w-xs text-muted-foreground">
                            Pick a chat from the left pane, or click &quot;New Chat&quot; to message any WhatsApp phone number.
                        </p>
                        <Button
                            size="sm"
                            onClick={() => setIsNewChatOpen(true)}
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 rounded-xl shadow-xs mt-1"
                        >
                            <MessageSquarePlus size={13} />
                            <span>Start New Chat</span>
                        </Button>
                    </div>
                )}
            </div>

            {/* Connection QR Modal */}
            <WhatsAppConnectionModal
                isOpen={isConnectModalOpen}
                onClose={() => setIsConnectModalOpen(false)}
                workspaceId={workspaceId}
                onStatusChange={(res) => setIsConnected(res.status === 'CONNECTED')}
            />

            {/* New Chat Modal */}
            <NewChatModal
                isOpen={isNewChatOpen}
                onClose={() => setIsNewChatOpen(false)}
                workspaceId={workspaceId}
                onChatCreated={handleChatCreated}
            />
        </div>
    );
}
