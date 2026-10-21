'use client';

import React from 'react';
import { Mail, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function MailboxEmptyState({ onOpenCompose }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 mb-4 shadow-inner">
                <Mail className="w-8 h-8 stroke-1" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Select an email conversation</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                Choose a thread from the list on the left to read messages, manage linked deals, or reply directly.
            </p>
            <Button
                onClick={onOpenCompose}
                variant="outline"
                className="mt-4 gap-2 text-xs rounded-xl shadow-xs"
            >
                <Plus className="w-3.5 h-3.5" />
                Compose New Email
            </Button>
        </div>
    );
}
