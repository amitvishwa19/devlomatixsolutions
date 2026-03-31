import {
    Zap,
    Bot,
    Mail,
    Globe,
    Database,
    Clock,
    Cpu,
    Search,
    MessageSquare,
    Workflow,
    Play,
    RefreshCw,
    Layers,
    MousePointer2,
    Settings2,
    SquareStack,
    Brain,
    MemoryStick,
    Puzzle,
    Sparkles,
    History
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const nodeConfig = [
    {
        category: "Triggers",
        icon: MousePointer2,
        items: [
            { id: 'webhook', type: 'triggerNode', subType: 'webhook', label: 'Webhook', icon: Globe, description: 'Triggered via HTTP post request' },
            { id: 'chat', type: 'triggerNode', subType: 'chat', label: 'Chat Trigger', icon: MessageSquare, description: 'Started from a chat message' },
            { id: 'schedule', type: 'triggerNode', subType: 'schedule', label: 'Schedule', icon: Clock, description: 'Run periodically (cron)' },
            { id: 'manual', type: 'triggerNode', subType: 'manual', label: 'Manual Trigger', icon: Play, description: 'Run manually via button' },
        ]
    },
    {
        category: "AI Agents",
        icon: Sparkles,
        items: [
            { id: 'ai-agent', type: 'agentNode', subType: 'agent', label: 'AI Agent', icon: Brain, description: 'Reasoning engine with tool access' },
        ]
    },
    {
        category: "AI Models",
        icon: Cpu,
        items: [
            { id: 'model-gemini', type: 'modelNode', subType: 'model', label: 'Gemini Pro', icon: Sparkles, description: 'Google Gemini 2.5 Flash' },
            { id: 'model-openai', type: 'modelNode', subType: 'model', label: 'GPT-4o', icon: Cpu, description: 'OpenAI Latest Model' },
        ]
    },
    {
        category: "AI Memory",
        icon: History,
        items: [
            { id: 'mem-window', type: 'memoryNode', subType: 'window', label: 'Chat Memory', icon: MemoryStick, description: 'Remembers recent messages' },
        ]
    },
    {
        category: "Logic & AI",
        icon: Bot,
        items: [
            { id: 'gemini', type: 'actionNode', subType: 'ai', label: 'Simple AI', icon: Bot, description: 'Single-turn LLM response' },
            { id: 'http-req', type: 'actionNode', subType: 'http', label: 'HTTP Request', icon: Globe, description: 'Execute external API call' },
        ]
    },
    {
        category: "Integrations",
        icon: Layers,
        items: [
            { id: 'email-send', type: 'actionNode', subType: 'email', label: 'Send Email', icon: Mail, description: 'Send automated email' },
            { id: 'db-write', type: 'actionNode', subType: 'db', label: 'Database', icon: Database, description: 'Update or read DB records' },
        ]
    }
];

export const NodeSidebar = () => {
    const onDragStart = (event, nodeData) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-[300px] bg-background border-r border-border h-full flex flex-col p-6 space-y-6 z-10 shadow-2xl overflow-hidden">
            <div className="space-y-1">
                <h2 className="text-xl font-black text-foreground/90 uppercase tracking-tight">Nodes Library</h2>
                <p className="text-[10px] uppercase font-bold text-muted-foreground opacity-50 tracking-widest">Drag and drop into canvas</p>
            </div>

            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                    placeholder="Search nodes..."
                    className="w-full bg-muted/30 border border-border/50 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                />
            </div>

            <ScrollArea className="flex-1 -mr-4 pr-4">
                <Accordion type="multiple" className="w-full space-y-2">
                    {nodeConfig.map((section) => (
                        <AccordionItem key={section.category} value={section.category} className="border-none">
                            <AccordionTrigger className="hover:no-underline py-2 group cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                        <section.icon size={12} />
                                    </div>
                                    <span className="text-sm font-semibold text-foreground opacity-80">{section.category}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-4">
                                <div className="grid gap-2.5">
                                    {section.items.map((node) => (
                                        <div
                                            key={node.id}
                                            className="group p-2.5 rounded-xl border border-border/50 bg-card hover:bg-muted/30 hover:border-primary/20 cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:shadow-primary/5 active:scale-[0.98] relative overflow-hidden"
                                            onDragStart={(event) => onDragStart(event, node)}
                                            draggable
                                        >
                                            {/* Decorator */}
                                            <div className="absolute right-[2px] top-[2px] opacity-0 group-hover:opacity-10 group-hover:translate-x-[-10px] group-hover:translate-y-[10px] transition-all">
                                                <node.icon size={20} />
                                            </div>

                                            <div className="flex items-start gap-2.5 relative z-10">
                                                <div className="p-1.5 rounded-lg bg-primary/5 border border-primary/10 shadow-inner group-hover:bg-primary/10 transition-colors">
                                                    <node.icon size={14} className="text-primary/70" />
                                                </div>
                                                <div className="space-y-0.5 min-w-0">
                                                    <h4 className="text-xs font-semibold  leading-none truncate">{node.label}</h4>
                                                    <p className="text-[8px] text-muted-foreground leading-tight line-clamp-1">{node.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </ScrollArea>

            <div className="pt-4 border-t border-border/50 mt-auto">
                <div className="bg-primary/5 rounded-xl p-3.5 space-y-2 border border-primary/10">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-primary/20 flex items-center justify-center">
                            <Zap size={10} className="text-primary" />
                        </div>
                        <span className="text-[9px] font-black text-foreground uppercase tracking-widest">Builder Tip</span>
                    </div>
                    <p className="text-[8px] text-muted-foreground leading-relaxed">
                        Start with a <b>Trigger</b>, then connect <b>Actions</b> to automate your tasks. Click a node to view its configuration.
                    </p>
                </div>
            </div>
        </aside>
    );
};
