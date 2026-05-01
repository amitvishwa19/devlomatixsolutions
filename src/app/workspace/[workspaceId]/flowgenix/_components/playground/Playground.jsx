"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
    FlaskConical, 
    Send, 
    Trash2, 
    Sparkles, 
    Zap,
    Copy,
    Check,
    FileCode,
    ChevronDown,
    Settings2
} from "lucide-react";
import { toast } from "sonner";

export const Playground = ({ config }) => {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [busy, setBusy] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleRun = async () => {
        if (!input.trim()) return;
        setBusy(true);
        try {
            await new Promise(r => setTimeout(r, 1500));
            setOutput(`[PROTOTYPE RESPONSE]\n\nYou sent: "${input}"\n\nThis is a simulation of how the Playground will behave. In the final version, this will call the selected LLM directly with your system prompt and tools.`);
        } catch (e) {
            toast.error(e.message);
        } finally {
            setBusy(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Copied to clipboard");
    };

    const lineCount = input.split("\n").length;
    const lines = Array.from({ length: Math.max(20, lineCount + 10) }, (_, i) => i + 1);

    return (
        <div className="flex flex-col h-full w-full gap-4 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
                
                {/* Left Side: Code Editor style input */}
                <div className="flex flex-col h-full bg-[#1e1e1e] rounded-xl overflow-hidden border border-[#333] shadow-2xl">
                    {/* Editor Header */}
                    <div className="flex items-center bg-[#252526] px-1 border-b border-[#111]">
                        <div className="flex items-center gap-2 bg-[#1e1e1e] px-4 py-2.5 border-t-2 border-primary text-[11px] font-mono text-[#d4d4d4] cursor-default">
                            <FileCode className="h-3.5 w-3.5 text-[#519aba]" />
                            prompt_test.txt
                        </div>
                    </div>

                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-[#1e1e1e] text-[10px] font-mono text-[#858585] border-b border-[#333]">
                        <span>playground</span>
                        <ChevronDown className="h-3 w-3 -rotate-90" />
                        <span className="text-[#d4d4d4]">prompt_test.txt</span>
                    </div>

                    {/* Editor Content */}
                    <div className="flex flex-1 min-h-0 overflow-hidden">
                        <div className="w-12 bg-[#1e1e1e] border-r border-[#333] flex flex-col items-end py-4 pr-3 select-none shrink-0">
                            {lines.map(n => (
                                <span key={n} className="font-mono text-[11px] text-[#858585] h-[22px] leading-[22px]">{n}</span>
                            ))}
                        </div>
                        <div className="flex-1 relative bg-[#1e1e1e]">
                            <Textarea 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="// Type your prompt here to test..."
                                className="h-full w-full bg-transparent border-none focus-visible:ring-0 font-mono text-sm text-[#ce9178] p-4 resize-none leading-[22px]"
                            />
                        </div>
                    </div>

                    {/* Status Bar / Actions */}
                    <div className="flex items-center justify-between px-3 py-1.5 bg-[#007acc] text-white font-mono text-[10px] uppercase tracking-wider shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <Zap className="h-3 w-3" /> Ready
                            </div>
                            <div>UTF-8</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => setInput("")}
                                className="h-6 px-2 text-white hover:bg-white/10 font-mono text-[10px] uppercase"
                            >
                                <Trash2 className="h-3 w-3 mr-1" /> clear
                            </Button>
                            <Button 
                                size="sm" 
                                onClick={handleRun}
                                disabled={busy || !input.trim()}
                                className="h-6 px-4 bg-white text-[#007acc] hover:bg-white/90 font-mono text-[10px] uppercase font-bold"
                            >
                                {busy ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Send className="h-3 w-3 mr-1" />}
                                execute_test
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Output area */}
                <div className="flex flex-col gap-4">
                    <div className="flex-1 bg-card/30 border border-border rounded-xl p-4 flex flex-col gap-3 overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">assistant_output</span>
                            </div>
                            {output && (
                                <Button size="sm" variant="ghost" onClick={handleCopy} className="h-7 font-mono text-[10px] uppercase">
                                    {copied ? <Check className="h-3 w-3 mr-1 text-primary" /> : <Copy className="h-3 w-3 mr-1" />}
                                    {copied ? "copied" : "copy"}
                                </Button>
                            )}
                        </div>
                        <ScrollArea className="flex-1">
                            {output ? (
                                <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed text-foreground/90 p-2">
                                    {output}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground/20 font-mono italic text-xs py-20">
                                    <FlaskConical className="h-10 w-10 mb-4 opacity-5" />
                                    <p>Output will appear here after execution</p>
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Quick Config Overview */}
                    <div className="bg-secondary/20 border border-border rounded-xl p-4 flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Settings2 className="h-3.5 w-3.5" />
                            <span className="font-mono text-[10px] uppercase tracking-widest">active_parameters</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="font-mono text-[10px] text-muted-foreground uppercase">Agent</p>
                                <p className="font-mono text-xs font-bold text-primary">{config?.name || "Master"}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="font-mono text-[10px] text-muted-foreground uppercase">Temperature</p>
                                <p className="font-mono text-xs font-bold">{config?.temperature?.toFixed(2) || "0.70"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Loader2 = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
