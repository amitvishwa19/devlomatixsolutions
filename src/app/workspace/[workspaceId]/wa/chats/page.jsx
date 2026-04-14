"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
    Search,
    MoreVertical,
    Phone,
    Video,
    Send,
    Smile,
    Paperclip,
    Check,
    CheckCheck,
    AlertCircle,
    User,
    MessageSquare,
    Loader2,
    ArrowLeft,
    Eye
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-hot-toast";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatTemplatePreview from "./_components/ChatTemplatePreview";
import TemplateMessage from "./_components/TemplateMessage";
import { Users } from "lucide-react";

// Message Status Indicator Component
const MessageStatus = ({ status }) => {
    switch (status) {
        case 'PENDING':
            return <Loader2 className="w-3 h-3 text-zinc-400 animate-spin" title="Sending..." />;
        case 'READ':
            return <CheckCheck className="w-3.5 h-3.5 text-blue-400" title="Read" />;
        case 'DELIVERED':
            return <CheckCheck className="w-3.5 h-3.5 text-emerald-300/80" title="Delivered" />;
        case 'SENT':
            return <Check className="w-3.5 h-3.5 text-emerald-300/60" title="Sent to Meta" />;
        case 'FAILED':
            return <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" title="Message Failed" />;
        default:
            return <Check className="w-3.5 h-3.5 text-emerald-300/50" />;
    }
};

