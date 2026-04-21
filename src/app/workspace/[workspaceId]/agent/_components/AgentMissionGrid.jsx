'use client'
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  User, 
  Search, 
  Activity, 
  Cpu, 
  Circle, 
  Clock, 
  Radio, 
  ChevronRight,
  UserCheck,
  Zap,
  Layout,
  Layers
} from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

const generateSparkline = (base) => Array.from({ length: 10 }, (_, i) => ({ value: base + Math.random() * 20 }))

const StatusPill = ({ label, color, bg, active }) => (
    <div className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold cursor-pointer transition-all",
        active ? `${bg} ${color} border-transparent shadow-lg shadow-white/5` : "bg-card/20 border-border/20 text-muted-foreground hover:bg-card/40"
    )}>
        <div className={cn("w-2 h-2 rounded-full", active ? `bg-current` : "bg-muted-foreground/30")} />
        {label}
    </div>
)

const AgentCard = ({ icon: Icon, color, bg, border, label, sparkColor }) => {
    const data = generateSparkline(40)
    return (
        <Card className={cn("flex-1 border bg-card/20 backdrop-blur-xl rounded-[1.2rem] overflow-hidden", border)}>
            <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-2.5 rounded-xl border", bg, border)}>
                        <Icon className={cn("w-5 h-5", color)} />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/30" />
                        <div className={cn("w-1.5 h-1.5 rounded-full", bg)} />
                    </div>
                </div>

                <div className="h-12 w-full mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <Area type="monotone" dataKey="value" stroke={sparkColor} strokeWidth={2} fill="transparent" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                            <Clock className="w-3 h-3" />
                            039
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                            <Radio className="w-3 h-3" />
                            13
                        </div>
                    </div>
                    <div className="space-y-1 text-right">
                        <div className="text-[11px] font-bold text-foreground">23.28</div>
                        <div className="text-[10px] font-bold text-muted-foreground">838</div>
                    </div>
                </div>

                <div className="space-y-3 mt-auto">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                            <Layout className="w-3.5 h-3.5" />
                            Status
                         </div>
                    </div>
                    
                    <div className={cn("w-full py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider text-center", bg, border, color)}>
                        {label}
                    </div>

                    <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-bold text-muted-foreground">Progress</div>
                        <Progress value={75} className="h-1.5 bg-background/50 [&>div]:bg-[#2dd4bf]" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export const AgentMissionGrid = () => {
    return (
        <div className="space-y-8">
            <div className="flex flex-col space-y-4">
                <h2 className="text-xl font-bold tracking-tight px-1">Agent Mission Status</h2>
                <div className="flex flex-wrap items-center gap-3">
                    <StatusPill label="Mission Active" color="text-emerald-400" bg="bg-emerald-500/20" active />
                    <StatusPill label="Task Complete" color="text-cyan-400" bg="bg-cyan-500/20" />
                    <StatusPill label="Searching" color="text-blue-400" bg="bg-blue-500/20" />
                    <StatusPill label="Analyzing" color="text-purple-400" bg="bg-purple-500/20" />
                    <StatusPill label="Idle" color="text-orange-400" bg="bg-orange-500/20" />
                    
                    <div className="ml-auto w-10 h-10 rounded-xl bg-card/20 border border-border/20 flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-card/40">
                         <ChevronRight className="w-5 h-5" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 h-[400px]">
                <AgentCard 
                   icon={User} 
                   color="text-emerald-400" 
                   bg="bg-emerald-500/10" 
                   border="border-emerald-500/20" 
                   label="Mission Active"
                   sparkColor="#10b981"
                />
                <AgentCard 
                   icon={Layout} 
                   color="text-cyan-400" 
                   bg="bg-cyan-500/10" 
                   border="border-cyan-500/20" 
                   label="Processing"
                   sparkColor="#06b6d4"
                />
                <AgentCard 
                   icon={Search} 
                   color="text-blue-400" 
                   bg="bg-blue-500/10" 
                   border="border-blue-500/20" 
                   label="Searching"
                   sparkColor="#3b82f6"
                />
                <AgentCard 
                   icon={Layers} 
                   color="text-purple-400" 
                   bg="bg-purple-500/10" 
                   border="border-purple-500/20" 
                   label="Analyzing"
                   sparkColor="#8b5cf6"
                />
                <AgentCard 
                   icon={Zap} 
                   color="text-orange-400" 
                   bg="bg-orange-500/10" 
                   border="border-orange-500/20" 
                   label="Idle"
                   sparkColor="#f59e0b"
                />
            </div>
        </div>
    )
}
