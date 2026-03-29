import React from 'react'

export default function AccessSkeleton() {
    return (
        <div className="flex flex-col gap-6 w-full animate-pulse-slow">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 rounded-3xl bg-muted/20 border border-border/10 relative overflow-hidden">
                         <div className="absolute inset-x-0 bottom-0 h-1 bg-muted/40" />
                    </div>
                ))}
            </div>

            {/* Table Area Skeleton */}
            <div className="rounded-3xl border border-border/10 bg-card/10 overflow-hidden flex-1 flex flex-col min-h-[400px]">
                {/* Search Bar Bar */}
                <div className="flex items-center justify-between p-4 border-b border-border/10 bg-muted/5">
                    <div className="relative w-64 h-10 rounded-xl bg-muted/20" />
                    <div className="flex gap-2">
                        <div className="w-24 h-9 rounded-xl bg-muted/20" />
                        <div className="w-32 h-9 rounded-xl bg-muted/20" />
                    </div>
                </div>

                {/* Table Body */}
                <div className="flex-1 p-4 space-y-4">
                    <div className="grid grid-cols-5 gap-4 border-b border-border/5 pb-2">
                         {[1,2,3,4,5].map(i => <div key={i} className="h-3 rounded-full bg-muted/20 w-3/4" />)}
                    </div>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="grid grid-cols-5 gap-4 items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-muted/20 shrink-0" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-3 rounded-full bg-muted/15 w-2/3" />
                                    <div className="h-2 rounded-full bg-muted/10 w-1/2" />
                                </div>
                            </div>
                            <div className="h-3 rounded-full bg-muted/15 w-1/2" />
                            <div className="h-3 rounded-full bg-muted/15 w-1/3" />
                            <div className="h-6 rounded-full bg-muted/10 w-2/3" />
                            <div className="flex justify-end pr-2">
                                <div className="w-8 h-8 rounded-full bg-muted/20" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
