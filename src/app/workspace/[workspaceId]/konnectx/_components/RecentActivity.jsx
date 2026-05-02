// @ts-nocheck
import { CheckCircle2, MessageSquare, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RecentActivity({ 
    activities = [], 
    loading = false,
    currentPage = 1, 
    hasMore = false, 
    onPageChange 
}) {
    return (
        <div className="border rounded-lg border-dashed border-border bg-card/50 overflow-hidden flex flex-col h-full">
            <div className="divide-y divide-[#1F2328] flex-1">
                {loading ? (
                    [1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center gap-4 px-6 py-4">
                            <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="h-4 w-[60%] bg-muted animate-pulse rounded" />
                                <div className="h-2 w-[30%] bg-muted animate-pulse rounded" />
                            </div>
                        </div>
                    ))
                ) : activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <MessageSquare className="w-8 h-8 text-muted-foreground/30 mb-2" />
                        <p className="text-xs text-muted-foreground">No recent activity</p>
                    </div>
                ) : (
                    activities.map((activity) => {
                        const Icon = activity.icon || (activity.type === 'success' ? CheckCircle2 : activity.type === 'message' ? MessageSquare : AlertCircle);
                        return (
                            <div key={activity.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#1A1D21] transition-colors group">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${activity.bg} group-hover:scale-110 transition-transform`}>
                                    <Icon className={`w-4 h-4 ${activity.color}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">{activity.title}</p>
                                    <p className="text-[10px] text-[#A0AEC0] mt-0.5">{activity.time}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination Controls */}
            {(currentPage > 1 || hasMore) && (
                <div className="p-4 border-t border-border/40 bg-white/5 backdrop-blur-sm flex items-center justify-between">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-8 px-3 text-[10px] gap-1.5 transition-all duration-300 ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-primary/10 hover:text-primary active:scale-95'}`}
                        onClick={() => currentPage > 1 && onPageChange(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Previous
                    </Button>

                    <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-primary/40 animate-pulse" />
                        <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            Page {currentPage}
                        </span>
                        <div className="h-1 w-1 rounded-full bg-primary/40 animate-pulse" />
                    </div>

                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-8 px-3 text-[10px] gap-1.5 transition-all duration-300 ${!hasMore ? 'opacity-30 cursor-not-allowed' : 'hover:bg-primary/10 hover:text-primary active:scale-95'}`}
                        onClick={() => hasMore && onPageChange(prev => prev + 1)}
                        disabled={!hasMore}
                    >
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                </div>
            )}
        </div>
    );
}