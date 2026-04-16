import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Terminal, Send, Cpu, Bot } from 'lucide-react';
import { Button } from "@/components/ui/button";

export const TerminalContent = ({
    chatMessages,
    inputMessage,
    setInputMessage,
    handleSendMessage,
    agents = [],
    selectedAgentId,
    setSelectedAgentId,
    isThinking
}) => {
    return (
        <Card className="border-border/40 bg-card/40 backdrop-blur-md rounded-md overflow-hidden shadow-2xl h-[650px] flex flex-col">
            <CardHeader className="border-b border-border/10 py-4 flex flex-row items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-black border border-white/10 flex items-center justify-center">
                        <Terminal className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <CardTitle className="text-sm">Agent Terminal</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-40">Direct Pulse Link</CardDescription>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                        <SelectTrigger className="w-[180px] h-9 bg-black/40 border-white/5 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                            <SelectValue placeholder="SELECT AGENT" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0a0a] border-white/5 rounded-xl">
                            {agents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.id} className="text-[10px] font-bold uppercase hover:bg-white/5">
                                    <div className="flex items-center gap-2">
                                        <Bot className="w-3 h-3 text-indigo-400" />
                                        {agent.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 animate-pulse text-[10px] font-black px-2 h-7">UPLINK ACTIVE</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 font-mono custom-scrollbar bg-black/5 relative">
                {chatMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                        <Cpu className="w-12 h-12" />
                        <p className="text-xs font-bold uppercase tracking-[0.3em]">Awaiting Uplink Initialization</p>
                    </div>
                )}

                {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-xl border ${msg.sender === 'User'
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                                : 'bg-card border-border/40 text-foreground shadow-sm'
                            }`}>
                            <div className="flex items-center justify-between gap-4 mb-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${msg.sender === 'User' ? 'opacity-80' : 'text-indigo-400'}`}>
                                    {msg.sender}
                                </span>
                                <span className="text-[9px] opacity-30 font-bold">{msg.time}</span>
                            </div>
                            <p className="text-xs leading-relaxed opacity-90">{msg.text}</p>

                            {msg.node && (
                                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                                    <Badge variant="outline" className="text-[8px] font-black bg-emerald-500/5 text-emerald-500 border-emerald-500/10 py-0 flex items-center gap-1">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                        NODE: {msg.node.name}
                                    </Badge>
                                    <Badge variant="outline" className="text-[8px] font-black bg-indigo-500/5 text-indigo-400 border-indigo-500/10 py-0">
                                        {msg.node.provider}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isThinking && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="bg-card border border-border/40 p-4 rounded-xl shadow-sm space-y-2">
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Agent Processing</span>
                            </div>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-indigo-500/20 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 rounded-full bg-indigo-500/20 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 rounded-full bg-indigo-500/20 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-4 border-t border-border/10 shrink-0 bg-background/20 backdrop-blur-sm">
                <div className={`flex w-full gap-2 bg-black/40 rounded-xl p-1.5 border border-white/5 transition-all ${!selectedAgentId ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-500/50 focus-within:border-indigo-500'}`}>
                    <Input
                        disabled={!selectedAgentId || isThinking}
                        className="border-0 bg-transparent focus-visible:ring-0 text-sm placeholder:text-muted-foreground/30 h-10"
                        placeholder={selectedAgentId ? "EXECUTE COMMAND..." : "SELECT TARGET AGENT FIRST..."}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button
                        disabled={!selectedAgentId || isThinking || !inputMessage.trim()}
                        size="icon"
                        className="w-10 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                        onClick={handleSendMessage}
                    >
                        {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};
