'use client';

import React, { useEffect, useState } from 'react';
import { 
    Archive, 
    Trash2, 
    Reply, 
    ReplyAll, 
    Forward, 
    Star, 
    MoreVertical, 
    Loader2,
    X,
    Maximize2,
    Sparkles,
    Calendar,
    User,
    ChevronLeft,
    ChevronRight,
    Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import axios from '@/utils/axios';
import { useParams } from 'next/navigation';
import TipTap from '@/components/global/TipTap';
import { cn } from '@/lib/utils';

export const MailDisplay = ({ messageId, accountId, onAction }) => {
    const params = useParams();
    const workspaceId = params.workspaceId;
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [isForwarding, setIsForwarding] = useState(false);
    const [replyBody, setReplyBody] = useState('');
    const [replyTo, setReplyTo] = useState('');
    const [replySubject, setReplySubject] = useState('');
    const [summary, setSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(false);

    useEffect(() => {
        if (!messageId) {
            setMessage(null);
            setIsReplying(false);
            setIsForwarding(false);
            setSummary(null);
            return;
        }

        const fetchMessage = async () => {
            setLoading(true);
            setSummary(null);
            try {
                const res = await axios.get(`/api/workspace/${workspaceId}/productivity/mailbox/${messageId}`, {
                    params: { accountId }
                });
                setMessage(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessage();
    }, [messageId, workspaceId, accountId]);

    const handleSummarize = async () => {
        if (summaryLoading) return;
        setSummaryLoading(true);
        try {
            const res = await axios.post(`/api/workspace/${workspaceId}/productivity/mailbox/${messageId}/summarize`, {
                accountId
            });
            setSummary(res.data.summary);
        } catch (error) {
            console.error(error);
        } finally {
            setSummaryLoading(false);
        }
    };

    const handleReply = () => {
        setReplyTo(message.from);
        setReplySubject(`Re: ${message.subject}`);
        setReplyBody(`<br/><br/>--- On ${new Date(message.date).toLocaleString()} ${message.from} wrote --- <br/><blockquote>${message.body}</blockquote>`);
        setIsReplying(true);
        setIsForwarding(false);
    };

    const handleForward = () => {
        setReplyTo('');
        setReplySubject(`Fwd: ${message.subject}`);
        setReplyBody(`<br/><br/>--- Forwarded message ---<br/>From: ${message.from}<br/>Date: ${new Date(message.date).toLocaleString()}<br/>Subject: ${message.subject}<br/><br/>${message.body}`);
        setIsForwarding(true);
        setIsReplying(false);
    };

    const sendResponse = async () => {
        try {
            await axios.post(`/api/workspace/${workspaceId}/productivity/mailbox/${messageId}`, {
                action: isReplying ? 'reply' : 'forward',
                accountId,
                to: replyTo,
                subject: replySubject,
                body: replyBody
            });
            setIsReplying(false);
            setIsForwarding(false);
        } catch (error) {
            console.error(error);
        }
    };

    if (!messageId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30 select-none bg-background/5 backdrop-blur-sm">
                <div className="relative mb-8 group">
                    <div className="absolute inset-x-0 inset-y-0 bg-primary/20 blur-3xl animate-pulse group-hover:bg-primary/30 rounded-full scale-125 transition-all"></div>
                    <div className="relative w-24 h-24 bg-card/40 rounded-[2.5rem] border border-white/10 flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform shadow-2xl">
                        <Inbox className="w-10 h-10 text-primary opacity-60" />
                    </div>
                </div>
                <h3 className="text-sm font-bold tracking-[0.2em] mb-3 text-foreground/80 uppercase">Select Conversation</h3>
                <p className="text-[10px] max-w-[240px] font-bold leading-relaxed tracking-wide opacity-50">Choose a thread from your inbox to view the history and respond.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center h-full bg-background/5">
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-primary opacity-50" />
                    <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full"></div>
                </div>
            </div>
        );
    }

    if (!message) return null;

    return (
        <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 bg-transparent animate-in fade-in zoom-in-95 duration-500">
            {/* Toolbar */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-background/40 backdrop-blur-2xl shrink-0 z-10">
                <div className="flex items-center gap-1.5">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => onAction('archive', message.id)} className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-white/5">
                                    <Archive className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[10px] font-bold tracking-wider">Archive Thread</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => onAction('trash', message.id)} className="h-9 w-9 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all border border-transparent hover:border-white/5">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[10px] font-bold tracking-wider">Move to Trash</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <Separator orientation="vertical" className="h-4 mx-1.5 opacity-20" />

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => onAction(message.isStarred ? 'unstar' : 'star', message.id)}
                                    className={cn("h-9 w-9 rounded-xl transition-all border border-transparent hover:border-white/5", message.isStarred ? "text-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/10" : "hover:bg-muted/50")}
                                >
                                    <Star className={cn("w-4 h-4", message.isStarred ? "fill-yellow-500" : "")} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[10px] font-bold tracking-wider">{message.isStarred ? 'Unstar' : 'Star'}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={handleReply} className="h-9 px-4 rounded-xl gap-2 font-bold text-[10px] tracking-wider hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20">
                            <Reply className="w-3.5 h-3.5" /> Reply
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleForward} className="h-9 px-4 rounded-xl gap-2 font-bold text-[10px] tracking-wider hover:bg-muted/50 transition-all border border-transparent hover:border-white/5">
                            <Forward className="w-3.5 h-3.5" /> Forward
                        </Button>
                    </div>

                    <Separator orientation="vertical" className="h-4 mx-0.5 opacity-20" />

                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleSummarize} 
                        disabled={summaryLoading || !messageId}
                        className="h-9 px-4 rounded-xl gap-2 font-bold text-[10px] tracking-widest hover:bg-primary/10 text-primary shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all active:scale-95 group overflow-hidden bg-primary/5 border border-primary/20"
                    >
                        {summaryLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />}
                        Quick Digest
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <ScrollArea className="flex-1 min-h-0 bg-background/5">
                <div className="p-10 max-w-5xl mx-auto space-y-12">
                    {/* Header Info */}
                    <div className="space-y-10 animate-in slide-in-from-top-4 duration-700">
                        <div className="flex flex-col gap-8">
                            <div className="flex items-center gap-3">
                                {message.labelIds.map(label => (
                                    <span key={label} className="text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1 rounded-[10px] bg-primary/10 text-primary border border-primary/20 shadow-sm mix-blend-screen">
                                        {label}
                                    </span>
                                ))}
                            </div>
                            <h1 className="text-4xl font-extrabold leading-[1.05] text-foreground/95 tracking-tightest">
                                {message.subject}
                            </h1>
                        </div>

                        <div className="flex items-center justify-between bg-card/20 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative group overflow-hidden">
                            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />
                            <div className="flex items-center gap-6 relative z-10">
                                <Avatar className="h-16 w-16 rounded-[1.25rem] border-2 border-primary/20 p-1 shadow-2xl ring-4 ring-primary/5">
                                    <AvatarFallback className="rounded-2xl bg-linear-to-br from-primary/30 to-background text-primary text-2xl font-bold">
                                        {message.from ? message.from.charAt(0).toUpperCase() : '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-foreground/90 tracking-tight">{message.from}</h3>
                                        <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500 ring-1 ring-green-500/20">
                                            <User className="w-3 h-3" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase opacity-40">
                                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Sent to me</span>
                                        <span className="w-1 h-1 rounded-full bg-foreground" />
                                        <span>Primary Thread</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right space-y-2 relative z-10">
                                <span className="block text-[10px] text-muted-foreground tracking-[0.3em] font-bold opacity-30 uppercase">Timestamp</span>
                                <span className="block text-xs font-bold text-foreground/80 tracking-wide">
                                    {new Date(message.date).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                                </span>
                            </div>
                        </div>

                        {summary && (
                            <div className="p-8 rounded-[2.5rem] bg-linear-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 shadow-2xl animate-in zoom-in-95 duration-700 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[100px] -z-10 opacity-40 group-hover:opacity-60 transition-opacity" />
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="p-2.5 rounded-xl bg-primary/20 text-primary shadow-inner border border-primary/20">
                                        <Sparkles className="w-4.5 h-4.5" />
                                    </div>
                                    <h4 className="text-[10px] tracking-[0.4em] font-black text-primary uppercase">Thread Summary</h4>
                                </div>
                                <p className="text-base font-bold leading-relaxed text-foreground animate-typewriter selection:bg-primary/40">
                                    {summary}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Body */}
                    <div className="relative group px-2 pb-24">
                        <div className="absolute -inset-8 bg-linear-to-b from-primary/5 via-white/1 to-transparent rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                        <div 
                            className="relative prose prose-invert max-w-none text-base leading-relaxed font-bold text-foreground/80 selection:bg-primary/30"
                            dangerouslySetInnerHTML={{ __html: message.body }}
                        />
                    </div>
                </div>
            </ScrollArea>

            {/* Form & Bar Sections remain mostly the same but with Glass upgrades */}
            {(isReplying || isForwarding) && (
                <div className="p-8 border-t border-white/5 bg-background/80 backdrop-blur-3xl animate-in slide-in-from-bottom-8 duration-500 shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-3 w-3 bg-primary rounded-full animate-pulse shadow-glow shadow-primary/50" />
                                <h4 className="text-[10px] tracking-[0.3em] font-black text-primary uppercase">
                                    Drafting Response
                                </h4>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => { setIsReplying(false); setIsForwarding(false); }} className="h-9 w-9 rounded-xl hover:bg-rose-500/10 hover:text-rose-500">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        
                        <div className="space-y-3 bg-white/5 p-5 rounded-4xl border border-white/5 shadow-inner">
                            <div className="flex items-center gap-4 text-xs">
                                <span className="text-muted-foreground font-black w-14 tracking-widest uppercase opacity-40">Recipient</span>
                                <input 
                                    className="flex-1 bg-transparent border-none focus:outline-none font-bold text-foreground/90 placeholder:opacity-30"
                                    value={replyTo}
                                    onChange={(e) => setReplyTo(e.target.value)}
                                    placeholder="Enter address..."
                                />
                            </div>
                            <Separator className="bg-white/5" />
                            <div className="flex items-center gap-4 text-xs">
                                <span className="text-muted-foreground font-black w-14 tracking-widest uppercase opacity-40">Subject</span>
                                <input 
                                    className="flex-1 bg-transparent border-none focus:outline-none font-bold text-foreground/90"
                                    value={replySubject}
                                    onChange={(e) => setReplySubject(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="min-h-[350px] max-h-[500px] flex flex-col bg-white/5 border border-white/5 rounded-4xl overflow-hidden shadow-2xl relative">
                            <TipTap 
                                data={replyBody} 
                                onChange={(val) => setReplyBody(val)} 
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="ghost" size="lg" onClick={() => { setIsReplying(false); setIsForwarding(false); }} className="rounded-2xl font-bold px-8 text-xs hover:bg-white/10">Discard</Button>
                            <Button size="lg" onClick={sendResponse} className="rounded-2xl font-black px-12 bg-primary hover:bg-primary/90 text-[10px] tracking-[0.2em] shadow-2xl shadow-primary/30 uppercase group">
                                Send Response <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {!isReplying && !isForwarding && (
                <div className="p-6 border-t border-white/5 bg-background/20 backdrop-blur-3xl group transition-all hover:bg-background/40">
                    <div className="max-w-4xl mx-auto flex items-center gap-6">
                        <Avatar className="h-11 w-11 rounded-2xl opacity-30 ring-2 ring-white/5 transition-all group-hover:opacity-100 group-hover:ring-primary/40 shadow-2xl">
                            <AvatarFallback className="bg-muted text-[10px] font-black">ME</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 relative cursor-text" onClick={handleReply}>
                            <div className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold text-muted-foreground/50 group-hover:text-muted-foreground transition-all flex items-center justify-between shadow-inner group-hover:bg-white/10">
                                Type a quick response to {message.from}...
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all"><Maximize2 className="w-4 h-4" /></div>
                                    <div className="h-8 px-6 rounded-xl flex items-center justify-center bg-primary/20 text-primary text-[10px] font-black uppercase tracking-wider backdrop-blur-md">Compose</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
