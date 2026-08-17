'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Check, Loader2, RotateCcw, Save } from 'lucide-react';

export function StickySaveBar({
    isDirty,
    saving,
    onSave,
    onReset,
    label = "Unsaved Changes"
}) {
    // Support Ctrl+S / Cmd+S shortcut to save
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (isDirty && !saving && onSave) {
                    onSave();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDirty, saving, onSave]);

    return (
        <AnimatePresence>
            {isDirty && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="sticky bottom-2 z-40 w-full p-2.5 px-4 rounded-xl bg-card border border-primary/40 shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-3 text-xs"
                >
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        <span>{label}</span>
                        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-secondary/80 border border-border/60 rounded text-muted-foreground">
                            Ctrl + S
                        </kbd>
                    </div>

                    <div className="flex items-center gap-2">
                        {onReset && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onReset}
                                disabled={saving}
                                className="h-7 text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground"
                            >
                                <RotateCcw className="w-3 h-3" />
                                <span>Discard</span>
                            </Button>
                        )}

                        <Button
                            size="sm"
                            onClick={onSave}
                            disabled={saving}
                            className="h-7 text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 shadow-md"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
