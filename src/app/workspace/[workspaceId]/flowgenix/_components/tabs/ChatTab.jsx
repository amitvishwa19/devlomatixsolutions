'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot, User, Loader2, Settings2, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ChatTab({ workspaceId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [modelString, setModelString] = useState('openrouter/meta-llama/llama-3.1-8b-instruct');
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || isStreaming) return;

        const userMsg = { role: 'user', content: input.trim() };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput('');
        setIsStreaming(true);

        // Add a placeholder for assistant response
        setMessages([...updatedMessages, { role: 'assistant', content: '' }]);

        try {
            const res = await fetch(`/api/workspace/${workspaceId}/flowgenix/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: modelString,
                    messages: updatedMessages,
                    stream: true
                })
            });

            if (!res.ok) {
                const errText = await res.text();
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1].content = `Error: ${errText}`;
                    return newMsgs;
                });
                setIsStreaming(false);
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder('utf-8');

            let assistantContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    if (line.replace(/^data: /, '').trim() === '[DONE]') continue;
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.replace(/^data: /, ''));
                            if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                                assistantContent += data.choices[0].delta.content;
                                setMessages(prev => {
                                    const newMsgs = [...prev];
                                    newMsgs[newMsgs.length - 1].content = assistantContent;
                                    return newMsgs;
                                });
                            }
                        } catch (e) {
                            // ignore JSON parse errors on partial chunks
                        }
                    }
                }
            }
        } catch (error) {
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].content = `Connection Error: ${error.message}`;
                return newMsgs;
            });
        } finally {
            setIsStreaming(false);
        }
    };

    const handleClear = () => {
        if (confirm('Clear chat history?')) {
            setMessages([]);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-180px)] gap-4 pb-6">
            {/* Header Settings Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-card/40 backdrop-blur-xs">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-500" />
                    <div>
                        <h2 className="text-sm font-bold tracking-tight">Interactive Chat</h2>
                        <p className="text-[10px] text-muted-foreground">Test models directly via the OmniRoute Gateway.</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Input 
                            value={modelString}
                            onChange={(e) => setModelString(e.target.value)}
                            placeholder="provider/model-name"
                            className="h-8 text-xs font-mono bg-black/40 border-border/50"
                        />
                    </div>
                    <Button variant="outline" size="sm" onClick={handleClear} className="h-8 px-3 text-xs" title="Clear Chat">
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {/* Chat Area */}
            <Card className="flex-1 flex flex-col overflow-hidden border border-border/50 bg-card/40 backdrop-blur-xs">
                <ScrollArea className="flex-1 p-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-50 my-20">
                            <Bot className="w-12 h-12 mb-4 text-muted-foreground" />
                            <p className="text-sm font-bold">No messages yet</p>
                            <p className="text-xs text-muted-foreground mt-1">Start chatting to test your configured models.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 pb-4">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30">
                                            <Bot className="w-4 h-4 text-purple-500" />
                                        </div>
                                    )}
                                    <div className={`px-4 py-3 rounded-xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${
                                        msg.role === 'user' 
                                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                                        : 'bg-secondary/50 border border-border/30 rounded-tl-sm text-foreground'
                                    }`}>
                                        {msg.content}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                                            <User className="w-4 h-4 text-primary" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t border-border/30 bg-black/20">
                    <form onSubmit={handleSend} className="flex items-center gap-3">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            disabled={isStreaming}
                            className="flex-1 h-12 bg-black/40 border-border/50 focus-visible:ring-1 focus-visible:ring-purple-500"
                        />
                        <Button 
                            type="submit" 
                            disabled={isStreaming || !input.trim()}
                            className="h-12 px-6 bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold transition-all shadow-lg shadow-purple-500/20"
                        >
                            {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
