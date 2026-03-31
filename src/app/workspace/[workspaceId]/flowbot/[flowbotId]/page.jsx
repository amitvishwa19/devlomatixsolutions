'use client';

import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { NodeSidebar } from '../_components/NodeSidebar';
import { FlowCanvas } from '../_components/FlowCanvas';
import { Layers, Workflow } from 'lucide-react';
import '@xyflow/react/dist/style.css';

export default function DynamicFlowbotEditor() {
    return (
        <ReactFlowProvider>
            <div className="flex flex-col h-[calc(100vh-5rem)] w-full bg-card overflow-hidden relative">
                {/* Visual Header */}
                <header className="h-[52px] shrink-0 bg-background border-b border-border flex items-center px-6 justify-between z-30 shadow-sm relative">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/15 p-2 rounded-xl border border-primary/20 shadow-inner">
                            <Workflow size={16} className="text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xs font-black text-foreground leading-none tracking-tight uppercase">Flow Bot Canvas</h1>
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-widest">Builder</span>
                            </div>
                            <span className="text-[9px] font-bold text-muted-foreground opacity-60">Visual Orchestration & Node Logic</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Auto-Sync Enabled</span>
                            <span className="text-[9px] text-muted-foreground font-medium">Session ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                        </div>
                    </div>
                </header>

                {/* Split Screen Application Area */}
                <main className="flex-1 flex w-full h-full overflow-hidden relative isolate">
                    <NodeSidebar />
                    <FlowCanvas />
                </main>
            </div>
        </ReactFlowProvider>
    );
}
