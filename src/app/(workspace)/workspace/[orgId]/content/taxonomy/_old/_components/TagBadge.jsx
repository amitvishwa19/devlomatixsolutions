import { cn } from '@/lib/utils';



const colorClasses = {
    blue: 'bg-tag-blue/15 text-tag-blue border-tag-blue/30',
    green: 'bg-tag-green/15 text-tag-green border-tag-green/30',
    purple: 'bg-tag-purple/15 text-tag-purple border-tag-purple/30',
    orange: 'bg-tag-orange/15 text-tag-orange border-tag-orange/30',
    pink: 'bg-tag-pink/15 text-tag-pink border-tag-pink/30',
    cyan: 'bg-tag-cyan/15 text-tag-cyan border-tag-cyan/30',
    yellow: 'bg-tag-yellow/15 text-tag-yellow border-tag-yellow/30',
    red: 'bg-tag-red/15 text-tag-red border-tag-red/30',
};

export function TagBadge({ color, children, className }) {
    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border transition-all duration-200 hover:scale-105',
                colorClasses[color],
                className
            )}
        >
            {children}
        </span>
    );
}
