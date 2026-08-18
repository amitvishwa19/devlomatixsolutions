'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function WorkspaceLoading() {
    return (
        <div className="p-4 md:p-6 space-y-5 animate-pulse max-w-7xl">
            {/* Hero Skeleton */}
            <div className="p-6 rounded-xl border border-border/50 bg-card space-y-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-28 bg-secondary/60 rounded-md" />
                    <Skeleton className="h-4 w-20 bg-secondary/40 rounded-md" />
                </div>
                <Skeleton className="h-7 w-64 bg-secondary/70 rounded-md" />
                <Skeleton className="h-4 w-full max-w-xl bg-secondary/40 rounded-md" />
                <div className="flex gap-2 pt-2">
                    <Skeleton className="h-8 w-28 bg-secondary/60 rounded-lg" />
                    <Skeleton className="h-8 w-32 bg-secondary/60 rounded-lg" />
                    <Skeleton className="h-8 w-32 bg-secondary/60 rounded-lg" />
                </div>
            </div>

            {/* Modules Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="bg-card border-border/50 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <Skeleton className="w-8 h-8 rounded-lg bg-secondary/60" />
                            <Skeleton className="h-4 w-16 bg-secondary/40 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-36 bg-secondary/60 rounded-md" />
                        <Skeleton className="h-3 w-full bg-secondary/40 rounded-md" />
                        <Skeleton className="h-3 w-4/5 bg-secondary/40 rounded-md" />
                        <div className="pt-3 border-t border-border/40 flex justify-between">
                            <Skeleton className="h-3 w-16 bg-secondary/50 rounded-md" />
                            <Skeleton className="h-3 w-16 bg-secondary/50 rounded-md" />
                        </div>
                    </Card>
                ))}
            </div>

            {/* Bottom Row Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                <Card className="lg:col-span-2 bg-card border-border/50 p-4 space-y-3">
                    <Skeleton className="h-4 w-32 bg-secondary/60 rounded-md" />
                    <div className="space-y-2">
                        {[1, 2, 3, 4].map((j) => (
                            <Skeleton key={j} className="h-10 w-full bg-secondary/40 rounded-lg" />
                        ))}
                    </div>
                </Card>
                <Card className="bg-card border-border/50 p-4 space-y-3">
                    <Skeleton className="h-4 w-28 bg-secondary/60 rounded-md" />
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((k) => (
                            <Skeleton key={k} className="h-8 w-full bg-secondary/40 rounded-lg" />
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
