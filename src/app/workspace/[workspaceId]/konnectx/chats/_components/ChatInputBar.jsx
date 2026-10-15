'use client';

import React, { useState, useCallback, memo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smile, Paperclip, Layout, Sparkles, Send, Loader2 } from "lucide-react";

const ChatInputBar = memo(function ChatInputBar({
    onSendMessage,
    onOpenTemplatePicker,
    onGetAiSuggestions,
    aiSuggestions = [],
    onClearAiSuggestions,
    isAiLoading = false,
    isSending = false,
    placeholder = "Type a message...",
    isSegmentChat = false,
    activeSegmentData = null,
    disabled = false
}) {
    const [text, setText] = useState("");

    const handleSubmit = useCallback((e) => {
        if (e) e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || isSending || disabled) return;
        onSendMessage(trimmed);
        setText("");
    }, [text, isSending, disabled, onSendMessage]);

    const handleApplySuggestion = useCallback((suggestion) => {
        setText(suggestion);
    }, []);

    return (
        <div className="p-4 bg-card/30 backdrop-blur-sm border-t border-border/50 flex items-center gap-3 shrink-0">
            <Button
                variant="ghost"
                size="icon"
                type="button"
                className="rounded-full text-muted-foreground hover:text-primary transition-colors"
                title="Emojis"
            >
                <Smile className="w-5 h-5" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                type="button"
                className="rounded-full text-muted-foreground hover:text-primary transition-colors"
                title="Attachments"
            >
                <Paperclip className="w-5 h-5" />
            </Button>

            <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Send a Template"
                onClick={onOpenTemplatePicker}
                className="rounded-full text-muted-foreground hover:text-primary transition-colors"
            >
                <Layout className="w-5 h-5" />
            </Button>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-2">
                {/* AI Suggestions Chips */}
                {aiSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-1 animate-in slide-in-from-bottom-2 duration-300">
                        {aiSuggestions.map((s, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleApplySuggestion(s)}
                                className="bg-primary/10 hover:bg-primary/20 text-primary text-[10px] px-2.5 py-1 rounded-full border border-primary/20 transition-colors max-w-[200px] truncate"
                            >
                                {s}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={onClearAiSuggestions}
                            className="text-[10px] text-muted-foreground hover:text-foreground px-2"
                        >
                            Clear
                        </button>
                    </div>
                )}

                <div className="flex gap-3 items-center">
                    <div className="flex-1 relative">
                        <Input
                            className="bg-background/50 border-border/30 h-10 rounded-full px-4 text-xs focus-visible:ring-primary/20 w-full"
                            placeholder={placeholder}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            disabled={disabled}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <Button
                            type="button"
                            onClick={onGetAiSuggestions}
                            disabled={isAiLoading || disabled}
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 w-8 h-8 rounded-full text-primary hover:bg-primary/10"
                            title="Get AI smart replies"
                        >
                            {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        </Button>
                    </div>

                    <Button
                        type="submit"
                        disabled={!text.trim() || isSending || disabled}
                        className="rounded-full w-10 h-10 p-0 bg-primary hover:bg-primary/90 shrink-0"
                        title={isSegmentChat ? `Broadcast message to ${activeSegmentData?.recipients?.length || 0} members` : "Send message"}
                    >
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin font-bold" /> : <Send className="w-4 h-4" />}
                    </Button>
                </div>
            </form>
        </div>
    );
});

export default ChatInputBar;
