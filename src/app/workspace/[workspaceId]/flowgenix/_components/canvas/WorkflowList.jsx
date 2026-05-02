'use client'

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
    Plus, 
    Workflow as WorkflowIcon, 
    Clock, 
    Play, 
    MoreVertical, 
    Trash2, 
    Pencil,
    Activity
} from "lucide-react";
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function WorkflowList({ workflows, onEdit, onCreate, onDelete, onExecute }) {
    if (workflows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 border-2 border-dashed border-border rounded-2xl bg-card/20">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <WorkflowIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold font-mono uppercase tracking-tight">No workflows yet</h3>
                <p className="text-sm text-muted-foreground font-mono mt-2 max-w-xs">
                    Create your first automation to start streamlining your business processes.
                </p>
                <Button onClick={onCreate} className="mt-6 font-mono text-xs h-9 px-6 gap-2">
                    <Plus className="h-4 w-4" /> Create Workflow
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-primary flex items-center gap-2">
                        <Activity className="h-4 w-4" /> Automations
                    </h2>
                    <p className="text-[10px] text-muted-foreground uppercase font-mono mt-1">Manage and monitor your business workflows</p>
                </div>
                <Button onClick={onCreate} size="sm" className="font-mono text-xs h-8 px-4 gap-2">
                    <Plus className="h-3.5 w-3.5" /> New Workflow
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workflows.map((wf) => (
                    <Card key={wf.id} className="group relative border border-border bg-card/30 hover:bg-card/50 transition-all duration-300 overflow-hidden rounded-xl">
                        <div className="p-5 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <WorkflowIcon className="h-5 w-5" />
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="font-mono text-xs">
                                        <DropdownMenuItem onClick={() => onEdit(wf)} className="gap-2">
                                            <Pencil className="h-3.5 w-3.5" /> Edit Canvas
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onDelete(wf.id)} className="gap-2 text-destructive">
                                            <Trash2 className="h-3.5 w-3.5" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div>
                                <h3 className="font-bold font-mono text-sm group-hover:text-primary transition-colors line-clamp-1">
                                    {wf.name || "Untitled Workflow"}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant={wf.scheduleEnabled ? "default" : "secondary"} className="text-[9px] font-mono uppercase px-1.5 py-0 h-4">
                                        {wf.scheduleEnabled ? "Active" : "Paused"}
                                    </Badge>
                                    {wf.scheduleEnabled && (
                                        <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {wf.scheduleCron}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground font-mono italic">
                                    Last run: {wf.executions?.[0] ? new Date(wf.executions[0].createdAt).toLocaleDateString() : "Never"}
                                </span>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-7 text-[10px] font-mono px-3 hover:bg-primary/10 hover:text-primary transition-colors"
                                        onClick={() => onExecute(wf.id)}
                                    >
                                        <Play className="h-3 w-3 mr-1" /> Run
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        className="h-7 text-[10px] font-mono px-3"
                                        onClick={() => onEdit(wf)}
                                    >
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
