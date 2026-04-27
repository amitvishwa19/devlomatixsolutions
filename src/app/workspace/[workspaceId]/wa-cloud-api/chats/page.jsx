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
    Users,
    Layout,
    StickyNote,
    ArrowLeft,
    Loader2,
    Sparkles,
    MessageSquare,
    Trash2
} from "lucide-react";
import { useAction } from "@/hooks/use-action";
import { getConversations } from "./_actions/get-conversations";
import { sendMessage } from "./_actions/send-message";
import { deleteConversation } from "./_actions/delete-conversation";
import { getAiSuggestions } from "./_actions/get-ai-suggestions";
import { getContacts } from "../contacts/_actions/get-contacts";
import { getTemplates } from "../template/_actions/get-templates";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import MediaBubble from "./_components/MediaBubble";
import TemplateMessage from "./_components/TemplateMessage";

// Helper: Parse lastMessage JSON and return a preview string
function renderMessagePreview(lastMessage) {
    if (!lastMessage) return "";
    try {
        const parsed = JSON.parse(lastMessage);
        if (typeof parsed === 'object' && parsed !== null) {
            const type = (parsed.type || 'text').toLowerCase();
            const text = parsed.text || "";
            
            if (type === 'text') return text;
            if (['image', 'video', 'audio', 'document', 'sticker'].includes(type)) {
                return `[${type.toUpperCase()}] ${parsed.caption || text || ""}`.trim();
            }
            if (type === 'template') return `[Template] ${text || ""}`.trim();
            if (type === 'location') return "📍 Location shared";
            
            return text || `[${type.toUpperCase()}]`;
        }
        return String(lastMessage);
    } catch (e) {
        return String(lastMessage);
    }
}

