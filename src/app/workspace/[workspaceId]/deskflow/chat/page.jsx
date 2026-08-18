'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    MessagesSquare,
    Send,
    Bot,
    User,
    Sparkles,
    MessageSquare,
    Paperclip,
    CheckCircle2,
    Smile,
    MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { getTickets, sendTicketReply } from '../_actions/deskflow-actions';

export default function DeskFlowChatPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [tickets, setTickets] = useState([]);
    const [activeTicket, setActiveTicket] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        getTickets(workspaceId).then((res) => {
            if (res.success && res.data.length > 0) {
                setTickets(res.data);
                setActiveTicket(res.data[0]);
            }
        });
    }, [workspaceId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !activeTicket) return;

        setSending(true);
        const res = await sendTicketReply(workspaceId, activeTicket.id, replyText);
        if (res.success) {
            toast.success("Reply dispatched to customer!");
            setActiveTicket({ ...res.data });
            setReplyText('');
        }
        setSending(false);
    };

    const applyAiDraft = () => {
        setReplyText("Hello! I reviewed your account records. I have re-triggered the 3DS verification gateway and cleared the temporary hold. Could you please try checking out again?");
        toast.info("AI Copilot drafted a personalized reply");
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                        <MessagesSquare className="w-4 h-4 text-sky-500" />
                    </div>
                    <h1 className="text-lg font-bold text-foreground">Omnichannel Live Inbox</h1>
                </div>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    Live Chat & WhatsApp Active
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
                {/* Conversations List */}
                <Card className="bg-card border-border/80 flex flex-col min-h-0">
                    <CardHeader className="py-2.5 px-3 border-b border-border/40 shrink-0">
                        <CardTitle className="text-xs font-bold text-foreground">Active Customer Conversations</CardTitle>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-2">
                        <div className="space-y-1.5">
                            {tickets.map((t) => (
                                <div
                                    key={t.id}
                                    onClick={() => setActiveTicket(t)}
                                    className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                                        activeTicket?.id === t.id
                                            ? 'bg-secondary border-sky-500/40 shadow-xs'
                                            : 'border-border/40 hover:bg-secondary/40'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-xs text-foreground">{t.customer}</span>
                                        <Badge variant="outline" className="text-[8px] font-mono">{t.channel}</Badge>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{t.subject}</p>
                                    <span className="text-[9px] text-muted-foreground block mt-1">{t.lastReply}</span>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </Card>

                {/* Main Chat Thread */}
                {activeTicket ? (
                    <Card className="md:col-span-2 bg-card border-border/80 flex flex-col min-h-0">
                        <CardHeader className="py-2.5 px-4 border-b border-border/40 flex flex-row items-center justify-between shrink-0 bg-secondary/15">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-foreground">{activeTicket.customer}</span>
                                    <Badge variant="outline" className="text-[9px] font-mono">{activeTicket.id}</Badge>
                                </div>
                                <p className="text-[10px] text-muted-foreground">{activeTicket.subject}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={applyAiDraft} className="h-7 text-xs border-indigo-500/30 text-indigo-500 bg-indigo-500/10 gap-1">
                                <Sparkles className="w-3 h-3" /> AI Draft Reply
                            </Button>
                        </CardHeader>

                        {/* Messages Feed */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-3">
                                {activeTicket.messages?.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex flex-col ${msg.role === 'agent' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div
                                            className={`max-w-md p-3 rounded-xl text-xs space-y-1 ${
                                                msg.role === 'agent'
                                                    ? 'bg-sky-600 text-white rounded-br-none'
                                                    : 'bg-secondary/60 text-foreground border border-border/60 rounded-bl-none'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-4 text-[9px] opacity-80">
                                                <span className="font-semibold">{msg.sender}</span>
                                                <span className="font-mono">{msg.time}</span>
                                            </div>
                                            <p className="leading-relaxed">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Reply Input */}
                        <form onSubmit={handleSend} className="p-3 border-t border-border/40 bg-secondary/10 flex items-center gap-2 shrink-0">
                            <Input
                                placeholder="Type your response (or click AI Draft)..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="h-9 text-xs bg-card border-border/80"
                            />
                            <Button type="submit" size="sm" disabled={sending} className="h-9 px-4 text-xs bg-sky-600 hover:bg-sky-700 text-white gap-1 shrink-0">
                                <Send className="w-3.5 h-3.5" />
                                Send
                            </Button>
                        </form>
                    </Card>
                ) : (
                    <div className="md:col-span-2 flex items-center justify-center text-xs text-muted-foreground">
                        Select a conversation to begin
                    </div>
                )}
            </div>
        </div>
    );
}
