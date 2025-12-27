import { formatDistanceToNow } from 'date-fns';
import { Radio } from 'lucide-react';
import { cn } from '@/lib/utils';



export const LiveIndicator = ({ lastUpdate, className }) => {
    return (
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-available/10", className)}>
            <Radio className="h-3.5 w-3.5 text-status-available text-green-400 animate-pulse" />
            <span className="text-xs font-medium text-status-available">Live</span>
            <span className="text-xs text-muted-foreground">
                Updated {formatDistanceToNow(lastUpdate, { addSuffix: true })}
            </span>
        </div>
    );
};