// Helper: replace {{N}} placeholders in a template body string
function fillTemplatePreview(body, vars) {
    let text = body || '';
    Object.entries(vars).forEach(([key, val]) => {
        text = text.replace(key, val || key);
    });
    return text;
}

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
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false);
    const [selectedTemplateForSend, setSelectedTemplateForSend] = useState(null);
    const [templateVars, setTemplateVars] = useState({});

    const [allContacts, setAllContacts] = useState([]);
    const [activeTab, setActiveTab] = useState("chats");
    const [isFetchingContacts, setIsFetchingContacts] = useState(false);
    
    // Delete Modal State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [jidToDelete, setJidToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const scrollRef = useRef(null);

    // Derived State: Get the actual chat object based on selectedJid
    const selectedChat = conversations.find(c => c.jid === selectedJid);
    const selectedContact = allContacts.find(c => (c.phone + "@s.whatsapp.net") === selectedJid);

    // Display name for the header
    const activeName = selectedChat?.name || selectedContact?.name || selectedJid?.split('@')[0];

    // Server Action Hooks
    const { execute: executeConversations } = useAction(getConversations, {
        onSuccess: (data) => {
            if (data.conversations) {
                setConversations(prevConversations => {
                    const incomingConvMap = new Map(data.conversations.map(c => [c.jid, c]));
                    const mergedResults = data.conversations.map(newConv => {
                        const prevConv = prevConversations.find(p => p.jid === newConv.jid);
                        if (!prevConv) return newConv;
                        const localTempMsgs = prevConv.messages.filter(m => 
                            String(m.id).startsWith('temp_') && 
                            !newConv.messages.some(nm => nm.text === m.text && Math.abs(nm.timestamp - m.timestamp) < 30)
                        );
                        return { ...newConv, messages: [...localTempMsgs, ...newConv.messages] };
                    });
                    prevConversations.forEach(prevConv => {
                        if (!incomingConvMap.has(prevConv.jid)) {
                            if (prevConv.messages.some(m => String(m.id).startsWith('temp_'))) mergedResults.push(prevConv);
                        }
                    });
                    return mergedResults.sort((a, b) => b.timestamp - a.timestamp);
                });

                setSelectedJid(currentJid => {
                    if (!currentJid && data.conversations.length > 0) return data.conversations[0].jid;
                    return currentJid;
                });
            }
            setIsLoading(false);
        },
        onError: (err) => {
            // Suppress standard "Failed to fetch" console errors as they are transient network blips
            if (err !== "Failed to fetch") {
                console.error("Conversations error:", err);
            }
            setIsLoading(false);
        }
    });

    const { execute: executeGetContacts } = useAction(getContacts, {
        onSuccess: (data) => {
            setAllContacts(Array.isArray(data) ? data : []);
            setIsFetchingContacts(false);
        },
        onError: () => setIsFetchingContacts(false)
    });

    const { execute: executeGetTemplates } = useAction(getTemplates, {
        onSuccess: (data) => setTemplates(data.templates || []),
    });

    const { execute: executeSendMessage } = useAction(sendMessage, {
        onSuccess: (data, context) => {
            setConversations(prev => prev.map(conv => {
                if (conv.jid === context.to) {
                    return {
                        ...conv,
                        messages: conv.messages.map(m => m.id === context.tempId ? { ...m, status: 'SENT' } : m)
                    };
                }
                return conv;
            }));
            toast.success('Message sent!');
        },
        onError: (err, context) => {
            toast.error(err || "Failed to send message");
            setConversations(prev => prev.map(conv => {
                if (conv.jid === context.to) {
                    return { ...conv, messages: conv.messages.filter(m => m.id !== context.tempId) };
                }
                return conv;
            }));
        },
        onSettled: () => setIsSending(false)
    });

    const { execute: executeAiSuggestions } = useAction(getAiSuggestions, {
        onSuccess: (data) => setAiSuggestions(data.suggestions || []),
        onSettled: () => setIsAiLoading(false)
    });

    const { execute: executeDeleteConversation } = useAction(deleteConversation, {
        onSuccess: (data, context) => {
            toast.success("Chat deleted");
            setConversations(prev => prev.filter(c => c.jid !== context.jid));
            if (selectedJid === context.jid) setSelectedJid(null);
            setIsDeleteDialogOpen(false);
        },
        onError: (err) => toast.error(err || "Failed to delete chat"),
        onSettled: () => setIsDeleting(false)
    });


    const fetchConversations = () => executeConversations({ workspaceId });
    const fetchContacts = () => { setIsFetchingContacts(true); executeGetContacts({ workspaceId }); };
    const fetchTemplates = () => executeGetTemplates({ workspaceId });

    const handleDeleteConversation = (e, jid) => {
        e.stopPropagation();
        setJidToDelete(jid);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!jidToDelete) return;
        setIsDeleting(true);
        executeDeleteConversation({ workspaceId, jid: jidToDelete }, { jid: jidToDelete });
    };

    useEffect(() => {
        fetchConversations();
        fetchTemplates();
        fetchContacts();
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, [workspaceId]);

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
                    lastMessage: JSON.stringify({
                        text: textToSend,
                        type: 'text',
                        timestamp: optimisticMsg.timestamp
                    }),
                    timestamp: optimisticMsg.timestamp,
                    messages: [optimisticMsg, ...conv.messages]
                };
            }
            return conv;
        }));

        setNewMessage("");
        setIsSending(true);
        executeSendMessage({ workspaceId, to: selectedJid, type: 'text', body: textToSend }, { to: selectedJid, tempId, type: 'text' });
    };

    const handleGetAiSuggestions = () => {
        if (!selectedChat || selectedChat.messages.length === 0) return;
        setIsAiLoading(true);
        executeAiSuggestions({ workspaceId, messages: selectedChat.messages.slice(-10) });
    };

    const handleApplySuggestion = (text) => {
        setNewMessage(text);
        setAiSuggestions([]);
    };

    const handleOpenTemplatePicker = () => {
        setSelectedTemplateForSend(null);
        setTemplateVars({});
        setIsTemplateDrawerOpen(true);
    };

    const handleSelectTemplate = (tpl) => {
        setSelectedTemplateForSend(tpl);
        // Parse body for variable placeholders like {{1}}, {{2}}
        const matches = (tpl.body || '').match(/\{\{(\d+)\}\}/g) || [];
        const vars = {};
        matches.forEach(m => { vars[m] = ''; });
        setTemplateVars(vars);
    };

    const handleSendTemplate = async () => {
        if (!selectedTemplateForSend || !selectedJid) return;
        
        const templateName = selectedTemplateForSend.templateName || selectedTemplateForSend.name;
        
        // Build body parameters from vars
        const bodyParams = Object.entries(templateVars).map(([, val]) => ({
            type: 'text',
            text: val || ' '
        }));

        const components = bodyParams.length > 0
            ? [{ type: 'body', parameters: bodyParams }]
            : [];

        // Build preview text for optimistic UI
        let previewText = selectedTemplateForSend.body || `[Template: ${templateName}]`;
        Object.entries(templateVars).forEach(([key, val]) => {
            previewText = previewText.replace(key, val || key);
        });

        const tempId = `temp_${Date.now()}`;
        const optimisticMsg = {
            id: tempId,
            text: previewText,
            fromMe: true,
            timestamp: Math.floor(Date.now() / 1000),
            status: 'PENDING',
            metadata: { type: 'template', templateName }
        };
        setConversations(prev => prev.map(conv => {
                return { 
                    ...conv, 
                    lastMessage: JSON.stringify({
                        text: previewText,
                        type: 'template',
                        templateName: templateName,
                        timestamp: optimisticMsg.timestamp
                    }), 
                    messages: [optimisticMsg, ...conv.messages] 
                };
            return conv;
        }));
        setIsTemplateDrawerOpen(false);
        setSelectedTemplateForSend(null);
        setTemplateVars({});
        setIsSending(true);

        executeSendMessage({
            workspaceId,
            to: selectedJid,
            type: 'template',
            template: {
                name: templateName,
                language: { code: selectedTemplateForSend.language || 'en_US' },
                components
            }
        }, { to: selectedJid, tempId, type: 'template' });
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
                                                        <span className="text-[9px] text-muted-foreground group-hover:hidden">
                                                            {formatDistanceToNow(chat.timestamp)}
                                                        </span>
                                                        <button 
                                                            onClick={(e) => handleDeleteConversation(e, chat.jid)}
                                                            className="hidden group-hover:flex p-1 hover:bg-red-100 hover:text-red-600 rounded-md transition-colors text-muted-foreground"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground truncate opacity-70">
                                                        {chat.fromMe && <span className="text-[9px] uppercase font-bold mr-1 text-primary/60">You:</span>}
                                                        {renderMessagePreview(chat.lastMessage)}
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
                                            const type = msg.metadata?.type?.toLowerCase() || 'text';
                                            const isMedia = ['image', 'video', 'audio', 'document', 'sticker', 'voice'].includes(type);
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
                                                        ) : isMedia ? (
                                                            <div className={`relative px-1 py-1 rounded-2xl shadow-sm text-sm transition-all duration-200 ${msg.fromMe
                                                                ? 'bg-primary/5 border border-primary/20 rounded-tr-none'
                                                                : 'bg-card border border-border/50 rounded-tl-none'
                                                                }`}>
                                                                <MediaBubble msg={msg} workspaceId={workspaceId} />
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
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    title="Send a Template"
                                    onClick={handleOpenTemplatePicker}
                                    className="rounded-full text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <Layout className="w-5 h-5" />
                                </Button>

                                <form onSubmit={handleSendMessage} className="flex-1 flex flex-col gap-2">
                                    {/* AI Suggestions Chips */}
                                    {aiSuggestions.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-1 animate-in slide-in-from-bottom-2 duration-300">
                                            {aiSuggestions.map((s, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => handleApplySuggestion(s)}
                                                    className="bg-primary/10 hover:bg-primary/20 text-primary text-[10px] px-2.5 py-1 rounded-full border border-primary/20 transition-colors max-w-[200px] truncate"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                            <button 
                                                type="button" 
                                                onClick={() => setAiSuggestions([])}
                                                className="text-[10px] text-muted-foreground hover:text-foreground px-2"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex gap-3 items-center">
                                        <div className="flex-1 relative">
                                            <Input
                                                className="bg-background/50 border-border/30 h-10 rounded-full px-4 text-xs focus-visible:ring-primary/20 w-full"
                                                placeholder="Type a message..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleGetAiSuggestions}
                                                disabled={isAiLoading || !selectedChat}
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-1 top-1 w-8 h-8 rounded-full text-primary hover:bg-primary/10"
                                            >
                                                {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                            </Button>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={!newMessage.trim() || isSending}
                                            className="rounded-full w-10 h-10 p-0 bg-primary hover:bg-primary/90 shrink-0"
                                        >
                                            {isSending ? <Loader2 className="w-4 h-4 animate-spin font-bold" /> : <Send className="w-4 h-4" />}
                                        </Button>
                                    </div>
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

            {/* ===== Template Picker Modal ===== */}
            {isTemplateDrawerOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-muted/10">
                            <div className="flex items-center gap-2">
                                <Layout className="w-4 h-4 text-primary" />
                                <h2 className="font-semibold text-sm">
                                    {selectedTemplateForSend ? 'Fill Variables' : 'Select a Template'}
                                </h2>
                            </div>
                            <button
                                onClick={() => { setIsTemplateDrawerOpen(false); setSelectedTemplateForSend(null); }}
                                className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 max-h-[65vh] overflow-y-auto">
                            {!selectedTemplateForSend ? (
                                /* Template List */
                                <>
                                    {templates.filter(t => t.approved || t.status === 'APPROVED').length === 0 ? (
                                        <div className="text-center py-10 text-muted-foreground">
                                            <Layout className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                            <p className="text-xs">No approved templates found.</p>
                                            <p className="text-xs opacity-70 mt-1">Sync your templates from the Templates page.</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {templates
                                                .filter(t => t.approved || t.status === 'APPROVED')
                                                .map(tpl => (
                                                    <button
                                                        key={tpl.id}
                                                        onClick={() => handleSelectTemplate(tpl)}
                                                        className="text-left p-3 rounded-xl border border-border/40 hover:border-primary/50 hover:bg-primary/5 transition-all duration-150 group"
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                                                    {tpl.name}
                                                                </p>
                                                                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                                                                    {tpl.body}
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                                <span className="text-[9px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-medium">
                                                                    APPROVED
                                                                </span>
                                                                <span className="text-[9px] text-muted-foreground uppercase">{ tpl.language || 'en' }</span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* Variable Input View */
                                <div className="flex flex-col gap-4">
                                    {/* Template Preview */}
                                    <div className="rounded-xl bg-muted/30 border border-border/40 p-3">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Preview</p>
                                        <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                                            {fillTemplatePreview(selectedTemplateForSend.body, templateVars)}
                                        </p>
                                    </div>

                                    {/* Variable Fields */}
                                    {Object.keys(templateVars).length > 0 ? (
                                        <div className="flex flex-col gap-3">
                                            <p className="text-xs font-medium text-muted-foreground">Fill in the variables:</p>
                                            {Object.keys(templateVars).map((key, idx) => (
                                                <div key={key} className="flex flex-col gap-1">
                                                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                                        Variable {idx + 1} <span className="text-primary">{key}</span>
                                                    </label>
                                                    <Input
                                                        autoFocus={idx === 0}
                                                        value={templateVars[key]}
                                                        onChange={(e) => setTemplateVars(prev => ({ ...prev, [key]: e.target.value }))}
                                                        placeholder={`Enter value for ${key}...`}
                                                        className="h-9 text-xs bg-background/60 border-border/40"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground text-center py-2">No variables required for this template.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="px-5 py-3 border-t border-border/50 bg-muted/5 flex items-center justify-between gap-3">
                            {selectedTemplateForSend ? (
                                <>
                                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelectedTemplateForSend(null)}>
                                        ← Back
                                    </Button>
                                    <Button size="sm" className="text-xs bg-primary" onClick={handleSendTemplate}>
                                        Send Template
                                    </Button>
                                </>
                            ) : (
                                <div className="text-[10px] text-muted-foreground italic">
                                    Select an approved template to continue
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete all messages in this conversation.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Chat"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
