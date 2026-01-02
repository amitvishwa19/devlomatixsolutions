import { cn } from '@/lib/utils';
import { Building2, Bed } from 'lucide-react';


export function WorkflowTypeBadge({ type, className }) {
    const isOPD = type === 'OPD';

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold',
                isOPD
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-pending/10 text-pending border border-pending/20',
                className
            )}
        >
            {isOPD ? <Building2 className="w-3.5 h-3.5" /> : <Bed className="w-3.5 h-3.5" />}
            {type}
        </span>
    );
}
