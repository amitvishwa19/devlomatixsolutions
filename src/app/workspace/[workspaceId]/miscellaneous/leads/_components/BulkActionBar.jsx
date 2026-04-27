'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Save, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function BulkActionBar({
    selectedLeadIds,
    leads,
    saving,
    onClear,
    onExport,
    onSave
}) {
    return (
        <AnimatePresence>
            {selectedLeadIds.length > 0 && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
                >
                    <div className="bg-card border border-border shadow-2xl px-6 py-3 rounded-xl flex items-center justify-between gap-6 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center bg-primary text-primary-foreground w-6 h-6 rounded text-[10px] font-bold">
                                {selectedLeadIds.length}
                            </div>
                            <span className="text-xs font-bold text-white">Leads Selected</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClear}
                                className="text-xs font-medium text-muted-foreground hover:text-white"
                            >
                                Clear
                            </Button>
                            <div className="w-px h-4 bg-border/50 mx-1" />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onExport}
                                className="text-xs font-bold gap-2 h-8"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Export
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => onSave({
                                    open: true,
                                    leads: leads.filter(l => selectedLeadIds.includes(l.id)),
                                    selectedLeadIds: selectedLeadIds
                                })}
                                disabled={saving}
                                className="bg-primary hover:bg-primary/90  text-xs font-semibold h-8 gap-2"
                            >
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                Save Selected
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
