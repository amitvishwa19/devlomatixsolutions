'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
    Sparkles,
    Loader2,
    FileText,
    CheckCircle2,
    Copy,
    Check,
    Send,
    Bot,
    Wand2,
    ListTodo,
    Lightbulb,
    ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { runDocumentAi } from '../_actions/run-document-ai';

export default function DocumentAiModal({
    isOpen,
    onOpenChange,
    document,
    workspaceId,
    onInsertText
}) {
    const [loading, setLoading] = useState(false);
    const [activeAction, setActiveAction] = useState('summarize');
    const [aiResult, setAiResult] = useState('');
    const [questionInput, setQuestionInput] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen && document) {
            // Auto run initial summary when modal opens
            runAiAction('summarize');
        } else {
            setAiResult('');
            setQuestionInput('');
        }
    }, [isOpen, document]);

    const runAiAction = async (action, customQuestion = null) => {
        if (!document?.id) return;
        setLoading(true);
        setActiveAction(action);
        try {
            const res = await runDocumentAi(workspaceId, document.id, {
                action,
                question: customQuestion || questionInput,
            });

            if (!res.success) throw new Error(res.error);

            setAiResult(res.result || 'No response generated.');
            if (customQuestion) {
                setQuestionInput('');
            }
        } catch (error) {
            console.error("AI Action Error:", error);
            const msg = error.message || "Failed to process AI request";
            toast.error(msg);
            setAiResult(`⚠️ ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!aiResult) return;
        navigator.clipboard.writeText(aiResult);
        setCopied(true);
        toast.success("AI insights copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleInsert = () => {
        if (!aiResult || !onInsertText) return;
        onInsertText(aiResult);
        toast.success("Inserted into document");
        onOpenChange(false);
    };

    const handleAskSubmit = (e) => {
        e.preventDefault();
        if (!questionInput.trim()) return;
        runAiAction('ask', questionInput.trim());
    };

    if (!document) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-border/40 bg-gradient-to-r from-primary/10 via-purple-500/10 to-transparent flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                            <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                AI Document Intelligence
                                <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/30 text-[9px] font-mono">
                                    Gemini 1.5
                                </Badge>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground truncate max-w-sm">
                                Analyzing: <span className="font-semibold text-foreground">{document.name}</span>
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                {/* Quick Action Pills */}
                <div className="px-4 py-2.5 bg-muted/20 border-b border-border/30 flex items-center gap-2 overflow-x-auto">
                    <button
                        onClick={() => runAiAction('summarize')}
                        disabled={loading}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all shrink-0 ${activeAction === 'summarize'
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'bg-background hover:bg-muted border border-border/50 text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <FileText className="w-3.5 h-3.5" /> Executive Summary
                    </button>

                    <button
                        onClick={() => runAiAction('actions')}
                        disabled={loading}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all shrink-0 ${activeAction === 'actions'
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'bg-background hover:bg-muted border border-border/50 text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <ListTodo className="w-3.5 h-3.5 text-emerald-500" /> Action Items
                    </button>

                    <button
                        onClick={() => runAiAction('polish')}
                        disabled={loading}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all shrink-0 ${activeAction === 'polish'
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'bg-background hover:bg-muted border border-border/50 text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Wand2 className="w-3.5 h-3.5 text-amber-500" /> Polish Writing
                    </button>
                </div>

                {/* AI Output Content Box */}
                <div className="flex-1 p-5 overflow-y-auto min-h-[260px] max-h-[380px] bg-background/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3">
                            <Loader2 className="w-7 h-7 animate-spin text-primary" />
                            <div className="text-center space-y-1">
                                <p className="text-xs font-bold text-foreground">Analyzing document context...</p>
                                <p className="text-[10px] text-muted-foreground font-mono">Generating high-fidelity intelligence</p>
                            </div>
                        </div>
                    ) : aiResult ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap font-sans bg-card/60 p-4 rounded-xl border border-border/40">
                            {aiResult}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                            <Bot className="w-8 h-8 mb-2 opacity-40" />
                            <p className="text-xs font-semibold">Select an AI action above or ask a question below</p>
                        </div>
                    )}
                </div>

                {/* Question Input Form */}
                <form onSubmit={handleAskSubmit} className="p-3 border-t border-border/40 bg-card/80 flex items-center gap-2">
                    <div className="relative flex-1">
                        <Input
                            value={questionInput}
                            onChange={(e) => setQuestionInput(e.target.value)}
                            placeholder="Ask any question about this document..."
                            className="h-9 text-xs pl-3 pr-8 rounded-lg bg-background border-border/60"
                            disabled={loading}
                        />
                    </div>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={loading || !questionInput.trim()}
                        className="h-9 px-3 text-xs font-semibold gap-1.5"
                    >
                        <Send className="w-3.5 h-3.5" /> Ask
                    </Button>
                </form>

                {/* Footer Controls */}
                <DialogFooter className="px-4 py-2.5 bg-muted/20 border-t border-border/30 flex items-center justify-between sm:justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        disabled={!aiResult}
                        className="h-8 text-xs font-semibold gap-1.5 bg-background border-border/60"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied!' : 'Copy Insights'}
                    </Button>

                    <div className="flex items-center gap-2">
                        {onInsertText && (
                            <Button
                                size="sm"
                                onClick={handleInsert}
                                disabled={!aiResult}
                                className="h-8 text-xs font-semibold gap-1.5 bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                            >
                                <Sparkles className="w-3.5 h-3.5" /> Insert into Document
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="h-8 text-xs font-semibold"
                        >
                            Close
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
