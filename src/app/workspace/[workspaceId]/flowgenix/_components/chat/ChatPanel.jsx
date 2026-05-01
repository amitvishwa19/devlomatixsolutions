import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    getDefaultModel,
} from "../../_lib/agent-storage";
import { runAgent, AgentAbortError } from "../../_lib/agent-runtime";
import {
    listThreads,
    createThread,
    getThreadMessages,
    saveChatMessage,
    renameThread,
    deleteThread,
    clearThreadMessages,
    deleteLastAssistantMessage,
    getChatResponse,
} from "../../_actions/chat/actions";
import { saveAgentConfig } from "../../_actions/setup/actions";
import { ChatThreadList } from "./ChatThreadList";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import {
    ChevronDown,
    ChevronRight,
    Loader2,
    RefreshCw,
    Send,
    Square,
    Trash2,
    Wrench,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

function parseTraces(meta) {
    if (!meta) return [];
    try {
        const parsed = JSON.parse(meta);
        return Array.isArray(parsed?.toolCalls) ? parsed.toolCalls : [];
    } catch {
        return [];
    }
}

const ToolCallBlock = ({ trace }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="my-2 rounded-md border border-border bg-secondary/40">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left font-mono text-[11px] hover:bg-secondary/60"
            >
                {open ? (
                    <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                ) : (
                    <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                )}
                <Wrench className="h-3 w-3 text-primary shrink-0" />
                <span className="text-primary">{trace.name}</span>
                <span className="truncate text-muted-foreground">
                    ({JSON.stringify(trace.args).slice(0, 60)})
                </span>
                {typeof trace.durationMs === "number" && (
                    <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
                        {trace.durationMs}ms
                    </span>
                )}
            </button>
            {open && (
                <div className="space-y-1.5 border-t border-border px-2.5 py-2">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">args</p>
                        <pre className="mt-1 max-h-40 overflow-auto rounded bg-background p-1.5 font-mono text-[10px]">
                            {JSON.stringify(trace.args, null, 2)}
                        </pre>
                    </div>
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">result</p>
                        <pre className="mt-1 max-h-48 overflow-auto rounded bg-background p-1.5 font-mono text-[10px] whitespace-pre-wrap break-words">
                            {trace.result}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export const ChatPanel = ({ config, ragDocs, userId }) => {
    const params = useParams();
    const workspaceId = params?.workspaceId;
    const [threads, setThreads] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const [toolNotes, setToolNotes] = useState([]);
    const [liveTraces, setLiveTraces] = useState([]);
    const [streaming, setStreaming] = useState("");
    const scrollRef = useRef(null);
    const abortRef = useRef(null);

    // Load threads + ensure a default one
    useEffect(() => {
        if (!userId || !workspaceId) return;
        (async () => {
            try {
                const list = await listThreads(workspaceId, userId);
                if (list.length === 0) {
                    const t = await createThread(workspaceId, userId, "General Chat");
                    setThreads([t]);
                    setActiveId(t.id);
                } else {
                    setThreads(list);
                    setActiveId(list[0].id);
                }
            } catch (e) {
                console.error("ChatPanel: failed to load threads", e);
            }
        })();
    }, [workspaceId, userId]);

    // Load messages whenever active thread changes
    useEffect(() => {
        if (!activeId) {
            setMessages([]);
            return;
        }
        (async () => {
            try {
                const m = await getThreadMessages(workspaceId, activeId);
                setMessages(m);
            } catch (e) {
                console.error("ChatPanel: failed to load messages", e);
            }
        })();
    }, [activeId, workspaceId]);

    useEffect(() => {
        const vp = scrollRef.current?.querySelector(
            "[data-radix-scroll-area-viewport]",
        );
        vp?.scrollTo({ top: vp.scrollHeight, behavior: "smooth" });
    }, [messages, toolNotes, busy, streaming, liveTraces]);

    const refreshThreads = async () => {
        const list = await listThreads(workspaceId, userId);
        setThreads(list);
    };

    const handleNewThread = async () => {
        try {
            const t = await createThread(workspaceId, userId, "New chat");
            setThreads((s) => [t, ...s]);
            setActiveId(t.id);
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleRename = async (id, title) => {
        try {
            await renameThread(id, title);
            setThreads((s) => s.map((t) => (t.id === id ? { ...t, title } : t)));
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleDeleteThread = async (id) => {
        try {
            await deleteThread(id);
            const remaining = threads.filter((t) => t.id !== id);
            setThreads(remaining);
            if (activeId === id) {
                if (remaining.length > 0) setActiveId(remaining[0].id);
                else {
                    const t = await createThread(workspaceId, userId, "General Chat");
                    setThreads([t]);
                    setActiveId(t.id);
                }
            }
        } catch (e) {
            toast.error(e.message);
        }
    };

    const runWith = async (text, baseHistory) => {
        if (!activeId) return;
        const def = getDefaultModel(config);
        if (!def || !def.apiKey) {
            toast.error("Add at least one model with an API key in Setup → models.");
            return;
        }
        const userMsg = { role: "user", content: text };
        const next = [...baseHistory, userMsg];
        setMessages(next);
        setBusy(true);
        setToolNotes([]);
        setLiveTraces([]);
        setStreaming("");
        const traces = [];
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        try {
            const result = await getChatResponse({
                config,
                history: baseHistory,
                userInput: text,
                ragDocs
            });

            if (!result.success) throw new Error(result.error);

            const reply = result.response;

            const meta = traces.length ? JSON.stringify({ toolCalls: traces }) : undefined;
            const assistantMsg = {
                role: "assistant",
                content: reply,
                meta,
                threadId: activeId,
                workspaceId,
                userId
            };

            await Promise.all([
                saveChatMessage(workspaceId, userId, { ...userMsg, threadId: activeId }),
                saveChatMessage(workspaceId, userId, assistantMsg)
            ]);

            setMessages([...next, assistantMsg]);
            refreshThreads();
        } catch (e) {
            if (e instanceof AgentAbortError) {
                const partial = e.partial || streaming;
                const meta = traces.length ? JSON.stringify({ toolCalls: traces }) : undefined;
                const stoppedMsg = {
                    role: "assistant",
                    content: (partial || "_(stopped)_") + "\n\n_⏹ stopped by user_",
                    meta,
                };
                try { await appendThreadMessage(activeId, stoppedMsg); } catch { }
                setMessages([...next, stoppedMsg]);
                toast.message("Stopped");
            } else {
                toast.error(e.message);
            }
        } finally {
            abortRef.current = null;
            setStreaming("");
            setLiveTraces([]);
            setBusy(false);
        }
    };

    const send = async () => {
        const text = input.trim();
        if (!text || busy) return;
        setInput("");
        await runWith(text, messages);
    };

    const stop = () => {
        abortRef.current?.abort();
    };

    const regenerate = async () => {
        if (busy) return;
        // Find the last user message
        const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === "user");
        if (lastUserIdx === -1) return;
        const idx = messages.length - 1 - lastUserIdx;
        const lastUserText = messages[idx].content;
        const baseHistory = messages.slice(0, idx); // history before that user msg
        if (!activeId) return;
        try {
            // Drop the trailing assistant reply (and the user msg, since runWith re-appends it)
            await deleteLastAssistantMessage(activeId);
            // Also remove the last user msg from DB so runWith re-inserts cleanly
            await supabase.from("messages").delete().eq("thread_id", activeId)
                .eq("role", "user").eq("content", lastUserText)
                .order("created_at", { ascending: false }).limit(1);
        } catch {
            // best-effort cleanup
        }
        await runWith(lastUserText, baseHistory);
    };

    const reset = async () => {
        if (!activeId) return;
        try {
            await clearThreadMessages(activeId);
            setMessages([]);
            setToolNotes([]);
        } catch (e) {
            toast.error(e.message);
        }
    };

    const canRegenerate = !busy && messages.some((m) => m.role === "user");

    return (
        <div className="grid h-full min-h-0 grid-cols-[200px_1fr]">
            <ChatThreadList
                threads={threads}
                activeId={activeId}
                onSelect={setActiveId}
                onCreate={handleNewThread}
                onRename={handleRename}
                onDelete={handleDeleteThread}
            />
            <div className="flex h-full min-h-0 min-w-0 flex-col">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                        {(() => {
                            if (!config) return <span className="font-mono text-sm text-muted-foreground italic">No Configuration</span>;

                            const d = getDefaultModel(config);
                            const status = d?.lastTestOk;
                            const dotClass =
                                status === true
                                    ? "bg-primary shadow-[0_0_8px_hsl(var(--primary))]"
                                    : status === false
                                        ? "bg-destructive shadow-[0_0_8px_hsl(var(--destructive))]"
                                        : "bg-muted-foreground/40";
                            const title =
                                status === true
                                    ? `Healthy · ${d?.lastTestMessage ?? "ok"}`
                                    : status === false
                                        ? `Unhealthy · ${d?.lastTestMessage ?? "failed"}`
                                        : "Not tested yet — click test_connection in Setup";
                            return (
                                <>
                                    <span className={`h-2 w-2 rounded-full shrink-0 ${dotClass}`} title={title} />
                                    <span className="font-mono text-sm truncate">{config.name || "unnamed agent"}</span>
                                    <span className="font-mono text-xs text-muted-foreground truncate">
                                        · {(() => { const d2 = getDefaultModel(config); return d2 ? `${d2.label} (${d2.provider}/${d2.model})` : "no model"; })()}
                                    </span>
                                </>
                            );
                        })()}
                    </div>
                    <Button variant="ghost" size="sm" onClick={reset} className="font-mono text-xs">
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> clear
                    </Button>
                </div>

                <ScrollArea ref={scrollRef} className="flex-1 min-h-0">
                    <div className="px-4 py-6 space-y-5">
                        {messages.length === 0 && !busy && (
                            <div className="mx-auto max-w-md text-center text-muted-foreground font-mono text-sm pt-12">
                                <p className="mb-2 text-primary"># ready</p>
                                <p className="text-xs leading-relaxed">
                                    Configure your agent on the left, then send a message.
                                    Tools and document context are injected automatically.
                                </p>
                            </div>
                        )}

                        {messages.map((m, i) => {
                            const traces = m.role === "assistant" ? parseTraces(m.meta) : [];
                            return (
                                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                                    <div
                                        className={
                                            m.role === "user"
                                                ? "max-w-[80%] rounded-lg bg-secondary px-4 py-2.5 text-sm"
                                                : "max-w-[85%] rounded-lg border border-border bg-card px-4 py-3 text-sm"
                                        }
                                    >
                                        {m.role === "assistant" ? (
                                            <>
                                                {traces.map((t, idx) => (
                                                    <ToolCallBlock key={idx} trace={t} />
                                                ))}
                                                <div className="prose prose-sm prose-invert max-w-none prose-pre:bg-background prose-pre:border prose-pre:border-border">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{m.content}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {busy && (streaming || liveTraces.length > 0) && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] rounded-lg border border-border bg-card px-4 py-3 text-sm">
                                    {liveTraces.map((t, idx) => (
                                        <ToolCallBlock key={idx} trace={t} />
                                    ))}
                                    {streaming && (
                                        <div className="prose prose-sm prose-invert max-w-none prose-pre:bg-background prose-pre:border prose-pre:border-border">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{streaming}</ReactMarkdown>
                                        </div>
                                    )}
                                    <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-primary align-middle" />
                                </div>
                            </div>
                        )}

                        {busy && !streaming && liveTraces.length === 0 && (
                            <div className="flex justify-start">
                                <div className="rounded-lg border border-border bg-card px-4 py-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> thinking...
                                    </div>
                                    {toolNotes.length > 0 && (
                                        <div className="mt-2 space-y-1 border-t border-border pt-2">
                                            {toolNotes.map((n, i) => (
                                                <div key={i} className="flex items-center gap-1.5 text-[11px] font-mono text-primary/80">
                                                    <Wrench className="h-3 w-3" /> {n}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="border-t border-border bg-card/40 p-3">
                    <div className="mb-2 flex items-center justify-end gap-2">
                        {busy ? (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={stop}
                                className="h-7 gap-1.5 font-mono text-xs"
                            >
                                <Square className="h-3 w-3 fill-current" /> Stop
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={regenerate}
                                disabled={!canRegenerate}
                                className="h-7 gap-1.5 font-mono text-xs"
                                title="Re-run last user message"
                            >
                                <RefreshCw className="h-3 w-3" /> Regenerate
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    send();
                                }
                            }}
                            placeholder="message your agent... (Enter to send, Shift+Enter for newline)"
                            rows={2}
                            className="font-mono text-sm resize-none"
                            disabled={busy}
                        />
                        <Button onClick={send} disabled={busy || !input.trim()} className="h-full font-mono self-end">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
