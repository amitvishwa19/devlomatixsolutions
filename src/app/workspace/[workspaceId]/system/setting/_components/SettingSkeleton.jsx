'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function SettingContentSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Skeleton */}
            <div className="flex items-center gap-3 mb-6">
                <Skeleton className="w-12 h-12 rounded-xl bg-white/5 border border-white/10" />
                <div className="space-y-2">
                    <Skeleton className="h-7 w-56 bg-white/5 rounded-md" />
                    <Skeleton className="h-4 w-80 bg-white/5 rounded-md" />
                </div>
            </div>

            {/* Card 1 Skeleton */}
            <Card className="border border-white/5 bg-card/40 backdrop-blur-xl">
                <CardHeader className="space-y-2 p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-44 bg-white/5 rounded-md" />
                            <Skeleton className="h-3.5 w-72 bg-white/5 rounded-md" />
                        </div>
                        <Skeleton className="h-8 w-24 rounded-lg bg-white/5" />
                    </div>
                </CardHeader>
                <CardContent className="p-6 pt-2 space-y-5">
                    <div className="space-y-2">
                        <Skeleton className="h-3.5 w-28 bg-white/5 rounded-md" />
                        <Skeleton className="h-10 w-full rounded-lg bg-white/5" />
                    </div>

                    <div className="space-y-2">
                        <Skeleton className="h-3.5 w-36 bg-white/5 rounded-md" />
                        <Skeleton className="h-24 w-full rounded-lg bg-white/5" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                            <Skeleton className="h-3.5 w-32 bg-white/5 rounded-md" />
                            <Skeleton className="h-10 w-full rounded-lg bg-white/5" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-3.5 w-32 bg-white/5 rounded-md" />
                            <Skeleton className="h-10 w-full rounded-lg bg-white/5" />
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <Skeleton className="h-9 w-32 rounded-lg bg-white/5" />
                    </div>
                </CardContent>
            </Card>

            {/* Card 2 Skeleton */}
            <Card className="border border-white/5 bg-card/40 backdrop-blur-xl">
                <CardHeader className="space-y-2 p-6 pb-4">
                    <Skeleton className="h-5 w-36 bg-white/5 rounded-md" />
                    <Skeleton className="h-3.5 w-64 bg-white/5 rounded-md" />
                </CardHeader>
                <CardContent className="p-6 pt-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="p-3.5 rounded-xl border border-white/5 bg-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <Skeleton className="w-7 h-7 rounded-lg bg-white/10" />
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-3 w-16 bg-white/10 rounded-md" />
                                        <Skeleton className="h-2.5 w-24 bg-white/10 rounded-md" />
                                    </div>
                                </div>
                                <Skeleton className="w-8 h-4 rounded-full bg-white/10" />
                            </div>
                        ))}
                    </div>

                    <div className="pt-3 flex justify-end">
                        <Skeleton className="h-9 w-32 rounded-lg bg-white/5" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function SettingPageSkeleton() {
    return (
        <div className="min-h-screen flex">
            {/* Left Sidebar Skeleton */}
            <aside className="w-72 border-r border-white/5 backdrop-blur-xl sticky top-0 h-screen overflow-y-auto p-4 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                    <Skeleton className="w-10 h-10 rounded-xl bg-white/5 border border-white/10" />
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32 bg-white/5 rounded-md" />
                        <Skeleton className="h-3 w-24 bg-white/5 rounded-md" />
                    </div>
                </div>

                <Skeleton className="h-9 w-full rounded-lg bg-white/5" />

                <div className="space-y-1.5 pt-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5">
                            <Skeleton className="w-5 h-5 rounded-md bg-white/10" />
                            <Skeleton className="h-4 w-28 rounded-md bg-white/10" />
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content Skeleton */}
            <main className="flex-1 p-8">
                <SettingContentSkeleton />
            </main>
        </div>
    );
}
