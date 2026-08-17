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
    ArrowDown,
    Paperclip,
    Image as ImageIcon,
    FileText,
    FileSpreadsheet,
    FileCode,
    File,
    Eye,
    UploadCloud
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
import { processAttachedFile, buildMultimodalMessageContent } from '../../_lib/document-processor';

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

    // Multimodal attachments state
    const [attachments, setAttachments] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedImagePreview, setSelectedImagePreview] = useState(null);
    const [selectedDocPreview, setSelectedDocPreview] = useState(null);
    const fileInputRef = useRef(null);

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
                    // Extract message objects and attached files if saved in metadata
                    const formatted = (res.data || []).map(m => ({
                        ...m,
                        attachments: m.meta?.attachments || []
                    }));
                    setMessages(formatted);
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

    useEffect(() => {
        if (isAtBottomRef.current) {
            scrollToBottom('instant');
        }
    }, [messages, isStreaming]);

    // File Attachment Handlers
    const handleFiles = async (fileList) => {
        if (!fileList || fileList.length === 0) return;
        const newAttachments = [];

        for (let i = 0; i < fileList.length; i++) {
            const f = fileList[i];
            // 20MB limit per file
            if (f.size > 20 * 1024 * 1024) {
                toast.error(`File ${f.name} exceeds 20MB limit.`);
                continue;
            }
            try {
                const parsed = await processAttachedFile(f);
                newAttachments.push(parsed);
            } catch (err) {
                toast.error(`Failed to process ${f.name}`);
            }
        }

        if (newAttachments.length > 0) {
            setAttachments(prev => [...prev, ...newAttachments]);
            toast.success(`Attached ${newAttachments.length} file(s)`);
        }
    };

    const handleFileInputChange = (e) => {
        handleFiles(e.target.files);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoveAttachment = (id) => {
        setAttachments(prev => prev.filter(a => a.id !== id));
    };

    // Drag & Drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    // Thread Operations
    const handleNewThread = async () => {
        try {
            const res = await createThreadAction({ workspaceId, title: `Chat #${threads.length + 1}` });
            if (res.success) {
                setThreads(prev => [res.data, ...prev]);
                setActiveThreadId(res.data.id);
                setMessages([]);
                setAttachments([]);
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
        if ((!input.trim() && attachments.length === 0) || isStreaming) return;

        const userText = input.trim();
        const currentAttachments = [...attachments];
        
        // Structured payload for LLM (supports multimodal vision array)
        const multimodalPayload = buildMultimodalMessageContent(userText, currentAttachments);

        const userDisplayMsg = { 
            role: 'user', 
            content: userText || (currentAttachments.length > 0 ? `Sent ${currentAttachments.length} attachment(s)` : ''),
            attachments: currentAttachments 
        };

        const updatedMessages = [...messages, userDisplayMsg];

        setMessages(updatedMessages);
        setInput('');
        setAttachments([]);
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
                content: userDisplayMsg.content,
                meta: {
                    attachments: currentAttachments.map(a => ({
                        id: a.id,
                        name: a.name,
                        type: a.type,
                        formattedSize: a.formattedSize,
                        preview: a.type === 'image' ? a.dataUrl : (a.preview || '')
                    }))
                }
            });
        }

        // Add placeholder assistant message
        setMessages([...updatedMessages, { role: 'assistant', content: '' }]);

        // Format history for upstream gateway (replacing latest user msg with multimodal payload)
        const gatewayMessages = updatedMessages.map((m, idx) => {
            if (idx === updatedMessages.length - 1) {
                return { role: 'user', content: multimodalPayload };
            }
            return { role: m.role, content: m.content };
        });

        try {
            const res = await fetch(`/api/workspace/${workspaceId}/flowgenix/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: modelString,
                    messages: gatewayMessages,
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
                } catch {}

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
                            // ignore partial JSON fragments
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

    // Attachment icon helper
    const getAttachmentIcon = (att) => {
        if (att.type === 'image') return <ImageIcon className="w-3.5 h-3.5 text-blue-400" />;
        if (att.type === 'csv') return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />;
        if (att.type === 'json' || att.extension === 'js' || att.extension === 'py' || att.extension === 'ts') {
            return <FileCode className="w-3.5 h-3.5 text-purple-400" />;
        }
        return <FileText className="w-3.5 h-3.5 text-amber-400" />;
    };

    return (
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="flex flex-col md:flex-row h-full min-h-0 gap-3 overflow-hidden pb-1 relative"
        >
            {/* Hidden File Input */}
            <input 
                type="file" 
                multiple 
                ref={fileInputRef} 
                onChange={handleFileInputChange} 
                className="hidden" 
                accept="image/*,.pdf,.csv,.json,.txt,.md,.js,.jsx,.ts,.tsx,.py,.sql,.log,.html,.css,.env,.yaml,.yml" 
            />

            {/* Drag & Drop Overlay */}
            {isDragging && (
                <div className="absolute inset-0 z-50 bg-background/85 backdrop-blur-xs border-2 border-dashed border-primary rounded-xl flex flex-col items-center justify-center pointer-events-none gap-3 text-primary animate-in fade-in duration-150">
                    <UploadCloud className="w-12 h-12 animate-bounce" />
                    <div className="text-center">
                        <h3 className="text-sm font-bold">Drop files here to attach</h3>
                        <p className="text-xs text-muted-foreground">Images, PDFs, CSVs, JSON, Code, & Text Documents (up to 20MB)</p>
                    </div>
                </div>
            )}

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
                                    <option value="auto">auto (LKGP Balanced / Vision Ready)</option>
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
                <div
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 relative scroll-smooth"
                >
                    {messagesLoading ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground text-xs">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            <span>Loading conversation history...</span>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center p-12 text-muted-foreground space-y-3 opacity-70">
                            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                                <Bot className="w-8 h-8" />
                            </div>
                            <h3 className="text-sm font-bold text-foreground">Multimodal Gateway & Document Workspace</h3>
                            <p className="text-xs max-w-sm">
                                Send text or attach <b>Images, PDFs, CSVs, Code, and JSON</b> to route across LLMs with automated vision parsing and compression.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 pb-2">
                            {messages.map((msg, i) => {
                                const isUser = msg.role === 'user';
                                const msgAttachments = msg.attachments || [];

                                return (
                                    <div key={i} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                        {!isUser && (
                                            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                                                <Bot className="w-4 h-4 text-primary" />
                                            </div>
                                        )}
                                        <div className={`space-y-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                                            {/* Render Attached Files inside Message Bubble */}
                                            {msgAttachments.length > 0 && (
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    {msgAttachments.map((att, attIdx) => (
                                                        <div 
                                                            key={attIdx} 
                                                            className={`p-1.5 rounded-lg border text-xs flex items-center gap-2 ${
                                                                isUser 
                                                                    ? 'bg-primary/20 border-primary/40 text-primary-foreground' 
                                                                    : 'bg-secondary/60 border-border/40 text-foreground'
                                                            }`}
                                                        >
                                                            {att.type === 'image' && (att.preview || att.dataUrl) ? (
                                                                <img 
                                                                    src={att.preview || att.dataUrl} 
                                                                    alt={att.name} 
                                                                    onClick={() => setSelectedImagePreview(att.preview || att.dataUrl)}
                                                                    className="w-10 h-10 rounded-md object-cover cursor-pointer hover:opacity-80 transition-opacity border border-border/40"
                                                                />
                                                            ) : (
                                                                getAttachmentIcon(att)
                                                            )}
                                                            <div className="text-[11px] font-mono leading-tight">
                                                                <span className="font-bold truncate max-w-[120px] block">{att.name}</span>
                                                                <span className="text-[9px] opacity-70 block">{att.formattedSize}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Text Bubble */}
                                            {msg.content && (
                                                <div
                                                    className={`px-4 py-2.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${isUser
                                                        ? 'bg-primary text-primary-foreground font-medium rounded-tr-xs shadow-xs'
                                                        : 'bg-secondary/40 border border-border/40 text-foreground rounded-tl-xs shadow-xs font-mono'
                                                        }`}
                                                >
                                                    {msg.content}
                                                </div>
                                            )}
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
                </div>

                {/* Floating Scroll to Bottom Button */}
                {showScrollBottomBtn && (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => scrollToBottom('smooth')}
                        className="absolute bottom-20 right-6 rounded-full w-8 h-8 p-0 shadow-lg border border-border/60 bg-card/90 hover:bg-card text-foreground z-10"
                        title="Scroll to latest message"
                    >
                        <ArrowDown className="w-4 h-4" />
                    </Button>
                )}

                {/* Pending Attachments Chip Bar */}
                {attachments.length > 0 && (
                    <div className="px-3 pt-2 pb-1 bg-card/80 border-t border-border/30 flex items-center gap-2 overflow-x-auto">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center gap-1">
                            <Paperclip className="w-3 h-3 text-primary" /> Attached:
                        </span>
                        {attachments.map((att) => (
                            <div 
                                key={att.id} 
                                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/50 border border-border/40 text-xs shrink-0 font-mono"
                            >
                                {att.type === 'image' && att.dataUrl ? (
                                    <img src={att.dataUrl} alt={att.name} className="w-5 h-5 rounded object-cover" />
                                ) : (
                                    getAttachmentIcon(att)
                                )}
                                <span className="text-[11px] font-medium text-foreground truncate max-w-[110px]">{att.name}</span>
                                <span className="text-[9px] text-muted-foreground">({att.formattedSize})</span>
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveAttachment(att.id)}
                                    className="p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Fixed Input Bar */}
                <div className="p-3 border-t border-border/40 bg-card/60 shrink-0">
                    <form onSubmit={handleSend} className="flex items-center gap-2">
                        {/* Attach File Button */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-10 w-10 shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10 border border-border/30 rounded-lg"
                            title="Attach Image, PDF, CSV, or Document"
                        >
                            <Paperclip className="w-4 h-4" />
                        </Button>

                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`Ask anything via ${modelString} (or drop files/images)...`}
                            disabled={isStreaming}
                            className="h-10 text-xs bg-background/60 border-border/50 focus-visible:ring-primary flex-1"
                        />

                        <Button
                            type="submit"
                            disabled={isStreaming || (!input.trim() && attachments.length === 0)}
                            className="h-10 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
                        >
                            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            <span>Send</span>
                        </Button>
                    </form>
                </div>
            </div>

            {/* Image Full Size Modal */}
            {selectedImagePreview && (
                <div 
                    onClick={() => setSelectedImagePreview(null)}
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
                >
                    <div className="relative max-w-4xl max-h-[90vh] bg-card p-2 rounded-xl border border-border shadow-2xl">
                        <button 
                            onClick={() => setSelectedImagePreview(null)}
                            className="absolute top-4 right-4 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <img 
                            src={selectedImagePreview} 
                            alt="Preview" 
                            className="max-w-full max-h-[85vh] rounded-lg object-contain" 
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
