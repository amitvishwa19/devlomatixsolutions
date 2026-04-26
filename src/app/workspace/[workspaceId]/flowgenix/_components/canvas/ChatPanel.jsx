'use client'

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, RotateCcw, MessageSquare, Trash2, Loader2, Wrench, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import ReactMarkdown from "react-markdown";

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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (logs.length > 0) setSelectedLog(logs[logs.length - 1]);
  }, [logs]);

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
    <div className="flex h-full bg-card border-t border-border shadow-2xl relative overflow-hidden">
      {/* Left: Chat */}
      <div className="flex flex-col w-[400px] border-r border-border bg-background/30">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-sm font-semibold text-foreground">Interactive Chat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {sessionId.slice(0, 8)}
            </span>
            <button onClick={onNewSession} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-all" title="New session">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0 scrollbar-thin">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-40">
              <MessageSquare className="h-10 w-10 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Your agent is ready. Type below to start the conversation.
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted text-foreground rounded-tl-none border border-border/50"
                }`}
              >
                {msg.role === "bot" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
                    <ReactMarkdown>{msg.text || "..."}</ReactMarkdown>
                    {msg.isStreaming && (
                      <span className="inline-block w-2 h-4 bg-primary/40 animate-pulse ml-1 align-text-bottom rounded-sm" />
                    )}
                  </div>
                ) : (
                  msg.text
                )}
                <div className={`text-[9px] mt-1 opacity-50 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border bg-muted/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-3.5 w-3.5 text-primary/70" />
              <span className="text-[11px] font-medium text-muted-foreground">Agent Tools</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground font-mono">
                {enableTools ? "Active" : "Standard"}
              </span>
              <Switch
                checked={enableTools || false}
                onCheckedChange={(checked) => onToggleTools?.(checked)}
                className="scale-75 data-[state=checked]:bg-primary"
              />
            </div>
          </div>
          
          <div className="flex items-end gap-2 border border-border rounded-xl px-3 py-2 bg-background shadow-inner focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={enableTools ? "Ask for data, calculations, or web info..." : "Message your AI workflow..."}
              rows={2}
              disabled={isStreaming}
              className="flex-1 bg-transparent text-sm resize-none outline-none text-foreground placeholder:text-muted-foreground/50 py-1"
            />
            <Button
              size="sm"
              variant="default"
              className="h-8 w-8 p-0 rounded-full shrink-0 mb-0.5 shadow-md"
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
            >
              {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Middle: Execution Logs */}
      <div className="flex flex-col w-[260px] border-r border-border bg-muted/5">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20">
          <span className="text-sm font-semibold text-foreground">Trace Logs</span>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive transition-colors" onClick={onClearExecution}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0 scrollbar-thin">
          {logs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-30 text-center px-4">
              <Loader2 className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-[10px] text-muted-foreground">Execution steps will appear here in real-time</p>
            </div>
          )}
          {logs.map((log) => (
            <div 
              key={log.id} 
              onClick={() => setSelectedLog(log)}
              className={`group flex flex-col p-2 rounded-lg border transition-all cursor-pointer ${
                selectedLog?.id === log.id 
                  ? "bg-primary/10 border-primary/30 shadow-sm" 
                  : "bg-background border-border hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {log.status === "success" ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                  )}
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedLog?.id === log.id ? "text-primary" : "text-muted-foreground"}`}>
                    {log.nodeName}
                  </span>
                </div>
                <span className="text-[9px] font-mono opacity-60">{log.duration}ms</span>
              </div>
              <div className="text-[10px] text-muted-foreground truncate opacity-70">
                {log.status === "success" ? "Execution completed" : "Execution failed"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Detailed Output */}
      <div className="flex flex-col flex-1 min-w-0 bg-background/50">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">Node Details</span>
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4 min-h-0 scrollbar-thin">
          {selectedLog ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">{selectedLog.nodeName}</h4>
                  <p className="text-[10px] text-muted-foreground">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedLog.status === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                }`}>
                  {selectedLog.status.toUpperCase()}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Execution Result</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="relative group">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => {
                       navigator.clipboard.writeText(JSON.stringify(selectedLog.output, null, 2));
                     }}>
                        <RotateCcw className="h-3 w-3" />
                     </Button>
                  </div>
                  <pre className="text-[11px] text-foreground font-mono whitespace-pre-wrap bg-muted/30 border border-border/50 rounded-xl p-4 shadow-inner max-h-[400px] overflow-auto">
                    {JSON.stringify(selectedLog.output, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-20 text-center">
              <Loader2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xs text-muted-foreground italic">Select a trace log entry to inspect node I/O</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
