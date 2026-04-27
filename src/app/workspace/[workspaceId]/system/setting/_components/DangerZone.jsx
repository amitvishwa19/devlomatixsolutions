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
            <Card className="rounded-md border border-rose-500/20 bg-transparent overflow-hidden hover:border-rose-500/40 transition-colors duration-300">
                <CardHeader className="p-4 border-b border-rose-500/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-500/5 rounded-md flex items-center justify-center border border-rose-500/10 shrink-0">
                            <AlertTriangle className="w-5 h-5 text-rose-500" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold text-rose-600">Danger Zone</CardTitle>
                            <CardDescription className="text-xs font-medium text-rose-500/60">
                                Irreversible and destructive actions.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                    <div className="flex items-center justify-between gap-4 p-4 rounded-md border border-border/50 bg-muted/5">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Power className="w-4 h-4 text-amber-500" />
                                <Label className="text-sm font-bold">Maintenance Mode</Label>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium opacity-70">Restrict all workspace access immediately.</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`rounded-md text-[10px] font-bold h-8 px-4 border border-border/50 ${isMaintenanceMode ? 'bg-amber-500 text-white border-none' : 'text-amber-600 hover:bg-amber-500/5'}`}
                            onClick={() => {
                                setIsMaintenanceMode(!isMaintenanceMode);
                                toast.info(isMaintenanceMode ? "Maintenance mode disabled" : "Maintenance mode enabled");
                            }}
                        >
                            {isMaintenanceMode ? "DEACTIVATE" : "ACTIVATE"}
                        </Button>
                    </div>

                    <div className="flex items-center justify-between gap-4 p-4 rounded-md border border-border/50 bg-muted/5">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <RotateCcw className="w-4 h-4 text-blue-500" />
                                <Label className="text-sm font-bold">Reset Configuration</Label>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium opacity-70">Restore all system settings to defaults.</p>
                        </div>
                        <Button variant="ghost" size="sm" className="rounded-md text-[10px] font-bold h-8 px-4 border border-border/50 text-blue-600 hover:bg-blue-500/5">
                            RESET
                        </Button>
                    </div>

                    <div className="flex items-center justify-between gap-4 p-4 rounded-md border border-rose-500/20 bg-rose-500/[0.02]">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Trash2 className="w-4 h-4 text-rose-500" />
                                <Label className="text-sm font-bold text-rose-600">Delete Workspace</Label>
                            </div>
                            <p className="text-xs text-rose-500/60 font-medium italic opacity-80">This action is permanent and irreversible.</p>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-md text-[10px] font-bold px-6 bg-rose-600 hover:bg-rose-700 h-8 shadow-lg shadow-rose-500/20"
                            onClick={handleDeleteWorkspace}
                        >
                            DELETE
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="p-4 border border-dashed border-border/30 rounded-md flex flex-col items-center text-center opacity-30">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    Infrastructure Node: {settings?.general?.inviteCode || "DV-PRO-8291"}
                </p>
            </div>
        </div>
    );
};