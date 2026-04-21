'use client'
import React from 'react'
import { SwarmIntelligenceGraph } from './SwarmIntelligenceGraph'
import { LiveTelemetrySidebar } from './LiveTelemetrySidebar'
import { AgentMissionGrid } from './AgentMissionGrid'
import { 
  Globe, 
  Maximize2, 
  Bell, 
  AlertTriangle, 
  Settings,
  ChevronRight,
  Plus
} from 'lucide-react'

export const OverviewContent = () => {
  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in zoom-in-95 duration-700">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-2xl font-bold tracking-tight text-foreground font-heading">AI Swarm Intelligence</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-background/40 border border-border/20 rounded-md p-0.5">
             <div className="px-4 py-1.5 rounded-[4px] bg-card/60 text-[10px] font-bold text-muted-foreground border border-border/20 cursor-pointer hover:bg-card transition-colors">Global</div>
             <div className="p-1.5 text-muted-foreground hover:text-cyan-400 transition-colors cursor-pointer">
                <Maximize2 className="w-3.5 h-3.5" />
             </div>
          </div>
          
          <div className="relative p-2 rounded-md bg-background/40 border border-border/20 text-muted-foreground hover:text-cyan-400 transition-colors cursor-pointer">
            <Bell className="w-4 h-4" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 border-2 border-[#0B121E]" />
          </div>

          <div className="p-2 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-500 hover:bg-orange-500/20 transition-all cursor-pointer">
            <AlertTriangle className="w-4 h-4" />
          </div>

          <div className="p-2 rounded-md bg-background/40 border border-border/20 text-muted-foreground hover:text-cyan-400 transition-colors cursor-pointer">
            <Settings className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Grid Layout (12 Columns) */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Left Side: Graph and Mission Status (9 Columns) */}
        <div className="col-span-9 flex flex-col space-y-8 min-h-0 overflow-y-auto pr-2 scrollbar-hide">
          <div className="h-[480px] shrink-0">
            <SwarmIntelligenceGraph />
          </div>
          <div className="pb-8">
            <AgentMissionGrid />
          </div>
        </div>

        {/* Right Side: Telemetry (3 Columns) */}
        <div className="col-span-3 h-full">
           <LiveTelemetrySidebar />
        </div>
      </div>
    </div>
  )
}
