'use client';

import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const KanbanSkeleton = () => {
  return (
    <div className="flex gap-6 h-full min-w-max pt-4 pb-4">
      {[...Array(4)].map((_, colIdx) => (
        <div 
          key={colIdx} 
          className="shrink-0 w-80 h-full flex flex-col bg-card/20 backdrop-blur-md rounded-2xl border border-border/30 overflow-hidden p-4 space-y-4"
        >
          {/* Header Skeleton */}
          <div className="flex items-center justify-between pb-3 border-b border-border/20">
            <div className="flex items-center gap-3">
              <Skeleton className="w-7 h-7 rounded-lg bg-primary/10" />
              <Skeleton className="w-24 h-4 rounded-md" />
            </div>
            <Skeleton className="w-6 h-6 rounded-lg" />
          </div>

          {/* Cards Skeleton */}
          <div className="flex-1 space-y-3 overflow-hidden">
            {[...Array(colIdx === 0 ? 3 : colIdx === 1 ? 2 : 1)].map((_, cardIdx) => (
              <div 
                key={cardIdx} 
                className="p-4 rounded-xl bg-card/40 border border-border/20 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="w-16 h-3 rounded-full" />
                  <Skeleton className="w-4 h-4 rounded-md" />
                </div>
                <Skeleton className="w-full h-4 rounded-md" />
                <Skeleton className="w-3/4 h-3 rounded-md" />
                
                {/* Progress bar skeleton */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between">
                    <Skeleton className="w-20 h-2 rounded-full" />
                    <Skeleton className="w-6 h-2 rounded-full" />
                  </div>
                  <Skeleton className="w-full h-1.5 rounded-full" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/10">
                  <Skeleton className="w-14 h-4 rounded-md" />
                  <Skeleton className="w-6 h-6 rounded-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Footer Skeleton */}
          <Skeleton className="w-full h-10 rounded-xl" />
        </div>
      ))}
    </div>
  );
};
