'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Send,
    Bot,
    User,
    Loader2,
    Trash2,
    Plus,
    MessageSquare,
    Sparkles,
    Zap,
    Scissors,
    ChevronRight,
    Layers,
    Edit2,
    Check,
    X,
    Cpu,
    RefreshCw,
    TrendingDown,
    ArrowDown
} from 'lucide-react';
import { toast } from 'sonner';
import {
    getThreadsAction,
    createThreadAction,
    renameThreadAction,
    deleteThreadAction,
    getThreadMessagesAction,
    saveMessageAction
} from '../../_action/thread-actions';
import { getCombosAction } from '../../_action/combo-actions';
import { getProvidersAction } from '../../_action/provider-actions';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ChatTab({ workspaceId }) {
    // Thread state
    const [threads, setThreads] = useState([]);
    const [activeThreadId, setActiveThreadId] = useState(null);
    const [threadsLoading, setThreadsLoading] = useState(true);
    const [editingThreadId, setEditingThreadId] = useState(null);
    const [renameTitle, setRenameTitle] = useState('');

    // Chat state
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [messagesLoading, setMessagesLoading] = useState(false);

    // Routing / Model config
    const [modelString, setModelString] = useState('auto/coding');
    const [combos, setCombos] = useState([]);
    const [providers, setProviders] = useState([]);
    const [enableRtk, setEnableRtk] = useState(true);
    const [enableCaveman, setEnableCaveman] = useState(true);
    const [lastResponseMeta, setLastResponseMeta] = useState(null);
    const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

    // Scroll references
    const messagesContainerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const isAtBottomRef = useRef(true);

    // Initial load of threads, combos, and providers
    const loadInitialData = useCallback(async () => {
        if (!workspaceId) return;
        setThreadsLoading(true);
        try {
            const [threadsRes, combosRes, provRes] = await Promise.all([
                getThreadsAction(workspaceId),
                getCombosAction(workspaceId),
                getProvidersAction(workspaceId)
            ]);

            if (threadsRes.success) {
                const list = threadsRes.data || [];
                setThreads(list);
                if (list.length > 0) {
                    setActiveThreadId(list[0].id);
                } else {
                    const newT = await createThreadAction({ workspaceId, title: "Getting Started" });
                    if (newT.success) {
                        setThreads([newT.data]);
                        setActiveThreadId(newT.data.id);
                    }
                }
            }

            if (combosRes.success) setCombos(combosRes.data || []);
            if (provRes.success) setProviders(provRes.data || []);
        } catch (err) {
            console.error("Initial chat data load error:", err);
        } finally {
            setThreadsLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    // Load messages when activeThreadId changes
    useEffect(() => {
        if (!activeThreadId) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            setMessagesLoading(true);
            try {
                const res = await getThreadMessagesAction(activeThreadId);
                if (res.success) {
                    setMessages(res.data || []);
                    // Scroll to bottom immediately on thread switch
                    setTimeout(() => {
                        scrollToBottom('instant');
                    }, 50);
                }
            } catch (err) {
                console.error("Error loading messages:", err);
            } finally {
                setMessagesLoading(false);
            }
        };

        fetchMessages();
    }, [activeThreadId]);

    // Scroll handling
    const handleScroll = () => {
        if (!messagesContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        const atBottom = distanceFromBottom < 90;
        isAtBottomRef.current = atBottom;
        setShowScrollBottomBtn(!atBottom && messages.length > 3);
    };

    const scrollToBottom = (behavior = 'smooth') => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior
            });
            isAtBottomRef.current = true;
            setShowScrollBottomBtn(false);
        }
    };

    // Auto-scroll when messages or streaming tokens arrive if user was at bottom
    useEffect(() => {
        if (isAtBottomRef.current) {
            scrollToBottom('instant');
        }
    }, [messages, isStreaming]);

    // Thread Operations
    const handleNewThread = async () => {
        try {
            const res = await createThreadAction({ workspaceId, title: `Chat #${threads.length + 1}` });
            if (res.success) {
                setThreads(prev => [res.data, ...prev]);
                setActiveThreadId(res.data.id);
                setMessages([]);
                toast.success("New conversation started");
            }
        } catch (err) {
            toast.error("Failed to create thread");
        }
    };

    const handleSaveRename = async (threadId) => {
        if (!renameTitle.trim()) return;
        try {
            const res = await renameThreadAction({ threadId, title: renameTitle });
            if (res.success) {
                setThreads(prev => prev.map(t => t.id === threadId ? { ...t, title: renameTitle } : t));
                setEditingThreadId(null);
                setRenameTitle('');
            }
        } catch {
            toast.error("Failed to rename thread");
        }
    };

    const handleDeleteThread = async (threadId, e) => {
        e?.stopPropagation();
        if (!confirm("Are you sure you want to delete this chat thread?")) return;

        try {
            const res = await deleteThreadAction(threadId);
            if (res.success) {
                const nextThreads = threads.filter(t => t.id !== threadId);
                setThreads(nextThreads);
                if (activeThreadId === threadId) {
                    if (nextThreads.length > 0) {
                        setActiveThreadId(nextThreads[0].id);
                    } else {
                        handleNewThread();
                    }
                }
                toast.success("Thread deleted");
            }
        } catch {
            toast.error("Failed to delete thread");
        }
    };

    // Send Message & Stream Response
    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || isStreaming) return;

        const userText = input.trim();
        const userMsg = { role: 'user', content: userText };
        const updatedMessages = [...messages, userMsg];

        setMessages(updatedMessages);
        setInput('');
        setIsStreaming(true);
        setLastResponseMeta(null);
        isAtBottomRef.current = true;

        // Save user message to database
        let currentThreadId = activeThreadId;
        if (currentThreadId) {
            saveMessageAction({
                workspaceId,
                threadId: currentThreadId,
                role: 'user',
                content: userText
            });
        }

        // Add placeholder assistant message
        setMessages([...updatedMessages, { role: 'assistant', content: '' }]);

        try {
            const res = await fetch(`/api/workspace/${workspaceId}/flowgenix/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: modelString,
                    messages: updatedMessages,
                    stream: true,
                    compression: {
                        rtk: enableRtk,
                        caveman: enableCaveman
                    }
                })
            });

            const resolvedProvider = res.headers.get('X-FlowGenix-Resolved-Provider');
            const resolvedModel = res.headers.get('X-FlowGenix-Resolved-Model');
            const latency = res.headers.get('X-FlowGenix-Latency-Ms');

            if (resolvedProvider || resolvedModel) {
                setLastResponseMeta({ provider: resolvedProvider, model: resolvedModel, latency });
            }

            if (!res.ok) {
                const errText = await res.text();
                let errMsg = errText;
                try {
                    const parsedErr = JSON.parse(errText);
                    errMsg = parsedErr.error || errText;
                } catch { }

                setMessages(prev => {
                    const next = [...prev];
                    next[next.length - 1].content = `⚠️ Gateway Error: ${errMsg}`;
                    return next;
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
                const lines = chunk.split('\n').filter(l => l.trim() !== '');

                for (const line of lines) {
                    if (line.replace(/^data:\s*/, '').trim() === '[DONE]') continue;
                    if (line.startsWith('data:')) {
                        try {
                            const data = JSON.parse(line.replace(/^data:\s*/, ''));
                            if (data.choices?.[0]?.delta?.content) {
                                assistantContent += data.choices[0].delta.content;
                                setMessages(prev => {
                                    const next = [...prev];
                                    next[next.length - 1].content = assistantContent;
                                    return next;
                                });
                            }
                        } catch {
                            // ignore partial JSON chunk fragments
                        }
                    }
                }
            }

            // Save completed assistant message to database
            if (currentThreadId && assistantContent) {
                await saveMessageAction({
                    workspaceId,
                    threadId: currentThreadId,
                    role: 'assistant',
                    content: assistantContent,
                    meta: {
                        model: modelString,
                        resolvedProvider,
                        resolvedModel
                    }
                });
            }

        } catch (error) {
            setMessages(prev => {
                const next = [...prev];
                next[next.length - 1].content = `Connection Error: ${error.message}`;
                return next;
            });
        } finally {
            setIsStreaming(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-full min-h-0 gap-3 overflow-hidden pb-1">


            {/* Left Thread Sidebar */}
            <div className="w-64 bg-card/60 backdrop-blur-md rounded-xl border border-border/50 flex flex-col h-full self-stretch min-h-full overflow-hidden shrink-0">
                <div className="p-3 border-b border-border/40 flex items-center justify-between shrink-0 bg-card/40">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-primary" /> Conversations
                    </span>
                    <Button size="sm" variant="outline" onClick={handleNewThread} className="h-7 px-2 text-xs gap-1 font-semibold">
                        <Plus className="w-3.5 h-3.5" /> New
                    </Button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
                    {threadsLoading ? (
                        <div className="flex items-center justify-center p-6 text-muted-foreground text-xs gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading chats...
                        </div>
                    ) : threads.length === 0 ? (
                        <div className="text-center p-6 text-xs text-muted-foreground">
                            No chats yet. Start one!
                        </div>
                    ) : (
                        threads.map((thread) => {
                            const isActive = activeThreadId === thread.id;
                            const isEditing = editingThreadId === thread.id;

                            return (
                                <div
                                    key={thread.id}
                                    onClick={() => !isEditing && setActiveThreadId(thread.id)}
                                    className={`group px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center justify-between gap-2 ${isActive
                                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                        : 'hover:bg-muted/50 text-foreground'
                                        }`}
                                >
                                    {isEditing ? (
                                        <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                                            <Input
                                                value={renameTitle}
                                                onChange={(e) => setRenameTitle(e.target.value)}
                                                className="h-6 text-xs bg-background text-foreground"
                                                autoFocus
                                            />
                                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleSaveRename(thread.id)}>
                                                <Check className="w-3 h-3 text-emerald-500" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setEditingThreadId(null)}>
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="truncate flex-1">{thread.title}</span>
                                            <div className={`items-center gap-0.5 ${isActive ? 'flex' : 'hidden group-hover:flex'}`}>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-6 w-6 p-0 opacity-80 hover:opacity-100 hover:bg-black/20"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingThreadId(thread.id);
                                                        setRenameTitle(thread.title);
                                                    }}
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-6 w-6 p-0 opacity-80 hover:opacity-100 hover:bg-destructive/20 text-destructive"
                                                    onClick={(e) => handleDeleteThread(thread.id, e)}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right Chat Main Body */}
            <div className="flex-1 min-h-0 flex flex-col h-full bg-card/40 backdrop-blur-md rounded-xl border border-border/50 overflow-hidden relative">


                {/* Header Control Bar */}
                <div className="p-3 border-b border-border/40 flex flex-wrap items-center justify-between gap-3 bg-card/60 shrink-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-lg border border-border/40">
                            <Layers className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-bold">Target Route:</span>
                            <select
                                value={modelString}
                                onChange={(e) => setModelString(e.target.value)}
                                className="bg-transparent text-xs font-mono font-bold text-primary focus:outline-none cursor-pointer"
                            >
                                <optgroup label="⚡ Preset Cascades">
                                    <option value="auto">auto (LKGP Balanced)</option>
                                    <option value="auto/coding">auto/coding (Quality-First Coding)</option>
                                    <option value="auto/fast">auto/fast (Lowest Latency)</option>
                                    <option value="auto/cheap">auto/cheap (Cost-Minimizer Free Tier)</option>
                                    <option value="auto/smart">auto/smart (Deep Reasoning)</option>
                                </optgroup>
                                {combos.length > 0 && (
                                    <optgroup label="🔀 Custom Combos">
                                        {combos.map((c) => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                    </optgroup>
                                )}
                                {providers.length > 0 && (
                                    <optgroup label="🔌 Configured Provider Endpoints">
                                        {providers.map((p) => (
                                            <option key={p.id} value={`${p.provider}/${p.name}`}>{p.provider}/{p.name}</option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                        </div>

                        {/* Compression Toggles */}
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant={enableRtk ? "default" : "outline"}
                                onClick={() => setEnableRtk(!enableRtk)}
                                className="h-7 px-2.5 text-[11px] font-semibold gap-1"
                                title="RTK Diffs & Log Stripper"
                            >
                                <Scissors className="w-3 h-3" /> RTK
                            </Button>
                            <Button
                                size="sm"
                                variant={enableCaveman ? "default" : "outline"}
                                onClick={() => setEnableCaveman(!enableCaveman)}
                                className="h-7 px-2.5 text-[11px] font-semibold gap-1"
                                title="Caveman Prompt Compaction"
                            >
                                <TrendingDown className="w-3 h-3" /> Caveman
                            </Button>
                        </div>
                    </div>

                    {/* Live Telemetry Pill */}
                    {lastResponseMeta && (
                        <div className="flex items-center gap-2 text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-2 py-0.5 rounded-md">
                            <Zap className="w-3 h-3 animate-pulse" />
                            <span>Resolved: <b>{lastResponseMeta.provider}</b> ({lastResponseMeta.model}) • {lastResponseMeta.latency}ms</span>
                        </div>
                    )}
                </div>

                {/* Messages Scrollable Feed */}
                <ScrollArea
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                    className=" h-[74vh]  p-4 space-y-4 relative scroll-smooth"
                >
                    {messagesLoading ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground text-xs">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            <span>Loading conversation history...</span>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center p-12 text-muted-foreground space-y-3 opacity-60">
                            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                                <Bot className="w-8 h-8" />
                            </div>
                            <h3 className="text-sm font-bold text-foreground">Interactive Multi-Model Gateway</h3>
                            <p className="text-xs max-w-sm">
                                Type a prompt below to route through the FlowGenix Gateway with automated failover and token compression.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 pb-2">
                            {messages.map((msg, i) => {
                                const isUser = msg.role === 'user';
                                return (
                                    <div key={i} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                        {!isUser && (
                                            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                                                <Bot className="w-4 h-4 text-primary" />
                                            </div>
                                        )}
                                        <div
                                            className={`px-4 py-2.5 rounded-xl max-w-[85%] text-xs leading-relaxed whitespace-pre-wrap ${isUser
                                                ? 'bg-primary text-primary-foreground font-medium rounded-tr-xs shadow-xs'
                                                : 'bg-secondary/40 border border-border/40 text-foreground rounded-tl-xs shadow-xs font-mono'
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                        {isUser && (
                                            <div className="w-7 h-7 rounded-lg bg-foreground/10 border border-border/40 flex items-center justify-center shrink-0 mt-0.5">
                                                <User className="w-4 h-4 text-foreground" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} className="h-1" />
                        </div>
                    )}
                </ScrollArea>

                {/* Floating Scroll to Bottom Button */}
                {showScrollBottomBtn && (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => scrollToBottom('smooth')}
                        className="absolute bottom-16 right-6 rounded-full w-8 h-8 p-0 shadow-lg border border-border/60 bg-card/90 hover:bg-card text-foreground z-10"
                        title="Scroll to latest message"
                    >
                        <ArrowDown className="w-4 h-4" />
                    </Button>
                )}

                {/* Fixed Input Bar */}
                <div className="p-3 border-t border-border/40 bg-card/60 shrink-0">
                    <form onSubmit={handleSend} className="flex items-center gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`Ask anything via ${modelString}...`}
                            disabled={isStreaming}
                            className="h-10 text-xs bg-background/60 border-border/50 focus-visible:ring-primary"
                        />
                        <Button
                            type="submit"
                            disabled={isStreaming || !input.trim()}
                            className="h-10 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
                        >
                            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            <span>Send</span>
                        </Button>
                    </form>
                </div>


            </div>
        </div>
    );
}
