'use client'

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, RotateCcw, MessageSquare, Trash2, Loader2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import ReactMarkdown from "react-markdown";

export default function FlowChatPanel({
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
    <div className="flex h-full bg-card border-t border-border">
      {/* Left: Chat */}
      <div className="flex flex-col w-[340px] border-r border-border">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
          <span className="text-sm font-medium text-foreground">Test Chat</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">
              Session: {sessionId?.slice(0, 5)}...
            </span>
            <button onClick={onNewSession} className="text-muted-foreground hover:text-foreground transition-colors" title="New session">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
          {messages.length === 0 && (
            <p className="text-xs text-muted-foreground text-center pt-4">
              Type a message to start testing...
            </p>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-muted text-foreground"
                    : "text-foreground prose prose-sm dark:prose-invert max-w-none"
                }`}
              >
                {msg.role === "bot" ? (
                  <>
                    <ReactMarkdown>{msg.text || "..."}</ReactMarkdown>
                    {msg.isStreaming && (
                      <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-text-bottom rounded-sm" />
                    )}
                  </>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-3 pb-3 pt-1 space-y-2 shrink-0">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Wrench className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-medium">Tools</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground">
                {enableTools ? "Auto-retry" : "Off"}
              </span>
              <Switch
                checked={enableTools || false}
                onCheckedChange={(checked) => onToggleTools?.(checked)}
                className="scale-75"
              />
            </div>
          </div>
          <div className="flex items-end gap-2 border border-border rounded-lg px-3 py-2 bg-background focus-within:ring-1 focus-within:ring-primary">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={2}
              disabled={isStreaming}
              className="flex-1 bg-transparent text-sm resize-none outline-none text-foreground placeholder:text-muted-foreground disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors pb-0.5"
            >
              {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Center: Logs */}
      <div className="flex flex-col w-[220px] border-r border-border">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
          <span className="text-sm font-medium text-foreground">Logs</span>
          <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 px-2" onClick={onClearExecution}>
            <Trash2 className="h-3 w-3" />
            Clear
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
          {logs.length === 0 && (
            <p className="text-xs text-muted-foreground text-center pt-4">No executions yet</p>
          )}
          {logs.map((log) => (
            <div key={log.id} className="text-xs space-y-1">
              <button
                onClick={() => setSelectedLog(log)}
                className={`flex flex-col gap-1 w-full px-3 py-2 rounded-md text-left transition-colors ${
                  selectedLog?.id === log.id ? "bg-primary/10 text-foreground" : "hover:bg-muted text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium">{log.nodeName}</span>
                    <span className={`text-[10px] ${log.status === 'success' ? 'text-emerald-500' : 'text-destructive'}`}>
                        {log.duration}
                    </span>
                </div>
                <div className="text-[10px] opacity-60">Status: {log.status}</div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Output */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border shrink-0">
          {selectedLog ? (
            <>
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground truncate">{selectedLog.nodeName}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedLog.status === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>
                {selectedLog.status}
              </span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Select a log entry</span>
          )}
        </div>
        <div className="flex-1 overflow-auto p-4 min-h-0 bg-muted/10">
          {selectedLog ? (
            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">OUTPUT</div>
                <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap bg-background border border-border rounded-lg p-3 overflow-auto max-h-[400px]">
                  {JSON.stringify(selectedLog.output, null, 2)}
                </pre>
              </div>
              {selectedLog.input && (
                <div>
                    <div className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">INPUT</div>
                    <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap bg-background border border-border rounded-lg p-3 overflow-auto max-h-[200px]">
                    {JSON.stringify(selectedLog.input, null, 2)}
                    </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30">
                <MessageSquare className="h-12 w-12 mb-2" />
                <p className="text-xs">No output to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
