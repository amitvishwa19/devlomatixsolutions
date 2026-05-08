'use client';

import React, { Suspense } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { FlowCanvas } from './_components/FlowCanvas';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function BotFlowBuilderContent() {
    const searchParams = useSearchParams();
    const flowId = searchParams.get('flowId');

    return (
        <div className="flex flex-col w-full h-[calc(100vh-64px)] bg-background overflow-hidden">
            <ReactFlowProvider>
                <Suspense fallback={
                    <div className="flex-1 flex items-center justify-center bg-background">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                }>
                    <FlowCanvas flowId={flowId} standalone />
                </Suspense>
            </ReactFlowProvider>
        </div>
    );
}

export default function BotFlowBuilderPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        }>
            <BotFlowBuilderContent />
        </Suspense>
    );
}