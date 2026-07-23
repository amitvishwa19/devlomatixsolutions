'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import WorkflowCanvas from "./WorkflowCanvas";

export function WorkflowModal({ open, onOpenChange, workflow, userId }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] min-w-[95vw] min-h-[95vh] p-0 gap-0 overflow-hidden bg-background border">
                <DialogHeader className="hidden">
                    <DialogTitle>{workflow?.name}</DialogTitle>
                </DialogHeader>
                {workflow && (
                    <WorkflowCanvas
                        workflowId={workflow.id}
                        workflowName={workflow.name}
                        loadedNodes={workflow.nodes}
                        loadedEdges={workflow.edges}
                        initialCron={workflow.scheduleCron}
                        initialScheduleEnabled={workflow.scheduleEnabled}
                        initialViewport={workflow.viewport}
                        userId={userId}
                        onClose={() => onOpenChange(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
