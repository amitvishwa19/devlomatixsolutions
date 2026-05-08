'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ReactFlowProvider } from '@xyflow/react';
import { FlowCanvas } from '../flow-builder/_components/FlowCanvas';
import { X, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BotFlowBuilderModal = ({ isOpen, onClose, flowId }) => {
    if (!flowId) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] min-w-[95vw] w-full min-h-[95vh] h-[95vh] p-0 gap-0  border overflow-hidden flex flex-col">
                <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0  backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Maximize2 size={18} />
                        </div>
                        <DialogTitle className=" font-semibold text-lg">Interactive Workflow Builder</DialogTitle>
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
