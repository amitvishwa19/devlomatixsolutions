'use client';

import React, { useState } from 'react';
import { useSettings } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
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
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                <Card className="bg-card border-rose-500/20 transition-colors shadow-xs">
                    <CardHeader className="p-3 pb-2 border-b border-rose-500/10">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-rose-500/10 rounded-md border border-rose-500/20 shrink-0">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xs font-bold text-rose-500">Danger Zone</CardTitle>
                                <CardDescription className="text-[10px] text-rose-500/70">
                                    Irreversible and destructive actions.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2 p-3 pt-2.5">
                        {/* Maintenance Mode */}
                        <div className="flex items-center justify-between gap-3 p-2.5 px-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-amber-500/10 rounded-md border border-amber-500/20 shrink-0">
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
                                className={`rounded-md text-xs font-bold h-7 px-3 border ${
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

                        {/* Reset Configuration */}
                        <div className="flex items-center justify-between gap-3 p-2.5 px-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-blue-500/10 rounded-md border border-blue-500/20 shrink-0">
                                    <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                                </div>
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-semibold text-white">Reset Configuration</Label>
                                    <p className="text-[10px] text-zinc-500">Restore all system settings to defaults.</p>
                                </div>
                            </div>
                            <Button variant="ghost" className="rounded-md text-xs font-bold h-7 px-3 border border-white/10 text-blue-500 hover:bg-blue-500/10">
                                RESET
                            </Button>
                        </div>

                        {/* Delete Workspace */}
                        <div className="flex items-center justify-between gap-3 p-2.5 px-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-rose-500/20 rounded-md border border-rose-500/30 shrink-0">
                                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                </div>
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-semibold text-rose-500">Delete Workspace</Label>
                                    <p className="text-[10px] text-rose-500/70 italic">This action is permanent and irreversible.</p>
                                </div>
                            </div>
                            <Button
                                onClick={handleDeleteWorkspace}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-7 px-3 rounded-md"
                            >
                                DELETE
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};
