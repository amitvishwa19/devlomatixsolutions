'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
    X, 
    Send, 
    Bot, 
    User, 
    Loader2, 
    MessageSquare, 
    ChevronDown,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import axios from '@/utils/axios';

export const ChatPreview = ({ flowbotId, workspaceId, chatNode, nodes, edges }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    const botName = chatNode?.data?.botName || "Flow Assistant";
    const welcomeMsg = chatNode?.data?.welcomeMessage || "Hello! How can I help you today?";

    // Initial welcome message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{ role: 'bot', text: welcomeMsg, timestamp: new Date() }]);
        }
    }, [welcomeMsg]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!inputValue.trim() || isTyping) return;

        const userMsg = { role: 'user', text: inputValue, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            // Trigger the workflow via the execute API
            const res = await axios.post(`/api/workspace/${workspaceId}/flowbot/${flowbotId}/execute`, {
                nodes,
                edges,
                payload: {
                    message: userMsg.text,
                    source: 'chat-preview',
                    user: 'Studio Tester'
                }
            });

            if (res.data.success) {
                // Find the last node's output to use as response
                const logs = res.data.logs || [];
                const lastLog = logs.reverse().find(l => !l.error && l.message.includes('Node success'));
                
                let botResponse = "Workflow executed but no output was returned.";
                if (lastLog) {
                    try {
                        const outputMatch = lastLog.message.match(/Node success: (.*)/);
                        if (outputMatch && outputMatch[1]) {
                            const output = JSON.parse(outputMatch[1]);
                            botResponse = output.text || output.message || JSON.stringify(output);
                        }
                    } catch (e) {
                        botResponse = "Error parsing workflow response.";
                    }
                }

                setMessages(prev => [...prev, { 
                    role: 'bot', 
                    text: botResponse, 
                    timestamp: new Date() 
                }]);
            } else {
                throw new Error(res.data.message || "Failed to execute");
            }
        } catch (e) {
            setMessages(prev => [...prev, { 
                role: 'bot', 
                text: "Sorry, I encountered an error executing the workflow.", 
                isError: true,
                timestamp: new Date() 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!isOpen) {
        return (
            <Button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-primary hover:scale-110 transition-transform z-50 group"
            >
                <div className="relative">
                    <MessageSquare size={24} className="text-primary-foreground group-hover:rotate-12 transition-transform" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-primary"></span>
                    </span>
                </div>
            </Button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[550px] bg-card border border-border/50 shadow-2xl rounded-2xl flex flex-col z-50 animate-in slide-in-from-bottom-5 duration-300 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-primary flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <Bot size={18} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white leading-tight uppercase tracking-tight">{botName}</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Active Studio Preview</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setMessages([{ role: 'bot', text: welcomeMsg, timestamp: new Date() }])}
                        className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10 rounded-lg"
                    >
                        <RefreshCw size={14} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsOpen(false)}
                        className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10 rounded-lg"
                    >
                        <ChevronDown size={20} />
                    </Button>
                </div>
            </div>

            {/* Chat Body */}
            <ScrollArea className="flex-1 p-4 bg-muted/5 relative">
                <div className="space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                flex gap-2 max-w-[85%]
                                ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}
                            `}>
                                <div className={`
                                    h-7 w-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm
                                    ${msg.role === 'bot' ? 'bg-primary/10 text-primary border border-primary/10' : 'bg-muted text-muted-foreground'}
                                `}>
                                    {msg.role === 'bot' ? <Bot size={14} /> : <User size={14} />}
                                </div>
                                <div className={`
                                    px-3.5 py-2.5 rounded-2xl text-xs font-medium leading-relaxed
                                    ${msg.role === 'user' 
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-tr-none' 
                                        : msg.isError 
                                            ? 'bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-tl-none'
                                            : 'bg-card border border-border/50 text-foreground shadow-sm rounded-tl-none'
                                    }
                                `}>
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                             <div className="flex gap-2 max-w-[85%]">
                                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary border border-primary/10 flex items-center justify-center shadow-sm">
                                    <Bot size={14} />
                                </div>
                                <div className="bg-card border border-border/50 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                                    <span className="h-1.5 w-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-1.5 w-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-1.5 w-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Footer */}
            <div className="p-4 bg-background border-t border-border/50 relative">
                 <div className="relative group">
                    <Input 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your message..."
                        className="pr-12 bg-muted/20 border-border/50 rounded-xl h-11 text-xs focus-visible:ring-primary/20 transition-all font-medium"
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button 
                        size="icon"
                        variant="ghost"
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isTyping}
                        className="absolute right-1 top-1 bottom-1 h-9 w-9 text-primary hover:bg-primary/10 rounded-lg group-hover:scale-105 transition-all"
                    >
                        {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </Button>
                 </div>
                 <div className="mt-2 flex items-center justify-center gap-1 opacity-50">
                    <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-0">Powered by FlowBot Engine</Badge>
                 </div>
            </div>
        </div>
    );
};
