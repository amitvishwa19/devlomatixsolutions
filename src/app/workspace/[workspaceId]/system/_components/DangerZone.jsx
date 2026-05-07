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
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="bg-rose-500/5 border-rose-500/20 backdrop-blur-xl hover:border-rose-500/40 transition-colors">
                    <CardHeader className="pb-4 border-b border-rose-500/10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 shrink-0">
                                <AlertTriangle className="w-6 h-6 text-rose-500" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold text-rose-500">Danger Zone</CardTitle>
                                <CardDescription className="text-sm text-rose-500/60">
                                    Irreversible and destructive actions.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <motion.div
                            className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                            whileHover={{ x: 4 }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                    <Power className="w-5 h-5 text-amber-500" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-sm font-semibold text-white">Maintenance Mode</Label>
                                    <p className="text-xs text-zinc-500">Restrict all workspace access immediately.</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`rounded-xl text-sm font-semibold h-10 px-6 border ${
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
                        </motion.div>

                        <motion.div
                            className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                            whileHover={{ x: 4 }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                    <RotateCcw className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-sm font-semibold text-white">Reset Configuration</Label>
                                    <p className="text-xs text-zinc-500">Restore all system settings to defaults.</p>
                                </div>
                            </div>
                            <Button variant="ghost" className="rounded-xl text-sm font-semibold h-10 px-6 border border-white/10 text-blue-500 hover:bg-blue-500/10">
                                RESET
                            </Button>
                        </motion.div>

                        <motion.div
                            className="flex items-center justify-between gap-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20"
                            whileHover={{ x: 4 }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-rose-500/20 rounded-lg border border-rose-500/30">
                                    <Trash2 className="w-5 h-5 text-rose-500" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-sm font-semibold text-rose-500">Delete Workspace</Label>
                                    <p className="text-xs text-rose-500/70 italic">This action is permanent and irreversible.</p>
                                </div>
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="rounded-xl text-sm font-semibold px-6 bg-rose-600 hover:bg-rose-700 h-10 shadow-lg shadow-rose-500/20"
                                onClick={handleDeleteWorkspace}
                            >
                                DELETE
                            </Button>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-6 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center text-center"
            >
                <p className="text-sm font-semibold text-zinc-600 uppercase tracking-widest">
                    Infrastructure Node: {settings?.general?.inviteCode || "DV-PRO-8291"}
                </p>
            </motion.div>
        </div>
    );
};
