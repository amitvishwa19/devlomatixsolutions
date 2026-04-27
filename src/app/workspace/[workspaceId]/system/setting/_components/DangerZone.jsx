'use client';

import React, { useState } from 'react';
import { useSettings } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2, AlertTriangle, Power, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export const DangerZone = () => {
    const { settings } = useSettings();
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

    const handleDeleteWorkspace = () => {
        toast.error("Deletion restricted. Contact super-administration.");
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <Card className="rounded-md border border-rose-500/20 bg-transparent overflow-hidden">
                <CardHeader className="p-3 border-b border-rose-500/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-rose-500/5 rounded-md flex items-center justify-center border border-rose-500/10">
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold text-rose-600">Danger Zone</CardTitle>
                            <CardDescription className="text-[10px] font-medium text-rose-500/60">
                                Irreversible and destructive actions.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2 p-3">
                    <div className="flex items-center justify-between gap-4 p-2.5 rounded-md border border-border/50 bg-muted/5">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <Power className="w-3.5 h-3.5 text-amber-500" />
                                <Label className="text-xs font-bold">Maintenance Mode</Label>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium opacity-60">Restrict workspace access.</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`rounded-md text-[9px] font-bold h-7 px-3 border border-border/50 ${isMaintenanceMode ? 'bg-amber-500 text-white border-none' : 'text-amber-600 hover:bg-amber-500/5'}`}
                            onClick={() => {
                                setIsMaintenanceMode(!isMaintenanceMode);
                                toast.info(isMaintenanceMode ? "Maintenance mode disabled" : "Maintenance mode enabled");
                            }}
                        >
                            {isMaintenanceMode ? "DEACTIVATE" : "ACTIVATE"}
                        </Button>
                    </div>

                    <div className="flex items-center justify-between gap-4 p-2.5 rounded-md border border-border/50 bg-muted/5">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                                <Label className="text-xs font-bold">Reset Configuration</Label>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium opacity-60">Restore system defaults.</p>
                        </div>
                        <Button variant="ghost" size="sm" className="rounded-md text-[9px] font-bold h-7 px-3 border border-border/50 text-blue-600 hover:bg-blue-500/5">
                            RESET
                        </Button>
                    </div>

                    <div className="flex items-center justify-between gap-4 p-2.5 rounded-md border border-rose-500/20 bg-rose-500/[0.02]">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <Label className="text-xs font-bold text-rose-600">Delete Workspace</Label>
                            </div>
                            <p className="text-[10px] text-rose-500/60 font-medium italic opacity-80">This action is permanent.</p>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-md text-[9px] font-bold px-4 bg-rose-600 hover:bg-rose-700 h-7"
                            onClick={handleDeleteWorkspace}
                        >
                            DELETE
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="p-2 border border-border/30 rounded-md flex flex-col items-center text-center opacity-40">
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                    Infrastructure Node: {settings?.general?.inviteCode || "..."}
                </p>
            </div>
        </div>
    );
};