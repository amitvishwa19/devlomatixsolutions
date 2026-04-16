'use client'
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, Globe } from 'lucide-react'

const generateNodes = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80, // % coordinates
    y: 10 + Math.random() * 80,
    size: 2 + Math.random() * 4,
    color: ['#22d3ee', '#8b5cf6', '#d946ef', '#ffffff'][Math.floor(Math.random() * 4)]
  }))
}

const generateLinks = (nodes, count) => {
  const links = []
  for (let i = 0; i < count; i++) {
    const source = nodes[Math.floor(Math.random() * nodes.length)]
    const target = nodes[Math.floor(Math.random() * nodes.length)]
    if (source.id !== target.id) {
       links.push({ source, target })
    }
  }
  return links
}

export const SwarmIntelligenceGraph = () => {
  const nodes = useMemo(() => generateNodes(60), [])
  const links = useMemo(() => generateLinks(nodes, 80), [nodes])

  return (
    <Card className="h-full border-border/20 bg-card/20 backdrop-blur-xl rounded-[1.5rem] overflow-hidden flex flex-col relative">
      <CardHeader className="flex flex-row items-center justify-between py-5 px-8 shrink-0 relative z-10">
        <CardTitle className="text-sm font-bold tracking-tight text-muted-foreground/80">Swarm Intelligence</CardTitle>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/40 border border-border/20 text-[10px] font-bold text-muted-foreground cursor-pointer">
                <div className="w-2 h-2 rounded-full border border-cyan-500/50 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-cyan-500" />
                </div>
                Nalcent <ChevronDown className="w-3 h-3 ml-1" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/40 border border-border/20 text-[10px] font-bold text-muted-foreground cursor-pointer">
                <Globe className="w-3 h-3 text-muted-foreground" />
                Agent <ChevronDown className="w-3 h-3 ml-1" />
            </div>
        </div>
      </CardHeader>

      <div className="flex-1 relative cursor-crosshair">
          {/* Ambient Background Gradient */}
          <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
          
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Links */}
            {links.map((link, i) => (
               <motion.line
                 key={`link-${i}`}
                 x1={link.source.x}
                 y1={link.source.y}
                 x2={link.target.x}
                 y2={link.target.y}
                 stroke={link.source.color}
                 strokeWidth="0.1"
                 initial={{ opacity: 0.05 }}
                 animate={{ opacity: [0.05, 0.15, 0.05] }}
                 transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, ease: "easeInOut" }}
               />
            ))}

            {/* Nodes */}
            {nodes.map((node) => (
              <g key={`node-${node.id}`}>
                {/* Glow */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size * 0.8}
                  fill={node.color}
                  filter="blur(1px)"
                  opacity="0.1"
                />
                {/* Core */}
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size / 6}
                  fill={node.color}
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
                />
              </g>
            ))}
          </svg>
      </div>
    </Card>
  )
}
