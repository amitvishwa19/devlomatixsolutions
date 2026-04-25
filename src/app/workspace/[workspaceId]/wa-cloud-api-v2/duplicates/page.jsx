"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { Merge } from 'lucide-react';

export default function DuplicateMergePage() {
    const params = useParams();
    const workspaceId = params.workspaceId;

    return (
        <div className="p-8 h-full flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
            <div className="bg-primary/10 p-6 rounded-full">
                <Merge className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Duplicate Merge</h1>
            <p className="text-muted-foreground text-center max-w-md">
                Keep your database clean. Identify and merge duplicate contact entries automatically.
            </p>
            <div className="flex gap-2 mt-4">
                <div className="h-1.5 w-8 bg-primary/20 rounded-full" />
                <div className="h-1.5 w-24 bg-primary rounded-full" />
                <div className="h-1.5 w-8 bg-primary/20 rounded-full" />
            </div>
        </div>
    );
}
