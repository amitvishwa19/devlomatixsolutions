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
        <div className="space-y-3">
            <Card className="bg-rose-500/5 border-rose-500/20">
                <CardHeader className="pb-3 px-3 border-b border-rose-500/10">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20 shrink-0">
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                        </div>
                        <div>
                            <CardTitle className="text-xs font-bold text-rose-500">Danger Zone</CardTitle>
                            <CardDescription className="text-[10px] text-rose-500/60">
                                Irreversible and destructive actions.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-3 px-3">
                    <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                <Power className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-xs font-semibold text-white">Maintenance Mode</Label>
                                <p className="text-[10px] text-zinc-500">Restrict all workspace access immediately.</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`rounded-lg text-xs font-semibold h-8 px-4 border ${
                                isMaintenanceMode
                                    ? 'bg-amber-500 text-white border-none'
                                    : 'text-amber-500 hover:bg-amber-500/10 border-amber-500/20'
                            }`}
                            onClick={() => {
                                setIsMaintenanceMode(!isMaintenanceMode);
                                toast.info(isMaintenanceMode ? "Maintenance mode disabled" : "Maintenance mode enabled");
                            }}
                        >
                            {isMaintenanceMode ? "DEACTIVATE" : "ACTIVATE"}
                        </Button>
                    </div>

                    <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-xs font-semibold text-white">Reset Configuration</Label>
                                <p className="text-[10px] text-zinc-500">Restore all system settings to defaults.</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="rounded-lg text-xs font-semibold h-8 px-4 border border-white/10 text-blue-500 hover:bg-blue-500/10">
                            RESET
                        </Button>
                    </div>

                    <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-rose-500/20 rounded-lg border border-rose-500/30">
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="text-xs font-semibold text-rose-500">Delete Workspace</Label>
                                <p className="text-[10px] text-rose-500/70 italic">This action is permanent and irreversible.</p>
                            </div>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-lg text-xs font-semibold px-4 bg-rose-600 hover:bg-rose-700 h-8 shadow-lg shadow-rose-500/20"
                            onClick={handleDeleteWorkspace}
                        >
                            DELETE
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="p-4 border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center text-center">
                <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest">
                    Infrastructure Node: {settings?.general?.inviteCode || "DV-PRO-8291"}
                </p>
            </div>
        </div>
    );
};
