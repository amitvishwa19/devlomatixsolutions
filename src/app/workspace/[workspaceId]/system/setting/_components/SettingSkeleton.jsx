'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function SettingContentSkeleton() {
    return (
        <div className="space-y-3 animate-in fade-in duration-200">
            {/* Header Skeleton */}
            <div className="flex items-center gap-2.5 pb-1">
                <Skeleton className="w-8 h-8 rounded-lg bg-white/5 border border-white/10" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-44 bg-white/5 rounded-md" />
                    <Skeleton className="h-3 w-64 bg-white/5 rounded-md" />
                </div>
            </div>

            {/* Compact Cards Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <Card className="border border-border/50 bg-card">
                    <CardHeader className="space-y-1 p-3 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-6 h-6 rounded-md bg-white/5" />
                            <Skeleton className="h-4 w-32 bg-white/5 rounded-md" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2.5">
                        <div className="space-y-1">
                            <Skeleton className="h-2.5 w-20 bg-white/5 rounded-md" />
                            <Skeleton className="h-8 w-full rounded-md bg-white/5" />
                        </div>
                        <div className="space-y-1">
                            <Skeleton className="h-2.5 w-24 bg-white/5 rounded-md" />
                            <Skeleton className="h-14 w-full rounded-md bg-white/5" />
                        </div>
                        <Skeleton className="h-8 w-full rounded-md bg-white/5 mt-1" />
                    </CardContent>
                </Card>

                <Card className="border border-border/50 bg-card">
                    <CardHeader className="space-y-1 p-3 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-6 h-6 rounded-md bg-white/5" />
                            <Skeleton className="h-4 w-28 bg-white/5 rounded-md" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="p-1.5 px-2 rounded-md border border-white/5 bg-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="w-5 h-5 rounded-sm bg-white/10" />
                                        <Skeleton className="h-2.5 w-16 bg-white/10 rounded-md" />
                                    </div>
                                    <Skeleton className="w-6 h-3 rounded-full bg-white/10" />
                                </div>
                            ))}
                        </div>
                        <Skeleton className="h-8 w-full rounded-md bg-white/5 mt-1" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export function SettingPageSkeleton() {
    return (
        <div className="min-h-screen flex">
            {/* Left Sidebar Skeleton */}
            <aside className="w-64 border-r border-white/5 backdrop-blur-xl sticky top-0 h-screen overflow-y-auto p-3 space-y-3">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/5">
                    <Skeleton className="w-8 h-8 rounded-lg bg-white/5 border border-white/10" />
                    <div className="space-y-1">
                        <Skeleton className="h-3.5 w-28 bg-white/5 rounded-md" />
                        <Skeleton className="h-2.5 w-20 bg-white/5 rounded-md" />
                    </div>
                </div>

                <Skeleton className="h-8 w-full rounded-md bg-white/5" />

                <div className="space-y-1 pt-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div key={i} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/5">
                            <Skeleton className="w-4 h-4 rounded-md bg-white/10" />
                            <Skeleton className="h-3 w-24 rounded-md bg-white/10" />
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content Skeleton */}
            <main className="flex-1 p-4 md:p-5">
                <SettingContentSkeleton />
            </main>
        </div>
    );
}
