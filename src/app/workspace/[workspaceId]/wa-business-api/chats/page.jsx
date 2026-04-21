"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
    Search, MoreVertical, Phone, Video, Send, Smile, Paperclip,
    Check, CheckCheck, AlertCircle, Users, Layout, ArrowLeft, Loader2, MessageSquare
} from "lucide-react";
import { useAction } from "@/hooks/use-action";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { getConversations } from "../_actions/get-conversations";
import { sendMessage } from "../_actions/send-message";

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
            return <Check className="w-3.5 h-3.5 text-emerald-300/60" title="Sent" />;
        case 'FAILED':
            return <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" title="Failed" />;
        default:
            return <Check className="w-3.5 h-3.5 text-emerald-300/50" />;
    }
};

export default function WhatsAppWebChatsPage() {
    const { workspaceId } = useParams();
    const [conversations, setConversations] = useState([]);
    const [selectedJid, setSelectedJid] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const scrollRef = useRef(null);

    const selectedChat = conversations.find(c => c.jid === selectedJid);
    const activeName = selectedChat?.name || selectedJid?.split('@')[0] || "Unknown";

    const { execute: executeGetConversations } = useAction(getConversations, {
        onSuccess: (data) => {
            setConversations(data.conversations || []);
            setIsLoading(false);
        },
        onError: () => setIsLoading(false)
    });

    const { execute: executeSendMessage } = useAction(sendMessage, {
        onSuccess: () => {
            toast.success('Message sent!');
            executeGetConversations({ workspaceId });
        },
        onSettled: () => setIsSending(false)
    });

    useEffect(() => {
        if (workspaceId) {
            executeGetConversations({ workspaceId });
            const interval = setInterval(() => executeGetConversations({ workspaceId }), 15000);
            return () => clearInterval(interval);
        }
    }, [workspaceId, executeGetConversations]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedChat]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedJid) return;
        setIsSending(true);
        executeSendMessage({ workspaceId, to: selectedJid, type: 'text', body: newMessage });
        setNewMessage("");
    };

    const filteredConversations = conversations.filter(c =>
        (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.jid.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading && conversations.length === 0) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col overflow-hidden">


            {/* Header Mirror */}
            <div className="p-5 border-b border-border/50 bg-card/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Business Messenger</h1>
                        <p className="text-xs text-muted-foreground  font-bold ">Protocol Active</p>
                    </div>
                </div>
                <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                    <Input
                        placeholder="Search conversations..."
                        className="bg-background/50 border-border/40 pl-9 h-10 text-xs rounded-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex h-full overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 border-r border-border/50 flex flex-col bg-card/10">
                    <ScrollArea className="flex-1">
                        <div className="flex flex-col">
                            {filteredConversations.length > 0 ? filteredConversations.map((chat) => (
                                <div
                                    key={chat.jid}
                                    onClick={() => setSelectedJid(chat.jid)}
                                    className={`flex items-center gap-3 p-4 border-b border-border/20 cursor-pointer transition-all hover:bg-primary/5 group ${selectedJid === chat.jid ? 'bg-primary/10 border-r-2 border-r-primary' : ''}`}
                                >
                                    <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                            {(chat.name || chat.jid).substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h3 className="text-xs font-bold truncate group-hover:text-primary transition-colors">{chat.name || chat.jid}</h3>
                                            <span className="text-[9px] text-muted-foreground">
                                                {chat.timestamp ? formatDistanceToNow(chat.timestamp * 1000) : 'now'}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground truncate opacity-70">
                                            {chat.lastMessage}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center p-12 text-center opacity-30 mt-20">
                                    <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mb-4 border border-dashed border-primary/20">
                                        <MessageSquare className="w-8 h-8 text-primary/50" />
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/80">No Active Links</h4>
                                    <p className="text-[9px] mt-1 font-medium">Capture a signal to start a protocol.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 min-w-0 bg-background/30 flex flex-col">
                    {selectedJid ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-6 h-16 border-b border-border/50 bg-card/20 backdrop-blur-md flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10 border border-border/50">
                                        <AvatarFallback className="bg-emerald-500/10 text-emerald-500 font-bold">
                                            {activeName.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="text-sm font-bold">{activeName}</h2>
                                        <p className="text-[10px] text-emerald-500 font-bold">Online</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-40">
                                    <Button variant="ghost" size="icon" className="rounded-full w-9 h-9"><Video className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" className="rounded-full w-9 h-9"><Phone className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" className="rounded-full w-9 h-9"><MoreVertical className="w-4 h-4" /></Button>
                                </div>
                            </div>

                            {/* Messages Container */}
                            <ScrollArea className="flex-1 p-6 relative">
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#005a4a 0.5px, transparent 0.5px)', backgroundSize: '15px 15px' }} />
                                <div className="flex flex-col gap-4 relative z-10">
                                    {selectedChat?.messages?.slice().reverse().map((msg) => (
                                        <div key={msg.id} className={`flex w-full ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className="relative group max-w-[80%]">
                                                <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm ${msg.fromMe
                                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                    : 'bg-card border border-border/50 rounded-tl-none'}`}
                                                >
                                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                                    {/* Bubble Tails */}
                                                    {msg.fromMe ? (
                                                        <div className="absolute -right-[6px] top-0 w-0 h-0 border-t-8 border-t-primary border-r-8 border-r-transparent" />
                                                    ) : (
                                                        <div className="absolute -left-[6px] top-0 w-0 h-0 border-t-8 border-t-card border-l-8 border-l-transparent" />
                                                    )}
                                                </div>
                                                <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] px-1 ${msg.fromMe ? 'text-primary/60' : 'text-muted-foreground/60'}`}>
                                                    {formatDistanceToNow(new Date(msg.timestamp * 1000))} ago
                                                    {msg.fromMe && <MessageStatus status={msg.status} />}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={scrollRef} />
                                </div>
                            </ScrollArea>

                            {/* Chat Input */}
                            <div className="p-4 bg-card/30 backdrop-blur-sm border-t border-border/50">
                                <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                                    <div className="flex-1 relative">
                                        <Input
                                            className="bg-background/50 border-border/30 h-12 rounded-full px-5 text-sm focus-visible:ring-primary/20 w-full"
                                            placeholder="Secure protocol message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                            <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:text-primary"><Smile className="w-4 h-4" /></Button>
                                            <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:text-primary"><Paperclip className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={!newMessage.trim() || isSending}
                                        className="rounded-full w-12 h-12 p-0 bg-primary hover:bg-primary/90 shrink-0 shadow-lg shadow-primary/20"
                                    >
                                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-40">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                <MessageSquare className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold">Initialize Session</h3>
                            <p className="text-sm max-w-[240px] mt-2">Select a conversation from the sidebar to establish a secure link.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
