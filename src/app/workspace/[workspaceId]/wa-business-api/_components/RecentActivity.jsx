import { CheckCircle2, MessageSquare, AlertCircle, ChevronLeft, ChevronRight, Zap, Users, ShieldCheck, Mail, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export default function RecentActivity({ 
    activities = [], 
    currentPage = 1, 
    hasMore = false, 
    onPageChange 
}) {
    const getActivityConfig = (type) => {
        switch (type) {
            case 'ENGINE_CONNECT':
                return { icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
            case 'ENGINE_DISCONNECT':
                return { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10' };
            case 'CONTACT_IMPORT':
                return { icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' };
            case 'MESSAGE_IN':
                return { icon: ArrowDownLeft, color: 'text-amber-400', bg: 'bg-amber-400/10' };
            case 'MESSAGE_OUT':
                return { icon: ArrowUpRight, color: 'text-primary', bg: 'bg-primary/10' };
            case 'info':
                return { icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
            default:
                return { icon: MessageSquare, color: 'text-zinc-400', bg: 'bg-zinc-400/10' };
        }
    };

    return (
        <div className="border rounded-lg border-dashed border-border bg-card/50 overflow-hidden flex flex-col h-full">
            <div className="divide-y divide-border/20 flex-1">
                {activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <MessageSquare className="w-8 h-8 text-muted-foreground/30 mb-2" />
                        <p className="text-xs text-muted-foreground">No recent activity found</p>
                    </div>
                ) : (
                    activities.map((activity) => {
                        const { icon: Icon, color, bg } = getActivityConfig(activity.type);
                        return (
                            <div key={activity.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${bg} group-hover:scale-110 transition-transform`}>
                                    <Icon className={`w-4 h-4 ${color}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[13px] font-medium text-foreground/90 truncate group-hover:text-primary transition-colors">
                                        {activity.message}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                        {formatDistanceToNow(new Date(activity.createdAt))} ago
                                    </p>
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
