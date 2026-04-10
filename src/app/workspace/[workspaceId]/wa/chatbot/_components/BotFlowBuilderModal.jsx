'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ReactFlowProvider } from '@xyflow/react';
import { FlowCanvas } from '../../bot-flow-builder/_components/FlowCanvas';
import { X, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BotFlowBuilderModal = ({ isOpen, onClose, flowId }) => {
    if (!flowId) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] min-w-[95vw] w-full min-h-[90vh] h-[90vh] p-0 gap-0 bg-[#0f0f1a] border-white/10 overflow-hidden flex flex-col shadow-2xl">
                <DialogHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between space-y-0 bg-[#0f0f1a]/80 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Maximize2 size={18} />
                        </div>
                        <DialogTitle className="text-white font-bold text-lg">Interactive Workflow Builder</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="flex-1 relative overflow-hidden bg-background">
                    <ReactFlowProvider>
                        <FlowCanvas flowId={flowId} />
                    </ReactFlowProvider>
                </div>
            </DialogContent>
        </Dialog>
    );
};
