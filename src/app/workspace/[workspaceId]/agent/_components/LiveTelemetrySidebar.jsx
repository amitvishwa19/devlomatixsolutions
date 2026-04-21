'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { MoreHorizontal } from 'lucide-react'

// Mock pulse data
const generateData = (base, variance) => {
  return Array.from({ length: 12 }, (_, i) => ({
    name: i * 10,
    value: Math.floor(base + Math.random() * variance)
  }))
}

const TelemetryChart = ({ title, data, color, subtitle, valueColor }) => (
  <div className="space-y-2 mb-6 last:mb-0">
    <div className="flex items-center justify-between px-1">
      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{title}</h3>
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${valueColor}`} />
        <span className="text-[10px] font-bold text-foreground opacity-80">{subtitle}</span>
      </div>
    </div>
    <div className="h-[60px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
            contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid #1E293B', fontSize: '10px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={1.5}
            fillOpacity={1} 
            fill={`url(#gradient-${title})`} 
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
)

export const LiveTelemetrySidebar = () => {
  return (
    <Card className="h-full border-border/20 bg-card/20 backdrop-blur-xl rounded-[1.5rem] overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between py-5 px-6 shrink-0">
        <CardTitle className="text-sm font-bold tracking-tight">Live telemetry</CardTitle>
        <MoreHorizontal className="w-4 h-4 text-muted-foreground cursor-pointer opacity-50 hover:opacity-100" />
      </CardHeader>
      
      <CardContent className="px-6 py-2 overflow-y-auto space-y-8 scrollbar-hide">
        <TelemetryChart 
          title="Data Throughput" 
          subtitle="130 kbps"
          color="#22d3ee" 
          valueColor="bg-cyan-400"
          data={generateData(100, 50)} 
        />
        <TelemetryChart 
          title="Node Activity" 
          subtitle="Activity"
          color="#8b5cf6" 
          valueColor="bg-violet-500"
          data={generateData(120, 40)} 
        />
        <TelemetryChart 
          title="Latency" 
          subtitle="Latency"
          color="#14b8a6" 
          valueColor="bg-teal-500"
          data={generateData(40, 30)} 
        />
        <TelemetryChart 
          title="Processing Load" 
          subtitle="Strocs"
          color="#d946ef" 
          valueColor="bg-fuchsia-500"
          data={generateData(80, 60)} 
        />
        <TelemetryChart 
          title="Communication Status" 
          subtitle="Menric"
          color="#06b6d4" 
          valueColor="bg-sky-500"
          data={generateData(140, 30)} 
        />
        <TelemetryChart 
          title="Swarm Health" 
          subtitle="Health"
          color="#2dd4bf" 
          valueColor="bg-emerald-400"
          data={generateData(95, 20)} 
        />
      </CardContent>
    </Card>
  )
}
