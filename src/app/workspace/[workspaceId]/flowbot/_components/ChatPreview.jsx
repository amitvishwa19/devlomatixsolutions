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

export const ChatPreview = ({ flowbotId, workspaceId, chatNode, nodes, edges, isOpen, onClose, onExecuteComplete, onExecuteStart, onExecuteError }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    const botName = chatNode?.data?.botName || "Flow Assistant";
    const welcomeMsg = chatNode?.data?.welcomeMessage || "Hello! How can I help you today?";

    // Sync welcome message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{ role: 'bot', text: welcomeMsg, timestamp: new Date() }]);
        }
    }, [welcomeMsg, messages.length]);

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

        // Immediate visual feedback on the canvas
        if (onExecuteStart) {
            onExecuteStart(chatNode.id);
        }

        try {
            const res = await axios.post(`/api/workspace/${workspaceId}/flowbot/${flowbotId}/execute`, {
                nodes,
                edges,
                payload: {
                    message: userMsg.text,
                    source: 'chat-preview',
                    user: 'Studio Tester',
                    sessionId: `preview-${flowbotId}`
                }
            });

            if (res.data.success) {
                // Trigger visual replay on the canvas
                if (onExecuteComplete) {
                    onExecuteComplete(res.data.logs);
                }

                const logs = res.data.logs || [];
                // Search for the specific Agent or AI node output in logs
                const successLogs = logs.filter(l => l.message.includes('Node success'));
                const lastSuccess = successLogs[successLogs.length - 1];
                
                let botResponse = "Workflow executed but no output was returned.";
                if (lastSuccess) {
                    try {
                        const outputMatch = lastSuccess.message.match(/Node success: (.*)/);
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
                if (onExecuteError) onExecuteError(chatNode.id);
                throw new Error(res.data.message || "Failed to execute");
            }
        } catch (e) {
            if (onExecuteError) onExecuteError(chatNode.id);
            setMessages(prev => [...prev, { 
                role: 'bot', 
                text: "Execution failed. Check your Agent configuration or API keys.", 
                isError: true,
                timestamp: new Date() 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 flex justify-center z-50 pointer-events-none p-6">
            <div className="w-full max-w-[600px] h-[600px] bg-card border border-border/50 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.5)] rounded-t-[32px] rounded-b-[24px] flex flex-col pointer-events-auto animate-in slide-in-from-bottom-full duration-500 ease-out relative">
                {/* Drag Handle Area */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted-foreground/20 rounded-full cursor-pointer hover:bg-muted-foreground/40 transition-colors" />

                {/* Header */}
                <div className="pt-8 px-8 pb-4 border-b border-border/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                                <Bot size={24} className="text-indigo-500" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-foreground uppercase tracking-tight leading-none">{botName}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Node Simulator Active</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="ghost" 
                                size="xs"
                                className="h-8 px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-rose-500 transition-colors"
                                onClick={() => setMessages([{ role: 'bot', text: welcomeMsg, timestamp: new Date() }])}
                            >
                                <RefreshCw size={12} className="mr-2" /> Reset
                            </Button>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-10 w-10 hover:bg-muted/50 transition-colors">
                                <X size={20} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Chat Messages */}
                <ScrollArea className="flex-1 p-6 relative">
                    <div className="space-y-6">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`
                                    flex gap-3 max-w-[90%]
                                    ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}
                                `}>
                                    <div className={`
                                        h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border
                                        ${msg.role === 'bot' ? 'bg-primary/5 text-primary border-primary/10' : 'bg-muted/50 text-muted-foreground border-border/50'}
                                    `}>
                                        {msg.role === 'bot' ? <Bot size={16} /> : <User size={16} />}
                                    </div>
                                    <div className={`
                                        px-4 py-3 rounded-2xl text-[11px] font-medium leading-relaxed
                                        ${msg.role === 'user' 
                                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-tr-none' 
                                            : msg.isError 
                                                ? 'bg-rose-500/5 border border-rose-500/20 text-rose-500 rounded-tl-none'
                                                : 'bg-muted/30 border border-border/50 text-foreground shadow-sm rounded-tl-none'
                                        }
                                    `}>
                                        {msg.text}
                                        <div className="mt-1 text-[8px] opacity-40 font-bold uppercase tracking-tighter">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="flex gap-3 max-w-[90%] items-center">
                                    <div className="h-8 w-8 rounded-lg bg-primary/5 text-primary border border-primary/10 flex items-center justify-center shadow-sm">
                                        <Bot size={16} />
                                    </div>
                                    <div className="bg-muted/30 border border-border/50 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                                        <span className="h-1.5 w-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="h-1.5 w-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="h-1.5 w-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} className="h-4" />
                    </div>
                </ScrollArea>

                {/* Input Wrapper */}
                <div className="p-6 border-t border-border bg-card/50 backdrop-blur-md">
                    <div className="relative group">
                        <Input 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type a message to test workflow..."
                            className="pr-12 bg-background/50 border-border/50 rounded-xl h-12 text-[11px] focus-visible:ring-primary/20 transition-all font-medium border-2"
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <Button 
                            size="icon"
                            variant="ghost"
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            className="absolute right-1.5 top-1.5 bottom-1.5 h-9 w-9 text-primary hover:bg-primary/10 rounded-lg group-hover:scale-105 transition-all"
                        >
                            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </Button>
                    </div>
                    <div className="mt-4 flex flex-col items-center gap-1 text-center">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">
                            Chat Simulator · v2.1-Alpha
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
