import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", content: "👋 Hi there! I'm CareBot, your CareWell HMS assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const streamChat = async (userMessages) => {
        const resp = await fetch(CHAT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ messages: userMessages }),
        });

        if (!resp.ok) {
            const errorData = await resp.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to get response");
        }

        if (!resp.body) throw new Error("No response body");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let assistantContent = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            textBuffer += decoder.decode(value, { stream: true });

            let newlineIndex;
            while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
                let line = textBuffer.slice(0, newlineIndex);
                textBuffer = textBuffer.slice(newlineIndex + 1);

                if (line.endsWith("\r")) line = line.slice(0, -1);
                if (line.startsWith(":") || line.trim() === "") continue;
                if (!line.startsWith("data: ")) continue;

                const jsonStr = line.slice(6).trim();
                if (jsonStr === "[DONE]") break;

                try {
                    const parsed = JSON.parse(jsonStr);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                        assistantContent += content;
                        setMessages(prev => {
                            const last = prev[prev.length - 1];
                            if (last?.role === "assistant" && last?.isStreaming) {
                                return prev.map((m, i) =>
                                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                                );
                            }
                            return [...prev, { role: "assistant", content: assistantContent, isStreaming: true }];
                        });
                    }
                } catch {
                    textBuffer = line + "\n" + textBuffer;
                    break;
                }
            }
        }

        // Mark streaming as complete
        setMessages(prev => prev.map((m, i) =>
            i === prev.length - 1 && m.isStreaming ? { ...m, isStreaming: false } : m
        ));
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: "user", content: input.trim() };
        const updatedMessages = [...messages.filter(m => m.role !== "assistant" || !m.isStreaming), userMessage];

        setMessages(updatedMessages);
        setInput("");
        setIsLoading(true);

        try {
            // Filter out the initial greeting for API calls
            const apiMessages = updatedMessages.filter((m, i) => !(i === 0 && m.role === "assistant"));
            await streamChat(apiMessages);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "I'm sorry, I encountered an issue. Please try again or contact our support team."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-20 right-0 w-80 sm:w-96 h-[480px] bg-background rounded-2xl shadow-2xl border border-border/50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="hero-gradient p-4 text-primary-foreground shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold">CareBot</p>
                                    <p className="text-sm text-primary-foreground/80">CareWell HMS Assistant</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-4">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        {message.role === "assistant" && (
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <Bot className="h-4 w-4 text-primary" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[75%] rounded-2xl px-4 py-2 ${message.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted"
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                        {message.role === "user" && (
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                                                <User className="h-4 w-4 text-primary-foreground" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isLoading && messages[messages.length - 1]?.role === "user" && (
                                    <div className="flex gap-2 justify-start">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <Bot className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="bg-muted rounded-2xl px-4 py-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-border/50 shrink-0">
                            <div className="flex gap-2">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Type a message..."
                                    disabled={isLoading}
                                    className="flex-1"
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    size="icon"
                                    className="hero-gradient"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center hero-gradient hover:scale-110 active:scale-95 transition-transform"
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-primary-foreground" />
                ) : (
                    <MessageCircle className="h-6 w-6 text-primary-foreground" />
                )}
            </button>

            {/* Pulse animation when closed */}
            {!isOpen && (
                <span className="absolute -inset-1 rounded-full bg-primary/30 animate-ping pointer-events-none" />
            )}
        </div>
    );
};

export default ChatbotWidget;