export default function WhatsAppChatsPage() {
    const { workspaceId } = useParams();
    const [conversations, setConversations] = useState([]);
    const [selectedJid, setSelectedJid] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [templates, setTemplates] = useState([]);
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const [allContacts, setAllContacts] = useState([]);
    const [activeTab, setActiveTab] = useState("chats");
    const [isFetchingContacts, setIsFetchingContacts] = useState(false);

    const scrollRef = useRef(null);

    // Derived State: Get the actual chat object based on selectedJid
    const selectedChat = conversations.find(c => c.jid === selectedJid);
    const selectedContact = allContacts.find(c => (c.phone + "@s.whatsapp.net") === selectedJid);

    // Display name for the header
    const activeName = selectedChat?.name || selectedContact?.name || selectedJid?.split('@')[0];

    // Fetch conversations and history
    const fetchConversations = async () => {
        try {
            const res = await fetch(`/api/wa/conversations`);
            const data = await res.json();
            if (data.success) {
                setConversations(prevConversations => {
                    // Merge logic: keep local "temp_" messages that aren't yet on server
                    const incomingConvMap = new Map(data.conversations.map(c => [c.jid, c]));
                    
                    const mergedResults = data.conversations.map(newConv => {
                        const prevConv = prevConversations.find(p => p.jid === newConv.jid);
                        if (!prevConv) return newConv;

                        // Filter for temp messages in local state
                        const localTempMsgs = prevConv.messages.filter(m => 
                            String(m.id).startsWith('temp_') && 
                            // Optimization: If server now has a message with same text sent recently, 
                            // we assume it's the same message confirmed and hide the temp one
                            !newConv.messages.some(nm => nm.text === m.text && Math.abs(nm.timestamp - m.timestamp) < 30)
                        );

                        return {
                            ...newConv,
                            messages: [...localTempMsgs, ...newConv.messages]
                        };
                    });

                    // Handle entirely new chats created locally that aren't on server yet
                    prevConversations.forEach(prevConv => {
                        if (!incomingConvMap.has(prevConv.jid)) {
                            const hasTemp = prevConv.messages.some(m => String(m.id).startsWith('temp_'));
                            if (hasTemp) mergedResults.push(prevConv);
                        }
                    });

                    // Sort by timestamp if we added local-only chats
                    return mergedResults.sort((a, b) => b.timestamp - a.timestamp);
                });

                // Functional update to avoid stale closure in setInterval
                setSelectedJid(currentJid => {
                    // Auto-select first chat ONLY if nothing is selected yet
                    if (!currentJid && data.conversations.length > 0) {
                        return data.conversations[0].jid;
                    }
                    return currentJid;
                });
            }
        } catch (error) {
            console.error("Failed to fetch conversations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchContacts = async () => {
        setIsFetchingContacts(true);
        try {
            const res = await fetch(`/api/wa/contacts?workspaceId=${workspaceId}`);
            const data = await res.json();
            setAllContacts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch contacts:", error);
        } finally {
            setIsFetchingContacts(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const res = await fetch(`/api/wa/templates`);
            const data = await res.json();
            if (data.success) {
                setTemplates(data.templates || []);
            }
        } catch (error) {
            console.error("Failed to fetch templates:", error);
        }
    };

    useEffect(() => {
        fetchConversations();
        fetchTemplates();
        fetchContacts();
        // Polling every 5 seconds for real-time status updates
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Scroll to bottom when selectedChat or messages change
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedChat]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const textToSend = newMessage.trim();
        if (!textToSend || !selectedJid) return;

        const tempId = `temp_${Date.now()}`;
        const optimisticMsg = {
            id: tempId,
            waId: tempId,
            text: textToSend,
            fromMe: true,
            timestamp: Math.floor(Date.now() / 1000),
            status: 'PENDING',
            metadata: { type: 'text' }
        };

        // UI OPTIMISTIC UPDATE
        setConversations(prev => prev.map(conv => {
            if (conv.jid === selectedJid) {
                return {
                    ...conv,
                    lastMessage: textToSend,
                    timestamp: optimisticMsg.timestamp,
                    messages: [optimisticMsg, ...conv.messages]
                };
            }
            return conv;
        }));

        setNewMessage("");
        setIsSending(true);

        try {
            const res = await fetch(`/api/wa/send-cloud-api`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: selectedJid,
                    type: 'text',
                    body: textToSend
                })
            });

            if (res.ok) {
                // Success - Update status to SENT locally
                setConversations(prev => prev.map(conv => {
                    if (conv.jid === selectedJid) {
                        return {
                            ...conv,
                            messages: conv.messages.map(m => 
                                m.id === tempId ? { ...m, status: 'SENT' } : m
                            )
                        };
                    }
                    return conv;
                }));
            } else {
                toast.error("Failed to send message");
                // Rollback
                setConversations(prev => prev.map(conv => {
                    if (conv.jid === selectedJid) {
                        return {
                            ...conv,
                            messages: conv.messages.filter(m => m.id !== tempId)
                        };
                    }
                    return conv;
                }));
            }
        } catch (error) {
            toast.error("Error sending message");
            // Rollback
            setConversations(prev => prev.map(conv => {
                if (conv.jid === selectedJid) {
                    return {
                        ...conv,
                        messages: conv.messages.filter(m => m.id !== tempId)
                    };
                }
                return conv;
            }));
        } finally {
            setIsSending(false);
        }
    };

    const handleTemplateClick = (msg) => {
        const templateName = msg.metadata?.originalPayload?.template?.name || msg.metadata?.templateName;
        if (!templateName) return;

        console.log(`[Preview] Looking for template: ${templateName}`);

        const foundTemplate = templates.find(t =>
            t.templateName === templateName || t.name === templateName
        );

        if (foundTemplate) {
            setPreviewTemplate(foundTemplate);
            setIsPreviewOpen(true);
        } else {
            toast.error("Template details not found locally.");
        }
    };

    const filteredConversations = conversations.filter(c =>
        c.jid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredContacts = allContacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm)
    );

    const handleTabChange = (value) => {
        setActiveTab(value);

        // If switching back to "chats" and the current selectedJid doesn't exist in conversations,
        // either select the first active conversation or clear the selection
        if (value === "chats" && selectedJid) {
            const exists = conversations.some(c => {
                const normalizedCid = c.jid.replace(/\D/g, '').split('@')[0] + "@s.whatsapp.net";
                const cleanSelectedJid = selectedJid.replace(/\D/g, '').split('@')[0] + "@s.whatsapp.net";
                return normalizedCid === cleanSelectedJid;
            });
            if (!exists) {
                if (conversations.length > 0) {
                    setSelectedJid(conversations[0].jid);
                } else {
                    setSelectedJid(null);
                }
            }
        }
    };

    if (isLoading && conversations.length === 0) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div id='main-content-container' className="h-full flex flex-col overflow-hidden shadow-2xl transition-all ">


            <div className="p-5 border-b border-border/50 bg-card/20 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <h1 className="text-xl font-bold tracking-tight">WhatsApp Chats</h1>
                    </div>
                    <div className="relative w-80 border rounded-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                        <Input
                            placeholder={`Search ${activeTab}...`}
                            className="bg-background/50 border-border/40 pl-9 h-9 text-xs rounded-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

            </div>


            <div className="flex h-full">
                <div className="w-1/4 border-r border-border/50 flex flex-col">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col h-full">


                        <div className="px-4 h-14 py-2 border-b border-border/50 bg-muted/5">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="chats" className="text-xs h-7">Chats</TabsTrigger>
                                <TabsTrigger value="contacts" className="text-xs h-7">Contacts</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="chats" className="flex-1 min-h-0 m-0 p-0 border-0 data-[state=active]:flex flex-col">
                            <ScrollArea id="chats-contacts-list" className="flex-1 min-h-0 h-full [&>div>div]:h-full ">
                                <div id="chats-contacts-list-content" className="flex flex-col h-full ">
                                    {filteredConversations.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center flex-1 h-full text-center p-8 animate-in fade-in zoom-in duration-700">
                                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 relative">
                                                <MessageSquare className="w-8 h-8 text-primary/60" />
                                                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping duration-[3000ms]" />
                                            </div>
                                            <h3 className="text-sm font-bold text-zinc-800 mb-1">No Conversations Yet</h3>
                                            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                                                Your message history will appear here. Start a new chat from the contacts tab!
                                            </p>
                                        </div>
                                    ) : (
                                        filteredConversations.map((chat) => (
                                            <div
                                                key={chat.jid}
                                                onClick={() => setSelectedJid(chat.jid)}
                                                className={`flex items-center gap-3 p-4 border-b border-border/20 cursor-pointer transition-all hover:bg-primary/5 group ${selectedJid === chat.jid ? 'bg-primary/10 border-r-2 border-r-primary' : ''}`}
                                            >
                                                <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                                        {(chat.name || chat.jid).substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <h3 className="text-xs font-bold truncate group-hover:text-primary transition-colors">{chat.name || chat.jid}</h3>
                                                        <span className="text-[9px] text-muted-foreground">
                                                            {formatDistanceToNow(chat.timestamp)}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground truncate opacity-70">
                                                        {chat.fromMe && <span className="text-[9px] uppercase font-bold mr-1 text-primary/60">You:</span>}
                                                        {chat.lastMessage}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="contacts" className="flex-1 min-h-0 m-0 p-0 border-0 data-[state=active]:flex flex-col ">
                            <ScrollArea className="flex-1 min-h-0 h-full [&>div>div]:h-full">
                                <div className="flex flex-col h-full">
                                    {filteredContacts.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center flex-1 h-full text-center p-8 animate-in fade-in zoom-in duration-700">
                                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 relative">
                                                <Users className="w-8 h-8 text-emerald-500/60" />
                                                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping duration-[3000ms]" />
                                            </div>
                                            <h3 className="text-sm font-bold text-zinc-800 mb-1">Contacts list is empty</h3>
                                            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                                                We couldn't find any contacts matching your search or in this workspace.
                                            </p>
                                        </div>
                                    ) : (
                                        filteredContacts.map((contact) => {
                                            const normalizedJid = contact.phone.replace(/\D/g, '') + "@s.whatsapp.net";
                                            return (
                                                <div
                                                    key={contact.id}
                                                    onClick={() => setSelectedJid(normalizedJid)}
                                                    className={`flex items-center gap-3 p-4 border-b border-border/20 cursor-pointer transition-all hover:bg-primary/5 group ${selectedJid === normalizedJid ? 'bg-primary/10 border-r-2 border-r-primary' : ''}`}
                                                >
                                                    <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                                                        <AvatarFallback className="bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                                                            {(contact.name || contact.phone).substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-0.5">
                                                            <h3 className="text-xs font-bold truncate group-hover:text-primary transition-colors">{contact.name}</h3>
                                                            <Badge variant="outline" className="text-[8px] py-0 h-3 opacity-50">
                                                                {contact.type || "Contact"}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-[11px] text-muted-foreground truncate opacity-70">
                                                            {contact.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="flex-1 min-w-0 bg-background/30 backdrop-blur-[2px]">
                    {selectedJid ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-4 h-14 border-b border-border/50 bg-card/20 backdrop-blur-md flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Button variant="ghost" size="icon" className="md:hidden">
                                        <ArrowLeft className="w-4 h-4" />
                                    </Button>
                                    <Avatar className="w-10 h-10 border border-border/50">
                                        <AvatarFallback className="bg-emerald-500/10 text-emerald-500 font-bold">
                                            {(activeName || '??').substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="text-sm font-bold">{activeName}</h2>
                                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tight">
                                            {selectedChat ? "Active Conversation" : "New Chat"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 opacity-60 hover:opacity-100">
                                        <Video className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 opacity-60 hover:opacity-100">
                                        <Phone className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 opacity-60 hover:opacity-100">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <ScrollArea className="h-[75vh] p-6 relative">
                                {/* WhatsApp-style Background Pattern Overlay */}
                                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#005a4a 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />

                                <div className="flex flex-col gap-3 relative z-10">
                                    {!selectedChat || selectedChat.messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                            <MessageSquare className="w-12 h-12 mb-4" />
                                            <p className="text-sm font-medium italic">Starting a new conversation...</p>
                                        </div>
                                    ) : (
                                        selectedChat.messages.slice().reverse().map((msg, i) => {
                                            const isTemplate = msg.metadata?.type === 'template';
                                            const templateName = msg.metadata?.originalPayload?.template?.name || msg.metadata?.templateName;
                                            const templateDef = isTemplate ? templates.find(t => t.templateName === templateName || t.name === templateName) : null;

                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex w-full mb-4 ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className="relative group max-w-[85%]">
                                                        {isTemplate ? (
                                                            <div 
                                                                onClick={() => handleTemplateClick(msg)}
                                                                className="cursor-pointer transition-transform active:scale-[0.98]"
                                                            >
                                                                <TemplateMessage 
                                                                    msg={msg} 
                                                                    templateDefinition={templateDef} 
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div
                                                                className={`relative px-4 py-2.5 rounded-2xl shadow-sm text-sm transition-all duration-200 ${msg.fromMe
                                                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                                    : 'bg-card border border-border/50 rounded-tl-none'
                                                                    }`}
                                                            >
                                                                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                                                
                                                                {/* Source Tail (Bubble Hook) for regular text */}
                                                                {msg.fromMe ? (
                                                                    <div className="absolute -right-[6px] top-0 w-0 h-0 border-t-8 border-t-primary border-r-8 border-r-transparent" />
                                                                ) : (
                                                                    <div className="absolute -left-[6px] top-0 w-0 h-0 border-t-8 border-t-card border-l-8 border-l-transparent" />
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Common Meta Info (Time & Status) */}
                                                        <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] px-1 ${msg.fromMe ? 'text-primary/60' : 'text-muted-foreground/60'}`}>
                                                            {formatDistanceToNow(new Date(msg.timestamp * 1000))} ago
                                                            {msg.fromMe && <MessageStatus status={msg.status} />}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={scrollRef} />
                                </div>
                            </ScrollArea>

                            {/* Chat Input */}
                            <div className="p-4 bg-card/30 backdrop-blur-sm border-t border-border/50 flex items-center gap-3">
                                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary transition-colors">
                                    <Smile className="w-5 h-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary transition-colors">
                                    <Paperclip className="w-5 h-5" />
                                </Button>

                                <form onSubmit={handleSendMessage} className="flex-1 flex gap-3">
                                    <Input
                                        className="bg-background/50 border-border/30 h-10 rounded-full px-4 text-xs focus-visible:ring-primary/20"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <Button
                                        type="submit"
                                        disabled={!newMessage.trim() || isSending}
                                        className="rounded-full w-10 h-10 p-0 bg-primary hover:bg-primary/90 shrink-0"
                                    >
                                        {isSending ? <Loader2 className="w-4 h-4 animate-spin font-bold" /> : <Send className="w-4 h-4" />}
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div id='chat-empty' className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full bg-muted/5 animate-in fade-in zoom-in duration-700">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 relative">
                                <MessageSquare className="w-8 h-8 text-primary/60" />
                                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping duration-[3000ms]" />
                            </div>

                            <h3 className="text-sm font-bold text-zinc-800 mb-1">Select a conversation</h3>
                            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed opacity-80">
                                Choose from your existing chats or find a colleague in the contacts tab to begin messaging.
                            </p>
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
}
