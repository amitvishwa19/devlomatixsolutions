'use client';

import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Keyboard, Command, Sparkles } from 'lucide-react';

const SHORTCUT_GROUPS = [
    {
        title: 'Global Navigation',
        shortcuts: [
            { keys: ['⌘', 'K'], label: 'Open Command Palette & Spotlight Search' },
            { keys: ['⌘', 'B'], label: 'Toggle Sidebar Collapse / Expand' },
            { keys: ['?'], label: 'Show Keyboard Shortcuts Reference' },
            { keys: ['Esc'], label: 'Close Active Modal / Command Menu' },
        ]
    },
    {
        title: 'Settings & Forms',
        shortcuts: [
            { keys: ['⌘', 'S'], label: 'Save Active Form Changes (Sticky Save)' },
            { keys: ['Tab'], label: 'Jump to Next Form Input' },
            { keys: ['⇧', 'Tab'], label: 'Jump to Previous Form Input' },
            { keys: ['↵'], label: 'Submit Search or Trigger Primary Action' },
        ]
    },
    {
        title: 'FlowGenix AI Studio',
        shortcuts: [
            { keys: ['↵'], label: 'Send AI Chat Message' },
            { keys: ['⇧', '↵'], label: 'New Line in Chat Input' },
        ]
    }
];

export function KeyboardShortcutsModal({ open, setOpen }) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md p-0 overflow-hidden bg-card border border-border/50 shadow-2xl rounded-xl">
                <DialogHeader className="p-4 pb-3 border-b border-border/40 bg-secondary/15 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                            <Keyboard className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-xs font-bold text-foreground">
                                Keyboard Shortcuts
                            </DialogTitle>
                            <DialogDescription className="text-[10px] text-muted-foreground">
                                Pro keyboard workflow cheatsheet
                            </DialogDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-mono border-primary/30 text-primary bg-primary/10">
                        PRESS ? TO TOGGLE
                    </Badge>
                </DialogHeader>

                <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    {SHORTCUT_GROUPS.map((group, gIdx) => (
                        <div key={gIdx} className="space-y-1.5">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                                {group.title}
                            </h4>
                            <div className="space-y-1">
                                {group.shortcuts.map((sc, sIdx) => (
                                    <div
                                        key={sIdx}
                                        className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 border border-border/40 text-xs"
                                    >
                                        <span className="text-foreground text-[11px] font-medium">{sc.label}</span>
                                        <div className="flex items-center gap-1 shrink-0 ml-2">
                                            {sc.keys.map((k, kIdx) => (
                                                <kbd
                                                    key={kIdx}
                                                    className="px-1.5 py-0.5 rounded bg-background border border-border/60 font-mono text-[10px] font-bold text-foreground shadow-2xs min-w-[20px] text-center"
                                                >
                                                    {k}
                                                </kbd>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function useKeyboardShortcuts() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore if typing in input/textarea
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
                return;
            }

            if (e.key === '?' || (e.key === '/' && (e.metaKey || e.ctrlKey))) {
                e.preventDefault();
                setOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return { open, setOpen, Component: () => <KeyboardShortcutsModal open={open} setOpen={setOpen} /> };
}
