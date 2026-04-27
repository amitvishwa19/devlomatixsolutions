'use client';

import React, { useState, useEffect, useRef } from "react";
import { 
    MessageCircle, 
    X, 
    Send, 
    Bot, 
    User, 
    Minus, 
    Maximize2,
    Sparkles,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            role: "assistant", 
            content: "Hi! I'm your Devlomatix AI assistant. How can I help you build your next venture today?",
            timestamp: new Date()
        }
    ]);
    
    const scrollRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now(),
            role: "user",
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        // Simulate AI Response
        setTimeout(() => {
            const aiResponse = {
                id: Date.now() + 1,
                role: "assistant",
                content: getSimulatedResponse(input),
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const getSimulatedResponse = (query) => {
        const q = query.toLowerCase();
        if (q.includes("venture") || q.includes("project")) return "We have several active ventures including Curexa (HealthTech), KonnectX (Communication), and SolarBright (Energy). Which one would you like to know more about?";
        if (q.includes("pricing") || q.includes("cost")) return "Our pricing is tailored to each project's scope. We offer flexible models for startups and enterprise solutions.";
        if (q.includes("contact") || q.includes("hire")) return "You can reach our team at hello@devlomatix.com or use the Contact page for a project inquiry.";
        return "That's interesting! Our engineering team specializes in building scalable platforms like that. Would you like to schedule a consultation?";
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-[380px] h-[550px] mb-4 bg-background/95 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="p-4 bg-primary/5 border-b border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Sparkles className="w-5 h-5 text-white animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-foreground">Devlomatix AI</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Always Active</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
                                    <Minus className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setIsOpen(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
                        >
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10, x: msg.role === 'user' ? 10 : -10 }}
                                    animate={{ opacity: 1, y: 0, x: 0 }}
                                    className={cn(
                                        "flex gap-3 max-w-[85%]",
                                        msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-border/50",
                                        msg.role === 'user' ? "bg-muted" : "bg-primary/10"
                                    )}>
                                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
                                    </div>
                                    <div className={cn(
                                        "rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed",
                                        msg.role === 'user' 
                                            ? "bg-primary text-white rounded-tr-none" 
                                            : "bg-muted/50 border border-border/50 text-foreground rounded-tl-none"
                                    )}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            
                            {isTyping && (
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-border/50">
                                        <Bot className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="bg-muted/50 border border-border/50 text-foreground rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-border/50 bg-background/50">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="relative"
                            >
                                <Input 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your message..."
                                    className="pr-12 h-12 rounded-2xl bg-muted/30 border-border/50 focus-visible:ring-primary/20"
                                />
                                <Button 
                                    type="submit"
                                    size="icon"
                                    disabled={!input.trim() || isTyping}
                                    className="absolute right-1.5 top-1.5 h-9 w-9 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                                >
                                    {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </Button>
                            </form>
                            <p className="mt-3 text-[9px] text-center text-muted-foreground uppercase tracking-[0.2em] font-bold opacity-50">
                                Powered by Devlomatix Intelligence
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trigger Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 pointer-events-auto",
                    isOpen 
                        ? "bg-destructive text-white rotate-90" 
                        : "bg-primary text-white hover:shadow-primary/20"
                )}
            >
                {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
                {!isOpen && (
                    <>
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full animate-pulse" />
                        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
                    </>
                )}
            </motion.button>
        </div>
    );
};

export default Chatbot;
