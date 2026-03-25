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
    Maximize2
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

    useEffect(() => {
        if (!messageId) {
            setMessage(null);
            setIsReplying(false);
            setIsForwarding(false);
            return;
        }

        const fetchMessage = async () => {
            setLoading(true);
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
            // Show success toast
        } catch (error) {
            console.error(error);
        }
    };

    if (!messageId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-30 select-none">
                <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                    <Reply className="w-12 h-12 rotate-45" />
                </div>
                <h3 className="text-sm font-extrabold tracking-widest uppercase mb-2">Select a message</h3>
                <p className="text-[10px] max-w-[200px] font-bold">Choose an email from the list on the left to read its full content here.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center h-full bg-background/5">
                <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
            </div>
        );
    }

    if (!message) return null;

    return (
        <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 bg-transparent animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-white/5 bg-background/40 backdrop-blur-xl flex-shrink-0">
                <div className="flex items-center gap-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => onAction('archive', message.id)} className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                                    <Archive className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p className="text-[10px] font-bold">Archive</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => onAction('trash', message.id)} className="h-9 w-9 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p className="text-[10px] font-bold">Move to Trash</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <Separator orientation="vertical" className="h-4 mx-2 opacity-20" />

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => onAction(message.isStarred ? 'unstar' : 'star', message.id)}
                                    className="h-9 w-9 rounded-xl hover:bg-yellow-500/10 transition-all"
                                >
                                    <Star className={message.isStarred ? "w-4 h-4 text-yellow-500 fill-yellow-500" : "w-4 h-4"} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p className="text-[10px] font-bold">{message.isStarred ? 'Unstar' : 'Star'}</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleReply} className="h-9 px-3 rounded-xl gap-2 font-bold text-[10px] uppercase tracking-wider hover:bg-primary/10">
                        <Reply className="w-3.5 h-3.5" /> Reply
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleForward} className="h-9 px-3 rounded-xl gap-2 font-bold text-[10px] uppercase tracking-wider hover:bg-primary/10">
                        <Forward className="w-3.5 h-3.5" /> Forward
                    </Button>
                    <Separator orientation="vertical" className="h-4 mx-1 opacity-20" />
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl"><MoreVertical className="w-4 h-4" /></Button>
                </div>
            </div>

            {/* Content Area */}
            <ScrollArea className="flex-1 min-h-0 bg-background/5">
                <div className="p-8 max-w-4xl mx-auto space-y-10">
                    {/* Header Info */}
                    <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-2">
                            {message.labelIds.map(label => (
                                <span key={label} className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-sm">
                                    {label}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-3xl font-black tracking-tight leading-[1.1] text-foreground/95">
                            {message.subject}
                        </h1>

                        <div className="flex items-center justify-between bg-white/5 p-6 rounded-[2rem] border border-white/5 shadow-inner">
                            <div className="flex items-center gap-5">
                                <Avatar className="h-14 w-14 rounded-2xl border-2 border-primary/20 p-1 shadow-lg ring-4 ring-primary/5">
                                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-xl font-black">
                                        {message.from ? message.from.charAt(0).toUpperCase() : '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-base font-black text-foreground/90">{message.from}</h3>
                                        <span className="text-[9px] font-black text-primary/80 bg-primary/10 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-primary/10">Sender</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-2 opacity-60">
                                        To: <span className="text-foreground/70">me</span>
                                    </p>
                                </div>
                            </div>
                            <div className="text-right space-y-1">
                                <span className="block text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase opacity-40">Sent On</span>
                                <span className="block text-[11px] font-black text-foreground/80">
                                    {new Date(message.date).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="relative group overflow-x-auto">
                        <div className="absolute -inset-4 bg-gradient-to-b from-primary/5 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div 
                            className="relative prose prose-invert max-w-none text-base leading-loose font-medium text-foreground/80 selection:bg-primary/30"
                            dangerouslySetInnerHTML={{ __html: message.body }}
                        />
                    </div>
                </div>
            </ScrollArea>

            {/* Reply/Forward Form */}
            {(isReplying || isForwarding) && (
                <div className="p-6 border-t border-white/5 bg-background/60 backdrop-blur-2xl animate-in slide-in-from-bottom-8 duration-500">
                    <div className="max-w-4xl mx-auto space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                {isReplying ? 'Replying to message' : 'Forwarding message'}
                            </h4>
                            <Button variant="ghost" size="icon" onClick={() => { setIsReplying(false); setIsForwarding(false); }} className="h-8 w-8 rounded-full">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="space-y-3 bg-white/5 p-4 rounded-3xl border border-white/5">
                            <div className="flex items-center gap-3 text-xs">
                                <span className="text-muted-foreground font-bold w-12 tracking-wider">To:</span>
                                <input 
                                    className="flex-1 bg-transparent border-none focus:outline-none font-bold text-foreground/90"
                                    value={replyTo}
                                    onChange={(e) => setReplyTo(e.target.value)}
                                    placeholder="Recipient email..."
                                />
                            </div>
                            <Separator className="bg-white/5" />
                            <div className="flex items-center gap-3 text-xs">
                                <span className="text-muted-foreground font-bold w-12 tracking-wider">Sub:</span>
                                <input 
                                    className="flex-1 bg-transparent border-none focus:outline-none font-bold text-foreground/90"
                                    value={replySubject}
                                    onChange={(e) => setReplySubject(e.target.value)}
                                />
                            </div>
                        </div>
                        <textarea 
                            className="w-full min-h-[150px] bg-white/5 border border-white/5 rounded-3xl p-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                            placeholder="Type your message here..."
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value)}
                        />
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="ghost" size="sm" onClick={() => { setIsReplying(false); setIsForwarding(false); }} className="rounded-xl font-bold px-6">Cancel</Button>
                            <Button size="sm" onClick={sendResponse} className="rounded-xl font-extrabold px-8 bg-primary hover:bg-primary/90 text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                                Send Message
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Reply Bar (Hidden when replying/forwarding) */}
            {!isReplying && !isForwarding && (
                <div className="p-5 border-t border-white/5 bg-background/20 backdrop-blur-xl group">
                    <div className="max-w-4xl mx-auto flex items-center gap-5">
                        <Avatar className="h-10 w-10 rounded-2xl opacity-40 ring-2 ring-white/5 transition-all group-hover:opacity-80">
                            <AvatarFallback className="bg-muted text-[10px] font-black uppercase tracking-widest">ME</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 relative">
                            <input 
                                placeholder="Write a quick reply..." 
                                onClick={handleReply}
                                readOnly
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-3.5 text-xs font-bold focus:outline-none hover:bg-white/10 transition-all cursor-text shadow-inner"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" onClick={handleReply} className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary"><Maximize2 className="w-4 h-4" /></Button>
                                <Button size="sm" onClick={handleReply} className="h-8 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/10">Send</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
