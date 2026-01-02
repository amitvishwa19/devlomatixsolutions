import { cn } from '@/lib/utils';

const variantStyles = {
    default: 'bg-card',
    primary: 'bg-primary/5 border-primary/20',
    success: 'bg-success/5 border-success/20',
    warning: 'bg-warning/5 border-warning/20',
    destructive: 'bg-destructive/5 border-destructive/20',
};

const iconStyles = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
};

export function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    variant = 'default'
}) {
    return (
        <div className={cn(
            "stat-card animate-fade-in",
            variantStyles[variant]
        )}>
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold font-display tracking-tight">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                    )}
                </div>
                <div className={cn(
                    "p-3 rounded-xl",
                    iconStyles[variant]
                )}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}
