'use client';

import React, { Suspense } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { FlowCanvas } from './_components/FlowCanvas';
import { Loader2 } from 'lucide-react';

export default function BotFlowBuilderPage() {
    return (
        <div className="flex flex-col w-full h-[calc(100vh-64px)] bg-[#0f0f1a] overflow-hidden">
            <ReactFlowProvider>
                <Suspense fallback={
                    <div className="flex-1 flex items-center justify-center bg-[#0f0f1a]">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                }>
                    <FlowCanvas />
                </Suspense>
            </ReactFlowProvider>
        </div>
    );
}