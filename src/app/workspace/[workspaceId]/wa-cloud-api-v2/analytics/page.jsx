"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { LineChart } from 'lucide-react';

export default function AnalyticsPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;

    return (
        <div className="p-8 h-full flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
            <div className="bg-primary/10 p-6 rounded-full">
                <LineChart className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground text-center max-w-md">
                Welcome to the new Analytics module for KonnectX V-2. 
                This section is currently under development to provide you with powerful insights and data visualization.
            </p>
            <div className="flex gap-2 mt-4">
                <div className="h-1.5 w-8 bg-primary/20 rounded-full" />
                <div className="h-1.5 w-24 bg-primary rounded-full" />
                <div className="h-1.5 w-8 bg-primary/20 rounded-full" />
            </div>
        </div>
    );
}
