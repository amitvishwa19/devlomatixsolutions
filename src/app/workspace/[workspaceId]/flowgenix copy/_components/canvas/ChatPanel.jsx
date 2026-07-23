'use client'

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, RotateCcw, MessageSquare, Trash2, Loader2, Wrench, X, Terminal, ChevronRight, Hash, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ChatPanel({
    sessionId,
    onSendMessage,
    onClose,
    onNewSession,
    messages,
    logs,
    onClearExecution,
    isStreaming,
    enableTools,
    onToggleTools,
}) {
    const [input, setInput] = useState("");
    const [selectedLog, setSelectedLog] = useState(null);
    const [viewMode, setViewMode] = useState("output"); // "input" | "output"
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (logs.length > 0 && !selectedLog) {
            setSelectedLog(logs[logs.length - 1]);
        }
    }, [logs, selectedLog]);

    const handleSend = useCallback(() => {
        const trimmed = input.trim();
        if (!trimmed || isStreaming) return;
        onSendMessage(trimmed);
        setInput("");
    }, [input, onSendMessage, isStreaming]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex h-full bg-card border-t border-white/5 shadow-2xl relative overflow-hidden font-sans text-white">


            {/* Left: Chat */}
            <div className="flex flex-col w-[380px] border-r border-white/5 bg-background">

                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 h-20">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-xs font-bold   text-white/80">Chat</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono">
                        <span>Session: {sessionId.slice(0, 8)}</span>
                        <button onClick={onNewSession} className="p-1 hover:text-white transition-colors">
                            <RotateCcw className="h-3 w-3" />
                        </button>
                    </div>
                </div>

                <ScrollArea className="h-[80vh]  px-4 py-4 space-y-4 min-h-0 ">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-20">
                            <MessageSquare className="h-10 w-10" />
                            <p className="text-[10px]  ">Awaiting Message...</p>
                        </div>
                    )}
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${msg.role === "user"
                                ? "bg-primary/20 text-primary-foreground border border-primary/20"
                                : "bg-white/5 text-white/90 border border-white/5"
                                }`}
                            >
                                {msg.role === "bot" ? (
                                    <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed text-xs">
                                        <ReactMarkdown>{msg.text || "..."}</ReactMarkdown>
                                        {msg.isStreaming && (
                                            <span className="inline-block w-1.5 h-3 bg-primary animate-pulse ml-1" />
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-xs">{msg.text}</span>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </ScrollArea>

                <div className="p-3 border-t border-white/5  space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <Wrench className="h-3 w-3 text-white/30" />
                            <span className="text-[10px] font-bold text-white/30  tracking-tighter">AI Tools</span>
                        </div>
                        <Switch
                            checked={enableTools || false}
                            onCheckedChange={(checked) => onToggleTools?.(checked)}
                            className="scale-75 data-[state=checked]:bg-primary"
                        />
                    </div>
                    <div className="flex items-end gap-2 bg-[#0f0f0f] border border-white/10 rounded-lg p-2 focus-within:border-primary/50 transition-colors">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type message, or press 'up' for previous one"
                            rows={1}
                            disabled={isStreaming}
                            className="flex-1 bg-transparent text-xs resize-none outline-none text-white placeholder:text-white/20 py-1"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isStreaming}
                            className="p-1.5 rounded-md bg-white/5 hover:bg-primary/20 text-white/50 hover:text-primary transition-all disabled:opacity-30"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Middle: Logs */}
            <div className="flex flex-col w-[280px] border-r border-white/5 bg-black/10">
                <div className="flex items-center justify-between p-4 py-2 border-b border-white/5 ">
                    <div className="flex items-center gap-2">
                        <Activity className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-xs font-bold   text-white/80">Logs</span>
                    </div>
                    <button onClick={onClearExecution} className="p-1 text-white/30 hover:text-destructive transition-colors">
                        <Trash2 className="h-3 w-3" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0 scrollbar-thin">
                    {logs.map((log) => (
                        <div
                            key={log.id}
                            onClick={() => setSelectedLog(log)}
                            className={`flex flex-col p-2 rounded border transition-all cursor-pointer ${selectedLog?.id === log.id
                                ? "bg-white/10 border-white/10"
                                : "bg-transparent border-transparent hover:bg-white/5"
                                }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${log.status === "success" ? "bg-emerald-500" : "bg-destructive"}`} />
                                    <span className="text-[10px] font-bold text-white/70  tracking-tight">{log.nodeName}</span>
                                </div>
                                <span className="text-[9px] font-mono text-white/30">{log.duration}ms</span>
                            </div>
                            <div className="text-[9px] text-white/40 pl-3.5 flex items-center gap-1">
                                <ChevronRight className="h-2.5 w-2.5" />
                                {log.status === "success" ? "Success" : "Failed"}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Inspector */}
            <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <Terminal className="h-3.5 w-3.5 text-white/50" />
                            <span className="text-xs font-bold   text-white/70">{selectedLog?.nodeName || 'Inspector'}</span>
                        </div>
                        {selectedLog && (
                            <div className="flex bg-black/40 rounded-md border border-white/5">
                                <button
                                    onClick={() => setViewMode("input")}
                                    className={`px-3 py-0.5 text-[10px] font-bold rounded transition-all ${viewMode === "input" ? "bg-white/10 text-white" : "text-white/30 hover:text-white"}`}
                                >
                                    INPUT
                                </button>
                                <button
                                    onClick={() => setViewMode("output")}
                                    className={`px-3 py-0.5 text-[10px] font-bold rounded transition-all ${viewMode === "output" ? "bg-white/10 text-white" : "text-white/30 hover:text-white"}`}
                                >
                                    OUTPUT
                                </button>
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className="p-1 text-white/30 hover:text-white transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-4 font-mono text-[11px] bg-black/20">
                    {selectedLog ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-white/20">
                                <div className="h-px flex-1 bg-white/5" />
                                <span className="text-[9px]  tracking-tighter font-bold">{viewMode} DATA</span>
                                <div className="h-px flex-1 bg-white/5" />
                            </div>
                            <pre className="text-emerald-500/90 whitespace-pre-wrap">
                                {JSON.stringify(viewMode === "output" ? selectedLog.output : (selectedLog.input || {}), null, 2)}
                            </pre>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full opacity-10">
                            <Hash className="h-12 w-12 mb-4" />
                            <p className="text-xs  tracking-[0.2em]">Select Trace Node</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
