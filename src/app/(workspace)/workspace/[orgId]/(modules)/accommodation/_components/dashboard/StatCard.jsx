import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';



const variantStyles = {
    default: 'bg-card border-border',
    primary: 'bg-primary/10 border-primary/20',
    success: 'bg-status-available/10 border-status-available/20',
    warning: 'bg-status-maintenance/10 border-status-maintenance/20',
    danger: 'bg-status-occupied/10 border-status-occupied/20',
};

const iconStyles = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/20 text-primary',
    success: 'bg-status-available/20 text-status-available',
    warning: 'bg-status-maintenance/20 text-status-maintenance',
    danger: 'bg-status-occupied/20 text-status-occupied',
};

export const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    variant = 'default',
    subtitle
}) => {
    return (
        <div className={cn(
            "relative overflow-hidden rounded-lg border p-4 shadow-card transition-all duration-300 hover:shadow-lg animate-fade-in",
            variantStyles[variant]
        )}>
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground">{subtitle}</p>
                    )}
                    {trend && (
                        <div className={cn(
                            "inline-flex items-center gap-1 text-xs font-medium",
                            trend.positive ? "text-status-available" : "text-status-occupied"
                        )}>
                            <span>{trend.positive ? '↑' : '↓'}</span>
                            <span>{trend.value}% from yesterday</span>
                        </div>
                    )}
                </div>
                <div className={cn(
                    "p-3 rounded-xl",
                    iconStyles[variant]
                )}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>

            {/* Decorative element */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10"
                style={{ background: 'var(--gradient-primary)' }} />
        </div>
    );
};
