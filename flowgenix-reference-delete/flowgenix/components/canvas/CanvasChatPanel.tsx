import { useEffect, useRef, useState } from "react";
import { Send, Trash2, RotateCw, X, CheckCircle2, AlertCircle, Loader2, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WorkflowRunLogRow, WorkflowRunRow } from "@/flowgenix/lib/workflow-storage";
import {
  ChatThread,
  appendThreadMessage,
  clearThreadMessages,
  createThread,
  deleteThread,
  ensureDefaultThread,
  listThreads,
  loadThreadMessages,
  renameThread,
} from "@/flowgenix/lib/thread-storage";
import { toast } from "sonner";

type Msg = { id: string; role: "user" | "assistant"; content: string };

interface Props {
  workflowId: string;
  onClose: () => void;
  onSend: (text: string) => Promise<void> | void;
  messages: Msg[];
  setMessages: (m: Msg[] | ((prev: Msg[]) => Msg[])) => void;
  runs: WorkflowRunRow[];
  logs: WorkflowRunLogRow[];
  selectedRunId: string | null;
  onSelectRun: (id: string | null) => void;
  onClearRuns?: () => void;
}

export const CanvasChatPanel = ({
  workflowId,
  onClose,
  onSend,
  messages,
  setMessages,
  runs,
  logs,
  selectedRunId,
  onSelectRun,
  onClearRuns,
}: Props) => {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const list = await listThreads("canvas", workflowId);
      if (list.length === 0) {
        const t = await ensureDefaultThread("canvas", workflowId);
        setThreads([t]);
        setActiveId(t.id);
      } else {
        setThreads(list);
        setActiveId(list[0].id);
      }
    })();
  }, [workflowId]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    (async () => {
      const m = await loadThreadMessages(activeId);
      setMessages(
        m.map((x, i) => ({
          id: `${activeId}-${i}`,
          role: x.role === "assistant" ? "assistant" : "user",
          content: x.content,
        })),
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy || !activeId) return;
    setInput("");
    setBusy(true);
    const beforeLen = messagesRef.current.length;
    try {
      await appendThreadMessage(activeId, { role: "user", content: text });
      const cur = threads.find((t) => t.id === activeId);
      if (cur && (cur.title === "New chat" || cur.title === "Default")) {
        const newTitle = text.slice(0, 48).replace(/\s+/g, " ").trim() || cur.title;
        renameThread(activeId, newTitle).then(() => {
          setThreads((s) => s.map((t) => (t.id === activeId ? { ...t, title: newTitle } : t)));
        }).catch(() => {});
      }
      await onSend(text);
      const after = messagesRef.current;
      for (let i = beforeLen; i < after.length; i++) {
        const m = after[i];
        if (m.role === "assistant") {
          try { await appendThreadMessage(activeId, { role: "assistant", content: m.content }); } catch {}
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const newThread = async () => {
    try {
      const t = await createThread("canvas", workflowId, "New chat");
      setThreads((s) => [t, ...s]);
      setActiveId(t.id);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const removeThread = async (id: string) => {
    if (!confirm("Delete this thread?")) return;
    try {
      await deleteThread(id);
      const remaining = threads.filter((t) => t.id !== id);
      setThreads(remaining);
      if (activeId === id) {
        if (remaining.length > 0) setActiveId(remaining[0].id);
        else {
          const t = await ensureDefaultThread("canvas", workflowId);
          setThreads([t]);
          setActiveId(t.id);
        }
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const renameCurrent = async () => {
    if (!activeId) return;
    const cur = threads.find((t) => t.id === activeId);
    const next = prompt("Rename thread", cur?.title ?? "");
    if (!next) return;
    try {
      await renameThread(activeId, next.trim());
      setThreads((s) => s.map((t) => (t.id === activeId ? { ...t, title: next.trim() } : t)));
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const resetThread = async () => {
    if (!activeId) return;
    try {
      await clearThreadMessages(activeId);
      setMessages([]);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const selectedLog = logs.find((l) => l.id === selectedLogId) ?? null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 flex h-[320px] max-h-[60vh] flex-col border-t border-border bg-card/95 backdrop-blur">
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_1fr_2fr] divide-x divide-border">
        {/* Chat */}
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="font-mono text-xs shrink-0">Chat</span>
              <select
                value={activeId ?? ""}
                onChange={(e) => setActiveId(e.target.value)}
                className="min-w-0 flex-1 max-w-[140px] truncate rounded bg-background px-1.5 py-0.5 font-mono text-[10px] outline-none ring-1 ring-border focus:ring-primary"
                title="Switch thread"
              >
                {threads.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title || "Untitled"}
                  </option>
                ))}
              </select>
              <button type="button" onClick={newThread} title="New thread" className="text-muted-foreground hover:text-primary">
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={renameCurrent} title="Rename" className="text-muted-foreground hover:text-foreground">
                <Pencil className="h-3 w-3" />
              </button>
              {activeId && (
                <button type="button" onClick={() => removeThread(activeId)} title="Delete thread" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={resetThread}
                className="text-muted-foreground transition-colors hover:text-foreground"
                title="Clear messages in this thread"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground transition-colors hover:text-foreground"
                title="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3">
            {messages.length === 0 ? (
              <p className="text-center font-mono text-xs text-muted-foreground">
                Type a message to start…
              </p>
            ) : (
              <div className="space-y-2">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[85%] rounded-md px-2.5 py-1.5 font-mono text-xs ${
                      m.role === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
                {busy && (
                  <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> running workflow…
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-border p-2">
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Type a message…"
                className="flex-1 bg-transparent font-mono text-xs outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={send}
                className="text-primary transition-opacity hover:opacity-80 disabled:opacity-30"
                disabled={!input.trim() || busy}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Logs (runs list) */}
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="font-mono text-xs">Logs</span>
            {onClearRuns && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 gap-1 font-mono text-[10px]"
                onClick={onClearRuns}
              >
                <Trash2 className="h-3 w-3" /> Clear
              </Button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {runs.length === 0 ? (
              <p className="px-3 py-3 text-center font-mono text-xs text-muted-foreground">
                No executions yet
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {runs.map((r) => {
                  const active = r.id === selectedRunId;
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectRun(r.id);
                          setSelectedLogId(null);
                        }}
                        className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-secondary/40 ${
                          active ? "bg-secondary/60" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {r.status === "running" ? (
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                          ) : r.status === "success" ? (
                            <CheckCircle2 className="h-3 w-3 text-primary" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-destructive" />
                          )}
                          <span className="font-mono text-[11px]">
                            {new Date(r.started_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {r.trigger}
                        </span>
                      </button>

                      {active && logs.length > 0 && (
                        <ul className="space-y-0.5 border-t border-border bg-background/40 px-3 py-2">
                          {logs.map((l) => (
                            <li key={l.id}>
                              <button
                                type="button"
                                onClick={() => setSelectedLogId(l.id)}
                                className={`flex w-full items-center gap-2 rounded px-1.5 py-1 text-left transition-colors hover:bg-secondary/60 ${
                                  selectedLogId === l.id ? "bg-secondary" : ""
                                }`}
                              >
                                {l.status === "error" ? (
                                  <AlertCircle className="h-3 w-3 shrink-0 text-destructive" />
                                ) : (
                                  <CheckCircle2 className="h-3 w-3 shrink-0 text-primary" />
                                )}
                                <span className="truncate font-mono text-[10px]">
                                  {l.node_label ?? l.node_id}
                                </span>
                                {l.duration_ms != null && (
                                  <span className="ml-auto font-mono text-[9px] text-muted-foreground">
                                    {l.duration_ms}ms
                                  </span>
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Output */}
        <div className="flex min-h-0 flex-col">
          <div className="border-b border-border px-3 py-2">
            <span className="font-mono text-xs text-muted-foreground">
              {selectedLog ? selectedLog.node_label ?? selectedLog.node_id : "Select a log entry"}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3">
            {!selectedLog ? (
              <p className="text-center font-mono text-xs text-muted-foreground">
                No output to display
              </p>
            ) : (
              <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                {selectedLog.message ? selectedLog.message + "\n\n" : ""}
                {selectedLog.data
                  ? JSON.stringify(selectedLog.data, null, 2)
                  : ""}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
