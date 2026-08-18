'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Inbox, Plus } from 'lucide-react';

export function EmptyState({
    icon: Icon = Inbox,
    title = "No records found",
    description = "Get started by creating your first item.",
    actionLabel,
    onAction,
    actionIcon: ActionIcon = Plus,
    className = ""
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`p-8 md:p-12 rounded-xl border border-dashed border-border/60 bg-card/40 flex flex-col items-center justify-center text-center space-y-3 max-w-md mx-auto ${className}`}
        >
            <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/50 text-muted-foreground shadow-xs">
                <Icon className="w-8 h-8" />
            </div>

            <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">{description}</p>
            </div>

            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    size="sm"
                    className="h-8 text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 shadow-xs cursor-pointer mt-1"
                >
                    <ActionIcon className="w-3.5 h-3.5" />
                    <span>{actionLabel}</span>
                </Button>
            )}
        </motion.div>
    );
}
