'use client';

import React, { useState, useEffect, use } from 'react';
import { 
    Bot, 
    Settings2, 
    ShieldCheck, 
    ShieldAlert, 
    Zap, 
    Globe, 
    Activity, 
    Cpu, 
    Network,
    Terminal,
    Sparkles,
    Lock,
    Key,
    Blocks,
    ChevronRight,
    ArrowUpRight,
    Power,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useModal } from '@/hooks/useModal';
import axios from '@/utils/axios';
import { toast } from 'sonner';
import { AIClawCredentialModal } from './_components/AIClawCredentialModal';

export default function AIAgentDashboard({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params?.workspaceId;
    const { onOpen } = useModal();

    const [loading, setLoading] = useState(true);
    const [agentStatus, setAgentStatus] = useState({
        enabled: false,
        apiUrl: '',
        status: 'disconnected'
    });

    const fetchAgentStatus = async () => {
        if (!workspaceId) return;
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/workspace/${workspaceId}/agent`);
            setAgentStatus({
                enabled: data.enabled || false,
                apiUrl: data.apiUrl || '',
                status: data.enabled ? 'connected' : 'disconnected'
            });
        } catch (error) {
            console.error("Status Fetch Error:", error);
            setAgentStatus(prev => ({ ...prev, status: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgentStatus();
    }, [workspaceId]);

    const handleOpenConfig = () => {
        onOpen("aiClawCredential", { 
            workspaceId, 
            onApply: fetchAgentStatus 
        });
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden font-sans">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/5 blur-[120px] rounded-full animate-bounce duration-[10s]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                                <Bot className="w-8 h-8 text-white" />
                            </div>
                            <div className="h-10 w-[1px] bg-white/10 mx-2 hidden md:block" />
                            <div>
                                <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent italic">
                                    AI AGENT ENGINE
                                </h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <Badge variant="outline" className="bg-indigo-500/5 border-indigo-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-0.5 text-indigo-400">
                                        OpenClaw v2.4
                                    </Badge>
                                    <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-sm">
                                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${agentStatus.enabled ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-tighter">
                                            System {agentStatus.enabled ? 'Online' : 'Hibernating'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button 
                            variant="outline" 
                            onClick={fetchAgentStatus}
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl px-4 py-6 font-bold text-xs uppercase tracking-widest gap-2 backdrop-blur-md"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh Status
                        </Button>
                        <Button 
                            onClick={handleOpenConfig}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-6 font-black text-xs uppercase tracking-[0.2em] gap-3 shadow-2xl shadow-indigo-500/40 border-t border-white/10 transition-all active:scale-95"
                        >
                            <Settings2 className="w-5 h-5" />
                            Configure System
                        </Button>
                    </div>
                </div>

                {/* Primary Stats/Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Status Card */}
                    <div className="col-span-1 md:col-span-2 group">
                        <div className="h-full bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden transition-all hover:border-indigo-500/30">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Activity className="w-48 h-48 -mr-12 -mt-12 text-indigo-500" />
                            </div>
                            
                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                                        <Zap className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <h2 className="text-xl font-bold tracking-tight">Active Node Bridge</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-12">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Primary Gateway</p>
                                        <div className="flex items-center gap-3">
                                            <Globe className="w-4 h-4 text-white/40" />
                                            <p className="text-sm font-bold font-mono truncate max-w-[200px] text-indigo-100 italic">
                                                {agentStatus.apiUrl || 'Bridge Not Established'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Auth Protocol</p>
                                        <div className="flex items-center gap-3">
                                            <Lock className="w-4 h-4 text-emerald-500/60" />
                                            <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold text-[10px] px-3">AES-256 HMAC</Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/5 mt-4">
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2 px-4 py-2 border border-white/5 bg-white/5 rounded-2xl">
                                            <Network className="w-4 h-4 text-indigo-400" />
                                            <span className="text-xs font-bold text-white/70 tracking-tight italic">Low Latency Transit</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 border border-white/5 bg-white/5 rounded-2xl">
                                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                            <span className="text-xs font-bold text-white/70 tracking-tight italic">E2E Encryption</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 border border-white/5 bg-white/5 rounded-2xl">
                                            <Terminal className="w-4 h-4 text-purple-400" />
                                            <span className="text-xs font-bold text-white/70 tracking-tight italic">Command Execution</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access / Stats */}
                    <div className="space-y-6">
                        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-white/20 transition-all">
                            <div className="p-4 bg-emerald-500/10 rounded-3xl mb-2">
                                <Blocks className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-black italic">CLAW-SYNC</h3>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                                Universal Event Listening System for Multi-Model Agents
                            </p>
                            <Button variant="link" className="text-emerald-500 font-bold uppercase text-[10px] tracking-widest gap-2">
                                View Webhooks <ArrowUpRight className="w-3.5 h-3.5" />
                            </Button>
                        </div>

                        <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                            <div className="relative z-10 space-y-4">
                                <div className="flex justify-between items-center">
                                    <Cpu className="w-8 h-8 text-white/90" />
                                    <Power className="w-6 h-6 text-white/40 group-hover:text-white transition-colors cursor-pointer" />
                                </div>
                                <h3 className="text-xl font-black italic uppercase italic">Launch Node</h3>
                                <p className="text-[10px] font-bold text-white/70 leading-relaxed uppercase tracking-wider">
                                    Initiate deep-reasoning agent cycles across available models.
                                </p>
                                <Button className="w-full bg-white text-indigo-600 font-black rounded-2xl py-6 uppercase tracking-widest text-[10px] border-none hover:bg-white/90">
                                    EXECUTE AGENT CYCLE
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features / Modules Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-12">
                    <div className="md:col-span-4 flex items-center gap-4 mb-4">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-sm font-black uppercase tracking-[0.4em] text-white/40">Powered Capabilities</h2>
                        <div className="h-[1px] flex-1 bg-white/5" />
                    </div>

                    {[
                        { title: 'Semantic Memory', icon: Network, color: 'indigo', desc: 'Vector-based long-term memory for contextual awareness.' },
                        { title: 'Auto-Tasking', icon: Zap, color: 'emerald', desc: 'Self-organizing task decomposition and execution.' },
                        { title: 'Guardrails', icon: ShieldCheck, color: 'purple', desc: 'Enterprise-grade safety controls and output filtering.' },
                        { title: 'Omni-Model', icon: Blocks, color: 'amber', desc: 'Dynamic switching between 15+ LLM architectures.' }
                    ].map((feature, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 transition-all hover:bg-white/10 hover:-translate-y-1">
                            <feature.icon className={`w-8 h-8 text-${feature.color}-500/80 mb-4`} />
                            <h4 className="text-sm font-black tracking-tight mb-2 uppercase italic">{feature.title}</h4>
                            <p className="text-[10px] font-medium text-white/40 leading-relaxed uppercase">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals */}
            <AIClawCredentialModal />
        </div>
    );
}
