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
import ChatTemplatePreview from "./_components/ChatTemplatePreview";

// Message Status Indicator Component
const MessageStatus = ({ status }) => {
    switch (status) {
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
    
    const scrollRef = useRef(null);

    // Derived State: Get the actual chat object based on selectedJid
    const selectedChat = conversations.find(c => c.jid === selectedJid);

    // Fetch conversations and history
    const fetchConversations = async () => {
        try {
            const res = await fetch(`/api/wa/conversations`);
            const data = await res.json();
            if (data.success) {
                setConversations(data.conversations);
                
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
        if (!newMessage.trim() || !selectedChat) return;

        setIsSending(true);
        try {
            const res = await fetch(`/api/wa/send-cloud-api`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: selectedChat.jid,
                    type: 'text',
                    body: newMessage.trim()
                })
            });

            if (res.ok) {
                setNewMessage("");
                // Immediate local update for better UX before polling kicks in
                fetchConversations();
            } else {
                toast.error("Failed to send message");
            }
        } catch (error) {
            toast.error("Error sending message");
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
        c.jid.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading && conversations.length === 0) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-100px)] bg-background/50 border rounded-2xl overflow-hidden shadow-2xl transition-all">
            
            {/* Sidebar: Conversations List */}
            <Card className="w-full md:w-80 lg:w-96 rounded-none border-0 border-r flex flex-col bg-card/10">
                <div className="p-5 border-b border-border/50 bg-card/20 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold tracking-tight">WhatsApp Chats</h1>
                        <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
                            <MessageSquare className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                        <Input 
                            placeholder="Search chats..." 
                            className="bg-background/50 border-border/40 pl-9 h-9 text-xs" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="flex flex-col">
                        {filteredConversations.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <p className="text-sm">No conversations found</p>
                            </div>
                        ) : (
                            filteredConversations.map((chat) => (
                                <div 
                                    key={chat.jid}
                                    onClick={() => setSelectedJid(chat.jid)}
                                    className={`flex items-center gap-3 p-4 border-b border-border/20 cursor-pointer transition-all hover:bg-primary/5 group ${selectedJid === chat.jid ? 'bg-primary/10 border-r-2 border-r-primary' : ''}`}
                                >
                                    <Avatar className="w-12 h-12 border-2 border-background shadow-md">
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {(chat.name || chat.jid).substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h3 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{chat.name || chat.jid}</h3>
                                            <span className="text-[10px] text-muted-foreground">
                                                {formatDistanceToNow(chat.timestamp)} ago
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate opacity-70">
                                            {chat.fromMe && <span className="text-[10px] uppercase font-bold mr-1 text-primary/60">You:</span>}
                                            {chat.lastMessage}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </Card>

            {/* Main Content: Chat Window */}
            <div className="flex-1 flex flex-col relative bg-[#fcfcfc] dark:bg-[#0b141a]/20">
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-border/50 bg-card/20 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                                <Avatar className="w-10 h-10 border border-border/50">
                                    <AvatarFallback className="bg-emerald-500/10 text-emerald-500 font-bold">
                                        {(selectedChat.name || selectedChat.jid).substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-sm font-bold">{selectedChat.name || selectedChat.jid}</h2>
                                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tight">
                                        {selectedChat.name ? selectedChat.jid : "Active Conversation"}
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
                        <ScrollArea className="flex-1 p-6 relative">
                            {/* WhatsApp-style Background Pattern Overlay */}
                            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#005a4a 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />
                            
                            <div className="flex flex-col gap-3 relative z-10">
                                {selectedChat.messages.slice().reverse().map((msg, i) => (
                                    <div 
                                        key={msg.id} 
                                        className={`flex w-full ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div 
                                            onClick={() => msg.metadata?.type === 'template' ? handleTemplateClick(msg) : null}
                                            className={`relative max-w-[75%] px-3.5 py-2 rounded-2xl shadow-sm text-sm group transition-all duration-200 ${
                                            msg.fromMe 
                                                ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                                : 'bg-card border border-border/50 rounded-tl-none'
                                            } ${msg.metadata?.type === 'template' ? 'cursor-pointer hover:ring-2 hover:ring-primary/30' : ''}`}
                                        >
                                            {msg.metadata?.type === 'template' && (
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Eye className="w-3.5 h-3.5 text-primary-foreground/40" />
                                                </div>
                                            )}
                                            <p className="leading-relaxed">{msg.text}</p>
                                            <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${msg.fromMe ? 'text-primary-foreground/70' : 'text-muted-foreground/60'}`}>
                                                {formatDistanceToNow(new Date(msg.timestamp * 1000))} ago
                                                {msg.fromMe && <MessageStatus status={msg.status} />}
                                            </div>
                                            
                                            {/* Source Tail (Bubble Hook) */}
                                            {msg.fromMe ? (
                                                <div className="absolute -right-[6px] top-0 w-0 h-0 border-t-8 border-t-primary border-r-8 border-r-transparent" />
                                            ) : (
                                                <div className="absolute -left-[6px] top-0 w-0 h-0 border-t-8 border-t-card border-l-8 border-l-transparent" />
                                            )}
                                        </div>
                                    </div>
                                ))}
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
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-muted/5">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                            <MessageSquare className="w-10 h-10 text-primary animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 tracking-tight">Select a conversation</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Click on a contact from the list on the left to view your message history or start a new conversation.
                        </p>
                    </div>
                )}
            </div>
            {/* Template Preview Modal */}
            <ChatTemplatePreview 
                template={previewTemplate}
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
            />
        </div>
    );
}
